
// // src/App.js
// import React, { useState, useEffect } from 'react';
// import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
// import { ToastContainer } from 'react-toastify';
// import { apiClient } from './services/authService';
// import { dismissAllToasts } from './utils/toastUtils';
// import Navbar from './Components/Navbar/Navbar';
// import HeroSection from './Components/HeroSection/HeroSection';
// import FreshLanding from './Components/FreshLanding/FreshLanding';
// import Categories from './Components/Categories/Categories';
// import Products from './Components/Products/Products';
// import Wishlist from './Components/Wishlist/Wishlist';
// import ChooseUs from './Components/ChooseUs/ChooseUs';
// import About from './Components/About/About';
// import FAQ from './Components/FAQ/Faq';
// import Footer from './Components/Footer/Footer';
// import TermsAndConditions from './Components/QuickLinks/TermsAndConditions';
// import PrivacyPolicy from './Components/QuickLinks/PrivacyPolicy';
// import ShippingPolicy from './Components/QuickLinks/ShippingPolicy';
// import RefundPolicy from './Components/QuickLinks/RefundPolicy';
// import Address from './Components/Address/Address';
// import Payment from './Components/Payment/Payment';
// import OrderConfirmation from './Components/OrderConfirmation/OrderConfirmation';
// import 'react-toastify/dist/ReactToastify.css';
// import './App.css';

// const ScrollToSection = ({ setCurrentPage }) => {
//   const { pathname } = useLocation();

//   useEffect(() => {
//     const handleLoggedOut = () => {
//       // Do not trigger additional toasts here
//     };

//     window.addEventListener('userLoggedOut', handleLoggedOut);

//     if (pathname === '/') {
//       setCurrentPage('home');
//     } else if (pathname === '/about') {
//       setCurrentPage('about');
//       const section = document.getElementById('fresh-landing');
//       if (section) {
//         const offset = 80;
//         const y = section.getBoundingClientRect().top + window.pageYOffset - offset;
//         window.scrollTo({ top: y, behavior: 'smooth' });
//       }
//     } else if (pathname === '/contact') {
//       setCurrentPage('contact');
//       const section = document.getElementById('footer');
//       if (section) {
//         const offset = 80;
//         const y = section.getBoundingClientRect().top + window.pageYOffset - offset;
//         window.scrollTo({ top: y, behavior: 'smooth' });
//       }
//     } else if (pathname === '/categories') {
//       setCurrentPage('categories');
//       window.scrollTo({ top: 0, behavior: 'smooth' });
//     } else if (pathname.startsWith('/products')) {
//       setCurrentPage('categories');
//     } else if (pathname === '/wishlist') {
//       setCurrentPage('wishlist');
//     } else if (pathname === '/address') {
//       setCurrentPage('address');
//     } else if (pathname === '/payment') {
//       setCurrentPage('payment');
//     } else if (pathname === '/order-confirmation') {
//       setCurrentPage('order-confirmation');
//     }

//     const timer = setTimeout(() => {
//       if (!window.location.pathname.includes('/logout')) {
//         dismissAllToasts();
//       }
//     }, 500);

//     return () => {
//       clearTimeout(timer);
//       window.removeEventListener('userLoggedOut', handleLoggedOut);
//     };
//   }, [pathname, setCurrentPage]);

//   return null;
// };

// function App() {
//   const [currentPage, setCurrentPage] = useState('home');
//   const [cart, setCart] = useState([]);
//   const [wishlist, setWishlist] = useState(new Set());
//   const [isLoginOpen, setIsLoginOpen] = useState(false);

//   useEffect(() => {
//     const validateToken = async () => {
//       const token = localStorage.getItem('token');
//       if (token) {
//         try {
//           await apiClient.get('/user/profile');
//         } catch (err) {
//           if (err.response?.status === 401 || err.response?.status === 403) {
//             if (localStorage.getItem('token')) {
//               localStorage.removeItem('token');
//               localStorage.removeItem('user');
//               localStorage.removeItem('userId');
//               localStorage.removeItem('role');
//               localStorage.removeItem('name');
//             }
//           }
//         }
//       }
//     };
//     validateToken();
//   }, []);

//   useEffect(() => {
//     const fetchCart = async () => {
//       const token = localStorage.getItem('token');
//       if (token) {
//         try {
//           const response = await apiClient.get('/user/cart/usercart');
//           if (response.status === 200 && response.data.status === 'success') {
//             const detailedCart = response.data.data.map((item) => ({
//               ...item,
//               localQuantity: item.quantity,
//               after_discount_price: item.afterDiscountPrice,
//               image_url: item.imageUrl,
//               product_name: item.productName,
//               unit_measurement: item.unitMeasurement,
//             }));
//             setCart(detailedCart);
//           }
//         } catch (err) {
//           console.error('Failed to fetch cart:', err);
//         }
//       }
//     };

//     fetchCart();

//     const handleLogin = () => fetchCart();
//     window.addEventListener('userLoggedIn', handleLogin);

//     return () => window.removeEventListener('userLoggedIn', handleLogin);
//   }, []);

//   return (
//     <Router>
//       <div className="App">
//         <ToastContainer
//           position="bottom-right"
//           autoClose={3000}
//           hideProgressBar={false}
//           newestOnTop={false}
//           closeOnClick
//           rtl={false}
//           pauseOnFocusLoss
//           draggable
//           pauseOnHover
//           theme="colored"
//         />
//         <ScrollToSection setCurrentPage={setCurrentPage} />
//         <Routes>
//           <Route
//             path="/"
//             element={
//               <>
//                 <Navbar
//                   currentPage={currentPage}
//                   setCurrentPage={setCurrentPage}
//                   cart={cart}
//                   setCart={setCart}
//                   wishlist={wishlist}
//                   isLoginOpen={isLoginOpen}
//                   setIsLoginOpen={setIsLoginOpen}
//                 />
//                 <HeroSection />
//                 <FreshLanding />
//                 <Categories
//                   setCurrentPage={setCurrentPage}
//                   cart={cart}
//                   setCart={setCart}
//                   wishlist={wishlist}
//                   setWishlist={setWishlist}
//                 />
//                 <ChooseUs />
//                 <About />
//                 <FAQ />
//                 <Footer />
//               </>
//             }
//           />
//           <Route
//             path="/categories"
//             element={
//               <>
//                 <Navbar
//                   currentPage={currentPage}
//                   setCurrentPage={setCurrentPage}
//                   cart={cart}
//                   setCart={setCart}
//                   wishlist={wishlist}
//                   isLoginOpen={isLoginOpen}
//                   setIsLoginOpen={setIsLoginOpen}
//                 />
//                 <Categories
//                   setCurrentPage={setCurrentPage}
//                   cart={cart}
//                   setCart={setCart}
//                   wishlist={wishlist}
//                   setWishlist={setWishlist}
//                 />
//               </>
//             }
//           />
//           <Route
//             path="/products/:categoryId"
//             element={
//               <>
//                 <Navbar
//                   currentPage={currentPage}
//                   setCurrentPage={setCurrentPage}
//                   cart={cart}
//                   setCart={setCart}
//                   wishlist={wishlist}
//                   isLoginOpen={isLoginOpen}
//                   setIsLoginOpen={setIsLoginOpen}
//                 />
//                 <Products
//                   setCurrentPage={setCurrentPage}
//                   cart={cart}
//                   setCart={setCart}
//                   wishlist={wishlist}
//                   setWishlist={setWishlist}
//                   setIsLoginOpen={setIsLoginOpen}
//                 />
//               </>
//             }
//           />
//           <Route
//             path="/wishlist"
//             element={
//               <>
//                 <Navbar
//                   currentPage={currentPage}
//                   setCurrentPage={setCurrentPage}
//                   cart={cart}
//                   setCart={setCart}
//                   wishlist={wishlist}
//                   isLoginOpen={isLoginOpen}
//                   setIsLoginOpen={setIsLoginOpen}
//                 />
//                 <Wishlist wishlist={wishlist} setWishlist={setWishlist} />
//               </>
//             }
//           />
//           <Route
//             path="/address"
//             element={
//               <>
//                 <Navbar
//                   currentPage={currentPage}
//                   setCurrentPage={setCurrentPage}
//                   cart={cart}
//                   setCart={setCart}
//                   wishlist={wishlist}
//                   isLoginOpen={isLoginOpen}
//                   setIsLoginOpen={setIsLoginOpen}
//                 />
//                 <Address cart={cart} setCart={setCart} setIsLoginOpen={setIsLoginOpen} />
//               </>
//             }
//           />
//           <Route
//             path="/payment"
//             element={
//               <>
//                 <Navbar
//                   currentPage={currentPage}
//                   setCurrentPage={setCurrentPage}
//                   cart={cart}
//                   setCart={setCart}
//                   wishlist={wishlist}
//                   isLoginOpen={isLoginOpen}
//                   setIsLoginOpen={setIsLoginOpen}
//                 />
//                 <Payment cart={cart} setCart={setCart} setIsLoginOpen={setIsLoginOpen} />
//               </>
//             }
//           />
//           <Route
//             path="/order-confirmation"
//             element={
//               <>
//                 <Navbar
//                   currentPage={currentPage}
//                   setCurrentPage={setCurrentPage}
//                   cart={cart}
//                   setCart={setCart}
//                   wishlist={wishlist}
//                   isLoginOpen={isLoginOpen}
//                   setIsLoginOpen={setIsLoginOpen}
//                 />
//                 <OrderConfirmation />
//               </>
//             }
//           />
//           <Route path="/about" element={<Navigate to="/" replace />} />
//           <Route path="/contact" element={<Navigate to="/" replace />} />
//           <Route path="/terms" element={<TermsAndConditions />} />
//           <Route path="/privacy" element={<PrivacyPolicy />} />
//           <Route path="/shipping" element={<ShippingPolicy />} />
//           <Route path="/refund" element={<RefundPolicy />} />
//         </Routes>
//       </div>
//     </Router>
//   );
// }

// export default App;


import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { apiClient, validateAndRefreshToken } from './services/authService';
import { dismissAllToasts } from './utils/toastUtils';
import Navbar from './Components/Navbar/Navbar';
import HeroSection from './Components/HeroSection/HeroSection';
import FreshLanding from './Components/FreshLanding/FreshLanding';
import Categories from './Components/Categories/Categories';
import Products from './Components/Products/Products';
import Wishlist from './Components/Wishlist/Wishlist';
import ChooseUs from './Components/ChooseUs/ChooseUs';
import About from './Components/About/About';
import FAQ from './Components/FAQ/Faq';
import Footer from './Components/Footer/Footer';
import TermsAndConditions from './Components/QuickLinks/TermsAndConditions';
import PrivacyPolicy from './Components/QuickLinks/PrivacyPolicy';
import ShippingPolicy from './Components/QuickLinks/ShippingPolicy';
import RefundPolicy from './Components/QuickLinks/RefundPolicy';
import Address from './Components/Address/Address';
import Payment from './Components/Payment/Payment';
import OrderConfirmation from './Components/OrderConfirmation/OrderConfirmation';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function ScrollToSection({ setCurrentPage }) {
  const { pathname } = useLocation();

  useEffect(() => {
    const handleLoggedOut = () => {
      // Do not trigger additional toasts here
    };

    window.addEventListener('userLoggedOut', handleLoggedOut);

    if (pathname === '/') {
      setCurrentPage('home');
    } else if (pathname === '/about') {
      setCurrentPage('about');
      const section = document.getElementById('fresh-landing');
      if (section) {
        const offset = 80;
        const y = section.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    } else if (pathname === '/contact') {
      setCurrentPage('contact');
      const section = document.getElementById('footer');
      if (section) {
        const offset = 80;
        const y = section.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    } else if (pathname === '/categories') {
      setCurrentPage('categories');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (pathname.startsWith('/products')) {
      setCurrentPage('categories');
    } else if (pathname === '/wishlist') {
      setCurrentPage('wishlist');
    } else if (pathname === '/address') {
      setCurrentPage('address');
    } else if (pathname === '/payment') {
      setCurrentPage('payment');
    } else if (pathname === '/order-confirmation') {
      setCurrentPage('order-confirmation');
    }

    const timer = setTimeout(() => {
      if (!window.location.pathname.includes('/logout')) {
        dismissAllToasts();
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('userLoggedOut', handleLoggedOut);
    };
  }, [pathname, setCurrentPage]);

  return null;
}

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState(new Set());
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      const isValid = await validateAndRefreshToken();
      console.log('Token validation result:', isValid); // Debug token validation
      if (isValid) {
        const userId = localStorage.getItem('userId');
        if (userId) {
          try {
            const response = await apiClient.get(`/user/details/${userId}`);
            if (response.status === 200 && response.data.status === 'success') {
              const userData = response.data.data;
              localStorage.setItem('user', JSON.stringify(userData));
              localStorage.setItem('name', userData.name);
              localStorage.setItem('email', userData.email);
              localStorage.setItem('phoneNo', userData.phoneNo);
            }
          } catch (err) {
            console.error('Failed to fetch user details:', err);
          }
        }
      } else {
        console.log('Token validation failed, clearing auth');
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('role');
        localStorage.removeItem('name');
        localStorage.removeItem('email');
        localStorage.removeItem('phoneNo');
      }
    };
    initializeAuth();
  }, []);

  useEffect(() => {
    const fetchCart = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await apiClient.get('/user/cart/usercart');
          if (response.status === 200 && response.data.status === 'success') {
            const detailedCart = response.data.data.map((item) => ({
              ...item,
              localQuantity: item.quantity,
              after_discount_price: item.afterDiscountPrice,
              image_url: item.imageUrl,
              product_name: item.productName,
              unit_measurement: item.unitMeasurement,
            }));
            setCart(detailedCart);
          }
        } catch (err) {
          console.error('Failed to fetch cart:', err);
        }
      }
    };

    fetchCart();

    const handleLogin = () => fetchCart();
    window.addEventListener('userLoggedIn', handleLogin);

    return () => window.removeEventListener('userLoggedIn', handleLogin);
  }, []);

  return (
    <Router>
      <div className="App">
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
        <ScrollToSection setCurrentPage={setCurrentPage} />
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Navbar
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  cart={cart}
                  setCart={setCart}
                  wishlist={wishlist}
                  isLoginOpen={isLoginOpen}
                  setIsLoginOpen={setIsLoginOpen}
                />
                <HeroSection />
                <FreshLanding />
                <Categories
                  setCurrentPage={setCurrentPage}
                  cart={cart}
                  setCart={setCart}
                  wishlist={wishlist}
                  setWishlist={setWishlist}
                />
                <ChooseUs />
                <About />
                <FAQ />
                <Footer />
              </>
            }
          />
          <Route
            path="/categories"
            element={
              <>
                <Navbar
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  cart={cart}
                  setCart={setCart}
                  wishlist={wishlist}
                  isLoginOpen={isLoginOpen}
                  setIsLoginOpen={setIsLoginOpen}
                />
                <Categories
                  setCurrentPage={setCurrentPage}
                  cart={cart}
                  setCart={setCart}
                  wishlist={wishlist}
                  setWishlist={setWishlist}
                />
              </>
            }
          />
          <Route
            path="/products/:categoryId"
            element={
              <>
                <Navbar
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  cart={cart}
                  setCart={setCart}
                  wishlist={wishlist}
                  isLoginOpen={isLoginOpen}
                  setIsLoginOpen={setIsLoginOpen}
                />
                <Products
                  setCurrentPage={setCurrentPage}
                  cart={cart}
                  setCart={setCart}
                  wishlist={wishlist}
                  setWishlist={setWishlist}
                  setIsLoginOpen={setIsLoginOpen}
                />
              </>
            }
          />
          <Route
            path="/wishlist"
            element={
              <>
                <Navbar
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  cart={cart}
                  setCart={setCart}
                  wishlist={wishlist}
                  isLoginOpen={isLoginOpen}
                  setIsLoginOpen={setIsLoginOpen}
                />
                <Wishlist wishlist={wishlist} setWishlist={setWishlist} />
              </>
            }
          />
          <Route
            path="/address"
            element={
              <>
                <Navbar
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  cart={cart}
                  setCart={setCart}
                  wishlist={wishlist}
                  isLoginOpen={isLoginOpen}
                  setIsLoginOpen={setIsLoginOpen}
                />
                <Address cart={cart} setCart={setCart} setIsLoginOpen={setIsLoginOpen} />
              </>
            }
          />
          <Route
            path="/payment"
            element={
              <>
                <Navbar
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  cart={cart}
                  setCart={setCart}
                  wishlist={wishlist}
                  isLoginOpen={isLoginOpen}
                  setIsLoginOpen={setIsLoginOpen}
                />
                <Payment cart={cart} setCart={setCart} setIsLoginOpen={setIsLoginOpen} />
              </>
            }
          />
          <Route
            path="/order-confirmation"
            element={
              <>
                <Navbar
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  cart={cart}
                  setCart={setCart}
                  wishlist={wishlist}
                  isLoginOpen={isLoginOpen}
                  setIsLoginOpen={setIsLoginOpen}
                />
                <OrderConfirmation />
              </>
            }
          />
          <Route path="/about" element={<Navigate to="/" replace />} />
          <Route path="/contact" element={<Navigate to="/" replace />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/shipping" element={<ShippingPolicy />} />
          <Route path="/refund" element={<RefundPolicy />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;