/**
 * Profile Security Settings Page
 * Matches original Angular route: /profile/security
 */

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/layout/Layout';
import apiClient from '../../config/api';
import { toast } from 'react-toastify';
import { logger } from '../../lib/logger';
import InlineFieldError from '../../components/common/InlineFieldError';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function ProfileSecurity() {
  const { user, isAuthenticated } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<any>({});

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container py-5 text-center">
          <h2>Please login to access security settings</h2>
          <a href="/login" className="btn btn-primary mt-3">Login</a>
        </div>
      </Layout>
    );
  }

  const validatePassword = () => {
    const newErrors: any = {};

    if (!security.currentPassword.trim()) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!security.newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    }

    if (security.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }

    if (security.newPassword !== security.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (security.newPassword === security.currentPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordChange = async (e: any) => {
    e.preventDefault();

    if (!validatePassword()) {
      toast.error('Please fix all errors');
      return;
    }

    setIsSaving(true);

    try {
      const cardCode = user?.customer?.cardCode;
      if (!cardCode) {
        throw new Error('User not properly authenticated');
      }

      const payload = {
        cardCode,
        currentPassword: security.currentPassword,
        newPassword: security.newPassword,
      };

      // Call API to change password
      await ( apiClient as any).changePassword(payload);

      toast.success('Password changed successfully!');
      setSecurity({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      logger.error('Password change failed:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to change password';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setSecurity(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev: any) => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  return (
    <Layout>
      <div className="container py-5">
        <div className="row">
          <div className="col-lg-8 mx-auto">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title mb-0">
                  <i className="fi-rs-lock me-2"></i>
                  Security Settings
                </h2>
              </div>

              <div className="card-body">
                <div className="section mb-4">
                  <h5 className="mb-3">Change Password</h5>
                  <p className="text-muted small mb-4">
                    Update your password to keep your account secure
                  </p>

                  {isSaving && <LoadingSpinner />}

                  <form onSubmit={handlePasswordChange}>
                    <div className="mb-3">
                      <label htmlFor="currentPassword" className="form-label">
                        Current Password *
                      </label>
                      <input
                        type="password"
                        className={`form-control ${errors.currentPassword ? 'is-invalid' : ''}`}
                        id="currentPassword"
                        name="currentPassword"
                        value={security.currentPassword}
                        onChange={handleChange}
                        required
                        disabled={isSaving}
                      />
                      {errors.currentPassword && (
                        <InlineFieldError error={errors.currentPassword} />
                      )}
                    </div>

                    <div className="mb-3">
                      <label htmlFor="newPassword" className="form-label">
                        New Password *
                      </label>
                      <input
                        type="password"
                        className={`form-control ${errors.newPassword ? 'is-invalid' : ''}`}
                        id="newPassword"
                        name="newPassword"
                        value={security.newPassword}
                        onChange={handleChange}
                        required
                        disabled={isSaving}
                      />
                      {errors.newPassword && (
                        <InlineFieldError error={errors.newPassword} />
                      )}
                      <small className="text-muted d-block mt-2">
                        • At least 8 characters<br/>
                        • Mix of uppercase and lowercase<br/>
                        • Include numbers and special characters
                      </small>
                    </div>

                    <div className="mb-4">
                      <label htmlFor="confirmPassword" className="form-label">
                        Confirm Password *
                      </label>
                      <input
                        type="password"
                        className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={security.confirmPassword}
                        onChange={handleChange}
                        required
                        disabled={isSaving}
                      />
                      {errors.confirmPassword && (
                        <InlineFieldError error={errors.confirmPassword} />
                      )}
                    </div>

                    <div className="d-grid gap-2">
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isSaving}
                      >
                        {isSaving ? 'Updating...' : 'Change Password'}
                      </button>
                    </div>
                  </form>
                </div>

                <hr className="my-4"/>

                <div className="section">
                  <h5 className="mb-3">Security Tips</h5>
                  <ul className="small text-muted">
                    <li>Use a strong password with a mix of characters</li>
                    <li>Never share your password with anyone</li>
                    <li>Change your password regularly</li>
                    <li>Use a unique password for your account</li>
                    <li>Enable two-factor authentication when available</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
