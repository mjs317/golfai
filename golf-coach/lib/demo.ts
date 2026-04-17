import { cookies } from 'next/headers';

export function isDemoModeServer(): boolean {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') return true;
  try {
    return cookies().get('demo_mode')?.value === '1';
  } catch {
    return false;
  }
}
