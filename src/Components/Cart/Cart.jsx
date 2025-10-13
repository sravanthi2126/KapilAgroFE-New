import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, Trash2, X, ShoppingBag, Package } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { apiClient, validateAndRefreshToken } from '../../services/authService';
import './Cart.css';

const Cart = ({ cart, setCart, setIsLoginOpen }) => {
  const navigate = useNavigate();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updatingItems, setUpdatingItems] = useState(new Set());

  const fetchCart = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const isValid = await validateAndRefreshToken();
      if (!isValid) {
        setError('Please log in to view cart');
        if (isCartOpen) {
          toast.info('Please log in to view your cart', {
            autoClose: 5000,
            onClick: () => setIsLoginOpen(true),
          });
        }
        return;
      }

      const response = await apiClient.get('/user/cart/usercart');
      if (response.status === 200 && response.data.status === 'success') {
        const detailedCart = response.data.data.map((item) => {
          const discountValue = item.price > item.afterDiscountPrice 
            ? item.price - item.afterDiscountPrice 
            : 0;
          const isPercentageDiscount = discountValue > 0;
          const discountPercentage = discountValue > 0 
            ? ((discountValue / item.price) * 100).toFixed(0) 
            : 0;

          const isPlant = item.category.toLowerCase() === 'plants' || 
                         item.productName.toLowerCase().includes('plant');
          const unitMeasurement = item.unitMeasurement || (isPlant ? '1 Plant' : null);
          const plantAge = item.plantAge || (isPlant ? '1' : null);

          return {
            ...item,
            localQuantity: item.quantity || 1,
            after_discount_price: item.afterDiscountPrice || item.price,
            image_url: item.imageUrl || '/images/placeholder.jpg',
            product_name: item.productName || 'Unknown Product',
            unit_measurement: unitMeasurement,
            plant_age: plantAge,
            discount_value: discountValue,
            is_percentage_discount: isPercentageDiscount,
            discount_percentage: discountPercentage,
            available_sizes: item.availableSizes || [],
          };
        });
        setCart(detailedCart);
      } else {
        const errorMsg = response.data?.message || 'Failed to fetch cart items';
        setError(errorMsg);
        toast.error(errorMsg, { autoClose: false });
      }
    } catch (err) {
      console.error('Cart fetch error:', err);
      let errorMessage = 'Failed to fetch cart items';
      if (err.response?.status === 403 || err.response?.status === 401) {
        errorMessage = 'Session expired. Please log in again';
        localStorage.removeItem('token');
        if (isCartOpen) {
          toast.info(errorMessage, {
            autoClose: 5000,
            onClick: () => setIsLoginOpen(true),
          });
        }
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please check your connection';
      } else if (!err.response) {
        errorMessage = 'Network error. Please check your connection';
      }
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: false });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem('token')) {
      fetchCart();
    }
  }, []);

  useEffect(() => {
    if (isCartOpen && localStorage.getItem('token')) {
      fetchCart();
    }
  }, [isCartOpen]);

  useEffect(() => {
    const handleLoginEvent = () => {
      if (isCartOpen) {
        fetchCart();
      }
    };
    const handleOrderPlaced = () => {
      setCart([]); // Clear cart on successful order
      fetchCart(); // Refetch to ensure consistency
    };
    window.addEventListener('userLoggedIn', handleLoginEvent);
    window.addEventListener('orderPlaced', handleOrderPlaced);
    return () => {
      window.removeEventListener('userLoggedIn', handleLoginEvent);
      window.removeEventListener('orderPlaced', handleOrderPlaced);
    };
  }, [isCartOpen]);

  const updateQuantity = async (cartItemId, quantity) => {
    if (quantity < 0) return;
    if (quantity === 0) {
      await removeItem(cartItemId);
      return;
    }

    setUpdatingItems((prev) => new Set(prev).add(cartItemId));
    try {
      const isValid = await validateAndRefreshToken();
      if (!isValid) {
        toast.info('Please log in to update cart', {
          autoClose: 5000,
          onClick: () => setIsLoginOpen(true),
        });
        return;
      }

      const payload = { quantity: parseInt(quantity) };
      const response = await apiClient.put(`/user/cart/update/${cartItemId}`, payload);

      if (response.status === 200 && response.data.status === 'success') {
        setCart((prev) =>
          prev.map((item) =>
            item.cartItemId === cartItemId
              ? {
                  ...item,
                  localQuantity: quantity,
                  quantity: quantity,
                  unit_measurement: item.category.toLowerCase() === 'plants' || 
                                  item.product_name.toLowerCase().includes('plant')
                    ? '1 Plant'
                    : item.unitMeasurement
                    ? `${quantity} ${item.unitMeasurement.replace(/^\d+\s*/, '')}`
                    : null,
                }
              : item
          )
        );
        toast.success(response.data.message || 'Cart updated successfully', { autoClose: false });
      } else {
        const errorMsg = response.data?.message || 'Failed to update cart item';
        toast.error(errorMsg, { autoClose: false });
      }
    } catch (err) {
      console.error('Update quantity error:', err);
      let errorMessage = 'Failed to update cart item';
      if (err.response?.status === 403 || err.response?.status === 401) {
        errorMessage = 'Session expired. Please log in again';
        localStorage.removeItem('token');
        toast.info(errorMessage, { autoClose: 5000, onClick: () => setIsLoginOpen(true) });
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'Update timeout. Please try again';
      } else if (!err.response) {
        errorMessage = 'Network error. Please check your connection';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      toast.error(errorMessage, { autoClose: false });
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(cartItemId);
        return newSet;
      });
    }
  };

  const removeItem = async (cartItemId) => {
    setUpdatingItems((prev) => new Set(prev).add(cartItemId));
    try {
      const isValid = await validateAndRefreshToken();
      if (!isValid) {
        toast.info('Please log in to remove cart item', {
          autoClose: 5000,
          onClick: () => setIsLoginOpen(true),
        });
        return;
      }

      const response = await apiClient.delete(`/user/cart/${cartItemId}`);

      if (response.status === 200 && response.data.status === 'success') {
        setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
        toast.success('Item removed from cart', { autoClose: false });
        const cartResponse = await apiClient.get('/user/cart/usercart');
        if (cartResponse.data.data.length === 0) {
          setCart([]);
        }
      } else {
        const errorMsg = response.data?.message || 'Failed to remove cart item';
        toast.error(errorMsg, { autoClose: false });
      }
    } catch (err) {
      console.error('Remove item error:', err);
      let errorMessage = 'Failed to remove cart item';
      if (err.response?.status === 403 || err.response?.status === 401) {
        errorMessage = 'Session expired. Please log in again';
        localStorage.removeItem('token');
        toast.info(errorMessage, { autoClose: 5000, onClick: () => setIsLoginOpen(true) });
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'Remove timeout. Please try again';
      } else if (!err.response) {
        errorMessage = 'Network error. Please check your connection';
      }
      toast.error(errorMessage, { autoClose: false });
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(cartItemId);
        return newSet;
      });
    }
  };

  const updatePlantAge = async (cartItemId, productId, newPlantAge) => {
    setUpdatingItems((prev) => new Set(prev).add(cartItemId));
    try {
      const isValid = await validateAndRefreshToken();
      if (!isValid) {
        toast.info('Please log in to update cart', {
          autoClose: 5000,
          onClick: () => setIsLoginOpen(true),
        });
        return;
      }

      const productResponse = await apiClient.get(`/user/products/get/${productId}`);

      if (productResponse.status !== 200 || productResponse.data.status !== 'success') {
        throw new Error('Failed to fetch product details');
      }

      const product = productResponse.data.data;
      let newPrice;
      switch (newPlantAge) {
        case '1':
          newPrice = product.price;
          break;
        case '2':
          newPrice = product.secondYearPrice || product.price * 1.5;
          break;
        case '3':
          newPrice = product.thirdYearPrice || product.price * 2;
          break;
        default:
          newPrice = product.price;
      }

      const currentItem = cart.find((item) => item.cartItemId === cartItemId);
      const discountValue = currentItem.discount_value || 0;
      const isPercentageDiscount = currentItem.is_percentage_discount || false;
      const afterDiscountPrice = discountValue
        ? isPercentageDiscount
          ? newPrice * (1 - discountValue / 100)
          : newPrice - discountValue
        : newPrice;

      const payload = {
        plantAge: newPlantAge,
        selectedPrice: newPrice,
        discountValue: discountValue,
        isPercentageDiscount: isPercentageDiscount,
      };

      const response = await apiClient.put(`/user/cart/updatePlantAge/${cartItemId}`, payload);

      if (response.status === 200 && response.data.status === 'success') {
        setCart((prev) =>
          prev.map((item) =>
            item.cartItemId === cartItemId
              ? {
                  ...item,
                  plant_age: newPlantAge,
                  price: newPrice,
                  after_discount_price: afterDiscountPrice,
                }
              : item
          )
        );
        toast.success('Plant age updated successfully', { autoClose: false });
      } else {
        const errorMsg = response.data?.message || 'Failed to update plant age';
        toast.error(errorMsg, { autoClose: false });
      }
    } catch (err) {
      console.error('Update plant age error:', err);
      let errorMessage = 'Failed to update plant age';
      if (err.response?.status === 403 || err.response?.status === 401) {
        errorMessage = 'Session expired. Please log in again';
        localStorage.removeItem('token');
        toast.info(errorMessage, { autoClose: 5000, onClick: () => setIsLoginOpen(true) });
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'Update timeout. Please try again';
      } else if (!err.response) {
        errorMessage = 'Network error. Please check your connection';
      }
      toast.error(errorMessage, { autoClose: false });
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(cartItemId);
        return newSet;
      });
    }
  };

  const updateSize = async (cartItemId, productId, newSize) => {
    setUpdatingItems((prev) => new Set(prev).add(cartItemId));
    try {
      const isValid = await validateAndRefreshToken();
      if (!isValid) {
        toast.info('Please log in to update cart', {
          autoClose: 5000,
          onClick: () => setIsLoginOpen(true),
        });
        return;
      }

      const productResponse = await apiClient.get(`/user/products/get/${productId}`);

      if (productResponse.status !== 200 || productResponse.data.status !== 'success') {
        throw new Error('Failed to fetch product details');
      }

      const product = productResponse.data.data;
      const sizeData = product.availableSizes?.find(size => size.size === newSize);
      const newPrice = sizeData?.price || product.price;

      const currentItem = cart.find((item) => item.cartItemId === cartItemId);
      const discountValue = currentItem.discount_value || 0;
      const isPercentageDiscount = currentItem.is_percentage_discount || false;
      const afterDiscountPrice = discountValue
        ? isPercentageDiscount
          ? newPrice * (1 - discountValue / 100)
          : newPrice - discountValue
        : newPrice;

      const payload = {
        unitMeasurement: newSize,
        selectedPrice: newPrice,
        discountValue: discountValue,
        isPercentageDiscount: isPercentageDiscount,
      };

      const response = await apiClient.put(`/user/cart/updateSize/${cartItemId}`, payload);

      if (response.status === 200 && response.data.status === 'success') {
        setCart((prev) =>
          prev.map((item) =>
            item.cartItemId === cartItemId
              ? {
                  ...item,
                  unit_measurement: newSize,
                  price: newPrice,
                  after_discount_price: afterDiscountPrice,
                }
              : item
          )
        );
        toast.success('Size updated successfully', { autoClose: false });
      } else {
        const errorMsg = response.data?.message || 'Failed to update size';
        toast.error(errorMsg, { autoClose: false });
      }
    } catch (err) {
      console.error('Update size error:', err);
      let errorMessage = 'Failed to update size';
      if (err.response?.status === 403 || err.response?.status === 401) {
        errorMessage = 'Session expired. Please log in again';
        localStorage.removeItem('token');
        toast.info(errorMessage, { autoClose: 5000, onClick: () => setIsLoginOpen(true) });
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'Update timeout. Please try again';
      } else if (!err.response) {
        errorMessage = 'Network error. Please check your connection';
      }
      toast.error(errorMessage, { autoClose: false });
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(cartItemId);
        return newSet;
      });
    }
  };

  const handleProceed = async () => {
    const isValid = await validateAndRefreshToken();
    if (!isValid) {
      toast.info('Please log in to proceed to address', {
        autoClose: 5000,
        onClick: () => setIsLoginOpen(true),
      });
      return;
    }
    if (cart.length === 0) {
      toast.error('Your cart is empty', { autoClose: false });
      return;
    }
    setIsCartOpen(false);
    navigate('/address', { state: { cartItems: cart } });
  };

  const cartItemCount = cart.length;
  const totalPrice = cart.reduce(
    (sum, item) => sum + (item.after_discount_price || item.price || 0) * (item.localQuantity || 0),
    0
  );
  const totalSavings = cart.reduce(
    (savings, item) =>
      savings +
      ((item.price - (item.after_discount_price || item.price)) * (item.localQuantity || 0)),
    0
  );

  return (
    <div className="kapil-cart-container">
      <button
        onClick={() => setIsCartOpen(true)}
        className="kapil-cart-icon"
        title="View Cart"
      >
        <ShoppingCart size={24} />
        <span className="kapil-cart-badge" data-count={cartItemCount}>
          {cartItemCount}
        </span>
      </button>

      {isCartOpen && (
        <>
          <div className="kapil-cart-backdrop" onClick={() => setIsCartOpen(false)} />
          <div className="kapil-cart-modal">
            <div className="kapil-cart-header">
              <div className="kapil-cart-header-content">
                <ShoppingBag size={22} />
                <h3 className="kapil-cart-title">Shopping Cart</h3>
                <span className="kapil-cart-item-count">{cartItemCount} Items</span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="kapil-cart-close"
                title="Close Cart"
              >
                <X size={20} />
              </button>
            </div>

            <div className="kapil-cart-body">
              {isLoading ? (
                <div className="kapil-cart-loading">
                  <div className="kapil-cart-spinner"></div>
                  <p>Loading your cart...</p>
                </div>
              ) : error ? (
                <div className="kapil-cart-error">
                  <div className="kapil-cart-error-icon">⚠️</div>
                  <p>{error}</p>
                  <button onClick={() => setIsCartOpen(false)} className="kapil-cart-continue">
                    Close
                  </button>
                </div>
              ) : cart.length === 0 ? (
                <div className="kapil-cart-empty">
                  <Package size={80} className="kapil-cart-empty-icon" />
                  <h4>Your cart is empty</h4>
                  <p>Add some delicious products to get started!</p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="kapil-cart-continue"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="kapil-cart-items">
                  {cart.map((item) => {
                    const itemTotal =
                      (item.after_discount_price || item.price || 0) * (item.localQuantity || 0);
                    const itemSavings =
                      (item.price - (item.after_discount_price || item.price)) *
                      (item.localQuantity || 0);
                    const discountBadge =
                      item.discount_value > 0
                        ? item.is_percentage_discount
                          ? `${item.discount_percentage}% OFF`
                          : `₹${item.discount_value.toFixed(2)} OFF`
                        : '';

                    return (
                      <div key={item.cartItemId} className="kapil-cart-item">
                        <div className="kapil-cart-item-image-container">
                          <img
                            src={item.image_url}
                            alt={item.product_name}
                            className="kapil-cart-item-image"
                            onError={(e) => {
                              e.target.src = '/images/placeholder.jpg';
                            }}
                          />
                        </div>

                        <div className="kapil-cart-item-details">
                          <h4 className="kapil-cart-item-name" title={item.product_name}>
                            {item.product_name}
                          </h4>

                          <div className="kapil-cart-item-info">
                            {item.unit_measurement && (
                              <div className="kapil-cart-item-measurement">
                                Size: {item.unit_measurement}
                              </div>
                            )}

                            {item.available_sizes && item.available_sizes.length > 0 && (
                              <div className="kapil-cart-item-size">
                                <label htmlFor={`size-${item.cartItemId}`} className="kapil-cart-item-size-label">
                                  Size:
                                </label>
                                <select
                                  id={`size-${item.cartItemId}`}
                                  className="kapil-cart-item-size-select"
                                  value={item.unit_measurement || ''}
                                  onChange={(e) =>
                                    updateSize(item.cartItemId, item.productId, e.target.value)
                                  }
                                  disabled={updatingItems.has(item.cartItemId)}
                                >
                                  {item.available_sizes.map((size) => (
                                    <option key={size.size} value={size.size}>
                                      {size.size}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}

                            <div className="kapil-cart-item-price">
                              {item.discount_value > 0 ? (
                                <>
                                  <span className="kapil-cart-discount-price">
                                    ₹{item.after_discount_price.toFixed(2)}
                                  </span>
                                  <span className="kapil-cart-original-price">
                                    ₹{item.price.toFixed(2)}
                                  </span>
                                  <span className="kapil-cart-discount-badge">{discountBadge}</span>
                                </>
                              ) : (
                                <span className="kapil-cart-no-discount-price">
                                  ₹{item.price.toFixed(2)}
                                </span>
                              )}
                            </div>

                            {(item.category.toLowerCase() === 'plants' ||
                              item.product_name.toLowerCase().includes('plant')) && (
                              <div className="kapil-cart-item-age">
                                <label htmlFor={`plantAge-${item.cartItemId}`} className="kapil-cart-item-age-label">
                                  Plant Age:
                                </label>
                                <select
                                  id={`plantAge-${item.cartItemId}`}
                                  className="kapil-cart-item-age-select"
                                  value={item.plant_age || '1'}
                                  onChange={(e) =>
                                    updatePlantAge(item.cartItemId, item.productId, e.target.value)
                                  }
                                  disabled={updatingItems.has(item.cartItemId)}
                                >
                                  <option value="1">1 Year</option>
                                  <option value="2">2 Years</option>
                                  <option value="3">3 Years</option>
                                </select>
                              </div>
                            )}

                            <div className="kapil-cart-item-total">
                              Total: <span className="kapil-cart-item-total-amount">₹{itemTotal.toFixed(2)}</span>
                              {itemSavings > 0 && (
                                <span style={{ color: '#16a34a', marginLeft: '8px' }}>
                                  (Save ₹{itemSavings.toFixed(2)})
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="kapil-cart-item-controls">
                          <button
                            onClick={() => removeItem(item.cartItemId)}
                            className="kapil-cart-item-remove"
                            title="Remove item"
                            disabled={updatingItems.has(item.cartItemId)}
                          >
                            {updatingItems.has(item.cartItemId) ? (
                              <div className="kapil-cart-mini-spinner"></div>
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>

                          <div className="kapil-cart-item-quantity">
                            <button
                              onClick={() => updateQuantity(item.cartItemId, item.localQuantity - 1)}
                              className="kapil-cart-item-quantity-btn"
                              disabled={updatingItems.has(item.cartItemId)}
                              title={item.localQuantity === 1 ? 'Remove item' : 'Decrease quantity'}
                            >
                              {item.localQuantity === 1 ? <Trash2 size={16} /> : <Minus size={16} />}
                            </button>
                            <span className="kapil-cart-item-quantity-value">
                              {updatingItems.has(item.cartItemId) ? (
                                <div className="kapil-cart-mini-spinner"></div>
                              ) : (
                                item.localQuantity
                              )}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.cartItemId, item.localQuantity + 1)}
                              className="kapil-cart-item-quantity-btn"
                              disabled={updatingItems.has(item.cartItemId)}
                              title="Increase quantity"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {cart.length > 0 && !isLoading && !error && (
              <div className="kapil-cart-footer">
                <div className="kapil-cart-summary">
                  <div className="kapil-cart-total">
                    <span>Subtotal ({cartItemCount} items):</span>
                    <span className="kapil-cart-total-amount">₹{totalPrice.toFixed(2)}</span>
                  </div>
                  {totalSavings > 0 && (
                    <div className="kapil-cart-savings">
                      <div className="kapil-cart-discount-info">
                        🎉 You're saving ₹{totalSavings.toFixed(2)} on this order!
                      </div>
                    </div>
                  )}
                </div>

                <div className="kapil-cart-terms">
                  <input type="checkbox" id="terms-checkbox" checked={true} readOnly />
                  <label htmlFor="terms-checkbox">
                    I accept the <a href="/shipping" target="_blank">terms and conditions</a>,{' '}
                    <a href="/refund" target="_blank">return & refund policy</a>, and{' '}
                    <a href="/privacy" target="_blank">privacy policy</a>
                  </label>
                </div>

                <button
                  onClick={handleProceed}
                  className="kapil-cart-checkout"
                  disabled={cartItemCount === 0}
                >
                  Proceed to Address
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;