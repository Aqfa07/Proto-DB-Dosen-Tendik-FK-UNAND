"use client";
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import { useAuthStore } from '@/store/useAuthStore'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      await checkAuth();
      setIsChecking(false);
    };
    initAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isChecking && !isAuthenticated) {
      router.push('/login');
    }
  }, [isChecking, isAuthenticated, router]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 w-full relative z-[9999]">
         <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <>
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 max-h-screen overflow-y-auto w-full">
        <div className="w-full max-w-[1600px] mx-auto pb-10 pt-4">
          <Topbar />
          <div className="px-4 md:px-10">
            {children}
          </div>
        </div>
      </main>
    </>
  )
}
