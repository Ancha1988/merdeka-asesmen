import './globals.css';
import { Inter } from 'next/font/google';
import { ReactNode } from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Menu KKTP',
  description: 'Pengaturan KKTP Rubrik Deskripsi',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
