import axios from "axios";

const api = axios.create({
  baseURL: "https://localhost:7016/api/",
});

// Helper function để check token expiration
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return Date.now() >= payload.exp * 1000;
  } catch (error) {
    return true;
  }
};

// Request interceptor: check token expiration trước khi gửi request
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");
    
    if (token) {
      // Check token expiration
      if (isTokenExpired(token)) {
        // Token hết hạn → clear và redirect
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        // Dispatch event để useAuthCheck có thể handle
        window.dispatchEvent(new Event("tokenExpired"));
        // Redirect về login
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return Promise.reject(new Error("Token đã hết hạn"));
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: handle 401 và các lỗi khác
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized → clear session và redirect
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      // Dispatch event để useAuthCheck có thể handle
      window.dispatchEvent(new Event("tokenExpired"));
      // Redirect về login nếu chưa ở trang login
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
