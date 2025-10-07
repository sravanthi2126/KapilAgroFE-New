import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { apiClient } from '../../services/authService';
import { CreditCard, ArrowLeft, Truck, MapPin, Package, IndianRupee } from 'lucide-react';
import { FaCreditCard } from 'react-icons/fa';
import './Payment.css';

const Payment = ({ cart, setCart, setIsLoginOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get data from location state
  const { cartItems = [], orderDetails = null, shippingAddress = {}, billingAddress = {} } = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [loading, setLoading] = useState(false);
  const [fetchingShipping, setFetchingShipping] = useState(false);
  const [error, setError] = useState('');
  const [currentOrderDetails, setCurrentOrderDetails] = useState(orderDetails);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderDetails?.orderId) {
        setError('Order ID not found. Please go back and try again.');
        toast.error('Order ID not found. Please go back and try again.', {
          position: 'bottom-right',
          autoClose: 5000,
        });
        return;
      }

      setFetchingShipping(true);
      try {
        const token = localStorage.getItem('token');
        const response = await apiClient.get(`/user/orders/${orderDetails.orderId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.data.status === 'success') {
          setCurrentOrderDetails({
            ...response.data.orderDetails,
            shippingcharges: response.data.orderDetails.shippingAmount,
          });
        } else {
          throw new Error('Failed to fetch order details');
        }
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Failed to fetch shipping details. Please try again.');
        toast.error('Failed to fetch shipping details. Please try again.', {
          position: 'bottom-right',
          autoClose: 5000,
        });
      } finally {
        setFetchingShipping(false);
      }
    };

    if (cartItems.length === 0) {
      setError('No items in cart. Please add items to proceed.');
      toast.error('No items in cart. Please add items to proceed.', {
        position: 'bottom-right',
        autoClose: 5000,
      });
      return;
    }

    if (!orderDetails) {
      setError('Order details not found. Please go back and try again.');
      toast.error('Order details not found. Please go back and try again.', {
        position: 'bottom-right',
        autoClose: 5000,
      });
      return;
    }

    if (!orderDetails.shippingAmount || isNaN(parseFloat(orderDetails.shippingAmount))) {
      fetchOrderDetails();
    } else {
      setCurrentOrderDetails({
        ...orderDetails,
        shippingcharges: orderDetails.shippingAmount,
      });
    }
  }, [cartItems, orderDetails]);

  const loadRazorpayScript = () => {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async (orderData) => {
    console.log('orderData in Razorpay options:', orderData);
    try {
      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded) {
        throw new Error('Razorpay SDK failed to load. Please refresh and try again.');
      }

      return new Promise((resolve, reject) => {
        const options = {
          key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_OCmyT47D47k8rb',
          amount: Math.round(parseFloat(orderData.totalAmount) * 100),
          currency: 'INR',
          name: 'Kapil Agro',
          description: 'Purchase from Kapil Agro',
          order_id: orderData.razorpayOrderId,
          handler: function (response) {
            resolve({
              razorpayOrderId: response.razorpay_order_id || orderData.razorpayOrderId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature || 'dummy_signature',
 // Temp orderId
              orderId: orderData.tempOrderId,

            });
          },
          prefill: {
            name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
            email: shippingAddress.email || '',
            contact: shippingAddress.phone,
          },
          theme: { color: '#16a34a' },
          modal: {
            ondismiss: () => reject(new Error('Payment cancelled by user')),
          },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      });
    } catch (err) {
      throw err;
    }
  };

  const verifyPayment = async (paymentData) => {
    try {
      console.log('Verifying payment with data:', paymentData);
      const token = localStorage.getItem('token');
      const payload = {
        razorpayOrderId: paymentData.razorpayOrderId,
        razorpayPaymentId: paymentData.razorpayPaymentId,
        razorpaySignature: paymentData.razorpaySignature,
        amount: paymentData.amount.toString(),
        orderId: paymentData.orderId, // Temp orderId
      };

      // Call payment success endpoint
      const response = await apiClient.post('/user/orders/payment/success', payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.data.status === 'success') {


        console.log('Permanent orderId from payment/success:', permanentOrderId);
        

        // Fetch order details with permanent orderId

        let orderDetails = null;
        try {
          const orderResponse = await apiClient.get(`/user/orders/${permanentOrderId}`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });

          if (orderResponse.data.status === 'success') {
            orderDetails = orderResponse.data.data;
          }
        } catch (fetchError) {
          console.error('Error fetching order with orderId:', permanentOrderId, fetchError);
          // Fallback: Fetch user's latest order
          const ordersResponse = await apiClient.get('/user/orders', {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });

          if (ordersResponse.data.status === 'success' && ordersResponse.data.data.length > 0) {
            // Sort by placedAt to get the latest order
            const latestOrder = ordersResponse.data.data.sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt))[0];
            permanentOrderId = latestOrder.orderId;
            orderDetails = latestOrder;
            console.log('Fallback to latest orderId:', permanentOrderId);
          } else {
            throw new Error('No orders found for user');
          }
        }


        if (orderResponse.data.status === 'success') {
          return {
            success: true,
            message: response.data.message,
            shipway_status: response.data.shipway_status || 'success',
            orderDetails: {
              orderId: orderDetails.orderId, // Permanent orderId
              razorpayOrderId: paymentData.razorpayOrderId,
              razorpayPaymentId: paymentData.razorpayPaymentId,
              totalAmount: orderDetails.totalAmount,
              paymentMethod: orderDetails.paymentMethod || 'Online Payment (Razorpay)',
              paymentStatus: orderDetails.paymentStatus || 'Success',
              orderDate: orderDetails.orderDate || new Date().toISOString(),
              shippingcharges: orderDetails.shippingAmount,
              subtotalAmount: orderDetails.subtotalAmount,
              originalAmount: orderDetails.originalAmount,
              productDiscountAmount: orderDetails.productDiscountAmount,
              orderDiscountAmount: orderDetails.orderDiscountAmount,
              totalTaxAmount: orderDetails.totalTaxAmount,
            },
          };
        } else {
          throw new Error('Failed to fetch updated order details');
        }
      } else {
        throw new Error(response.data?.message || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification failed:', {
        message: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  };

  const navigateToOrderConfirmation = (orderData, successMessage) => {
    console.log('Navigating to order confirmation with orderId:', orderData.orderDetails?.orderId || orderData.orderId);
    setCart([]);
    toast.success(successMessage, {
      position: 'bottom-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });

    const orderId = orderData.orderDetails?.orderId || orderData.orderId;
    if (!orderId) {
      console.error('No orderId found for navigation');
      toast.error('Order ID not found. Please contact support.', {
        position: 'bottom-right',
        autoClose: 5000,
      });
      return;
    }

    try {
      navigate('/order-confirmation', {
        state: {
          orderId: orderId, // Permanent orderId
          cartItems,
          orderDetails: orderData.orderDetails || orderData,
          shippingAddress,
          billingAddress,
          orderSummary: {
            subtotal: parseFloat(currentOrderDetails.subtotalAmount || 0),
            originalAmount: parseFloat(currentOrderDetails.originalAmount || 0),
            productDiscountAmount: parseFloat(currentOrderDetails.productDiscountAmount || 0),
            orderDiscountAmount: parseFloat(currentOrderDetails.orderDiscountAmount || 0),
            shippingCharges: parseFloat(currentOrderDetails.shippingcharges || 0),
            taxes: parseFloat(currentOrderDetails.totalTaxAmount || 0),
            total: parseFloat(currentOrderDetails.totalAmount || 0),
          },
        },
      });
    } catch (navError) {
      console.error('Navigation error:', navError);
      window.location.href = '/order-confirmation';
    }
  };

  const handlePlaceOrder = async () => {
    if (!currentOrderDetails) {
      setError('Order details not found. Please go back and try again.');
      toast.error('Order details not found. Please go back and try again.', {
        position: 'bottom-right',
        autoClose: 5000,
      });
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (paymentMethod === 'cod') {
        const orderData = {
          orderDetails: {
            orderId: currentOrderDetails.orderId,
            totalAmount: currentOrderDetails.totalAmount,
            paymentMethod: 'Cash on Delivery',
            paymentStatus: 'Pending',
            orderDate: currentOrderDetails.orderDate || new Date().toISOString(),
            shippingcharges: currentOrderDetails.shippingcharges,
          },
        };
        navigateToOrderConfirmation(orderData, 'Order placed successfully!');
      } else {
        const paymentData = await handleRazorpayPayment(currentOrderDetails);
        const verificationResult = await verifyPayment({
          razorpayOrderId: paymentData.razorpayOrderId,
          razorpayPaymentId: paymentData.razorpayPaymentId,
          razorpaySignature: paymentData.razorpaySignature,
          amount: parseFloat(currentOrderDetails.totalAmount),
          orderId: paymentData.orderId, // Temp orderId
        });

        if (verificationResult.success) {
          let successMessage = 'Payment Successful!';
          if (verificationResult.shipway_status === 'pending') {
            successMessage = 'Payment Successful! Shipping details are being processed.';
            setTimeout(() => {
              toast.warning('Shipping details are being processed. You will receive tracking information shortly.', {
                position: 'bottom-right',
                autoClose: 7000,
              });
            }, 2000);
          }
          navigateToOrderConfirmation(verificationResult, successMessage);
        } else {
          throw new Error('Payment verification failed');
        }
      }
    } catch (error) {
      console.error('Order placement error:', {
        message: error.message,
        response: error.response?.data,
      });
      let errorMessage = 'Failed to place order';

      if (error.message === 'Payment cancelled by user') {
        errorMessage = 'Payment was cancelled';
        toast.info('Payment was cancelled. Your order is saved and you can retry payment.', {
          position: 'bottom-right',
          autoClose: 5000,
        });
      } else if (error.message === 'Razorpay SDK not loaded. Please refresh the page and try again.') {
        errorMessage = error.message;
        toast.error(errorMessage, { position: 'bottom-right', autoClose: 5000 });
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid Order ID. Please check your order history or try again.';
        toast.error(errorMessage, {
          position: 'bottom-right',
          autoClose: 5000,
          onClick: () => navigate('/order-confirmation'), // Redirect to order confirmation if possible
        });
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        errorMessage = 'Session expired. Please log in again';
        localStorage.removeItem('token');
        toast.info(errorMessage, {
          position: 'bottom-right',
          autoClose: 5000,
          onClick: () => setIsLoginOpen(true),
        });
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      if (error.message !== 'Payment cancelled by user') {
        toast.error(errorMessage, { position: 'bottom-right', autoClose: 5000 });
      }
    } finally {
      setLoading(false);
    }
  };

  const getDiscountPercentage = (originalPrice, discountedPrice) => {
    if (!originalPrice || originalPrice <= 0) return 0;
    return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
  };

  if (!currentOrderDetails) {
    return (
      <div className="kapil-payment-container">
        <button onClick={() => navigate(-1)} className="kapil-payment-back" title="Back to Address">
          <ArrowLeft size={20} />
          Back to Address
        </button>
        <div className="kapil-payment-error">
          Order details not found. Please go back and try again.
        </div>
      </div>
    );
  }

  return (
    <div className="kapil-payment-container">
      <button onClick={() => navigate(-1)} className="kapil-payment-back" title="Back to Address">
        <ArrowLeft size={20} />
        Back to Address
      </button>

      <div className="kapil-payment-layout">
        {/* Left Column - Address & Payment Method */}
        <div className="kapil-payment-left">
          <div className="kapil-payment-card delivery-address-section">
            <div className="kapil-payment-card-header">
              <MapPin size={20} />
              <h3>Shipping Address</h3>
            </div>
            <div className="kapil-address-display">
              <div className="address-name">
                {shippingAddress.firstName} {shippingAddress.lastName}
              </div>
              <div className="address-details">
                <p>{shippingAddress.addressLine1}</p>
                {shippingAddress.addressLine2 && <p>{shippingAddress.addressLine2}</p>}
                <p>{shippingAddress.state}</p>
                <p>Pincode: {shippingAddress.pincode}</p>
                <p className="address-phone">Phone: {shippingAddress.phone}</p>
              </div>
            </div>
          </div>

          <div className="kapil-payment-card payment-method-section">
            <div className="kapil-payment-card-header">
              <CreditCard size={20} />
              <h3>Payment Method</h3>
            </div>
            <div className="payment-methods">
              <label className={`payment-method-option ${paymentMethod === 'razorpay' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="razorpay"
                  checked={paymentMethod === 'razorpay'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div className="payment-method-content">
                  <div className="payment-method-info">
                    <span className="payment-method-title">Online Payment</span>
                    <span className="payment-method-desc">UPI, Cards, NetBanking, Wallets</span>
                  </div>
                  <div className="payment-method-logos">
                    <FaCreditCard className="payment-method-icon" size={24} />
                  </div>
                </div>
              </label>

              <label className={`payment-method-option ${paymentMethod === 'cod' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div className="payment-method-content">
                  <div className="payment-method-info">
                    <span className="payment-method-title">Cash on Delivery</span>
                    <span className="payment-method-desc">Pay when your order arrives</span>
                  </div>
                  <div className="payment-method-logos">
                    <Truck size={24} className="payment-method-icon" />
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div className="kapil-payment-right order-summary-section">
          <div className="kapil-payment-card">
            <div className="kapil-payment-card-header">
              <Package size={20} />
              <h3>Order Summary ({cartItems.length} items)</h3>
            </div>

            <div className="kapil-order-items-list">
              {cartItems.map((item) => {
                const originalPrice = parseFloat(item.price || 0);
                const discountedPrice = parseFloat(item.after_discount_price || item.price || 0);
                const quantity = parseInt(item.localQuantity || 0);
                const hasDiscount = originalPrice > discountedPrice;
                const discountPercentage = hasDiscount ? getDiscountPercentage(originalPrice, discountedPrice) : 0;
                const originalTotal = originalPrice * quantity;
                const finalTotal = discountedPrice * quantity;
                const unit = item.unit || '';

                return (
                  <div key={item.cartItemId} className="kapil-order-item-card">
                    <img
                      src={item.image_url || '/images/placeholder.jpg'}
                      alt={item.product_name}
                      className="kapil-order-item-image"
                      onError={(e) => (e.target.src = '/images/placeholder.jpg')}
                    />
                    <div className="kapil-order-item-info">
                      <h4 className="item-name">{item.product_name}</h4>
                      <div className="item-details">
                        <span className="item-quantity">Qty: {quantity}</span>
                        {unit && <span className="item-unit">Unit: {unit}</span>}
                        {hasDiscount && (
                          <>
                            <span className="item-original-price">₹{originalPrice.toFixed(2)}</span>
                            <span className="item-discount">{discountPercentage}% OFF</span>
                          </>
                        )}
                        <span className="item-price">₹{discountedPrice.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="item-total">
                      {hasDiscount ? (
                        <div className="item-total-breakdown">
                          <span className="item-original-total">₹{originalTotal.toFixed(2)}</span>
                          <span className="item-final-total">₹{finalTotal.toFixed(2)}</span>
                        </div>
                      ) : (
                        <span className="item-final-total">₹{finalTotal.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="kapil-price-breakdown">
              <div className="price-row">
                <span>Original Amount</span>
                <span>₹{parseFloat(currentOrderDetails.originalAmount || 0).toFixed(2)}</span>
              </div>
              {parseFloat(currentOrderDetails.productDiscountAmount || 0) > 0 && (
                <div className="price-row discount">
                  <span>Product Discount</span>
                  <span>-₹{parseFloat(currentOrderDetails.productDiscountAmount || 0).toFixed(2)}</span>
                </div>
              )}
              <div className="price-row">
                <span>Subtotal</span>
                <span>₹{parseFloat(currentOrderDetails.subtotalAmount || 0).toFixed(2)}</span>
              </div>
              {parseFloat(currentOrderDetails.orderDiscountAmount || 0) > 0 && (
                <div className="price-row discount">
                  <span>Order Discount</span>
                  <span>-₹{parseFloat(currentOrderDetails.orderDiscountAmount || 0).toFixed(2)}</span>
                </div>
              )}
              <div className="price-row">
                <span>Shipping Charges</span>
                <span>
                  {fetchingShipping
                    ? 'Calculating...'
                    : currentOrderDetails.shippingcharges === undefined ||
                      isNaN(parseFloat(currentOrderDetails.shippingcharges))
                      ? 'Error: Unable to load shipping charges'
                      : parseFloat(currentOrderDetails.shippingcharges) === 0
                        ? 'FREE'
                        : `₹${parseFloat(currentOrderDetails.shippingcharges).toFixed(2)}`}
                </span>
              </div>
              {parseFloat(currentOrderDetails.totalTaxAmount || 0) > 0 && (
                <div className="price-row">
                  <span>Taxes & Fees</span>
                  <span>₹{parseFloat(currentOrderDetails.totalTaxAmount || 0).toFixed(2)}</span>
                </div>
              )}
              <div className="price-row total">
                <span>Total Amount</span>
                <span>₹{parseFloat(currentOrderDetails.totalAmount || 0).toFixed(2)}</span>
              </div>
            </div>

            {error && <div className="kapil-payment-error">{error}</div>}

            <button
              onClick={handlePlaceOrder}
              className="kapil-place-order-button"
              disabled={loading || cartItems.length === 0 || fetchingShipping}
            >
              {loading ? (
                <div className="kapil-payment-spinner"></div>
              ) : (
                <>
                  <IndianRupee size={20} />
                  Place Order - ₹{parseFloat(currentOrderDetails.totalAmount || 0).toFixed(2)}
                </>
              )}
            </button>

            <div className="security-info">
              <p>🔒 Your payment information is secure and encrypted</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;