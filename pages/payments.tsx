import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Payments() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/profile/payments');
  }, [router]);

  return null;
}
