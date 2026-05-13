import Link from "next/link";
import Layout from "../components/layout/Layout";
import SEO from "../components/common/SEO";
import { pageSeoConfig } from "../config/seo";

function Terms() {
    const termsSeoConfig = pageSeoConfig['/terms'];

    return (
        <>
            <SEO {...termsSeoConfig} />
            <Layout noBreadcrumb="d-none">
                <style jsx>{`
                    .legal-page {
                        max-width: 720px;
                        margin: 0 auto;
                        padding: 48px 20px 80px;
                    }
                    .legal-header {
                        margin-bottom: 40px;
                        padding-bottom: 24px;
                        border-bottom: 2px solid #eef2ee;
                    }
                    .legal-header h1 {
                        font-size: 32px;
                        font-weight: 800;
                        color: #1a1a2e;
                        margin: 0 0 8px;
                    }
                    .legal-meta {
                        font-size: 13px;
                        color: #888;
                    }
                    .legal-body h2 {
                        font-size: 20px;
                        font-weight: 700;
                        color: #1a1a2e;
                        margin: 36px 0 12px;
                    }
                    .legal-body p {
                        font-size: 15px;
                        line-height: 1.75;
                        color: #444;
                        margin: 0 0 16px;
                    }
                    .legal-body ol, .legal-body ul {
                        font-size: 15px;
                        line-height: 1.75;
                        color: #444;
                        padding-left: 24px;
                        margin: 0 0 16px;
                    }
                    .legal-body li {
                        margin-bottom: 8px;
                    }
                    .legal-body a {
                        color: #42af57;
                        text-decoration: underline;
                    }
                    .legal-back {
                        display: inline-flex;
                        align-items: center;
                        gap: 6px;
                        font-size: 13px;
                        font-weight: 600;
                        color: #42af57;
                        text-decoration: none;
                        margin-bottom: 24px;
                    }
                    .legal-back:hover { text-decoration: underline; }
                    @media(max-width: 768px) {
                        .legal-page { padding: 32px 16px 60px; }
                        .legal-header h1 { font-size: 24px; }
                        .legal-body h2 { font-size: 17px; margin: 28px 0 10px; }
                        .legal-body p, .legal-body ol, .legal-body ul { font-size: 14px; }
                    }
                `}</style>

                <div className="legal-page">
                    <Link href="/" className="legal-back">
                        <i className="fi-rs-arrow-left" style={{ fontSize: 11 }}></i> Back to Home
                    </Link>

                    <div className="legal-header">
                        <h1>Terms of Service</h1>
                        <div className="legal-meta">Last updated: 9 April 2026</div>
                    </div>

                    <div className="legal-body">
                        <p>Please read these Terms of Service (&ldquo;Terms&rdquo;) carefully before using the snappyfresh.net website (the &ldquo;Service&rdquo;) operated by Snappy Fresh, trading as Yomilk (&ldquo;us&rdquo;, &ldquo;we&rdquo;, or &ldquo;our&rdquo;).</p>
                        <p>Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users and others who access or use the Service.</p>
                        <p>By accessing or using the Service you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service.</p>

                        <h2>Rights &amp; Restrictions</h2>
                        <ol>
                            <li>Members must be at least 18 years of age.</li>
                            <li>Members are granted a time-limited, non-exclusive, revocable, nontransferable, and non-sublicensable right to access that portion of the online course corresponding to the purchase.</li>
                            <li>The portion of the online course corresponding to the purchase will be available to the Member as long as the course is maintained by the Company, which will be a minimum of one year after Member&rsquo;s purchase.</li>
                            <li>The videos in the course are provided as a video stream and are not downloadable.</li>
                            <li>By agreeing to grant such access, the Company does not obligate itself to maintain the course, or to maintain it in its present form.</li>
                        </ol>

                        <h2>Links to Other Web Sites</h2>
                        <p>Our Service may contain links to third-party web sites or services that are not owned or controlled by Snappy Fresh.</p>
                        <p>Snappy Fresh has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third party web sites or services. You further acknowledge and agree that Snappy Fresh shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with use of or reliance on any such content, goods or services available on or through any such web sites or services.</p>
                        <p>We strongly advise you to read the terms and conditions and privacy policies of any third-party web sites or services that you visit.</p>

                        <h2>Termination</h2>
                        <p>We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
                        <p>All provisions of the Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity and limitations of liability.</p>

                        <h2>Governing Law</h2>
                        <p>These Terms shall be governed and construed in accordance with the laws of Zimbabwe, without regard to its conflict of law provisions.</p>
                        <p>Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect. These Terms constitute the entire agreement between us regarding our Service, and supersede and replace any prior agreements we might have between us regarding the Service.</p>

                        <h2>Changes</h2>
                        <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>
                        <p>By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, please stop using the Service.</p>

                        <h2>Contact Us</h2>
                        <p>
                            If you have any questions about these Terms, please <Link href="/contact-us">contact us</Link>.
                        </p>
                    </div>
                </div>
            </Layout>
        </>
    );
}

export default Terms;
