'use client';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

export default function SiteFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');
  
  return (
    <div className="flex min-h-screen flex-col">
      {!isAdminRoute && (
        <header className="flex-shrink-0">
          <Navbar />
        </header>
      )}
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      {!isAdminRoute && (
        <footer className="flex-shrink-0 mt-auto">
          <Footer />
        </footer>
      )}
    </div>
  );
}