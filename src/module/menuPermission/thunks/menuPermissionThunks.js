import { createAsyncThunk } from "@reduxjs/toolkit";

import api from "../../../api/api";

/* =========================================================
   GET ALL MODULE ACTIONS
========================================================= */

export const getAllModuleActions = createAsyncThunk(
  "menuPermission/getAllModuleActions",

  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/module-action/getAll");

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

/* =========================================================
   ROLE PERMISSION
========================================================= */

/* =========================================================
   CREATE ROLE PERMISSION

   Params:
   roleId

   Body:
   {
       permissions: [...]
   }
========================================================= */

export const createRolePermission = createAsyncThunk(
  "menuPermission/createRolePermission",

  async ({ roleId, data }, { rejectWithValue }) => {
    try {
      const res = await api.post("/roleAccess/create", data, {
        params: {
          roleId,
        },
      });

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

/* =========================================================
   GET ROLE PERMISSION

   Params:
   roleId
========================================================= */

export const getRolePermission = createAsyncThunk(
  "menuPermission/getRolePermission",

  async ({ roleId }, { rejectWithValue }) => {
    try {
      const res = await api.get("/roleAccess/getAll", {
        params: {
          roleId,
        },
      });

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

/* =========================================================
   UPDATE ROLE PERMISSION

   Params:
   roleId

   Body:
   {
       permissions: [...]
   }
========================================================= */

export const updateRolePermission = createAsyncThunk(
  "menuPermission/updateRolePermission",

  async ({ roleId, data }, { rejectWithValue }) => {
    try {
      const res = await api.put("/roleAccess/update", data, {
        params: {
          roleId,
        },
      });

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

/* =========================================================
   USER PERMISSION
========================================================= */

/* =========================================================
   CREATE USER PERMISSION

   Params:
   userId

   Body:
   {
       permissions: [...]
   }
========================================================= */

export const createUserPermission = createAsyncThunk(
  "menuPermission/createUserPermission",

  async ({ userId, data }, { rejectWithValue }) => {
    try {
      const res = await api.post("/userAccess/create", data, {
        params: {
          userId,
        },
      });

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

/* =========================================================
   CREATE BULK USER PERMISSION
========================================================= */

export const createUserBulkPermission = createAsyncThunk(
  "menuPermission/createUserBulkPermission",

  async ({ data }, { rejectWithValue }) => {
    try {
      const res = await api.post("/userAccess/bulk-create", data);

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

/* =========================================================
   CURRENT LOGGED-IN USER PERMISSION

   No userId required.

   Backend identifies the logged-in user
   from authentication token.
========================================================= */

export const getUserPermission = createAsyncThunk(
  "menuPermission/getUserPermission",

  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/userAccess/getCurrentUserPermission");

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

/* =========================================================
   GET USER PERMISSION BY ID

   Params:
   userId
========================================================= */

export const getUserPermissionById = createAsyncThunk(
  "menuPermission/getUserPermissionById",

  async ({ userId }, { rejectWithValue }) => {
    try {
      const res = await api.get("/userAccess/getUserPermissionById", {
        params: {
          userId,
        },
      });

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

/* =========================================================
   UPDATE USER PERMISSION

   Params:
   userId

   Body:
   {
       permissions: [...]
   }
========================================================= */

export const updateUserPermission = createAsyncThunk(
  "menuPermission/updateUserPermission",

  async ({ userId, data }, { rejectWithValue }) => {
    try {
      const res = await api.put("/userAccess/update", data, {
        params: {
          userId,
        },
      });

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

/* =========================================================
   UPDATE BULK USER PERMISSION
========================================================= */

export const updateUserBulkPermission = createAsyncThunk(
  "menuPermission/updateUserBulkPermission",

  async ({ userId, data }, { rejectWithValue }) => {
    try {
      const res = await api.put("/userAccess/bulk-update", data, {
        params: {
          userId,
        },
      });

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);
