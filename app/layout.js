import { Plus_Jakarta_Sans } from 'next/font/google';
import Script from 'next/script';
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

const MIDTRANS_CLIENT_KEY = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '';
const IS_PRODUCTION = process.env.MIDTRANS_PRODUCTION === 'true';
const SNAP_URL = IS_PRODUCTION
  ? 'https://app.midtrans.com/snap/snap.js'
  : 'https://app.sandbox.midtrans.com/snap/snap.js';

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={jakarta.variable}>
      <body>
        {children}
        {MIDTRANS_CLIENT_KEY ? (
          <Script
            src={SNAP_URL}
            data-client-key={MIDTRANS_CLIENT_KEY}
            strategy="afterInteractive"
          />
        ) : null}
      </body>
    </html>
  );
}
