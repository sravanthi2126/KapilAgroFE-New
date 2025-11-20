import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Categories.css';
import { apiClient, scheduleTokenRefresh } from '../../services/authService';

const Categories = ({ setCurrentPage }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPageState] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCategories, setTotalCategories] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const navigate = useNavigate();

  const fetchCategories = async (page = 0, size = 4) => {
    try {
      setLoading(true);
      const response = await apiClient.get(`user/categories?page=${page}&size=${size}`);
      const data = response.data;

      if (data.status === 'success') {
        setCategories(data.data); // Paginated categories
        setCurrentPageState(data.currentPage);
        setTotalPages(data.totalPages);
        setTotalCategories(data.totalCategories);
        setHasNext(data.hasNext);
        setHasPrevious(data.hasPrevious);
      } else {
        setError('Failed to fetch categories');
      }
    } catch (err) {
      setError('Error fetching categories: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage('categories');
    fetchCategories();
  }, [setCurrentPage]);

  const handleCategoryClick = (categoryId, categoryName) => {
    navigate(`/products/${categoryId}`, { state: { categoryName } });
  };

  const handleNextPage = () => {
    if (hasNext) {
      fetchCategories(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (hasPrevious) {
      fetchCategories(currentPage - 1);
    }
  };

  const handlePageClick = (pageNumber) => {
    fetchCategories(pageNumber);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);
    
    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  if (loading && categories.length === 0) {
    return (
      <div className="categories-container">
        <div className="categories-header">
          <h1 className="categories-title">Browse Categories</h1>
          <p className="categories-subtitle">Discover our wide range of product categories</p>
        </div>
        <div className="categories-grid">
          {[...Array(12)].map((_, index) => (
            <div key={index} className="category-card loading"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error && categories.length === 0) {
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
        
        {/* Pagination Info */}
        {totalCategories > 0 && (
          <div className="pagination-info">
            Showing {categories.length} of {totalCategories} categories
            {totalPages > 1 && (
              <span className="page-info"> - Page {currentPage + 1} of {totalPages}</span>
            )}
          </div>
        )}
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pagination-controls">
          <button 
            className="pagination-btn prev-btn"
            onClick={handlePreviousPage}
            disabled={!hasPrevious}
          >
            <svg className="pagination-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>

          <div className="page-numbers">
            {getPageNumbers().map(pageNumber => (
              <button
                key={pageNumber}
                className={`page-number ${currentPage === pageNumber ? 'active' : ''}`}
                onClick={() => handlePageClick(pageNumber)}
              >
                {pageNumber + 1}
              </button>
            ))}
          </div>

          <button 
            className="pagination-btn next-btn"
            onClick={handleNextPage}
            disabled={!hasNext}
          >
            Next
            <svg className="pagination-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default Categories;