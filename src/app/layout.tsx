import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IMS Finance — Simulasi Kredit Mobil",
  description: "Hitung cicilan, jadwal angsuran, jatuh tempo, dan denda secara transparan untuk presentasi sales.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
