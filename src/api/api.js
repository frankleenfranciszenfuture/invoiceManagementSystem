import axios from "axios";
import { getImageUrl } from "./utils/imageUtils";

/* =========================================================
   AXIOS INSTANCE
   ========================================================= */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api/v1.0";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});
/* =========================================================
   AUTO LOGOUT
   ========================================================= */

const logoutUser = () => {
  /*
   * Remove old tokens if they exist from an older version.
   */
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("posToken");
  localStorage.removeItem("posRefreshToken");

  /*
   * Redirect to login.
   */
  if (window.location.pathname !== "/login") {
    window.location.replace("/login");
  }
};

/* =========================================================
   REQUEST INTERCEPTOR
   ========================================================= */

api.interceptors.request.use(
  (config) => {
    /*
     * DO NOT read JWT from localStorage.
     *
     * DO NOT manually add:
     *
     * Authorization: Bearer <token>
     *
     * The browser will automatically send the HttpOnly
     * `jwt` cookie because withCredentials = true.
     */

    return config;
  },

  (error) => {
    return Promise.reject(error);
  },
);

/* =========================================================
   RESPONSE INTERCEPTOR
   ========================================================= */

api.interceptors.response.use(
  /* =======================================================
     SUCCESS
     ======================================================= */

  (response) => {
    return response;
  },

  /* =======================================================
     ERROR
     ======================================================= */

  async (error) => {
    if (!error.response) {
      return Promise.reject(error);
    }

    const originalRequest = error.config;

    const status = error.response.status;

    /* =====================================================
       LOGIN REQUEST
       ===================================================== */

    /*
     * Do not redirect because of a failed login.
     */
    if (originalRequest?.url?.includes("/login")) {
      return Promise.reject(error);
    }

    /* =====================================================
       LOGOUT REQUEST
       ===================================================== */

    /*
     * Backend logout can return normally.
     */
    if (originalRequest?.url?.includes("/logout")) {
      return Promise.reject(error);
    }

    /* =====================================================
       AUTHENTICATION CHECK
       ===================================================== */

    if (originalRequest?.url?.includes("/is-authenticated")) {
      /*
       * 401 means there is no valid authenticated session.
       */
      if (status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");

        return Promise.reject(error);
      }

      return Promise.reject(error);
    }

    /* =====================================================
       UNAUTHORIZED
       ===================================================== */

    if (status === 401) {
      logoutUser();

      return Promise.reject(error);
    }

    /* =====================================================
       FORBIDDEN
       ===================================================== */

    if (status === 403) {
      return Promise.reject(error);
    }

    return Promise.reject(error);
  },
);

export const getProductImageUrl = (image) => {
  return getImageUrl(image, "products");
};
export default api;
