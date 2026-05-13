import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { toast } from 'react-toastify';
import { VendorAuthProvider, useVendorAuth } from '../../components/vendor/VendorAuthContext';

function ResetPasswordForm() {
  const router = useRouter();
  const { resetPassword } = useVendorAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (password !== confirmPassword) { toast.error('Passwords do not match'); return; }

    const { email, otp } = router.query;
    if (!email || !otp) { toast.error('Invalid reset link. Please request a new one.'); return; }

    setIsLoading(true);
    try {
      const result = await resetPassword(email, otp, password, confirmPassword);
      if (result.success) {
        setIsReset(true);
        toast.success('Password reset successfully!');
      } else {
        toast.error(result.error || 'Failed to reset password');
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
        <title>Reset Password - Vendor Portal | Snappy Fresh</title>
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
          <h2>Create a new<br /><em>password.</em></h2>
          <p className="vp-login-left-sub">Choose a strong password to keep your vendor account secure.</p>
        </div>

        <div className="vp-login-right">
          <div className="vp-login-form-box">
            {!isReset ? (
              <>
                <div className="vp-login-eyebrow">New Password</div>
                <h1>Create your<br />new password</h1>
                <p>Choose a strong password with at least 8 characters.</p>

                <form onSubmit={handleSubmit} noValidate>
                  <div className="vp-form-group">
                    <label className="vp-form-label">New Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="vp-input"
                        placeholder="Enter new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        style={{ paddingRight: 44 }}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 15, padding: 4 }}>
                        <i className={showPassword ? 'fi-rs-eye-crossed' : 'fi-rs-eye'}></i>
                      </button>
                    </div>
                  </div>

                  <div className="vp-form-group">
                    <label className="vp-form-label">Confirm Password</label>
                    <input
                      type="password"
                      className={`vp-input ${confirmPassword && password !== confirmPassword ? 'error' : ''}`}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                    />
                    {confirmPassword && password !== confirmPassword && (
                      <p style={{ color: '#e74c3c', fontSize: 12, marginTop: 4 }}>Passwords do not match</p>
                    )}
                  </div>

                  <button type="submit" className="vp-btn vp-btn-primary vp-btn-full vp-btn-lg" disabled={isLoading}>
                    {isLoading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </form>
              </>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 16, background: '#e8f5ef',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px', fontSize: 28
                }}>&#x2705;</div>
                <h1 style={{ fontSize: '1.6rem' }}>Password reset!</h1>
                <p style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
                  Your password has been successfully reset. You can now sign in with your new password.
                </p>
                <Link href="/vendor/login" className="vp-btn vp-btn-primary vp-btn-lg">
                  Sign in to your account
                </Link>
              </div>
            )}

            <div style={{ textAlign: 'center', marginTop: 28 }}>
              <Link href="/vendor/login" style={{ fontSize: 13, color: '#9ca3af', textDecoration: 'none', fontWeight: 500 }}>
                <i className="fi-rs-arrow-left" style={{ marginRight: 6, fontSize: 11 }}></i>
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function VendorResetPassword() {
  return (
    <VendorAuthProvider>
      <ResetPasswordForm />
    </VendorAuthProvider>
  );
}
