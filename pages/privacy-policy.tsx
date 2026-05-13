import Link from "next/link";
import Layout from "../components/layout/Layout";
import SEO from "../components/common/SEO";
import { pageSeoConfig } from "../config/seo";

function PrivacyPolicy() {
    const privacySeoConfig = pageSeoConfig['/privacy-policy'];

    return (
        <>
            <SEO {...privacySeoConfig} />
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
                        <h1>Privacy Policy</h1>
                        <div className="legal-meta">Last updated: 9 April 2026</div>
                    </div>

                    <div className="legal-body">
                        <h2>Welcome to Snappy Fresh&rsquo;s Privacy Policy</h2>
                        <ol>
                            <li>Hi there, we&rsquo;re Snappy Fresh (trading as Yomilk) of Harare, Zimbabwe (&ldquo;<strong>Snappy Fresh</strong>&rdquo;) and welcome to our privacy policy. This policy sets out how we handle your personal information if you&rsquo;re a Snappy Fresh user or visitor to our website snappyfresh.net (the &ldquo;<strong>Site</strong>&rdquo;).</li>
                            <li>When we say &lsquo;we&rsquo;, &lsquo;us&rsquo; or &lsquo;Snappy Fresh&rsquo; it&rsquo;s because that&rsquo;s who we are and we own and run the Site.</li>
                            <li>If we say &lsquo;policy&rsquo; we&rsquo;re talking about this privacy policy. If we say &lsquo;user terms&rsquo; we&rsquo;re talking about the rules for using the Site.</li>
                        </ol>

                        <h2>The Type of Personal Information We Collect</h2>
                        <ol start={4}>
                            <li>We collect certain personal information about visitors and users of our Site.</li>
                            <li>The most common types of information we collect include things like: user-names, member names, email addresses, IP addresses, other contact details, survey responses, payment information such as payment agent details, transactional details, tax information, support queries, content you direct us to make available on our Site (such as item descriptions), your actions on our Site (including any selections or inputs into items) and web and email analytics data.</li>
                        </ol>

                        <h2>How We Collect Personal Information</h2>
                        <ol start={6}>
                            <li>We collect personal information directly when you provide it to us, automatically as you navigate through the Site, or through other people when you use services associated with the Site.</li>
                            <li>We collect your personal information when you provide it to us when you complete membership registration and buy items or services on our Site, subscribe to a newsletter, email list, submit feedback, enter a contest, fill out a survey, or send us a communication.</li>
                            <li>As the operator of a digital marketplace, we have a legitimate interest in verifying the identity of our users. We believe that knowing who our users are will strengthen the integrity of our marketplace by reducing fraud, making users more accountable for their content and giving Snappy Fresh and customers the ability to enforce contracts for users who break the rules.</li>
                        </ol>

                        <h2>Personal Information We Collect About You from Others</h2>
                        <ol start={9}>
                            <li>
                                Although we generally collect personal information directly from you, on occasion, we also collect certain categories of personal information about you from other sources. In particular:
                                <ol>
                                    <li>financial and/or transaction details from payment providers in order to process a transaction;</li>
                                    <li>third party service providers (like Google, Facebook) which may provide information about you when you link, connect, or login to your account with the third party provider and they send us information such as your registration and profile from that service;</li>
                                    <li>other third party sources and/or partners, whereby we receive additional information about you (to the extent permitted by applicable law), such as demographic data or fraud detection information, and combine it with information we have about you.</li>
                                </ol>
                            </li>
                        </ol>

                        <h2>How We Use Personal Information</h2>
                        <ol start={10}>
                            <li>
                                We will use your personal information:
                                <ol>
                                    <li>To fulfil a contract, or take steps linked to a contract: in particular, in facilitating and processing transactions that take place on the Site.</li>
                                    <li>
                                        Where this is necessary for purposes which are in our, or third parties&rsquo;, legitimate interests. These interests include:
                                        <ol>
                                            <li>operating the Site;</li>
                                            <li>providing you with services described on the Site;</li>
                                            <li>verifying your identity when you sign in to our Site;</li>
                                            <li>responding to support tickets, and helping facilitate the resolution of any disputes;</li>
                                            <li>updating you with operational news and information about our Site and services;</li>
                                            <li>carrying out technical analysis to determine how to improve the Site and services we provide;</li>
                                            <li>monitoring activity on the Site, e.g. to identify potential fraudulent activity and to ensure compliance with the user terms;</li>
                                            <li>managing our relationship with you;</li>
                                            <li>managing our legal and operational affairs;</li>
                                            <li>improving our products and services;</li>
                                            <li>providing general administrative and performance functions and activities.</li>
                                        </ol>
                                    </li>
                                    <li>
                                        Where you give us consent:
                                        <ol>
                                            <li>providing you with marketing information about products and services which we feel may interest you; and</li>
                                            <li>customising our services and website, like advertising that appears on the Site, in order to provide a more personalised experience.</li>
                                        </ol>
                                    </li>
                                    <li>For purposes which are required by law.</li>
                                    <li>For the purpose of responding to requests by government, a court of law, or law enforcement authorities conducting an investigation.</li>
                                </ol>
                            </li>
                        </ol>

                        <h2>When We Disclose Your Personal Information</h2>
                        <ol start={11}>
                            <li>
                                We will disclose personal information to the following recipients:
                                <ol>
                                    <li>if applicable, sellers of any items or services made available to you, so they can facilitate support and order fulfilment;</li>
                                    <li>subcontractors and service providers who assist us in connection with the ways we use personal information;</li>
                                    <li>our professional advisers (lawyers, accountants, financial advisers etc.);</li>
                                    <li>regulators and government authorities in connection with our compliance procedures and obligations;</li>
                                    <li>a purchaser or prospective purchaser of all or part of our assets or our business;</li>
                                    <li>a third party to respond to requests relating to a criminal investigation or alleged or suspected illegal activity;</li>
                                    <li>a third party, in order to enforce or defend our rights, or to address financial or reputational risks;</li>
                                    <li>a rights holder in relation to an allegation of intellectual property infringement or any other infringement; and</li>
                                    <li>other recipients where we are authorised or required by law to do so.</li>
                                </ol>
                            </li>
                        </ol>

                        <h2>Where We Transfer and/or Store Your Personal Information</h2>
                        <ol start={12}>
                            <li>We are based in Harare, Zimbabwe so your data will be processed in Zimbabwe. Some of the recipients we have described above may be based in other countries. We do this on the basis of this policy. In order to protect your information, we take care where possible to work with subcontractors and service providers who we believe maintain an acceptable standard of data security compliance.</li>
                        </ol>

                        <h2>How We Keep Your Personal Information Secure</h2>
                        <ol start={13}>
                            <li>We store personal information on secure servers that are managed by us and our service providers. Personal information that we store or transmit is protected by security and access controls, including username and password authentication, two-factor authentication, and data encryption where appropriate.</li>
                        </ol>

                        <h2>How You Can Access Your Personal Information</h2>
                        <ol start={14}>
                            <li>You can access some of the personal information that we collect about you by logging in to your account. You also have the right to make a request to access other personal information we hold about you and to request corrections of any errors in that data. You can also close the account you have with us at any time. To make an access or correction request, contact us using the contact details at the end of this policy.</li>
                        </ol>

                        <h2>Marketing Choices</h2>
                        <ol start={15}>
                            <li>Where we have your consent to do so, we send you marketing communications by email about products and services that we feel may be of interest to you. You can &lsquo;opt-out&rsquo; of such communications if you would prefer not to receive them in the future by using the &ldquo;unsubscribe&rdquo; facility provided in the communication itself.</li>
                            <li>You also have choices about cookies, as described below. By modifying your browser preferences, you have the choice to accept all cookies, to be notified when a cookie is set, or to reject all cookies.</li>
                        </ol>

                        <h2>Cookies and Web Analytics</h2>
                        <ol start={17}>
                            <li>When you visit our Site, there&rsquo;s certain information that&rsquo;s recorded which is generally anonymous information and does not reveal your identity. If you&rsquo;re logged into your account some of this information could be associated with your account. We&rsquo;re talking about the following kinds of details:
                                <ol>
                                    <li>your IP address or proxy server IP address;</li>
                                    <li>the domain name you requested;</li>
                                    <li>the name of your internet service provider;</li>
                                    <li>the date and time of your visit to the website;</li>
                                    <li>the length of your session;</li>
                                    <li>the pages which you have accessed;</li>
                                    <li>the number of times you access our site within any month;</li>
                                    <li>the website which referred you to our Site;</li>
                                    <li>the operating system which your computer uses; and</li>
                                    <li>the technical capabilities of your web browser.</li>
                                </ol>
                            </li>
                            <li>Occasionally, we will use third party advertising companies to serve ads based on prior visits to our Site.</li>
                        </ol>

                        <h2>Information About Children</h2>
                        <ol start={20}>
                            <li>Our Site is not suitable for children under the age of 16 years, so if you are under 16 we ask that you do not use our Site or give us your personal information. If you are from 16 to 18 years, you can browse the Site but you&rsquo;ll need the supervision of a parent or guardian to become a registered user.</li>
                        </ol>

                        <h2>How Long We Keep Your Personal Information</h2>
                        <ol start={22}>
                            <li>We retain your personal information for as long as is necessary to provide the services to you and others, and to comply with our legal obligations. If you no longer want us to use your personal information or to provide you with the Snappy Fresh services, you can request that we erase your personal information and close your Snappy Fresh account.</li>
                        </ol>

                        <h2>When We Need to Update This Policy</h2>
                        <ol start={23}>
                            <li>We will need to change this policy from time to time in order to make sure it stays up to date with the latest legal requirements and any changes to our privacy management practices.</li>
                            <li>When we do change the policy, we&rsquo;ll make sure to notify you about such changes, where required. A copy of the latest version of this policy will always be available on this page.</li>
                        </ol>

                        <h2>EU / EEA Users</h2>
                        <p>For the purposes of applicable EU data protection law (including the GDPR), we are a &lsquo;data controller&rsquo; of your personal information. You are entitled to ask us to port your personal information, to erase it, or restrict its processing. You also have rights to object to some processing that is based on our legitimate interests, and where we have asked for your consent to process your data, to withdraw this consent.</p>
                        <p>If you have unresolved concerns you also have the right to complain to data protection authorities.</p>

                        <h2>South African Users (POPIA)</h2>
                        <p>If you are located in South Africa, the Protection of Personal Information Act (POPIA), Act 4 of 2013, applies to our processing of your personal information. Under POPIA, you have the right to:</p>
                        <ul>
                            <li>Be notified when your personal information is collected</li>
                            <li>Request access to your personal information</li>
                            <li>Request correction or deletion of your personal information</li>
                            <li>Object to the processing of your personal information</li>
                            <li>Lodge a complaint with the Information Regulator (South Africa)</li>
                        </ul>
                        <p>We process personal information lawfully and in a manner that does not infringe on your privacy. Our Information Officer can be reached at <a href="mailto:privacy@snappyfresh.net">privacy@snappyfresh.net</a>.</p>

                        <h2>Zimbabwean Users</h2>
                        <p>We are committed to complying with all applicable Zimbabwean data protection laws and regulations, including the Cyber and Data Protection Act (Chapter 12:07). Your personal data is processed and stored in Zimbabwe in accordance with local legal requirements. You have the right to access, correct, and request deletion of your personal information by contacting us.</p>

                        <h2>How You Can Contact Us</h2>
                        <p>If you have any questions about our privacy practices or the way in which we have been managing your personal information, please contact us in writing at Harare, Zimbabwe or via email at <a href="mailto:privacy@snappyfresh.net">privacy@snappyfresh.net</a>.</p>
                    </div>
                </div>
            </Layout>
        </>
    );
}

export default PrivacyPolicy;
