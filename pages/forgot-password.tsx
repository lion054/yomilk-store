import Link from "next/link";
import { useState, useRef } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import Layout from "../components/layout/Layout";
import { useAuth } from '../contexts/AuthContext';
import { useFormValidation } from '../hooks/useFormValidation';
import { resetPasswordSchema } from '../lib/validation';
import InlineFieldError from '../components/common/InlineFieldError';
import PasswordChecklist from '../components/common/PasswordChecklist';

const MAX_OTP_ATTEMPTS = 3;

const ForgotPassword = () => {
    const [step, setStep] = useState<1 | 2>(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState("");
    const [attemptsLeft, setAttemptsLeft] = useState(MAX_OTP_ATTEMPTS);
    const otpInputRef = useRef<HTMLInputElement>(null);
    const { forgotPassword, resetPassword } = useAuth();
    const router = useRouter();
    const { fieldErrors, validateField, clearFieldError } = useFormValidation(resetPasswordSchema);

    const clearError = () => setApiError("");

    // Step 1: Request OTP
    const handleRequestOtp = async (e: any) => {
        e.preventDefault();
        clearError();

        if (!email || email.trim() === "") {
            setApiError("Please enter your email address");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setApiError("Please enter a valid email address");
            return;
        }

        setIsLoading(true);
        const result = await forgotPassword(email);

        if (result.success) {
            setStep(2);
            setAttemptsLeft(MAX_OTP_ATTEMPTS);
            toast.success("OTP sent to your email");
            setTimeout(() => otpInputRef.current?.focus(), 100);
        } else {
            const msg = result.error || "Failed to send OTP. Please try again.";
            setApiError(msg);
            toast.error(msg);
        }

        setIsLoading(false);
    };

    // Step 2: Reset password with OTP
    const handleResetPassword = async (e: any) => {
        e.preventDefault();
        clearError();

        if (!otp || otp.length < 4) {
            setApiError("Please enter the OTP sent to your email");
            return;
        }

        if (!newPassword) {
            setApiError("Please enter a new password");
            return;
        }

        if (newPassword !== confirmPassword) {
            setApiError("Passwords do not match");
            return;
        }

        setIsLoading(true);
        const result = await resetPassword(email, otp, newPassword, confirmPassword);

        if (result.success) {
            toast.success("Password reset successful! Please log in with your new password.");
            router.push("/login");
        } else {
            const msg = result.error || "Password reset failed. Please try again.";
            const remaining = attemptsLeft - 1;
            setAttemptsLeft(remaining);

            if (remaining <= 0 || msg.toLowerCase().includes("too many attempts")) {
                setApiError("Too many attempts. Please request a new OTP.");
                toast.error("Too many attempts. Please request a new OTP.");
                // Reset to step 1
                setTimeout(() => {
                    setStep(1);
                    setOtp("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setAttemptsLeft(MAX_OTP_ATTEMPTS);
                    setApiError("");
                }, 2000);
            } else {
                setApiError(`${msg} (${remaining} attempt${remaining !== 1 ? 's' : ''} remaining)`);
                toast.error(msg);
            }
        }

        setIsLoading(false);
    };

    const backToEmail = () => {
        setStep(1);
        setOtp("");
        setNewPassword("");
        setConfirmPassword("");
        setApiError("");
        setAttemptsLeft(MAX_OTP_ATTEMPTS);
    };

    return (
        <>
            <Layout parent="Pages" sub="Security" subChild="Forgot Password">
                <style>{`
                    .fp-section { padding: 60px 0; background: var(--sf-gray-50); min-height: 70vh; }
                    .fp-card {
                        background: #fff; border-radius: 16px; padding: 36px;
                        box-shadow: 0 4px 24px rgba(0,0,0,0.08); border: 1px solid #e5e7eb;
                        max-width: 480px; margin: 0 auto;
                    }
                    .fp-icon { text-align: center; margin-bottom: 20px; }
                    .fp-icon svg { color: #1a5c38; }
                    .fp-title { font-size: 24px; font-weight: 800; color: #111; text-align: center; margin-bottom: 6px; }
                    .fp-sub { font-size: 14px; color: #6b7280; text-align: center; margin-bottom: 24px; line-height: 1.5; }
                    .fp-sub a { color: #1a5c38; font-weight: 700; text-decoration: none; }
                    .fp-sub a:hover { text-decoration: underline; }

                    .fp-field { margin-bottom: 16px; }
                    .fp-label { display: block; font-size: 13px; font-weight: 700; color: #374151; margin-bottom: 6px; }
                    .fp-label .req { color: #e74c3c; }
                    .fp-input {
                        width: 100%; padding: 12px 14px; border: 2px solid #e0e6e2; border-radius: 10px;
                        font-size: 15px; font-family: inherit; background: #fafbfa; transition: all 0.2s;
                    }
                    .fp-input:focus { border-color: #1a5c38; outline: none; box-shadow: 0 0 0 3px rgba(26,92,56,0.1); background: #fff; }
                    .fp-input.has-error { border-color: #e74c3c; box-shadow: 0 0 0 3px rgba(231,76,60,0.1); }
                    .fp-input::placeholder { color: #b0bab0; }

                    .fp-pw-wrap { position: relative; }
                    .fp-pw-wrap input { padding-right: 48px; }
                    .fp-pw-toggle {
                        position: absolute; right: 4px; top: 50%; transform: translateY(-50%);
                        background: none; border: none; cursor: pointer; padding: 8px;
                        color: #6b7c74; font-size: 16px; border-radius: 6px;
                    }
                    .fp-pw-toggle:hover { background: rgba(26,92,56,0.1); color: #1a5c38; }

                    .fp-error-banner {
                        background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px;
                        padding: 12px 14px; margin-bottom: 16px; font-size: 13px; color: #991b1b;
                        display: flex; align-items: flex-start; gap: 8px; line-height: 1.5;
                    }
                    .fp-error-banner i { flex-shrink: 0; margin-top: 2px; }

                    .fp-info-banner {
                        background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px;
                        padding: 12px 14px; margin-bottom: 16px; font-size: 13px; color: #166534; line-height: 1.5;
                    }

                    .fp-btn {
                        width: 100%; padding: 14px; border: none; border-radius: 12px;
                        font-size: 15px; font-weight: 700; cursor: pointer; font-family: inherit;
                        transition: all 0.2s; min-height: 48px;
                    }
                    .fp-btn--primary {
                        background: linear-gradient(135deg, #1a5c38 0%, #0d3d22 100%); color: #fff;
                        box-shadow: 0 4px 15px rgba(26,92,56,0.25);
                    }
                    .fp-btn--primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(26,92,56,0.3); }
                    .fp-btn--primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
                    .fp-btn--outline {
                        background: #fff; color: #374151; border: 2px solid #e5e7eb;
                    }
                    .fp-btn--outline:hover { border-color: #1a5c38; color: #1a5c38; }

                    .fp-actions { display: flex; gap: 10px; margin-top: 20px; }
                    .fp-actions .fp-btn { flex: 1; }

                    .fp-email-badge {
                        display: inline-flex; align-items: center; gap: 6px;
                        background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px;
                        padding: 6px 12px; font-size: 13px; color: #166534; font-weight: 600;
                        margin-bottom: 20px;
                    }

                    .fp-step-badge {
                        display: inline-flex; align-items: center; gap: 6px;
                        background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px;
                        padding: 4px 10px; font-size: 11px; color: #1e40af; font-weight: 700;
                        text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px;
                    }

                    @media (max-width: 640px) {
                        .fp-section { padding: 20px 0; }
                        .fp-card { padding: 24px 18px; margin: 0 12px; border-radius: 14px; }
                        .fp-title { font-size: 20px; }
                        .fp-sub { font-size: 13px; }
                        .fp-actions { flex-direction: column; }
                    }
                `}</style>

                <section className="fp-section">
                    <div className="container">
                        <div className="fp-card">

                            {/* Step 1: Enter Email */}
                            {step === 1 && (
                                <>
                                    <div className="fp-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#1a5c38" strokeWidth="1.5">
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                        </svg>
                                    </div>
                                    <h1 className="fp-title">Forgot Password?</h1>
                                    <p className="fp-sub">
                                        Enter your email and we'll send you a one-time code to reset your password.
                                        <br />Remember your password? <Link href="/login">Sign In</Link>
                                    </p>

                                    {apiError && (
                                        <div className="fp-error-banner">
                                            <i className="fi-rs-exclamation"></i>
                                            <span>{apiError}</span>
                                        </div>
                                    )}

                                    <form onSubmit={handleRequestOtp}>
                                        <div className="fp-field">
                                            <label className="fp-label">Email Address <span className="req">*</span></label>
                                            <input
                                                type="email"
                                                className={`fp-input ${apiError ? 'has-error' : ''}`}
                                                placeholder="you@example.com"
                                                value={email}
                                                onChange={(e) => { setEmail(e.target.value); clearError(); }}
                                                disabled={isLoading}
                                                autoFocus
                                                autoComplete="email"
                                            />
                                        </div>

                                        <button type="submit" className="fp-btn fp-btn--primary" disabled={isLoading}>
                                            {isLoading ? "Sending OTP..." : "Send OTP"}
                                        </button>
                                    </form>
                                </>
                            )}

                            {/* Step 2: Enter OTP + New Password */}
                            {step === 2 && (
                                <>
                                    <div className="fp-step-badge">
                                        <i className="fi-rs-shield-check"></i> Step 2 of 2
                                    </div>
                                    <h1 className="fp-title">Reset Your Password</h1>
                                    <p className="fp-sub">
                                        Enter the OTP sent to your email and choose a new password.
                                    </p>

                                    <div className="fp-email-badge">
                                        <i className="fi-rs-envelope"></i> {email}
                                    </div>

                                    {apiError && (
                                        <div className="fp-error-banner">
                                            <i className="fi-rs-exclamation"></i>
                                            <span>{apiError}</span>
                                        </div>
                                    )}

                                    <form onSubmit={handleResetPassword}>
                                        <div className="fp-field">
                                            <label className="fp-label">OTP Code <span className="req">*</span></label>
                                            <input
                                                ref={otpInputRef}
                                                type="text"
                                                className={`fp-input ${fieldErrors.otp ? 'has-error' : ''}`}
                                                placeholder="Enter the code from your email"
                                                value={otp}
                                                onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); clearError(); clearFieldError('otp'); }}
                                                onBlur={() => validateField('otp', otp)}
                                                inputMode="numeric"
                                                maxLength={6}
                                                autoComplete="one-time-code"
                                                disabled={isLoading}
                                            />
                                            <InlineFieldError error={fieldErrors.otp} />
                                        </div>

                                        <div className="fp-field">
                                            <label className="fp-label">New Password <span className="req">*</span></label>
                                            <div className="fp-pw-wrap">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    className={`fp-input ${fieldErrors.newPassword ? 'has-error' : ''}`}
                                                    placeholder="Create a new password"
                                                    value={newPassword}
                                                    onChange={(e) => { setNewPassword(e.target.value); clearError(); clearFieldError('newPassword'); }}
                                                    onBlur={() => validateField('newPassword', newPassword)}
                                                    autoComplete="new-password"
                                                    disabled={isLoading}
                                                />
                                                <button type="button" className="fp-pw-toggle" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide' : 'Show'}>
                                                    <i className={showPassword ? 'fi-rs-eye-crossed' : 'fi-rs-eye'}></i>
                                                </button>
                                            </div>
                                            <PasswordChecklist password={newPassword} />
                                            <InlineFieldError error={fieldErrors.newPassword} />
                                        </div>

                                        <div className="fp-field">
                                            <label className="fp-label">Confirm Password <span className="req">*</span></label>
                                            <div className="fp-pw-wrap">
                                                <input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    className={`fp-input ${fieldErrors.confirmPassword ? 'has-error' : ''}`}
                                                    placeholder="Confirm your new password"
                                                    value={confirmPassword}
                                                    onChange={(e) => { setConfirmPassword(e.target.value); clearError(); clearFieldError('confirmPassword'); }}
                                                    onBlur={() => validateField('confirmPassword', confirmPassword)}
                                                    autoComplete="new-password"
                                                    disabled={isLoading}
                                                />
                                                <button type="button" className="fp-pw-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)} aria-label={showConfirmPassword ? 'Hide' : 'Show'}>
                                                    <i className={showConfirmPassword ? 'fi-rs-eye-crossed' : 'fi-rs-eye'}></i>
                                                </button>
                                            </div>
                                            <InlineFieldError error={fieldErrors.confirmPassword} />
                                        </div>

                                        <div className="fp-info-banner">
                                            <strong>Tip:</strong> Check your spam/junk folder if you don't see the OTP email in your inbox.
                                        </div>

                                        <div className="fp-actions">
                                            <button type="button" className="fp-btn fp-btn--outline" onClick={backToEmail} disabled={isLoading}>
                                                ← Back
                                            </button>
                                            <button type="submit" className="fp-btn fp-btn--primary" disabled={isLoading}>
                                                {isLoading ? "Resetting..." : "Reset Password"}
                                            </button>
                                        </div>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                </section>
            </Layout>
        </>
    );
};

export default ForgotPassword;
