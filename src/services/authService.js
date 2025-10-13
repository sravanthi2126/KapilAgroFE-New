// authService.js
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Changed to named import

const apiClient = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 15000, // Increased timeout to 15 seconds
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
    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
    return decoded.exp < currentTime;
  } catch (error) {
    console.error('Error decoding token:', error);
    return true; // Treat invalid tokens as expired
  }
};

// Modified isAuthenticated function
// In authService.js - Fix the isAuthenticated function
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

    // Update tokens in localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', newRefreshToken || refreshToken); // Update refresh token if provided
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
    
    // Refresh token 1 minute before expiration
    const refreshTime = (expiresIn - 60) * 1000; // Convert to milliseconds

    if (refreshTime > 0) {
      setTimeout(async () => {
        try {
          await refreshAccessToken();
          console.log('Token refreshed proactively');
          scheduleTokenRefresh(); // Schedule next refresh
        } catch (error) {
          console.error('Proactive token refresh failed:', error);
        }
      }, refreshTime);
    }
  } catch (error) {
    console.error('Error scheduling token refresh:', error);
  }
};

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && !isTokenExpired(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (token) {
      console.log('Token expired, clearing auth');
      clearAuth();
      // Optionally redirect to login page
      window.dispatchEvent(new CustomEvent('userLoggedOut'));
    }
    
    // Log request for debugging
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      headers: config.headers,
      data: config.data
    });
    
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
    // Log successful response for debugging
    console.log(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      data: response.data
    });
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
      originalRequest._retry = true; // Prevent infinite retry loops
      try {
        const newToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest); // Retry the original request
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Redirect to login page or show login modal
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    if (error.response) {
      // Handle specific status codes
      switch (error.response.status) {
        case 401:
          console.log('Unauthorized - Token expired or invalid');
          localStorage.removeItem('token');
          break;
        case 403:
          console.log('Forbidden - Insufficient permissions');
          break;
        case 404:
          console.log('Not Found - Resource does not exist');
          break;
        case 409:
          console.log('Conflict - Resource already exists or conflict occurred');
          break;
        case 422:
          console.log('Unprocessable Entity - Validation error');
          break;
        case 500:
          console.log('Internal Server Error');
          break;
        default:
          console.log(`HTTP Error: ${error.response.status}`);
      }
    } else if (error.request) {
      console.error('No response received:', error.request);
      console.log('Network error or server is not responding');
    } else {
      console.error('Error setting up request:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Generic GET request
export const get = async (url, config = {}) => {
  try {
    const response = await apiClient.get(url, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Generic POST request
export const post = async (url, data = {}, config = {}) => {
  try {
    const response = await apiClient.post(url, data, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Generic PUT request with JSON support (not form-urlencoded)
export const put = async (url, data = {}, config = {}) => {
  try {
    // Check if the request should be form-urlencoded
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
      // Default to JSON
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

// Generic DELETE request
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
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  delete apiClient.defaults.headers.Authorization;
};

// Export apiClient for direct use
export { apiClient, setAuthToken };


// ------------
// Add this function to authService.js
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