import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/api";

/**
 * GET /email-signatures?userId={userId}
 */
export const fetchAllEmailSignatures = createAsyncThunk(
  "emailSignatures/fetchAllEmailSignatures",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get("/email-signatures", {
        params: { userId },
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch email signatures",
      );
    }
  },
);

/**
 * GET /email-signatures/{id}?userId={userId}
 *
 * Pass { id, userId } when dispatching this thunk.
 */
export const fetchEmailSignaturesById = createAsyncThunk(
  "emailSignatures/fetchEmailSignaturesById",
  async ({ id, userId }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/email-signatures/${id}`, {
        params: { userId },
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch email signature",
      );
    }
  },
);

/**
 * POST /email-signatures?userId={userId}
 */
export const createEmailSignature = createAsyncThunk(
  "emailSignatures/createEmailSignature",
  async ({ userId, data }, { rejectWithValue }) => {
    try {
      const response = await api.post("/email-signatures", data, {
        params: { userId },
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to create email signature",
      );
    }
  },
);

/**
 * PUT /email-signatures/{id}?userId={userId}
 */
export const updateEmailSignature = createAsyncThunk(
  "emailSignatures/updateEmailSignature",
  async ({ userId, id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/email-signatures/${id}`, data, {
        params: { userId },
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update email signature",
      );
    }
  },
);

/**
 * PATCH /email-signatures/{id}/default-new?userId={userId}
 * Body: { enabled: true | false }
 */
export const setDefaultForNew = createAsyncThunk(
  "emailSignatures/setDefaultForNew",
  async ({ id, userId, data }, { rejectWithValue }) => {
    try {
      const response = await api.patch(
        `/email-signatures/${id}/default-new`,
        data,
        {
          params: { userId },
        },
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update default signature for new messages",
      );
    }
  },
);

/**
 * PATCH /email-signatures/{id}/default-replies?userId={userId}
 * Body: { enabled: true | false }
 */
export const setDefaultForReplies = createAsyncThunk(
  "emailSignatures/setDefaultForReplies",
  async ({ id, userId, data }, { rejectWithValue }) => {
    try {
      const response = await api.patch(
        `/email-signatures/${id}/default-replies`,
        data,
        {
          params: { userId },
        },
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update default signature for replies",
      );
    }
  },
);

/**
 * DELETE /email-signatures/{id}?userId={userId}
 */
export const deleteEmailSignature = createAsyncThunk(
  "emailSignatures/deleteEmailSignature",
  async ({ id, userId }, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/email-signatures/${id}`, {
        params: { userId },
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to delete email signature",
      );
    }
  },
);
