import { createSlice } from "@reduxjs/toolkit";

import {
  fetchAllWarehouse,
  fetchWarehouseById,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
} from "../thunks/warehouseThunks";

/* =========================================================
   EMPTY WAREHOUSE
========================================================= */

export const emptyWarehouse = {
  id: null,

  warehouseCode: "",
  warehouseName: "",

  contactPerson: "",
  phone: "",
  email: "",

  address: "",
  city: "",
  state: "",
  pincode: "",

  status: "ACTIVE",

  active: true,
};

/* =========================================================
   INITIAL STATE
========================================================= */

const initialState = {
  warehouses: [],
  warehouse: { ...emptyWarehouse },

  loading: false,
  actionLoading: false,
  error: null,

  pagination: {
    pageNumber: 0,
    pageSize: 20,
    totalElements: 0,
    totalPages: 0,
    last: true,
  },
};

/* =========================================================
   SLICE
========================================================= */

const warehouseSlice = createSlice({
  name: "warehouse",
  initialState,

  reducers: {
    // Set existing warehouse for editing
    setExistingWarehouse: (state, action) => {
      state.warehouse = {
        ...emptyWarehouse,
        ...action.payload,
      };
    },

    // Update warehouse form field
    updateWarehouseField: (state, action) => {
      const { field, value } = action.payload;
      state.warehouse[field] = value;
    },

    // Reset warehouse form
    resetWarehouseForm: (state) => {
      state.warehouse = { ...emptyWarehouse };
    },

    // Clear selected warehouse
    clearSelectedWarehouse: (state) => {
      state.warehouse = { ...emptyWarehouse };
    },

    // Clear error
    clearWarehouseError: (state) => {
      state.error = null;
    },

    // Reset complete warehouse state
    resetWarehouseState: () => ({
      ...initialState,
      warehouse: { ...emptyWarehouse },
      warehouses: [],
      pagination: { ...initialState.pagination },
    }),
  },

  extraReducers: (builder) => {
    builder

      // =========================================
      // FETCH ALL WAREHOUSES
      // =========================================

      .addCase(fetchAllWarehouse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchAllWarehouse.fulfilled, (state, action) => {
        state.loading = false;

        const response = action.payload?.data ?? {};

        state.warehouses = Array.isArray(response.content)
          ? response.content
          : [];

        state.pagination = {
          pageNumber: response.pageNumber ?? 0,
          pageSize: response.pageSize ?? 20,
          totalElements: response.totalElements ?? 0,
          totalPages: response.totalPages ?? 0,
          last: response.last ?? true,
        };

        state.error = null;
      })

      .addCase(fetchAllWarehouse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? action.error.message;
      });

    // =========================================
    // FETCH WAREHOUSE BY ID
    // =========================================
    builder
      .addCase(fetchWarehouseById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(fetchWarehouseById.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.warehouse = {
          ...emptyWarehouse,
          ...(action.payload?.data ?? {}),
        };

        state.error = null;
      })

      .addCase(fetchWarehouseById.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload ?? action.error.message;
      })

      // =========================================
      // CREATE WAREHOUSE
      // =========================================

      .addCase(createWarehouse.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })

      .addCase(createWarehouse.fulfilled, (state, action) => {
        state.actionLoading = false;

        const createdWarehouse = action.payload?.data ?? null;

        if (createdWarehouse?.id) {
          state.warehouses.unshift(createdWarehouse);
          state.pagination.totalElements += 1;
        }

        state.warehouse = { ...emptyWarehouse };
        state.error = null;
      })

      .addCase(createWarehouse.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload ?? action.error.message;
      })

      // =========================================
      // UPDATE WAREHOUSE
      // =========================================

      .addCase(updateWarehouse.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })

      .addCase(updateWarehouse.fulfilled, (state, action) => {
        state.actionLoading = false;

        const updatedWarehouse = action.payload?.data ?? null;

        if (updatedWarehouse?.id) {
          state.warehouses = state.warehouses.map((item) =>
            item.id === updatedWarehouse.id ? updatedWarehouse : item,
          );

          if (state.warehouse.id === updatedWarehouse.id) {
            state.warehouse = {
              ...emptyWarehouse,
              ...updatedWarehouse,
            };
          }
        }

        state.error = null;
      })

      .addCase(updateWarehouse.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload ?? action.error.message;
      })

      // =========================================
      // DELETE WAREHOUSE
      // =========================================

      .addCase(deleteWarehouse.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })

      .addCase(deleteWarehouse.fulfilled, (state, action) => {
        state.actionLoading = false;

        const deletedId = action.meta.arg;

        state.warehouses = state.warehouses.filter(
          (item) => item.id !== deletedId,
        );

        if (state.warehouse.id === deletedId) {
          state.warehouse = { ...emptyWarehouse };
        }

        state.pagination.totalElements = Math.max(
          0,
          state.pagination.totalElements - 1,
        );

        state.error = null;
      })

      .addCase(deleteWarehouse.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload ?? action.error.message;
      });
  },
});

/* =========================================================
   EXPORT ACTIONS
========================================================= */

export const {
  setExistingWarehouse,
  updateWarehouseField,
  resetWarehouseForm,
  clearSelectedWarehouse,
  clearWarehouseError,
  resetWarehouseState,
} = warehouseSlice.actions;

export default warehouseSlice.reducer;
