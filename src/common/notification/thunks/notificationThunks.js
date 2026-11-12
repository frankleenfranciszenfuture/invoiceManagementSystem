import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/api";

// =====================================================
// COMMON ERROR HANDLER
// =====================================================

const handleError = (error, fallbackMessage) => {
  return error.response?.data?.message || error.message || fallbackMessage;
};

// =====================================================
// GET ALL NOTIFICATIONS
// GET /notifications
// =====================================================

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/notifications", {
        params: {
          page: filters.page ?? 0,
          size: filters.size ?? 10,
        },
      });

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        handleError(error, "Failed to fetch notifications"),
      );
    }
  },
);

// =====================================================
// GET ARCHIVED NOTIFICATIONS
// GET /notifications/archived
// =====================================================

export const fetchArchivedNotifications = createAsyncThunk(
  "notifications/fetchArchivedNotifications",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/notifications/archived", {
        params: {
          page: filters.page ?? 0,
          size: filters.size ?? 10,
        },
      });

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        handleError(error, "Failed to fetch archived notifications"),
      );
    }
  },
);

// =====================================================
// GET UNREAD NOTIFICATION COUNT
// GET /notifications/unread-count
// =====================================================

export const fetchUnreadNotificationCount = createAsyncThunk(
  "notifications/fetchUnreadNotificationCount",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/notifications/unread-count");

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        handleError(error, "Failed to fetch unread notification count"),
      );
    }
  },
);

// =====================================================
// GET NOTIFICATION BY ID
// GET /notifications/{id}
// =====================================================

export const fetchNotificationById = createAsyncThunk(
  "notifications/fetchNotificationById",
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/notifications/${notificationId}`);

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        handleError(error, "Failed to fetch notification details"),
      );
    }
  },
);

// =====================================================
// CREATE NOTIFICATION
// POST /notifications
// =====================================================

export const createNotification = createAsyncThunk(
  "notifications/createNotification",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post("/notifications", data);

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        handleError(error, "Failed to create notification"),
      );
    }
  },
);

// =====================================================
// MARK NOTIFICATION AS READ
// PATCH /notifications/{id}/read
// =====================================================

export const markNotificationAsRead = createAsyncThunk(
  "notifications/markNotificationAsRead",
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/notifications/${notificationId}/read`);

      return {
        id: notificationId,
        data: response.data.data,
      };
    } catch (error) {
      return rejectWithValue(
        handleError(error, "Failed to mark notification as read"),
      );
    }
  },
);

// =====================================================
// MARK ALL NOTIFICATIONS AS READ
// PATCH /notifications/read-all
// =====================================================

export const markAllNotificationsAsRead = createAsyncThunk(
  "notifications/markAllNotificationsAsRead",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.patch("/notifications/read-all");

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        handleError(error, "Failed to mark all notifications as read"),
      );
    }
  },
);

// =====================================================
// ARCHIVE NOTIFICATION
// PATCH /notifications/{id}/archive
// =====================================================

export const archiveNotification = createAsyncThunk(
  "notifications/archiveNotification",
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await api.patch(
        `/notifications/${notificationId}/archive`,
      );

      return {
        id: notificationId,
        data: response.data.data,
      };
    } catch (error) {
      return rejectWithValue(
        handleError(error, "Failed to archive notification"),
      );
    }
  },
);

// =====================================================
// DELETE NOTIFICATION
// DELETE /notifications/{id}
// =====================================================

export const deleteNotification = createAsyncThunk(
  "notifications/deleteNotification",
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/notifications/${notificationId}`);

      return {
        id: notificationId,
        data: response.data.data,
      };
    } catch (error) {
      return rejectWithValue(
        handleError(error, "Failed to delete notification"),
      );
    }
  },
);
