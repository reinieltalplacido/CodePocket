import { useEffect } from 'react';
import Lenis from '@studio-freight/lenis';

export function useLenis() {
  useEffect(() => {
    // @ts-ignore - Lenis types may not be fully compatible
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);
}
