# Pertanyaan Aplikasi IMS Finance

## Fungsionalitas Inti

1. Bagaimana cara sistem menghitung bunga flat bertingkat berdasarkan tenor yang dipilih user?

2. Apakah sistem mendukung perhitungan untuk multiple kontrak dalam satu sesi?

3. Bagaimana mekanisme perhitungan denda keterlambatan 0.1% per hari diterapkan pada angsuran yang telah jatuh tempo?

4. Apakah input DP dalam bentuk persentase dan nominal dapat digunakan secara bersamaan atau harus memilih salah satu?

5. Bagaimana sistem menangani perhitungan tanggal jatuh tempo untuk bulan dengan jumlah hari berbeda (28, 30, 31)?

## User Experience & Use Case

6. Apakah aplikasi dapat digunakan secara offline setelah pertama kali dimuat?

7. Bagaimana cara sales menyimpan atau mengekspor hasil simulasi untuk dikirim ke calon pembeli?

8. Apakah terdapat fitur perbandingan simulasi untuk berbagai skenario DP dan tenor?

9. Bagaimana cara aplikasi menampilkan data dalam mode presentasi (proyektor/screen sharing)?

10. Apakah sistem menyediakan summary atau snapshot yang dapat di-screenshot untuk kebutuhan follow-up?

## Data & Validasi

11. Apa batasan minimum dan maksimum untuk nilai OTR mobil yang dapat dihitung?

12. Bagaimana sistem memvalidasi input DP agar tidak melebihi nilai OTR?

13. Apakah ada batasan tenor minimum dan maksimum yang dapat dipilih user?

14. Bagaimana sistem menangani perhitungan untuk tanggal mulai yang jatuh di akhir bulan (misalnya 31 Januari)?

15. Apakah format input Rupiah mendukung copy-paste dari sumber eksternal (Excel, kalkulator)?

## Technical Implementation

16. Bagaimana state management ditangani untuk memastikan perhitungan tetap konsisten saat user mengubah input?

17. Apakah aplikasi menggunakan Web Workers atau optimisasi lain untuk perhitungan dengan tenor panjang (>24 bulan)?

18. Bagaimana cara aplikasi memastikan precision perhitungan bunga dan angsuran tanpa floating-point error?

19. Apakah terdapat unit test atau integration test untuk memvalidasi akurasi perhitungan finansial?

## Future Development

20. Apakah ada rencana menambahkan fitur backend untuk menyimpan riwayat simulasi atau lead tracking?

---

# Kunci Jawaban

1. **Bunga flat bertingkat:** Tenor ≤10 bulan → 10%, ≤15 → 13%, ≤20 → 15%, ≤24 → 18%, >24 → 20%. Formula: `pokokUtang × (bungaPersen/100)` → totalBunga. `totalUtang = pokokUtang + totalBunga`. `angsuranPerBulan = totalUtang / tenor`.

2. **Multiple kontrak:** Tidak. Semua state client-side, satu kontrak per sesi. Reset manual diperlukan untuk kontrak baru.

3. **Denda keterlambatan:** `0.1% × angsuranPerBulan × hariKeterlambatan` per angsuran yang belum dibayar dan sudah melewati jatuh tempo hingga `checkDateDenda`.

4. **DP type:** Harus memilih salah satu. Radio button `dpType` mengunci mode input. `dpType='percentage'` atau `dpType='nominal'`.

5. **Hari dalam bulan:** Menggunakan `Date(year, month + 1, 0).getDate()` untuk dapat jumlah hari bulan target, lalu `Math.min(startDay, daysInMonth)` agar tidak overflow.

6. **Offline usage:** Ya. Next.js SPA client-side murni, semua logic di browser. Caching static resources oleh browser.

7. **Export hasil:** Tidak ada fitur export built-in. User harus screenshot/manual copy table HTML.

8. **Perbandingan skenario:** Tidak. Hanya satu simulasi aktif per sesi. User harus manually ubah input dan hitung ulang.

9. **Presentasi mode:** Aplikasi responsif, butuh user gunakan browser zoom/f11 fullscreen. Tidak ada mode khusus presentasi.

10. **Snapshot/summary:** Tidak ada fitur khusus. Semua info sudah tampil di tabel. User dapat screenshot.

11. **OTR limit:** Tidak ada batasan eksplisit. Validasi hanya `otrValue > 0`. Practical limit: integer JavaScript max (±9×10¹⁵).

12. **Validasi DP:** Tidak ada validasi DP ≤ OTR. User dapat input DP 100% atau lebih. Validasi logika `pokokUtang = otr - dp` bisa nol/negatif.

13. **Tenor limit:** Tidak ada batasan eksplisit. Validasi hanya `tenorValue > 0`. Skema bunga berlaku sampai tenor >24 bulan.

14. **Tanggal akhir bulan:** `new Date(year, month, day)` JavaScript otomatis handle overflow. `startDay=31` Februari → day=28/29 (depends leap year).

15. **Copy-paste Rupiah:** Ya. `handleCurrencyInput` filter semua non-digit `replace(/[^0-9]/g, '')`, lalu `toLocaleString('id-ID')`. Format apa saja (Rp, ., ,) tetap work.

16. **State management:** React `useState` hooks untuk form fields. `useMemo` untuk `totalJatuhTempo`, `dendaSchedules`, `totalKeseluruhanDenda` recalc otomatis saat dependency berubah.

17. **Web Workers:** Tidak digunakan. Semua perhitungan synchronous, <1ms untuk tenor typical (1-24 bulan).

18. **Floating-point precision:** Menggunakan `Number` JavaScript standar. Untuk financial app sebenarnya risk untuk precision error. Sebaiknya gunakan integer cents atau library seperti `decimal.js`.

19. **Unit test:** Tidak ada. Tidak ada folder `__tests__` atau file test. Manual QA dari developer.

20. **Backend/lead tracking:** Tidak ada. Asumsi product: "tidak ada backend storage, tidak ada login, semua state client-side". Rencana future depends user requirement.

---

## Catatan Kritis

- **Bug validasi DP:** Tidak ada pengecekan `dpActualValue <= otrValue`. User bisa input DP > OTR → pokokUtang negatif → hasil tidak valid.
- **Bug tenor minimum:** Validasi hanya `tenorValue > 0`, tidak ada batas maksimum practical. Tenor 1000 bulan tetap bisa dihitung (bisa overflow memory).
- **Bug floating-point:** `pokokUtang * (bungaPersen/100)` bisa precision error. Contoh: 1000000 * 13/100 = 130000.00000000001.
- **Bug startDate:** Input date default `getTodayDate` dipanggil saat component mount, tapi `useState` di-assign `getTodayDate` (function reference) bukan `getTodayDate()` (value). Fixed via `useEffect` di baris 51-54.
- **Bug hydration warning:** `suppressHydrationWarning` used di input `type="date"` → mask潜在 CSR/SSR mismatch. Not ideal, better fix hydration logic.
- **Bug kontrakNo:** `Math.random()` * 100000 → only 5 digits, range 0-99999. `padStart(5,'0')` → always 5 digits. Risk collision untuk banyak kontrak.
- **Bug denda calculation:** `checkDateDenda` compared dengan `tanggalJatuhTempo < checkDateDenda` (strict less than). Should it be `<=`? Ambigu business rule.
