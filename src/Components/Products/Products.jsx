import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Heart, ArrowLeft, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { apiClient } from '../../services/authService';
import './Products.css';

const Products = ({ setCurrentPage, cart, setCart, wishlist, setWishlist, setIsLoginOpen }) => {
  const [products, setProducts] = useState([]);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedPlantAge, setSelectedPlantAge] = useState('1');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPageState] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [pageSize] = useState(15); // Products per page

  const { categoryId } = useParams();
  const { state } = useLocation();
  const categoryName = state?.categoryName || 'All Products';
  const navigate = useNavigate();

  const fetchProducts = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    setCurrentPageState(page);

    try {
      const url = categoryId === 'all'
        ? `/user/products?page=${page}&size=${pageSize}`
        : `/user/products/category/${categoryId}?page=${page}&size=${pageSize}`;

      const response = await apiClient.get(url);

      if (response.status === 200 && response.data.status === 'success') {
        const responseData = response.data.data;

        // Check if response has pagination structure
        let productsArray;
        let paginationInfo = {
          totalPages: 1,
          totalProducts: 0
        };

        // Handle different possible response structures
        if (Array.isArray(responseData)) {
          // Case 1: Direct array of products
          productsArray = responseData;
          paginationInfo.totalProducts = responseData.length;
        } else if (responseData.products && Array.isArray(responseData.products)) {
          // Case 2: { products: [], totalPages, totalProducts, currentPage }
          productsArray = responseData.products;
          paginationInfo.totalPages = responseData.totalPages || 1;
          paginationInfo.totalProducts = responseData.totalProducts || responseData.products.length;
          paginationInfo.currentPage = responseData.currentPage || page;
        } else if (responseData.content && Array.isArray(responseData.content)) {
          // Case 3: Spring Boot pagination format { content: [], totalPages, totalElements, etc }
          productsArray = responseData.content;
          paginationInfo.totalPages = responseData.totalPages || 1;
          paginationInfo.totalProducts = responseData.totalElements || responseData.content.length;
        } else {
          // Fallback: assume it's the products array
          productsArray = responseData;
          paginationInfo.totalProducts = responseData.length;
        }

        console.log('API Response structure:', {
          responseData,
          productsArray,
          paginationInfo
        });

        // If no products found
        if (!productsArray || productsArray.length === 0) {
          setProducts([]);
          setTotalPages(1);
          setTotalProducts(0);
          setLoading(false);
          return;
        }

        // Fetch variants for all products
        const productsWithVariants = await Promise.all(
          productsArray.map(async (product) => {
            try {
              const variantResponse = await apiClient.get(
                `/user/product-variants/product/${product.productId}`
              );

              // Determine product category
              const category = product.category ? product.category.toLowerCase() : '';
              const productName = product.productName ? product.productName.toLowerCase() : '';
              const isPlant = category === 'plants' ||
                category.includes('plant') ||
                productName.includes('plant');
              const isFertilizer = category === 'fertilizers' ||
                category === 'fertilizer' ||
                category.includes('urea') ||
                category.includes('vermicompost') ||
                productName.includes('urea') ||
                productName.includes('vermicompost') ||
                productName.includes('fertilizer');

              return {
                ...product,
                variants:
                  variantResponse.status === 200 &&
                    variantResponse.data.status === 'success'
                    ? variantResponse.data.data.map((variant) => ({
                      ...variant,
                      unitOfMeasurement: variant.unitOfMeasurement || null,
                    }))
                    : [],
                isPlant: isPlant,
                isFertilizer: isFertilizer,
                categoryType: isPlant ? 'plant' : isFertilizer ? 'fertilizer' : 'other'
              };
            } catch (err) {
              console.error(
                `Error fetching variants for product ${product.productId}:`,
                err
              );
              return { ...product, variants: [] };
            }
          })
        );

        setProducts(productsWithVariants);
        setTotalPages(paginationInfo.totalPages);
        setTotalProducts(paginationInfo.totalProducts);

        // Update current page if provided by backend
        if (paginationInfo.currentPage) {
          setCurrentPageState(paginationInfo.currentPage);
        }
      } else {
        setError('Failed to fetch products: Invalid response format');
      }
    } catch (err) {
      console.error('Products fetch error:', err);
      if (err.response && err.response.status === 403) {
        setError('Please log in to view products');
        setIsLoginOpen(true);
      } else if (err.response && err.response.status === 401) {
        setError('Session expired. Please log in again');
        localStorage.removeItem('token');
        setIsLoginOpen(true);
      } else if (err.code === 'ECONNABORTED') {
        setError('Request timeout. Please check your connection and try again');
      } else if (!err.response) {
        setError('Network error. Please check your connection');
      } else {
        setError('Error fetching products: ' + (err.response?.data?.message || err.message));
      }
    } finally {
      setLoading(false);
    }
  }, [categoryId, setIsLoginOpen, pageSize]);

  useEffect(() => {
    setCurrentPage('categories');
    fetchProducts(1);

    if (state?.product) {
      setCurrentProduct(state.product);
      setSelectedVariant(state.product.variants[0] || null);
      setMainImageIndex(0);
      setShowDetail(true);
    }
  }, [categoryId, setCurrentPage, fetchProducts, state]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchProducts(newPage);
      // Scroll to top when page changes
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Rest of your existing functions remain the same...
  const showProductDetail = (product) => {
    setCurrentProduct(product);
    setSelectedVariant(product.variants[0] || null);
    setSelectedPlantAge('1');
    setMainImageIndex(0);
    setShowDetail(true);
  };

  const toggleWishlist = (productId, event) => {
    if (event) event.stopPropagation();
    const newWishlist = new Set(wishlist);
    if (newWishlist.has(productId)) {
      newWishlist.delete(productId);
      toast.info('Removed from wishlist');
    } else {
      newWishlist.add(productId);
      toast.info('Added to wishlist');
    }
    setWishlist(newWishlist);
  };

  const selectVariant = (variant) => setSelectedVariant(variant);

  const addToCart = async () => {
    if (!currentProduct || !selectedVariant) {
      toast.error('Please select a product variant');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to add items to cart');
      setIsLoginOpen(true);
      return;
    }

    setAddingToCart(true);

    try {
      const payload = {
        variantId: selectedVariant.variantId,
        quantity: 1,
        unitOfMeasurement: selectedVariant.unitOfMeasurement || null,
        plantAge: currentProduct.isPlant ? selectedPlantAge : null,
      };

      const response = await apiClient.post('/user/cart/add', payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 201 && response.data.status === 'success') {
        toast.success('Item added to cart successfully!');
        try {
          const cartResponse = await apiClient.get('/user/cart/usercart');
          if (cartResponse.status === 200 && cartResponse.data.status === 'success') {
            const detailedCart = cartResponse.data.data.map((item) => ({
              ...item,
              localQuantity: item.quantity,
              after_discount_price: item.afterDiscountPrice,
              image_url: item.imageUrl,
              product_name: item.productName,
              unit_of_measurement: item.unitOfMeasurement || null,
            }));
            setCart(detailedCart);
          }
        } catch (cartErr) {
          console.warn('Failed to refresh cart data:', cartErr);
        }
      } else {
        const errorMessage = response.data?.message || 'Failed to add item to cart';
        toast.error(errorMessage);
        console.error('Add to cart failed:', response.data);
      }
    } catch (err) {
      console.error('Add to cart error:', err);
      let errorMessage = 'Failed to add item to cart';
      if (err.response?.status === 403) {
        errorMessage = 'Please log in to add items to cart';
        setIsLoginOpen(true);
      } else if (err.response?.status === 401) {
        errorMessage = 'Session expired. Please log in again';
        localStorage.removeItem('token');
        setIsLoginOpen(true);
      } else if (err.response?.status === 409) {
        errorMessage = 'Item already exists in cart';
      } else if (err.response?.status === 400) {
        errorMessage = err.response.data?.message || 'Invalid request. Please try again';
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please check your connection';
      } else if (!err.response) {
        errorMessage = 'Network error. Please check your connection';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      toast.error(errorMessage);
    } finally {
      setAddingToCart(false);
    }
  };

  const buyNow = async () => {
    if (!currentProduct || !selectedVariant) {
      toast.error('Please select a product variant');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to proceed with purchase');
      setIsLoginOpen(true);
      return;
    }

    setBuyingNow(true);

    try {
      const payload = {
        variantId: selectedVariant.variantId,
        quantity: 1,
        unitOfMeasurement: selectedVariant.unitOfMeasurement || null,
        plantAge: currentProduct.isPlant ? selectedPlantAge : null,
      };

      const response = await apiClient.post('/user/cart/add', payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 201 && response.data.status === 'success') {
        const cartResponse = await apiClient.get('/user/cart/usercart');
        if (cartResponse.status === 200 && cartResponse.data.status === 'success') {
          const detailedCart = cartResponse.data.data.map((item) => ({
            ...item,
            localQuantity: item.quantity,
            after_discount_price: item.afterDiscountPrice,
            image_url: item.imageUrl,
            product_name: item.productName,
            unit_of_measurement: item.unitOfMeasurement || null,
          }));
          setCart(detailedCart);

          navigate('/address', { state: { cartItems: detailedCart } });
        }
      } else {
        const errorMessage = response.data?.message || 'Failed to process buy now';
        toast.error(errorMessage);
      }
    } catch (err) {
      console.error('Buy now error:', err);
      let errorMessage = 'Failed to process buy now';
      if (err.response?.status === 403) {
        errorMessage = 'Please log in to proceed with purchase';
        setIsLoginOpen(true);
      } else if (err.response?.status === 401) {
        errorMessage = 'Session expired. Please log in again';
        localStorage.removeItem('token');
        setIsLoginOpen(true);
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      toast.error(errorMessage);
    } finally {
      setBuyingNow(false);
    }
  };

  const getProductImage = (product) =>
    product.images && product.images.length > 0
      ? product.images[0]
      : '/images/placeholder.jpg';

  const calculateDiscount = (variant) => {
    if (!variant || !variant.discountPercentage || variant.discountPercentage <= 0) {
      return null;
    }
    return Math.round(variant.discountPercentage);
  };

  const hasDiscount = (variant) => {
    return variant && variant.originalAmount && variant.afterDiscountAmount &&
      variant.originalAmount > variant.afterDiscountAmount;
  };

  const getCurrentPrice = (variant, plantAge) => {
    if (!variant) return { current: 0, original: 0 };

    if (currentProduct?.isPlant && plantAge) {
      const ageSpecificVariant = currentProduct.variants.find(v =>
        v.plantAge === plantAge || v.variantName.includes(`${plantAge} Year`)
      );

      if (ageSpecificVariant) {
        return {
          current: ageSpecificVariant.afterDiscountAmount || ageSpecificVariant.originalAmount,
          original: ageSpecificVariant.originalAmount
        };
      }

      const basePrice = variant.afterDiscountAmount || variant.originalAmount;
      const ageMultiplier = { '1': 1, '2': 1.5, '3': 2 }[plantAge] || 1;
      const calculatedPrice = basePrice * ageMultiplier;

      return {
        current: calculatedPrice,
        original: hasDiscount(variant)
          ? calculatedPrice / (1 - (calculateDiscount(variant) || 0) / 100)
          : calculatedPrice
      };
    }

    return {
      current: variant.afterDiscountAmount || variant.originalAmount,
      original: variant.originalAmount
    };
  };

  // Pagination Component
  const Pagination = () => {
    if (totalPages <= 1) return null;

    const renderPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 5;

      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={`pagination-page ${currentPage === i ? 'active' : ''}`}
          >
            {i}
          </button>
        );
      }

      return pages;
    };

    return (
      <div className="pagination-container">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-btn pagination-prev"
        >
          <ChevronLeft size={16} />
          Previous
        </button>

        <div className="pagination-pages">
          {renderPageNumbers()}
        </div>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="pagination-btn pagination-next"
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="products-container">
        <div className="header-section">
          <button className="back-btn11" onClick={() => navigate('/')}>
            <ArrowLeft size={20} />
            Back to Home
          </button>
          <h1 className="page-title">Loading Products...</h1>
        </div>
        <div className="products-grid">
          {[...Array(12)].map((_, index) => (
            <div key={index} className="product-card loading"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="products-container">
        <div className="header-section">
          <button className="back-btn11" onClick={() => navigate('/')}>
            <ArrowLeft size={20} />
            Back to Home
          </button>
        </div>
        <div className="error-message">
          {error}
          <button
            onClick={() => fetchProducts(1)}
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

  if (showDetail && currentProduct) {
    const discount = selectedVariant ? calculateDiscount(selectedVariant) : null;
    const images = currentProduct.images || [getProductImage(currentProduct)];
    const priceInfo = getCurrentPrice(selectedVariant, selectedPlantAge);

    return (
      <div className="products-container">
        <button className="back-btn11" onClick={() => setShowDetail(false)}>
          <ArrowLeft size={20} />
          Back to Products
        </button>
        <div className="product-detail">
          <div className="product-detail-content">
            <div>
              <div className="product-detail-image-container">
                <img
                  src={images[mainImageIndex]}
                  alt={currentProduct.productName}
                  className="product-detail-image"
                  onError={(e) => {
                    e.target.src = '/images/placeholder.jpg';
                  }}
                />
                {discount && (
                  <div className="discount-badge-detail">{discount}% OFF</div>
                )}
              </div>
              {images.length > 1 && (
                <div className="sub-images">
                  {images.map((image, index) => (
                    <div
                      key={index}
                      className={`sub-image-container ${mainImageIndex === index ? 'selected' : ''
                        }`}
                      onClick={() => setMainImageIndex(index)}
                    >
                      <img
                        src={image}
                        alt={`${currentProduct.productName} sub-image ${index + 1}`}
                        className="sub-image"
                        onError={(e) => {
                          e.target.src = '/images/placeholder.jpg';
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="product-detail-info">
              <h2 className="product-detail-title">{currentProduct.productName}</h2>
              <p className="product-category-badge">
                Category: {currentProduct.category}
                {currentProduct.isPlant && <span className="plant-indicator"> 🌱 Plant</span>}
                {currentProduct.isFertilizer && <span className="fertilizer-indicator"> 🌿 Fertilizer</span>}
              </p>

              {/* Plant Age Selector - Only for plants */}
              {/* {currentProduct.isPlant && (
  <div className="plant-age-section">
    <h3 className="variant-title">Choose Plant Age:</h3>
    <div className="plant-age-options">
      {['1'].map((age) => {
        const priceInfo = getCurrentPrice(selectedVariant, age);
        return (
          <div
            key={age}
            className={`plant-age-option ${selectedPlantAge === age ? 'selected' : ''}`}
            onClick={() => setSelectedPlantAge(age)}
          >
            <div className="age-label">{age} Year{age !== '1' ? 's' : ''}</div>
            <div className="age-price">₹{priceInfo.current.toFixed(2)}</div>
          </div>
        );
      })}
    </div>
  </div>
)} */}

              {currentProduct.variants && currentProduct.variants.length > 0 && (
                <div className="variants-section">
                  <h3 className="variant-title">Choose Variant:</h3>
                  <div className="variants-scrollable">
                    {currentProduct.variants.map((variant) => {
                      const variantDiscount = calculateDiscount(variant);
                      const variantHasDiscount = hasDiscount(variant);

                      return (
                        <div
                          key={variant.variantId}
                          className={`variant-card ${selectedVariant?.variantId === variant.variantId ? 'selected' : ''
                            }`}
                          onClick={() => selectVariant(variant)}
                        >
                          <div className="variant-name">{variant.variantName}</div>
                          <div className="variant-unit">{variant.unitOfMeasurement}</div>
                          <div className="variant-price">₹{variant.afterDiscountAmount}</div>
                          {variantHasDiscount && (
                            <>
                              <div className="variant-original-price">₹{variant.originalAmount}</div>
                              {variantDiscount && (
                                <div className="variant-discount">{variantDiscount}% OFF</div>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {selectedVariant && (
                <div className="product-detail-price">
                  <span className="current-price">₹{priceInfo.current.toFixed(2)}</span>
                  {hasDiscount(selectedVariant) && priceInfo.original > priceInfo.current && (
                    <span className="original-price">₹{priceInfo.original.toFixed(2)}</span>
                  )}
                  <span className="unit-measurement">({selectedVariant.unitOfMeasurement})</span>
                </div>
              )}

              <div className="product-detail-description-container">
                <h3 className="product-detail-description-heading"> Product Description</h3>
                <p className="product-detail-description">
                  {currentProduct.description || 'No description available.'}
                </p>
              </div>

              <div className="action-buttons">
                <button
                  className="btn-large btn-wishlist"
                  onClick={(e) => toggleWishlist(currentProduct.productId, e)}
                >
                  <Heart
                    size={20}
                    fill={wishlist.has(currentProduct.productId) ? 'currentColor' : 'none'}
                  />
                  {wishlist.has(currentProduct.productId)
                    ? 'Remove from Wishlist'
                    : 'Add to Wishlist'}
                </button>
                <button
                  className="btn-large btn-add-cart"
                  onClick={addToCart}
                  disabled={addingToCart || !selectedVariant}
                >
                  <ShoppingCart size={20} />
                  {addingToCart ? 'Adding...' : 'Add to Cart'}
                </button>
                <button
                  className="btn-large btn-buy-now"
                  onClick={buyNow}
                  disabled={buyingNow || !selectedVariant}
                >
                  {buyingNow ? 'Processing...' : 'Buy Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="products-container">
      <div className="header-section">
        <button className="back-btn11" onClick={() => navigate('/')}>
          <ArrowLeft size={20} />
          Back to Home
        </button>
        <h1 className="page-title">{categoryName}</h1>
        <p className="products-count">
          {totalProducts} products found • Page {currentPage} of {totalPages}
        </p>
      </div>

      {products.length === 0 ? (
        <div className="no-products">
          <p>No products found in {categoryName}.</p>
          <button
            onClick={() => fetchProducts(1)}
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
            Refresh
          </button>
        </div>
      ) : (
        <>
          <div className="products-grid">
            {products.map((product) => {
              // Find the selected variant for this product
              const selectedVariant = product.variants.find(
                variant => variant.variantId === (product.selectedVariantId || product.variants[0]?.variantId)
              ) || product.variants[0];

              const discount = selectedVariant ? calculateDiscount(selectedVariant) : null;

              return (
                <div
                  key={product.productId}
                  className="product-card"
                  onClick={() => showProductDetail(product)}
                >
                  <div className="product-image-container">
                    <img
                      src={getProductImage(product)}
                      alt={product.productName}
                      className="product-image"
                      onError={(e) => {
                        e.target.src = '/images/placeholder.jpg';
                      }}
                    />

                    {discount && <div className="discount-badge">{discount}% OFF</div>}

                    {product.isPlant && <div className="product-type-badge plant-badge">🌱 Plant</div>}
                    {product.isFertilizer && <div className="product-type-badge fertilizer-badge">🌿 Fertilizer</div>}

                    <button
                      className={`wishlist-btn ${wishlist.has(product.productId) ? 'active' : ''
                        }`}
                      onClick={(e) => toggleWishlist(product.productId, e)}
                    >
                      <Heart
                        size={18}
                        fill={wishlist.has(product.productId) ? 'currentColor' : 'none'}
                      />
                    </button>
                  </div>

                  <div className="product-info">
                    <h3 className="product-title">{product.productName}</h3>

                    {selectedVariant && (
                      <div className="product-price">
                        <span className="current-price">
                          ₹{selectedVariant.afterDiscountAmount}
                        </span>
                        {selectedVariant.unitOfMeasurement && (
                          <span className="unit-measurement">({selectedVariant.unitOfMeasurement})</span>
                        )}
                        {hasDiscount(selectedVariant) && (
                          <span className="original-price">
                            ₹{selectedVariant.originalAmount}
                          </span>
                        )}
                        {discount && (
                          <span className="discount-percentage">({discount}% OFF)</span>
                        )}
                      </div>
                    )}

                    {product.variants && product.variants.length > 0 && (
                      <div className="variants-section">
                        <select
                          className="variant-dropdown"
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            const variantId = parseInt(e.target.value);
                            // Update the selected variant for this product
                            const updatedProducts = products.map(p =>
                              p.productId === product.productId
                                ? { ...p, selectedVariantId: variantId }
                                : p
                            );
                            setProducts(updatedProducts);
                          }}
                          value={selectedVariant?.variantId || ''}
                        >
                          {product.variants.map((variant) => {
                            const variantDiscount = calculateDiscount(variant);
                            const variantHasDiscount = hasDiscount(variant);

                            return (
                              <option
                                key={variant.variantId}
                                value={variant.variantId}
                              >
                                {variant.variantName} - ₹{variant.afterDiscountAmount}
                                {variant.unitOfMeasurement ? ` (${variant.unitOfMeasurement})` : ''}
                                {variantHasDiscount && ` - ${variantDiscount}% OFF`}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    )}

                    <button
                      className="view-details-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        showProductDetail(product);
                      }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Component */}
          <Pagination />
        </>
      )}
    </div>
  );
};

export default Products;
