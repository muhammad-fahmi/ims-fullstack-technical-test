SELECT 
    k.KONTRAK_NO,
    k.CLIENT_NAME,
    j.ANGSURAN_KE AS INSTALLMENT_NO,
    DATEDIFF('2024-08-14', j.TANGGAL_JATUH_TEMPO) AS HARI_KETERLAMBATAN,
    ROUND(DATEDIFF('2024-08-14', j.TANGGAL_JATUH_TEMPO) * 0.001 * j.ANGSURAN_PER_BULAN) AS TOTAL_DENDA
FROM 
    KONTRAK k
JOIN 
    JADWAL_ANGSURAN j ON k.KONTRAK_NO = j.KONTRAK_NO
WHERE 
    k.CLIENT_NAME = 'SUGUS' 
    -- Asumsi kondisi: mencari angsuran setelah bulan Mei (belum dibayar) 
    -- yang tanggal jatuh temponya sebelum tanggal pengecekan (14 Agustus)
    AND j.TANGGAL_JATUH_TEMPO > '2024-05-31' 
    AND j.TANGGAL_JATUH_TEMPO < '2024-08-14';
