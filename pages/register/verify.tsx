import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import Layout from "../../components/layout/Layout";
import apiClient from "../../config/api";
import { logger } from "../../lib/logger";

const RegisterVerify = () => {
    const router = useRouter();
    const { email, token } = router.query;

    const [isLoading, setIsLoading] = useState(true);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // If only email is present (no token), show "check your email" screen
    const isWaitingForEmail = !!email && !token;

    useEffect(() => {
        if (!router.isReady) return;

        // User just registered — show "check your email" message
        if (email && !token) {
            setIsLoading(false);
            return;
        }

        // No email and no token — invalid link
        if (!email || !token) {
            setIsLoading(false);
            setIsError(true);
            setErrorMessage("Invalid verification link. Missing email or token.");
            return;
        }

        // Both email and token present — verify
        verifyEmail(email, token);
    }, [router.isReady, email, token]);

    const verifyEmail = async (email: any, token: any) => {
        setIsLoading(true);
        try {
            logger.debug('Verifying email:', { email, token });

            // Use direct API call instead of method
            const response = await ( apiClient as any).get('ExternalUsers/Verify', { email, token });
            logger.debug('Verification response:', response);

            if (response && !response.error) {
                setIsSuccess(true);
                toast.success("Your email has been verified successfully!");
                setTimeout(() => {
                    router.push("/login");
                }, 5000);
            } else {
                setIsError(true);
                const errorMsg = response?.message || response?.Message || "Verification failed. Please try again.";
                setErrorMessage(errorMsg);
                toast.error(errorMsg);
            }
        } catch (error: any) {
            logger.error('Verification error:', error);
            setIsError(true);
            const errorMsg = error?.message || error?.response?.data?.message || "An error occurred during verification. Please try again.";
            setErrorMessage(errorMsg);
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Layout parent="Pages" sub="Security" subChild="Verify Email">
            <section className="page-content pt-150 pb-150">
                <div className="container">
                    <div className="row">
                        <div className="col-xl-6 col-lg-8 col-md-10 m-auto">
                            <div className="sf-auth-card">
                                <div className="sf-card__body--lg" style={{ textAlign: "center" }}>

                                    {isWaitingForEmail && !isLoading && !isSuccess && !isError && (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#1a5c38" strokeWidth="1.5">
                                                <rect x="2" y="4" width="20" height="16" rx="2" />
                                                <path d="M22 4L12 13L2 4" />
                                            </svg>
                                            <h2 className="sf-card__title" style={{ marginTop: "20px" }}>
                                                Check Your Email
                                            </h2>
                                            <p className="sf-auth-illustration__text" style={{ marginTop: "15px", maxWidth: 400, margin: '15px auto 0' }}>
                                                We've sent a verification link to <strong>{email}</strong>. Please check your inbox and click the link to verify your account.
                                            </p>
                                            <p style={{ marginTop: 12, fontSize: 13, color: '#888' }}>
                                                Didn't receive it? Check your spam folder or try registering again.
                                            </p>
                                            <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "30px" }}>
                                                <Link href="/register">
                                                    <button type="button" className="sf-btn sf-btn--outline-gray sf-btn--lg">Register Again</button>
                                                </Link>
                                                <Link href="/login">
                                                    <button type="button" className="sf-btn sf-btn--green sf-btn--lg">Go to Login</button>
                                                </Link>
                                            </div>
                                        </>
                                    )}

                                    {isLoading && (
                                        <>
                                            <div style={{ margin: "30px 0" }}>
                                                <div className="spinner-border" role="status" style={{ width: "3rem", height: "3rem", color: "#1a5c38" }}>
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                            </div>
                                            <h2 className="sf-card__title">Verifying Your Email</h2>
                                            <p className="sf-auth-illustration__text" style={{ marginTop: "15px" }}>
                                                Please wait while we verify your email address...
                                            </p>
                                        </>
                                    )}

                                    {isSuccess && (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#1a5c38" strokeWidth="2">
                                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                                <polyline points="22 4 12 14.01 9 11.01"/>
                                            </svg>
                                            <h2 className="sf-card__title" style={{ marginTop: "20px" }}>
                                                Email Verified Successfully!
                                            </h2>
                                            <p className="sf-auth-illustration__text" style={{ marginTop: "15px" }}>
                                                Your account has been verified. You will be redirected to the login page in 5 seconds.
                                            </p>
                                            <div style={{ marginTop: "30px" }}>
                                                <Link href="/login">
                                                    <button className="sf-btn sf-btn--green sf-btn--lg">
                                                        Go to Login
                                                    </button>
                                                </Link>
                                            </div>
                                        </>
                                    )}

                                    {isError && (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" strokeWidth="2">
                                                <circle cx="12" cy="12" r="10"/>
                                                <line x1="15" y1="9" x2="9" y2="15"/>
                                                <line x1="9" y1="9" x2="15" y2="15"/>
                                            </svg>
                                            <h2 className="sf-card__title" style={{ marginTop: "20px" }}>
                                                Verification Failed
                                            </h2>
                                            <p className="sf-auth-illustration__text" style={{ marginTop: "15px" }}>
                                                {errorMessage}
                                            </p>
                                            <div style={{
                                                display: "flex",
                                                gap: "10px",
                                                justifyContent: "center",
                                                marginTop: "30px"
                                            }}>
                                                <Link href="/register">
                                                    <button className="sf-btn sf-btn--outline-gray sf-btn--lg">
                                                        Register Again
                                                    </button>
                                                </Link>
                                                <Link href="/login">
                                                    <button className="sf-btn sf-btn--green sf-btn--lg">
                                                        Go to Login
                                                    </button>
                                                </Link>
                                            </div>
                                        </>
                                    )}

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default RegisterVerify;
