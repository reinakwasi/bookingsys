'use client';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

export default function SiteFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');
  
  return (
    <div className="flex flex-col" style={{ minHeight: '100vh' }}>
      {!isAdminRoute && (
        <header className="flex-shrink-0 relative z-40">
          <Navbar />
        </header>
      )}
      <main className="flex-grow relative z-10" style={{ minHeight: 'calc(100vh - 400px)' }}>
        {children}
      </main>
      {!isAdminRoute && (
        <footer className="flex-shrink-0 relative z-30 mt-auto">
          <Footer />
        </footer>
      )}
    </div>
  );
}