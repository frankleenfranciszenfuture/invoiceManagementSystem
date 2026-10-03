import { createSlice } from "@reduxjs/toolkit";

import {
  fetchAllUsers,
  fetchUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
} from "../thunks/userThunks";

/* =========================================================
   EMPTY USER FORM
   ========================================================= */

const emptyUser = {
  id: null,
  userId: "",
  name: "",
  email: "",
  role: "",
  accountVerified: false,
  status: "ACTIVE",
};

/* =========================================================
   INITIAL STATE
   ========================================================= */

const initialState = {
  /*
   * User list
   */
  users: [],

  /*
   * Form state
   */
  user: { ...emptyUser },

  /*
   * Existing user for edit/view
   */
  exsistingUser: null,

  /*
   * Pagination
   */
  pagination: {
    pageNumber: 0,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0,
    last: true,
  },

  /*
   * Loading
   */
  loading: false,

  /*
   * Request status
   */
  success: false,

  /*
   * Error
   */
  error: null,

  /*
   * Backend message
   */
  message: "",

  /*
   * Selected user for view
   */
  selectedUserView: null,

  /*
   * User status filter
   */
  userStatus: "ACTIVE",
};

/* =========================================================
   SLICE
   ========================================================= */

const userSlice = createSlice({
  name: "user",

  initialState,

  reducers: {
    /* =====================================================
       SET EXISTING USER
       ===================================================== */

    setExsistingUser: (state, action) => {
      state.exsistingUser = action.payload;
    },

    /* =====================================================
       CLEAR USER STATE
       ===================================================== */

    clearUserState: (state) => {
      state.users = [];

      state.user = {
        ...emptyUser,
      };

      state.exsistingUser = null;

      state.pagination = {
        pageNumber: 0,
        pageSize: 10,
        totalElements: 0,
        totalPages: 0,
        last: true,
      };

      state.loading = false;
      state.success = false;
      state.error = null;
      state.message = "";

      state.selectedUserView = null;
      state.userStatus = "ACTIVE";
    },

    /* =====================================================
       CLEAR SELECTED USER
       ===================================================== */

    clearSelectedUser: (state) => {
      state.user = {
        ...emptyUser,
      };

      state.exsistingUser = null;
    },

    /* =====================================================
       RESET USER FORM
       ===================================================== */

    resetUserForm: (state) => {
      state.user = {
        ...emptyUser,
      };

      state.exsistingUser = null;
    },

    /* =====================================================
       SET USER FORM FIELD
       ===================================================== */

    setUserField: (state, action) => {
      const { field, value } = action.payload;

      state.user = {
        ...(state.user || emptyUser),
        [field]: value,
      };
    },

    /* =====================================================
       SET SELECTED USER VIEW
       ===================================================== */

    setSelectedUserView: (state, action) => {
      state.selectedUserView = action.payload;
    },

    /* =====================================================
       SET USER STATUS
       ===================================================== */

    setUserStatus: (state, action) => {
      state.userStatus = action.payload;
    },

    /* =====================================================
       SET USER PAGINATION
       ===================================================== */

    setUserPagination: (state, action) => {
      const { pageNumber, pageSize } = action.payload;

      if (pageNumber !== undefined) {
        state.pagination.pageNumber = pageNumber;
      }

      if (pageSize !== undefined) {
        state.pagination.pageSize = pageSize;
      }
    },
  },

  /* =======================================================
     EXTRA REDUCERS
  ======================================================= */

  extraReducers: (builder) => {
    /* =====================================================
       FETCH ALL USERS
       ===================================================== */

    builder

      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        const response = action.payload;

        /*
         * Backend response:
         *
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

        const data = response?.data;

        /*
         * USER LIST
         */

        if (Array.isArray(data?.content)) {
          state.users = data.content;
        } else {
          state.users = [];
        }

        /*
         * PAGINATION
         */

        state.pagination = {
          pageNumber: data?.pageNumber ?? 0,
          pageSize: data?.pageSize ?? 10,
          totalElements: data?.totalElements ?? 0,
          totalPages: data?.totalPages ?? 0,
          last: data?.last ?? true,
        };

        /*
         * MESSAGE
         */

        state.message = response?.message || "";
      })

      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error = action.payload || "Failed to fetch users.";

        state.message = "";
      });

    /* =====================================================
       FETCH USER BY ID
       ===================================================== */

    builder

      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        const user = action.payload?.data ||
          action.payload || {
            ...emptyUser,
          };

        state.user = user;

        state.exsistingUser = user;

        state.message = action.payload?.message || "";
      })

      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error = action.payload || "Failed to fetch user.";

        state.message = "";
      });

    /* =====================================================
       CREATE USER
       ===================================================== */

    builder

      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
        state.message = "";
      })

      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        state.message = action.payload?.message || "User created successfully.";

        const newUser = action.payload?.data;

        if (newUser) {
          /*
           * Update form
           */

          state.user = newUser;

          /*
           * Update existing user
           */

          state.exsistingUser = newUser;

          /*
           * Add newly created user to current page
           */

          const exists = state.users.some((item) => item.id === newUser.id);

          if (!exists) {
            state.users.push(newUser);
          }

          /*
           * Update total count
           */

          state.pagination.totalElements += 1;
        }
      })

      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error =
          action.payload || "Something went wrong while creating user.";

        state.message = "";
      });

    /* =====================================================
       UPDATE USER
       ===================================================== */

    builder

      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })

      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        state.message = action.payload?.message || "User updated successfully.";

        const updatedUser = action.payload?.data;

        if (updatedUser) {
          /*
           * Update form
           */

          state.user = updatedUser;

          /*
           * Update existing user
           */

          state.exsistingUser = updatedUser;

          /*
           * Update list item
           */

          const index = state.users.findIndex(
            (item) => item.id === updatedUser.id,
          );

          if (index !== -1) {
            state.users[index] = updatedUser;
          }
        }
      })

      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error =
          action.payload || "Something went wrong while updating user.";

        state.message = "";
      });

    /* =====================================================
       DELETE USER
       ===================================================== */

    builder

      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })

      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        state.message = action.payload?.message || "User deleted successfully.";

        /*
         * Thunk receives ID directly.
         */

        const deletedId = action.meta.arg;

        /*
         * Remove from current page
         */

        state.users = state.users.filter((item) => item.id !== deletedId);

        /*
         * Update total count
         */

        if (state.pagination.totalElements > 0) {
          state.pagination.totalElements -= 1;
        }

        /*
         * Clear selected user
         */

        if (state.user?.id === deletedId) {
          state.user = {
            ...emptyUser,
          };
        }

        if (state.exsistingUser?.id === deletedId) {
          state.exsistingUser = null;
        }

        if (state.selectedUserView?.id === deletedId) {
          state.selectedUserView = null;
        }
      })

      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error =
          action.payload || "Something went wrong while deleting user.";

        state.message = "";
      });

    /* =====================================================
       UPDATE USER STATUS
       ===================================================== */

    builder

      .addCase(updateUserStatus.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })

      .addCase(updateUserStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        state.message =
          action.payload?.message || "User status updated successfully.";

        /*
         * Backend may return data:null.
         *
         * Therefore use the thunk arguments.
         */

        const { id, status } = action.meta.arg;

        /*
         * Update list
         */

        const index = state.users.findIndex((item) => item.id === id);

        if (index !== -1) {
          state.users[index].status = status;
        }

        /*
         * Update selected/form user
         */

        if (state.user?.id === id) {
          state.user.status = status;
        }

        if (state.exsistingUser?.id === id) {
          state.exsistingUser.status = status;
        }

        if (state.selectedUserView?.id === id) {
          state.selectedUserView.status = status;
        }

        /*
         * Update current status
         */

        state.userStatus = status;
      })

      .addCase(updateUserStatus.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error =
          action.payload || "Something went wrong while updating user status.";

        state.message = "";
      });
  },
});

/* =========================================================
   ACTIONS
   ========================================================= */

export const {
  setExsistingUser,
  clearUserState,
  clearSelectedUser,
  resetUserForm,
  setUserField,
  setSelectedUserView,
  setUserStatus,
  setUserPagination,
} = userSlice.actions;

/* =========================================================
   REDUCER
   ========================================================= */

export default userSlice.reducer;
