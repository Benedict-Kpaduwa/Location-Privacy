import { useEffect, useState } from 'react';

export type ColorScheme = 'light' | 'dark';

const QUERY = '(prefers-color-scheme: dark)';

const current = (): ColorScheme =>
  typeof window !== 'undefined' && window.matchMedia(QUERY).matches ? 'dark' : 'light';

/** Follows the system light/dark setting. */
export function useColorScheme(): ColorScheme {
  const [scheme, setScheme] = useState<ColorScheme>(current);

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const onChange = () => setScheme(mq.matches ? 'dark' : 'light');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return scheme;
}
