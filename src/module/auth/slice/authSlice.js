import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authApi } from "../../../api/auth/AuthApi";

// ===============================
// LOGIN
// ===============================
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, thunkAPI) => {
    try {
      const response = await authApi.login(credentials);

      console.log("LOGIN RESPONSE:", response);

      // authApi.login() already returns response.data
      if (response?.data?.token) {
        localStorage.setItem("token", response.data.token);
      }

      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Login failed",
      );
    }
  },
);

// ===============================
// CHECK AUTHENTICATION
// ===============================
export const checkAuthentication = createAsyncThunk(
  "auth/checkAuthentication",
  async (_, thunkAPI) => {
    try {
      const response = await authApi.isAuthenticated();

      console.log("AUTH CHECK RESPONSE:", response);

      return response;
    } catch (error) {
      console.error("AUTH CHECK ERROR:", error);

      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Authentication failed",
      );
    }
  },
);

// ===============================
// LOGOUT
// ===============================
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, thunkAPI) => {
    try {
      const response = await authApi.logout();

      console.log("LOGOUT RESPONSE:", response);

      return response;
    } catch (error) {
      console.error("LOGOUT ERROR:", error);

      // We still want to clear frontend authentication
      // even if backend logout fails.
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Logout failed",
      );
    }
  },
);

// ===============================
// SLICE
// ===============================
const authSlice = createSlice({
  name: "auth",

  initialState: {
    user: null,
    isAuthenticated: false,
    authChecking: true,
    loading: false,
    error: null,
  },

  reducers: {
    // Local-only logout if needed
    logout: (state) => {
      console.log("🔴 LOGOUT REDUCER EXECUTED");

      state.user = null;
      state.isAuthenticated = false;
      state.authChecking = false;
      state.loading = false;
      state.error = null;

      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
    },
  },

  extraReducers: (builder) => {
    builder

      // ===============================
      // LOGIN
      // ===============================
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.authChecking = false;

        state.user = action.payload.data;
        state.isAuthenticated = true;
        state.error = null;
      })

      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.authChecking = false;

        state.error = action.payload;
        state.user = null;
        state.isAuthenticated = false;
      })

      // ===============================
      // AUTH CHECK
      // ===============================
      .addCase(checkAuthentication.pending, (state) => {
        state.authChecking = true;
      })

      .addCase(checkAuthentication.fulfilled, (state, action) => {
        console.log("✅ AUTHENTICATION CHECK:", action.payload);

        state.authChecking = false;

        // Backend returns true / false directly
        state.isAuthenticated = action.payload === true;

        state.error = null;
      })

      .addCase(checkAuthentication.rejected, (state, action) => {
        console.log("❌ AUTHENTICATION CHECK FAILED");

        state.authChecking = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload;

        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
      })

      // ===============================
      // LOGOUT
      // ===============================
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(logoutUser.fulfilled, (state) => {
        console.log("✅ LOGOUT SUCCESS");

        state.user = null;
        state.isAuthenticated = false;
        state.authChecking = false;
        state.loading = false;
        state.error = null;

        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
      })

      .addCase(logoutUser.rejected, (state, action) => {
        console.log("⚠️ LOGOUT API FAILED - CLEARING FRONTEND AUTH");

        state.user = null;
        state.isAuthenticated = false;
        state.authChecking = false;
        state.loading = false;
        state.error = action.payload;

        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
      });
  },
});

export const { logout } = authSlice.actions;

export default authSlice.reducer;
