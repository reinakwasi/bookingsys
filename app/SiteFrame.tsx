'use client';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

export default function SiteFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');
  const [showFooter, setShowFooter] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  
  // Wait for content to be ready before showing footer
  useEffect(() => {
    // Hide footer immediately on route change
    setShowFooter(false);
    
    let mounted = true;
    let checkCount = 0;
    const maxChecks = 10;
    
    const checkContentReady = () => {
      if (!mounted) return;
      
      checkCount++;
      
      // Check if main content has actual height
      if (mainRef.current) {
        const mainHeight = mainRef.current.offsetHeight;
        const hasChildren = mainRef.current.children.length > 0;
        
        // Only show footer if:
        // 1. Main content has significant height (> 200px)
        // 2. Main has child elements
        // OR we've checked enough times
        if ((mainHeight > 200 && hasChildren) || checkCount >= maxChecks) {
          setShowFooter(true);
        } else {
          // Keep checking every 50ms
          setTimeout(checkContentReady, 50);
        }
      } else {
        // If no ref yet, keep checking
        if (checkCount < maxChecks) {
          setTimeout(checkContentReady, 50);
        } else {
          setShowFooter(true);
        }
      }
    };
    
    // Start checking after initial render
    const timer = setTimeout(() => {
      requestAnimationFrame(() => {
        checkContentReady();
      });
    }, 100);
    
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [pathname]);
  
  return (
    <div className="flex flex-col" style={{ minHeight: '100vh' }}>
      {!isAdminRoute && (
        <header className="flex-shrink-0 relative z-40">
          <Navbar />
        </header>
      )}
      <main 
        ref={mainRef}
        className="flex-grow relative z-10" 
        style={{ 
          minHeight: 'calc(100vh - 200px)',
          // Ensure content area is visible even during loading
          opacity: 1
        }}
      >
        {children}
      </main>
      {/* Spacer to prevent footer from showing during loading */}
      {!isAdminRoute && !showFooter && (
        <div style={{ height: '200px' }} aria-hidden="true" />
      )}
      {!isAdminRoute && showFooter && (
        <footer className="flex-shrink-0 relative z-30 mt-auto">
          <Footer />
        </footer>
      )}
    </div>
  );
}