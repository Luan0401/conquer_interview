import axios from "axios";

const api = axios.create({
  baseURL: "https://localhost:7016/api/", // thay bằng backend của bạn
});

// Nếu có token thì tự động gửi kèm
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;