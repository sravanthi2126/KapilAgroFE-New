import React, { useState, useCallback } from 'react';
import { User, Mail, Eye, EyeOff, Phone, Smartphone } from 'lucide-react';
import { toast } from 'react-toastify';
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
  const [errors, setErrors] = useState({});
  const [otpCooldown, setOtpCooldown] = useState(0);

  // Validation functions
  const validatePhone = (phone) => /^\d{10}$/.test(phone);
  const validateEmail = (email) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in)$/.test(email);
  const validatePassword = (password) => password.length >= 6;
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
      toast.success('Account created successfully!');
      setIsOpen(false);
    } catch (error) {
      console.error('Error handling auth success:', error);
      toast.error('Registration successful but there was an issue loading your data. Please refresh the page.');
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
      newErrors.email = 'Please enter a valid email address with .com or .in domain';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    if (!formData.phoneNo) {
      newErrors.phoneNo = 'Phone number is required';
    } else if (!validatePhone(formData.phoneNo)) {
      newErrors.phoneNo = 'Please enter a valid 10-digit phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOTPField = () => {
    const newErrors = {};

    if (!formData.otp) {
      newErrors.otp = 'OTP is required';
    } else if (!validateOTP(formData.otp)) {
      newErrors.otp = 'Please enter a valid 6-digit OTP';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOTP = useCallback(async () => {
    console.log('Sending OTP with data:', formData);
    
    if (!validateBasicFields()) {
      console.log('Validation failed, not sending OTP');
      return;
    }

    setIsLoading(true);
    try {
      const requestData = {
        name: formData.name,
        email: formData.email,
        phoneNo: formatPhoneNumber(formData.phoneNo),
        password: formData.password,
      };
      
      console.log('Calling requestRegisterOTP with:', requestData);
      
      const result = await authAPI.requestRegisterOTP(requestData);
      console.log('OTP request successful:', result);
      
      setShowOTPField(true);
      toast.info('OTP sent to your phone number');
      setOtpCooldown(60);
      const cooldownTimer = setInterval(() => setOtpCooldown((prev) => prev - 1), 1000);
      setTimeout(() => clearInterval(cooldownTimer), 60000);
    } catch (error) {
      console.error('API error:', error);
      if (error.message?.includes('timeout')) {
        toast.error('Request timed out. Please check your connection and try again.');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to send OTP. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [formData, otpCooldown]);

const handleRegisterSubmit = async (e) => {
  e.preventDefault();
  console.log('Form submitted, showOTPField:', showOTPField);
  
  // If OTP field is not shown, send OTP first
  if (!showOTPField) {
    console.log('Calling handleSendOTP');
    await handleSendOTP();
    return;
  }

  // If OTP field is shown, validate OTP and submit registration
  console.log('Validating OTP field');
  if (!validateOTPField()) {
    console.log('OTP validation failed');
    return;
  }

  console.log('All validations passed, calling verify API');
  setIsLoading(true);
  try {
    const requestData = {
      phoneNo: formatPhoneNumber(formData.phoneNo), 
      otp: formData.otp
    };
    
    console.log('Calling verifyRegisterOTP with:', requestData);
    
    const result = await authAPI.verifyRegisterOTP(requestData.phoneNo, requestData.otp);
    console.log('Registration successful:', result);
    
    await handleAuthSuccess(result);
  } catch (error) {
    console.error('API error details:', error);
    
    // Handle specific backend errors
    if (error.response?.data) {
      const errorData = error.response.data;
      console.log('Backend error response:', errorData);
      
      if (errorData.message) {
        // Show the actual backend error message
        toast.error(errorData.message);
      } else if (errorData.includes('JSON parse error') || errorData.includes('Cannot deserialize')) {
        toast.error('Invalid OTP format. Please try again.');
      } else {
        toast.error('Registration failed. Please try again.');
      }
    } else if (error.message?.includes('timeout')) {
      toast.error('Request timed out. Please check your internet connection and try again.');
    } else {
      toast.error(error.message || 'Failed to create account. Please try again.');
    }
  } finally {
    setIsLoading(false);
  }
};

  const getSubmitButtonText = () => {
    if (isLoading) return 'Processing...';
    if (!showOTPField) return 'Send OTP';
    return 'Create Account';
  };

  const isSubmitDisabled = () => {
    if (isLoading) return true;
    if (!showOTPField) {
      // For Send OTP button, check if basic fields are filled
      return !formData.name || !formData.email || !formData.password || !formData.phoneNo;
    }
    // For Create Account button, check if OTP is filled
    return !formData.otp;
  };

  return (
    <div className="lm-body">
      <form onSubmit={handleRegisterSubmit} className="lm-form-container">
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
            disabled={isLoading}
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
            placeholder="Enter your email address (e.g., user@gmail.com)"
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
              placeholder="Create a password (min 6 characters)"
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
              placeholder="Enter 10-digit number"
              maxLength="10"
              disabled={isLoading}
            />
          </div>
          {errors.phoneNo && <span className="lm-error-message">{errors.phoneNo}</span>}
        </div>

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

        {/* Single Submit Button */}
        <button
          type="submit"
          disabled={isSubmitDisabled()}
          className="lm-submit-btn"
        >
          {getSubmitButtonText()}
        </button>

        <div className="lm-switch-section">
          <p className="lm-switch-text">Already have an account?</p>
          <button
            type="button"
            onClick={switchToLogin}
            className="lm-switch-btn"
            disabled={isLoading}
          >
            Back to Login
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;