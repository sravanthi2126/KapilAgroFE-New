import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart } from 'lucide-react';
import { toast } from 'react-toastify';
import { apiClient } from '../../services/authService';
import './Wishlist.css';

const Wishlist = ({ wishlist, setWishlist }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const productIds = Array.from(wishlist);
        if (productIds.length === 0) {
          setProducts([]);
          setLoading(false);
          return;
        }
        const fetchedProducts = await Promise.all(
          productIds.map(async (productId) => {
            const response = await apiClient.get(`/user/products/${productId}`);
            if (response.status === 200 && response.data.status === 'success') {
              const product = response.data.data;
              const variantResponse = await apiClient.get(
                `/user/product-variants/product/${productId}`
              );
              return {
                ...product,
                variants:
                  variantResponse.status === 200 &&
                  variantResponse.data.status === 'success'
                    ? variantResponse.data.data.map((variant) => ({
                        ...variant,
                        unitMeasurement: variant.unitMeasurement || null,
                      }))
                    : [],
              };
            }
            throw new Error('Failed to fetch product');
          })
        );
        setProducts(fetchedProducts);
      } catch (error) {
        console.error('Error fetching wishlist products:', error);
        setError('Failed to load wishlist products. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistProducts();
  }, [wishlist]);

  const removeFromWishlist = (productId) => {
    const newWishlist = new Set(wishlist);
    newWishlist.delete(productId);
    setWishlist(newWishlist);
    toast.info('Removed from wishlist');
  };

  const getProductImage = (product) =>
    product.images && product.images.length > 0
      ? product.images[0]
      : '/images/placeholder.jpg';

  if (loading) {
    return (
      <div className="wishlist-container">
        <div className="header-section">
          <button className="back-btn" onClick={() => navigate('/')}>
            <ArrowLeft size={20} />
            Back to Home
          </button>
          <h1 className="page-title">Loading Wishlist...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wishlist-container">
        <div className="header-section">
          <button className="back-btn" onClick={() => navigate('/')}>
            <ArrowLeft size={20} />
            Back to Home
          </button>
          <h1 className="page-title">Wishlist</h1>
        </div>
        <div className="error-message">
          {error}
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-container">
      <div className="header-section">
        <button className="back-btn" onClick={() => navigate('/')}>
          <ArrowLeft size={20} />
          Back to Home
        </button>
        <h1 className="page-title">Your Wishlist</h1>
        <p className="wishlist-count">{wishlist.size} items</p>
      </div>
      {products.length === 0 ? (
        <div className="no-products">
          <p>Your wishlist is empty.</p>
          <button
            onClick={() => navigate('/products/all')}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="wishlist-grid">
          {products.map((product) => {
            const minPriceVariant = product.variants.reduce(
              (min, variant) =>
                !min || variant.afterDiscountAmount < min.afterDiscountAmount
                  ? variant
                  : min,
              null
            );
            return (
              <div key={product.productId} className="wishlist-item">
                <div className="wishlist-image-container">
                  <img
                    src={getProductImage(product)}
                    alt={product.productName}
                    className="wishlist-image"
                    onError={(e) => {
                      e.target.src = '/images/placeholder.jpg';
                    }}
                  />
                  <button
                    className={`wishlist-btn ${wishlist.has(product.productId) ? 'active' : ''}`}
                    onClick={() => removeFromWishlist(product.productId)}
                  >
                    <Heart
                      size={18}
                      fill={wishlist.has(product.productId) ? 'currentColor' : 'none'}
                    />
                  </button>
                </div>
                <h3 className="wishlist-title">{product.productName}</h3>
                {minPriceVariant && (
                  <div className="wishlist-price">
                    <span className="current-price">
                      ₹{minPriceVariant.afterDiscountAmount}
                    </span>
                    {minPriceVariant.unitMeasurement && (
                      <span className="unit-measurement">
                        ({minPriceVariant.unitMeasurement})
                      </span>
                    )}
                  </div>
                )}
                <button
                  className="view-details-btn"
                  onClick={() => navigate(`/products/${product.categoryId}`, { state: { product } })}
                >
                  View Details
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Wishlist;