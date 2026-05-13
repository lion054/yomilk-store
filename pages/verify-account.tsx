import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import Layout from "../components/layout/Layout";
import { useAuth } from "../contexts/AuthContext";
import apiClient from "../config/api";
import { logger } from "../lib/logger";

const VerifyEmail = () => {
    const router = useRouter();
    const { user } = useAuth();
    const emailFromQuery = router.query['email'];
    const userEmail = emailFromQuery || user?.userCode || (user as any)?.email || "";
    const resendIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Clean up timers on unmount
    useEffect(() => {
        return () => {
            if (resendIntervalRef.current) clearInterval(resendIntervalRef.current);
            if (redirectTimeoutRef.current) clearTimeout(redirectTimeoutRef.current);
        };
    }, []);

    const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [resendCount, setResendCount] = useState(0);
    const [resendTimer, setResendTimer] = useState(0);

    const handleCodeChange = (index: any, value: any) => {
        if (value.length > 1) {
            value = value.slice(-1);
        }

        if (!/^[0-9]*$/.test(value) && value !== "") {
            return;
        }

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // Auto-focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`code-input-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleKeyDown = (index: any, e: any) => {
        if (e.key === "Backspace" && !code[index] && index > 0) {
            const prevInput = document.getElementById(`code-input-${index - 1}`);
            prevInput?.focus();
        }
    };

    const handleVerify = async (e: any) => {
        e.preventDefault();

        const verificationCode = code.join("");
        if (verificationCode.length !== 6) {
            toast.error("Please enter all 6 digits");
            return;
        }

        setIsVerifying(true);

        try {
            logger.debug('Verifying with code:', { email: userEmail, code: verificationCode });
            const response = await ( apiClient as any).post('VerifyEmail', {
                email: userEmail,
                code: verificationCode,
            });

            logger.debug('Verification response:', response);

            if (response && !response.error) {
                setIsVerified(true);
                toast.success("Email verified successfully!");
                // Redirect after a delay
                redirectTimeoutRef.current = setTimeout(() => {
                    router.push("/login");
                }, 2000);
            } else {
                const errorMsg = response?.message || response?.Message || "Invalid verification code. Please try again.";
                toast.error(errorMsg);
                setCode(["", "", "", "", "", ""]);
            }
        } catch (error: any) {
            logger.error('Verification error:', error);
            const errorMsg = error?.response?.data?.message || error?.message || "Verification failed. Please try again.";
            toast.error(errorMsg);
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResendCode = async () => {
        try {
            await ( apiClient as any).post('ResendVerificationCode', { email: userEmail });
        } catch (err) {
            // Continue with timer even if API fails
        }
        setResendCount(resendCount + 1);
        setResendTimer(60);
        toast.success("Verification code sent to your email");

        // Countdown timer (clean up previous if running)
        if (resendIntervalRef.current) clearInterval(resendIntervalRef.current);
        resendIntervalRef.current = setInterval(() => {
            setResendTimer((prev) => {
                if (prev <= 1) {
                    if (resendIntervalRef.current) clearInterval(resendIntervalRef.current);
                    resendIntervalRef.current = null;
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    return (
        <>
            <Layout parent="Pages" sub="Security" subChild="Verify Email">
                <section className="page-content pt-150 pb-150">
                    <div className="container">
                        <div className="row">
                            <div className="col-xl-8 col-lg-10 col-md-12 m-auto">
                                <div className="row">
                                    {/* Left Column - Illustration */}
                                    <div className="col-lg-6 d-none d-lg-block">
                                        <div className="sf-auth-illustration">
                                            <div className="sf-auth-illustration__inner">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#1a5c38" strokeWidth="1.5">
                                                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                                                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                                                </svg>
                                                <h3 className="sf-auth-illustration__title">Email Verification</h3>
                                                <p className="sf-auth-illustration__text">
                                                    Check your email for a verification code. Enter the 6-digit code to complete your account setup and start shopping.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column - Form */}
                                    <div className="col-lg-6">
                                        {!isVerified ? (
                                            <div className="sf-auth-card">
                                                <div className="sf-card__body--lg">
                                                    <div className="heading_s1">
                                                        <h1 className="sf-card__title">Verify Your Email Address</h1>
                                                        <p>
                                                            We've sent a verification code to <br />
                                                            <strong className="sf-text-dark">{userEmail || "your email"}</strong>
                                                        </p>
                                                    </div>

                                                    <form onSubmit={handleVerify}>
                                                        <p style={{ textAlign: "center", color: "#666", fontSize: "14px", marginBottom: "24px" }}>
                                                            Enter the 6-digit verification code below:
                                                        </p>

                                                        <div style={{
                                                            marginBottom: "30px",
                                                            display: "flex",
                                                            gap: "10px",
                                                            justifyContent: "center"
                                                        }}>
                                                            {code.map((digit, index) => (
                                                                <input
                                                                    key={index}
                                                                    id={`code-input-${index}`}
                                                                    type="text"
                                                                    maxLength={1}
                                                                    value={digit}
                                                                    onChange={(e: any) => handleCodeChange(index, e.target.value)}
                                                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                                                    className="sf-input"
                                                                    style={{
                                                                        width: "50px",
                                                                        height: "50px",
                                                                        fontSize: "24px",
                                                                        fontWeight: "700",
                                                                        textAlign: "center",
                                                                        padding: "0"
                                                                    }}
                                                                    placeholder="0"
                                                                />
                                                            ))}
                                                        </div>

                                                        <div className="sf-form-group">
                                                            <button
                                                                type="submit"
                                                                disabled={isVerifying}
                                                                className="sf-btn sf-btn--green sf-btn--lg sf-btn--full"
                                                            >
                                                                {isVerifying ? "Verifying..." : "Verify Email"}
                                                            </button>
                                                        </div>

                                                        <div style={{ textAlign: "center", marginTop: "24px" }}>
                                                            <p className="sf-text-muted" style={{ fontSize: "13px", marginBottom: "12px" }}>
                                                                Didn't receive the verification code?
                                                            </p>
                                                            <button
                                                                type="button"
                                                                onClick={handleResendCode}
                                                                disabled={resendTimer > 0}
                                                                className="sf-btn sf-btn--link-green"
                                                                style={{ fontSize: "14px" }}
                                                            >
                                                                {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Verification Code"}
                                                            </button>
                                                        </div>
                                                    </form>

                                                    <div className="sf-divider" style={{ textAlign: "center", marginTop: "24px" }}>
                                                        <p className="sf-text-muted sf-mb-0" style={{ fontSize: "13px" }}>
                                                            Wrong email? <Link href="/register" className="sf-link">Create New Account</Link>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="sf-auth-card">
                                                <div className="sf-card__body--lg" style={{ textAlign: "center" }}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#1a5c38" strokeWidth="2">
                                                        <polyline points="20 6 9 17 4 12"/>
                                                    </svg>
                                                    <h2 className="sf-card__title" style={{ marginTop: "20px" }}>
                                                        Email Verified Successfully!
                                                    </h2>
                                                    <p className="sf-auth-illustration__text" style={{ marginTop: "15px" }}>
                                                        Your email address has been verified. You can now log in and start shopping with Snappy Fresh.
                                                    </p>

                                                    <div style={{
                                                        display: "flex",
                                                        gap: "10px",
                                                        justifyContent: "center",
                                                        marginTop: "30px"
                                                    }}>
                                                        <Link href="/login">
                                                            <button className="sf-btn sf-btn--green sf-btn--lg">
                                                                Go to Login
                                                            </button>
                                                        </Link>
                                                        <Link href="/">
                                                            <button className="sf-btn sf-btn--outline-gray sf-btn--lg">
                                                                Continue Shopping
                                                            </button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </Layout>
        </>
    );
};

export default VerifyEmail;
