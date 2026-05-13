import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthModal } from '../contexts/AuthModalContext';
import { useAuth } from '../contexts/AuthContext';
import { isSafeRedirect } from '../lib/validation';

export default function Login() {
  const router = useRouter();
  const { openAuthModal } = useAuthModal();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user && !user.customer?.isVisitor) {
      const rawRedirect = router.query['redirect'];
      const redirectPath = isSafeRedirect(rawRedirect) ? rawRedirect : '/profile';
      router.replace(redirectPath as any);
      return;
    }

    const rawRedirect = router.query['redirect'];
    const redirect = isSafeRedirect(rawRedirect) ? (rawRedirect as string) : undefined;
    openAuthModal('login', redirect);
    router.replace('/');
  }, []);

  return null;
}
