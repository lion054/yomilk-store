import Link from "next/link";
import Layout from "../components/layout/Layout";

function Error500() {
    return (
        <>
            <Layout parent="Pages" sub="Server Error">
                <div className="sf-error-page">
                    <div className="sf-error-page__code">500</div>
                    <h1 className="sf-error-page__title">Server error</h1>
                    <p className="sf-error-page__text">
                        Something went wrong on our end.<br />
                        Our team has been notified and is working to fix it.
                    </p>

                    <div className="sf-error-page__actions">
                        <button onClick={() => window.location.reload()} className="sf-btn sf-btn--green sf-btn--lg">
                            <i className="fi-rs-refresh"></i> Try Again
                        </button>
                        <Link href="/" className="sf-btn sf-btn--outline-gray sf-btn--lg">
                            <i className="fi-rs-home"></i> Back to Home
                        </Link>
                    </div>
                </div>
            </Layout>
        </>
    );
}

export default Error500;
