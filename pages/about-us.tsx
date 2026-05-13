import Layout from "../components/layout/Layout";
import SEO from "../components/common/SEO";
import { pageSeoConfig, generateOrganizationSchema, generateLocalBusinessSchema } from "../config/seo";

function About() {
    const aboutSeoConfig = (pageSeoConfig as any)['/about-us'];
    const organizationSchema = generateOrganizationSchema();
    const localBusinessSchema = generateLocalBusinessSchema();
    const combinedSchema: any = { '@context': 'https://schema.org', '@graph': [organizationSchema, localBusinessSchema] };

    const features = [
        { img: '/assets/imgs/theme/icons/icon-1.svg', title: 'Best Prices & Offers', desc: 'Competitive prices with regular promotions and deals to help you save on your favorite products.' },
        { img: '/assets/imgs/theme/icons/icon-2.svg', title: 'Wide Assortment', desc: 'From dairy products to groceries and household items -- everything you need in one place.' },
        { img: '/assets/imgs/theme/icons/icon-3.svg', title: 'Fast Delivery', desc: 'Choose between instant delivery (2-4 hours) or schedule a delivery time that works for you.' },
        { img: '/assets/imgs/theme/icons/icon-4.svg', title: 'Easy Returns', desc: 'Not satisfied? We offer hassle-free returns and exchanges for damaged or incorrect items.' },
        { img: '/assets/imgs/theme/icons/icon-5.svg', title: '100% Satisfaction', desc: 'Your satisfaction is our priority. Quality products and excellent service, every time.' },
        { img: '/assets/imgs/theme/icons/icon-6.svg', title: '24/7 Support', desc: 'Our customer support team is available around the clock to assist with your orders.' },
    ];

    const pillars = [
        { word: 'Fast', sub: 'Quick Delivery', desc: 'Instant or scheduled delivery options to fit your schedule' },
        { word: 'Fresh', sub: 'Quality Products', desc: 'Only the freshest groceries and dairy products delivered' },
        { word: 'Easy', sub: 'Simple Shopping', desc: 'User-friendly app and website for hassle-free ordering' },
        { word: 'Safe', sub: 'Secure Payments', desc: 'Multiple payment options with top-level security' },
    ];

    return (
        <>
            <SEO {...aboutSeoConfig} structuredData={combinedSchema} />
            <Layout parent="Home" sub="Pages" subChild="About">
                <style jsx>{`
                    .about-page { }

                    .about-hero {
                        background: linear-gradient(135deg, #1a5c38, #1a5c38);
                        padding: 56px 0 52px;
                        position: relative; overflow: hidden;
                    }
                    .about-hero::after {
                        content: ''; position: absolute;
                        top: -80px; right: -80px;
                        width: 300px; height: 300px; border-radius: 50%;
                        background: radial-gradient(circle, rgba(26,92,56,0.2) 0%, transparent 70%);
                        pointer-events: none;
                    }
                    .about-hero-eyebrow {
                        font-size: 0.72rem; font-weight: 700; letter-spacing: 0.12em;
                        text-transform: uppercase; color: #7debb1; margin-bottom: 12px;
                        position: relative; z-index: 1;
                    }
                    .about-hero h1 {
                        font-size: 2.8rem; font-weight: 900; color: #fff;
                        letter-spacing: -0.04em; line-height: 1.1; margin-bottom: 16px;
                        position: relative; z-index: 1;
                    }
                    .about-hero h1 em { font-style: normal; color: var(--sf-green-500); }
                    .about-hero p {
                        color: rgba(255,255,255,0.6); font-size: 0.975rem;
                        max-width: 520px; line-height: 1.7; position: relative; z-index: 1;
                    }
                    .about-hero-img {
                        border-radius: var(--sf-radius-2xl);
                        overflow: hidden;
                        box-shadow: 0 24px 56px rgba(0,0,0,0.3);
                        position: relative; z-index: 1;
                    }
                    .about-hero-img img { width: 100%; height: auto; display: block; }

                    .section-pad { padding: 56px 0; }
                    .section-eyebrow {
                        font-size: 0.72rem; font-weight: 700; letter-spacing: 0.12em;
                        text-transform: uppercase; color: var(--sf-green-500); margin-bottom: 10px;
                    }
                    .section-title {
                        font-size: 1.8rem; font-weight: 900; color: var(--sf-gray-900);
                        letter-spacing: -0.04em; line-height: 1.2; margin-bottom: 12px;
                    }
                    .section-title em { font-style: normal; color: var(--sf-green-500); }
                    .section-sub { font-size: 0.95rem; color: var(--sf-gray-600); line-height: 1.65; }

                    .feat-card {
                        background: #fff;
                        border: var(--sf-border);
                        border-radius: var(--sf-radius-2xl);
                        padding: 28px 24px;
                        text-align: center;
                        height: 100%;
                        transition: var(--sf-transition);
                    }
                    .feat-card:hover { box-shadow: var(--sf-shadow-lg); transform: translateY(-4px); }
                    .feat-card img { width: 52px; height: 52px; margin: 0 auto 16px; display: block; }
                    .feat-card h4 {
                        font-size: 0.95rem; font-weight: 800; color: var(--sf-gray-900);
                        margin-bottom: 8px; letter-spacing: -0.02em;
                    }
                    .feat-card p { font-size: 0.84rem; color: var(--sf-gray-600); line-height: 1.6; margin: 0; }

                    .mission-section {
                        background: var(--sf-green-900);
                        padding: 56px 0;
                        position: relative; overflow: hidden;
                    }
                    .mission-section::after {
                        content: ''; position: absolute;
                        bottom: -80px; right: -80px;
                        width: 320px; height: 320px; border-radius: 50%;
                        background: radial-gradient(circle, rgba(26,92,56,0.15) 0%, transparent 70%);
                        pointer-events: none;
                    }
                    .mission-img {
                        border-radius: var(--sf-radius-2xl); overflow: hidden;
                        box-shadow: 0 20px 50px rgba(0,0,0,0.3);
                        position: relative; z-index: 1;
                    }
                    .mission-img img { width: 100%; height: auto; display: block; }
                    .mission-eyebrow {
                        font-size: 0.72rem; font-weight: 700; letter-spacing: 0.12em;
                        text-transform: uppercase; color: #7debb1; margin-bottom: 12px;
                        position: relative; z-index: 1;
                    }
                    .mission-title {
                        font-size: 1.8rem; font-weight: 900; color: #fff;
                        letter-spacing: -0.04em; line-height: 1.2; margin-bottom: 20px;
                        position: relative; z-index: 1;
                    }
                    .mission-text {
                        color: rgba(255,255,255,0.6); font-size: 0.9rem;
                        line-height: 1.7; margin-bottom: 16px; position: relative; z-index: 1;
                    }
                    .mission-cols { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; padding-top: 8px; position: relative; z-index: 1; }
                    @media(max-width:768px) { .mission-cols { grid-template-columns: 1fr; } }
                    .mission-col-title {
                        font-size: 0.9rem; font-weight: 800; color: #7debb1;
                        margin-bottom: 8px; letter-spacing: -0.01em;
                    }
                    .mission-col-text { font-size: 0.84rem; color: rgba(255,255,255,0.5); line-height: 1.65; }

                    .pillars-section { background: #f4f9f6; padding: 56px 0; }
                    .pillar-card {
                        background: #fff;
                        border: var(--sf-border);
                        border-radius: var(--sf-radius-2xl);
                        padding: 32px 24px;
                        text-align: center;
                        height: 100%;
                        transition: var(--sf-transition);
                    }
                    .pillar-card:hover { box-shadow: var(--sf-shadow-lg); transform: translateY(-3px); }
                    .pillar-word {
                        font-size: 2.4rem; font-weight: 900;
                        background: linear-gradient(135deg, var(--sf-green-900), var(--sf-green-500));
                        -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                        background-clip: text; letter-spacing: -0.04em;
                        margin-bottom: 8px; display: block;
                    }
                    .pillar-sub { font-size: 0.9rem; font-weight: 800; color: var(--sf-gray-900); margin-bottom: 8px; letter-spacing: -0.02em; }
                    .pillar-desc { font-size: 0.84rem; color: var(--sf-gray-600); line-height: 1.6; margin: 0; }

                    .cta-strip {
                        background: var(--sf-gradient-green);
                        padding: 52px 0; text-align: center;
                    }
                    .cta-strip h2 {
                        font-size: 1.8rem; font-weight: 900; color: #fff;
                        letter-spacing: -0.04em; margin-bottom: 12px;
                    }
                    .cta-strip p { color: rgba(255,255,255,0.8); font-size: 0.95rem; margin-bottom: 28px; max-width: 520px; margin-left: auto; margin-right: auto; }
                    .cta-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
                    .cta-btn-wa {
                        display: inline-flex; align-items: center; gap: 8px;
                        background: #25D366; color: #fff; padding: 13px 28px;
                        border-radius: var(--sf-radius-lg); font-size: 14px; font-weight: 800;
                        font-family: inherit;
                        text-decoration: none; transition: var(--sf-transition); letter-spacing: -0.01em;
                    }
                    .cta-btn-wa:hover { background: #1eba55; transform: translateY(-2px); color: #fff; }
                `}</style>

                <div className="about-page">
                    {/* Hero */}
                    <div className="about-hero">
                        <div className="container">
                            <div className="row align-items-center g-4">
                                <div className="col-lg-6">
                                    <div className="about-hero-eyebrow">About us</div>
                                    <h1>Zimbabwe's freshest<br />grocery <em>delivery</em></h1>
                                    <p>Your trusted partner for online dairy, groceries, and household items. We bring fresh, quality products right to your doorstep with fast, reliable delivery.</p>
                                </div>
                                <div className="col-lg-6">
                                    <div className="about-hero-img">
                                        <img src="/assets/imgs/page/about-dairy.jpg" alt="Fresh Dairy Products - Snappy Fresh" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* What we provide */}
                    <div className="section-pad" style={{ background: '#f4f9f6' }}>
                        <div className="container">
                            <div style={{ textAlign: 'center', marginBottom: 40 }}>
                                <div className="section-eyebrow">What we offer</div>
                                <h2 className="section-title">Everything You <em>Need</em></h2>
                                <p className="section-sub" style={{ maxWidth: 520, margin: '0 auto' }}>From daily essentials to household items, we've got you covered.</p>
                            </div>
                            <div className="row">
                                {features.map((f, i) => (
                                    <div key={i} className="col-lg-4 col-md-6 mb-22">
                                        <div className="feat-card">
                                            <img src={f.img} alt={f.title} />
                                            <h4>{f.title}</h4>
                                            <p>{f.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Mission */}
                    <div className="mission-section">
                        <div className="container">
                            <div className="row align-items-center g-5">
                                <div className="col-lg-5">
                                    <div className="mission-img">
                                        <img src="/assets/imgs/page/about-delivery.jpg" alt="Fast Delivery Service - Snappy Fresh" />
                                    </div>
                                </div>
                                <div className="col-lg-7">
                                    <div className="mission-eyebrow">Our purpose</div>
                                    <div className="mission-title">Your Partner for E-commerce<br />Grocery Solutions</div>
                                    <p className="mission-text">We're on a mission to revolutionize how Zimbabweans shop for groceries and household essentials. By combining technology with efficient logistics, we're making quality products accessible to everyone.</p>
                                    <p className="mission-text" style={{ marginBottom: 32 }}>Our goal is to save you time, provide value, and deliver fresh products that meet the highest standards. We partner with trusted suppliers to ensure every item you receive is of premium quality.</p>
                                    <div className="mission-cols">
                                        <div>
                                            <div className="mission-col-title">Who We Are</div>
                                            <div className="mission-col-text">Zimbabwe's leading online grocery delivery service, operating from 185 Lorely Close, Msasa, Harare.</div>
                                        </div>
                                        <div>
                                            <div className="mission-col-title">Our Vision</div>
                                            <div className="mission-col-text">To become the most trusted online shopping platform in Zimbabwe, accessible to every household.</div>
                                        </div>
                                        <div>
                                            <div className="mission-col-title">Our Values</div>
                                            <div className="mission-col-text">Quality, convenience, and customer satisfaction drive everything we do. Transparency and reliability at the core.</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Four pillars */}
                    <div className="pillars-section">
                        <div className="container">
                            <div style={{ textAlign: 'center', marginBottom: 40 }}>
                                <div className="section-eyebrow">Why choose us</div>
                                <h2 className="section-title">Why Choose <em>Snappy Fresh?</em></h2>
                            </div>
                            <div className="row">
                                {pillars.map((p, i) => (
                                    <div key={i} className="col-lg-3 col-md-6 mb-22">
                                        <div className="pillar-card">
                                            <span className="pillar-word">{p.word}</span>
                                            <div className="pillar-sub">{p.sub}</div>
                                            <p className="pillar-desc">{p.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="cta-strip">
                        <div className="container">
                            <h2>Ready to Get Started?</h2>
                            <p>Join thousands of satisfied customers enjoying convenient grocery delivery across Zimbabwe.</p>
                            <div className="cta-btns">
                                <a href="/store" className="sf-btn sf-btn--white sf-btn--lg"><i className="fi-rs-shopping-cart"></i>Start Shopping</a>
                                <a href="https://wa.me/263782978460" target="_blank" className="cta-btn-wa"><i className="fi-rs-brand-whatsapp"></i>WhatsApp Us</a>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        </>
    );
}

export default About;
