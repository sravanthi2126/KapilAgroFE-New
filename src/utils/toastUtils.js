// src/utils/toastUtils.js
import { toast } from 'react-toastify';

export const showSuccess = (message, options = {}) => {
  toast.success(message, {
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: 'colored',
    ...options,
  });
};

export const showError = (message, options = {}) => {
  toast.error(message, {
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: 'colored',
    ...options,
  });
};

export const showInfo = (message, options = {}) => {
  toast.info(message, {
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: 'colored',
    onClick: options.onClick || null,
    ...options,
  });
};

export const showWarning = (message, options = {}) => {
  toast.warn(message, {
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: 'colored',
    ...options,
  });
};

export const dismissAllToasts = () => {
  toast.dismiss();
};