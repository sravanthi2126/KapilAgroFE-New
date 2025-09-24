// New file: Search.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../services/authService';
import { toast } from 'react-toastify';
import './Search.css';

const Search = ({ isMobile = false, setCurrentPage }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.get(`/user/products/search?query=${encodeURIComponent(searchQuery)}`);
      if (response.status === 200 && response.data.status === 'success') {
        setSuggestions(response.data.data);
        setShowDropdown(true);
      } else {
        toast.error('Failed to fetch search results');
      }
    } catch (err) {
      console.error('Search error:', err);
      toast.error('Error fetching search results');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300); // Debounce for 300ms
  };

  const handleSelectProduct = async (product) => {
    setShowDropdown(false);
    setQuery('');

    try {
      // Fetch variants for the selected product
      const variantResponse = await apiClient.get(`/user/product-variants/product/${product.productId}`);
      const variants = variantResponse.status === 200 && variantResponse.data.status === 'success'
        ? variantResponse.data.data
        : [];

      // Navigate to products page with category and show detail
      setCurrentPage('categories'); // Set current page to categories/products
      navigate(`/products/${product.categoryId}`, {
        state: {
          categoryName: 'Search Results',
          product: { ...product, variants }
        }
      });
    } catch (err) {
      console.error('Error fetching variants:', err);
      toast.error('Failed to load product details');
    }
  };

  const containerClass = isMobile ? 'kapil-mobile-search-container' : 'kapil-navbar-search kapil-desktop-search';
  const inputClass = isMobile ? 'kapil-mobile-search-input' : 'kapil-search-input';
  const iconClass = isMobile ? 'kapil-mobile-search-icon' : 'kapil-search-icon';

  return (
    <div className={containerClass} ref={dropdownRef}>
      <SearchIcon size={18} className={iconClass} />
      <input
        type="text"
        placeholder="Search plants & fertilizers..."
        className={inputClass}
        value={query}
        onChange={handleInputChange}
        onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
        autoFocus={isMobile}
      />
      {showDropdown && (
        <div className="search-dropdown">
          {loading ? (
            <div className="search-loading">Loading...</div>
          ) : suggestions.length === 0 ? (
            <div className="search-no-results">No results found</div>
          ) : (
            suggestions.map((product) => (
              <div
                key={product.productId}
                className="search-suggestion-item"
                onClick={() => handleSelectProduct(product)}
              >
                <img
                  src={product.images[0] || '/images/placeholder.jpg'}
                  alt={product.productName}
                  className="search-suggestion-image"
                  onError={(e) => { e.target.src = '/images/placeholder.jpg'; }}
                />
                <div className="search-suggestion-info">
                  <h4 className="search-suggestion-name">{product.productName}</h4>
                  <p className="search-suggestion-description">
                    {product.description ? product.description.slice(0, 80) + '...' : 'No description'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Search;