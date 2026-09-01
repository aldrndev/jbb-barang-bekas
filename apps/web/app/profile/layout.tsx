import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profil Pengguna & Status KYC',
  description:
    'Kelola identitas akun, status verifikasi KTP (KYC), Trust Score reputasi, dan rekening bank pencairan dana di Bekasin.',
  robots: {
    index: false,
    follow: false
  }
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
