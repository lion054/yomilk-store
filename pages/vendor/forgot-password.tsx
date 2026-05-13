import { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { toast } from 'react-toastify';
import { VendorAuthProvider, useVendorAuth } from '../../components/vendor/VendorAuthContext';

function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { forgotPassword } = useVendorAuth();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    setIsLoading(true);
    try {
      const result = await forgotPassword(email);
      if (result.success) {
        setIsSubmitted(true);
        toast.success('Password reset instructions sent to your email');
      } else {
        toast.error(result.error || 'Failed to send reset email');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Forgot Password - Vendor Portal | Snappy Fresh</title>
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

          <h2>Reset your<br /><em>password.</em></h2>
          <p className="vp-login-left-sub">
            No worries — we'll send you a secure link to reset your password and get back to managing your store.
          </p>

          <div className="vp-login-features">
            {[
              { icon: '1️⃣', text: 'Enter your registered email address' },
              { icon: '2️⃣', text: 'Check your inbox for the reset link' },
              { icon: '3️⃣', text: 'Create a new secure password' },
              { icon: '✅', text: 'Sign in and continue selling' },
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
            {!isSubmitted ? (
              <>
                <div className="vp-login-eyebrow">Password Recovery</div>
                <h1>Forgot your<br />password?</h1>
                <p>Remember your password? <Link href="/vendor/login">Sign in instead</Link></p>

                <form onSubmit={handleSubmit} noValidate>
                  <div className="vp-form-group">
                    <label className="vp-form-label">Email Address</label>
                    <input
                      type="email"
                      className="vp-input"
                      placeholder="vendor@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                    />
                    <p className="vp-form-hint">We'll send a password reset link to this email address.</p>
                  </div>
                  <button type="submit" className="vp-btn vp-btn-primary vp-btn-full vp-btn-lg" disabled={isLoading}>
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </form>
              </>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 16, background: '#e8f5ef',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px', fontSize: 28
                }}>✉️</div>
                <h1 style={{ fontSize: '1.6rem' }}>Check your email</h1>
                <p style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
                  We've sent a password reset link to <strong style={{ color: '#1a1a2e' }}>{email}</strong>.
                  Click the link in the email to create a new password. The link expires in 24 hours.
                </p>
                <div style={{
                  background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 12,
                  padding: '14px 18px', fontSize: 13, color: '#92400e', marginBottom: 28, textAlign: 'left'
                }}>
                  <strong>Tip:</strong> Check your spam or junk folder if you don't see the email within a few minutes.
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                  <button onClick={() => setIsSubmitted(false)} className="vp-btn vp-btn-secondary">Try another email</button>
                  <Link href="/vendor/login" className="vp-btn vp-btn-primary">Back to Sign In</Link>
                </div>
              </div>
            )}

            <div style={{ textAlign: 'center', marginTop: 28 }}>
              <Link href="/" style={{ fontSize: 13, color: '#9ca3af', textDecoration: 'none', fontWeight: 500 }}>
                <i className="fi-rs-arrow-left" style={{ marginRight: 6, fontSize: 11 }}></i>
                Back to Snappy Fresh store
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function VendorForgotPassword() {
  return (
    <VendorAuthProvider>
      <ForgotPasswordForm />
    </VendorAuthProvider>
  );
}
