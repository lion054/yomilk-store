import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../components/layout/Layout';
import PhoneInput from '../components/PhoneInput';
import { toast } from 'react-toastify';
import SEO from '../components/common/SEO';
import apiClient from '../config/api';
import { logger } from '../lib/logger';

const steps = [
  { number: 1, title: 'Company Info', desc: 'Tell us about your business' },
  { number: 2, title: 'Contact Details', desc: 'How can we reach you?' },
  { number: 3, title: 'Products & Address', desc: 'What do you sell?' },
];

const benefits = [
  { icon: '🛒', title: 'Reach More Customers', desc: 'Access thousands of retail and wholesale buyers across Zimbabwe.' },
  { icon: '📦', title: 'We Handle Logistics', desc: 'Our delivery network gets your products to customers fast.' },
  { icon: '📊', title: 'Grow Your Business', desc: 'Get insights, support, and tools to scale your sales.' },
];

export default function SupplierRegister() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    companyName: '',
    tradingName: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    street: '',
    countryCode: '',
    city: '',
    suburb: '',
    productCategories: '',
    message: '',
    agreeToTerms: false,
  });

  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Delivery zones state
  const [countries, setCountries] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [suburbs, setSuburbs] = useState<any[]>([]);

  // Load delivery zones from API with fallback
  useEffect(() => {
    const loadDeliveryZones = async () => {
      try {
        const response = await ( apiClient as any).getDeliveryZones();
        const zones = Array.isArray(response) ? response : [];
        if (zones.length > 0) {
          setCountries(zones);
          return;
        }
      } catch (error) {
        logger.error('Failed to load delivery zones:', error);
      }
      // Fallback: hardcoded Zimbabwe data so dropdowns always work
      setCountries([{
        countryCode: 'ZW',
        countryName: 'Zimbabwe',
        cities: [
          { name: 'Harare', suburbs: [] },
          { name: 'Bulawayo', suburbs: [] },
          { name: 'Chitungwiza', suburbs: [] },
          { name: 'Mutare', suburbs: [] },
          { name: 'Gweru', suburbs: [] },
          { name: 'Masvingo', suburbs: [] },
          { name: 'Kwekwe', suburbs: [] },
          { name: 'Kadoma', suburbs: [] },
        ],
      }]);
    };
    loadDeliveryZones();
  }, []);

  const handleCountryChange = (countryCode: any) => {
    const country = countries.find((c) => c.countryCode === countryCode);
    setCities(country ? country.cities : []);
    setSuburbs([]);
    setFormData((prev) => ({ ...prev, countryCode, city: '', suburb: '' }));
  };

  const handleCityChange = (cityName: any) => {
    const country = countries.find((c: any) => c.countryCode === formData.countryCode);
    if (country) {
      const city = country.cities.find((c: any) => c.name === cityName);
      const citySuburbs = city ? [...city.suburbs].sort((a: any, b: any) => a.name.localeCompare(b.name)) : [];
      setSuburbs(citySuburbs);
    }
    setFormData((prev) => ({ ...prev, city: cityName, suburb: '' }));
  };

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e: any) => {
    const selected = Array.from(e.target.files);
    const maxSize = 10 * 1024 * 1024; // 10MB per file
    const valid = selected.filter((f: any) => {
      if (f.size > maxSize) {
        toast.error(`${f.name} exceeds 10MB limit.`);
        return false;
      }
      return true;
    });
    setFiles((prev) => [...prev, ...valid]);
    e.target.value = '';
  };

  const removeFile = (index: any) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (!formData.companyName.trim()) {
        toast.error('Please enter your company name.');
        return;
      }
    }
    if (currentStep === 2) {
      if (!formData.contactPerson.trim() || !formData.contactEmail.trim() || !formData.contactPhone.trim()) {
        toast.error('Please fill in all required contact fields.');
        return;
      }
    }
    setCurrentStep((s) => Math.min(s + 1, 3));
  };

  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!formData.agreeToTerms) {
      toast.error('Please agree to the terms and conditions.');
      return;
    }

    setLoading(true);

    try {
      // Build multipart form with fields + file attachments
      const payload = new FormData();
      payload.append('companyName', formData.companyName);
      payload.append('tradingName', formData.tradingName);
      payload.append('contactPerson', formData.contactPerson);
      payload.append('contactEmail', formData.contactEmail);
      payload.append('contactPhone', formData.contactPhone);
      payload.append('street', formData.street);
      payload.append('countryCode', formData.countryCode);
      payload.append('city', formData.city);
      payload.append('suburb', formData.suburb);
      payload.append('productCategories', formData.productCategories);
      payload.append('message', formData.message);
      files.forEach((file: any ) => {
        payload.append('attachments', file);
      });

      await ( apiClient as any).submitVendorApplication(payload);

      setSubmitted(true);
      toast.success("Application submitted! We'll be in touch soon.");
    } catch (error: any) {
      toast.error(error?.message || 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="Become a Vendor - Snappy Fresh"
        description="Partner with Snappy Fresh and sell your products to thousands of customers across Zimbabwe."
      />
      <Layout>
        {/* Hero Banner */}
        <section style={{
          background: 'linear-gradient(135deg, #0d6e3f 0%, #1a5c38 50%, #29a56c 100%)',
          padding: '80px 0 60px',
          color: '#fff',
          textAlign: 'center',
        }}>
          <div className="container">
            <h1 style={{ fontSize: '2.4rem', fontWeight: '800', marginBottom: '12px', letterSpacing: '-0.5px' }}>
              Sell on Snappy Fresh
            </h1>
            <p style={{ fontSize: '1.1rem', opacity: 0.92, maxWidth: '520px', margin: '0 auto', lineHeight: '1.6' }}>
              Join Zimbabwe&apos;s fastest-growing online grocery marketplace and reach thousands of new customers.
            </p>
          </div>
        </section>

        {/* Benefits */}
        <section style={{ padding: '48px 0 16px', background: '#f9fafb' }}>
          <div className="container">
            <div className="row justify-content-center">
              {benefits.map((b, i) => (
                <div className="col-md-4 mb-30" key={i}>
                  <div className="sf-card sf-card--flat" style={{ padding: '28px 24px', textAlign: 'center', height: '100%' }}>
                    <div style={{ fontSize: '2.2rem', marginBottom: '12px' }}>{b.icon}</div>
                    <h4 className="sf-card__section-title" style={{ fontSize: '1.05rem', justifyContent: 'center' }}>{b.title}</h4>
                    <p className="sf-text-muted sf-mb-0" style={{ fontSize: '0.9rem', lineHeight: '1.55' }}>{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section style={{ padding: '32px 0 80px', background: '#f9fafb' }}>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8 col-xl-7">

                {submitted ? (
                  <SuccessCard />
                ) : (
                  <div className="sf-card" style={{ padding: '44px 40px' }}>
                    {/* Step Cards */}
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '36px' }}>
                      {steps.map((step: any) => {
                        const isActive = currentStep === step.number;
                        const isCompleted = currentStep > step.number;
                        return (
                          <div
                            key={step.number}
                            onClick={() => {
                              if (isCompleted) setCurrentStep(step.number);
                            }}
                            style={{
                              flex: 1,
                              padding: '16px 14px',
                              borderRadius: '12px',
                              border: isActive
                                ? '2px solid var(--sf-green-500)'
                                : isCompleted
                                  ? '2px solid var(--sf-success-bg)'
                                  : '2px solid var(--sf-gray-200)',
                              background: isActive
                                ? 'linear-gradient(135deg, #f0faf4, #e8f5ee)'
                                : isCompleted
                                  ? '#f8fdf9'
                                  : '#fafbfc',
                              cursor: isCompleted ? 'pointer' : 'default',
                              transition: 'var(--sf-transition-fast)',
                              position: 'relative',
                              overflow: 'hidden',
                            }}
                          >
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              marginBottom: '6px',
                            }}>
                              <div style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.78rem',
                                fontWeight: '700',
                                flexShrink: 0,
                                background: isActive || isCompleted
                                  ? 'var(--sf-green-500)'
                                  : 'var(--sf-gray-300)',
                                color: isActive || isCompleted ? '#fff' : '#999',
                                transition: 'var(--sf-transition-fast)',
                              }}>
                                {isCompleted ? '✓' : step.number}
                              </div>
                              <span style={{
                                fontSize: '0.85rem',
                                fontWeight: '700',
                                color: isActive ? 'var(--sf-gray-900)' : isCompleted ? 'var(--sf-green-500)' : 'var(--sf-gray-500)',
                              }}>
                                {step.title}
                              </span>
                            </div>
                            <p style={{
                              margin: 0,
                              fontSize: '0.76rem',
                              color: isActive ? 'var(--sf-gray-700)' : '#c0c5cc',
                              paddingLeft: '38px',
                              lineHeight: '1.4',
                            }}>
                              {step.desc}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Progress Bar */}
                    <div className="sf-progress" style={{ height: '4px', marginBottom: '32px' }}>
                      <div
                        className="sf-progress__bar sf-progress__bar--green"
                        style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                      />
                    </div>

                    <form onSubmit={handleSubmit}>
                      {/* Step 1: Company Info */}
                      <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
                        <StepHeader title="Company Information" subtitle="Basic details about your business" />
                        <div className="row">
                          <div className="col-sm-6">
                            <FormField label="Company Name" required>
                              <input
                                type="text"
                                name="companyName"
                                value={formData.companyName}
                                onChange={handleChange}
                                required
                                placeholder="e.g., Fresh Farms Pvt Ltd"
                                className="sf-input sf-input--lg"
                              />
                            </FormField>
                          </div>
                          <div className="col-sm-6">
                            <FormField label="Trading Name" required={false}>
                              <input
                                type="text"
                                name="tradingName"
                                value={formData.tradingName}
                                onChange={handleChange}
                                placeholder="If different from company name"
                                className="sf-input sf-input--lg"
                              />
                            </FormField>
                          </div>
                        </div>
                      </div>

                      {/* Step 2: Contact Details */}
                      <div style={{ display: currentStep === 2 ? 'block' : 'none' }}>
                        <StepHeader title="Contact Details" subtitle="How should we get in touch with you?" />
                        <div className="row">
                          <div className="col-sm-6">
                            <FormField label="Contact Person" required>
                              <input
                                type="text"
                                name="contactPerson"
                                value={formData.contactPerson}
                                onChange={handleChange}
                                required
                                placeholder="Full name"
                                className="sf-input sf-input--lg"
                              />
                            </FormField>
                          </div>
                          <div className="col-sm-6">
                            <FormField label="Email Address" required>
                              <input
                                type="email"
                                name="contactEmail"
                                value={formData.contactEmail}
                                onChange={handleChange}
                                required
                                placeholder="you@company.com"
                                className="sf-input sf-input--lg"
                              />
                            </FormField>
                          </div>
                          <div className="col-sm-6">
                            <FormField label="Phone Number" required>
                              <PhoneInput
                                value={formData.contactPhone}
                                onChange={(value) => setFormData((prev) => ({ ...prev, contactPhone: value }))}
                                required
                              />
                            </FormField>
                          </div>
                        </div>
                      </div>

                      {/* Step 3: Products & Address */}
                      <div style={{ display: currentStep === 3 ? 'block' : 'none' }}>
                        <StepHeader title="Products & Address" subtitle="Tell us what you sell and where you're based" />
                        <div className="row">
                          <div className="col-sm-6">
                            <FormField label="Country" required={false}>
                              <select
                                name="countryCode"
                                value={formData.countryCode}
                                onChange={(e) => handleCountryChange(e.target.value)}
                                className="sf-input sf-input--lg"
                              >
                                <option value="">Select Country</option>
                                {countries.map((c: any) => (
                                  <option key={c.countryCode} value={c.countryCode}>{c.countryName}</option>
                                ))}
                              </select>
                            </FormField>
                          </div>
                          <div className="col-sm-6">
                            <FormField label="City" required={false}>
                              <select
                                name="city"
                                value={formData.city}
                                onChange={(e) => handleCityChange(e.target.value)}
                                className="sf-input sf-input--lg"
                              >
                                <option value="">Select City</option>
                                {cities.map((c: any) => (
                                  <option key={c.name} value={c.name}>{c.name}</option>
                                ))}
                              </select>
                            </FormField>
                          </div>
                        </div>
                        {suburbs.length > 0 && (
                          <FormField label="Suburb" required={false}>
                            <select
                              name="suburb"
                              value={formData.suburb}
                              onChange={handleChange}
                              className="sf-input sf-input--lg"
                            >
                              <option value="">Select Suburb</option>
                              {suburbs.map((s: any) => (
                                <option key={s.name} value={s.name}>{s.name}</option>
                              ))}
                            </select>
                          </FormField>
                        )}
                        <div className="row">
                          <div className="col-sm-12">
                            <FormField label="Street Address" required={false}>
                              <input
                                type="text"
                                name="street"
                                value={formData.street}
                                onChange={handleChange}
                                placeholder="Street address"
                                className="sf-input sf-input--lg"
                              />
                            </FormField>
                          </div>
                        </div>
                        <FormField label="Product Categories" required={false}>
                          <input
                            type="text"
                            name="productCategories"
                            value={formData.productCategories}
                            onChange={handleChange}
                            placeholder="e.g., Dairy, Fresh Produce, Beverages"
                            className="sf-input sf-input--lg"
                          />
                        </FormField>
                        <FormField label="Anything else you'd like us to know?" required={false}>
                          <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Tell us about your products, volumes, or any questions..."
                            rows={4}
                            className="sf-textarea"
                          />
                        </FormField>

                        {/* File Attachments */}
                        <FormField label="Attachments" required={false}>
                          <p className="sf-text-muted" style={{ fontSize: '0.82rem', marginBottom: '8px' }}>
                            Upload product catalogues, price lists, certifications, or any supporting documents (max 10MB each).
                          </p>
                          <label
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '10px 20px',
                              border: '2px dashed var(--sf-gray-300)',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '0.88rem',
                              color: 'var(--sf-gray-600)',
                              transition: 'var(--sf-transition-fast)',
                            }}
                          >
                            <span style={{ fontSize: '1.1rem' }}>+</span> Choose Files
                            <input
                              type="file"
                              multiple
                              onChange={handleFileChange}
                              accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.jpg,.jpeg,.png,.zip"
                              style={{ display: 'none' }}
                            />
                          </label>
                          {files.length > 0 && (
                            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {files.map((file, i) => (
                                <div
                                  key={i}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '8px 12px',
                                    background: '#f8f9fa',
                                    borderRadius: '6px',
                                    fontSize: '0.85rem',
                                  }}
                                >
                                  <span style={{ color: 'var(--sf-gray-700)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>
                                    {file.name}
                                    <span style={{ color: 'var(--sf-gray-400)', marginLeft: '6px' }}>
                                      ({(file.size / 1024).toFixed(0)} KB)
                                    </span>
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => removeFile(i)}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: 'var(--sf-danger-500)',
                                      cursor: 'pointer',
                                      fontSize: '1rem',
                                      padding: '0 4px',
                                    }}
                                  >
                                    &times;
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </FormField>

                        {/* Terms */}
                        <div style={{ margin: '24px 0 28px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                          <input
                            type="checkbox"
                            name="agreeToTerms"
                            id="agreeToTerms"
                            checked={formData.agreeToTerms}
                            onChange={handleChange}
                            required
                            style={{ marginTop: '4px', accentColor: 'var(--sf-green-500)', width: '16px', height: '16px', cursor: 'pointer' }}
                          />
                          <label htmlFor="agreeToTerms" className="sf-text-muted" style={{ fontSize: '0.88rem', cursor: 'pointer', lineHeight: '1.5' }}>
                            I agree to the{' '}
                            <Link href="/terms" className="sf-link">Terms & Conditions</Link>
                            {' '}and{' '}
                            <Link href="/privacy-policy" className="sf-link">Privacy Policy</Link>
                          </label>
                        </div>
                      </div>

                      {/* Navigation Buttons */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '8px',
                        gap: '12px',
                      }}>
                        {currentStep > 1 ? (
                          <button
                            type="button"
                            onClick={prevStep}
                            className="sf-btn sf-btn--outline-gray sf-btn--lg"
                          >
                            Back
                          </button>
                        ) : (
                          <div />
                        )}

                        {currentStep < 3 ? (
                          <button
                            type="button"
                            onClick={nextStep}
                            className="sf-btn sf-btn--green sf-btn--lg"
                          >
                            Continue
                          </button>
                        ) : (
                          <button
                            type="submit"
                            disabled={loading}
                            className="sf-btn sf-btn--green sf-btn--lg"
                          >
                            {loading ? 'Submitting...' : 'Submit Application'}
                          </button>
                        )}
                      </div>

                      {/* Contact alternative */}
                      <p className="sf-text-muted" style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.85rem' }}>
                        Prefer email? Reach us at{' '}
                        <a href="mailto:operations@snappyfresh.net" className="sf-link">
                          operations@snappyfresh.net
                        </a>
                      </p>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
}

function SuccessCard() {
  return (
    <div className="sf-card" style={{ padding: '60px 40px', textAlign: 'center' }}>
      <div style={{
        width: '72px',
        height: '72px',
        borderRadius: '50%',
        background: 'var(--sf-gradient-green)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 24px',
        fontSize: '2rem',
        color: '#fff',
      }}>
        ✓
      </div>
      <h2 className="sf-card__title" style={{ marginBottom: '12px' }}>
        Application Received!
      </h2>
      <p className="sf-text-muted" style={{ fontSize: '1rem', maxWidth: '400px', margin: '0 auto 28px', lineHeight: '1.6' }}>
        Thank you for your interest in partnering with Snappy Fresh. Our operations team will review your application and get back to you within 2-3 business days.
      </p>
      <Link href="/" className="sf-btn sf-btn--green sf-btn--lg">
        Back to Home
      </Link>
    </div>
  );
}

function StepHeader({ title, subtitle }: any) {
  return (
    <div className="sf-mb-6">
      <h3 className="sf-card__section-title" style={{ fontSize: '1.15rem' }}>{title}</h3>
      <p className="sf-text-muted sf-mb-0" style={{ fontSize: '0.88rem' }}>{subtitle}</p>
    </div>
  );
}

function FormField({ label, required, children }: any) {
  return (
    <div className="sf-form-group">
      <label className="sf-label">
        {label}
        {required && <span style={{ color: 'var(--sf-danger-500)', marginLeft: '3px' }}>*</span>}
      </label>
      {children}
    </div>
  );
}
