import { createSlice } from "@reduxjs/toolkit";

import {
  fetchAllRoles,
  fetchRoleById,
  createRole,
  updateRole,
  deleteRole,
  updateRoleStatus,
} from "../thunks/roleThunks";

/* =========================================================
   EMPTY ROLE FORM
   ========================================================= */

const emptyRole = {
  id: null,
  roleName: "",
  description: "",
  status: "ACTIVE",
};

/* =========================================================
   INITIAL STATE
   ========================================================= */

const initialState = {
  roles: [],

  // Keep form initialized instead of null
  role: { ...emptyRole },

  exsistingRole: null,

  loading: false,

  success: false,

  error: null,

  message: "",

  selectedRoleView: null,

  roleStatus: "ACTIVE",
};

/* =========================================================
   SLICE
   ========================================================= */

const roleSlice = createSlice({
  name: "role",

  initialState,

  reducers: {
    /* =====================================================
       SET EXISTING ROLE
       ===================================================== */

    setExsistingRole: (state, action) => {
      state.exsistingRole = action.payload;
    },

    /* =====================================================
       CLEAR ROLE STATE
       ===================================================== */

    clearRoleState: (state) => {
      state.roles = [];

      state.role = {
        ...emptyRole,
      };

      state.exsistingRole = null;

      state.loading = false;
      state.success = false;
      state.error = null;
      state.message = "";

      state.selectedRoleView = null;
      state.roleStatus = "ACTIVE";
    },

    /* =====================================================
       CLEAR SELECTED ROLE
       ===================================================== */

    clearSelectedRole: (state) => {
      state.role = {
        ...emptyRole,
      };

      state.exsistingRole = null;
    },

    /* =====================================================
       RESET ROLE FORM
       ===================================================== */

    resetRoleForm: (state) => {
      state.role = {
        ...emptyRole,
      };

      state.exsistingRole = null;
    },

    /* =====================================================
       SET ROLE FORM FIELD
       ===================================================== */

    setRoleField: (state, action) => {
      const { field, value } = action.payload;

      state.role = {
        ...(state.role || emptyRole),
        [field]: value,
      };
    },

    /* =====================================================
       SET SELECTED ROLE VIEW
       ===================================================== */

    setSelectedRoleView: (state, action) => {
      state.selectedRoleView = action.payload;
    },

    /* =====================================================
       SET ROLE STATUS
       ===================================================== */

    setRoleStatus: (state, action) => {
      state.roleStatus = action.payload;
    },
  },

  /* =======================================================
     EXTRA REDUCERS
  ======================================================= */

  extraReducers: (builder) => {
    /* =====================================================
       FETCH ALL ROLES
       ===================================================== */

    builder

      .addCase(fetchAllRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(fetchAllRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        const response = action.payload;

        const data = response?.data;

        /*
         * ROLE API RETURNS DIRECT ARRAY
         *
         * {
         *   "success": true,
         *   "message": "Roles fetched successfully",
         *   "data": [...]
         * }
         */

        if (Array.isArray(data)) {
          state.roles = data;
        } else {
          state.roles = [];
        }

        state.message = response?.message || "";
      })

      .addCase(fetchAllRoles.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error = action.payload || "Failed to fetch roles.";

        state.message = "";
      });

    /* =====================================================
       FETCH ROLE BY ID
       ===================================================== */

    builder

      .addCase(fetchRoleById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(fetchRoleById.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        state.role = action.payload?.data ||
          action.payload || {
            ...emptyRole,
          };

        state.exsistingRole = state.role;

        state.message = action.payload?.message || "";
      })

      .addCase(fetchRoleById.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error = action.payload || "Failed to fetch role.";

        state.message = "";
      });

    /* =====================================================
       CREATE ROLE
       ===================================================== */

    builder

      .addCase(createRole.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
        state.message = "";
      })

      .addCase(createRole.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        state.message = action.payload?.message || "Role created successfully.";

        const newRole = action.payload?.data;

        if (newRole) {
          state.role = newRole;

          state.exsistingRole = newRole;

          /*
           * Add newly created role to the existing list
           */
          const exists = state.roles.some((item) => item.id === newRole.id);

          if (!exists) {
            state.roles.push(newRole);
          }
        }
      })

      .addCase(createRole.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error =
          action.payload || "Something went wrong while creating role.";

        state.message = "";
      });

    /* =====================================================
       UPDATE ROLE
       ===================================================== */

    builder

      .addCase(updateRole.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })

      .addCase(updateRole.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        state.message = action.payload?.message || "Role updated successfully.";

        const updatedRole = action.payload?.data;

        if (updatedRole) {
          state.role = updatedRole;

          state.exsistingRole = updatedRole;

          const index = state.roles.findIndex(
            (item) => item.id === updatedRole.id,
          );

          if (index !== -1) {
            state.roles[index] = updatedRole;
          }
        }
      })

      .addCase(updateRole.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error =
          action.payload || "Something went wrong while updating role.";

        state.message = "";
      });

    /* =====================================================
       DELETE ROLE
       ===================================================== */

    builder

      .addCase(deleteRole.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })

      .addCase(deleteRole.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        state.message = action.payload?.message || "Role deleted successfully.";

        /*
         * Your thunk receives the ID directly,
         * so action.meta.arg is the safest ID.
         */

        const deletedId = action.meta.arg;

        state.roles = state.roles.filter((item) => item.id !== deletedId);

        if (state.role?.id === deletedId) {
          state.role = {
            ...emptyRole,
          };
        }

        if (state.exsistingRole?.id === deletedId) {
          state.exsistingRole = null;
        }
      })

      .addCase(deleteRole.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error =
          action.payload || "Something went wrong while deleting role.";

        state.message = "";
      });

    /* =====================================================
       UPDATE ROLE STATUS
       ===================================================== */

    builder

      .addCase(updateRoleStatus.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })

      .addCase(updateRoleStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        state.message =
          action.payload?.message || "Role status updated successfully.";

        /*
         * Your current backend returns:
         *
         * {
         *   "success": true,
         *   "message": "Role status updated successfully",
         *   "data": null
         * }
         *
         * Therefore use action.meta.arg.status to update
         * the role locally.
         */

        const { id, status } = action.meta.arg;

        const index = state.roles.findIndex((item) => item.id === id);

        if (index !== -1) {
          state.roles[index].status = status;
        }

        /*
         * Update selected role/form if it is the same role
         */

        if (state.role?.id === id) {
          state.role.status = status;
        }

        if (state.exsistingRole?.id === id) {
          state.exsistingRole.status = status;
        }

        state.roleStatus = status;
      })

      .addCase(updateRoleStatus.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error =
          action.payload || "Something went wrong while updating role status.";

        state.message = "";
      });
  },
});

/* =========================================================
   ACTIONS
   ========================================================= */

export const {
  setExsistingRole,
  clearRoleState,
  clearSelectedRole,
  resetRoleForm,
  setRoleField,
  setSelectedRoleView,
  setRoleStatus,
} = roleSlice.actions;

/* =========================================================
   REDUCER
   ========================================================= */

export default roleSlice.reducer;
