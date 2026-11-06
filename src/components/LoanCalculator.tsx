'use client';

import { formatRupiah } from '@/lib/utils';
import { useEffect, useMemo, useState } from 'react';

const getTodayDate = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const dpOptions: Array<{
  type: 'percentage' | 'nominal';
  label: string
}> = [
    { type: 'percentage', label: 'Persentase (%)' },
    { type: 'nominal', label: 'Nominal (Rp)' }
  ];

export default function LoanCalculator() {
  const [clientName, setClientName] = useState<string>('');
  const [otr, setOtr] = useState<string>('');
  const [dpType, setDpType] = useState<'percentage' | 'nominal'>('percentage');
  const [dpValue, setDpValue] = useState<string>('');
  const [tenor, setTenor] = useState<string>('');
  const [startDate, setStartDate] = useState<string>(getTodayDate);

  const [result, setResult] = useState<{
    clientName: string;
    kontrakNo: string;
    startDate: string;
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

  const [checkDate, setCheckDate] = useState<string>(getTodayDate);
  const [lastPaidInstallment, setLastPaidInstallment] = useState<string>('5');
  const [checkDateDenda, setCheckDateDenda] = useState<string>(getTodayDate);

  useEffect(() => {
    const today = getTodayDate();
    setStartDate(today);
    setCheckDate(today);
    setCheckDateDenda(today);
  }, []);

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
    const bungaPersen = tenorValue <= 12 ? 12 : tenorValue <= 24 ? 14 : 16.5;

    const totalBunga = pokokUtang * (bungaPersen / 100);
    const totalUtang = pokokUtang + totalBunga;
    const angsuranPerBulan = totalUtang / tenorValue;

    const kontrakNo = 'AGR' + Math.floor(Math.random() * 100000).toString().padStart(5, '0');

    if (!startDate) {
      alert('Mohon masukkan tanggal mulai kredit');
      return;
    }

    const [startYearStr, startMonthStr, startDayStr] = startDate.split('-');
    const startYear = parseInt(startYearStr, 10);
    const startMonth = parseInt(startMonthStr, 10) - 1;
    const startDay = parseInt(startDayStr, 10);

    const schedule = Array.from({ length: tenorValue }, (_, index) => {
      const targetMonth = startMonth + (index + 1);
      const targetDate = new Date(startYear, targetMonth, 1);
      const year = targetDate.getFullYear();
      const month = targetDate.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const day = Math.min(startDay, daysInMonth);
      const dueDate = new Date(year, month, day);

      const formattedDate = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}-${String(dueDate.getDate()).padStart(2, '0')}`;

      return {
        angsuranKe: index + 1,
        tanggalJatuhTempo: formattedDate,
      };
    });

    setResult({
      clientName: clientName.trim() || 'SUGUS',
      kontrakNo,
      startDate,
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
    return result.schedule.reduce((acc, schedule) => {
      if (schedule.tanggalJatuhTempo <= checkDate) {
        return acc + result.angsuranPerBulan;
      }
      return acc;
    }, 0);
  }, [result, checkDate]);

  const dendaSchedules = useMemo(() => {
    if (!result || !checkDateDenda) return [];

    const checkDateObj = new Date(checkDateDenda);
    const lastPaid = Number(lastPaidInstallment);

    return result.schedule
      .reduce((acc, schedule) => {
        if (schedule.angsuranKe > lastPaid && schedule.tanggalJatuhTempo < checkDateDenda) {
          const dueDateObj = new Date(schedule.tanggalJatuhTempo);
          const diffTime = checkDateObj.getTime() - dueDateObj.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          const totalDenda = diffDays * 0.001 * result.angsuranPerBulan;

          return [
            ...acc,
            {
              ...schedule,
              hariKeterlambatan: diffDays,
              totalDenda: totalDenda
            }
          ];
        }
        return acc;
      }, [] as Array<typeof result.schedule[0] & { hariKeterlambatan: number; totalDenda: number }>);
  }, [result, checkDateDenda, lastPaidInstallment]);

  const totalKeseluruhanDenda = useMemo(() => {
    return dendaSchedules.reduce((acc, curr) => acc + curr.totalDenda, 0);
  }, [dendaSchedules]);

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      {/* Form Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 px-8 py-6 sm:py-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Simulasi Kredit Mobil</h2>
        <p className="text-blue-100 text-sm mt-1">Input data pembiayaan untuk kalkulasi cicilan real-time</p>
      </div>

      {/* Form Body */}
      <form onSubmit={calculateLoan} className="p-8 space-y-6 max-w-2xl mx-auto">
        {/* Input Nama Klien */}
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">
            <span className="text-red-500">*</span> Nama Klien
          </label>
          <input
            type="text"
            required
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-400 text-slate-900 font-medium"
            placeholder="Contoh: Sugus"
          />
        </div>

        {/* Input Harga Mobil OTR */}
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">
            <span className="text-red-500">*</span> Harga Mobil (OTR)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-3.5 text-slate-600 font-semibold">Rp</span>
            <input
              type="text"
              required
              value={otr}
              onChange={(e) => handleCurrencyInput(e.target.value, setOtr)}
              className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-400 text-slate-900 font-medium"
              placeholder="Contoh: 240.000.000"
            />
          </div>
        </div>

        {/* Pemilihan Tipe DP */}
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-3">
            <span className="text-red-500">*</span> Tipe Uang Muka (DP)
          </label>
          <div className="grid grid-cols-2 gap-3">
            {dpOptions.map(opt => (
              <label
                key={opt.type}
                className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${dpType === opt.type
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                  }`}>
                <input
                  type="radio"
                  name="dpType"
                  value={opt.type}
                  checked={dpType === opt.type}
                  onChange={() => {
                    setDpType(opt.type);
                    setDpValue('');
                  }}
                  className="w-4 h-4 text-blue-600 border-slate-400 focus:ring-2 focus:ring-blue-500"
                />
                <span className="ml-2.5 text-slate-900 font-medium text-sm">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Input Nilai DP */}
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">
            <span className="text-red-500">*</span> Nilai Uang Muka (DP) {dpType === 'percentage' ? '(%)' : '(Rp)'}
          </label>
          <div className="relative">
            {dpType === 'nominal' && (
              <span className="absolute left-4 top-3.5 text-slate-600 font-semibold">Rp</span>
            )}
            <input
              type={dpType === 'percentage' ? "number" : "text"}
              required
              step={dpType === 'percentage' ? "0.1" : undefined}
              min="0"
              max={dpType === 'percentage' ? "100" : undefined}
              value={dpValue}
              onWheel={(e) => e.currentTarget.blur()}
              onChange={(e) => {
                if (dpType === 'nominal') {
                  handleCurrencyInput(e.target.value, setDpValue);
                } else {
                  setDpValue(e.target.value);
                }
              }}
              className={`w-full ${dpType === 'nominal' ? 'pl-12' : 'pl-4'} pr-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-400 text-slate-900 font-medium`}
              placeholder={dpType === 'percentage' ? "Contoh: 20" : "Contoh: 48.000.000"}
            />
            {dpType === 'percentage' && (
              <span className="absolute right-4 top-3.5 text-slate-600 font-semibold">%</span>
            )}
          </div>
        </div>

        {/* Input Tenor */}
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">
            <span className="text-red-500">*</span> Jangka Waktu / Tenor (Bulan)
          </label>
          <div className="relative">
            <input
              type="number"
              required
              min="1"
              value={tenor}
              onWheel={(e) => e.currentTarget.blur()}
              onChange={(e) => setTenor(e.target.value)}
              className="w-full pl-4 pr-16 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-400 text-slate-900 font-medium"
              placeholder="Contoh: 18"
            />
            <span className="absolute right-4 top-3.5 text-slate-600 font-semibold">Bulan</span>
          </div>
        </div>

        {/* Input Tanggal Mulai */}
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">
            <span className="text-red-500">*</span> Tanggal Mulai Kredit
          </label>
          <input
            type="date"
            required
            suppressHydrationWarning
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-slate-900 font-medium"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 rounded-lg transition-all shadow-lg hover:shadow-xl active:scale-[0.98] mt-8"
        >
          Hitung Simulasi
        </button>
      </form>

      {/* Results Area */}
      {result && (() => {
        const summaryItems = [
          { label: 'Pokok Utang', value: formatRupiah(result?.pokokUtang ?? 0) },
          { label: `Bunga (${result?.bungaPersen ?? 0}%)`, value: formatRupiah(result?.totalBunga ?? 0) },
        ];

        return (
          <div className="px-8 pb-8 pt-0">
            {/* Summary Cards */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-slate-900 mb-6 text-center">Ringkasan Perhitungan</h3>
              <div className="grid gap-3 max-w-2xl mx-auto mb-6">
                {summaryItems.map((opt, index) => (
                  <div
                    key={index}
                    className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
                    <span className="text-slate-800 font-medium">{opt.label}</span>
                    <span className="font-bold text-slate-900">{opt.value}</span>
                  </div>
                ))}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200 flex flex-col items-center gap-2">
                  <span className="text-blue-800 font-bold text-sm uppercase tracking-wider">Angsuran Per Bulan</span>
                  <span className="text-3xl font-extrabold text-blue-900">{formatRupiah(result.angsuranPerBulan)}</span>
                </div>
              </div>
            </div>

            {/* Kontrak Table */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-slate-900 uppercase">Kontrak</h4>
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                  ID: {result.kontrakNo}
                </span>
              </div>
              <table className="w-full text-left border-collapse border border-slate-300 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-300 p-3 text-sm font-bold text-slate-900 uppercase">Kontrak_No</th>
                    <th className="border border-slate-300 p-3 text-sm font-bold text-slate-900 uppercase">Client Name</th>
                    <th className="border border-slate-300 p-3 text-sm font-bold text-slate-900 uppercase">Tanggal Mulai</th>
                    <th className="border border-slate-300 p-3 text-sm font-bold text-slate-900 uppercase">OTR</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="border border-slate-300 p-3 text-slate-800 font-medium">{result.kontrakNo}</td>
                    <td className="border border-slate-300 p-3 text-slate-800 uppercase font-medium">{result.clientName}</td>
                    <td className="border border-slate-300 p-3 text-slate-800 font-medium">{result.startDate}</td>
                    <td className="border border-slate-300 p-3 text-slate-800 font-medium">{formatRupiah(result.otrValue).replace('Rp', '').trim()}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Jadwal Angsuran Table */}
            <div className="mb-10">
              <h4 className="text-lg font-bold text-slate-900 mb-4 uppercase">Jadwal Angsuran</h4>
              <div className="overflow-x-auto border border-slate-300 rounded-lg">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-slate-300 p-3 text-sm font-bold text-slate-900 uppercase">Kontrak_No</th>
                      <th className="border border-slate-300 p-3 text-sm font-bold text-slate-900 uppercase text-center">Angsuran_Ke</th>
                      <th className="border border-slate-300 p-3 text-sm font-bold text-slate-900 uppercase text-right">Angsuran_Per_Bulan</th>
                      <th className="border border-slate-300 p-3 text-sm font-bold text-slate-900 uppercase text-center">Tanggal_Jatuh_Tempo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.schedule.map((row) => (
                      <tr key={row.angsuranKe} className="hover:bg-slate-50 transition-colors">
                        <td className="border border-slate-300 p-3 text-slate-800 font-medium">{result.kontrakNo}</td>
                        <td className="border border-slate-300 p-3 text-slate-800 text-center">{row.angsuranKe}</td>
                        <td className="border border-slate-300 p-3 text-slate-800 text-right font-medium">
                          {formatRupiah(result.angsuranPerBulan).replace('Rp', '').trim()}
                        </td>
                        <td className="border border-slate-300 p-3 text-slate-800 text-center">{row.tanggalJatuhTempo}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100 font-bold">
                      <td colSpan={2} className="border border-slate-300 p-3 text-slate-900 uppercase text-right font-bold">
                        Total
                      </td>
                      <td className="border border-slate-300 p-3 text-slate-900 text-right font-bold">
                        {formatRupiah(result.schedule.length * result.angsuranPerBulan).replace('Rp', '').trim()}
                      </td>
                      <td className="border border-slate-300 p-3 bg-slate-100"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Total Angsuran Jatuh Tempo */}
            <div className="mb-10 bg-gradient-to-br from-red-50 via-white to-red-50 p-6 rounded-xl border border-red-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                <div>
                  <h4 className="text-lg font-bold text-red-900 uppercase">Cek Total Angsuran Jatuh Tempo</h4>
                  <p className="text-sm text-red-700/80 mt-1">Total yang sudah jatuh tempo hingga tanggal tertentu</p>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-sm font-bold text-red-800">Per Tanggal:</label>
                  <input
                    type="date"
                    suppressHydrationWarning
                    value={checkDate}
                    onChange={(e) => setCheckDate(e.target.value)}
                    className="px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-slate-900 outline-none font-medium"
                  />
                </div>
              </div>

              <div className="overflow-x-auto border border-red-300 rounded-lg bg-white">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-red-100">
                      <th className="border border-red-300 p-3 text-sm font-bold text-red-900 uppercase">Kontrak No</th>
                      <th className="border border-red-300 p-3 text-sm font-bold text-red-900 uppercase">Client Name</th>
                      <th className="border border-red-300 p-3 text-sm font-bold text-red-900 uppercase">Total Angsuran Jatuh Tempo</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-red-300 p-3 text-slate-800 font-medium">{result.kontrakNo}</td>
                      <td className="border border-red-300 p-3 text-slate-800 uppercase font-medium">{result.clientName}</td>
                      <td className="border border-red-300 p-3 text-slate-900 font-bold text-lg">
                        {totalJatuhTempo > 0 ? formatRupiah(totalJatuhTempo).replace('Rp', '').trim() : '0'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Denda Keterlambatan */}
            <div className="bg-gradient-to-br from-orange-50 via-white to-orange-50 p-6 rounded-xl border border-orange-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                <div>
                  <h4 className="text-lg font-bold text-orange-900 uppercase">Cek Denda Keterlambatan (0.1% / Hari)</h4>
                  <p className="text-sm text-orange-700/80 mt-1">Hitung denda untuk angsuran yang belum dibayar melewati jatuh tempo</p>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-bold text-orange-800">Terakhir Bayar:</label>
                    <input
                      type="number"
                      min="0"
                      max={result.schedule.length}
                      value={lastPaidInstallment}
                      onChange={(e) => setLastPaidInstallment(e.target.value)}
                      className="w-24 px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-slate-900 outline-none font-medium"
                      placeholder="Angsuran ke"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-bold text-orange-800">Per Tanggal:</label>
                    <input
                      type="date"
                      suppressHydrationWarning
                      value={checkDateDenda}
                      onChange={(e) => setCheckDateDenda(e.target.value)}
                      className="px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-slate-900 outline-none font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto border border-orange-300 rounded-lg bg-white">
                <table className="w-full text-left border-collapse">
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
                          <td className="border border-orange-300 p-3 text-slate-800 font-medium">{result.kontrakNo}</td>
                          <td className="border border-orange-300 p-3 text-slate-800 uppercase font-medium">{result.clientName}</td>
                          <td className="border border-orange-300 p-3 text-slate-800 text-center font-bold">{s.angsuranKe}</td>
                          <td className="border border-orange-300 p-3 text-orange-700 text-center font-bold">{s.hariKeterlambatan} Hari</td>
                          <td className="border border-orange-300 p-3 text-slate-900 text-right font-bold text-lg">
                            {formatRupiah(s.totalDenda).replace('Rp', '').trim()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="border border-orange-300 p-4 text-center text-slate-600 italic">
                          Tidak ada denda keterlambatan pada periode ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {dendaSchedules.length > 0 && (
                    <tfoot>
                      <tr className="bg-orange-100 font-bold">
                        <td colSpan={4} className="border border-orange-300 p-3 text-orange-950 uppercase text-right">
                          Total Seluruh Denda:
                        </td>
                        <td className="border border-orange-300 p-3 text-red-700 text-right text-lg">
                          {formatRupiah(totalKeseluruhanDenda).replace('Rp', '').trim()}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-8 text-center text-sm text-slate-500">
              <p className="inline-flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Hasil simulasi bersifat estimasi dan dapat berubah berdasarkan kebijakan bank. Hubungi konsultan IMS Finance untuk penawaran resmi.
              </p>
            </div>
          </div>
        );
      })()}
    </div>
  );
}