import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Package, Download, CheckCircle } from 'lucide-react';
import { apiClient } from '../../services/authService';
import { showInfo, showError } from '../../utils/toastUtils'; // Import toast utilities
import './OrderConfirmation.css';

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [invoiceDetails, setInvoiceDetails] = useState(null);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPaymentStatusColor = () => {
    switch (orderDetails?.paymentStatus?.toLowerCase()) {
      case 'success':
        return '#16a34a';
      case 'pending':
        return '#d97706';
      case 'failed':
        return '#dc2626';
      default:
        return '#64748b';
    }
  };

  const getPaymentStatusBg = () => {
    switch (orderDetails?.paymentStatus?.toLowerCase()) {
      case 'success':
        return 'rgba(22, 163, 74, 0.1)';
      case 'pending':
        return 'rgba(217, 119, 6, 0.1)';
      case 'failed':
        return 'rgba(220, 38, 38, 0.1)';
      default:
        return 'rgba(100, 116, 139, 0.1)';
    }
  };

  const handleViewAllOrders = () => {
    navigate('/orders');
  };

  const handleDownloadInvoice = async () => {
    if (!orderDetails?.orderId) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showInfo('Please log in to download invoice', {
          autoClose: 5000,
          onClick: () => navigate('/login'),
        });
        return;
      }

      const response = await apiClient.get(`/user/invoice/INV-${orderDetails.orderId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.status === 200 && response.data.status === 'success') {
        setInvoiceDetails(response.data.data);
        // Trigger browser download (adjust if API provides direct URL)
        const invoiceUrl = `/user/invoice/INV-${orderDetails.orderId}/download`;
        window.open(invoiceUrl, '_blank');
      } else {
        showError(response.data?.message || 'Failed to fetch invoice', { autoClose: false });
      }
    } catch (error) {
      console.error('Error fetching invoice:', error);
      showError('Failed to download invoice', { autoClose: false });
    }
  };

  useEffect(() => {
    if (location.state) {
      setOrderDetails(location.state.orderDetails || location.state);
      setLoading(false);
    } else {
      const urlParams = new URLSearchParams(location.search);
      const orderId = urlParams.get('orderId');

      if (orderId) {
        const fetchOrderDetails = async () => {
          try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await apiClient.get(`/orders/${orderId}`, {
              headers: { 'Authorization': `Bearer ${token}` },
            });
            if (response.status === 200 && response.data.status === 'success') {
              setOrderDetails(response.data.data);
            } else {
              showError('Failed to fetch order details', { autoClose: false });
            }
          } catch (error) {
            console.error('Error fetching order details:', error);
            showError('Error fetching order details', { autoClose: false });
          } finally {
            setLoading(false);
          }
        };
        fetchOrderDetails();
      } else {
        setLoading(false);
      }
    }
  }, [location]);

  if (loading) {
    return (
      <div className="order-confirmation-page">
        <div className="order-confirmation-container">
          <div className="order-details-card">
            <div className="card-content">
              <p>Loading order details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="order-confirmation-page">
        <div className="order-confirmation-container">
          <div className="order-details-card">
            <div className="card-content">
              <p>Order not found. Please check your order history.</p>
              <button
                onClick={() => navigate('/')}
                className="action-btn"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-confirmation-page">
      <div className="order-confirmation-container">
        <div className="order-details-card">
          {/* Header */}
          <div className="card-header">
            <div className="header-icon">
              <Package size={24} />
            </div>
            <div className="header-text">
              <h3 className="card-title">Order Confirmed</h3>
              <p className="card-subtitle">
                <CheckCircle className="tick-icon" size={18} />
                Thank you for choosing Kapil Agro
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="card-content">
            {orderDetails.razorpayOrderId && (
              <div className="detail-row">
                <span className="detail-label">Razorpay Order ID</span>
                <span className="detail-value detail-value-small">
                  {orderDetails.razorpayOrderId}
                </span>
              </div>
            )}

            {orderDetails.razorpayPaymentId && (
              <div className="detail-row">
                <span className="detail-label">Payment ID</span>
                <span className="detail-value detail-value-small">
                  {orderDetails.razorpayPaymentId}
                </span>
              </div>
            )}

            <div className="detail-row">
              <span className="detail-label">Order ID</span>
              <span className="detail-value detail-value-small">
                {orderDetails.orderId}
              </span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Invoice ID</span>
              <span className="detail-value detail-value-small">
                {invoiceDetails?.invoiceId || `INV-${orderDetails.orderId}`}
              </span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Order Date</span>
              <span className="detail-value">
                {formatDate(orderDetails.orderDate || invoiceDetails?.createdAt || new Date())}
              </span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Payment Method</span>
              <span className="detail-value">
                {orderDetails.paymentMethod || 'Online Payment'}
              </span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Payment Status</span>
              <span
                className="payment-status-badge"
                style={{
                  color: getPaymentStatusColor(),
                  backgroundColor: getPaymentStatusBg(),
                }}
              >
                {orderDetails.paymentStatus || 'Pending'}
              </span>
            </div>

            {/* Product List */}
            {invoiceDetails?.products && (
              <div className="detail-row" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                <span className="detail-label" style={{ marginBottom: '1rem' }}>Items</span>
                {invoiceDetails.products.map((product) => {
                  const isPlant = product.productName.toLowerCase().includes('plant');
                  const unitMeasurement = product.unitMeasurement || (isPlant ? '1 Plant' : null);
                  return (
                    <div
                      key={product.orderItemId}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        width: '100%',
                        padding: '0.5rem 0',
                        borderBottom: '1px solid #f1f5f9',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <img
                          src={product.imageUrl}
                          alt={product.productName}
                          style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.src = '/images/placeholder.jpg';
                          }}
                        />
                        <div>
                          <span className="detail-value">{product.productName}</span>
                          {unitMeasurement && (
                            <span className="kapil-cart-item-measurement" style={{ marginLeft: '0.5rem' }}>
                              ({unitMeasurement})
                            </span>
                          )}
                          {isPlant && (
                            <div style={{ marginTop: '0.5rem' }}>
                              <span className="detail-label">Plant Age: </span>
                              <span className="detail-value">{product.plantAge || '1'} Year{product.plantAge !== '1' ? 's' : ''}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span className="detail-value">
                          ₹{parseFloat(product.afterDiscountAmount).toFixed(2)} x {product.quantity}
                        </span>
                        {product.discountAmount > 0 && (
                          <span className="kapil-cart-discount-badge" style={{ marginLeft: '0.5rem' }}>
                            Save ₹{parseFloat(product.discountAmount).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Invoice Totals */}
            {invoiceDetails && (
              <>
                {invoiceDetails.discountAmount > 0 && (
                  <div className="detail-row">
                    <span className="detail-label">Total Discount</span>
                    <span className="detail-value">₹{parseFloat(invoiceDetails.discountAmount).toFixed(2)}</span>
                  </div>
                )}
                {invoiceDetails.taxAmount > 0 && (
                  <div className="detail-row">
                    <span className="detail-label">Tax Amount</span>
                    <span className="detail-value">₹{parseFloat(invoiceDetails.taxAmount).toFixed(2)}</span>
                  </div>
                )}
                {invoiceDetails.shippingAmount > 0 && (
                  <div className="detail-row">
                    <span className="detail-label">Shipping Amount</span>
                    <span className="detail-value">₹{parseFloat(invoiceDetails.shippingAmount).toFixed(2)}</span>
                  </div>
                )}
                <div className="total-amount-row">
                  <span className="total-label">Total Amount</span>
                  <span className="total-value">₹{parseFloat(invoiceDetails.totalAmount).toFixed(2)}</span>
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button onClick={handleDownloadInvoice} className="action-btn">
              <Download size={20} />
              Download Invoice
            </button>
            <button onClick={handleViewAllOrders} className="action-btn">
              <Package size={20} />
              View All My Orders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;