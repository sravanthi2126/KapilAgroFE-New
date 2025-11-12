import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, User, Search as SearchIcon, Heart } from 'lucide-react';
import Search from '../Search/Search';
import { showSuccess, dismissAllToasts } from '../../utils/toastUtils';
import './Navbar.css';
import Cart from '../Cart/Cart';
import LoginModal from './LoginModal';
import kapilAgroLogo from '../Assets/kapil agro logo.png';
import kapilGroupLogo from '../Assets/kapil group.png';

const Navbar = ({ currentPage, setCurrentPage, cart, setCart, wishlist = new Set(), isLoginOpen, setIsLoginOpen }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const loadUser = () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');

      if (storedUser && token) {
        try {
          setUser(JSON.parse(storedUser));
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
    };

    const handleLogoutEvent = () => {
      setIsLoginOpen(true);
      setUser(null);
      setCart([]);
      setIsMobileMenuOpen(false);
      // Toast removed from here to prevent duplicates
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userLoggedIn', handleLoginEvent);
    window.addEventListener('userLoggedOut', handleLogoutEvent);

    const intervalId = setInterval(loadUser, 24 * 60 * 60 * 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLoggedIn', handleLoginEvent);
      window.removeEventListener('userLoggedOut', handleLogoutEvent);
      clearInterval(intervalId);
    };
  }, [setIsLoginOpen, setCart]);

  // Click outside to close mobile menu
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
      return true;
    }
    return false;
  };

  const handleNavigation = (page) => {
    setCurrentPage(page); // Set the current page state immediately
    setIsMobileMenuOpen(false);
    setIsMobileSearchOpen(false);

    if (page === 'home') {
      if (window.location.pathname === '/') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        navigate('/');
        // The ScrollToSection component in App.js will handle setting 'home' and scrolling after navigation completes
      }
      return;
    }

    if (page === 'categories') {
      navigate('/categories');
      return;
    }

    if (page === 'about' || page === 'contact') {
      if (window.location.pathname === '/') {
        const sectionId = page === 'about' ? 'fresh-landing' : 'footer';
        if (!scrollToSection(sectionId)) {
          // This path is technically blocked by <Navigate to="/" replace /> in App.js, but keeping logic just in case.
          navigate(`/${page}`); 
        }
      } else {
        navigate('/');
        setTimeout(() => {
          const sectionId = page === 'about' ? 'fresh-landing' : 'footer';
          scrollToSection(sectionId); // Scroll after navigating to home page
        }, 300);
      }
      return;
    }

    navigate(`/${page}`);
  };

  const handleLoginClick = () => {
    setIsLoginOpen(true);
    setIsMobileMenuOpen(false);
  };

  const handleWishlistClick = () => {
    setCurrentPage('wishlist');
    navigate('/wishlist');
    setIsMobileMenuOpen(false);
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
              // The class is correctly applied based on the 'currentPage' state
              className={`kapil-nav-item ${currentPage === page ? 'kapil-nav-item-active' : ''}`}
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
                  className={`kapil-mobile-menu-item ${currentPage === page ? 'kapil-mobile-active' : ''}`}
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