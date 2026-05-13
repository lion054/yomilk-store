import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
    return (
        <Html lang="en" data-scroll-behavior="smooth">
            <Head>
                {/* Theme color for mobile browsers */}
                <meta name="theme-color" content="#1a5c38" />
                {/* PWA manifest */}
                <link rel="manifest" href="/manifest.webmanifest" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                <meta name="apple-mobile-web-app-title" content="Snappy Fresh" />
                <link rel="apple-touch-icon" href="/assets/imgs/theme/favicon.svg" />
                {/* Preconnect to critical origins */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link rel="preconnect" href="https://yomilk.erpona.com:8092" />
                <link rel="preconnect" href="https://yomilk.erpona.com:3330" />
                {/* Preload primary font for faster text rendering */}
                <link
                    rel="preload"
                    as="style"
                    href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
                />
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
                />
                {/* Print stylesheet */}
                <link rel="stylesheet" href="/assets/css/print.css" media="print" />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
