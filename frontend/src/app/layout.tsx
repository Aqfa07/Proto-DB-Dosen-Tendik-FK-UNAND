import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Database Dosen & Tendik FK UNAND',
  description: 'Sistem Informasi Database Dosen dan Tenaga Kependidikan Fakultas Kedokteran Universitas Andalas',
}

import { Toaster } from 'sonner';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className="flex min-h-screen bg-[#F0F3FA] dark:bg-[#0c1120] text-slate-900 dark:text-slate-50 selection:bg-indigo-200 dark:selection:bg-indigo-900/60">
        
        {/* Premium Ambient Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
          <div className="absolute top-[-10%] left-[5%] w-[560px] h-[560px] rounded-full bg-indigo-400/[0.08] blur-[130px]" />
          <div className="absolute bottom-[5%] right-[-8%] w-[640px] h-[640px] rounded-full bg-violet-500/[0.07] blur-[160px]" />
          <div className="absolute top-[45%] right-[25%] w-[320px] h-[320px] rounded-full bg-blue-400/[0.06] blur-[110px]" />
        </div>

        {children}
        <Toaster position="bottom-right" richColors expand={false} />
      </body>
    </html>
  )
}
