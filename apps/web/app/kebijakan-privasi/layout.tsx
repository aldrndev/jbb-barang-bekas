import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kebijakan Privasi & Perlindungan Data',
  description:
    'Komitmen Belanjanya dalam melindungi keamanan data pribadi, informasi rekening, dan dokumen identitas Anda.',
  openGraph: {
    title: 'Kebijakan Privasi & Perlindungan Data | Belanjanya',
    description:
      'Komitmen Belanjanya dalam melindungi keamanan data pribadi, informasi rekening, dan dokumen identitas Anda.'
  }
};

export default function KebijakanPrivasiLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return children;
}
