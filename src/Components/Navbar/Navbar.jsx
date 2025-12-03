import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, User, Search as SearchIcon, Heart, Package } from 'lucide-react';
import Search from '../Search/Search';
import { showSuccess, dismissAllToasts } from '../../utils/toastUtils';
import './Navbar.css';
import Cart from '../Cart/Cart';
import LoginModal from './LoginModal';
import kapilAgroLogo from '../Assets/kapil agro logo.png';
import kapilGroupLogo from '../Assets/kapil group.png';
import { isTokenExpired, scheduleTokenRefresh, setupAutoLogout } from '../../services/authService';

// Update the LoginRequiredPopup component:
const LoginRequiredPopup = ({ isOpen, onClose, pageType, onLoginClick }) => {
  if (!isOpen) return null;

  const messages = {
    orders: {
      title: "Login Required",
      message: "Please login to view your orders.",
      icon: <Package size={40} />
    },
    wishlist: {
      title: "Login Required",
      message: "Please login to view your wishlist.",
      icon: <Heart size={40} />
    }
  };

  const currentMessage = messages[pageType] || messages.orders;

  return (
    <div className="kapil-login-popup-overlay" onClick={onClose}>
      <div className="kapil-login-popup" onClick={(e) => e.stopPropagation()}>
        <div className="kapil-login-popup-header">
          <h3>{currentMessage.title}</h3>
          <button className="kapil-login-popup-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="kapil-login-popup-content">
          <div className="kapil-login-popup-icon">
            {currentMessage.icon}
          </div>
          <p>{currentMessage.message}</p>
          <button
            className="kapil-login-popup-btn"
            onClick={() => {
              onClose(); // Close the popup
              onLoginClick(); // Open the login modal
            }}
          >
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );
};


const Navbar = ({ currentPage, setCurrentPage, cart, setCart, wishlist = new Set(), isLoginOpen, setIsLoginOpen }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [popupType, setPopupType] = useState('orders'); // ADD THIS


  // Sync currentPage with current route AND handle special cases
  useEffect(() => {
    const path = location.pathname.replace('/', '');

    // Handle special cases: about and contact are sections on home page
    if (path === '' || path === 'home') {
      // Check if we're already viewing about or contact section via URL hash
      if (window.location.hash === '#about' || window.location.hash === '#fresh-landing') {
        setCurrentPage('about');
      } else if (window.location.hash === '#contact' || window.location.hash === '#footer') {
        setCurrentPage('contact');
      } else {
        setCurrentPage('home');
      }
    } else {
      setCurrentPage(path);
    }
  }, [location.pathname, setCurrentPage]);

  // Listen for hash changes (for about/contact sections)
  useEffect(() => {
    const handleHashChange = () => {
      if (location.pathname === '/' || location.pathname === '') {
        if (window.location.hash === '#about' || window.location.hash === '#fresh-landing') {
          setCurrentPage('about');
        } else if (window.location.hash === '#contact' || window.location.hash === '#footer') {
          setCurrentPage('contact');
        } else if (window.location.hash === '' || window.location.hash === '#home') {
          setCurrentPage('home');
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [location.pathname, setCurrentPage]);

  useEffect(() => {
    const loadUser = () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');

      if (storedUser && token) {
        try {
          if (isTokenExpired(token)) {
            console.log('Token expired during page load, auto-logging out');
            handleLogout();
            return;
          }

          setUser(JSON.parse(storedUser));
          scheduleTokenRefresh();
          setupAutoLogout();

        } catch (error) {
          console.error('Error parsing user data:', error);
          handleLogout();
        }
      } else {
        setUser(null);
      }
    };

    loadUser();

    const handleStorageChange = (e) => {
      if (e.key === 'user' || e.key === 'token') {
        loadUser();
      }
    };

    const handleLoginEvent = () => {
      loadUser();
      setIsLoginOpen(false);
      console.log('userLoggedIn event, setting isLoginOpen to false');

      const token = localStorage.getItem('token');
      if (token && !isTokenExpired(token)) {
        setupAutoLogout();
      }
    };

    const handleLogoutEvent = () => {
      setUser(null);
      setCart([]);
      setIsMobileMenuOpen(false);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userLoggedIn', handleLoginEvent);
    window.addEventListener('userLoggedOut', handleLogoutEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLoggedIn', handleLoginEvent);
      window.removeEventListener('userLoggedOut', handleLogoutEvent);
    };
  }, [setIsLoginOpen, setCart]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen &&
        !event.target.closest('.kapil-navbar-mobile-menu') &&
        !event.target.closest('.kapil-navbar-mobile-toggle')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    dismissAllToasts();
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    setUser(null);
    setCart([]);
    setIsMobileMenuOpen(false);
    window.dispatchEvent(new CustomEvent('userLoggedOut'));
    showSuccess('Logged out successfully');
    navigate('/');
    setCurrentPage('home');
  };

  const toggleMobileSearch = () => {
    setIsMobileSearchOpen(!isMobileSearchOpen);
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  const toggleMobileMenu = () => {
    console.log('Toggle mobile menu clicked, current state:', isMobileMenuOpen);
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (isMobileSearchOpen) {
      setIsMobileSearchOpen(false);
    }
  };

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      const offset = 80;
      const y = section.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: y, behavior: 'smooth' });

      // Update URL hash to reflect the section
      window.history.replaceState(null, null, `#${sectionId}`);

      return true;
    }
    return false;
  };

  const handleNavigation = (page) => {
    console.log(`Navigating to ${page} from ${location.pathname}`);

    // Check if user is logged in for protected pages - SHOW POPUP INSTEAD OF LOGIN MODAL
    if ((page === 'orders' || page === 'wishlist') && !user) {
      console.log('User not logged in, showing popup for:', page);
      setPopupType(page); // Set which page they tried to access
      setShowLoginPopup(true); // Show the popup
      setIsMobileMenuOpen(false);
      setIsMobileSearchOpen(false);
      return; // Don't navigate, just show popup
    }
    // Set current page immediately for visual feedback
    setCurrentPage(page);
    setIsMobileMenuOpen(false);
    setIsMobileSearchOpen(false);

    // Handle special cases for about and contact (they are sections on home page)
    if (page === 'about' || page === 'contact') {
      const sectionId = page === 'about' ? 'fresh-landing' : 'footer';

      if (location.pathname === '/') {
        // Already on home page, scroll to section and update URL hash
        scrollToSection(sectionId);
      } else {
        // Navigate to home first
        navigate('/');
        // Scroll after a short delay to ensure page is loaded
        setTimeout(() => {
          scrollToSection(sectionId);
        }, 100);
      }
      return;
    }

    // Handle home page navigation
    if (page === 'home') {
      if (location.pathname === '/') {
        // Already on home page, scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // Clear any hash from URL
        window.history.replaceState(null, null, '/');
      } else {
        // Navigate to home
        navigate('/');
      }
      return;
    }

    // Handle other pages (categories, orders, etc.)
    navigate(`/${page}`);
  };

  const handleLoginClick = () => {
    setIsLoginOpen(true);
    setIsMobileMenuOpen(false);
  };

  const handleWishlistClick = () => {
    handleNavigation('wishlist');
  };

  // Determine if a page is active
  const isPageActive = (page) => {
    return currentPage === page;
  };

  return (
    <header className="kapil-navbar">
      <div className="kapil-navbar-container">
        <div className="kapil-navbar-left">
          <div className="kapil-navbar-images">
            <div className="kapil-navbar-image-slot">
              <img
                src={kapilAgroLogo}
                alt="Kapil Agro Logo"
                className="kapil-navbar-image"
              />
            </div>
            <div className="kapil-navbar-logo">
              <h1
                className="kapil-logo-title"
                onClick={() => handleNavigation('home')}
                style={{ cursor: 'pointer' }}
              >
                Kapil Agro
              </h1>
            </div>
            <div className="kapil-navbar-image-slot">
              <img
                src={kapilGroupLogo}
                alt="Kapil Group Logo"
                className="kapil-navbar-image"
              />
            </div>
          </div>
        </div>

        <nav className="kapil-navbar-desktop">
          {['home', 'categories', 'about', 'contact', 'orders'].map((page) => (
            <button
              key={page}
              className={`kapil-nav-item ${isPageActive(page) ? 'kapil-nav-item-active' : ''}`}
              onClick={() => handleNavigation(page)}
            >
              {page.charAt(0).toUpperCase() + page.slice(1)}
            </button>
          ))}
        </nav>

        <div className="kapil-navbar-right">
          <Search isMobile={false} setCurrentPage={setCurrentPage} />

          <button
            onClick={toggleMobileSearch}
            className="kapil-mobile-search-toggle"
            aria-label="Toggle mobile search"
          >
            <SearchIcon size={20} className="kapil-mobile-search-icon" />
          </button>

          <Cart
            cart={cart}
            setCart={setCart}
            setIsLoginOpen={setIsLoginOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
          />

          <button
            onClick={handleWishlistClick}
            className="kapil-navbar-wishlist"
            aria-label="View wishlist"
          >
            <Heart size={20} className="kapil-wishlist-icon" />
            {wishlist && wishlist.size > 0 && (
              <span className="kapil-wishlist-badge">{wishlist.size}</span>
            )}
          </button>

          {user ? (
            <div className="kapil-navbar-user kapil-desktop-user">
              <span className="kapil-user-greeting">
                Hello, {user.name || 'User'}
              </span>
              <button
                onClick={handleLogout}
                className="kapil-navbar-logout"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={handleLoginClick}
              className="kapil-navbar-login kapil-desktop-login"
            >
              <User size={18} />
              <span>Login</span>
            </button>
          )}

          <button
            onClick={toggleMobileMenu}
            className="kapil-navbar-mobile-toggle"
            aria-label="Toggle mobile menu"
            data-menu-open={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {isMobileSearchOpen && (
        <div className="kapil-mobile-search-bar" style={{ display: 'block' }}>
          <Search isMobile={true} setCurrentPage={setCurrentPage} />
        </div>
      )}

      {isMobileMenuOpen && (
        <div
          className="kapil-navbar-mobile-menu show-mobile-menu"
          style={{ display: 'flex' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="kapil-mobile-menu-content">
            <div className="kapil-mobile-nav-items">
              {['home', 'categories', 'about', 'contact', 'orders'].map((page) => (
                <button
                  key={page}
                  className={`kapil-mobile-menu-item ${isPageActive(page) ? 'kapil-mobile-active' : ''}`}
                  onClick={() => handleNavigation(page)}
                >
                  {page.charAt(0).toUpperCase() + page.slice(1)}
                </button>
              ))}
            </div>

            <div className="kapil-mobile-menu-divider"></div>

            <div style={{ marginBottom: '0.5rem' }}>
              <Cart cart={cart} setCart={setCart} setIsLoginOpen={setIsLoginOpen} />
            </div>

            <button
              onClick={handleWishlistClick}
              className="kapil-mobile-menu-wishlist"
            >
              <Heart size={18} />
              <span>Wishlist</span>
              {wishlist && wishlist.size > 0 && (
                <span className="kapil-mobile-wishlist-badge">{wishlist.size}</span>
              )}
            </button>

            {user ? (
              <div className="kapil-mobile-user-section">
                <p className="kapil-mobile-user-greeting">
                  Hello, {user.name || 'User'}
                </p>
                <button
                  onClick={handleLogout}
                  className="kapil-mobile-logout-btn"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={handleLoginClick}
                className="kapil-mobile-menu-login"
              >
                <User size={18} />
                <span>Login</span>
              </button>
            )}
          </div>
        </div>
      )}

      <LoginRequiredPopup
        isOpen={showLoginPopup}
        onClose={() => setShowLoginPopup(false)}
        pageType={popupType}
        onLoginClick={() => {
          setIsLoginOpen(true); // This opens the login modal
        }}
      />
      
      <LoginModal
        isOpen={isLoginOpen}
        setIsOpen={setIsLoginOpen}
        setCurrentPage={setCurrentPage}
        setCart={setCart}
      />
    </header>
  );
};

export default Navbar;