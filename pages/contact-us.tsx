import Layout from "../components/layout/Layout";
import { useState } from "react";
import PhoneInput from "../components/PhoneInput";
import SEO from "../components/common/SEO";
import { pageSeoConfig } from "../config/seo";
import { contactPageSchema } from "../lib/structuredData";
import { toast } from "react-toastify";

function Contact() {
    const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: any) => setContactForm({ ...contactForm, [e.target.name]: e.target.value });

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        if (!contactForm.name || !contactForm.email || !contactForm.subject || !contactForm.message) {
            toast.error('Please fill in all required fields.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(contactForm),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Something went wrong.');
            toast.success('Message sent! We\'ll get back to you soon.');
            setContactForm({ name: '', email: '', phone: '', subject: '', message: '' });
        } catch (error: any) {
            toast.error(error.message || 'Failed to send. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const locations = [
        { name: 'Main Office', address: '185 Lorely Close, Msasa, Harare', phone: '+263 782 978 460', email: 'support@snappyfresh.net', hours: 'Mon-Sun: 6:00 AM - 6:00 PM', icon: 'fi-rs-building' },
        { name: 'Operations', address: 'Harare, Zimbabwe', phone: '+263 784 105 732', email: 'operations@snappyfresh.net', hours: 'Mon-Sun: 6:00 AM - 8:00 PM', icon: 'fi-rs-truck' },
        { name: 'Support', address: 'Online Available', phone: '+263 782 978 460', email: 'support@snappyfresh.net', hours: '24/7 Available', icon: 'fi-rs-comment-alt' },
    ];

    const contactSeoConfig = pageSeoConfig['/contact-us'];

    return (
        <>
            <SEO {...contactSeoConfig} structuredData={contactPageSchema as any} />
            <Layout parent="Home" sub="Pages" subChild="Contact">
                <style jsx>{`
                    .contact-page { }
                    .contact-hero {
                        background: linear-gradient(135deg, #1a5c38, #1a5c38);
                        padding: 52px 0 48px;
                        text-align: center;
                        position: relative;
                        overflow: hidden;
                    }
                    .contact-hero::after {
                        content: '';
                        position: absolute;
                        bottom: -60px; right: -60px;
                        width: 260px; height: 260px;
                        border-radius: 50%;
                        background: radial-gradient(circle, rgba(26,92,56,0.18) 0%, transparent 70%);
                        pointer-events: none;
                    }
                    .contact-hero-eyebrow {
                        font-size: 0.72rem; font-weight: 700; letter-spacing: 0.12em;
                        text-transform: uppercase; color: #7debb1; margin-bottom: 10px;
                        position: relative; z-index: 1;
                    }
                    .contact-hero h1 {
                        font-size: 2.4rem; font-weight: 900; color: #fff;
                        letter-spacing: -0.04em; line-height: 1.1; margin-bottom: 12px;
                        position: relative; z-index: 1;
                    }
                    .contact-hero p {
                        color: rgba(255,255,255,0.6); font-size: 0.95rem; max-width: 480px;
                        margin: 0 auto; position: relative; z-index: 1; line-height: 1.65;
                    }

                    .loc-strip { padding: 36px 0; background: #f4f9f6; }
                    .loc-card {
                        background: #fff;
                        border: var(--sf-border);
                        border-radius: var(--sf-radius-2xl);
                        padding: 28px 24px;
                        text-align: center;
                        height: 100%;
                        transition: var(--sf-transition);
                    }
                    .loc-card:hover { box-shadow: var(--sf-shadow-lg); transform: translateY(-3px); }
                    .loc-icon-wrap {
                        width: 56px; height: 56px;
                        background: var(--sf-green-50);
                        border-radius: 14px;
                        display: flex; align-items: center; justify-content: center;
                        font-size: 24px; margin: 0 auto 16px;
                        color: var(--sf-green-500);
                    }
                    .loc-name {
                        font-size: 0.95rem; font-weight: 800; color: var(--sf-gray-900);
                        margin-bottom: 6px; letter-spacing: -0.02em;
                    }
                    .loc-address { font-size: 0.82rem; color: var(--sf-gray-600); margin-bottom: 16px; line-height: 1.5; }
                    .loc-detail {
                        display: flex; align-items: center; justify-content: center;
                        gap: 7px; font-size: 0.82rem; margin-bottom: 8px;
                        color: var(--sf-gray-800); font-weight: 500;
                    }
                    .loc-detail i { color: var(--sf-green-500); font-size: 13px; }
                    .loc-detail a { color: var(--sf-gray-800); text-decoration: none; }
                    .loc-detail a:hover { color: var(--sf-green-500); }

                    .contact-form-section { padding: 48px 0; background: #fff; }
                    .form-card {
                        background: #fff;
                        border: var(--sf-border);
                        border-radius: var(--sf-radius-2xl);
                        padding: 36px 32px;
                    }
                    .form-card-title {
                        font-size: 1.3rem; font-weight: 800; color: var(--sf-gray-900);
                        margin-bottom: 6px; letter-spacing: -0.03em;
                    }
                    .form-card-sub { font-size: 0.875rem; color: var(--sf-gray-600); margin-bottom: 28px; }

                    .field-group { margin-bottom: 18px; }
                    .field-group label {
                        display: block; font-size: 0.78rem; font-weight: 700;
                        color: var(--sf-gray-800); margin-bottom: 7px; letter-spacing: 0.025em;
                    }
                    .field-group input,
                    .field-group select,
                    .field-group textarea {
                        width: 100%; padding: 11px 14px;
                        border: var(--sf-border); border-radius: var(--sf-radius-lg);
                        font-size: 0.9rem; font-family: inherit;
                        color: var(--sf-gray-900); background: #fff; outline: none;
                        transition: var(--sf-transition-fast);
                        -webkit-appearance: none; appearance: none;
                    }
                    .field-group input::placeholder, .field-group textarea::placeholder { color: #b8ccb8; }
                    .field-group input:focus, .field-group select:focus, .field-group textarea:focus {
                        border-color: var(--sf-green-500);
                        box-shadow: 0 0 0 3.5px rgba(26,92,56,0.12);
                        background: #fafffc;
                    }
                    .field-group select {
                        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath fill='%2388a888' d='M5 7L0 2h10z'/%3E%3C/svg%3E");
                        background-repeat: no-repeat; background-position: right 13px center; padding-right: 36px; cursor: pointer;
                    }
                    .field-group textarea { resize: vertical; min-height: 110px; line-height: 1.6; }

                    .btn-send {
                        display: inline-flex; align-items: center; gap: 8px;
                        background: var(--sf-gradient-green);
                        color: #fff; padding: 13px 30px; border-radius: var(--sf-radius-lg);
                        font-size: 0.9rem; font-weight: 700;
                        font-family: inherit;
                        border: none; cursor: pointer;
                        transition: var(--sf-transition); box-shadow: var(--sf-shadow-green);
                        letter-spacing: -0.01em;
                    }
                    .btn-send:hover { transform: translateY(-1px); box-shadow: var(--sf-shadow-green-lg); }

                    .info-box {
                        background: #f4f9f6;
                        border: var(--sf-border);
                        border-radius: var(--sf-radius-xl);
                        padding: 22px;
                        margin-bottom: 16px;
                    }
                    .info-box-title {
                        font-size: 0.82rem; font-weight: 800; color: var(--sf-green-500);
                        letter-spacing: 0.06em; text-transform: uppercase;
                        margin-bottom: 14px;
                    }
                    .info-row {
                        display: flex; align-items: center; gap: 10px;
                        font-size: 0.84rem; color: var(--sf-gray-800); margin-bottom: 10px;
                        font-weight: 500;
                    }
                    .info-row:last-child { margin-bottom: 0; }
                    .info-row i { color: var(--sf-green-500); font-size: 13px; width: 16px; }
                    .info-row a { color: var(--sf-gray-800); text-decoration: none; }
                    .info-row a:hover { color: var(--sf-green-500); }

                    .cta-strip {
                        background: var(--sf-green-900);
                        padding: 40px 0;
                        text-align: center;
                    }
                    .cta-strip h2 {
                        font-size: 1.5rem; font-weight: 900; color: #fff;
                        letter-spacing: -0.03em; margin-bottom: 10px;
                    }
                    .cta-strip p { color: rgba(255,255,255,0.55); font-size: 0.9rem; margin-bottom: 24px; }
                    .cta-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
                    .cta-btn {
                        display: inline-flex; align-items: center; gap: 8px;
                        padding: 12px 24px; border-radius: var(--sf-radius-lg);
                        font-size: 14px; font-weight: 700; text-decoration: none;
                        transition: var(--sf-transition); letter-spacing: -0.01em;
                        font-family: inherit;
                    }
                    .cta-btn.green { background: var(--sf-green-500); color: #fff; box-shadow: var(--sf-shadow-green); }
                    .cta-btn.green:hover { background: var(--sf-green-600); transform: translateY(-2px); color: #fff; }
                    .cta-btn.wa { background: #25D366; color: #fff; box-shadow: 0 4px 14px rgba(37,211,102,0.35); }
                    .cta-btn.wa:hover { background: #1eba55; transform: translateY(-2px); color: #fff; }
                `}</style>

                <div className="contact-page">
                    <div className="contact-hero">
                        <div className="container">
                            <div className="contact-hero-eyebrow">Get in touch</div>
                            <h1>Contact Us</h1>
                            <p>Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
                        </div>
                    </div>

                    <div className="loc-strip">
                        <div className="container">
                            <div className="row">
                                {locations.map((loc, i) => (
                                    <div key={i} className="col-lg-4 col-md-6 mb-20">
                                        <div className="loc-card">
                                            <div className="loc-icon-wrap"><i className={loc.icon}></i></div>
                                            <div className="loc-name">{loc.name}</div>
                                            <div className="loc-address">{loc.address}</div>
                                            <div className="loc-detail"><i className="fi-rs-phone"></i><a href={`tel:${loc.phone}`}>{loc.phone}</a></div>
                                            <div className="loc-detail"><i className="fi-rs-envelope"></i><a href={`mailto:${loc.email}`}>{loc.email}</a></div>
                                            <div className="loc-detail"><i className="fi-rs-clock"></i>{loc.hours}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="contact-form-section">
                        <div className="container">
                            <div className="row">
                                <div className="col-xl-10 col-lg-12 m-auto">
                                    <div className="row">
                                        <div className="col-lg-7 mb-30 mb-lg-0">
                                            <div className="form-card">
                                                <div className="form-card-title">Send us a Message</div>
                                                <div className="form-card-sub">Fill out the form and we'll get back to you within 24 hours.</div>
                                                <form onSubmit={handleSubmit} noValidate>
                                                    <div className="row">
                                                        <div className="col-md-6">
                                                            <div className="field-group">
                                                                <label htmlFor="contact-name">Full Name *</label>
                                                                <input id="contact-name" type="text" name="name" placeholder="John Doe" value={contactForm.name} onChange={handleChange} required />
                                                            </div>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <div className="field-group">
                                                                <label htmlFor="contact-email">Email Address *</label>
                                                                <input id="contact-email" type="email" name="email" placeholder="you@example.com" value={contactForm.email} onChange={handleChange} required />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="field-group">
                                                        <label htmlFor="contact-phone">Phone Number</label>
                                                        <PhoneInput
                                                            value={contactForm.phone}
                                                            onChange={(val) => setContactForm({ ...contactForm, phone: val })}
                                                            placeholder="Phone number (optional)"
                                                        />
                                                    </div>
                                                    <div className="field-group">
                                                        <label htmlFor="contact-subject">Subject *</label>
                                                        <select id="contact-subject" name="subject" value={contactForm.subject} onChange={handleChange} required>
                                                            <option value="">Select a subject *</option>
                                                            <option value="general">General Inquiry</option>
                                                            <option value="order">Order Support</option>
                                                            <option value="delivery">Delivery Issue</option>
                                                            <option value="vendor">Become a Vendor</option>
                                                            <option value="feedback">Feedback</option>
                                                            <option value="other">Other</option>
                                                        </select>
                                                    </div>
                                                    <div className="field-group">
                                                        <label htmlFor="contact-message">Message *</label>
                                                        <textarea id="contact-message" name="message" placeholder="How can we help you?" value={contactForm.message} onChange={handleChange} required />
                                                    </div>
                                                    <button type="submit" className="btn-send" disabled={loading}>
                                                        <i className="fi-rs-paper-plane"></i> {loading ? 'Sending...' : 'Send Message'}
                                                    </button>
                                                </form>
                                            </div>
                                        </div>

                                        <div className="col-lg-5">
                                            <div className="info-box">
                                                <div className="info-box-title">Business Hours</div>
                                                <div className="info-row"><i className="fi-rs-clock"></i>Mon-Sun: 6:00 AM - 6:00 PM</div>
                                                <div className="info-row"><i className="fi-rs-truck"></i>Delivery: 6:00 AM - 8:00 PM</div>
                                            </div>
                                            <div className="info-box">
                                                <div className="info-box-title">Our Address</div>
                                                <div className="info-row"><i className="fi-rs-marker"></i>185 Lorely Close, Msasa, Harare, Zimbabwe</div>
                                            </div>
                                            <div className="info-box">
                                                <div className="info-box-title">Contact Details</div>
                                                <div className="info-row"><i className="fi-rs-phone"></i><a href="tel:+263782978460">+263 782 978 460</a></div>
                                                <div className="info-row"><i className="fi-rs-phone"></i><a href="tel:+263784105732">+263 784 105 732</a></div>
                                                <div className="info-row"><i className="fi-rs-envelope"></i><a href="mailto:support@snappyfresh.net">support@snappyfresh.net</a></div>
                                                <div className="info-row"><i className="fi-rs-brand-whatsapp"></i><a href="https://wa.me/263782978460" target="_blank" rel="noopener noreferrer">WhatsApp Us</a></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="cta-strip">
                        <div className="container">
                            <h2>Need Immediate Help?</h2>
                            <p>Our customer support team is available to assist you with any questions or concerns.</p>
                            <div className="cta-btns">
                                <a href="tel:+263782978460" className="cta-btn green"><i className="fi-rs-phone"></i>Call Us Now</a>
                                <a href="https://wa.me/263782978460" target="_blank" className="cta-btn wa"><i className="fi-rs-brand-whatsapp"></i>WhatsApp Us</a>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        </>
    );
}

export default Contact;
