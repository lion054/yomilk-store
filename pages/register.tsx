import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/layout/Layout';
import PhoneInput from '../components/PhoneInput';
import { toast } from 'react-toastify';
import SEO from '../components/common/SEO';
import { pageSeoConfig } from '../config/seo';
import { registerSchema } from '../lib/validation';
import { useFormValidation } from '../hooks/useFormValidation';
import InlineFieldError from '../components/common/InlineFieldError';
import PasswordChecklist from '../components/common/PasswordChecklist';
import apiClient from '../config/api';
import { logger } from '../lib/logger';

const STEPS = [
  { key: 'personal', label: 'Personal', icon: 'fi-rs-user' },
  { key: 'contact', label: 'Contact', icon: 'fi-rs-envelope' },
  { key: 'address', label: 'Address', icon: 'fi-rs-marker' },
  { key: 'security', label: 'Security', icon: 'fi-rs-lock' },
];

export default function Register() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    email: '',
    phoneNumber: '',
    whatsAppNumber: '',
    isCompany: false,
    tin: '',
    vatNumber: '',
    password: '',
    confirmPassword: '',
    isSeparateShipping: false,
    billToAddress: {
      addressLine1: '',
      suburb: '',
      city: '',
      countryCode: '',
      countryName: '',
    },
    shipToAddress: {
      addressLine1: '',
      suburb: '',
      city: '',
      countryCode: '',
      countryName: '',
    },
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [apiError, setApiError] = useState('');
  const submittingRef = useRef(false);
  const { register } = useAuth();
  const router = useRouter();
  const { fieldErrors, validateField, validateAll, clearFieldError } = useFormValidation(registerSchema, {
    getFormData: () => formData,
  });

  // Delivery zones state
  const [countries, setCountries] = useState<any[]>([]);
  const [billCities, setBillCities] = useState<any[]>([]);
  const [billSuburbs, setBillSuburbs] = useState<any[]>([]);
  const [shipCities, setShipCities] = useState<any[]>([]);
  const [shipSuburbs, setShipSuburbs] = useState<any[]>([]);
  const [zonesLoading, setZonesLoading] = useState(true);

  useEffect(() => {
    const loadDeliveryZones = async () => {
      try {
        const response = await ( apiClient as any).getDeliveryZones();
        const zones = Array.isArray(response) ? response : response?.data || [];
        if (zones.length > 0) {
          setCountries(zones);
          const firstCountry = zones[0];
          const firstCity = firstCountry.cities?.[0];
          setFormData((prev) => ({
            ...prev,
            billToAddress: {
              ...prev.billToAddress,
              countryCode: firstCountry.countryCode,
              suburb: '',
              city: firstCity?.name || '',
            },
            shipToAddress: {
              ...prev.shipToAddress,
              countryCode: firstCountry.countryCode,
              suburb: '',
              city: firstCity?.name || '',
            },
          }));
          setBillCities(firstCountry.cities || []);
          setShipCities(firstCountry.cities || []);
          if (firstCity?.suburbs) {
            const sorted = [...firstCity.suburbs].sort((a, b) => a.name.localeCompare(b.name));
            setBillSuburbs(sorted);
            setShipSuburbs(sorted);
          }
        } else {
          logger.warn('No delivery zones available');
        }
      } catch (error) {
        logger.error('Failed to load delivery zones:', error);
        // Continue anyway - allow registration with manual country/city entry
      } finally {
        setZonesLoading(false);
      }
    };
    loadDeliveryZones();
  }, []);

  const handleBillCountryChange = (countryCode: any) => {
    const country = countries.find((c) => c.countryCode === countryCode);
    setBillCities(country ? country.cities : []);
    setBillSuburbs([]);
    setFormData((prev) => ({
      ...prev,
      billToAddress: { ...prev.billToAddress, countryCode, city: '', suburb: '' },
    }));
  };

  const handleBillCityChange = (cityName: any) => {
    const country = countries.find((c) => c.countryCode === formData.billToAddress.countryCode);
    if (country) {
      const city = country.cities.find((c: any) => c.name === cityName);
      const suburbs = city ? [...city.suburbs].sort((a, b) => a.name.localeCompare(b.name)) : [];
      setBillSuburbs(suburbs);
    }
    setFormData((prev) => ({
      ...prev,
      billToAddress: { ...prev.billToAddress, city: cityName, suburb: '' },
    }));
  };

  const handleShipCountryChange = (countryCode: any) => {
    const country = countries.find((c) => c.countryCode === countryCode);
    setShipCities(country ? country.cities : []);
    setShipSuburbs([]);
    setFormData((prev) => ({
      ...prev,
      shipToAddress: { ...prev.shipToAddress, countryCode, city: '', suburb: '' },
    }));
  };

  const handleShipCityChange = (cityName: any) => {
    const country = countries.find((c) => c.countryCode === formData.shipToAddress.countryCode);
    if (country) {
      const city = country.cities.find((c: any) => c.name === cityName);
      const suburbs = city ? [...city.suburbs].sort((a, b) => a.name.localeCompare(b.name)) : [];
      setShipSuburbs(suburbs);
    }
    setFormData((prev) => ({
      ...prev,
      shipToAddress: { ...prev.shipToAddress, city: cityName, suburb: '' },
    }));
  };

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: { ...(prev as any)[parent], [child]: val },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: val }));
    }
    clearFieldError(name);
    if (apiError) setApiError('');
  };

  const canProceed = () => {
    if (step === 0) return formData.firstName.trim() && formData.lastName.trim();
    if (step === 1) return formData.email.trim() && formData.phoneNumber;
    if (step === 2) {
      const hasAddress = formData.billToAddress.city.trim() && formData.billToAddress.addressLine1.trim();
      if (countries.length === 0) return hasAddress;  // API failed — relax countryCode requirement
      return formData.billToAddress.countryCode && hasAddress;
    }
    return true;
  };

  const nextStep = () => {
    if (!canProceed()) {
      toast.error('Please fill in all required fields before continuing.');
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (submittingRef.current) return;
    submittingRef.current = true;

    if (!agreeTerms) {
      submittingRef.current = false;
      toast.error('Please agree to the terms & conditions.');
      return;
    }

    const validation = validateAll(formData);
    if (!validation.success) {
      const firstError = validation.errors?.[0];
      toast.error(firstError?.message || 'Please check your form and fill in all required fields.');
      submittingRef.current = false;
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      submittingRef.current = false;
      return;
    }

    if (!formData.phoneNumber || formData.phoneNumber.length < 10) {
      toast.error('Please enter a valid phone number');
      submittingRef.current = false;
      return;
    }

    setLoading(true);

    try {
      // Ensure countries data is available
      if (!countries || countries.length === 0) {
        logger.warn('Countries array is empty or not loaded');
        toast.error('Unable to load delivery zones. Please refresh the page and try again.');
        throw new Error('Delivery zones not loaded');
      }

      const billCountry = countries.find((c) => c.countryCode === formData.billToAddress.countryCode);
      if (!billCountry) {
        logger.warn('Selected country not found:', formData.billToAddress.countryCode);
        toast.error('Please select a valid country for billing address.');
        throw new Error('Invalid billing country');
      }

      const billToAddress = {
        ...formData.billToAddress,
        countryName: billCountry.countryName || '',
      };

      let shipToAddress;
      if (formData.isSeparateShipping) {
        const shipCountry = countries.find((c) => c.countryCode === formData.shipToAddress.countryCode);
        if (!shipCountry) {
          logger.warn('Selected shipping country not found:', formData.shipToAddress.countryCode);
          toast.error('Please select a valid country for shipping address.');
          throw new Error('Invalid shipping country');
        }
        shipToAddress = {
          ...formData.shipToAddress,
          countryName: shipCountry.countryName || '',
        };
      } else {
        shipToAddress = { ...billToAddress };
      }

      const siteUrl = process.env['NEXT_PUBLIC_SITE_URL'] || 'https://snappyfresh.net/';
      const phoneNumber = String(formData.phoneNumber || '').trim();
      const whatsAppNumber = String(formData.whatsAppNumber || phoneNumber).trim();

      const userData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        companyName: formData.isCompany ? formData.companyName.trim() : '',
        email: formData.email.trim().toLowerCase(),
        phoneNumber,
        whatsAppNumber,
        isCompany: formData.isCompany,
        tin: formData.isCompany ? formData.tin.trim() : '',
        vatNumber: formData.isCompany ? formData.vatNumber.trim() : '',
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        verificationUrl: `${siteUrl}register/verify`,
        isSeparateShipping: formData.isSeparateShipping,
        billToAddress,
        shipToAddress,
        notes: formData.notes.trim(),
      };

      // Ensure this matches oldyomik required formats
      if (!userData.whatsAppNumber) {
        userData.whatsAppNumber = userData.phoneNumber;
      }


      logger.debug('Submitting registration with data:', userData);
      const result = await register(userData);
      logger.debug('Registration result:', result);

      const getRegisterToastMessage = () => {
        if (!result) {
          return { type: 'error', text: 'Unknown registration error' };
        }

        if (result.success) {
          return { type: 'success', text: 'Registration successful! Please check your email to verify your account.' };
        }

        const errorMsg = String(result.error || result.message || 'Registration failed');
        const code = (result as any).errorCode || 'UNKNOWN';

        if (code === 'DUPLICATE_ACCOUNT' || errorMsg.toLowerCase().includes('already exists') || errorMsg.toLowerCase().includes('duplicate')) {
          return { type: 'error', text: 'An account with this email or phone number already exists. Please log in instead.' };
        }

        if (code === 'VALIDATION_ERROR') {
          if (errorMsg.toLowerCase().includes('password')) {
            return { type: 'error', text: 'Password does not meet requirements. Please use at least 8 characters with uppercase, lowercase, and numbers.' };
          }
          if (errorMsg.toLowerCase().includes('email')) {
            return { type: 'error', text: 'Please enter a valid email address.' };
          }
          if (errorMsg.toLowerCase().includes('phone')) {
            return { type: 'error', text: 'Please enter a valid phone number.' };
          }
          return { type: 'error', text: errorMsg };
        }

        if (code === 'NETWORK_OR_SERVER') {
          return { type: 'error', text: 'Network error or server issue. Please try again in a moment.' };
        }

        return { type: 'error', text: errorMsg };
      };

      const toastMessage = getRegisterToastMessage();
      if (toastMessage.type === 'success') {
        toast.success(toastMessage.text);
        setApiError('');
      } else {
        toast.error(toastMessage.text);
        setApiError(toastMessage.text);
      }

      if (result.success) {
        router.push(`/register/verify?email=${encodeURIComponent(formData.email)}`);
      }
    } catch (error: any) {
      logger.error('Registration error:', error);
      const msg = error?.message || error?.toString() || 'Unknown error';
      logger.error('Error details:', { message: msg, stack: error?.stack });
      // Only show generic toast if it's not a validation/early-exit error already toasted above
      if (!msg.includes('Delivery zones') && !msg.includes('Invalid billing') && !msg.includes('Invalid shipping')) {
        toast.error(`Registration failed: ${msg}`);
      }
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  };

  const registerSeoConfig = pageSeoConfig['/register'];

  return (
    <>
      <SEO {...registerSeoConfig} />
      <Layout>

        <div className="reg-wrapper">

          {/* ── Sidebar ── */}
          <div className="reg-sidebar">
            <div className="sidebar-brand">
              <div className="sidebar-brand-dot">🛒</div>
              <span className="sidebar-brand-name">Snappy<span>Fresh</span></span>
            </div>

            <h2 className="sidebar-headline">
              Fresh groceries,<br /><em>delivered in a snap.</em>
            </h2>
            <p className="sidebar-sub">
              Join thousands of customers across Zimbabwe. Create your account and start shopping today.
            </p>

            <nav className="reg-step-nav">
              {STEPS.map((s, i) => (
                <>
                  <div
                    key={s.key}
                    className={`reg-step-item ${i === step ? 'active' : ''} ${i < step ? 'completed' : ''} ${i < step ? 'clickable' : ''}`}
                    onClick={() => { if (i < step) setStep(i); }}
                  >
                    <div className="reg-step-dot">
                      {i < step
                        ? <i className="fi-rs-check" style={{ fontSize: 11 }}></i>
                        : <i className={s.icon}></i>
                      }
                    </div>
                    <div className="step-text">
                      <span className="reg-step-label">{s.label}</span>
                    </div>
                  </div>
                  {i < STEPS.length - 1 && <div className="step-connector" key={`conn-${i}`} />}
                </>
              ))}
            </nav>

            <div className="sidebar-footer">
              The freshest milk in Zimbabwe since 2012.
            </div>
          </div>

          {/* ── Main ── */}
          <div className="reg-main">
            <div className="reg-card">

              <div className="reg-header">
                <div className="reg-eyebrow">Step {step + 1} of {STEPS.length} — {STEPS[step]?.label}</div>
                <h1>Create your account</h1>
                <p>Already have an account? <Link href="/login">Sign in</Link></p>
              </div>

              {/* Segmented progress */}
              <div className="reg-progress-track">
                {STEPS.map((s, i) => (
                  <div key={s.key} className={`prog-seg ${i < step ? 'done' : ''} ${i === step ? 'active' : ''}`}>
                    <div className="prog-seg-fill" />
                  </div>
                ))}
              </div>

              {/* Mobile steps */}
              <div className="reg-steps-mobile">
                {STEPS.map((s, i) => (
                  <div
                    key={s.key}
                    className={`step-pill ${i === step ? 'active' : ''} ${i < step ? 'completed' : ''} ${i < step ? 'clickable' : ''}`}
                    onClick={() => { if (i < step) setStep(i); }}
                  >
                    {i < step ? '✓' : s.label}
                  </div>
                ))}
              </div>

              <form onSubmit={handleSubmit} noValidate>

                {apiError && (
                  <div style={{
                    background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10,
                    padding: '12px 14px', marginBottom: 16, fontSize: 13, color: '#991b1b',
                    display: 'flex', alignItems: 'flex-start', gap: 8, lineHeight: 1.5,
                  }}>
                    <i className="fi-rs-exclamation" style={{ flexShrink: 0, marginTop: 2 }}></i>
                    <span>{apiError}</span>
                  </div>
                )}

                {/* ── Step 1: Personal ── */}
                {step === 0 && (
                  <div>
                    <div className="reg-section-title"><i className="fi-rs-user"></i> Personal Information</div>
                    <div className="field-row">
                      <div className="field-group">
                        <label>First Name <span className="req">*</span></label>
                        <input
                          type="text"
                          name="firstName"
                          placeholder="John"
                          className={fieldErrors.firstName ? 'field-has-error' : ''}
                          value={formData.firstName}
                          onChange={handleChange}
                          onBlur={() => validateField('firstName', formData.firstName)}
                          required
                        />
                        <InlineFieldError error={fieldErrors.firstName} />
                      </div>
                      <div className="field-group">
                        <label>Last Name <span className="req">*</span></label>
                        <input
                          type="text"
                          name="lastName"
                          placeholder="Doe"
                          className={fieldErrors.lastName ? 'field-has-error' : ''}
                          value={formData.lastName}
                          onChange={handleChange}
                          onBlur={() => validateField('lastName', formData.lastName)}
                          required
                        />
                        <InlineFieldError error={fieldErrors.lastName} />
                      </div>
                    </div>

                    <div className="toggle-row" onClick={() => setFormData((prev) => ({ ...prev, isCompany: !prev.isCompany }))}>
                      <div className="toggle-switch">
                        <input type="checkbox" checked={formData.isCompany} readOnly />
                        <span className="toggle-slider"></span>
                      </div>
                      <span className="toggle-text">Register as a company</span>
                    </div>

                    {formData.isCompany && (
                      <>
                        <div className="field-group">
                          <label>Company Name</label>
                          <input type="text" name="companyName" placeholder="Company name (optional)" value={formData.companyName} onChange={handleChange} />
                        </div>
                        <div className="field-row">
                          <div className="field-group">
                            <label>TIN</label>
                            <input type="text" name="tin" placeholder="Tax ID (optional)" value={formData.tin} onChange={handleChange} />
                          </div>
                          <div className="field-group">
                            <label>VAT Number</label>
                            <input type="text" name="vatNumber" placeholder="VAT number (optional)" value={formData.vatNumber} onChange={handleChange} />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* ── Step 2: Contact ── */}
                {step === 1 && (
                  <div>
                    <div className="reg-section-title"><i className="fi-rs-envelope"></i> Contact Details</div>
                    <div className="field-group">
                      <label>Email Address <span className="req">*</span></label>
                      <input
                        type="email"
                        name="email"
                        placeholder="you@example.com"
                        className={fieldErrors.email ? 'field-has-error' : ''}
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={() => validateField('email', formData.email)}
                        required
                      />
                      <InlineFieldError error={fieldErrors.email} />
                    </div>

                    <div className="field-group">
                      <PhoneInput
                        value={formData.phoneNumber}
                        onChange={(value) => {
                          if (value) {
                            setFormData((prev) => ({ ...prev, phoneNumber: value, whatsAppNumber: value }));
                            clearFieldError('phoneNumber');
                          }
                        }}
                        placeholder="Enter phone number"
                        label="Phone Number"
                        required={true}
                      />
                      <InlineFieldError error={fieldErrors.phoneNumber} />
                    </div>
                  </div>
                )}

                {/* ── Step 3: Address ── */}
                {step === 2 && (
                  <div>
                    {zonesLoading && (
                      <div style={{ background: '#e3f2fd', border: '1px solid #90caf9', borderRadius: 8, padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                        <div className="spinner-border spinner-border-sm" role="status" style={{ width: 16, height: 16 }}>
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <span>Loading delivery zones...</span>
                      </div>
                    )}
                    <div className="reg-section-title"><i className="fi-rs-marker"></i> Delivery Address</div>

                    <div className="address-section">
                      <h5><i className="fi-rs-home"></i> Billing Address</h5>
                      <div className="field-row">
                        <div className="field-group">
                          <label>Country <span className="req">*</span></label>
                          <select value={formData.billToAddress.countryCode} onChange={(e) => handleBillCountryChange(e.target.value)} required>
                            <option value="">Select Country</option>
                            {countries.map((c: any) => (
                              <option key={c.countryCode} value={c.countryCode}>{c.countryName}</option>
                            ))}
                          </select>
                        </div>
                        {billCities.length > 0 && (
                          <div className="field-group">
                            <label>City <span className="req">*</span></label>
                            <select value={formData.billToAddress.city} onChange={(e) => handleBillCityChange(e.target.value)} required>
                              <option value="">Select City</option>
                              {billCities.map((c: any) => (
                                <option key={c.name} value={c.name}>{c.name}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                      {billSuburbs.length > 0 && (
                        <div className="field-group">
                          <label>Suburb <span className="req">*</span></label>
                          <select name="billToAddress.suburb" value={formData.billToAddress.suburb} onChange={handleChange} required>
                            <option value="">Select Suburb</option>
                            {billSuburbs.map((s, idx) => (
                              <option key={`${s.name}-${idx}`} value={s.name}>{s.name}</option>
                            ))}
                          </select>
                        </div>
                      )}
                      <div className="field-group">
                        <label>Street Address <span className="req">*</span></label>
                        <input type="text" name="billToAddress.addressLine1" placeholder="123 Main Street" value={formData.billToAddress.addressLine1} onChange={handleChange} required />
                      </div>
                    </div>

                    <div className="toggle-row" onClick={() => setFormData((prev) => ({ ...prev, isSeparateShipping: !prev.isSeparateShipping }))}>
                      <div className="toggle-switch">
                        <input type="checkbox" checked={formData.isSeparateShipping} readOnly />
                        <span className="toggle-slider"></span>
                      </div>
                      <span className="toggle-text">Ship to a different address</span>
                    </div>

                    {formData.isSeparateShipping && (
                      <div className="address-section">
                        <h5><i className="fi-rs-truck-side"></i> Shipping Address</h5>
                        <div className="field-row">
                          <div className="field-group">
                            <label>Country <span className="req">*</span></label>
                            <select value={formData.shipToAddress.countryCode} onChange={(e) => handleShipCountryChange(e.target.value)} required>
                              <option value="">Select Country</option>
                              {countries.map((c: any) => (
                                <option key={c.countryCode} value={c.countryCode}>{c.countryName}</option>
                              ))}
                            </select>
                          </div>
                          {shipCities.length > 0 && (
                            <div className="field-group">
                              <label>City <span className="req">*</span></label>
                              <select value={formData.shipToAddress.city} onChange={(e) => handleShipCityChange(e.target.value)} required>
                                <option value="">Select City</option>
                                {shipCities.map((c: any) => (
                                  <option key={c.name} value={c.name}>{c.name}</option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                        {shipSuburbs.length > 0 && (
                          <div className="field-group">
                            <label>Suburb <span className="req">*</span></label>
                            <select name="shipToAddress.suburb" value={formData.shipToAddress.suburb} onChange={handleChange} required>
                              <option value="">Select Suburb</option>
                              {shipSuburbs.map((s, idx) => (
                                <option key={`${s.name}-${idx}`} value={s.name}>{s.name}</option>
                              ))}
                            </select>
                          </div>
                        )}
                        <div className="field-group">
                          <label>Street Address <span className="req">*</span></label>
                          <input type="text" name="shipToAddress.addressLine1" placeholder="123 Main Street" value={formData.shipToAddress.addressLine1} onChange={handleChange} required />
                        </div>
                      </div>
                    )}

                    <div className="field-group">
                      <label>Notes</label>
                      <textarea name="notes" placeholder="Delivery instructions or special requests (optional)" value={formData.notes} onChange={handleChange} rows={3} />
                    </div>
                  </div>
                )}

                {/* ── Step 4: Security ── */}
                {step === 3 && (
                  <div>
                    <div className="reg-section-title"><i className="fi-rs-lock"></i> Set Your Password</div>
                    <div className="field-row">
                      <div className="field-group">
                        <label>Password <span className="req">*</span></label>
                        <div className="password-wrap">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            placeholder="Create a password"
                            className={fieldErrors.password ? 'field-has-error' : ''}
                            value={formData.password}
                            onChange={handleChange}
                            onBlur={() => validateField('password', formData.password)}
                            required
                          />
                          <button type="button" className="pw-toggle" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide' : 'Show'}>
                            <i className={showPassword ? 'fi-rs-eye-crossed' : 'fi-rs-eye'}></i>
                          </button>
                        </div>
                        <PasswordChecklist password={formData.password} />
                        <InlineFieldError error={fieldErrors.password} />
                      </div>
                      <div className="field-group">
                        <label>Confirm Password <span className="req">*</span></label>
                        <div className="password-wrap">
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            placeholder="Confirm your password"
                            className={fieldErrors.confirmPassword ? 'field-has-error' : ''}
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            onBlur={() => validateField('confirmPassword', formData.confirmPassword)}
                            required
                          />
                          <button type="button" className="pw-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)} aria-label={showConfirmPassword ? 'Hide' : 'Show'}>
                            <i className={showConfirmPassword ? 'fi-rs-eye-crossed' : 'fi-rs-eye'}></i>
                          </button>
                        </div>
                        <InlineFieldError error={fieldErrors.confirmPassword} />
                      </div>
                    </div>

                    <hr className="divider" />

                    <div className="terms-row">
                      <input
                        type="checkbox"
                        id="agreeTerms"
                        className="custom-checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                      />
                      <label htmlFor="agreeTerms">
                        I agree to the <Link href="/terms">Terms & Conditions</Link> and <Link href="/privacy-policy">Privacy Policy</Link>
                      </label>
                    </div>
                  </div>
                )}

                {/* ── Actions ── */}
                <div className="reg-actions">
                  {step > 0 ? (
                    <button type="button" className="btn-back" onClick={prevStep}>← Back</button>
                  ) : (
                    <div />
                  )}
                  {step < STEPS.length - 1 ? (
                    <button type="button" className="btn-next" onClick={nextStep}>
                      Continue <span className="btn-arrow"><i className="fi-rs-arrow-right" style={{ fontSize: 10 }}></i></span>
                    </button>
                  ) : (
                    <button type="submit" className="btn-submit" disabled={loading || !agreeTerms}>
                      {loading ? 'Creating Account…' : 'Create Account'}
                    </button>
                  )}
                </div>

              </form>
            </div>
          </div>

        </div>
      </Layout>
    </>
  );
}
