import { createSlice } from "@reduxjs/toolkit";

import {
  loginUser,
  checkAuthentication,
  logoutUser,
} from "../../auth/thunks/authThunks";

import { clearMenuPermissions } from "../../menuPermission/slices/menuPermissionSlice";

/* ============================================================
   LOCAL STORAGE
============================================================ */

const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      return null;
    }

    return JSON.parse(storedUser);
  } catch (error) {
    console.error("Failed to parse stored user:", error);

    localStorage.removeItem("user");

    return null;
  }
};

/* ============================================================
   INITIAL STATE
============================================================ */

const initialState = {
  user: getStoredUser(),

  /*
   * Do not assume that having a user in localStorage means
   * the backend session is still valid.
   */
  isAuthenticated: false,

  /*
   * App starts by checking the backend session.
   */
  authChecking: true,

  loading: false,

  error: null,

  message: "",
};

/* ============================================================
   SLICE
============================================================ */

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    /* ====================================================
           CLEAR ERROR
        ==================================================== */

    clearAuthError: (state) => {
      state.error = null;
    },

    /* ====================================================
           CLEAR MESSAGE
        ==================================================== */

    clearAuthMessage: (state) => {
      state.message = "";
    },

    /* ====================================================
           SET CURRENT USER
        ==================================================== */

    setCurrentUser: (state, action) => {
      state.user = action.payload;

      /*
       * If a user is explicitly set, authentication is
       * considered ready.
       */
      state.isAuthenticated = !!action.payload;

      state.authChecking = false;
    },
  },

  /* ========================================================
       ASYNC THUNKS
    ======================================================== */

  extraReducers: (builder) => {
    builder

      /* =====================================================
           LOGIN
        ===================================================== */

      .addCase(loginUser.pending, (state) => {
        state.loading = true;

        state.error = null;

        state.message = "";
      })

      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;

        state.authChecking = false;

        state.isAuthenticated = true;

        state.user = action.payload?.user || null;

        state.message =
          action.payload?.loginResponse?.message || "Login successful.";

        state.error = null;
      })

      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;

        state.authChecking = false;

        state.isAuthenticated = false;

        state.user = null;

        state.error =
          action.payload || action.error?.message || "Login failed.";

        state.message = "";
      })

      /* =====================================================
           CHECK AUTHENTICATION
        ===================================================== */

      .addCase(checkAuthentication.pending, (state) => {
        state.authChecking = true;

        state.error = null;
      })

      .addCase(checkAuthentication.fulfilled, (state, action) => {
        state.authChecking = false;

        state.isAuthenticated = true;

        state.user = action.payload?.user || null;

        state.error = null;
      })

      .addCase(checkAuthentication.rejected, (state, action) => {
        state.authChecking = false;

        state.isAuthenticated = false;

        state.user = null;

        state.error = action.payload || action.error?.message || null;
      })

      /* =====================================================
           LOGOUT
        ===================================================== */

      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })

      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;

        state.authChecking = false;

        state.isAuthenticated = false;

        state.user = null;

        state.error = null;

        state.message = "";
      })

      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;

        state.authChecking = false;

        state.isAuthenticated = false;

        state.user = null;

        state.error = action.payload || action.error?.message || null;

        state.message = "";
      });
  },
});

/* ============================================================
   ACTIONS
============================================================ */

export const { clearAuthError, clearAuthMessage, setCurrentUser } =
  authSlice.actions;

/* ============================================================
   REDUCER
============================================================ */

export default authSlice.reducer;
