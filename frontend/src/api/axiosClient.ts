import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor cho Request: đính kèm JWT Token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor cho Response: xử lý lỗi 401 (token hết hạn)
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Bỏ qua redirect nếu đang ở trang login hoặc gọi API login
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      const isLoginPage = window.location.pathname === '/login';
      
      if (!isLoginRequest && !isLoginPage) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
