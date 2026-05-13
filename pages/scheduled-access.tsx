import Link from "next/link";
import Layout from "../components/layout/Layout";
import SEO from "../components/common/SEO";
import { useAuth } from "../contexts/AuthContext";

const ScheduledAccess = () => {
    const { user, isAuthenticated } = useAuth();
    const isInstantOnly = isAuthenticated && !user?.customer?.isVisitor && user?.customer?.isInstantDelivery === true;

    return (
        <>
            <SEO
                title="Apply for Scheduled Ordering | Snappy Fresh"
                description="Scheduled ordering is available for approved wholesale and repeat-delivery customers. Apply to get access."
            />
            <style>{styles}</style>
            <Layout>
                <section className="sa-page">
                    <div className="container">

                        {/* Hero */}
                        <div className="sa-hero">
                            <div className="sa-hero-badge">SCHEDULED DELIVERY</div>
                            <h1 className="sa-hero-title">
                                Order on Your<br /><span>Schedule</span>
                            </h1>
                            <p className="sa-hero-sub">
                                Scheduled ordering is designed for wholesale buyers, businesses and repeat-delivery customers.
                                Get recurring deliveries, fixed pricing, and a dedicated account manager.
                            </p>
                            {isInstantOnly ? (
                                <div className="sa-cta-row">
                                    <Link href="/contact-us?subject=scheduled-access" className="sa-btn sa-btn--primary">
                                        Apply for Access
                                    </Link>
                                    <a href="https://wa.me/263782978460" target="_blank" rel="noopener noreferrer" className="sa-btn sa-btn--wa">
                                        <i className="fi-rs-brand-whatsapp" /> WhatsApp Us
                                    </a>
                                </div>
                            ) : (
                                <div className="sa-cta-row">
                                    <Link href="/scheduled-orders" className="sa-btn sa-btn--primary">
                                        Go to Scheduled Orders
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Feature cards */}
                        <div className="sa-features">
                            {[
                                {
                                    icon: "fi-rs-calendar",
                                    color: "#1a5c38",
                                    title: "Fixed Delivery Schedule",
                                    text: "Pick your delivery days once. We handle the rest — same time, same day, every cycle.",
                                },
                                {
                                    icon: "fi-rs-tags",
                                    color: "#f6a623",
                                    title: "Contracted Pricing",
                                    text: "Lock in wholesale pricing for your regular products. No price surprises between orders.",
                                },
                                {
                                    icon: "fi-rs-user-headset",
                                    color: "#2b6cb0",
                                    title: "Dedicated Account Manager",
                                    text: "A dedicated rep manages your account, resolves issues quickly and keeps things running smoothly.",
                                },
                                {
                                    icon: "fi-rs-credit-card",
                                    color: "#805ad5",
                                    title: "Flexible Billing",
                                    text: "Monthly statements, credit accounts and multiple payment options available to approved clients.",
                                },
                            ].map((f, i) => (
                                <div key={i} className="sa-feature-card">
                                    <div className="sa-feature-icon" style={{ background: `${f.color}18`, color: f.color }}>
                                        <i className={f.icon} />
                                    </div>
                                    <h3>{f.title}</h3>
                                    <p>{f.text}</p>
                                </div>
                            ))}
                        </div>

                        {/* How it works */}
                        <div className="sa-steps-wrap">
                            <h2 className="sa-section-title">How to Get Access</h2>
                            <div className="sa-steps">
                                {[
                                    { num: "01", title: "Contact Our Team", text: "Reach out via the contact form or WhatsApp. Tell us about your business and delivery needs." },
                                    { num: "02", title: "Account Review", text: "Our team reviews your application and sets up your scheduled account — usually within 1 business day." },
                                    { num: "03", title: "Start Ordering", text: "Once approved, log in and access the full Scheduled section — create orders, view history, manage billing." },
                                ].map((s, i) => (
                                    <div key={i} className="sa-step">
                                        <div className="sa-step-num">{s.num}</div>
                                        <div>
                                            <h3>{s.title}</h3>
                                            <p>{s.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Bottom CTA */}
                        <div className="sa-bottom-cta">
                            <h2>Ready to apply?</h2>
                            <p>Get in touch and we&apos;ll have your account set up quickly.</p>
                            <div className="sa-cta-row">
                                <Link href="/contact-us?subject=scheduled-access" className="sa-btn sa-btn--primary">
                                    Apply Now
                                </Link>
                                <a href="https://wa.me/263782978460" target="_blank" rel="noopener noreferrer" className="sa-btn sa-btn--wa">
                                    <i className="fi-rs-brand-whatsapp" /> WhatsApp Us
                                </a>
                                <Link href="/store" className="sa-btn sa-btn--ghost">
                                    Back to Shop
                                </Link>
                            </div>
                        </div>

                    </div>
                </section>
            </Layout>
        </>
    );
};

export default ScheduledAccess;

const styles = `
  .sa-page {
    background: #f8fafb;
    padding: 60px 0 80px;
    min-height: 70vh;
  }

  /* Hero */
  .sa-hero {
    text-align: center;
    max-width: 680px;
    margin: 0 auto 64px;
    padding: 0 16px;
  }
  .sa-hero-badge {
    display: inline-block;
    background: #e6ffed;
    color: #22863a;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 1.5px;
    padding: 6px 16px;
    border-radius: 20px;
    margin-bottom: 20px;
    text-transform: uppercase;
  }
  .sa-hero-title {
    font-size: 42px;
    font-weight: 900;
    color: #1a202c;
    line-height: 1.15;
    margin: 0 0 16px;
  }
  .sa-hero-title span { color: #1a5c38; }
  .sa-hero-sub {
    font-size: 16px;
    color: #718096;
    line-height: 1.7;
    margin: 0 0 32px;
  }

  /* Feature cards */
  .sa-features {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 24px;
    margin-bottom: 64px;
  }
  .sa-feature-card {
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 28px 24px;
  }
  .sa-feature-icon {
    width: 52px;
    height: 52px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    margin-bottom: 16px;
  }
  .sa-feature-card h3 {
    font-size: 16px;
    font-weight: 700;
    color: #1a202c;
    margin: 0 0 8px;
  }
  .sa-feature-card p {
    font-size: 14px;
    color: #718096;
    line-height: 1.6;
    margin: 0;
  }

  /* Steps */
  .sa-steps-wrap {
    max-width: 640px;
    margin: 0 auto 64px;
  }
  .sa-section-title {
    font-size: 22px;
    font-weight: 800;
    color: #1a202c;
    margin: 0 0 28px;
    text-align: center;
  }
  .sa-steps { display: flex; flex-direction: column; gap: 20px; }
  .sa-step {
    display: flex;
    align-items: flex-start;
    gap: 20px;
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 20px 24px;
  }
  .sa-step-num {
    font-size: 28px;
    font-weight: 900;
    color: #e2e8f0;
    line-height: 1;
    flex-shrink: 0;
    width: 48px;
  }
  .sa-step h3 {
    font-size: 16px;
    font-weight: 700;
    color: #1a202c;
    margin: 0 0 6px;
  }
  .sa-step p {
    font-size: 14px;
    color: #718096;
    margin: 0;
    line-height: 1.6;
  }

  /* Bottom CTA */
  .sa-bottom-cta {
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 20px;
    padding: 48px;
    text-align: center;
    box-shadow: 0 4px 24px rgba(0,0,0,0.05);
  }
  .sa-bottom-cta h2 {
    font-size: 28px;
    font-weight: 800;
    color: #1a202c;
    margin: 0 0 10px;
  }
  .sa-bottom-cta p {
    font-size: 16px;
    color: #718096;
    margin: 0 0 28px;
  }

  /* CTA row */
  .sa-cta-row {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 12px;
  }
  .sa-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 13px 28px;
    border-radius: 10px;
    font-size: 15px;
    font-weight: 700;
    text-decoration: none;
    transition: all 0.2s;
    border: none;
    cursor: pointer;
  }
  .sa-btn--primary { background: #1a5c38; color: #fff; }
  .sa-btn--primary:hover { background: #2fa06a; color: #fff; }
  .sa-btn--wa { background: #25d366; color: #fff; }
  .sa-btn--wa:hover { background: #1fba59; color: #fff; }
  .sa-btn--ghost { background: transparent; color: #718096; border: 1px solid #e2e8f0; }
  .sa-btn--ghost:hover { border-color: #1a5c38; color: #1a5c38; }

  @media (max-width: 768px) {
    .sa-hero-title { font-size: 30px; }
    .sa-features { grid-template-columns: 1fr; }
    .sa-bottom-cta { padding: 32px 20px; }
  }
`;
