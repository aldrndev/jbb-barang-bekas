'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function ScrollWatcher() {
  const pathname = usePathname();

  useEffect(() => {
    // Instant scroll to top on route change
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' as ScrollBehavior
    });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  return null;
}

export function ScrollToTop() {
  return (
    <Suspense fallback={null}>
      <ScrollWatcher />
    </Suspense>
  );
}
