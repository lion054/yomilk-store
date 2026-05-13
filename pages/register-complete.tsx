/**
 * Register Complete Page - Extended registration form
 * Matches original Angular route: /register-complete
 */

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

/**
 * Extended registration form with all fields
 * Same as register.js but with complete flow
 */
export default function RegisterComplete() {
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (redirectTimeoutRef.current) clearTimeout(redirectTimeoutRef.current); }, []);

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
    agreeTerms: false,
  });

  const { register: registerUser } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { fieldErrors, validateAll } = useFormValidation(registerSchema);

  const handleChange = (e: any) => {
    const { name, type, checked, value } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: fieldValue
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: fieldValue
      }));
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!validateAll(formData).success) {
      toast.error('Please fix all errors');
      return;
    }

    setIsSubmitting(true);
    try {
      await registerUser(formData as any);
      toast.success('Registration successful! Redirecting...');
      redirectTimeoutRef.current = setTimeout(() => router.push('/register/verify'), 1500);
    } catch (error: any) {
      toast.error(error?.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <SEO {...(pageSeoConfig as any)['/register-complete'] || (pageSeoConfig as any)['/register'] || {}} />
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <h1 className="mb-4 fw-bold">Complete Registration</h1>
            <form onSubmit={handleSubmit} className="register-form">
              {/* Personal Information */}
              <div className="form-section mb-4">
                <h5 className="mb-3">Personal Information</h5>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="firstName" className="form-label">First Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                    {fieldErrors.firstName && <InlineFieldError error={fieldErrors.firstName} />}
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="lastName" className="form-label">Last Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                    {fieldErrors.lastName && <InlineFieldError error={fieldErrors.lastName} />}
                  </div>
                </div>

                <div className="form-check mt-3">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="isCompany"
                    name="isCompany"
                    checked={formData.isCompany}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="isCompany">
                    Register as Company
                  </label>
                </div>

                {formData.isCompany && (
                  <>
                    <div className="row g-3 mt-2">
                      <div className="col-md-6">
                        <label htmlFor="companyName" className="form-label">Company Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          id="companyName"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleChange}
                          required={formData.isCompany}
                        />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="tin" className="form-label">TIN</label>
                        <input
                          type="text"
                          className="form-control"
                          id="tin"
                          name="tin"
                          value={formData.tin}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="vatNumber" className="form-label">VAT Number</label>
                        <input
                          type="text"
                          className="form-control"
                          id="vatNumber"
                          name="vatNumber"
                          value={formData.vatNumber}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Contact Information */}
              <div className="form-section mb-4">
                <h5 className="mb-3">Contact Information</h5>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="email" className="form-label">Email Address *</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                    {fieldErrors.email && <InlineFieldError error={fieldErrors.email} />}
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="phoneNumber" className="form-label">Phone Number *</label>
                    <PhoneInput
                      value={formData.phoneNumber}
                      onChange={(phone) => setFormData(prev => ({ ...prev, phoneNumber: phone }))}
                    />
                    {fieldErrors.phoneNumber && <InlineFieldError error={fieldErrors.phoneNumber} />}
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="whatsAppNumber" className="form-label">WhatsApp Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      id="whatsAppNumber"
                      name="whatsAppNumber"
                      value={formData.whatsAppNumber}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Security */}
              <div className="form-section mb-4">
                <h5 className="mb-3">Security</h5>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="password" className="form-label">Password *</label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    {fieldErrors.password && <InlineFieldError error={fieldErrors.password} />}
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="confirmPassword" className="form-label">Confirm Password *</label>
                    <input
                      type="password"
                      className="form-control"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                    {fieldErrors.confirmPassword && <InlineFieldError error={fieldErrors.confirmPassword} />}
                  </div>
                </div>
                <PasswordChecklist password={formData.password} />
              </div>

              {/* Address Information */}
              <div className="form-section mb-4">
                <h5 className="mb-3">Billing Address</h5>
                <div className="row g-3">
                  <div className="col-12">
                    <label htmlFor="billAddressLine1" className="form-label">Address Line *</label>
                    <input
                      type="text"
                      className="form-control"
                      id="billAddressLine1"
                      name="billToAddress.addressLine1"
                      value={formData.billToAddress.addressLine1}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="billCity" className="form-label">City *</label>
                    <input
                      type="text"
                      className="form-control"
                      id="billCity"
                      name="billToAddress.city"
                      value={formData.billToAddress.city}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="billSuburb" className="form-label">Suburb</label>
                    <input
                      type="text"
                      className="form-control"
                      id="billSuburb"
                      name="billToAddress.suburb"
                      value={formData.billToAddress.suburb}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="billCountry" className="form-label">Country</label>
                    <input
                      type="text"
                      className="form-control"
                      id="billCountry"
                      name="billToAddress.countryName"
                      value={formData.billToAddress.countryName}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div className="form-check mb-4">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="agreeTerms"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  required
                />
                <label className="form-check-label" htmlFor="agreeTerms">
                  I agree to the <Link href="/terms">Terms of Service</Link> and <Link href="/privacy-policy">Privacy Policy</Link> *
                </label>
              </div>

              {/* Submit */}
              <div className="d-grid gap-2 mb-3">
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating Account...' : 'Complete Registration'}
                </button>
              </div>

              <p className="text-center">
                Already have an account? <Link href="/login">Login here</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
