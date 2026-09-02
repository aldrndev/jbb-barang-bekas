'use client';

import { usePathname } from 'next/navigation';
import { Suspense, useEffect } from 'react';

function ScrollWatcher() {
  const pathname = usePathname();

  // biome-ignore lint/correctness/useExhaustiveDependencies: trigger scroll to top on route change
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
