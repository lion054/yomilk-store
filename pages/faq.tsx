import Layout from "../components/layout/Layout";
import Link from "next/link";
import { useState } from "react";
import SEO from "../components/common/SEO";
import { pageSeoConfig } from "../config/seo";
import { generateFaqSchema } from "../lib/structuredData";

function FAQ() {
    const [activeIndex, setActiveIndex] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const faqCategories = [
        {
            title: 'Orders & Delivery',
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="3" width="15" height="13" rx="2"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                </svg>
            ),
            items: [
                {
                    question: "How do I place an order?",
                    answer: "Just open the app or website, log in (or sign up), add your items to the cart, choose a payment method, confirm your delivery address, and hit Place Order!"
                },
                {
                    question: "How do I track my order?",
                    answer: "Head to the Orders section in the app to see your order status — from packed to delivered!"
                },
                {
                    question: "Can I cancel or change my order?",
                    answer: "Only if we haven't processed it yet! Call or message us ASAP on +263 782 978 460 / +263 784 105 732 or email support@snappyfresh.net"
                },
                {
                    question: "Are there any delivery fees?",
                    answer: "Yes, a small fee applies depending on your location — you'll see it clearly at checkout."
                },
                {
                    question: "Can I order in bulk or for events?",
                    answer: "Absolutely! Contact us for big orders and we'll help you with discounts and delivery options."
                },
            ]
        },
        {
            title: 'Payments & Refunds',
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
            ),
            items: [
                {
                    question: "What payment methods do you accept?",
                    answer: "We accept Innbucks, EcoCash, Debit/Credit Cards, Zimswitch (Paynow), and Cash on Delivery (COD — No change? No problem. We'll credit your SnappyFresh Wallet for your next purchase!)"
                },
                {
                    question: "Do you offer refunds or exchanges?",
                    answer: "Yes! If something's wrong (like a damaged or wrong item), let us know and we'll fix it. Conditions apply."
                },
            ]
        },
        {
            title: 'Account & App',
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
            ),
            items: [
                {
                    question: "How do I create an account?",
                    answer: "Just hit Sign Up on the website, enter your info, create a password — done in 60 seconds!"
                },
                {
                    question: "How do I update my delivery address?",
                    answer: "Go to your account settings or change it at checkout before confirming your order."
                },
                {
                    question: "Is my info safe?",
                    answer: "Totally secure — we use top-level encryption and never share your data."
                },
                {
                    question: "I'm having trouble with the app — what now?",
                    answer: "Try updating or restarting the app. Still stuck? Contact us — we'll sort it out fast!"
                },
            ]
        },
        {
            title: 'Promos & More',
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
                </svg>
            ),
            items: [
                {
                    question: "Do you offer deals or promos?",
                    answer: "Yes, we love giving you deals! Follow us on our social media pages or sign up for our newsletter to stay in the loop."
                },
                {
                    question: "How do I contact customer support?",
                    answer: "We're always here to help! Use the in-app Help & Support, call or WhatsApp us at +263 782 978 460 / +263 784 105 732, or email support@snappyfresh.net"
                },
            ]
        },
    ];

    // Flatten for search and schema
    const allFaqs = faqCategories.flatMap(cat => cat.items);

    // Filter by search
    const filteredCategories = searchTerm.trim()
        ? faqCategories.map(cat => ({
            ...cat,
            items: cat.items.filter(item =>
                item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.answer.toLowerCase().includes(searchTerm.toLowerCase())
            )
        })).filter(cat => cat.items.length > 0)
        : faqCategories;

    const toggle = (idx: any) => setActiveIndex(activeIndex === idx ? null : idx);

    const faqSeoConfig = pageSeoConfig['/faq'];
    const faqSchema = generateFaqSchema(allFaqs);

    return (
        <>
            <SEO {...faqSeoConfig} structuredData={faqSchema as any} />
            <Layout parent="Home" sub="Pages" subChild="FAQ">
                <style jsx global>{`
                    .faq-page {
                        min-height: 60vh;
                        background: #f8faf8;
                    }

                    /* ── Hero ── */
                    .faq-hero {
                        background: linear-gradient(135deg, #1a5c38 0%, #1a5c38 100%);
                        padding: 64px 0 48px;
                        text-align: center;
                        position: relative;
                        overflow: hidden;
                    }
                    .faq-hero::before {
                        content: '';
                        position: absolute;
                        top: -50%;
                        right: -20%;
                        width: 500px;
                        height: 500px;
                        background: radial-gradient(circle, rgba(66,175,87,0.15) 0%, transparent 70%);
                        border-radius: 50%;
                    }
                    .faq-hero h1 {
                        font-size: 36px;
                        font-weight: 800;
                        color: #fff;
                        margin: 0 0 12px;
                        letter-spacing: -0.03em;
                    }
                    .faq-hero p {
                        font-size: 16px;
                        color: rgba(255,255,255,0.75);
                        margin: 0 0 32px;
                        max-width: 480px;
                        margin-left: auto;
                        margin-right: auto;
                    }

                    /* ── Search ── */
                    .faq-search-wrap {
                        max-width: 520px;
                        margin: 0 auto;
                        position: relative;
                    }
                    .faq-search-icon {
                        position: absolute;
                        left: 18px;
                        top: 50%;
                        transform: translateY(-50%);
                        color: #636363;
                        pointer-events: none;
                    }
                    .faq-search-input {
                        width: 100%;
                        padding: 16px 20px 16px 50px;
                        border: none;
                        border-radius: 14px;
                        font-size: 15px;
                        font-weight: 500;
                        background: #fff;
                        color: #1a1a2e;
                        box-shadow: 0 4px 20px rgba(0,0,0,0.12);
                        transition: box-shadow 0.2s;
                        outline: none;
                    }
                    .faq-search-input:focus {
                        box-shadow: 0 4px 24px rgba(66,175,87,0.2);
                    }
                    .faq-search-input::placeholder {
                        color: #aaa;
                        font-weight: 400;
                    }

                    /* ── Category pills ── */
                    .faq-categories-nav {
                        display: flex;
                        gap: 10px;
                        justify-content: center;
                        flex-wrap: wrap;
                        padding: 24px 0 0;
                    }
                    .faq-cat-pill {
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                        padding: 10px 18px;
                        border-radius: 50px;
                        background: rgba(255,255,255,0.12);
                        color: rgba(255,255,255,0.8);
                        font-size: 13px;
                        font-weight: 600;
                        text-decoration: none;
                        transition: all 0.2s;
                        border: 1px solid rgba(255,255,255,0.1);
                        cursor: pointer;
                    }
                    .faq-cat-pill:hover {
                        background: rgba(255,255,255,0.2);
                        color: #fff;
                    }
                    .faq-cat-pill svg {
                        width: 16px;
                        height: 16px;
                    }

                    /* ── Content ── */
                    .faq-content {
                        max-width: 800px;
                        margin: -24px auto 0;
                        padding: 0 20px 80px;
                        position: relative;
                        z-index: 1;
                    }

                    /* ── Category Section ── */
                    .faq-cat-section {
                        margin-bottom: 24px;
                    }
                    .faq-cat-header {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        padding: 20px 24px;
                        background: #fff;
                        border-radius: 16px 16px 0 0;
                        border-bottom: 1px solid #f0f0f0;
                    }
                    .faq-cat-icon {
                        width: 44px;
                        height: 44px;
                        border-radius: 12px;
                        background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: #2e7d32;
                        flex-shrink: 0;
                    }
                    .faq-cat-header h2 {
                        font-size: 18px;
                        font-weight: 700;
                        color: #1a1a2e;
                        margin: 0;
                        letter-spacing: -0.02em;
                    }
                    .faq-cat-count {
                        margin-left: auto;
                        font-size: 12px;
                        font-weight: 600;
                        color: #636363;
                        background: #f5f5f5;
                        padding: 4px 10px;
                        border-radius: 20px;
                    }

                    /* ── Accordion ── */
                    .faq-items-list {
                        background: #fff;
                        border-radius: 0 0 16px 16px;
                        overflow: hidden;
                        box-shadow: 0 2px 12px rgba(0,0,0,0.04);
                    }
                    .faq-item {
                        border-bottom: 1px solid #f5f5f5;
                    }
                    .faq-item:last-child {
                        border-bottom: none;
                    }
                    .faq-question {
                        width: 100%;
                        background: none;
                        border: none;
                        padding: 20px 24px;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 16px;
                        text-align: left;
                        font-family: inherit;
                        transition: background 0.15s;
                    }
                    .faq-question:hover {
                        background: #fafbfa;
                    }
                    .faq-question-text {
                        font-size: 15px;
                        font-weight: 600;
                        color: #1a1a2e;
                        line-height: 1.4;
                    }
                    .faq-question.active .faq-question-text {
                        color: #42af57;
                    }
                    .faq-toggle {
                        width: 32px;
                        height: 32px;
                        border-radius: 50%;
                        background: #f5f5f5;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        flex-shrink: 0;
                        transition: all 0.3s;
                    }
                    .faq-question.active .faq-toggle {
                        background: #42af57;
                        transform: rotate(180deg);
                    }
                    .faq-toggle svg {
                        width: 16px;
                        height: 16px;
                        color: #595959;
                    }
                    .faq-question.active .faq-toggle svg {
                        color: #fff;
                    }
                    .faq-answer {
                        padding: 0 24px 20px;
                        color: #555;
                        font-size: 14px;
                        line-height: 1.7;
                        white-space: pre-line;
                        animation: faqSlideIn 0.25s ease-out;
                    }
                    .faq-answer a {
                        color: #42af57;
                        text-decoration: none;
                        font-weight: 600;
                    }
                    .faq-answer a:hover {
                        text-decoration: underline;
                    }

                    @keyframes faqSlideIn {
                        from { opacity: 0; transform: translateY(-8px); }
                        to { opacity: 1; transform: translateY(0); }
                    }

                    /* ── No results ── */
                    .faq-no-results {
                        text-align: center;
                        padding: 60px 20px;
                        background: #fff;
                        border-radius: 16px;
                        box-shadow: 0 2px 12px rgba(0,0,0,0.04);
                    }
                    .faq-no-results-icon {
                        width: 64px;
                        height: 64px;
                        border-radius: 50%;
                        background: #f5f5f5;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin: 0 auto 16px;
                        font-size: 28px;
                    }
                    .faq-no-results h3 {
                        font-size: 18px;
                        font-weight: 700;
                        color: #1a1a2e;
                        margin: 0 0 8px;
                    }
                    .faq-no-results p {
                        font-size: 14px;
                        color: #888;
                        margin: 0;
                    }

                    /* ── CTA ── */
                    .faq-cta {
                        background: #fff;
                        border-radius: 16px;
                        padding: 40px;
                        text-align: center;
                        box-shadow: 0 2px 12px rgba(0,0,0,0.04);
                        margin-top: 40px;
                    }
                    .faq-cta h3 {
                        font-size: 22px;
                        font-weight: 800;
                        color: #1a1a2e;
                        margin: 0 0 8px;
                        letter-spacing: -0.02em;
                    }
                    .faq-cta p {
                        font-size: 14px;
                        color: #888;
                        margin: 0 0 24px;
                    }
                    .faq-cta-buttons {
                        display: flex;
                        gap: 12px;
                        justify-content: center;
                        flex-wrap: wrap;
                    }
                    .faq-cta-btn {
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                        padding: 14px 28px;
                        border-radius: 12px;
                        font-size: 14px;
                        font-weight: 700;
                        text-decoration: none;
                        transition: all 0.2s;
                        border: none;
                        cursor: pointer;
                    }
                    .faq-cta-btn--green {
                        background: #42af57;
                        color: #fff;
                    }
                    .faq-cta-btn--green:hover {
                        background: #369c49;
                        transform: translateY(-1px);
                        box-shadow: 0 4px 12px rgba(66,175,87,0.3);
                    }
                    .faq-cta-btn--whatsapp {
                        background: #25D366;
                        color: #fff;
                    }
                    .faq-cta-btn--whatsapp:hover {
                        background: #1fba59;
                        transform: translateY(-1px);
                        box-shadow: 0 4px 12px rgba(37,211,102,0.3);
                    }

                    /* ── Mobile ── */
                    @media (max-width: 768px) {
                        .faq-hero {
                            padding: 48px 20px 40px;
                        }
                        .faq-hero h1 {
                            font-size: 28px;
                        }
                        .faq-hero p {
                            font-size: 14px;
                        }
                        .faq-search-input {
                            font-size: 16px;
                            padding: 14px 16px 14px 46px;
                        }
                        .faq-cat-pill {
                            padding: 8px 14px;
                            font-size: 12px;
                        }
                        .faq-content {
                            padding: 0 16px 60px;
                        }
                        .faq-cat-header {
                            padding: 16px 18px;
                        }
                        .faq-cat-header h2 {
                            font-size: 16px;
                        }
                        .faq-cat-icon {
                            width: 38px;
                            height: 38px;
                        }
                        .faq-question {
                            padding: 16px 18px;
                        }
                        .faq-question-text {
                            font-size: 14px;
                        }
                        .faq-answer {
                            padding: 0 18px 16px;
                            font-size: 13px;
                        }
                        .faq-cta {
                            padding: 32px 20px;
                        }
                        .faq-cta h3 {
                            font-size: 20px;
                        }
                        .faq-cta-btn {
                            width: 100%;
                            justify-content: center;
                        }
                    }
                `}</style>

                <div className="faq-page">
                    {/* Hero */}
                    <div className="faq-hero">
                        <div className="container">
                            <h1>How can we help?</h1>
                            <p>Search our FAQ or browse by category below</p>

                            <div className="faq-search-wrap">
                                <div className="faq-search-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    className="faq-search-input"
                                    placeholder="Search for answers..."
                                    value={searchTerm}
                                    onChange={(e) => { setSearchTerm(e.target.value); setActiveIndex(null); }}
                                />
                            </div>

                            <div className="faq-categories-nav">
                                {faqCategories.map((cat, i) => (
                                    <a key={i} href={`#faq-cat-${i}`} className="faq-cat-pill">
                                        {cat.icon}
                                        {cat.title}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* FAQ Content */}
                    <div className="faq-content">
                        {filteredCategories.length > 0 ? (
                            <>
                                {(() => {
                                    let idx = 0;
                                    return filteredCategories.map((cat, catIdx) => (
                                        <div key={catIdx} className="faq-cat-section" id={`faq-cat-${catIdx}`}>
                                            <div className="faq-cat-header">
                                                <div className="faq-cat-icon">{cat.icon}</div>
                                                <h2>{cat.title}</h2>
                                                <span className="faq-cat-count">{cat.items.length} {cat.items.length === 1 ? 'question' : 'questions'}</span>
                                            </div>
                                            <div className="faq-items-list">
                                                {cat.items.map((faq, faqIdx) => {
                                                    const currentIdx = idx++;
                                                    return (
                                                        <div key={faqIdx} className="faq-item">
                                                            <button
                                                                className={`faq-question${activeIndex === currentIdx ? ' active' : ''}`}
                                                                onClick={() => toggle(currentIdx)}
                                                            >
                                                                <span className="faq-question-text">{faq.question}</span>
                                                                <div className="faq-toggle">
                                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                                        <polyline points="6 9 12 15 18 9"/>
                                                                    </svg>
                                                                </div>
                                                            </button>
                                                            {activeIndex === currentIdx && (
                                                                <div className="faq-answer">{faq.answer}</div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ));
                                })()}
                            </>
                        ) : (
                            <div className="faq-no-results">
                                <div className="faq-no-results-icon">?</div>
                                <h3>No results found</h3>
                                <p>Try a different search term or browse the categories above</p>
                            </div>
                        )}

                        {/* CTA */}
                        <div className="faq-cta">
                            <h3>Still need help?</h3>
                            <p>Our support team is ready to assist you</p>
                            <div className="faq-cta-buttons">
                                <Link href="/contact-us" className="faq-cta-btn faq-cta-btn--green">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                                    </svg>
                                    Contact Us
                                </Link>
                                <a href="https://wa.me/263782978460" target="_blank" rel="noopener noreferrer" className="faq-cta-btn faq-cta-btn--whatsapp">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                    </svg>
                                    WhatsApp Us
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        </>
    );
}

export default FAQ;
