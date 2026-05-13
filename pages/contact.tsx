import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Contact() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/contact-us');
  }, [router]);

  return null;
}
