import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const metadata = {
  title: 'Agripedia — Katalog UMKM Tani & Laut',
  description:
    'AgriPedia — katalog hasil tani dan hasil laut UMKM Indonesia, lengkap dengan panduan budidaya dan halaman kelola.',
  icons: { icon: '/favicon.svg' },
};

export const viewport = { themeColor: '#177a3c' };

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={jakarta.variable}>
      <body>{children}</body>
    </html>
  );
}
