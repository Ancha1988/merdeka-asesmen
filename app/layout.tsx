import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/components/shared/AuthProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Merdeka Asesmen',
  description: 'Sistem Penilaian Kurikulum Merdeka untuk Guru Indonesia',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="id" className={`${inter.variable}`}>
      <body className="font-sans antialiased text-slate-900 bg-slate-50 flex min-h-screen overflow-hidden" suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
