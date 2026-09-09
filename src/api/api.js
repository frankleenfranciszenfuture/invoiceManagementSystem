import axios from "axios";

/* =========================================================
   AXIOS INSTANCE
   ========================================================= */

const api = axios.create({
  baseURL: "http://localhost:8081/api/v1.0",

  headers: {
    "Content-Type": "application/json",
  },

  /*
   * IMPORTANT:
   * Browser automatically sends the HttpOnly `jwt` cookie.
   */
  withCredentials: true,
});

/* =========================================================
   AUTO LOGOUT
   ========================================================= */

const logoutUser = () => {
  console.log("🔴 AUTO LOGOUT");

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

    console.log("➡️ REQUEST:", config.method?.toUpperCase(), config.url);

    return config;
  },

  (error) => {
    console.error("❌ REQUEST ERROR:", error);

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
    console.log("✅ RESPONSE:", response.config.url, response.status);

    return response;
  },

  /* =======================================================
     ERROR
     ======================================================= */

  async (error) => {
    if (!error.response) {
      console.error("🌐 Network error");

      return Promise.reject(error);
    }

    const originalRequest = error.config;

    const status = error.response.status;

    console.log("❌ ERROR:", status, originalRequest?.url);

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
        console.warn("⚠️ Authentication check failed");

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
      console.warn("🔐 401 Unauthorized → logout");

      logoutUser();

      return Promise.reject(error);
    }

    /* =====================================================
       FORBIDDEN
       ===================================================== */

    if (status === 403) {
      console.warn("🚫 403 Forbidden → logout");

      logoutUser();

      return Promise.reject(error);
    }

    return Promise.reject(error);
  },
);

export default api;
