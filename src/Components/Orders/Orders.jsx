import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { apiClient } from '../../services/authService';
import { 
  Package, 
  ArrowRight, 
  IndianRupee, 
  Calendar, 
  Truck, 
  X, 
  Download,
  MapPin,
  User,
  Phone,
  CreditCard,
  Filter,
  Search,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'placed', label: 'Placed' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'amount-high', label: 'Amount: High to Low' },
    { value: 'amount-low', label: 'Amount: Low to High' }
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterAndSortOrders();
  }, [orders, searchTerm, statusFilter, sortBy]);

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

  const filterAndSortOrders = () => {
    let filtered = [...orders];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.productNames.some(name => 
          name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => 
        order.orderStatus.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Sort orders
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.placedAt) - new Date(a.placedAt);
        case 'oldest':
          return new Date(a.placedAt) - new Date(b.placedAt);
        case 'amount-high':
          return b.totalAmount - a.totalAmount;
        case 'amount-low':
          return a.totalAmount - b.totalAmount;
        default:
          return 0;
      }
    });

    setFilteredOrders(filtered);
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
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${invoiceId}.pdf`);
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
    });
  };

  const getStatusColor = (status) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'placed':
        return '#f59e0b';
      case 'shipped':
        return '#3b82f6';
      case 'delivered':
        return '#10b981';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusVariant = (status) => {
    const statusLower = status.toLowerCase();
    return `status-${statusLower}`;
  };

  const parseAddress = (addressString) => {
    try {
      return typeof addressString === 'string' ? JSON.parse(addressString) : addressString;
    } catch {
      return null;
    }
  };

  const OrderCard = ({ order }) => {
    const address = parseAddress(order.shippingAddress);
    
    return (
      <div className="order-card" onClick={() => handleOrderClick(order)}>
        <div className="order-card-header">
          <div className="order-main-info">
            <div className="order-id-section">
              <Package size={18} className="order-icon" />
              <span className="order-id">Order #{order.orderId}</span>
            </div>
            <div 
              className={`order-status ${getStatusVariant(order.orderStatus)}`}
              style={{ backgroundColor: getStatusColor(order.orderStatus) }}
            >
              {order.orderStatus}
            </div>
          </div>
          
          <div className="order-meta">
            <div className="order-date">
              <Calendar size={14} />
              {formatDate(order.placedAt)}
            </div>
          </div>
        </div>

        <div className="order-products">
          {order.productNames.slice(0, 2).map((product, index) => (
            <span key={index} className="product-tag">
              {product}
            </span>
          ))}
          {order.productNames.length > 2 && (
            <span className="product-more">
              +{order.productNames.length - 2} more
            </span>
          )}
        </div>

        <div className="order-card-footer">
          <div className="order-amount-section">
            <div className="amount-main">
              <IndianRupee size={16} />
              {order.totalAmount?.toFixed(2)}
            </div>
            {order.shippingAmount > 0 && (
              <div className="shipping-info">
                + ₹{order.shippingAmount?.toFixed(2)} shipping
              </div>
            )}
          </div>
          
          {address && (
            <div className="order-location">
              <MapPin size={14} />
              {address.city}, {address.state}
            </div>
          )}

          <div className="view-details-cta">
            View Details
            <ArrowRight size={16} />
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="orders-loading">
        <div className="loading-spinner"></div>
        Loading your orders...
      </div>
    );
  }

  return (
    <div className="orders-container">
      <div className="orders-header">
        <div className="orders-title-section">
          <h1 className="orders-title">My Orders</h1>
          <p className="orders-subtitle">Manage and track your orders</p>
        </div>
        
        <div className="orders-actions">
          <button 
            className="browse-products-btn"
            onClick={() => navigate('/categories')}
          >
            Continue Shopping
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search orders or products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <label>Status:</label>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Sort by:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders Count */}
      <div className="orders-count">
        {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} found
      </div>

      {filteredOrders.length === 0 ? (
        <div className="orders-empty">
          <Package size={64} className="empty-icon" />
          <h3>No Orders Found</h3>
          <p>We couldn't find any orders matching your criteria.</p>
          {(searchTerm || statusFilter !== 'all') && (
            <button 
              className="clear-filters-btn"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="orders-grid">
          {filteredOrders.map((order) => (
            <OrderCard key={order.orderId} order={order} />
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="order-modal-overlay" onClick={closeModal}>
          <div className="order-modal" onClick={(e) => e.stopPropagation()}>
            <div className="order-modal-header">
              <div className="modal-title-section">
                <Package size={24} />
                <div>
                  <h2>Order #{selectedOrder.orderId}</h2>
                  <p className="order-date-modal">
                    Placed on {formatDate(selectedOrder.placedAt)}
                  </p>
                </div>
              </div>
              <button className="order-modal-close" onClick={closeModal}>
                <X size={24} />
              </button>
            </div>
            
            <div className="order-modal-content">
              {detailsLoading ? (
                <div className="order-details-loading">
                  <div className="loading-spinner"></div>
                  Loading order details...
                </div>
              ) : orderDetails ? (
                <div className="order-details-layout">
                  {/* Main Content */}
                  <div className="order-main-content">
                    {/* Order Items */}
                    <div className="order-items-section">
                      <h3>Order Items</h3>
                      <div className="order-items-list">
                        {orderDetails.orderItems?.map((item, index) => (
                          <div key={index} className="order-item-card">
                            <img 
                              src={item.imageUrl || '/placeholder-image.jpg'} 
                              alt={item.productName} 
                              className="order-item-image" 
                            />
                            <div className="order-item-info">
                              <h4>{item.productName}</h4>
                              <div className="item-details-grid">
                                <div className="item-detail">
                                  <span>Quantity:</span>
                                  <strong>{item.quantity}</strong>
                                </div>
                                <div className="item-detail">
                                  <span>Weight:</span>
                                  <strong>{item.unitMeasurement}</strong>
                                </div>
                                <div className="item-detail">
                                  <span>Price:</span>
                                  <strong>₹{item.afterDiscountAmount?.toFixed(2)}</strong>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="order-summary-section">
                      <h3>Order Summary</h3>
                      <div className="summary-grid">
                        <div className="summary-row">
                          <span>Items Total:</span>
                          <span>₹{orderDetails.originalAmount?.toFixed(2)}</span>
                        </div>
                        <div className="summary-row discount">
                          <span>Product Discount:</span>
                          <span>-₹{orderDetails.productDiscountAmount?.toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                          <span>Shipping:</span>
                          <span>₹{orderDetails.shippingAmount?.toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                          <span>Tax:</span>
                          <span>₹{orderDetails.taxAmount?.toFixed(2)}</span>
                        </div>
                        <div className="summary-row total">
                          <span>Total Amount:</span>
                          <span>₹{orderDetails.totalAmount?.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="order-sidebar">
                    {/* Status Card */}
                    <div className="status-card">
                      <h4>Order Status</h4>
                      <div 
                        className="current-status"
                        style={{ color: getStatusColor(orderDetails.orderStatus) }}
                      >
                        {orderDetails.orderStatus}
                      </div>
                      <p className="payment-status">
                        Payment: {orderDetails.razorpayOrderStatus}
                      </p>
                    </div>

                    {/* Shipping Address */}
                    <div className="address-card">
                      <h4>
                        <Truck size={16} />
                        Shipping Address
                      </h4>
                      {(() => {
                        const shippingAddr = parseAddress(orderDetails.shippingAddress);
                        return shippingAddr ? (
                          <div className="address-details">
                            <p className="address-name">
                              <User size={14} />
                              {shippingAddr.firstName} {shippingAddr.lastName}
                            </p>
                            <p className="address-phone">
                              <Phone size={14} />
                              {shippingAddr.phone}
                            </p>
                            <p className="address-street">{shippingAddr.addressLine1}</p>
                            {shippingAddr.addressLine2 && (
                              <p className="address-street">{shippingAddr.addressLine2}</p>
                            )}
                            <p className="address-city">
                              {shippingAddr.city}, {shippingAddr.state} - {shippingAddr.pincode}
                            </p>
                          </div>
                        ) : <p>Address not available</p>;
                      })()}
                    </div>

                    {/* Invoice Download */}
                    <div className="invoice-card">
                      {orderDetails.invoiceId ? (
                        <button
                          className="download-invoice-btn"
                          onClick={() => downloadInvoice(orderDetails.invoiceId)}
                        >
                          <Download size={18} />
                          Download Invoice
                        </button>
                      ) : (
                        <div className="invoice-pending">
                          <p>Invoice will be available after order processing</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="order-details-error">
                  Failed to load order details. Please try again.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;