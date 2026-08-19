'use client';

import { useState, useMemo } from 'react';
import { formatRupiah } from '@/lib/utils';

export default function LoanCalculator() {
  const [clientName, setClientName] = useState<string>('');
  const [otr, setOtr] = useState<string>('');
  const [dpType, setDpType] = useState<'percentage' | 'nominal'>('percentage');
  const [dpValue, setDpValue] = useState<string>('');
  const [tenor, setTenor] = useState<string>('');

  const [result, setResult] = useState<{
    clientName: string;
    kontrakNo: string;
    otrValue: number;
    pokokUtang: number;
    bungaPersen: number;
    totalBunga: number;
    angsuranPerBulan: number;
    schedule: Array<{
      angsuranKe: number;
      tanggalJatuhTempo: string;
    }>;
  } | null>(null);

  const [checkDate, setCheckDate] = useState<string>('2024-08-14');
  
  // State untuk Fitur Denda
  const [lastPaidInstallment, setLastPaidInstallment] = useState<string>('5'); // Karena dibayar sampai angsuran bulan mei (angsuran ke-5)
  const [checkDateDenda, setCheckDateDenda] = useState<string>('2024-08-14');

  const calculateLoan = (e: React.FormEvent) => {
    e.preventDefault();

    const otrValue = Number(otr.replace(/[^0-9]/g, ''));
    let dpActualValue = 0;

    if (dpType === 'percentage') {
      const percentage = Number(dpValue);
      dpActualValue = otrValue * (percentage / 100);
    } else {
      dpActualValue = Number(dpValue.replace(/[^0-9]/g, ''));
    }

    const tenorValue = Number(tenor);

    if (otrValue <= 0 || dpActualValue < 0 || tenorValue <= 0) {
      alert('Mohon masukkan nilai yang valid');
      return;
    }

    const pokokUtang = otrValue - dpActualValue;

    let bungaPersen = 0;
    if (tenorValue <= 12) {
      bungaPersen = 12;
    } else if (tenorValue > 12 && tenorValue <= 24) {
      bungaPersen = 14;
    } else if (tenorValue > 24) {
      bungaPersen = 16.5;
    }

    const totalBunga = pokokUtang * (bungaPersen / 100);
    const totalUtang = pokokUtang + totalBunga;
    const angsuranPerBulan = totalUtang / tenorValue;

    const kontrakNo = 'AGR' + Math.floor(Math.random() * 100000).toString().padStart(5, '0');

    const schedule = [];
    let startYear = 2023; 
    let startMonth = 11; // Mulai dari Desember 2023 (jatuh tempo cicilan 1 = 25 Jan 2024)

    for (let i = 1; i <= tenorValue; i++) {
      const dueDate = new Date(startYear, startMonth + i, 25);
      const formattedDate = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}-${String(dueDate.getDate()).padStart(2, '0')}`;
      
      schedule.push({
        angsuranKe: i,
        tanggalJatuhTempo: formattedDate,
      });
    }

    setResult({
      clientName: clientName.trim() || 'SUGUS',
      kontrakNo,
      otrValue,
      pokokUtang,
      bungaPersen,
      totalBunga,
      angsuranPerBulan,
      schedule
    });
  };

  const handleCurrencyInput = (value: string, setter: (val: string) => void) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    if (numericValue) {
      setter(Number(numericValue).toLocaleString('id-ID'));
    } else {
      setter('');
    }
  };

  const totalJatuhTempo = useMemo(() => {
    if (!result || !checkDate) return 0;
    const pastDueSchedules = result.schedule.filter(s => new Date(s.tanggalJatuhTempo) <= new Date(checkDate));
    return pastDueSchedules.length * result.angsuranPerBulan;
  }, [result, checkDate]);

  const dendaSchedules = useMemo(() => {
    if (!result || !checkDateDenda) return [];
    
    const checkDateObj = new Date(checkDateDenda);
    const lastPaid = Number(lastPaidInstallment);
    
    return result.schedule
      .filter(s => s.angsuranKe > lastPaid) // Belum dibayar
      .filter(s => new Date(s.tanggalJatuhTempo) < checkDateObj) // Sudah lewat jatuh tempo
      .map(s => {
        const dueDateObj = new Date(s.tanggalJatuhTempo);
        const diffTime = checkDateObj.getTime() - dueDateObj.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // Denda 0.1% per hari dari angsuran per bulan
        const totalDenda = diffDays * 0.001 * result.angsuranPerBulan;
        
        return {
          ...s,
          hariKeterlambatan: diffDays,
          totalDenda: totalDenda
        };
      });
  }, [result, checkDateDenda, lastPaidInstallment]);

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-100 mb-20">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Simulasi Kredit Mobil</h2>
      
      <form onSubmit={calculateLoan} className="space-y-6 max-w-2xl mx-auto">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Nama Klien</label>
          <input
            type="text"
            required
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all placeholder:text-gray-500 text-gray-900"
            placeholder="Contoh: Sugus"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Harga Mobil (OTR)</label>
          <div className="relative">
            <span className="absolute left-4 top-3 text-gray-700">Rp</span>
            <input
              type="text"
              required
              value={otr}
              onChange={(e) => handleCurrencyInput(e.target.value, setOtr)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all placeholder:text-gray-500 text-gray-900"
              placeholder="Contoh: 240.000.000"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Tipe Uang Muka (DP)</label>
          <div className="flex gap-4">
            <label className="flex-1 flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="dpType"
                value="percentage"
                checked={dpType === 'percentage'}
                onChange={() => {
                  setDpType('percentage');
                  setDpValue('');
                }}
                className="w-4 h-4 text-blue-700 border-gray-400 focus:ring-blue-600"
              />
              <span className="ml-3 text-gray-900 font-medium">Persentase (%)</span>
            </label>
            <label className="flex-1 flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="dpType"
                value="nominal"
                checked={dpType === 'nominal'}
                onChange={() => {
                  setDpType('nominal');
                  setDpValue('');
                }}
                className="w-4 h-4 text-blue-700 border-gray-400 focus:ring-blue-600"
              />
              <span className="ml-3 text-gray-900 font-medium">Nominal (Rp)</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Nilai Uang Muka (DP) {dpType === 'percentage' ? '(%)' : '(Rp)'}
          </label>
          <div className="relative">
            {dpType === 'nominal' && (
              <span className="absolute left-4 top-3 text-gray-700">Rp</span>
            )}
            <input
              type={dpType === 'percentage' ? "number" : "text"}
              required
              step={dpType === 'percentage' ? "0.1" : undefined}
              min="0"
              max={dpType === 'percentage' ? "100" : undefined}
              value={dpValue}
              onChange={(e) => {
                if (dpType === 'nominal') {
                  handleCurrencyInput(e.target.value, setDpValue);
                } else {
                  setDpValue(e.target.value);
                }
              }}
              className={`w-full ${dpType === 'nominal' ? 'pl-12' : 'pl-4'} pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all placeholder:text-gray-500 text-gray-900`}
              placeholder={dpType === 'percentage' ? "Contoh: 20" : "Contoh: 48.000.000"}
            />
            {dpType === 'percentage' && (
              <span className="absolute right-4 top-3 text-gray-700">%</span>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Jangka Waktu / Tenor (Bulan)</label>
          <div className="relative">
            <input
              type="number"
              required
              min="1"
              value={tenor}
              onChange={(e) => setTenor(e.target.value)}
              className="w-full pl-4 pr-16 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all placeholder:text-gray-500 text-gray-900"
              placeholder="Contoh: 18"
            />
            <span className="absolute right-4 top-3 text-gray-700 font-medium">Bulan</span>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-700 text-white font-bold py-4 rounded-lg hover:bg-blue-800 transition-colors shadow-md hover:shadow-lg active:scale-[0.99]"
        >
          Hitung Simulasi
        </button>
      </form>

      {result && (
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Ringkasan Perhitungan</h3>
          <div className="grid gap-4 max-w-2xl mx-auto mb-10">
            <div className="bg-gray-100 p-4 rounded-lg flex justify-between items-center border border-gray-200">
              <span className="text-gray-800 font-medium">Pokok Utang</span>
              <span className="font-bold text-gray-900">{formatRupiah(result.pokokUtang)}</span>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg flex justify-between items-center border border-gray-200">
              <span className="text-gray-800 font-medium">Bunga ({result.bungaPersen}%)</span>
              <span className="font-bold text-gray-900">{formatRupiah(result.totalBunga)}</span>
            </div>
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 flex flex-col items-center gap-2">
              <span className="text-blue-800 font-bold text-sm uppercase tracking-wider">Angsuran Per Bulan</span>
              <span className="text-3xl font-extrabold text-blue-900">{formatRupiah(result.angsuranPerBulan)}</span>
            </div>
          </div>

          <div className="mb-10 overflow-x-auto">
            <h4 className="text-lg font-bold text-gray-900 mb-4 uppercase">Kontrak</h4>
            <table className="w-full text-left border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 p-3 text-sm font-bold text-gray-900 uppercase">Kontrak_No</th>
                  <th className="border border-gray-300 p-3 text-sm font-bold text-gray-900 uppercase">Client Name</th>
                  <th className="border border-gray-300 p-3 text-sm font-bold text-gray-900 uppercase">OTR</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-3 text-gray-800 font-medium">{result.kontrakNo}</td>
                  <td className="border border-gray-300 p-3 text-gray-800 uppercase font-medium">{result.clientName}</td>
                  <td className="border border-gray-300 p-3 text-gray-800 font-medium">{formatRupiah(result.otrValue).replace('Rp', '').trim()}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mb-10 overflow-x-auto">
            <h4 className="text-lg font-bold text-gray-900 mb-4 uppercase">Jadwal_Angsuran</h4>
            <table className="w-full text-left border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 p-3 text-sm font-bold text-gray-900 uppercase">Kontrak_No</th>
                  <th className="border border-gray-300 p-3 text-sm font-bold text-gray-900 uppercase text-center">Angsuran_Ke</th>
                  <th className="border border-gray-300 p-3 text-sm font-bold text-gray-900 uppercase text-right">Angsuran_Per_Bulan</th>
                  <th className="border border-gray-300 p-3 text-sm font-bold text-gray-900 uppercase text-center">Tanggal_Jatuh_Tempo</th>
                </tr>
              </thead>
              <tbody>
                {result.schedule.map((row) => (
                  <tr key={row.angsuranKe} className="hover:bg-gray-50 transition-colors">
                    <td className="border border-gray-300 p-3 text-gray-800 font-medium">{result.kontrakNo}</td>
                    <td className="border border-gray-300 p-3 text-gray-800 text-center">{row.angsuranKe}</td>
                    <td className="border border-gray-300 p-3 text-gray-800 text-right font-medium">
                      {formatRupiah(result.angsuranPerBulan).replace('Rp', '').trim()}
                    </td>
                    <td className="border border-gray-300 p-3 text-gray-800 text-center">{row.tanggalJatuhTempo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Fitur Pengecekan Jatuh Tempo */}
          <div className="mb-10 overflow-x-auto bg-red-50 p-6 rounded-xl border border-red-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
              <h4 className="text-lg font-bold text-red-900 uppercase">Cek Total Angsuran Jatuh Tempo</h4>
              <div className="flex items-center gap-3">
                <label className="text-sm font-bold text-red-800">Per Tanggal:</label>
                <input 
                  type="date" 
                  value={checkDate}
                  onChange={(e) => setCheckDate(e.target.value)}
                  className="px-3 py-2 border border-red-300 rounded-lg focus:ring-red-500 focus:border-red-500 text-gray-900 outline-none"
                />
              </div>
            </div>
            
            <table className="w-full text-left border-collapse border border-red-300 bg-white">
              <thead>
                <tr className="bg-red-100">
                  <th className="border border-red-300 p-3 text-sm font-bold text-red-900 uppercase">Kontrak No</th>
                  <th className="border border-red-300 p-3 text-sm font-bold text-red-900 uppercase">Client Name</th>
                  <th className="border border-red-300 p-3 text-sm font-bold text-red-900 uppercase">Total Angsuran Jatuh Tempo</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-red-300 p-3 text-gray-800 font-medium">{result.kontrakNo}</td>
                  <td className="border border-red-300 p-3 text-gray-800 uppercase font-medium">{result.clientName}</td>
                  <td className="border border-red-300 p-3 text-gray-900 font-bold text-lg">
                    {totalJatuhTempo > 0 ? formatRupiah(totalJatuhTempo).replace('Rp', '').trim() : '0'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Fitur Pengecekan Denda */}
          <div className="overflow-x-auto bg-orange-50 p-6 rounded-xl border border-orange-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
              <h4 className="text-lg font-bold text-orange-900 uppercase">Cek Denda Keterlambatan (0.1% / Hari)</h4>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <label className="text-sm font-bold text-orange-800">Terakhir Bayar (Angsuran Ke):</label>
                  <input 
                    type="number" 
                    min="0"
                    max={result.schedule.length}
                    value={lastPaidInstallment}
                    onChange={(e) => setLastPaidInstallment(e.target.value)}
                    className="w-20 px-3 py-2 border border-orange-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 text-gray-900 outline-none"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-sm font-bold text-orange-800">Per Tanggal:</label>
                  <input 
                    type="date" 
                    value={checkDateDenda}
                    onChange={(e) => setCheckDateDenda(e.target.value)}
                    className="px-3 py-2 border border-orange-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 text-gray-900 outline-none"
                  />
                </div>
              </div>
            </div>
            
            <table className="w-full text-left border-collapse border border-orange-300 bg-white">
              <thead>
                <tr className="bg-orange-100">
                  <th className="border border-orange-300 p-3 text-sm font-bold text-orange-900 uppercase">Kontrak No</th>
                  <th className="border border-orange-300 p-3 text-sm font-bold text-orange-900 uppercase">Client Name</th>
                  <th className="border border-orange-300 p-3 text-sm font-bold text-orange-900 uppercase text-center">Installment No</th>
                  <th className="border border-orange-300 p-3 text-sm font-bold text-orange-900 uppercase text-center">Hari Keterlambatan</th>
                  <th className="border border-orange-300 p-3 text-sm font-bold text-orange-900 uppercase text-right">Total Denda</th>
                </tr>
              </thead>
              <tbody>
                {dendaSchedules.length > 0 ? (
                  dendaSchedules.map((s) => (
                    <tr key={s.angsuranKe} className="hover:bg-orange-50 transition-colors">
                      <td className="border border-orange-300 p-3 text-gray-800 font-medium">{result.kontrakNo}</td>
                      <td className="border border-orange-300 p-3 text-gray-800 uppercase font-medium">{result.clientName}</td>
                      <td className="border border-orange-300 p-3 text-gray-800 text-center font-bold">{s.angsuranKe}</td>
                      <td className="border border-orange-300 p-3 text-orange-700 text-center font-bold">{s.hariKeterlambatan} Hari</td>
                      <td className="border border-orange-300 p-3 text-gray-900 text-right font-bold text-lg">
                        {formatRupiah(s.totalDenda).replace('Rp', '').trim()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="border border-orange-300 p-4 text-center text-gray-600 italic">
                      Tidak ada denda keterlambatan pada periode ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}
    </div>
  );
}
