import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kebijakan Privasi & Perlindungan Data',
  description:
    'Komitmen Peygo dalam melindungi keamanan data pribadi, informasi rekening, dan dokumen identitas Anda.',
  openGraph: {
    title: 'Kebijakan Privasi & Perlindungan Data | Peygo',
    description:
      'Komitmen Peygo dalam melindungi keamanan data pribadi, informasi rekening, dan dokumen identitas Anda.'
  }
};

export default function KebijakanPrivasiLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return children;
}
