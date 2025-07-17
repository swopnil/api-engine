import React, { createContext, useContext, useState, useEffect } from 'react';

// API Client for backend communication
class APIClient {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
    this.apiEndpoint = process.env.REACT_APP_API_ENDPOINT || '/api';
    this.token = localStorage.getItem('api_token');
  }
  
  setToken(token) {
    this.token = token;
    localStorage.setItem('api_token', token);
  }
  
  clearToken() {
    this.token = null;
    localStorage.removeItem('api_token');
  }
  
  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };
    
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    
    try {
      const response = await fetch(`${this.baseURL}${this.apiEndpoint}${endpoint}`, {
        ...options,
        headers
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Network error' }));
        throw new Error(error.detail || `HTTP ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }
  
  async get(endpoint) {
    return this.request(endpoint);
  }
  
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
  
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
  
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }
}

const AuthContext = createContext();
const apiClient = new APIClient();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      if (apiClient.token) {
        const userData = await apiClient.get('/auth/me');
        setUser(userData);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      apiClient.clearToken();
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      setError('');
      const response = await apiClient.post('/auth/login', {
        username,
        password
      });
      
      apiClient.setToken(response.access_token);
      setUser(response.user);
      return true;
    } catch (error) {
      setError(error.message);
      return false;
    }
  };

  const register = async (username, email, password) => {
    try {
      setError('');
      const response = await apiClient.post('/auth/register', {
        username,
        email,
        password
      });
      
      apiClient.setToken(response.access_token);
      setUser(response.user);
      return true;
    } catch (error) {
      setError(error.message);
      return false;
    }
  };

  const logout = () => {
    apiClient.clearToken();
    setUser(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    apiClient
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export { apiClient };
