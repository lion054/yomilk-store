import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { toast } from 'react-toastify';
import { VendorAuthProvider, useVendorAuth } from '../../components/vendor/VendorAuthContext';
import { useFormValidation } from '../../hooks/useFormValidation';
import InlineFieldError from '../../components/common/InlineFieldError';
import { loginSchema } from '../../lib/validation';

function VendorLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, isAuthenticated } = useVendorAuth();
  const router = useRouter();
  const { fieldErrors, validateField, validateAll, clearFieldError } = useFormValidation(loginSchema);

  useEffect(() => {
    if (isAuthenticated) {
      const redirect = router.query['redirect'] as string || '/vendor';
      // Validate redirect to prevent open redirect attacks
      const isSafe = redirect.startsWith('/') && !redirect.startsWith('//') && !redirect.includes('\\') && !/[a-zA-Z][a-zA-Z0-9+\-.]*:/.test(redirect);
      router.push(isSafe ? redirect : '/vendor');
    }
  }, [isAuthenticated]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const validation = validateAll({ email, password });
    if (!validation.success) return;
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        toast.success('Welcome back! Redirecting to your dashboard...');
      } else {
        toast.error(result.error || 'Invalid email or password');
        setLoading(false);
      }
    } catch (error: any) {
      toast.error(error?.message || 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Vendor Login | Snappy Fresh</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="/assets/css/vendor-portal.css" />
      </Head>

      <div className="vp-login-page">
        <div className="vp-login-left">
          <div className="vp-login-left-brand">
            <div className="vp-sidebar-logo">SF</div>
            <div>
              <div className="vp-sidebar-brand-text">Snappy<span>Fresh</span></div>
              <div className="vp-sidebar-brand-sub">Vendor Portal</div>
            </div>
          </div>

          <h2>Grow your<br /><em>business.</em></h2>
          <p className="vp-login-left-sub">
            Manage your products, track orders, and grow your revenue with Snappy Fresh's vendor platform.
          </p>

          <div className="vp-login-features">
            {[
              { icon: '📦', text: 'Upload & manage your product catalogue' },
              { icon: '📊', text: 'Real-time sales analytics & insights' },
              { icon: '🛒', text: 'Track customer orders & fulfillment' },
              { icon: '💰', text: 'Transparent payouts & financial reports' },
              { icon: '📈', text: 'Inventory & stock level management' },
            ].map((f, i) => (
              <div key={i} className="vp-login-feature">
                <div className="vp-login-feature-icon">{f.icon}</div>
                <span className="vp-login-feature-text">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="vp-login-right">
          <div className="vp-login-form-box">
            <div className="vp-login-eyebrow">Vendor Portal</div>
            <h1>Sign in to your<br />vendor account</h1>
            <p>
              Not a vendor yet?{' '}
              <Link href="/supplier-register">Apply to sell on Snappy Fresh</Link>
            </p>

            <form onSubmit={handleSubmit} noValidate>
              <div className="vp-form-group">
                <label className="vp-form-label">Email Address</label>
                <input
                  type="email"
                  className={`vp-input ${fieldErrors.email ? 'error' : ''}`}
                  placeholder="vendor@company.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearFieldError('email'); }}
                  onBlur={() => validateField('email', email)}
                />
                <InlineFieldError error={fieldErrors.email} />
              </div>

              <div className="vp-form-group">
                <label className="vp-form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={`vp-input ${fieldErrors.password ? 'error' : ''}`}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); clearFieldError('password'); }}
                    onBlur={() => validateField('password', password)}
                    style={{ paddingRight: '44px' }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '15px', padding: '4px',
                    }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <i className={showPassword ? 'fi-rs-eye-crossed' : 'fi-rs-eye'}></i>
                  </button>
                </div>
                <InlineFieldError error={fieldErrors.password} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
                <Link href="/vendor/forgot-password" style={{ fontSize: '13px', fontWeight: 600, color: '#2a9d6a', textDecoration: 'none' }}>
                  Forgot password?
                </Link>
              </div>

              <button type="submit" className="vp-btn vp-btn-primary vp-btn-full vp-btn-lg" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '28px' }}>
              <Link href="/" style={{ fontSize: '13px', color: '#9ca3af', textDecoration: 'none', fontWeight: 500 }}>
                <i className="fi-rs-arrow-left" style={{ marginRight: '6px', fontSize: '11px' }}></i>
                Back to Snappy Fresh store
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function VendorLogin() {
  return (
    <VendorAuthProvider>
      <VendorLoginForm />
    </VendorAuthProvider>
  );
}
