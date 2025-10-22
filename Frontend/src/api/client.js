// Frontend/src/api/client.js - UPDATE INTERCEPTOR
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // send HTTP-only cookie automatically
});

// Handle 401 responses (user deactivated or session expired)
// api.interceptors.response.use(
//   (res) => res,
//   (err) => {
//     const fallback = { success: false, message: 'Something went wrong' };

//     if (err.response?.status === 401) {
//       // Clear any cached user data
//       if (typeof window !== 'undefined') {
//         localStorage.removeItem('socketToken');
        
//         // ✅ FIX: Check if we're already on login page before redirecting
//         const currentPath = window.location.pathname;
//         if (currentPath !== '/login') {
//           window.location.href = '/login';
//         }
//       }
//       return Promise.reject({
//         success: false,
//         message: err.response.data?.message || 'Authentication failed'
//       });
//     }

//     if (err.response?.data) return Promise.reject(err.response.data);
//     return Promise.reject(fallback);
//   }
// );