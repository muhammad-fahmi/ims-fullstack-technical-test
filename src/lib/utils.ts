/**
 * Memformat nilai angka menjadi representasi string mata uang Rupiah (IDR)
 * sesuai standar format penulisan mata uang di Indonesia (id-ID).
 * 
 * @example
 * formatRupiah(240000000); // "Rp 240.000.000"
 * formatRupiah(4800000);   // "Rp 4.800.000"
 * 
 * @param {number} value - Nilai angka yang akan dikonversi ke Rupiah.
 * @returns {string} String terformat dengan simbol mata uang 'Rp' dan pemisah ribuan.
 */
export function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
