import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { apiClient } from '../../services/authService';
import { CreditCard, ArrowLeft, MapPin, Package, IndianRupee, CheckCircle, Plus, ShoppingCart } from 'lucide-react';
import { FaCreditCard, FaLock } from 'react-icons/fa';
import './Payment.css';

// Helper function to calculate cart totals from the live cart
const calculateCartTotals = (cartItems) => {
    let originalAmount = 0;
    let subtotalAmount = 0;
    let productDiscountAmount = 0;

    cartItems.forEach(item => {
        const originalPrice = parseFloat(item.price || 0);
        const discountedPrice = parseFloat(item.after_discount_price || item.price || 0);
        const quantity = parseInt(item.localQuantity || item.quantity || 0);

        originalAmount += originalPrice * quantity;
        subtotalAmount += discountedPrice * quantity;
        productDiscountAmount += (originalPrice - discountedPrice) * quantity;
    });

    return {
        originalAmount: originalAmount.toFixed(2),
        subtotalAmount: subtotalAmount.toFixed(2),
        productDiscountAmount: productDiscountAmount.toFixed(2),
    };
};

const Payment = ({ cart, setCart, setIsLoginOpen }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const { orderDetails: initialOrderDetails = null, shippingAddress = {}, billingAddress = {} } = location.state || {};

    const [paymentMethod, setPaymentMethod] = useState('razorpay');
    const [paymentSelected, setPaymentSelected] = useState(true);
    const [loading, setLoading] = useState(false);
    const [fetchingShipping, setFetchingShipping] = useState(false);
    const [error, setError] = useState('');
    const [currentOrderDetails, setCurrentOrderDetails] = useState(null);

    // Calculate cart totals
    const cartTotals = useMemo(() => calculateCartTotals(cart), [cart]);

    // Initialize order details
    useEffect(() => {
        if (cart.length === 0) {
            setError('No items in cart. Please add items to proceed.');
            return;
        }

        if (initialOrderDetails) {
            setCurrentOrderDetails({
                ...initialOrderDetails,
                shippingcharges: initialOrderDetails.shippingAmount || 0,
                tempOrderId: initialOrderDetails.tempOrderId || null, // Preserve tempOrderId if passed
            });
        } else {
            const { originalAmount, subtotalAmount, productDiscountAmount } = cartTotals;
            const basicOrderDetails = {
                originalAmount,
                subtotalAmount,
                productDiscountAmount,
                shippingcharges: 0,
                orderDiscountAmount: 0,
                totalTaxAmount: 0,
                totalAmount: subtotalAmount,
                orderId: `temp-${Date.now()}`,
                tempOrderId: null, // Will be set after /initiate
            };
            setCurrentOrderDetails(basicOrderDetails);
        }
    }, [cart.length, initialOrderDetails, cartTotals]);

    // Recalculate shipping & totals
    const recalculateOrderDetails = useCallback(async () => {
        if (!shippingAddress?.pincode || cart.length === 0) {
            return;
        }

        setFetchingShipping(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setFetchingShipping(false);
                return;
            }

            const payload = {
                shippingAddress: JSON.stringify(shippingAddress),
                billingAddress: JSON.stringify(billingAddress),
                pincode: shippingAddress.pincode,
                cartItemIds: cart.map((item) => item.cartItemId),
            };

            const response = await apiClient.post('/user/orders/initiate', payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.status === 201 && response.data.status === 'success') {
                const newDetails = response.data.data;
                setCurrentOrderDetails(prev => ({
                    ...prev,
                    ...newDetails,
                    tempOrderId: newDetails.tempOrderId, // CRITICAL: Save tempOrderId
                    shippingcharges: newDetails.shippingAmount || 0,
                }));
                setError('');
            } else {
                throw new Error(response.data?.message || 'Failed to re-calculate order details');
            }
        } catch (err) {
            console.error('Error recalculating order details:', err);
            setError('Failed to re-calculate shipping & totals. Please refresh.');
            toast.error('Failed to re-calculate shipping & totals. Please try again.', {
                position: 'bottom-right',
                autoClose: 5000,
            });
        } finally {
            setFetchingShipping(false);
        }
    }, [cart, shippingAddress, billingAddress]);

    // Update totals when cart changes
    useEffect(() => {
        if (!currentOrderDetails || cart.length === 0) return;

        const { originalAmount, subtotalAmount, productDiscountAmount } = cartTotals;
        const shippingCharges = parseFloat(currentOrderDetails.shippingcharges || 0);
        const orderDiscountAmount = parseFloat(currentOrderDetails.orderDiscountAmount || 0);
        const totalTaxAmount = parseFloat(currentOrderDetails.totalTaxAmount || 0);

        let calculatedTotal = parseFloat(subtotalAmount) - orderDiscountAmount + shippingCharges + totalTaxAmount;

        setCurrentOrderDetails(prevDetails => ({
            ...prevDetails,
            originalAmount: originalAmount,
            subtotalAmount: subtotalAmount,
            productDiscountAmount: productDiscountAmount,
            shippingcharges: shippingCharges,
            orderDiscountAmount: orderDiscountAmount,
            totalTaxAmount: totalTaxAmount,
            totalAmount: calculatedTotal.toFixed(2),
        }));
    }, [cart, cartTotals]);

    // Recalculate on cart or pincode change
    useEffect(() => {
        if (cart.length > 0 && shippingAddress?.pincode) {
            recalculateOrderDetails();
        }
    }, [cart.length, shippingAddress?.pincode, recalculateOrderDetails]);

    const handleAddMoreItems = () => {
        navigate('/categories', {
            state: {
                returnTo: '/payment',
                preserveCart: true
            }
        });
    };

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

            if (!orderData.razorpayOrderId) {
                const token = localStorage.getItem('token');
                const createOrderResponse = await apiClient.post('/user/orders/create-razorpay-order', {
                    amount: Math.round(parseFloat(orderData.totalAmount) * 100),
                    currency: 'INR'
                }, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (createOrderResponse.data.status === 'success') {
                    orderData.razorpayOrderId = createOrderResponse.data.data.id;
                }
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
                        console.log('Razorpay response:', response);
                        if (!response.razorpay_signature) {
                            reject(new Error('Razorpay signature not received. Payment may have failed.'));
                            return;
                        }
                        resolve({
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                            amount: parseFloat(orderData.totalAmount)
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

            // CRITICAL: Ensure tempOrderId is present
            if (!paymentData.orderId) {
                throw new Error('Order session expired. Please restart checkout.');
            }

            const token = localStorage.getItem('token');
            const payload = {
                razorpayOrderId: paymentData.razorpayOrderId,
                razorpayPaymentId: paymentData.razorpayPaymentId,
                razorpaySignature: paymentData.razorpaySignature,
                amount: paymentData.amount.toString(),
                orderId: paymentData.orderId, // tempOrderId
            };

            console.log('Sending to /payment/success:', payload);

            const response = await apiClient.post('/user/orders/payment/success', payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.data.status === 'success') {
                const permanentOrderId = response.data.data.orderId;
                const invoiceId = response.data.data.invoiceId;

                if (!permanentOrderId) {
                    throw new Error('Permanent order ID not found in response');
                }

                return {
                    success: true,
                    message: response.data.message,
                    shipway_status: response.data.shipway_status || 'success',
                    orderDetails: {
                        orderId: permanentOrderId,
                        invoiceId: invoiceId,
                        razorpayOrderId: paymentData.razorpayOrderId,
                        razorpayPaymentId: paymentData.razorpayPaymentId,
                        totalAmount: paymentData.amount,
                        paymentMethod: 'Online Payment (Razorpay)',
                        paymentStatus: 'Success',
                        orderDate: new Date().toISOString(),
                    },
                };
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
        console.log('Navigating to order confirmation with orderId:', orderData.orderDetails?.orderId);
        setCart([]);
        toast.success(successMessage, {
            position: 'bottom-right',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
        });

        const orderId = orderData.orderDetails?.orderId;
        const invoiceId = orderData.orderDetails?.invoiceId;

        if (!orderId) {
            console.error('No orderId found for navigation');
            toast.error('Order ID not found. Please contact support.', {
                position: 'bottom-right',
                autoClose: 5000,
            });
            return;
        }

        navigate('/order-confirmation', {
            state: {
                orderId: orderId,
                invoiceId: invoiceId,
                cartItems: cart,
                orderDetails: orderData.orderDetails,
                shippingAddress,
                billingAddress,
                orderSummary: {
                    subtotal: parseFloat(currentOrderDetails?.subtotalAmount || 0),
                    originalAmount: parseFloat(currentOrderDetails?.originalAmount || 0),
                    productDiscountAmount: parseFloat(currentOrderDetails?.productDiscountAmount || 0),
                    orderDiscountAmount: parseFloat(currentOrderDetails?.orderDiscountAmount || 0),
                    shippingCharges: parseFloat(currentOrderDetails?.shippingcharges || 0),
                    taxes: parseFloat(currentOrderDetails?.totalTaxAmount || 0),
                    total: parseFloat(currentOrderDetails?.totalAmount || 0),
                },
            },
        });
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

        if (!currentOrderDetails.tempOrderId) {
            setError('Order session expired. Please restart checkout from cart.');
            toast.error('Order session expired. Please go back to cart and try again.', {
                position: 'bottom-right',
                autoClose: 5000,
            });
            return;
        }

        if (parseFloat(currentOrderDetails.totalAmount) <= 0) {
            setError('Total amount is zero or less. Cannot proceed with payment.');
            toast.error('Cannot place order with zero total amount.', {
                position: 'bottom-right',
                autoClose: 5000,
            });
            return;
        }

        setLoading(true);
        setError('');

        try {
            const paymentData = await handleRazorpayPayment(currentOrderDetails);

            // CRITICAL: Attach tempOrderId to paymentData
            paymentData.orderId = currentOrderDetails.tempOrderId;

            const verificationResult = await verifyPayment(paymentData);

            if (verificationResult.success) {
                let successMessage = 'Payment Successful! Your order has been placed.';
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
            } else if (error.message.includes('Razorpay SDK failed to load')) {
                errorMessage = error.message;
                toast.error(errorMessage, { position: 'bottom-right', autoClose: 5000 });
            } else if (error.response?.status === 400) {
                errorMessage = 'Invalid Order ID or payment details. Please check your order history or try again.';
                toast.error(errorMessage, { position: 'bottom-right', autoClose: 5000 });
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
            <div className="payment-container">
                <div className="payment-header">
                    <button onClick={() => navigate(-1)} className="back-button">
                        <ArrowLeft size={20} />
                        Back to Address
                    </button>
                    <h1>Payment</h1>
                </div>
                <div className="payment-error">
                    Loading order details...
                </div>
            </div>
        );
    }

    return (
        <div className="payment-container">
            <div className="payment-header">
                <button onClick={() => navigate(-1)} className="back-button">
                    <ArrowLeft size={20} />
                    Back to Address
                </button>
                <h1>Payment</h1>

                {/* <button
                    onClick={handleAddMoreItems}
                    className="add-more-items-button"
                >
                    <Plus size={20} />
                    Add More Items
                </button> */}
            </div>

            <div className="payment-layout">
                {/* Left Column - Order Summary & Items */}
                <div className="payment-left">
                    <div className="order-summary-card">
                        <div className="card-header">
                            <Package size={20} />
                            <h2>Order Summary ({cart.length} items)</h2>
                        </div>

                        <div className="payment-cart-items-container">
                            <div className="payment-cart-items-scroll">
                                {cart.map((item) => {
                                    const originalPrice = parseFloat(item.price || 0);
                                    const discountedPrice = parseFloat(item.after_discount_price || item.price || 0);
                                    const quantity = parseInt(item.localQuantity || item.quantity || 0);
                                    const hasDiscount = originalPrice > discountedPrice;
                                    const discountPercentage = hasDiscount ? getDiscountPercentage(originalPrice, discountedPrice) : 0;
                                    const originalTotal = originalPrice * quantity;
                                    const finalTotal = discountedPrice * quantity;
                                    const itemSavings = originalTotal - finalTotal;

                                    return (
                                        <div key={item.cartItemId} className="payment-cart-item">
                                            <div className="payment-cart-item-image-container">
                                                <img
                                                    src={item.image_url || '/images/placeholder.jpg'}
                                                    alt={item.product_name}
                                                    className="payment-cart-item-image"
                                                    onError={(e) => (e.target.src = '/images/placeholder.jpg')}
                                                />
                                            </div>

                                            <div className="payment-cart-item-details">
                                                <h4 className="payment-cart-item-name" title={item.product_name}>
                                                    {item.product_name}
                                                </h4>

                                                <div className="payment-cart-item-info">
                                                    {item.unit_measurement && (
                                                        <div className="payment-cart-item-measurement">
                                                            Size: {item.unit_measurement}
                                                        </div>
                                                    )}

                                                    {(item.category?.toLowerCase() === 'plants' || item.product_name?.toLowerCase().includes('plant')) && item.plant_age && (
                                                        <div className="payment-cart-item-age">
                                                            Plant Age: {item.plant_age} Year{item.plant_age !== '1' ? 's' : ''}
                                                        </div>
                                                    )}

                                                    <div className="payment-cart-item-price">
                                                        {hasDiscount ? (
                                                            <>
                                                                <span className="payment-cart-discount-price">
                                                                    ₹{discountedPrice.toFixed(2)}
                                                                </span>
                                                                <span className="payment-cart-original-price">
                                                                    ₹{originalPrice.toFixed(2)}
                                                                </span>
                                                                <span className="payment-cart-discount-badge">
                                                                    {discountPercentage}% OFF
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <span className="payment-cart-no-discount-price">
                                                                ₹{originalPrice.toFixed(2)}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="payment-cart-item-total">
                                                        Total: <span className="payment-cart-item-total-amount">₹{finalTotal.toFixed(2)}</span>
                                                        {itemSavings > 0 && (
                                                            <span className="payment-cart-item-savings">
                                                                (Save ₹{itemSavings.toFixed(2)})
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="payment-cart-item-controls">
                                                <div className="payment-cart-item-quantity-display-only">
                                                    <span className="payment-quantity-label">Quantity:</span>
                                                    <span className="payment-quantity-value">{quantity}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="add-more-items-section">
                            <button
                                onClick={handleAddMoreItems}
                                className="add-more-items-bottom"
                            >
                                <ShoppingCart size={20} />
                                Add More Items to Cart
                            </button>
                        </div>

                        <div className="payment-price-breakdown">
                            <div className="payment-price-row">
                                <span>Original Amount</span>
                                <span>₹{parseFloat(currentOrderDetails.originalAmount || 0).toFixed(2)}</span>
                            </div>
                            {parseFloat(currentOrderDetails.productDiscountAmount || 0) > 0 && (
                                <div className="payment-price-row discount">
                                    <span>Product Discount</span>
                                    <span>-₹{parseFloat(currentOrderDetails.productDiscountAmount || 0).toFixed(2)}</span>
                                </div>
                            )}
                            <div className="payment-price-row">
                                <span>Subtotal</span>
                                <span>₹{parseFloat(currentOrderDetails.subtotalAmount || 0).toFixed(2)}</span>
                            </div>
                            {parseFloat(currentOrderDetails.orderDiscountAmount || 0) > 0 && (
                                <div className="payment-price-row discount">
                                    <span>Order Discount</span>
                                    <span>-₹{parseFloat(currentOrderDetails.orderDiscountAmount || 0).toFixed(2)}</span>
                                </div>
                            )}
                            <div className="payment-price-row">
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
                                <div className="payment-price-row">
                                    <span>Taxes & Fees</span>
                                    <span>₹{parseFloat(currentOrderDetails.totalTaxAmount || 0).toFixed(2)}</span>
                                </div>
                            )}
                            <div className="payment-price-row total">
                                <span>Total Amount</span>
                                <span>₹{parseFloat(currentOrderDetails.totalAmount || 0).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Address & Payment Method */}
                <div className="payment-right">
                    <div className="address-card">
                        <div className="card-header">
                            <MapPin size={20} />
                            <h2>Shipping Address</h2>
                        </div>
                        <div className="address-display">
                            <div className="address-name">
                                {shippingAddress.firstName} {shippingAddress.lastName}
                            </div>
                            <div className="address-details">
                                <p>{shippingAddress.addressLine1}</p>
                                {shippingAddress.addressLine2 && <p>{shippingAddress.addressLine2}</p>}
                                <p>{shippingAddress.city}, {shippingAddress.state}</p>
                                <p>Pincode: {shippingAddress.pincode}</p>
                                <p className="address-phone">Phone: {shippingAddress.phone}</p>
                            </div>
                        </div>
                    </div>

                    <div className="payment-method-card">
                        <div className="card-header">
                            <CreditCard size={20} />
                            <h2>Payment Method</h2>
                        </div>
                        <div className="payment-options">
                            <label className={`payment-option ${paymentMethod === 'razorpay' ? 'selected enabled' : 'enabled'}`}>
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="razorpay"
                                    checked={paymentMethod === 'razorpay'}
                                    onChange={(e) => {
                                        setPaymentMethod(e.target.value);
                                        setPaymentSelected(true);
                                    }}
                                />
                                <div className="payment-option-content">
                                    <div className="payment-icon">
                                        <FaCreditCard size={24} />
                                    </div>
                                    <div className="payment-info">
                                        <span className="payment-title">Online Payment</span>
                                        <span className="payment-desc">UPI, Cards, NetBanking, Wallets</span>
                                    </div>
                                    <div className="payment-check">
                                        <CheckCircle size={20} />
                                    </div>
                                </div>
                            </label>
                        </div>

                        {error && <div className="payment-error">{error}</div>}

                        <button
                            onClick={handlePlaceOrder}
                            className="place-order-button"
                            disabled={loading || cart.length === 0 || fetchingShipping || parseFloat(currentOrderDetails.totalAmount) <= 0}
                        >
                            {loading ? (
                                <div className="payment-spinner"></div>
                            ) : (
                                <>
                                    <IndianRupee size={20} />
                                    Place Order - ₹{parseFloat(currentOrderDetails.totalAmount || 0).toFixed(2)}
                                </>
                            )}
                        </button>

                        <div className="security-notice">
                            <div className="security-icon">
                                <FaLock size={16} />
                            </div>
                            <p>Your payment information is secure and encrypted</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payment;