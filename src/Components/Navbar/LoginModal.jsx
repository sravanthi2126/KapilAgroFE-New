import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import LoginForm from './AuthForms/LoginForm';
import RegisterForm from './AuthForms/RegisterForm';
import './LoginModal.css';

const LoginModal = ({ isOpen, setIsOpen, setCurrentPage, setCart }) => {
  const [isRegister, setIsRegister] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsRegister(false);
    }
  }, [isOpen]);

  const resetForm = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="lm-overlay" role="dialog" aria-labelledby="login-modal-title">
      <div className="lm-container">
        <div className="lm-header">
          <button
            onClick={resetForm}
            className="lm-close-btn"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
          <div className="lm-header-content">
            <h2 id="login-modal-title" className="lm-title">
              {isRegister ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="lm-subtitle">
              {isRegister ? 'Join our community today' : 'Sign in to continue'}
            </p>
          </div>
        </div>

        <div className="lm-content">
          {isRegister ? (
            <RegisterForm
              setIsOpen={setIsOpen}
              setCurrentPage={setCurrentPage}
              setCart={setCart}
              switchToLogin={() => setIsRegister(false)}
            />
          ) : (
            <LoginForm
              setIsOpen={setIsOpen}
              setCurrentPage={setCurrentPage}
              setCart={setCart}
              switchToRegister={() => setIsRegister(true)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;