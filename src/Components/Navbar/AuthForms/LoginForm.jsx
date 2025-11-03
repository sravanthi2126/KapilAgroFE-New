import React, { useState, useCallback } from 'react';
import { Mail, Smartphone, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import { authAPI, scheduleTokenRefresh } from '../../../services/authService';

const LoginForm = ({ setIsOpen, setCurrentPage, setCart, switchToRegister }) => {
  const [loginMethod, setLoginMethod] = useState('email');
  const [showPassword, setShowPassword] = useState(false);
  const [showOTPField, setShowOTPField] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phoneNo: '',
    otp: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [otpCooldown, setOtpCooldown] = useState(0);

  // Validation functions
  const validatePhone = (phone) => /^\d{10}$/.test(phone);
  const validateEmail = (email) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  const validatePassword = (password) => password.length >= 6;
  const validateOTP = (otp) => /^\d{6}$/.test(otp);

  const clearError = (field) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    clearError(field);
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) {
      setFormData(prev => ({ ...prev, phoneNo: value }));
      clearError('phoneNo');
    }
  };

  const formatPhoneNumber = (phone) => (phone.length === 10 ? `+91${phone}` : phone);

  const fetchCart = async () => {
    try {
      const result = await authAPI.fetchUserCart();
      if (result.status === 'success') {
        const detailedCart = result.data.map((item) => ({
          ...item,
          localQuantity: item.quantity,
          after_discount_price: item.afterDiscountPrice,
          image_url: item.imageUrl,
          product_name: item.productName,
          unit_measurement: item.unitMeasurement,
        }));
        setCart(detailedCart);
      }
    } catch (err) {
      console.error('Failed to fetch cart after login:', err);
    }
  };

  const handleAuthSuccess = async (result) => {
    try {
      const userInfo = {
        userId: result.data.userId,
        name: result.data.name,
        email: result.data.email,
        phoneNo: result.data.phoneNo,
      };

      localStorage.setItem('user', JSON.stringify(userInfo));
      localStorage.setItem('token', result.data.token);
      localStorage.setItem('refreshToken', result.data.refreshToken || '');
      localStorage.setItem('userId', result.data.userId);
      localStorage.setItem('role', result.data.role);
      localStorage.setItem('name', userInfo.name);
      localStorage.setItem('email', userInfo.email);
      localStorage.setItem('phoneNo', userInfo.phoneNo);

      await fetchCart();
      scheduleTokenRefresh();
      window.dispatchEvent(new CustomEvent('userLoggedIn'));
      setCurrentPage('home');
      toast.success('Logged in successfully');
      setIsOpen(false);
    } catch (error) {
      console.error('Error handling auth success:', error);
      toast.error('Login successful but there was an issue loading your data. Please refresh the page.');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (loginMethod === 'email') {
      if (!formData.email) {
        newErrors.email = 'Email address is required';
      } else if (!validateEmail(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }

      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (!validatePassword(formData.password)) {
        newErrors.password = 'Password must be at least 6 characters long';
      }
    } else {
      if (!formData.phoneNo) {
        newErrors.phoneNo = 'Phone number is required';
      } else if (!validatePhone(formData.phoneNo)) {
        newErrors.phoneNo = 'Please enter a valid 10-digit phone number';
      }

      if (showOTPField && !formData.otp) {
        newErrors.otp = 'OTP is required';
      } else if (showOTPField && !validateOTP(formData.otp)) {
        newErrors.otp = 'Please enter a valid 6-digit OTP';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOTP = useCallback(async () => {
    if (!validateForm() || otpCooldown > 0) return;

    setIsLoading(true);
    try {
      await authAPI.requestLoginOTP(formatPhoneNumber(formData.phoneNo));
      setShowOTPField(true);
      toast.info('OTP sent to your phone number');
      setOtpCooldown(60);
      const cooldownTimer = setInterval(() => setOtpCooldown((prev) => prev - 1), 1000);
      setTimeout(() => clearInterval(cooldownTimer), 60000);
    } catch (error) {
      console.error('API error:', error);
      if (error.response?.status === 404) {
        toast.error('Phone number not registered. Please sign up first.');
        switchToRegister();
      } else if (error.message?.includes('timeout')) {
        toast.error('Request timed out. Please check your connection and try again.');
      } else {
        toast.error('Failed to send OTP. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [formData, otpCooldown, validateForm]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      let result;

      if (loginMethod === 'email') {
        result = await authAPI.loginWithEmail(formData.email, formData.password);
        await handleAuthSuccess(result);
      } else if (loginMethod === 'phone' && !showOTPField) {
        await handleSendOTP();
      } else if (loginMethod === 'phone' && showOTPField) {
        result = await authAPI.verifyLoginOTP(formatPhoneNumber(formData.phoneNo), formData.otp);
        await handleAuthSuccess(result);
      }
    } catch (error) {
      console.error('API error:', error);
      if (error.response?.status === 404) {
        toast.error(`${loginMethod === 'email' ? 'Email' : 'Phone number'} not registered. Please sign up first.`);
        switchToRegister();
      } else if (error.message?.includes('timeout')) {
        toast.error('Request timed out. Please check your internet connection and try again.');
      } else {
        toast.error(error.message || 'Failed to process request. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleMethodSwitch = (method) => {
    setLoginMethod(method);
    setShowOTPField(false);
    setFormData({ email: '', password: '', phoneNo: '', otp: '' });
    setErrors({});
  };

  return (
    <div className="lm-body">
      <div className="lm-method-toggle">
        <button
          type="button"
          className={`lm-method-btn ${loginMethod === 'email' ? 'lm-method-btn-active' : ''}`}
          onClick={() => handleMethodSwitch('email')}
          disabled={isLoading}
        >
          <Mail size={16} />
          Email
        </button>
        <button
          type="button"
          className={`lm-method-btn ${loginMethod === 'phone' ? 'lm-method-btn-active' : ''}`}
          onClick={() => handleMethodSwitch('phone')}
          disabled={isLoading}
        >
          <Smartphone size={16} />
          Phone
        </button>
      </div>

      <form onSubmit={handleLoginSubmit} className="lm-form-container">
        {loginMethod === 'email' && (
          <>
            <div className="lm-field-group">
              <label className="lm-field-label">
                <Mail size={16} />
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`lm-input ${errors.email ? 'lm-input-error' : ''}`}
                placeholder="Enter your email address"
                disabled={isLoading}
              />
              {errors.email && <span className="lm-error-message">{errors.email}</span>}
            </div>

            <div className="lm-field-group">
              <label className="lm-field-label">
                <Eye size={16} />
                Password *
              </label>
              <div className="lm-password-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`lm-input lm-password-input ${errors.password ? 'lm-input-error' : ''}`}
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="lm-password-toggle"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <span className="lm-error-message">{errors.password}</span>}
            </div>
          </>
        )}

        {loginMethod === 'phone' && (
          <>
            <div className="lm-field-group">
              <label className="lm-field-label">
                <Smartphone size={16} />
                Phone Number *
              </label>
              <div className="lm-phone-container">
                <div className="lm-phone-prefix">+91</div>
                <input
                  type="tel"
                  value={formData.phoneNo}
                  onChange={handlePhoneChange}
                  className={`lm-input lm-phone-input ${errors.phoneNo ? 'lm-input-error' : ''}`}
                  placeholder="Enter 10-digit number"
                  maxLength="10"
                  disabled={isLoading}
                />
              </div>
              {errors.phoneNo && <span className="lm-error-message">{errors.phoneNo}</span>}
            </div>

            {!showOTPField && (
              <button
                type="button"
                onClick={handleSendOTP}
                disabled={isLoading || !formData.phoneNo || !validatePhone(formData.phoneNo) || otpCooldown > 0}
                className="lm-otp-btn"
              >
                {isLoading ? 'Sending...' : otpCooldown > 0 ? `Resend in ${otpCooldown}s` : 'Send OTP'}
              </button>
            )}

            {showOTPField && (
              <div className="lm-field-group">
                <label className="lm-field-label">
                  <Smartphone size={16} />
                  Enter OTP *
                </label>
                <input
                  type="text"
                  value={formData.otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 6) handleInputChange('otp', value);
                  }}
                  className={`lm-input lm-otp-input ${errors.otp ? 'lm-input-error' : ''}`}
                  placeholder="000000"
                  maxLength="6"
                  disabled={isLoading}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                  <p className="lm-otp-hint">OTP sent to +91{formData.phoneNo}</p>
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={isLoading || otpCooldown > 0}
                    className="lm-resend-btn"
                  >
                    {otpCooldown > 0 ? `Resend in ${otpCooldown}s` : 'Resend'}
                  </button>
                </div>
                {errors.otp && <span className="lm-error-message">{errors.otp}</span>}
              </div>
            )}
          </>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="lm-submit-btn"
        >
          {isLoading ? 'Processing...' : 'Sign In'}
        </button>

        <div className="lm-switch-section">
          <p className="lm-switch-text">Don't have an account?</p>
          <button
            type="button"
            onClick={switchToRegister}
            className="lm-switch-btn"
            disabled={isLoading}
          >
            Create Account
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;