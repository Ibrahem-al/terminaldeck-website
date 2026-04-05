import { useMemo } from 'react';

export type Platform = 'windows' | 'mac' | 'other';

export function usePlatformDetect(): Platform {
  return useMemo(() => {
    if (typeof navigator === 'undefined') return 'other';
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('win')) return 'windows';
    if (ua.includes('mac')) return 'mac';
    return 'other';
  }, []);
}
