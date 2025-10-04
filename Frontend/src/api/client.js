// Frontend/src/api/client.js
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // send HTTP-only cookie automatically
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const fallback = { success: false, message: 'Something went wrong' };
    if (err.response?.data) return Promise.reject(err.response.data);
    return Promise.reject(fallback);
  }
);