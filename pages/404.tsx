import Link from "next/link";
import Layout from "../components/layout/Layout";

function Error404() {
    return (
        <>
            <Layout parent="Pages" sub="404 Error">
                <div className="sf-error-page">
                    <div className="sf-error-page__code">404</div>
                    <h1 className="sf-error-page__title">Page not found</h1>
                    <p className="sf-error-page__text">
                        The page you're looking for seems to have wandered off.<br />
                        Don't worry — let's get you back on track.
                    </p>

                    <div className="sf-error-page__actions">
                        <Link href="/" className="sf-btn sf-btn--green sf-btn--lg">
                            <i className="fi-rs-home"></i> Back to Home
                        </Link>
                        <Link href="/store" className="sf-btn sf-btn--outline-gray sf-btn--lg">
                            <i className="fi-rs-shopping-bag"></i> Browse Shop
                        </Link>
                    </div>
                </div>
            </Layout>
        </>
    );
}

export default Error404;
