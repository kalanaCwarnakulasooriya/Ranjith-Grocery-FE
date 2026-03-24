import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const instance = axios.create({
  baseURL: 'http://localhost:8080/api',
});

instance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().user?.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;
