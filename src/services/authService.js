// authService.js
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const apiClient = axios.create({
  // baseURL: 'http://localhost:8080',
  baseURL: 'https://shopapi.kapilagro.com',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to headers if available
const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.Authorization;
  }
};

// Helper function to check if token is expired
export const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const decoded = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    console.error('Error decoding token:', error);
    return true;
  }
};

export const isAuthenticated = () => {
  try {
    const token = localStorage.getItem('token');
    return token && !isTokenExpired(token);
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

// Function to refresh access token
export const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post('/user/refresh-token', { refreshToken });
    const { token, refreshToken: newRefreshToken } = response.data;

    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', newRefreshToken || refreshToken);
    setAuthToken(token);

    return token;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    clearAuth();
    window.dispatchEvent(new CustomEvent('userLoggedOut'));
    throw error;
  }
};

// Schedule token refresh based on expiration time
export const scheduleTokenRefresh = () => {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const decoded = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000);
    const expiresIn = decoded.exp - currentTime;

    // Refresh 30 seconds before expiry (for 5-minute tokens)
    const refreshTime = (expiresIn - 30) * 1000;

    if (refreshTime > 0) {
      setTimeout(async () => {
        try {
          await refreshAccessToken();
          scheduleTokenRefresh();
        } catch (error) {
          console.error('Proactive token refresh failed:', error);
        }
      }, refreshTime);
    }
  } catch (error) {
    console.error('Error scheduling token refresh:', error);
  }
};

// Auto-logout when token expires
export const setupAutoLogout = () => {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const decoded = jwtDecode(token);
    const expiresAt = decoded.exp * 1000; // Convert to milliseconds
    const now = Date.now();
    const timeUntilExpiry = expiresAt - now;

    if (timeUntilExpiry > 0) {
      console.log(`Auto-logout scheduled in ${Math.round(timeUntilExpiry / 1000)} seconds`);

      setTimeout(() => {
        console.log('Token expired, auto-logging out...');
        clearAuth();
        window.dispatchEvent(new CustomEvent('userLoggedOut'));
        if (window.showInfo) {
          window.showInfo('Your session has expired. Please login again.');
        }
      }, timeUntilExpiry);
    } else {
      // Token already expired
      console.log('Token already expired, logging out immediately');
      clearAuth();
      window.dispatchEvent(new CustomEvent('userLoggedOut'));
    }
  } catch (error) {
    console.error('Error setting up auto-logout:', error);
  }
};

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && !isTokenExpired(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (token) {
      clearAuth();
      window.dispatchEvent(new CustomEvent('userLoggedOut'));
    }



    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
apiClient.interceptors.response.use(
  (response) => {

    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    console.error('API Error Details:', {
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      code: error.code
    });

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const newToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    if (error.response) {
      switch (error.response.status) {
        case 401:
          localStorage.removeItem('token');
          break;
        case 403:
          break;
        case 404:
          break;
        case 409:
          break;
        case 422:
          break;
        case 500:
          break;
        default:
      }
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }

    return Promise.reject(error);
  }
);

// Authentication API functions
export const authAPI = {
  // Email login
  loginWithEmail: async (email, password) => {
    const response = await apiClient.post('/user/login', { email, password });
    return response.data;
  },

  // Phone OTP request for login
  requestLoginOTP: async (phoneNo) => {
    const response = await apiClient.post('/user/login/otp/request', { phoneNo });
    return response.data;
  },

  // Phone OTP verification for login
  verifyLoginOTP: async (phoneNo, otp) => {
    const response = await apiClient.post('/user/login/otp/verify', {
      phoneNo,
      otp: otp.toString()
    });
    return response.data;
  },

  // Registration OTP request
  requestRegisterOTP: async (userData) => {
    const response = await apiClient.post('/user/register/otp/request', userData);
    return response.data;
  },

  // Registration OTP verification - FIXED ENDPOINT
  verifyRegisterOTP: async (phoneNo, otp) => {

    const response = await apiClient.post('/user/register/otp/verify', {
      phoneNo: phoneNo.toString(),
      otp: otp.toString()
    });

    return response.data;
  },

  // Fetch user cart
  fetchUserCart: async () => {
    const response = await apiClient.get('/user/cart/usercart');
    return response.data;
  }
};

// Generic HTTP methods
export const get = async (url, config = {}) => {
  try {
    const response = await apiClient.get(url, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const post = async (url, data = {}, config = {}) => {
  try {
    const response = await apiClient.post(url, data, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const put = async (url, data = {}, config = {}) => {
  try {
    const isFormData = config.headers?.['Content-Type'] === 'application/x-www-form-urlencoded';

    let requestData = data;
    let requestConfig = { ...config };

    if (isFormData) {
      const formData = new URLSearchParams();
      for (const [key, value] of Object.entries(data)) {
        formData.append(key, value);
      }
      requestData = formData.toString();
      requestConfig.headers = {
        ...requestConfig.headers,
        'Content-Type': 'application/x-www-form-urlencoded',
      };
    } else {
      requestConfig.headers = {
        ...requestConfig.headers,
        'Content-Type': 'application/json',
      };
    }

    const response = await apiClient.put(url, requestData, requestConfig);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const del = async (url, config = {}) => {
  try {
    const response = await apiClient.delete(url, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Helper function to get current user token
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function to clear authentication
export const clearAuth = () => {
  const itemsToRemove = [
    'token',
    'refreshToken',
    'user',
    'userId',
    'role',
    'name',
    'email',
    'phoneNo'
  ];

  itemsToRemove.forEach(item => localStorage.removeItem(item));
  delete apiClient.defaults.headers.Authorization;

  console.log('Authentication cleared - user logged out');
};

export const validateAndRefreshToken = async () => {
  const token = localStorage.getItem('token');

  if (!token) {
    return false;
  }

  if (isTokenExpired(token)) {
    try {
      await refreshAccessToken();
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      clearAuth();
      return false;
    }
  }

  return true;
};

// Export apiClient for direct use
export { apiClient, setAuthToken };