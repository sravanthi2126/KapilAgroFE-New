
// import React, { useState } from 'react';
// import { X, Mail, Eye, EyeOff, Phone, User, Smartphone } from 'lucide-react';
// import { toast } from 'react-toastify';
// import './LoginModal.css';
// import { apiClient, scheduleTokenRefresh } from '../../services/authService';

// const LoginModal = ({ isOpen, setIsOpen, setCurrentPage, setCart }) => {
//   console.log('LoginModal rendering, isOpen:', isOpen);
//   const [loginMethod, setLoginMethod] = useState('email');
//   const [isRegister, setIsRegister] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [showOTPField, setShowOTPField] = useState(false);
//   const [loginData, setLoginData] = useState({
//     name: '',
//     email: '',
//     password: '',
//     phoneNo: '',
//     otp: '',
//   });
//   const [isLoading, setIsLoading] = useState(false);
//   const [errors, setErrors] = useState({});

//   // Enhanced validation functions
//   const validatePhone = (phone) => {
//     const phoneRegex = /^\d{10}$/;
//     return phoneRegex.test(phone);
//   };

//   const validateEmail = (email) => {
//     const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
//     return emailRegex.test(email);
//   };

//   const validatePassword = (password) => {
//     return password.length >= 6;
//   };

//   const validateName = (name) => {
//     return name.trim().length >= 2;
//   };

//   const validateOTP = (otp) => {
//     return /^\d{6}$/.test(otp);
//   };

//   // Clear errors when user starts typing
//   const clearError = (field) => {
//     if (errors[field]) {
//       setErrors(prev => ({ ...prev, [field]: '' }));
//     }
//   };

//   // Set error
//   const setError = (field, message) => {
//     setErrors(prev => ({ ...prev, [field]: message }));
//   };

//   // Clear all errors
//   const clearAllErrors = () => {
//     setErrors({});
//   };

//   // Enhanced safeFetch with better error handling
//   const safeFetch = async (url, options, timeout = 15000) => {
//     const controller = new AbortController();
//     const timeoutId = setTimeout(() => controller.abort(), timeout);
    
//     try {
//       const response = await fetch(url, { 
//         ...options, 
//         signal: controller.signal,
//         headers: {
//           'Content-Type': 'application/json',
//           ...options.headers
//         }
//       });
//       clearTimeout(timeoutId);
//       return response;
//     } catch (error) {
//       clearTimeout(timeoutId);
//       if (error.name === 'AbortError') {
//         throw new Error('Request timeout. Please check your internet connection.');
//       }
//       throw error;
//     }
//   };

//   const handlePhoneChange = (e) => {
//     const value = e.target.value.replace(/\D/g, '');
//     if (value.length <= 10) {
//       setLoginData({ ...loginData, phoneNo: value });
//       clearError('phoneNo');
//     }
//   };

//   const handleInputChange = (field, value) => {
//     setLoginData(prev => ({ ...prev, [field]: value }));
//     clearError(field);
//   };

//   const formatPhoneNumber = (phone) => {
//     return phone.length === 10 ? `+91${phone}` : phone;
//   };

//   // Enhanced cart fetching
//   const fetchCart = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       if (!token) return;

//       const response = await apiClient.get('/user/cart/usercart', {
//         headers: { Authorization: `Bearer ${token}` }
//       });
      
//       if (response.status === 200 && response.data.status === 'success') {
//         const detailedCart = response.data.data.map((item) => ({
//           ...item,
//           localQuantity: item.quantity,
//           after_discount_price: item.afterDiscountPrice,
//           image_url: item.imageUrl,
//           product_name: item.productName,
//           unit_measurement: item.unitMeasurement,
//         }));
//         setCart(detailedCart);
//       }
//     } catch (err) {
//       console.error('Failed to fetch cart after login:', err);
//     }
//   };

//   // Form validation
//   const validateForm = () => {
//     const newErrors = {};
    
//     if (isRegister) {
//       if (!loginData.name.trim()) {
//         newErrors.name = 'Full name is required';
//       } else if (!validateName(loginData.name)) {
//         newErrors.name = 'Name must be at least 2 characters long';
//       }
//     }

//     if (isRegister || loginMethod === 'email') {
//       if (!loginData.email) {
//         newErrors.email = 'Email address is required';
//       } else if (!validateEmail(loginData.email)) {
//         newErrors.email = 'Please enter a valid email address';
//       }
//     }

//     if (isRegister || loginMethod === 'email') {
//       if (!loginData.password) {
//         newErrors.password = 'Password is required';
//       } else if (!validatePassword(loginData.password)) {
//         newErrors.password = 'Password must be at least 6 characters long';
//       }
//     }

//     if (isRegister || loginMethod === 'phone') {
//       if (!loginData.phoneNo) {
//         newErrors.phoneNo = 'Phone number is required';
//       } else if (!validatePhone(loginData.phoneNo)) {
//         newErrors.phoneNo = 'Please enter a valid 10-digit phone number';
//       }
//     }

//     if (showOTPField) {
//       if (!loginData.otp) {
//         newErrors.otp = 'OTP is required';
//       } else if (!validateOTP(loginData.otp)) {
//         newErrors.otp = 'Please enter a valid 6-digit OTP';
//       }
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   // Handle successful authentication
//   const handleAuthSuccess = async (result, userData) => {
//     try {
//       const userInfo = {
//         user_id: result.data?.userId,
//         name: userData.name || result.data?.name || 'User',
//         email: userData.email || result.data?.email || '',
//         phone_no: userData.phoneNo || result.data?.phoneNo || formatPhoneNumber(loginData.phoneNo),
//       };

//       localStorage.setItem('user', JSON.stringify(userInfo));
//       localStorage.setItem('token', result.data?.token || '');
//       localStorage.setItem('refreshToken', result.data?.refreshToken || '');
//       localStorage.setItem('userId', result.data?.userId || '');
//       localStorage.setItem('role', result.data?.role || 'user');
//       localStorage.setItem('name', userInfo.name);

//       await fetchCart();
//       scheduleTokenRefresh(); // Schedule proactive token refresh
//       window.dispatchEvent(new CustomEvent('userLoggedIn'));
//       setCurrentPage('home');
//       toast.success(isRegister ? 'Account created successfully!' : 'Logged in successfully!');
      
//       setTimeout(() => {
//         resetForm();
//       }, 1000);

//     } catch (error) {
//       console.error('Error handling auth success:', error);
//       toast.error('Login successful but there was an issue loading your data. Please refresh the page.');
//     }
//   };

//   // Main form submission handler
//   const handleLoginSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!validateForm()) {
//       return;
//     }

//     setIsLoading(true);
//     clearAllErrors();

//     try {
//       if (!isRegister && loginMethod === 'phone' && !showOTPField) {
//         const formattedPhone = formatPhoneNumber(loginData.phoneNo);
//         const response = await safeFetch('http://localhost:8080/user/login/otp/request', {
//           method: 'POST',
//           body: JSON.stringify({ phoneNo: formattedPhone }),
//         });

//         const result = await response.json();

//         if (!response.ok) {
//           if (response.status === 404) {
//             toast.error('Phone number not registered. Please sign up first.');
//             setIsRegister(true);
//             setLoginData({ ...loginData, name: '', email: '', password: '', otp: '' });
//             setLoginMethod('phone');
//           } else {
//             setError('phoneNo', result.message || 'Failed to send OTP');
//           }
//           setIsLoading(false);
//           return;
//         }

//         setShowOTPField(true);
//         toast.info('OTP sent to your phone number');
//         setIsLoading(false);
//         return;
//       }

//       if (!isRegister && loginMethod === 'phone' && showOTPField) {
//         const formattedPhone = formatPhoneNumber(loginData.phoneNo);
//         const response = await safeFetch('http://localhost:8080/user/login/otp/verify', {
//           method: 'POST',
//           body: JSON.stringify({ 
//             phoneNo: formattedPhone, 
//             otp: loginData.otp 
//           }),
//         });

//         const result = await response.json();

//         if (!response.ok) {
//           setError('otp', result.message || 'Invalid OTP');
//           setIsLoading(false);
//           return;
//         }

//         await handleAuthSuccess(result, {
//           name: result.data?.name,
//           email: result.data?.email,
//           phoneNo: formattedPhone
//         });
//         setIsLoading(false);
//         return;
//       }

//       if (!isRegister && loginMethod === 'email') {
//         const response = await safeFetch('http://localhost:8080/user/login', {
//           method: 'POST',
//           body: JSON.stringify({ 
//             email: loginData.email, 
//             password: loginData.password 
//           }),
//         });

//         const result = await response.json();

//         if (!response.ok) {
//           if (response.status === 404) {
//             toast.error('Email not registered. Please sign up first.');
//             setIsRegister(true);
//             setLoginData({ ...loginData, name: '', phoneNo: '', otp: '' });
//             setLoginMethod('email');
//           } else {
//             setError('email', result.message || 'Invalid email or password');
//           }
//           setIsLoading(false);
//           return;
//         }

//         await handleAuthSuccess(result, {
//           name: result.data?.name,
//           email: loginData.email,
//           phoneNo: result.data?.phoneNo
//         });
//         setIsLoading(false);
//         return;
//       }

//       if (isRegister && !showOTPField) {
//         const formattedPhone = formatPhoneNumber(loginData.phoneNo);
//         const response = await safeFetch('http://localhost:8080/user/register/otp/request', {
//           method: 'POST',
//           body: JSON.stringify({
//             name: loginData.name,
//             email: loginData.email,
//             phoneNo: formattedPhone,
//             password: loginData.password,
//           }),
//         });

//         const result = await response.json();

//         if (!response.ok) {
//           if (result.message?.toLowerCase().includes('email')) {
//             setError('email', result.message || 'Email already registered');
//           } else if (result.message?.toLowerCase().includes('phone')) {
//             setError('phoneNo', result.message || 'Phone number already registered');
//           } else {
//             toast.error(result.message || 'Failed to send OTP');
//           }
//           setIsLoading(false);
//           return;
//         }

//         setShowOTPField(true);
//         toast.info('OTP sent to your phone number');
//         setIsLoading(false);
//         return;
//       }

//       if (isRegister && showOTPField) {
//         const formattedPhone = formatPhoneNumber(loginData.phoneNo);
//         const response = await safeFetch('http://localhost:8080/user/register/otp/verify', {
//           method: 'POST',
//           body: JSON.stringify({
//             name: loginData.name,
//             email: loginData.email,
//             phoneNo: formattedPhone,
//             password: loginData.password,
//             otp: loginData.otp
//           }),
//         });

//         const result = await response.json();

//         if (!response.ok) {
//           setError('otp', result.message || 'Invalid OTP');
//           setIsLoading(false);
//           return;
//         }

//         await handleAuthSuccess(result, {
//           name: loginData.name,
//           email: loginData.email,
//           phoneNo: formattedPhone
//         });
//         setIsLoading(false);
//         return;
//       }
//     } catch (error) {
//       console.error('API error:', error);
//       if (error.message.includes('timeout')) {
//         toast.error('Request timed out. Please check your connection and try again.');
//       } else {
//         toast.error('Failed to process request. Please try again.');
//       }
//       setIsLoading(false);
//     }
//   };

//   const handleSendOTP = async () => {
//     if (!validateForm()) {
//       return;
//     }

//     setIsLoading(true);
//     try {
//       if (isRegister) {
//         const formattedPhone = formatPhoneNumber(loginData.phoneNo);
//         const response = await safeFetch('http://localhost:8080/user/register/otp/request', {
//           method: 'POST',
//           body: JSON.stringify({
//             name: loginData.name,
//             email: loginData.email,
//             phoneNo: formattedPhone,
//             password: loginData.password,
//           }),
//         });

//         const result = await response.json();

//         if (!response.ok) {
//           if (result.message?.toLowerCase().includes('email')) {
//             setError('email', result.message || 'Email already registered');
//           } else if (result.message?.toLowerCase().includes('phone')) {
//             setError('phoneNo', result.message || 'Phone number already registered');
//           } else {
//             toast.error(result.message || 'Failed to send OTP');
//           }
//           setIsLoading(false);
//           return;
//         }

//         setShowOTPField(true);
//         toast.info(showOTPField ? 'OTP resent to your phone number' : 'OTP sent to your phone number');
//       } else {
//         const formattedPhone = formatPhoneNumber(loginData.phoneNo);
//         const response = await safeFetch('http://localhost:8080/user/login/otp/request', {
//           method: 'POST',
//           body: JSON.stringify({ phoneNo: formattedPhone }),
//         });

//         const result = await response.json();

//         if (!response.ok) {
//           if (response.status === 404) {
//             toast.error('Phone number not registered. Please sign up first.');
//             setIsRegister(true);
//             setLoginData({ ...loginData, name: '', email: '', password: '' });
//             setLoginMethod('phone');
//           } else {
//             setError('phoneNo', result.message || 'Failed to send OTP');
//           }
//           setIsLoading(false);
//           return;
//         }

//         setShowOTPField(true);
//         toast.info(showOTPField ? 'OTP resent to your phone number' : 'OTP sent to your phone number');
//       }
//     } catch (error) {
//       console.error('API error:', error);
//       if (error.message.includes('timeout')) {
//         toast.error('Request timed out. Please check your connection and try again.');
//       } else {
//         toast.error('Failed to send OTP. Please try again.');
//       }
//     }

//     setIsLoading(false);
//   };

//   const handleMethodSwitch = (method) => {
//     setLoginMethod(method);
//     setShowOTPField(false);
//     setLoginData({ ...loginData, phoneNo: '', otp: '', email: '', password: '' });
//     clearAllErrors();
//   };

//   const handleModeSwitch = () => {
//     setIsRegister(!isRegister);
//     setShowOTPField(false);
//     setShowPassword(false);
//     setLoginData({ name: '', email: '', password: '', phoneNo: '', otp: '' });
//     setLoginMethod('email');
//     clearAllErrors();
//   };

//   const resetForm = () => {
//     setIsOpen(false);
//     setLoginMethod('email');
//     setIsRegister(false);
//     setShowPassword(false);
//     setShowOTPField(false);
//     setLoginData({ name: '', email: '', password: '', phoneNo: '', otp: '' });
//     clearAllErrors();
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="lm-overlay">
//       <div className="lm-container">
//         <div className="lm-header">
//           <button onClick={resetForm} className="lm-close-btn" disabled={isLoading}>
//             <X size={20} />
//           </button>
//           <div className="lm-header-content">
//             <h2 className="lm-title">
//               {isRegister ? 'Create Account' : 'Welcome Back'}
//             </h2>
//             <p className="lm-subtitle">
//               {isRegister ? 'Join our community today' : 'Sign in to continue'}
//             </p>
//           </div>
//         </div>

//         <div className="lm-content">
//           <div className="lm-body">
//             {!isRegister && (
//               <div className="lm-method-toggle">
//                 <button
//                   type="button"
//                   className={`lm-method-btn ${loginMethod === 'email' ? 'lm-method-btn-active' : ''}`}
//                   onClick={() => handleMethodSwitch('email')}
//                   disabled={isLoading}
//                 >
//                   <Mail size={16} />
//                   Email
//                 </button>
//                 <button
//                   type="button"
//                   className={`lm-method-btn ${loginMethod === 'phone' ? 'lm-method-btn-active' : ''}`}
//                   onClick={() => handleMethodSwitch('phone')}
//                   disabled={isLoading}
//                 >
//                   <Smartphone size={16} />
//                   Phone
//                 </button>
//               </div>
//             )}

//             <form onSubmit={handleLoginSubmit} className="lm-form-container">
//               {isRegister && (
//                 <div className="lm-field-group">
//                   <label className="lm-field-label">
//                     <User size={16} />
//                     Full Name *
//                   </label>
//                   <input
//                     type="text"
//                     value={loginData.name}
//                     onChange={(e) => handleInputChange('name', e.target.value)}
//                     className={`lm-input ${errors.name ? 'lm-input-error' : ''}`}
//                     placeholder="Enter your full name"
//                     disabled={isLoading}
//                     required
//                   />
//                   {errors.name && <span className="lm-error-message">{errors.name}</span>}
//                 </div>
//               )}

//               {(isRegister || loginMethod === 'email') && (
//                 <div className="lm-field-group">
//                   <label className="lm-field-label">
//                     <Mail size={16} />
//                     Email Address *
//                   </label>
//                   <input
//                     type="email"
//                     value={loginData.email}
//                     onChange={(e) => handleInputChange('email', e.target.value)}
//                     className={`lm-input ${errors.email ? 'lm-input-error' : ''}`}
//                     placeholder="Enter your email address"
//                     disabled={isLoading}
//                     required={loginMethod === 'email' || isRegister}
//                   />
//                   {errors.email && <span className="lm-error-message">{errors.email}</span>}
//                 </div>
//               )}

//               {(isRegister || loginMethod === 'email') && (
//                 <div className="lm-field-group">
//                   <label className="lm-field-label">
//                     <Eye size={16} />
//                     Password *
//                   </label>
//                   <div className="lm-password-container">
//                     <input
//                       type={showPassword ? 'text' : 'password'}
//                       value={loginData.password}
//                       onChange={(e) => handleInputChange('password', e.target.value)}
//                       className={`lm-input lm-password-input ${errors.password ? 'lm-input-error' : ''}`}
//                       placeholder={isRegister ? 'Create a password (min 6 characters)' : 'Enter your password'}
//                       disabled={isLoading}
//                       required={loginMethod === 'email' || isRegister}
//                     />
//                     <button
//                       type="button"
//                       onClick={() => setShowPassword(!showPassword)}
//                       className="lm-password-toggle"
//                       disabled={isLoading}
//                     >
//                       {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//                     </button>
//                   </div>
//                   {errors.password && <span className="lm-error-message">{errors.password}</span>}
//                 </div>
//               )}

//               {(isRegister || loginMethod === 'phone') && (
//                 <div className="lm-field-group">
//                   <label className="lm-field-label">
//                     <Phone size={16} />
//                     Phone Number *
//                   </label>
//                   <div className="lm-phone-container">
//                     <div className="lm-phone-prefix">+91</div>
//                     <input
//                       type="tel"
//                       value={loginData.phoneNo}
//                       onChange={handlePhoneChange}
//                       className={`lm-input lm-phone-input ${errors.phoneNo ? 'lm-input-error' : ''}`}
//                       placeholder="Enter 10-digit number"
//                       maxLength="10"
//                       disabled={isLoading}
//                       required={loginMethod === 'phone' || isRegister}
//                     />
//                   </div>
//                   {errors.phoneNo && <span className="lm-error-message">{errors.phoneNo}</span>}
//                 </div>
//               )}

//               {!isRegister && loginMethod === 'phone' && !showOTPField && (
//                 <button
//                   type="button"
//                   onClick={handleSendOTP}
//                   disabled={isLoading || !loginData.phoneNo || !validatePhone(loginData.phoneNo)}
//                   className="lm-otp-btn"
//                 >
//                   {isLoading ? 'Sending...' : 'Send OTP'}
//                 </button>
//               )}

//               {isRegister && !showOTPField && (
//                 <button
//                   type="button"
//                   onClick={handleSendOTP}
//                   disabled={isLoading}
//                   className="lm-otp-btn"
//                 >
//                   {isLoading ? 'Sending...' : 'Send OTP'}
//                 </button>
//               )}

//               {showOTPField && (
//                 <div className="lm-field-group">
//                   <label className="lm-field-label">
//                     <Smartphone size={16} />
//                     Enter OTP *
//                   </label>
//                   <input
//                     type="text"
//                     value={loginData.otp}
//                     onChange={(e) => {
//                       const value = e.target.value.replace(/\D/g, '');
//                       if (value.length <= 6) {
//                         handleInputChange('otp', value);
//                       }
//                     }}
//                     className={`lm-input lm-otp-input ${errors.otp ? 'lm-input-error' : ''}`}
//                     placeholder="000000"
//                     maxLength="6"
//                     disabled={isLoading}
//                     required
//                   />
//                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
//                     <p className="lm-otp-hint">
//                       OTP sent to +91{loginData.phoneNo}
//                     </p>
//                     <button
//                       type="button"
//                       onClick={handleSendOTP}
//                       disabled={isLoading}
//                       className="lm-resend-btn"
//                     >
//                       Resend
//                     </button>
//                   </div>
//                   {errors.otp && <span className="lm-error-message">{errors.otp}</span>}
//                 </div>
//               )}

//               <button
//                 type="submit"
//                 disabled={isLoading}
//                 className="lm-submit-btn"
//               >
//                 {isLoading ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In'}
//               </button>

//               <div className="lm-switch-section">
//                 <p className="lm-switch-text">
//                   {isRegister ? 'Already have an account?' : "Don't have an account?"}
//                 </p>
//                 <button
//                   type="button"
//                   onClick={handleModeSwitch}
//                   className="lm-switch-btn"
//                   disabled={isLoading}
//                 >
//                   {isRegister ? 'Back to Login' : 'Create Account'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LoginModal;


import React, { useState, useCallback, useEffect } from 'react';
import { X, Mail, Eye, EyeOff, Phone, User, Smartphone } from 'lucide-react';
import { toast } from 'react-toastify';
import './LoginModal.css';
import { apiClient, scheduleTokenRefresh } from '../../services/authService';

const LoginModal = ({ isOpen, setIsOpen, setCurrentPage, setCart }) => {
  console.log('LoginModal rendering, isOpen:', isOpen);
  const [loginMethod, setLoginMethod] = useState('email');
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showOTPField, setShowOTPField] = useState(false);
  const [loginData, setLoginData] = useState({
    name: '',
    email: '',
    password: '',
    phoneNo: '',
    otp: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [otpCooldown, setOtpCooldown] = useState(0);

  useEffect(() => {
    console.log('LoginModal useEffect, isOpen:', isOpen);
    if (!isOpen) {
      // Reset form when modal closes
      setLoginMethod('email');
      setIsRegister(false);
      setShowPassword(false);
      setShowOTPField(false);
      setLoginData({ name: '', email: '', password: '', phoneNo: '', otp: '' });
      setOtpCooldown(0);
      clearAllErrors();
    }
  }, [isOpen]);

  const validatePhone = (phone) => /^\d{10}$/.test(phone);
  const validateEmail = (email) => {
    const emailRegex = isRegister
      ? /^[a-zA-Z0-9._%+-]+@(com|in)$/
      : /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };
  const validatePassword = (password) => password.length >= 6;
  const validateName = (name) => name.trim().length >= 2;
  const validateOTP = (otp) => /^\d{6}$/.test(otp);

  const clearError = (field) => errors[field] && setErrors((prev) => ({ ...prev, [field]: '' }));
  const setError = (field, message) => setErrors((prev) => ({ ...prev, [field]: message }));
  const clearAllErrors = () => setErrors({});

  const safeFetch = async (url, options, timeout = 15000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, { 
        ...options, 
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      clearTimeout(timeoutId);
      if (!response.ok) throw await response.json();
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') throw new Error('Request timeout. Please check your internet connection.');
      throw error;
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) {
      setLoginData((prev) => ({ ...prev, phoneNo: value }));
      clearError('phoneNo');
    }
  };

  const handleInputChange = (field, value) => {
    setLoginData((prev) => ({ ...prev, [field]: value }));
    clearError(field);
  };

  const formatPhoneNumber = (phone) => (phone.length === 10 ? `+91${phone}` : phone);

  const fetchCart = async () => {
    try {
      const response = await apiClient.get('/user/cart/usercart');
      if (response.status === 200 && response.data.status === 'success') {
        const detailedCart = response.data.data.map((item) => ({
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

  const validateForm = () => {
    const newErrors = {};
    
    if (isRegister && !loginData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (isRegister && !validateName(loginData.name)) {
      newErrors.name = 'Name must be at least 2 characters long';
    }

    if ((isRegister || loginMethod === 'email') && !loginData.email) {
      newErrors.email = 'Email address is required';
    } else if ((isRegister || loginMethod === 'email') && !validateEmail(loginData.email)) {
      newErrors.email = `Please enter a valid email address ${isRegister ? '(only .com or .in domains)' : ''}`;
    }

    if ((isRegister || loginMethod === 'email') && !loginData.password) {
      newErrors.password = 'Password is required';
    } else if ((isRegister || loginMethod === 'email') && !validatePassword(loginData.password)) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    if ((isRegister || loginMethod === 'phone') && !loginData.phoneNo) {
      newErrors.phoneNo = 'Phone number is required';
    } else if ((isRegister || loginMethod === 'phone') && !validatePhone(loginData.phoneNo)) {
      newErrors.phoneNo = 'Please enter a valid 10-digit phone number';
    }

    if (showOTPField && !loginData.otp) {
      newErrors.otp = 'OTP is required';
    } else if (showOTPField && !validateOTP(loginData.otp)) {
      newErrors.otp = 'Please enter a valid 6-digit OTP';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      toast.success(isRegister ? 'Account created successfully!' : 'Logged in successfully');
      setIsOpen((prev) => {
        console.log('Setting isOpen to false after login:', !prev);
        return false;
      }); // Use callback to ensure state update
    } catch (error) {
      console.error('Error handling auth success:', error);
      toast.error('Login successful but there was an issue loading your data. Please refresh the page.');
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    clearAllErrors();

    try {
      let url, body;
      if (!isRegister && loginMethod === 'phone' && !showOTPField) {
        url = 'http://localhost:8080/user/login/otp/request';
        body = { phoneNo: formatPhoneNumber(loginData.phoneNo) };
        setShowOTPField(true);
        toast.info('OTP sent to your phone number');
      } else if (!isRegister && loginMethod === 'phone' && showOTPField) {
        url = 'http://localhost:8080/user/login/otp/verify';
        body = { phoneNo: formatPhoneNumber(loginData.phoneNo), otp: loginData.otp };
      } else if (!isRegister && loginMethod === 'email') {
        url = 'http://localhost:8080/user/login';
        body = { email: loginData.email, password: loginData.password };
      } else if (isRegister && !showOTPField) {
        url = 'http://localhost:8080/user/register/otp/request';
        body = {
          name: loginData.name,
          email: loginData.email,
          phoneNo: formatPhoneNumber(loginData.phoneNo),
          password: loginData.password,
        };
        setShowOTPField(true);
        toast.info('OTP sent to your phone number');
      } else if (isRegister && showOTPField) {
        url = 'http://localhost:8080/user/register/otp/verify';
        body = {
          phoneNo: formatPhoneNumber(loginData.phoneNo),
          otp: loginData.otp,
        };
      }

      const response = await safeFetch(url, { method: 'POST', body: JSON.stringify(body) });
      const result = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          toast.error(`${loginMethod === 'email' ? 'Email' : 'Phone number'} not registered. Please sign up first.`);
          setIsRegister(true);
          setLoginData((prev) => ({
            ...prev,
            name: '',
            email: loginMethod === 'email' ? '' : prev.email,
            phoneNo: loginMethod === 'phone' ? '' : prev.phoneNo,
            otp: '',
          }));
          setLoginMethod(loginMethod);
        } else if (result.message) {
          setError(loginMethod === 'email' ? 'email' : 'phoneNo', result.message);
        } else {
          throw new Error('Unexpected server error');
        }
      } else {
        await handleAuthSuccess(result);
      }
    } catch (error) {
      console.error('API error:', error);
      if (error.message.includes('timeout')) {
        toast.error('Request timed out. Please check your internet connection and try again.');
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error('Failed to process request. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOTP = useCallback(async () => {
    if (!validateForm() || otpCooldown > 0) return;

    setIsLoading(true);
    try {
      const url = isRegister
        ? 'http://localhost:8080/user/register/otp/request'
        : 'http://localhost:8080/user/login/otp/request';
      const body = isRegister
        ? {
            name: loginData.name,
            email: loginData.email,
            phoneNo: formatPhoneNumber(loginData.phoneNo),
            password: loginData.password,
          }
        : { phoneNo: formatPhoneNumber(loginData.phoneNo) };

      const response = await safeFetch(url, { method: 'POST', body: JSON.stringify(body) });
      const result = await response.json();

      if (!response.ok) {
        if (result.message?.toLowerCase().includes('email')) {
          setError('email', result.message || 'Email already registered');
        } else if (result.message?.toLowerCase().includes('phone')) {
          setError('phoneNo', result.message || 'Phone number already registered');
        } else if (response.status === 404 && !isRegister) {
          toast.error('Phone number not registered. Please sign up first.');
          setIsRegister(true);
          setLoginData((prev) => ({ ...prev, name: '', email: '', password: '', otp: '' }));
          setLoginMethod('phone');
        } else {
          toast.error(result.message || 'Failed to send OTP');
        }
      } else {
        setShowOTPField(true);
        toast.info(otpCooldown > 0 ? 'OTP resent to your phone number' : 'OTP sent to your phone number');
        setOtpCooldown(60);
        const cooldownTimer = setInterval(() => setOtpCooldown((prev) => prev - 1), 1000);
        setTimeout(() => clearInterval(cooldownTimer), 60000);
      }
    } catch (error) {
      console.error('API error:', error);
      if (error.message.includes('timeout')) {
        toast.error('Request timed out. Please check your connection and try again.');
      } else {
        toast.error('Failed to send OTP. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [loginData, isRegister, otpCooldown, validateForm]);

  const handleMethodSwitch = (method) => {
    setLoginMethod(method);
    setShowOTPField(false);
    setLoginData((prev) => ({ ...prev, phoneNo: '', otp: '', email: '', password: '' }));
    clearAllErrors();
  };

  const handleModeSwitch = () => {
    setIsRegister(!isRegister);
    setShowOTPField(false);
    setShowPassword(false);
    setLoginData({ name: '', email: '', password: '', phoneNo: '', otp: '' });
    setLoginMethod('email');
    clearAllErrors();
  };

  const resetForm = () => {
    console.log('Resetting form, setting isOpen to false');
    setIsOpen(false); // Ensure this updates the parent state
  };

  return (
    <div className={`lm-overlay ${!isOpen ? 'hidden' : ''}`} role="dialog" aria-labelledby="login-modal-title" style={{ display: isOpen ? 'block' : 'none' }}>
      {isOpen && (
        <div className="lm-container">
          <div className="lm-header">
            <button
              onClick={resetForm}
              className="lm-close-btn"
              disabled={isLoading}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
            <div className="lm-header-content">
              <h2 id="login-modal-title" className="lm-title">
                {isRegister ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="lm-subtitle">
                {isRegister ? 'Join our community today' : 'Sign in to continue'}
              </p>
            </div>
          </div>

          <div className="lm-content">
            <div className="lm-body">
              {!isRegister && (
                <div className="lm-method-toggle">
                  <button
                    type="button"
                    className={`lm-method-btn ${loginMethod === 'email' ? 'lm-method-btn-active' : ''}`}
                    onClick={() => handleMethodSwitch('email')}
                    disabled={isLoading}
                    aria-label="Login with email"
                  >
                    <Mail size={16} />
                    Email
                  </button>
                  <button
                    type="button"
                    className={`lm-method-btn ${loginMethod === 'phone' ? 'lm-method-btn-active' : ''}`}
                    onClick={() => handleMethodSwitch('phone')}
                    disabled={isLoading}
                    aria-label="Login with phone"
                  >
                    <Smartphone size={16} />
                    Phone
                  </button>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="lm-form-container">
                {isRegister && (
                  <div className="lm-field-group">
                    <label className="lm-field-label" htmlFor="name-input">
                      <User size={16} />
                      Full Name *
                    </label>
                    <input
                      id="name-input"
                      type="text"
                      value={loginData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`lm-input ${errors.name ? 'lm-input-error' : ''}`}
                      placeholder="Enter your full name"
                      disabled={isLoading}
                      aria-describedby={errors.name ? 'name-error' : null}
                      required
                    />
                    {errors.name && <span id="name-error" className="lm-error-message">{errors.name}</span>}
                  </div>
                )}

                {(isRegister || loginMethod === 'email') && (
                  <div className="lm-field-group">
                    <label className="lm-field-label" htmlFor="email-input">
                      <Mail size={16} />
                      Email Address *
                    </label>
                    <input
                      id="email-input"
                      type="email"
                      value={loginData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`lm-input ${errors.email ? 'lm-input-error' : ''}`}
                      placeholder="Enter your email address"
                      disabled={isLoading}
                      aria-describedby={errors.email ? 'email-error' : null}
                      required={loginMethod === 'email' || isRegister}
                    />
                    {errors.email && <span id="email-error" className="lm-error-message">{errors.email}</span>}
                  </div>
                )}

                {(isRegister || loginMethod === 'email') && (
                  <div className="lm-field-group">
                    <label className="lm-field-label" htmlFor="password-input">
                      <Eye size={16} />
                      Password *
                    </label>
                    <div className="lm-password-container">
                      <input
                        id="password-input"
                        type={showPassword ? 'text' : 'password'}
                        value={loginData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className={`lm-input lm-password-input ${errors.password ? 'lm-input-error' : ''}`}
                        placeholder={isRegister ? 'Create a password (min 6 characters)' : 'Enter your password'}
                        disabled={isLoading}
                        aria-describedby={errors.password ? 'password-error' : null}
                        required={loginMethod === 'email' || isRegister}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="lm-password-toggle"
                        disabled={isLoading}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {errors.password && <span id="password-error" className="lm-error-message">{errors.password}</span>}
                  </div>
                )}

                {(isRegister || loginMethod === 'phone') && (
                  <div className="lm-field-group">
                    <label className="lm-field-label" htmlFor="phone-input">
                      <Phone size={16} />
                      Phone Number *
                    </label>
                    <div className="lm-phone-container">
                      <div className="lm-phone-prefix">+91</div>
                      <input
                        id="phone-input"
                        type="tel"
                        value={loginData.phoneNo}
                        onChange={handlePhoneChange}
                        className={`lm-input lm-phone-input ${errors.phoneNo ? 'lm-input-error' : ''}`}
                        placeholder="Enter 10-digit number"
                        maxLength="10"
                        disabled={isLoading}
                        aria-describedby={errors.phoneNo ? 'phone-error' : null}
                        required={loginMethod === 'phone' || isRegister}
                      />
                    </div>
                    {errors.phoneNo && <span id="phone-error" className="lm-error-message">{errors.phoneNo}</span>}
                  </div>
                )}

                {!isRegister && loginMethod === 'phone' && !showOTPField && (
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={isLoading || !loginData.phoneNo || !validatePhone(loginData.phoneNo) || otpCooldown > 0}
                    className="lm-otp-btn"
                    aria-label="Send OTP"
                  >
                    {isLoading ? 'Sending...' : otpCooldown > 0 ? `Resend in ${otpCooldown}s` : 'Send OTP'}
                  </button>
                )}

                {isRegister && !showOTPField && (
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={isLoading || otpCooldown > 0}
                    className="lm-otp-btn"
                    aria-label="Send OTP"
                  >
                    {isLoading ? 'Sending...' : otpCooldown > 0 ? `Resend in ${otpCooldown}s` : 'Send OTP'}
                  </button>
                )}

                {showOTPField && (
                  <div className="lm-field-group">
                    <label className="lm-field-label" htmlFor="otp-input">
                      <Smartphone size={16} />
                      Enter OTP *
                    </label>
                    <input
                      id="otp-input"
                      type="text"
                      value={loginData.otp}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 6) handleInputChange('otp', value);
                      }}
                      className={`lm-input lm-otp-input ${errors.otp ? 'lm-input-error' : ''}`}
                      placeholder="000000"
                      maxLength="6"
                      disabled={isLoading}
                      aria-describedby={errors.otp ? 'otp-error' : null}
                      required
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                      <p className="lm-otp-hint" aria-live="polite">
                        OTP sent to +91{loginData.phoneNo}
                      </p>
                      <button
                        type="button"
                        onClick={handleSendOTP}
                        disabled={isLoading || otpCooldown > 0}
                        className="lm-resend-btn"
                        aria-label="Resend OTP"
                      >
                        {otpCooldown > 0 ? `Resend in ${otpCooldown}s` : 'Resend'}
                      </button>
                    </div>
                    {errors.otp && <span id="otp-error" className="lm-error-message">{errors.otp}</span>}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="lm-submit-btn"
                  aria-label={isRegister ? 'Create account' : 'Sign in'}
                >
                  {isLoading ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In'}
                </button>

                <div className="lm-switch-section">
                  <p className="lm-switch-text">
                    {isRegister ? 'Already have an account?' : "Don't have an account?"}
                  </p>
                  <button
                    type="button"
                    onClick={handleModeSwitch}
                    className="lm-switch-btn"
                    disabled={isLoading}
                    aria-label={isRegister ? 'Back to login' : 'Create account'}
                  >
                    {isRegister ? 'Back to Login' : 'Create Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginModal;