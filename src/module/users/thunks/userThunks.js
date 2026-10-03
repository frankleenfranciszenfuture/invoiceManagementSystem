import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/api";

/**
 * Fetch users with pagination, search and sorting
 *
 * Backend response:
 * {
 *   success: true,
 *   message: "Users fetched successfully.",
 *   data: {
 *     content: [],
 *     pageNumber: 0,
 *     pageSize: 10,
 *     totalElements: 2,
 *     totalPages: 1,
 *     last: true
 *   }
 * }
 */
export const fetchAllUsers = createAsyncThunk(
  "user/fetchUsers",
  async (
    {
      page = 0,
      size = 10,
      search = "",
      sortBy = "id",
      sortDirection = "desc",
    } = {},
    { rejectWithValue },
  ) => {
    try {
      const res = await api.get("/users/get-all", {
        params: {
          page,
          size,
          search,
          sortBy,
          sortDirection,
        },
      });

      console.log("Users:", res.data);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/**
 * Fetch user by ID
 */
export const fetchUserById = createAsyncThunk(
  "user/fetchUser",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/users/getById/${id}`);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/**
 * Create user
 */
export const createUser = createAsyncThunk(
  "user/createUser",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post("/users/register", data);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/**
 * Update user
 */
export const updateUser = createAsyncThunk(
  "user/updateUser",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/users/update/${id}`, data);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/**
 * Delete user
 */
export const deleteUser = createAsyncThunk(
  "user/deleteUser",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/users/delete/${id}`);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/**
 * Update user status
 */
export const updateUserStatus = createAsyncThunk(
  "user/updateUserStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/users/status/${id}`, {
        status,
      });

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);
