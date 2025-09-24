import axios from 'axios';

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

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
  (error) => {
    // Enhanced error logging
    console.error('API Error Details:', {
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      code: error.code
    });

    if (error.response) {
      // Handle specific status codes
      switch (error.response.status) {
        case 401:
          console.log('Unauthorized - Token expired or invalid');
          localStorage.removeItem('token');
          // Don't redirect here, let components handle it
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

// Helper function to check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

// Helper function to get current user token
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function to clear authentication
export const clearAuth = () => {
  localStorage.removeItem('token');
  delete apiClient.defaults.headers.Authorization;
};

// Export apiClient for direct use
export { apiClient, setAuthToken };