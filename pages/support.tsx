import { useState } from 'react';
import Layout from '../components/layout/Layout';
import SEO from '../components/common/SEO';

const faqs = [
  {
    category: 'Orders & Delivery',
    items: [
      {
        q: 'How do I place an order?',
        a: 'Browse our shop, add items to your basket, then proceed to checkout. You can pay via EcoCash, bank transfer, or cash on delivery.'
      },
      {
        q: 'What are your delivery areas?',
        a: 'We currently deliver across Harare and surrounding areas. B2B deliveries are available nationwide for bulk orders.'
      },
      {
        q: 'How long does delivery take?',
        a: 'Standard delivery takes 1-2 business days. Instant delivery orders from enabled warehouses are dispatched the same day.'
      },
      {
        q: 'Can I track my order?',
        a: 'Yes. Once your order is dispatched, you\'ll receive tracking updates via SMS and email. You can also check your order status from your profile under Invoices.'
      },
      {
        q: 'What is the minimum order amount?',
        a: 'There is no minimum order for retail customers. B2B scheduled orders may have minimums depending on your account terms.'
      }
    ]
  },
  {
    category: 'Scheduled Orders (B2B)',
    items: [
      {
        q: 'What are scheduled orders?',
        a: 'Scheduled orders allow B2B customers to set up recurring deliveries on a fixed schedule. You choose the products, quantities, and delivery dates in advance.'
      },
      {
        q: 'How do I create a scheduled order?',
        a: 'Navigate to Scheduled > Scheduled Orders, select an active schedule, choose your delivery date, add products, and submit. Your order will be processed on the scheduled date.'
      },
      {
        q: 'Can I modify a scheduled order after submission?',
        a: 'Orders can be modified up until they are confirmed for dispatch. Contact our support team if you need to make changes to a confirmed order.'
      }
    ]
  },
  {
    category: 'Payments & Billing',
    items: [
      {
        q: 'What payment methods do you accept?',
        a: 'We accept EcoCash, OneMoney, bank transfers (FBC, CBZ, Stanbic, NMB), and cash on delivery for qualifying accounts.'
      },
      {
        q: 'How do I view my invoices?',
        a: 'Log in to your account and go to Profile > Invoices to view all your invoices, payment status, and download PDF copies.'
      },
      {
        q: 'What are your payment terms for B2B accounts?',
        a: 'Payment terms vary by account. Most B2B accounts operate on 7-30 day terms. Check your account statements or contact us for your specific terms.'
      },
      {
        q: 'How do I request a credit note?',
        a: 'Contact our support team with your invoice number and reason for the credit request. Credit notes are processed within 3-5 business days.'
      }
    ]
  },
  {
    category: 'Account & Registration',
    items: [
      {
        q: 'How do I register as a B2B customer?',
        a: 'Visit the registration page and complete the application form with your business details. Our team will review your application within 2-3 business days.'
      },
      {
        q: 'How do I switch between business profiles?',
        a: 'If you manage multiple business accounts, use the Account Profile switcher on your profile page or in the header to switch between them.'
      },
      {
        q: 'I forgot my password. How do I reset it?',
        a: 'Click "Forgot Password" on the login page. Enter your email address and we\'ll send you a password reset link.'
      }
    ]
  },
  {
    category: 'Becoming a Supplier',
    items: [
      {
        q: 'How do I become a supplier on Snappy Fresh?',
        a: 'Visit our Supplier Registration page, complete the application with your company details, banking information, and product catalogue. Our team will review your application within 2-3 business days.'
      },
      {
        q: 'What are the requirements to become a supplier?',
        a: 'You need a registered business, valid tax ID, banking details, and a product catalogue. All suppliers must meet our quality and compliance standards.'
      },
      {
        q: 'How do I upload my product catalogue?',
        a: 'Once approved, use the Vendor Catalogue page to upload your products via CSV or Excel. A template with the required format is available for download.'
      }
    ]
  }
];

export default function Support() {
  const [openIndex, setOpenIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const toggle = (key: any) => {
    setOpenIndex(openIndex === key ? null : key);
  };

  const filteredFaqs = searchQuery.trim()
    ? faqs.map(cat => ({
        ...cat,
        items: cat.items.filter(
          item =>
            item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.a.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(cat => cat.items.length > 0)
    : faqs;

  return (
    <>
      <SEO
        title="Support & FAQ - Snappy Fresh"
        description="Get help with your Snappy Fresh orders, deliveries, payments, and account. Find answers to frequently asked questions."
      />
      <Layout parent="Home" sub="Support">
        <style>{`
          .support-hero {
            background: linear-gradient(135deg, #1a5c38 0%, #2d5a47 50%, var(--sf-green-500) 100%);
            padding: 80px 0 60px;
            text-align: center;
            color: white;
            position: relative;
            overflow: hidden;
          }
          .support-hero::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -20%;
            width: 500px;
            height: 500px;
            border-radius: 50%;
            background: rgba(255,255,255,0.03);
          }
          .support-hero h1 {
            font-size: 42px;
            font-weight: 800;
            margin-bottom: 12px;
            letter-spacing: -0.5px;
          }
          .support-hero p {
            font-size: 18px;
            opacity: 0.85;
            max-width: 500px;
            margin: 0 auto 32px;
            line-height: 1.6;
          }
          .support-search {
            max-width: 520px;
            margin: 0 auto;
            position: relative;
          }
          .support-search input {
            width: 100%;
            padding: 16px 20px 16px 48px;
            border: none;
            border-radius: var(--sf-radius-xl);
            font-size: 15px;
            background: rgba(255,255,255,0.15);
            backdrop-filter: blur(8px);
            color: white;
            outline: none;
            transition: var(--sf-transition);
          }
          .support-search input::placeholder {
            color: rgba(255,255,255,0.6);
          }
          .support-search input:focus {
            background: rgba(255,255,255,0.25);
            box-shadow: var(--sf-shadow-lg);
          }
          .support-search-icon {
            position: absolute;
            left: 16px;
            top: 50%;
            transform: translateY(-50%);
            color: rgba(255,255,255,0.6);
            font-size: 18px;
          }

          .faq-section {
            padding: 60px 0 80px;
            background: var(--sf-gray-50);
          }
          .faq-category {
            margin-bottom: 40px;
          }
          .faq-category-title {
            font-size: 20px;
            font-weight: 700;
            color: var(--sf-gray-900);
            margin-bottom: 16px;
            padding-left: 16px;
            border-left: 4px solid var(--sf-green-500);
          }
          .faq-item {
            background: white;
            border-radius: var(--sf-radius-xl);
            margin-bottom: 8px;
            box-shadow: var(--sf-shadow-sm);
            overflow: hidden;
            transition: var(--sf-transition-fast);
          }
          .faq-item:hover {
            box-shadow: var(--sf-shadow-md);
          }
          .faq-question {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 18px 24px;
            cursor: pointer;
            border: none;
            background: none;
            width: 100%;
            text-align: left;
            font-size: 15px;
            font-weight: 600;
            color: var(--sf-gray-900);
            transition: color 0.2s ease;
            font-family: inherit;
          }
          .faq-question:hover {
            color: var(--sf-green-500);
          }
          .faq-question.active {
            color: var(--sf-green-500);
          }
          .faq-chevron {
            font-size: 12px;
            color: var(--sf-gray-500);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            flex-shrink: 0;
            margin-left: 16px;
          }
          .faq-chevron.open {
            transform: rotate(90deg);
            color: var(--sf-green-500);
          }
          .faq-answer {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1), padding 0.3s ease;
            padding: 0 24px;
          }
          .faq-answer.open {
            max-height: 300px;
            padding: 0 24px 20px;
          }
          .faq-answer p {
            color: var(--sf-gray-600);
            font-size: 14px;
            line-height: 1.7;
            margin: 0;
          }

          .support-contact {
            padding: 60px 0;
            background: white;
          }
          .contact-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 24px;
            max-width: 900px;
            margin: 0 auto;
          }
          .contact-card {
            background: var(--sf-gray-50);
            border: var(--sf-border);
            border-radius: var(--sf-radius-2xl);
            padding: 32px 28px;
            text-align: center;
            transition: var(--sf-transition);
          }
          .contact-card:hover {
            transform: translateY(-4px);
            box-shadow: var(--sf-shadow-lg);
            border-color: var(--sf-green-500);
          }
          .contact-icon {
            width: 56px;
            height: 56px;
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 16px;
            font-size: 24px;
          }
          .contact-icon--green { background: var(--sf-info-bg); color: var(--sf-green-500); }
          .contact-icon--blue { background: #e3f2fd; color: #2196F3; }
          .contact-icon--orange { background: #fff3e0; color: var(--sf-warning-500); }
          .contact-card h4 {
            font-size: 17px;
            font-weight: 700;
            color: var(--sf-gray-900);
            margin-bottom: 8px;
          }
          .contact-card p {
            font-size: 14px;
            color: var(--sf-gray-600);
            margin-bottom: 4px;
            line-height: 1.6;
          }
          .contact-card a {
            color: var(--sf-green-500);
            font-weight: 600;
            text-decoration: none;
          }
          .contact-card a:hover {
            text-decoration: underline;
          }

          .no-results {
            text-align: center;
            padding: 48px 20px;
            color: var(--sf-gray-600);
          }
          .no-results h3 {
            font-size: 18px;
            font-weight: 700;
            color: var(--sf-gray-900);
            margin-bottom: 8px;
          }

          @media (max-width: 768px) {
            .support-hero { padding: 60px 0 40px; }
            .support-hero h1 { font-size: 28px; }
            .support-hero p { font-size: 15px; }
            .faq-section { padding: 40px 0 60px; }
            .faq-question { padding: 14px 16px; font-size: 14px; }
            .faq-answer.open { padding: 0 16px 16px; }
            .contact-cards { grid-template-columns: 1fr; }
          }
        `}</style>

        {/* Hero */}
        <section className="support-hero">
          <div className="container">
            <h1>How can we help?</h1>
            <p>Search our FAQ or get in touch with our support team</p>
            <div className="support-search">
              <i className="fi-rs-search support-search-icon"></i>
              <input
                type="text"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="faq-section">
          <div className="container">
            <div className="row">
              <div className="col-lg-10 m-auto">
                {filteredFaqs.length === 0 ? (
                  <div className="no-results">
                    <h3>No results found</h3>
                    <p>Try a different search term or browse the categories below.</p>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="sf-btn sf-btn--green sf-btn--md"
                      style={{ marginTop: '12px' }}
                    >
                      Clear Search
                    </button>
                  </div>
                ) : (
                  filteredFaqs.map((category, catIdx) => (
                    <div key={catIdx} className="faq-category">
                      <h3 className="faq-category-title">{category.category}</h3>
                      {category.items.map((item, itemIdx) => {
                        const key = `${catIdx}-${itemIdx}`;
                        const isOpen = openIndex === key;
                        return (
                          <div key={key} className="faq-item">
                            <button
                              className={`faq-question${isOpen ? ' active' : ''}`}
                              onClick={() => toggle(key)}
                              aria-expanded={isOpen}
                            >
                              <span>{item.q}</span>
                              <i className={`fi-rs-angle-right faq-chevron${isOpen ? ' open' : ''}`}></i>
                            </button>
                            <div className={`faq-answer${isOpen ? ' open' : ''}`}>
                              <p>{item.a}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="support-contact">
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <h2 className="sf-section-header sf-mt-0">Still need help?</h2>
              <p className="sf-text-muted">Our team is here to assist you</p>
            </div>
            <div className="contact-cards">
              <div className="contact-card">
                <div className="contact-icon contact-icon--green">
                  <i className="fi-rs-phone-call"></i>
                </div>
                <h4>Call Us</h4>
                <p>Mon - Fri, 8am - 5pm</p>
                <p><a href="tel:+263782978460">+263 782 978 460</a></p>
              </div>
              <div className="contact-card">
                <div className="contact-icon contact-icon--blue">
                  <i className="fi-rs-envelope"></i>
                </div>
                <h4>Email Support</h4>
                <p>We respond within 24 hours</p>
                <p><a href="mailto:support@snappyfresh.net">support@snappyfresh.net</a></p>
              </div>
              <div className="contact-card">
                <div className="contact-icon contact-icon--orange">
                  <i className="fi-rs-comment-alt"></i>
                </div>
                <h4>WhatsApp</h4>
                <p>Quick responses during business hours</p>
                <p><a href="https://wa.me/263782978460" target="_blank" rel="noopener noreferrer">+263 782 978 460</a></p>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
}
