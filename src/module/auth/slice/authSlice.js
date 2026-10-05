import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import authApi from "../../../api/auth/AuthApi";

import { fetchRolePermissionsByRoleId } from "../../rolePermission/thunks/rolePermissionThunks";

// ============================================================
// LOGIN
// ============================================================

export const loginUser = createAsyncThunk(
  "auth/loginUser",

  async (credentials, { dispatch, rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);

      const user = response?.data;

      // --------------------------------------------------------
      // LOAD ROLE PERMISSIONS
      // --------------------------------------------------------

      if (user?.roleId != null) {
        try {
          await dispatch(fetchRolePermissionsByRoleId(user.roleId)).unwrap();
        } catch (permissionError) {
          /*
           * Permission loading failure must NOT
           * make login fail.
           */
          console.warn("Role permission loading failed:", permissionError);
        }
      }

      return response;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || error?.message || "Login failed",
      );
    }
  },
);

// ============================================================
// CHECK AUTHENTICATION
// ============================================================

export const checkAuthentication = createAsyncThunk(
  "auth/checkAuthentication",

  async (_, { dispatch, rejectWithValue }) => {
    try {
      // --------------------------------------------------------
      // 1. CHECK SESSION
      // --------------------------------------------------------

      const authenticated = await authApi.isAuthenticated();

      const isLoggedIn =
        authenticated === true ||
        authenticated?.data === true ||
        authenticated?.data?.authenticated === true;

      // --------------------------------------------------------
      // NOT AUTHENTICATED
      // --------------------------------------------------------

      if (!isLoggedIn) {
        return {
          authenticated: false,
          user: null,
        };
      }

      // --------------------------------------------------------
      // 2. RESTORE CURRENT USER
      // --------------------------------------------------------

      const response = await authApi.getCurrentUser();

      const user = response?.data || response;

      // --------------------------------------------------------
      // 3. RESTORE ROLE PERMISSIONS
      // --------------------------------------------------------

      if (user?.roleId != null) {
        try {
          await dispatch(fetchRolePermissionsByRoleId(user.roleId)).unwrap();
        } catch (permissionError) {
          /*
           * Do NOT reject authentication because
           * permission loading failed.
           *
           * ADMIN can still access everything through
           * the Sidebar ADMIN bypass.
           */
          console.warn("Role permission restoration failed:", permissionError);
        }
      }

      return {
        authenticated: true,
        user,
      };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data ||
          error?.message ||
          "Authentication check failed",
      );
    }
  },
);

// ============================================================
// LOGOUT
// ============================================================

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",

  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.logout();

      return response;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || error?.message || "Logout failed",
      );
    }
  },
);

// ============================================================
// INITIAL STATE
// ============================================================

const initialState = {
  user: null,

  isAuthenticated: false,

  authChecking: true,

  loading: false,

  error: null,

  message: "",
};

// ============================================================
// SLICE
// ============================================================

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    // ========================================================
    // LOGIN
    // ========================================================

    builder

      .addCase(loginUser.pending, (state) => {
        state.loading = true;

        state.error = null;

        state.message = "";
      })

      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;

        state.isAuthenticated = true;

        state.authChecking = false;

        state.user = action.payload?.data || null;

        state.message = action.payload?.message || "Login successful";

        state.error = null;
      })

      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;

        state.isAuthenticated = false;

        state.authChecking = false;

        state.user = null;

        state.error = action.payload || "Login failed";
      });

    // ========================================================
    // CHECK AUTHENTICATION
    // ========================================================

    builder

      .addCase(checkAuthentication.pending, (state) => {
        state.authChecking = true;

        state.error = null;
      })

      .addCase(checkAuthentication.fulfilled, (state, action) => {
        state.authChecking = false;

        const authenticated = action.payload?.authenticated === true;

        state.isAuthenticated = authenticated;

        if (authenticated) {
          /*
           * CRITICAL:
           *
           * Restore logged-in user after
           * browser refresh.
           *
           * Example:
           *
           * {
           *   id: 1,
           *   name: "ADMIN",
           *   email: "admin@ims.com",
           *   roleId: 1,
           *   roleName: "ADMIN"
           * }
           */

          state.user = action.payload?.user || null;
        } else {
          state.user = null;
        }

        state.error = null;
      })

      .addCase(checkAuthentication.rejected, (state, action) => {
        state.authChecking = false;

        state.isAuthenticated = false;

        state.user = null;

        state.error = action.payload || "Authentication check failed";
      });

    // ========================================================
    // LOGOUT
    // ========================================================

    builder

      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;

        state.isAuthenticated = false;

        state.authChecking = false;

        state.loading = false;

        state.error = null;

        state.message = "Logged out successfully";
      })

      .addCase(logoutUser.rejected, (state, action) => {
        /*
         * Even when server logout fails,
         * clear client authentication.
         */

        state.user = null;

        state.isAuthenticated = false;

        state.authChecking = false;

        state.loading = false;

        state.error = action.payload || "Logout failed";
      });
  },
});

export const { clearAuthError } = authSlice.actions;

export default authSlice.reducer;
