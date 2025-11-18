import api from "./api";

export const loginApi = (data) => api.post("Auth/login", data);

export const updateProfileApi = (userId, profileData) => api.put(`User/${userId}`, profileData);

export const registerApi = (data) => api.post("Auth/register", data);
