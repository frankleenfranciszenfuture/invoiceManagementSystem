import api from "../api";

export const authApi = {
  login: async (credentials) => {
    const response = await api.post("/login", credentials, {
      withCredentials: true,
    });

    return response.data;
  },

  isAuthenticated: async () => {
    const response = await api.get("/is-authenticated", {
      withCredentials: true,
    });

    return response.data;
  },

  logout: async () => {
    const response = await api.post(
      "/logout",
      {},
      {
        withCredentials: true,
      },
    );

    return response.data;
  },
};

// import axios from "axios";

// const API_URL = "http://localhost:8081/api/v1.0";

// export const authApi = {
//   login: async (credentials) => {
//     const response = await axios.post(`${API_URL}/login`, credentials, {
//       withCredentials: true,
//     });
//     return response.data;
//   },

//   logout: async () => {
//     const response = await axios.post(
//       `${API_URL}/logout`,
//       {},
//       { withCredentials: true },
//     );
//     return response.data;
//   },
// };
