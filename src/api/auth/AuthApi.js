import api from "../../api/api";

const login = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  return response.data;
};

const isAuthenticated = async () => {
  const response = await api.get("/auth/is-authenticated");
  return response.data;
};

const getCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

const logout = async () => {
  const response = await api.post("/auth/logout");
  return response.data;
};

const authApi = {
  login,
  isAuthenticated,
  getCurrentUser,
  logout,
};

export default authApi;
