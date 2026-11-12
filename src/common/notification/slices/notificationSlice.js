import { createSlice } from "@reduxjs/toolkit";

import {
  fetchNotifications,
  fetchArchivedNotifications,
  fetchUnreadNotificationCount,
  fetchNotificationById,
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  archiveNotification,
  deleteNotification,
} from "../thunks/notificationThunks";

// =====================================================
// INITIAL PAGINATION STATE
// =====================================================

const initialPageState = {
  content: [],
  pageNumber: 0,
  pageSize: 10,
  totalElements: 0,
  totalPages: 0,
  last: true,
};

// =====================================================
// INITIAL STATE
// =====================================================

const initialState = {
  // Notification lists
  notifications: { ...initialPageState },
  archivedNotifications: { ...initialPageState },

  // Selected notification
  selectedNotification: null,

  // Counts
  unreadCount: 0,

  // Loading states
  loading: false,
  archivedLoading: false,
  unreadLoading: false,
  detailLoading: false,
  createLoading: false,
  actionLoading: false,

  // Error states
  error: null,
  archivedError: null,
  detailError: null,
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================

const updateNotificationInList = (list, id, changes) => {
  return list.map((notification) =>
    notification.id === id ? { ...notification, ...changes } : notification,
  );
};

const removeNotificationFromPage = (page, id) => {
  const exists = page.content.some((notification) => notification.id === id);

  if (!exists) return false;

  page.content = page.content.filter((notification) => notification.id !== id);

  page.totalElements = Math.max(0, page.totalElements - 1);

  return true;
};

// =====================================================
// NOTIFICATION SLICE
// =====================================================

const notificationSlice = createSlice({
  name: "notifications",
  initialState,

  reducers: {
    // Clear general error
    clearNotificationError: (state) => {
      state.error = null;
    },

    // Clear archived error
    clearArchivedNotificationError: (state) => {
      state.archivedError = null;
    },

    // Clear selected notification
    clearSelectedNotification: (state) => {
      state.selectedNotification = null;
      state.detailError = null;
    },

    // Reset notification state
    resetNotifications: () => initialState,
  },

  extraReducers: (builder) => {
    builder

      // =================================================
      // FETCH ALL NOTIFICATIONS
      // =================================================

      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload ?? { ...initialPageState };
      })

      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // =================================================
      // FETCH ARCHIVED NOTIFICATIONS
      // =================================================

      .addCase(fetchArchivedNotifications.pending, (state) => {
        state.archivedLoading = true;
        state.archivedError = null;
      })

      .addCase(fetchArchivedNotifications.fulfilled, (state, action) => {
        state.archivedLoading = false;
        state.archivedNotifications = action.payload ?? { ...initialPageState };
      })

      .addCase(fetchArchivedNotifications.rejected, (state, action) => {
        state.archivedLoading = false;
        state.archivedError = action.payload;
      })

      // =================================================
      // FETCH UNREAD COUNT
      // =================================================

      .addCase(fetchUnreadNotificationCount.pending, (state) => {
        state.unreadLoading = true;
      })

      .addCase(fetchUnreadNotificationCount.fulfilled, (state, action) => {
        state.unreadLoading = false;
        state.unreadCount = Number(action.payload ?? 0);
      })

      .addCase(fetchUnreadNotificationCount.rejected, (state, action) => {
        state.unreadLoading = false;
        state.error = action.payload;
      })

      // =================================================
      // FETCH NOTIFICATION BY ID
      // =================================================

      .addCase(fetchNotificationById.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
      })

      .addCase(fetchNotificationById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedNotification = action.payload;
      })

      .addCase(fetchNotificationById.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.payload;
      })

      // =================================================
      // CREATE NOTIFICATION
      // =================================================

      .addCase(createNotification.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })

      .addCase(createNotification.fulfilled, (state, action) => {
        state.createLoading = false;

        const notification = action.payload;

        if (!notification) return;

        // Add to active notification list only on first page
        if (state.notifications.pageNumber === 0) {
          state.notifications.content.unshift(notification);

          // Respect the current page size
          if (
            state.notifications.content.length > state.notifications.pageSize
          ) {
            state.notifications.content.pop();
          }
        }

        state.notifications.totalElements += 1;

        if (!notification.read && !notification.archived) {
          state.unreadCount += 1;
        }
      })

      .addCase(createNotification.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload;
      })

      // =================================================
      // MARK NOTIFICATION AS READ
      // =================================================

      .addCase(markNotificationAsRead.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })

      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        state.actionLoading = false;

        const { id } = action.payload;

        const notification = state.notifications.content.find(
          (item) => item.id === id,
        );

        if (notification && !notification.read) {
          notification.read = true;
          notification.readAt =
            action.payload.data?.readAt ?? new Date().toISOString();

          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }

        if (
          state.selectedNotification?.id === id &&
          !state.selectedNotification.read
        ) {
          state.selectedNotification.read = true;
          state.selectedNotification.readAt =
            action.payload.data?.readAt ?? new Date().toISOString();
        }
      })

      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // =================================================
      // MARK ALL NOTIFICATIONS AS READ
      // =================================================

      .addCase(markAllNotificationsAsRead.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })

      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.actionLoading = false;

        const readAt = new Date().toISOString();

        state.notifications.content.forEach((notification) => {
          notification.read = true;
          notification.readAt = notification.readAt ?? readAt;
        });

        if (state.selectedNotification) {
          state.selectedNotification.read = true;
          state.selectedNotification.readAt =
            state.selectedNotification.readAt ?? readAt;
        }

        state.unreadCount = 0;
      })

      .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // =================================================
      // ARCHIVE NOTIFICATION
      // =================================================

      .addCase(archiveNotification.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })

      .addCase(archiveNotification.fulfilled, (state, action) => {
        state.actionLoading = false;

        const { id } = action.payload;

        const notification = state.notifications.content.find(
          (item) => item.id === id,
        );

        if (notification) {
          if (!notification.read) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }

          notification.archived = true;
          notification.archivedAt =
            action.payload.data?.archivedAt ?? new Date().toISOString();

          // Remove from active list
          removeNotificationFromPage(state.notifications, id);

          // Add to archived list if currently on first page
          if (state.archivedNotifications.pageNumber === 0) {
            const alreadyExists = state.archivedNotifications.content.some(
              (item) => item.id === id,
            );

            if (!alreadyExists) {
              state.archivedNotifications.content.unshift(notification);
              state.archivedNotifications.totalElements += 1;

              if (
                state.archivedNotifications.content.length >
                state.archivedNotifications.pageSize
              ) {
                state.archivedNotifications.content.pop();
              }
            }
          }
        }

        if (state.selectedNotification?.id === id) {
          state.selectedNotification.archived = true;
          state.selectedNotification.archivedAt =
            action.payload.data?.archivedAt ?? new Date().toISOString();
        }
      })

      .addCase(archiveNotification.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // =================================================
      // DELETE NOTIFICATION
      // =================================================

      .addCase(deleteNotification.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })

      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.actionLoading = false;

        const { id } = action.payload;

        const activeNotification = state.notifications.content.find(
          (item) => item.id === id,
        );

        const archivedNotification = state.archivedNotifications.content.find(
          (item) => item.id === id,
        );

        // Update unread count only for active unread notifications
        if (activeNotification && !activeNotification.read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }

        // Remove from both lists
        removeNotificationFromPage(state.notifications, id);
        removeNotificationFromPage(state.archivedNotifications, id);

        if (state.selectedNotification?.id === id) {
          state.selectedNotification = null;
        }
      })

      .addCase(deleteNotification.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  },
});

// =====================================================
// EXPORT ACTIONS
// =====================================================

export const {
  clearNotificationError,
  clearArchivedNotificationError,
  clearSelectedNotification,
  resetNotifications,
} = notificationSlice.actions;

// =====================================================
// EXPORT REDUCER
// =====================================================

export default notificationSlice.reducer;
