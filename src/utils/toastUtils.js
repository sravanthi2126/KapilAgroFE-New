// src/utils/toastUtils.js
import { toast } from 'react-toastify';

// Toast configuration
const commonOptions = {
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: 'colored',
};

export const showSuccess = (message, options = {}) => {
  toast.success(message, {
    ...commonOptions,
    autoClose: 3000,
    ...options,
  });
};

export const showError = (message, options = {}) => {
  toast.error(message, {
    ...commonOptions,
    autoClose: 5000,
    ...options,
  });
};

export const showInfo = (message, options = {}) => {
  toast.info(message, {
    ...commonOptions,
    autoClose: 5000,
    ...options,
  });
};

export const showWarning = (message, options = {}) => {
  toast.warn(message, {
    ...commonOptions,
    autoClose: 5000,
    ...options,
  });
};

export const dismissAllToasts = () => {
  toast.dismiss();
};