import React, { useState, useCallback } from 'react';
import { User, Mail, Eye, EyeOff, Phone, Smartphone, Loader } from 'lucide-react';
import { showSuccess, showError, showInfo } from '../../../utils/toastUtils';
import { authAPI, scheduleTokenRefresh } from '../../../services/authService';

const RegisterForm = ({ setIsOpen, setCurrentPage, setCart, switchToLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showOTPField, setShowOTPField] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phoneNo: '',
    otp: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [errors, setErrors] = useState({});
  const [otpCooldown, setOtpCooldown] = useState(0);

  // Stronger password validation (must match backend)
  const validatePassword = (password) => {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@#$%^&*]{6,}$/;
    return regex.test(password);
  };

  const validatePhone = (phone) => /^\d{10}$/.test(phone);
  const validateEmail = (email) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in)$/.test(email);
  const validateName = (name) => name.trim().length >= 2;
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
      // result is now from /user/login → has token, userId, name, etc.
      if (!result.data?.token) {
        throw new Error('No token received');
      }

      const userInfo = {
        userId: result.data.userId,
        name: result.data.name,
        email: result.data.email,
        phoneNo: result.data.phoneNo,
      };

      // Save everything
      localStorage.setItem('user', JSON.stringify(userInfo));
      localStorage.setItem('token', result.data.token);
      localStorage.setItem('refreshToken', result.data.refreshToken || '');
      localStorage.setItem('userId', result.data.userId);
      localStorage.setItem('role', result.data.role);
      localStorage.setItem('name', userInfo.name);
      localStorage.setItem('email', userInfo.email);
      localStorage.setItem('phoneNo', userInfo.phoneNo);

      // Now fetch cart with valid token
      await fetchCart();

      scheduleTokenRefresh();
      window.dispatchEvent(new CustomEvent('userLoggedIn'));
      setCurrentPage('home');

      showSuccess('Welcome! Account created & logged in successfully!');
    await new Promise(r => setTimeout(r, 800)); // Tiny delay so user sees toast
    setIsOpen(false); // Close modal after toast is visible

    } catch (error) {
      console.error('Final setup error:', error);
      showError('Almost there! Please login manually.');
      switchToLogin(); // Optional: switch to login form
    }
  };

  const validateBasicFields = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (!validateName(formData.name)) {
      newErrors.name = 'Name must be at least 2 characters long';
    }

    if (!formData.email) {
      newErrors.email = 'Email address is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Only .com or .in emails allowed (e.g., user@gmail.com)';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be 6+ chars with at least 1 letter & 1 number';
    }

    if (!formData.phoneNo) {
      newErrors.phoneNo = 'Phone number is required';
    } else if (!validatePhone(formData.phoneNo)) {
      newErrors.phoneNo = 'Enter a valid 10-digit phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOTPField = () => {
    const newErrors = {};

    if (!formData.otp) {
      newErrors.otp = 'OTP is required';
    } else if (!validateOTP(formData.otp)) {
      newErrors.otp = 'Enter a valid 6-digit OTP';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOTP = useCallback(async () => {
    if (!validateBasicFields()) return;

    setIsSendingOTP(true);
    try {
      const requestData = {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        phoneNo: formatPhoneNumber(formData.phoneNo),
        password: formData.password,
      };

      const result = await authAPI.requestRegisterOTP(requestData);

      setShowOTPField(true);
      showInfo('OTP sent successfully!');
      setOtpCooldown(60);
      const timer = setInterval(() => setOtpCooldown(prev => prev > 0 ? prev - 1 : 0), 1000);
      setTimeout(() => clearInterval(timer), 61000);
    } catch (error) {
      console.error('OTP Request Error:', error);

      // Handle backend validation errors (e.g., password, email, phone)
      if (error.response?.status === 400 && error.response?.data?.data) {
        const backendErrors = error.response.data.data;
        setErrors(prev => ({ ...prev, ...backendErrors }));
        
        // Show specific message if password is invalid
        if (backendErrors.password) {
          showError(backendErrors.password);
        } else if (backendErrors.email) {
          showError(backendErrors.email);
        } else if (backendErrors.phoneNo) {
          showError(backendErrors.phoneNo);
        } else {
          showError('Please check the highlighted fields');
        }
      } else {
        showError(error.response?.data?.message || 'Failed to send OTP. Try again.');
      }
    } finally {
      setIsSendingOTP(false);
    }
  }, [formData]);

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!validateOTPField()) return;

    setIsVerifyingOTP(true);
    try {
      // Step 1: Verify OTP (this registers the user)
      await authAPI.verifyRegisterOTP(
        formatPhoneNumber(formData.phoneNo),
        formData.otp
      );

      showInfo('OTP verified! Logging you in...');

      // Step 2: Now LOGIN the user using email + password
      const loginResult = await authAPI.loginWithEmail(formData.email, formData.password);

      // Step 3: Use login response (which has token, userId, etc.)
      await handleAuthSuccess(loginResult);

    } catch (error) {
      console.error('Registration/Login Error:', error);
      if (error.response?.data?.message) {
        showError(error.response.data.message);
      } else if (error.message?.includes('timeout')) {
        showError('Request timed out. Please try again.');
      } else {
        showError('Registration failed. Please try again.');
      }
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  const isSendOTPDisabled = () => {
    return isSendingOTP || 
           !formData.name || 
           !formData.email || 
           !formData.password || 
           !formData.phoneNo || 
           formData.phoneNo.length !== 10;
  };

  const isVerifyOTPDisabled = () => {
    return isVerifyingOTP || formData.otp.length !== 6;
  };

  return (
    <div className="lm-body">
      <form className="lm-form-container" onSubmit={(e) => e.preventDefault()}>
        <div className="lm-field-group">
          <label className="lm-field-label">
            <User size={16} />
            Full Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`lm-input ${errors.name ? 'lm-input-error' : ''}`}
            placeholder="Enter your full name"
            disabled={showOTPField || isSendingOTP || isVerifyingOTP}
          />
          {errors.name && <span className="lm-error-message">{errors.name}</span>}
        </div>

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
            placeholder="example@gmail.com"
            disabled={showOTPField || isSendingOTP || isVerifyingOTP}
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
              placeholder="Min 6 chars, 1 letter & 1 number"
              disabled={showOTPField || isSendingOTP || isVerifyingOTP}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="lm-password-toggle"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password && <span className="lm-error-message">{errors.password}</span>}
          {/* <small className="lm-hint">e.g., Pass123, My@12345</small> */}
        </div>

        <div className="lm-field-group">
          <label className="lm-field-label">
            <Phone size={16} />
            Phone Number *
          </label>
          <div className="lm-phone-container">
            <div className="lm-phone-prefix">+91</div>
            <input
              type="tel"
              value={formData.phoneNo}
              onChange={handlePhoneChange}
              className={`lm-input lm-phone-input ${errors.phoneNo ? 'lm-input-error' : ''}`}
              placeholder="10-digit number"
              maxLength="10"
              disabled={showOTPField || isSendingOTP || isVerifyingOTP}
            />
          </div>
          {errors.phoneNo && <span className="lm-error-message">{errors.phoneNo}</span>}
        </div>

        {!showOTPField ? (
          <button
            type="button"
            onClick={handleSendOTP}
            disabled={isSendOTPDisabled()}
            className="lm-submit-btn"
          >
            {isSendingOTP ? (
              <>
                <Loader size={18} className="lm-spinner" />
                Sending OTP...
              </>
            ) : (
              'Send OTP'
            )}
          </button>
        ) : (
          <>
            <div className="lm-field-group">
              <label className="lm-field-label">
                <Smartphone size={16} />
                Enter 6-digit OTP *
              </label>
              <input
                type="text"
                value={formData.otp}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                  handleInputChange('otp', val);
                }}
                className={`lm-input lm-otp-input ${errors.otp ? 'lm-input-error' : ''}`}
                placeholder="000000"
                maxLength="6"
              />
              <div className="lm-otp-footer">
                <span>Sent to +91{formData.phoneNo}</span>
                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={isSendingOTP || otpCooldown > 0}
                  className="lm-resend-btn"
                >
                  {otpCooldown > 0 ? `Resend in ${otpCooldown}s` : 'Resend'}
                </button>
              </div>
              {errors.otp && <span className="lm-error-message">{errors.otp}</span>}
            </div>

            <button
              type="button"
              onClick={handleVerifyOTP}
              disabled={isVerifyOTPDisabled()}
              className="lm-submit-btn"
            >
              {isVerifyingOTP ? (
                <>
                  <Loader size={18} className="lm-spinner" />
                  Creating Account...
                </>
              ) : (
                'Verify OTP & Register'
              )}
            </button>
          </>
        )}

        <div className="lm-switch-section">
          <p className="lm-switch-text">Already have an account?</p>
          <button
            type="button"
            onClick={switchToLogin}
            className="lm-switch-btn"
            disabled={isSendingOTP || isVerifyingOTP}
          >
            Back to Login
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;