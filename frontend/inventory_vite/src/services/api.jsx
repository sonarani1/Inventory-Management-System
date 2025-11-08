import axios from 'axios';
import ErrorHandler from '../utils/errorHandler';
const API = axios.create({
  baseURL: 'http://localhost:8000/api/',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach the token if available
API.interceptors.request.use(config => {
  const token = localStorage.getItem('access');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => Promise.reject(error));

// Response interceptor for global error handling
API.interceptors.response.use(
  response => response,
  error => {
    ErrorHandler.handle(error, 'API Request');
    return Promise.reject(error);
  }
);

export default API;
