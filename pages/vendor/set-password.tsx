import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { toast } from 'react-toastify';
import apiClient from '../../config/api';

export default function VendorSetPassword() {
  const router = useRouter();
  const { token, email } = router.query;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!token || !email) {
      toast.error('Invalid link. Please check your email for the correct link.');
      return;
    }
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (password !== confirmPassword) { toast.error('Passwords do not match'); return; }

    setIsLoading(true);
    try {
      await ( apiClient as any).setPassword({
        token: String(token),
        email: String(email),
        newPassword: password,
        confirmNewPassword: confirmPassword,
      });
      setIsComplete(true);
      toast.success('Password set successfully!');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to set password. The link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Set Password - Vendor Portal | Snappy Fresh</title>
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
          <h2>Welcome to<br /><em>Snappy Fresh.</em></h2>
          <p className="vp-login-left-sub">
            You've been invited to join as a vendor. Set your password to activate your account and start selling.
          </p>

          <div className="vp-login-features">
            {[
              { icon: '1&#xFE0F;&#x20E3;', text: 'Create a secure password below' },
              { icon: '2&#xFE0F;&#x20E3;', text: 'Sign in to your new vendor account' },
              { icon: '3&#xFE0F;&#x20E3;', text: 'Upload your products and start selling' },
            ].map((f, i) => (
              <div key={i} className="vp-login-feature">
                <div className="vp-login-feature-icon" dangerouslySetInnerHTML={{ __html: f.icon }} />
                <span className="vp-login-feature-text">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="vp-login-right">
          <div className="vp-login-form-box">
            {!isComplete ? (
              <>
                <div className="vp-login-eyebrow">Account Setup</div>
                <h1>Set your<br />password</h1>
                {email && (
                  <p style={{ marginBottom: 24 }}>
                    Setting password for <strong style={{ color: '#1a1a2e' }}>{email}</strong>
                  </p>
                )}

                {!token || !email ? (
                  <div style={{
                    background: '#fde8e8', border: '1px solid #fecaca', borderRadius: 12,
                    padding: '16px 20px', fontSize: 14, color: '#991b1b', marginBottom: 20
                  }}>
                    <strong>Invalid link.</strong> This page requires a valid invitation token and email address.
                    Please check the link in your invitation email.
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} noValidate>
                    <div className="vp-form-group">
                      <label className="vp-form-label">New Password</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className="vp-input"
                          placeholder="At least 8 characters"
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
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isLoading}
                      />
                      {confirmPassword && password !== confirmPassword && (
                        <p style={{ color: '#e74c3c', fontSize: 12, marginTop: 4 }}>Passwords do not match</p>
                      )}
                    </div>

                    <button type="submit" className="vp-btn vp-btn-primary vp-btn-full vp-btn-lg" disabled={isLoading}>
                      {isLoading ? 'Setting Password...' : 'Set Password & Activate'}
                    </button>
                  </form>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 16, background: '#e8f5ef',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px', fontSize: 28
                }}>&#x2705;</div>
                <h1 style={{ fontSize: '1.6rem' }}>Account activated!</h1>
                <p style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
                  Your password has been set and your vendor account is now active.
                  You can sign in and start managing your products.
                </p>
                <Link href="/vendor/login" className="vp-btn vp-btn-primary vp-btn-lg">
                  Sign in to your account
                </Link>
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
