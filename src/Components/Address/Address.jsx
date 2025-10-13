import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { apiClient } from '../../services/authService';
import { MapPin, ArrowLeft, User, Home, Truck, CheckCircle, XCircle } from 'lucide-react';
import './Address.css';
import debounce from 'lodash/debounce';

const Address = ({ setIsLoginOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const cartItems = location.state?.cartItems || [];

  // Initialize state with empty address or saved address
  const [shippingAddress, setShippingAddress] = useState({
    firstName: '',
    lastName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
  });
  const [billingAddress, setBillingAddress] = useState({ ...shippingAddress });
  const [useSameAddress, setUseSameAddress] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [useSavedAddress, setUseSavedAddress] = useState(false);
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);
  const [pincodeStatus, setPincodeStatus] = useState(null); // null, 'valid', 'invalid'
  const [availableCarriers, setAvailableCarriers] = useState([]);

  // Load saved addresses from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('savedAddresses');
    if (saved) {
      const parsedAddresses = JSON.parse(saved);
      setSavedAddresses(parsedAddresses);
    }
  }, []);

  // Debounced pincode serviceability check
  const checkPincodeServiceability = useCallback(
    debounce(async (pincode) => {
      if (!pincode || pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
        setPincodeStatus(null);
        setAvailableCarriers([]);
        return;
      }

      setIsCheckingPincode(true);
      setPincodeStatus(null);

      try {
        const response = await apiClient.get(`/api/check-pincode?pincode=${pincode}&payment_type=P`);
        console.log('Pincode API Response:', response.data); // Debug log

        if (response.data.success === 1) {
          if (Array.isArray(response.data.message) && response.data.message.length > 0) {
            setPincodeStatus('valid');
            setAvailableCarriers(response.data.message);
            toast.success(`Pincode ${pincode} is serviceable!`);
          } else if (response.data.message === 'No Carrier found for pincode serviceability') {
            setPincodeStatus('invalid');
            setAvailableCarriers([]);
            toast.error(`Pincode ${pincode} is not serviceable`);
          } else {
            setPincodeStatus('invalid');
            setAvailableCarriers([]);
            toast.error('Invalid response format from pincode service');
          }
        } else {
          setPincodeStatus('invalid');
          setAvailableCarriers([]);
          toast.error(response.data.error || 'Failed to check pincode serviceability');
        }
      } catch (error) {
        console.error('Error checking pincode:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
        });
        setPincodeStatus('invalid');
        setAvailableCarriers([]);
        toast.error(error.response?.data?.error || 'Error checking pincode serviceability');
      } finally {
        setIsCheckingPincode(false);
      }
    }, 500), // 500ms debounce delay
    []
  );

  // Check pincode serviceability when pincode changes
  useEffect(() => {
    checkPincodeServiceability(shippingAddress.pincode);
  }, [shippingAddress.pincode, checkPincodeServiceability]);

  const handleInputChange = (e, type) => {
    const { name, value } = e.target;

    if (type === 'shipping') {
      setShippingAddress((prev) => ({ ...prev, [name]: value }));
      if (useSameAddress) {
        setBillingAddress((prev) => ({ ...prev, [name]: value }));
      }

      if (name === 'pincode' && value.length !== 6) {
        setPincodeStatus(null);
        setAvailableCarriers([]);
      }
    } else {
      setBillingAddress((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleUseSameAddress = () => {
    setUseSameAddress((prev) => !prev);
    if (!useSameAddress) {
      setBillingAddress({ ...shippingAddress });
    }
  };

  const handleUseSavedAddress = () => {
    setUseSavedAddress((prev) => !prev);
    if (!useSavedAddress && savedAddresses.length > 0) {
      setShippingAddress(savedAddresses[0].shipping);
      setBillingAddress(savedAddresses[0].billing);
      setUseSameAddress(savedAddresses[0].useSameAddress);
      if (savedAddresses[0].shipping.pincode) {
        checkPincodeServiceability(savedAddresses[0].shipping.pincode);
      }
    } else {
      setShippingAddress({
        firstName: '',
        lastName: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        phone: '',
      });
      setBillingAddress({
        firstName: '',
        lastName: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        phone: '',
      });
      setUseSameAddress(true);
      setPincodeStatus(null);
      setAvailableCarriers([]);
    }
  };

  const validateForm = () => {
    const requiredFields = ['firstName', 'lastName', 'addressLine1', 'city', 'state', 'pincode', 'phone'];

    for (const field of requiredFields) {
      if (!shippingAddress[field]) {
        toast.error(`Shipping ${field} is required`);
        return false;
      }
      if (!useSameAddress && !billingAddress[field]) {
        toast.error(`Billing ${field} is required`);
        return false;
      }
    }

    if (!/^\d{6}$/.test(shippingAddress.pincode)) {
      toast.error('Shipping pincode must be 6 digits');
      return false;
    }
    if (!useSameAddress && !/^\d{6}$/.test(billingAddress.pincode)) {
      toast.error('Billing pincode must be 6 digits');
      return false;
    }

    if (pincodeStatus !== 'valid') {
      toast.error('Please enter a serviceable pincode');
      return false;
    }

    if (!/^\d{10}$/.test(shippingAddress.phone)) {
      toast.error('Shipping phone number must be 10 digits');
      return false;
    }
    if (!useSameAddress && !/^\d{10}$/.test(billingAddress.phone)) {
      toast.error('Billing phone number must be 10 digits');
      return false;
    }

    if (cartItems.length === 0) {
      toast.error('No items in cart');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.info('Please log in to proceed', {
          autoClose: 5000,
          onClick: () => setIsLoginOpen(true),
        });
        setIsLoading(false);
        return;
      }

      const payload = {
        shippingAddress: JSON.stringify(shippingAddress),
        billingAddress: JSON.stringify(useSameAddress ? shippingAddress : billingAddress),
        pincode: shippingAddress.pincode,
        cartItemIds: cartItems.map((item) => item.cartItemId),
      };

      console.log('🚀 Final Order Payload:', payload);

      const response = await apiClient.post('/user/orders/initiate', payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 201 && response.data.status === 'success') {
        const newAddress = {
          shipping: shippingAddress,
          billing: useSameAddress ? shippingAddress : billingAddress,
          useSameAddress,
        };
        const updatedAddresses = [newAddress, ...savedAddresses].slice(0, 5);
        localStorage.setItem('savedAddresses', JSON.stringify(updatedAddresses));
        setSavedAddresses(updatedAddresses);

        toast.success('Order initiated successfully');
        navigate('/payment', {
          state: {
            cartItems,
            orderDetails: response.data.data,
            shippingAddress,
            billingAddress: useSameAddress ? shippingAddress : billingAddress,
          },
        });
      } else {
        const errorMsg = response.data?.message || 'Failed to initiate order';
        console.error('API Response Error:', response.data);
        toast.error(errorMsg, { autoClose: false });
      }
    } catch (err) {
      console.error('Order initiation error:', err);
      let errorMessage = 'Failed to initiate order';
      if (err.response?.status === 400) {
        errorMessage = err.response.data?.message || 'Invalid request data';
      } else if (err.response?.status === 403 || err.response?.status === 401) {
        errorMessage = 'Session expired. Please log in again';
        localStorage.removeItem('token');
        toast.info(errorMessage, { autoClose: 5000, onClick: () => setIsLoginOpen(true) });
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please try again';
      } else if (!err.response) {
        errorMessage = 'Network error. Please check your connection';
      }

      console.error('API Error Details:', {
        url: err.config?.url,
        method: err.config?.method,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
      });

      toast.error(errorMessage, { autoClose: false });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="kapil-address-container">
      <button onClick={() => navigate(-1)} className="kapil-address-back" title="Back to Cart">
        <ArrowLeft size={18} />
        Back to Cart
      </button>

      <div className="kapil-address-content">
        <div className="kapil-address-header">
          <MapPin size={24} color="#00695c" />
          <h2>Delivery Information</h2>
          <p className="address-subtitle">Enter your delivery address and verify pincode serviceability</p>
        </div>

        <form onSubmit={handleSubmit} className={`kapil-address-form ${isLoading ? 'loading' : ''}`}>
          {savedAddresses.length > 0 && (
            <div className="kapil-address-section">
              <div className="section-header">
                <Home size={18} />
                <h3>Saved Address</h3>
              </div>
              <div className="kapil-address-checkbox">
                <input
                  type="checkbox"
                  id="use-saved-address"
                  checked={useSavedAddress}
                  onChange={handleUseSavedAddress}
                />
                <label htmlFor="use-saved-address" className="checkbox-text">
                  Use saved address: {savedAddresses[0]?.shipping?.addressLine1}, {savedAddresses[0]?.shipping?.city},{' '}
                  {savedAddresses[0]?.shipping?.state} {savedAddresses[0]?.shipping?.pincode}
                </label>
              </div>
            </div>
          )}

          <div className="kapil-address-section">
            <div className="section-header">
              <Truck size={18} />
              <h3>Shipping Address</h3>
            </div>

            <div className="kapil-address-row">
              <div className="kapil-address-field">
                <label htmlFor="shipping-firstName">
                  First Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="shipping-firstName"
                  name="firstName"
                  placeholder="Enter your first name"
                  value={shippingAddress.firstName}
                  onChange={(e) => handleInputChange(e, 'shipping')}
                  required
                />
              </div>
              <div className="kapil-address-field">
                <label htmlFor="shipping-lastName">
                  Last Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="shipping-lastName"
                  name="lastName"
                  placeholder="Enter your last name"
                  value={shippingAddress.lastName}
                  onChange={(e) => handleInputChange(e, 'shipping')}
                  required
                />
              </div>
            </div>

            <div className="kapil-address-row">
              <div className="kapil-address-field">
                <label htmlFor="shipping-phone">
                  Phone Number <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  id="shipping-phone"
                  name="phone"
                  placeholder="Enter 10-digit phone number"
                  value={shippingAddress.phone}
                  onChange={(e) => handleInputChange(e, 'shipping')}
                  pattern="\d{10}"
                  required
                />
              </div>
              <div className="kapil-address-field">
                <label htmlFor="shipping-pincode">
                  PIN Code <span className="required">*</span>
                </label>
                <div className="pincode-input-container">
                  <input
                    type="number"
                    id="shipping-pincode"
                    name="pincode"
                    placeholder="Enter 6-digit PIN code"
                    value={shippingAddress.pincode}
                    onChange={(e) => handleInputChange(e, 'shipping')}
                    pattern="\d{6}"
                    required
                    className={pincodeStatus === 'valid' ? 'valid-pincode' : pincodeStatus === 'invalid' ? 'invalid-pincode' : ''}
                  />
                  {isCheckingPincode && (
                    <div className="kapil-address-spinner pincode-spinner"></div>
                  )}
                  {pincodeStatus === 'valid' && (
                    <CheckCircle size={20} color="#16a34a" className="pincode-status-icon" />
                  )}
                  {pincodeStatus === 'invalid' && (
                    <XCircle size={20} color="#dc2626" className="pincode-status-icon" />
                  )}
                </div>
                {pincodeStatus === 'valid' && (
                  <div className="pincode-success-message">
                    <CheckCircle size={16} color="#16a34a" />
                    <span>
                      Pincode is serviceable! 
                    </span>
                  </div>
                )}
                {pincodeStatus === 'invalid' && (
                  <div className="pincode-error-message">
                    <XCircle size={16} color="#dc2626" />
                    <span>Pincode is not serviceable. Please try another pincode.</span>
                  </div>
                )}
              </div>
            </div>

            <div className="kapil-address-row full-width">
              <div className="kapil-address-field">
                <label htmlFor="shipping-addressLine1">
                  Address Line 1 <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="shipping-addressLine1"
                  name="addressLine1"
                  placeholder="House/Flat No., Building Name, Street Name"
                  value={shippingAddress.addressLine1}
                  onChange={(e) => handleInputChange(e, 'shipping')}
                  required
                />
              </div>
            </div>

            <div className="kapil-address-row full-width">
              <div className="kapil-address-field">
                <label htmlFor="shipping-addressLine2">
                  Address Line 2 (Optional)
                </label>
                <input
                  type="text"
                  id="shipping-addressLine2"
                  name="addressLine2"
                  placeholder="Area, Landmark"
                  value={shippingAddress.addressLine2}
                  onChange={(e) => handleInputChange(e, 'shipping')}
                />
              </div>
            </div>

            <div className="kapil-address-row">
              <div className="kapil-address-field">
                <label htmlFor="shipping-city">
                  City <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="shipping-city"
                  name="city"
                  placeholder="Enter city name"
                  value={shippingAddress.city}
                  onChange={(e) => handleInputChange(e, 'shipping')}
                  required
                />
              </div>
              <div className="kapil-address-field">
                <label htmlFor="shipping-state">
                  State <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="shipping-state"
                  name="state"
                  placeholder="Enter state name"
                  value={shippingAddress.state}
                  onChange={(e) => handleInputChange(e, 'shipping')}
                  required
                />
              </div>
            </div>
          </div>

          <div className="kapil-address-section">
            <div className="section-header">
              <User size={18} />
              <h3>Billing Address</h3>
            </div>
            <div className="kapil-address-checkbox">
              <input
                type="checkbox"
                id="use-same-address"
                checked={useSameAddress}
                onChange={handleUseSameAddress}
              />
              <label htmlFor="use-same-address" className="checkbox-text">
                Use same as shipping address
              </label>
            </div>

            {!useSameAddress && (
              <div>
                <div className="kapil-address-row">
                  <div className="kapil-address-field">
                    <label htmlFor="billing-firstName">
                      First Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="billing-firstName"
                      name="firstName"
                      placeholder="Enter your first name"
                      value={billingAddress.firstName}
                      onChange={(e) => handleInputChange(e, 'billing')}
                      required
                    />
                  </div>
                  <div className="kapil-address-field">
                    <label htmlFor="billing-lastName">
                      Last Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="billing-lastName"
                      name="lastName"
                      placeholder="Enter your last name"
                      value={billingAddress.lastName}
                      onChange={(e) => handleInputChange(e, 'billing')}
                      required
                    />
                  </div>
                </div>

                <div className="kapil-address-row">
                  <div className="kapil-address-field">
                    <label htmlFor="billing-phone">
                      Phone Number <span className="required">*</span>
                    </label>
                    <input
                      type="tel"
                      id="billing-phone"
                      name="phone"
                      placeholder="Enter 10-digit phone number"
                      value={billingAddress.phone}
                      onChange={(e) => handleInputChange(e, 'billing')}
                      pattern="\d{10}"
                      required
                    />
                  </div>
                  <div className="kapil-address-field">
                    <label htmlFor="billing-pincode">
                      PIN Code <span className="required">*</span>
                    </label>
                    <input
                      type="number"
                      id="billing-pincode"
                      name="pincode"
                      placeholder="Enter 6-digit PIN code"
                      value={billingAddress.pincode}
                      onChange={(e) => handleInputChange(e, 'billing')}
                      pattern="\d{6}"
                      required
                    />
                  </div>
                </div>

                <div className="kapil-address-row full-width">
                  <div className="kapil-address-field">
                    <label htmlFor="billing-addressLine1">
                      Address Line 1 <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="billing-addressLine1"
                      name="addressLine1"
                      placeholder="House/Flat No., Building Name, Street Name"
                      value={billingAddress.addressLine1}
                      onChange={(e) => handleInputChange(e, 'billing')}
                      required
                    />
                  </div>
                </div>

                <div className="kapil-address-row full-width">
                  <div className="kapil-address-field">
                    <label htmlFor="billing-addressLine2">
                      Address Line 2 (Optional)
                    </label>
                    <input
                      type="text"
                      id="billing-addressLine2"
                      name="addressLine2"
                      placeholder="Area, Landmark"
                      value={billingAddress.addressLine2}
                      onChange={(e) => handleInputChange(e, 'billing')}
                    />
                  </div>
                </div>

                <div className="kapil-address-row">
                  <div className="kapil-address-field">
                    <label htmlFor="billing-city">
                      City <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="billing-city"
                      name="city"
                      placeholder="Enter city name"
                      value={billingAddress.city}
                      onChange={(e) => handleInputChange(e, 'billing')}
                      required
                    />
                  </div>
                  <div className="kapil-address-field">
                    <label htmlFor="billing-state">
                      State <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="billing-state"
                      name="state"
                      placeholder="Enter state name"
                      value={billingAddress.state}
                      onChange={(e) => handleInputChange(e, 'billing')}
                      required
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="kapil-address-submit-container">
            <button
              type="submit"
              className="kapil-address-submit"
              disabled={isLoading || pincodeStatus !== 'valid'}
            >
              {isLoading ? <div className="kapil-address-spinner"></div> : 'Proceed to Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Address;