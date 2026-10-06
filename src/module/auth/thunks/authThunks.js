import { createAsyncThunk } from "@reduxjs/toolkit";

import authApi from "../../../api/auth/AuthApi";

import { clearMenuPermissions } from "../../menuPermission/slices/menuPermissionSlice";

import {
  getRolePermission,
  getUserPermission,
} from "../../menuPermission/thunks/menuPermissionThunks";

/* =========================================================
   GET ROLE ID
========================================================= */

const getRoleId = (user) => {
  if (!user) {
    return null;
  }

  return user?.roleId ?? user?.role?.id ?? user?.role?.roleId ?? null;
};

/* =========================================================
   GET ROLE NAME
========================================================= */

const getRoleName = (user) => {
  if (!user) {
    return "";
  }

  return String(
    user?.roleName ??
      user?.role?.roleName ??
      user?.role?.name ??
      user?.role ??
      user?.authority ??
      "",
  )
    .trim()
    .toUpperCase();
};

/* =========================================================
   LOAD CURRENT USER PERMISSIONS
========================================================= */

/*
 * Loads BOTH:
 *
 * 1. Role permissions
 * 2. Direct user permissions
 *
 * This must happen before authentication is considered ready.
 */

const loadCurrentUserPermissions = async (user, dispatch) => {
  if (!user) {
    return;
  }

  const roleId = getRoleId(user);

  const roleName = getRoleName(user);

  console.log("AUTH PERMISSION LOAD - USER:", user);

  console.log("AUTH PERMISSION LOAD - ROLE ID:", roleId);

  console.log("AUTH PERMISSION LOAD - ROLE NAME:", roleName);

  /*
   * -------------------------------------------------------
   * SUPER ADMIN / ADMIN
   * -------------------------------------------------------
   *
   * Sidebar already gives these roles full access.
   *
   * No permission API is required for them.
   */

  const hasFullAccess = roleName === "SUPER_ADMIN" || roleName === "ADMIN";

  if (hasFullAccess) {
    console.log("FULL ACCESS ROLE - SKIPPING PERMISSION API");

    return;
  }

  /*
   * -------------------------------------------------------
   * ROLE PERMISSIONS
   * -------------------------------------------------------
   */

  if (roleId) {
    console.log("LOADING ROLE PERMISSIONS FOR ROLE:", roleId);

    await dispatch(
      getRolePermission({
        roleId,
      }),
    ).unwrap();

    console.log("ROLE PERMISSIONS LOADED");
  } else {
    console.warn(
      "No roleId found for current user. Role permissions were not loaded.",
    );
  }

  /*
   * -------------------------------------------------------
   * DIRECT USER PERMISSIONS
   * -------------------------------------------------------
   */

  console.log("LOADING DIRECT USER PERMISSIONS");

  await dispatch(getUserPermission()).unwrap();

  console.log("DIRECT USER PERMISSIONS LOADED");
};

/* =========================================================
   LOGIN
========================================================= */

export const loginUser = createAsyncThunk(
  "auth/loginUser",

  async (credentials, { dispatch, rejectWithValue }) => {
    try {
      /*
       * ---------------------------------------------------
       * 1. LOGIN
       * ---------------------------------------------------
       */

      const loginResponse = await authApi.login(credentials);

      console.log("LOGIN RESPONSE:", loginResponse);

      /*
       * ---------------------------------------------------
       * 2. GET COMPLETE CURRENT USER
       * ---------------------------------------------------
       */

      const meResponse = await authApi.getCurrentUser();

      console.log("CURRENT USER RESPONSE:", meResponse);

      const user = meResponse?.data || meResponse;

      if (!user) {
        throw new Error("Unable to load current user after login.");
      }

      console.log("FINAL LOGGED-IN USER:", user);

      console.log("FINAL ROLE:", getRoleName(user));

      console.log("FINAL ROLE ID:", getRoleId(user));

      /*
       * ---------------------------------------------------
       * 3. CLEAR OLD USER PERMISSIONS
       * ---------------------------------------------------
       */

      dispatch(clearMenuPermissions());

      /*
       * ---------------------------------------------------
       * 4. STORE USER
       * ---------------------------------------------------
       */

      localStorage.setItem("user", JSON.stringify(user));

      /*
       * ---------------------------------------------------
       * 5. LOAD CURRENT USER PERMISSIONS
       * ---------------------------------------------------
       *
       * IMPORTANT:
       *
       * Authentication does not complete until the role
       * permissions and direct user permissions are loaded.
       */

      await loadCurrentUserPermissions(user, dispatch);

      /*
       * ---------------------------------------------------
       * 6. RETURN COMPLETE USER
       * ---------------------------------------------------
       */

      return {
        loginResponse,
        user,
      };
    } catch (error) {
      console.error("LOGIN ERROR:", error);

      /*
       * Make sure stale permission data cannot remain.
       */

      dispatch(clearMenuPermissions());

      return rejectWithValue(
        error?.response?.data || error?.message || "Login failed.",
      );
    }
  },
);

/* =========================================================
   CHECK AUTHENTICATION
========================================================= */

export const checkAuthentication = createAsyncThunk(
  "auth/checkAuthentication",

  async (_, { dispatch, rejectWithValue }) => {
    try {
      /*
       * -------------------------------------------------
       * 1. VERIFY SESSION
       * -------------------------------------------------
       */

      await authApi.isAuthenticated();

      /*
       * -------------------------------------------------
       * 2. GET CURRENT USER
       * -------------------------------------------------
       */

      const response = await authApi.getCurrentUser();

      const user = response?.data || response;

      if (!user) {
        throw new Error("Unable to load current user.");
      }

      console.log("RESTORED CURRENT USER:", user);

      console.log("RESTORED ROLE:", getRoleName(user));

      console.log("RESTORED ROLE ID:", getRoleId(user));

      /*
       * -------------------------------------------------
       * 3. CLEAR OLD PERMISSIONS
       * -------------------------------------------------
       */

      dispatch(clearMenuPermissions());

      /*
       * -------------------------------------------------
       * 4. STORE USER
       * -------------------------------------------------
       */

      localStorage.setItem("user", JSON.stringify(user));

      /*
       * -------------------------------------------------
       * 5. LOAD ROLE + USER PERMISSIONS
       * -------------------------------------------------
       */

      await loadCurrentUserPermissions(user, dispatch);

      /*
       * -------------------------------------------------
       * 6. RETURN
       * -------------------------------------------------
       */

      return {
        authenticated: true,
        user,
      };
    } catch (error) {
      console.error("AUTHENTICATION CHECK ERROR:", error);

      localStorage.removeItem("user");

      dispatch(clearMenuPermissions());

      return rejectWithValue(
        error?.response?.data || error?.message || "Authentication failed.",
      );
    }
  },
);

/* =========================================================
   LOGOUT
========================================================= */

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",

  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await authApi.logout();

      /*
       * Clear all permission state.
       */

      dispatch(clearMenuPermissions());

      localStorage.removeItem("user");

      return response;
    } catch (error) {
      localStorage.removeItem("user");

      dispatch(clearMenuPermissions());

      return rejectWithValue(
        error?.response?.data || error?.message || "Logout failed.",
      );
    }
  },
);
