import axios, { type AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_VUE_APP_API_URL
  ? `${import.meta.env.VITE_VUE_APP_API_URL}/api/v1`
  : 'http://localhost:3000/api/v1';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});
export default axiosInstance;
