import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'JAKU | Planes en Huamanga según tu presupuesto',
    template: '%s | JAKU Huamanga',
  },
  description:
    'Descubre restaurantes, cafés, bares, cines y lugares para salir en Huamanga, Ayacucho, filtrados por presupuesto y cercanía.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2563eb',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={plusJakarta.variable}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
