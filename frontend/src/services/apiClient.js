import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

export const apiClient = axios.create({
  baseURL,
  timeout: 10000,
});

// Request interceptor: attach JWT token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('shadow-archive-access-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor: handle 401 and attempt token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('shadow-archive-refresh-token');
        if (!refreshToken) {
          localStorage.removeItem('shadow-archive-access-token');
          localStorage.removeItem('shadow-archive-refresh-token');
          window.location.href = '/login';
          return Promise.reject(error);
        }

        const response = await axios.post(`${baseURL}/auth/refresh/`, { refresh: refreshToken });
        const { access } = response.data;

        localStorage.setItem('shadow-archive-access-token', access);
        originalRequest.headers.Authorization = `Bearer ${access}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('shadow-archive-access-token');
        localStorage.removeItem('shadow-archive-refresh-token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export async function fetchHealth() {
  const { data } = await apiClient.get('/health/');
  return data;
}
