'use client';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

export default function SiteFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');
  
  return (
    <div className="min-h-screen flex flex-col">
      {!isAdminRoute && (
        <header className="flex-shrink-0 relative z-40">
          <Navbar />
        </header>
      )}
      <main className="flex-1 relative z-10">
        <div className="min-h-[60vh]">
          {children}
        </div>
      </main>
      {!isAdminRoute && (
        <footer className="flex-shrink-0 relative z-30">
          <Footer />
        </footer>
      )}
    </div>
  );
}