import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Orders() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/scheduled-orders');
  }, [router]);

  return null;
}
