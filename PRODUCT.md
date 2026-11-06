# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js 16.3.1 (React 19.2.8) with TypeScript, Tailwind CSS v4

## Users

Sales dan marketing tim finance mobil yang mempresentasikan simulasi kredit langsung kepada calon pembeli. Situasi: meeting tatap muka atau presentasi virtual, calon pembeli ingin tahu berapa cicilan, tenor, DP, dan denda. Job: menghitung, menjelaskan, dan meyakinkan calon pembeli dengan transparansi.

## Product Purpose

Tool simulasi kredit mobil real-time yang membantu tim sales/marketing menghasilkan leads dengan cepat. Sukses diukur dengan: conversion rate meeting-to-proposal, waktu yang dihemat dari kalkulasi manual, dan engagement customer dengan data transparan.

## Positioning

IMS Finance menawarkan layanan personal yang superior: simulasi yang jelas, pendampingan transparan, tidak ada hidden cost. Berbeda dari kompetitor yang hanya memberi angka: IMS memberi edukasi dan support.

## Operating Context

Tim sales mobile (laptop) presentasi kepada calon pembeli, sering di dealer/showroom atau via Zoom. Workflow: input OTR, DP, tenor, tanggal mulai → lihat tabel angsuran, total jatuh tempo, dan denda keterlambatan. Data ekspor tidak diperlukan, fokus pada visual real-time.

## Capabilities and Constraints

- Kalkulasi pokok utang, bunga flat bertingkat berdasarkan tenor (≤10 bulan 10%, ≤15 13%, ≤20 15%, ≤24 18%, >24 20%)
- Jadwal angsuran bulanan dinamis dengan handling hari dalam bulan
- Fitur cek total angsuran jatuh tempo per tanggal tertentu
- Fitur cek denda keterlambatan (0.1% per hari) untuk angsuran belum dibayar
- Input DP bisa persentase atau nominal Rupiah dengan auto-format ribuan
- Validasi input number menghilangkan spinner arrow
- Tidak ada backend storage, tidak ada login, semua state client-side
- Constraints: angka berbasis Rupiah, format tanggal ISO (YYYY-MM-DD), asumsi bunga flat

## Brand Commitments

Nama "IMS Finance" sudah fixed. Logo tidak ada (lihat file.svg placeholder). Voice: profesional, transparan, edukatif, personal. Tidak ada palette/typography yang binding.

## Evidence on Hand

- Nama "IMS Finance" di h1 page
- Copy: "Kalkulator Simulasi Kredit Mobil Terbaik"
- Placeholder file.svg, window.svg, globe.svg di public/
- Bunga skema sudah di-hardcode di komponen
- Sample client name default: "SUGUS"

## Product Principles

1. **Transparansi total** – semua angka dan perhitungan terlihat, tidak ada hidden.
2. **Speed-to-value** – dalam 3 klik customer melihat cicilan, tidak overload input.
3. **Visual clarity** – tabel dan highlight yang mudah dipahami saat presentasi.

## Accessibility & Inclusion

Belum ada requirement product-specific. Kontras warna harus memenuhi WCAG AA untuk angka penting, karena presentasi sering di proyektor dengan brightness rendah.