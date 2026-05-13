import Link from "next/link";
import Layout from "../components/layout/Layout";

const errorConfig = {
    400: {
        title: "Bad Request",
        description: "The server couldn't understand your request. Please check and try again.",
    },
    401: {
        title: "Unauthorised",
        description: "You need to sign in to access this page.",
    },
    403: {
        title: "Access Denied",
        description: "You don't have permission to view this page.",
    },
    408: {
        title: "Request Timeout",
        description: "The server took too long to respond. Please try again.",
    },
    419: {
        title: "Session Expired",
        description: "Your session has expired. Please sign in again to continue.",
    },
    429: {
        title: "Too Many Requests",
        description: "You've made too many requests. Please wait a moment and try again.",
    },
    500: {
        title: "Server Error",
        description: "Something went wrong on our end. Our team has been notified.",
    },
    502: {
        title: "Bad Gateway",
        description: "Our server received an invalid response. Please try again shortly.",
    },
    503: {
        title: "Service Unavailable",
        description: "We're temporarily down for maintenance. We'll be back shortly!",
    },
};

const defaultError = {
    title: "Something Went Wrong",
    description: "An unexpected error occurred. Please try again.",
};

function ErrorPage({ statusCode }: any) {
    const config = (errorConfig as any)[statusCode] || defaultError;
    const code = statusCode || "Error";

    return (
        <>
            <Layout parent="Pages" sub={`${code} ${config.title}`}>
                <div className="sf-error-page">
                    <div className="sf-error-page__code">{code}</div>
                    <h1 className="sf-error-page__title">{config.title}</h1>
                    <p className="sf-error-page__text">{config.description}</p>

                    <div className="sf-error-page__actions">
                        <button
                            onClick={() => window.location.reload()}
                            className="sf-btn sf-btn--green sf-btn--lg"
                        >
                            <i className="fi-rs-refresh"></i>
                            Try Again
                        </button>
                        <Link href="/" className="sf-btn sf-btn--outline-gray sf-btn--lg">
                            <i className="fi-rs-home"></i>
                            Back to Home
                        </Link>
                    </div>
                </div>
            </Layout>
        </>
    );
}

ErrorPage.getInitialProps = ({ res, err }: any) => {
    const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
    return { statusCode };
};

export default ErrorPage;
