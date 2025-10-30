import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Categories.css';
import { apiClient, scheduleTokenRefresh } from '../../services/authService';

const Categories = ({ setCurrentPage }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setCurrentPage('categories'); // Set current page to 'categories'
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get('user/categories');
const data = response.data; // ✅ Axios already gives parsed JSON

if (data.status === 'success') {
  setCategories(data.data);
} else {
  setError('Failed to fetch categories');
}
      } catch (err) {
        setError('Error fetching categories: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [setCurrentPage]);

  const handleCategoryClick = (categoryId, categoryName) => {
    navigate(`/products/${categoryId}`, { state: { categoryName } });
  };

  if (loading) {
    return (
      <div className="categories-container">
        <div className="categories-header">
          <h1 className="categories-title">Browse Categories</h1>
          <p className="categories-subtitle">Discover our wide range of product categories</p>
        </div>
        <div className="categories-grid">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="category-card loading"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="categories-container">
        <div className="categories-header">
          <h1 className="categories-title">Browse Categories</h1>
          <p className="categories-subtitle">Discover our wide range of product categories</p>
        </div>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="categories-container">
      <div className="categories-header">
        <h1 className="categories-title">Browse Categories</h1>
        <p className="categories-subtitle">Discover our wide range of product categories</p>
      </div>
      
      <div className="categories-grid">
        {categories.map((category) => (
          <div key={category.categoryId} className="category-card">
            <div className="category-image-container">
              <img 
                src={category.categoryImg} 
                alt={category.categoryName}
                className="category-image"
                loading="lazy"
              />
              <div className="category-overlay">
                <div className="category-overlay-content">
                  <span className="product-count">Explore Products</span>
                </div>
              </div>
            </div>
            
            <div className="category-content">
              <h3 className="category-name">{category.categoryName}</h3>
              
              <button 
                className="view-products-btn"
                onClick={() => handleCategoryClick(category.categoryId, category.categoryName)}
              >
                <span>View Products</span>
                <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;