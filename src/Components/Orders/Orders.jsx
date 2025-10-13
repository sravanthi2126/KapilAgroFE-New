import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { apiClient } from '../../services/authService';
import { Package, ArrowRight, IndianRupee, Calendar, Truck, X } from 'lucide-react';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/user/orders');
      if (response.data.status === 'success') {
        setOrders(response.data.data);
      } else {
        toast.error('Failed to fetch orders');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      toast.error('Error fetching orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      setDetailsLoading(true);
      const response = await apiClient.get(`/user/orders/${orderId}`);
      if (response.data.status === 'success') {
        setOrderDetails(response.data.data);
      } else {
        toast.error('Failed to fetch order details');
      }
    } catch (err) {
      console.error('Error fetching order details:', err);
      toast.error('Error fetching order details. Please try again.');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    fetchOrderDetails(order.orderId);
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setOrderDetails(null);
  };

  const downloadInvoice = async (invoiceId) => {
    if (!invoiceId) {
      toast.error('No invoice available for this order.');
      return;
    }
    try {
      const response = await apiClient.get(`/user/invoice/${invoiceId}/pdf`, {
        responseType: 'blob', // Important: Set responseType to 'blob' for binary data
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${invoiceId}.pdf`); // Set the filename
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Invoice downloaded successfully!');
    } catch (err) {
      console.error('Error downloading invoice:', err);
      toast.error('Failed to download invoice. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    switch (status.toUpperCase()) {
      case 'PLACED':
        return '#FFA500'; // Orange
      case 'SHIPPED':
        return '#4CAF50'; // Green
      case 'DELIVERED':
        return '#2196F3'; // Blue
      case 'CANCELLED':
        return '#F44336'; // Red
      default:
        return '#808080'; // Gray
    }
  };

  if (loading) {
    return <div className="orders-loading">Loading orders...</div>;
  }

  if (orders.length === 0) {
    return <div className="orders-empty">No orders found.</div>;
  }

  return (
    <div className="orders-container">
      <h1 className="orders-title">My Orders</h1>
      <div className="orders-list">
        {orders.map((order) => (
          <div key={order.orderId} className="order-card" onClick={() => handleOrderClick(order)}>
            <div className="order-header">
              <div className="order-id">
                <Package size={20} className="order-icon" />
                Order #{order.orderId}
              </div>
              <div className="order-status" style={{ color: getStatusColor(order.orderStatus) }}>
                {order.orderStatus}
              </div>
            </div>
            <div className="order-details">
              <div className="order-detail-item">
                <Calendar size={16} className="detail-icon" />
                <span>{formatDate(order.placedAt)}</span>
              </div>
              <div className="order-detail-item">
                <IndianRupee size={16} className="detail-icon" />
                <span>₹{order.totalAmount.toFixed(2)}</span>
              </div>
              <div className="order-detail-item">
                <Truck size={16} className="detail-icon" />
                <span>Shipping: ₹{order.shippingAmount.toFixed(2)}</span>
              </div>
            </div>
            <div className="order-footer">
              <span className="order-view-details">
                View Details <ArrowRight size={16} />
              </span>
            </div>
          </div>
        ))}
      </div>

      {selectedOrder && (
        <div className="order-modal-overlay" onClick={closeModal}>
          <div className="order-modal" onClick={(e) => e.stopPropagation()}>
            <div className="order-modal-header">
              <h2>Order Details #{selectedOrder.orderId}</h2>
              <button className="order-modal-close" onClick={closeModal}>
                <X size={24} />
              </button>
            </div>
            <div className="order-modal-content">
              {detailsLoading ? (
                <div className="order-details-loading">Loading details...</div>
              ) : orderDetails ? (
                <div className="order-details-grid">
                  <div className="order-info-section">
                    <h3>Order Information</h3>
                    <p><strong>Status:</strong> <span style={{ color: getStatusColor(orderDetails.orderStatus) }}>{orderDetails.orderStatus}</span></p>
                    <p><strong>Placed At:</strong> {formatDate(orderDetails.placedAt)}</p>
                    <p><strong>Total Amount:</strong> ₹{orderDetails.totalAmount.toFixed(2)}</p>
                    <p><strong>Original Amount:</strong> ₹{orderDetails.originalAmount.toFixed(2)}</p>
                    <p><strong>Product Discount:</strong> ₹{orderDetails.productDiscountAmount.toFixed(2)}</p>
                    <p><strong>Order Discount:</strong> ₹{orderDetails.orderDiscountAmount.toFixed(2)}</p>
                    <p><strong>Subtotal:</strong> ₹{orderDetails.subtotalAmount.toFixed(2)}</p>
                    <p><strong>Shipping:</strong> ₹{orderDetails.shippingAmount.toFixed(2)}</p>
                    <p><strong>Tax:</strong> ₹{orderDetails.taxAmount.toFixed(2)}</p>
                    <p><strong>Razorpay Order ID:</strong> {orderDetails.razorpayOrderId}</p>
                    <p><strong>Payment Status:</strong> {orderDetails.razorpayOrderStatus}</p>
                    <p><strong>Carrier ID:</strong> {orderDetails.carrierId}</p>
                    {orderDetails.appliedDiscountName && (
                      <p><strong>Applied Discount:</strong> {orderDetails.appliedDiscountName} (ID: {orderDetails.appliedDiscountId})</p>
                    )}
                    {orderDetails.invoiceId ? (
                      <p><strong>Invoice ID:</strong> {orderDetails.invoiceId}</p>
                    ) : (
                      <p><strong>Invoice ID:</strong> Not available</p>
                    )}
                  </div>

                  <div className="order-address-section">
                    <h3>Shipping Address</h3>
                    <p>{JSON.parse(orderDetails.shippingAddress).firstName} {JSON.parse(orderDetails.shippingAddress).lastName}</p>
                    <p>{JSON.parse(orderDetails.shippingAddress).addressLine1}</p>
                    {JSON.parse(orderDetails.shippingAddress).addressLine2 && <p>{JSON.parse(orderDetails.shippingAddress).addressLine2}</p>}
                    <p>{JSON.parse(orderDetails.shippingAddress).city}, {JSON.parse(orderDetails.shippingAddress).state} - {JSON.parse(orderDetails.shippingAddress).pincode}</p>
                    <p>Phone: {JSON.parse(orderDetails.shippingAddress).phone}</p>
                  </div>

                  <div className="order-address-section">
                    <h3>Billing Address</h3>
                    <p>{JSON.parse(orderDetails.billingAddress).firstName} {JSON.parse(orderDetails.billingAddress).lastName}</p>
                    <p>{JSON.parse(orderDetails.billingAddress).addressLine1}</p>
                    {JSON.parse(orderDetails.billingAddress).addressLine2 && <p>{JSON.parse(orderDetails.billingAddress).addressLine2}</p>}
                    <p>{JSON.parse(orderDetails.billingAddress).city}, {JSON.parse(orderDetails.billingAddress).state} - {JSON.parse(orderDetails.billingAddress).pincode}</p>
                    <p>Phone: {JSON.parse(orderDetails.billingAddress).phone}</p>
                  </div>

                  <div className="order-items-section">
                    <h3>Order Items</h3>
                    {orderDetails.orderItems.map((item, index) => (
                      <div key={index} className="order-item">
                        <img src={item.imageUrl || '/placeholder-image.jpg'} alt={item.productName} className="order-item-image" />
                        <div className="order-item-details">
                          <h4>{item.productName}</h4>
                          <p>Quantity: {item.quantity}</p>
                          <p>Unit: {item.unitMeasurement}</p>
                          <p>Price: ₹{item.originalAmount.toFixed(2)}</p>
                          <p>Discount: ₹{item.discountAmount.toFixed(2)}</p>
                          <p>After Discount: ₹{item.afterDiscountAmount.toFixed(2)}</p>
                          <p>Tax: ₹{item.taxAmount.toFixed(2)} ({item.taxPercentage}%)</p>
                          <p>Total: ₹{item.totalAmount.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                    {orderDetails.invoiceId ? (
                      <button
                        className="download-invoice-button"
                        onClick={() => downloadInvoice(orderDetails.invoiceId)}
                      >
                        Download Invoice
                      </button>
                    ) : (
                      <p className="no-invoice-message">No invoice available for this order.</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="order-details-error">Failed to load order details</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;