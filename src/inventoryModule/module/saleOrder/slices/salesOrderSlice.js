import { createSlice } from "@reduxjs/toolkit";

import {
  createSalesOrder,
  fetchSalesOrderById,
  fetchAllSalesOrders,
  updateSalesOrder,
  dispatchSalesOrder,
  confirmSalesOrder,
  cancelSalesOrder,
  deleteSalesOrder,
} from "../thunks/salesOrderThunks";

/* -------------------------------------------------------------------------- */
/*                              INITIAL STATE                                 */
/* -------------------------------------------------------------------------- */

const initialState = {
  salesOrders: [],
  salesOrder: null,

  pagination: {
    pageNumber: 0,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0,
    last: true,
  },

  loading: false,
  actionLoading: false,

  error: null,
  actionError: null,
};

/* -------------------------------------------------------------------------- */
/*                              HELPER FUNCTIONS                              */
/* -------------------------------------------------------------------------- */

const updateOrderInList = (state, updatedOrder) => {
  if (!updatedOrder?.id) return;

  const index = state.salesOrders.findIndex(
    (order) => order.id === updatedOrder.id,
  );

  if (index !== -1) {
    state.salesOrders[index] = updatedOrder;
  }

  if (state.salesOrder?.id === updatedOrder.id) {
    state.salesOrder = updatedOrder;
  }
};

const resetErrors = (state) => {
  state.error = null;
  state.actionError = null;
};

/* -------------------------------------------------------------------------- */
/*                                  SLICE                                     */
/* -------------------------------------------------------------------------- */

const salesOrderSlice = createSlice({
  name: "salesOrder",

  initialState,

  reducers: {
    /* ------------------------- CLEAR ERRORS -------------------------- */

    clearSalesOrderError: (state) => {
      state.error = null;
      state.actionError = null;
    },

    /* ------------------------- CLEAR SELECTED ------------------------ */

    clearSalesOrder: (state) => {
      state.salesOrder = null;
    },

    /* ------------------------- CLEAR LIST ---------------------------- */

    clearSalesOrders: (state) => {
      state.salesOrders = [];

      state.pagination = {
        pageNumber: 0,
        pageSize: 10,
        totalElements: 0,
        totalPages: 0,
        last: true,
      };
    },

    /* ------------------------- SET SELECTED -------------------------- */

    setSalesOrder: (state, action) => {
      state.salesOrder = action.payload;
    },

    /* ------------------------- RESET STATE --------------------------- */

    resetSalesOrderState: () => initialState,
  },

  /* ---------------------------------------------------------------------- */
  /*                              ASYNC ACTIONS                             */
  /* ---------------------------------------------------------------------- */

  extraReducers: (builder) => {
    builder

      /* ============================================================= */
      /*                         CREATE SALE ORDER                    */
      /* ============================================================= */

      .addCase(createSalesOrder.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })

      .addCase(createSalesOrder.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.salesOrder = action.payload;

        if (action.payload?.id) {
          const exists = state.salesOrders.some(
            (order) => order.id === action.payload.id,
          );

          if (!exists) {
            state.salesOrders.unshift(action.payload);
            state.pagination.totalElements += 1;
          }
        }
      })

      .addCase(createSalesOrder.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload || "Failed to create sales order";
      })

      /* ============================================================= */
      /*                       FETCH SALE ORDER BY ID                  */
      /* ============================================================= */

      .addCase(fetchSalesOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchSalesOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.salesOrder = action.payload;
      })

      .addCase(fetchSalesOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch sales order";
      })

      /* ============================================================= */
      /*                       FETCH ALL SALE ORDERS                   */
      /* ============================================================= */

      .addCase(fetchAllSalesOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchAllSalesOrders.fulfilled, (state, action) => {
        state.loading = false;

        state.salesOrders = action.payload?.content || [];

        state.pagination = {
          pageNumber: action.payload?.pageNumber ?? 0,

          pageSize: action.payload?.pageSize ?? 10,

          totalElements: action.payload?.totalElements ?? 0,

          totalPages: action.payload?.totalPages ?? 0,

          last: action.payload?.last ?? true,
        };
      })

      .addCase(fetchAllSalesOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch sales orders";
      })

      /* ============================================================= */
      /*                         UPDATE SALE ORDER                    */
      /* ============================================================= */

      .addCase(updateSalesOrder.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })

      .addCase(updateSalesOrder.fulfilled, (state, action) => {
        state.actionLoading = false;

        state.salesOrder = action.payload;

        updateOrderInList(state, action.payload);
      })

      .addCase(updateSalesOrder.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload || "Failed to update sales order";
      })

      /* ============================================================= */
      /*                       DISPATCH SALE ORDER                     */
      /* ============================================================= */

      .addCase(dispatchSalesOrder.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })

      .addCase(dispatchSalesOrder.fulfilled, (state, action) => {
        state.actionLoading = false;

        updateOrderInList(state, action.payload);
      })

      .addCase(dispatchSalesOrder.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload || "Failed to dispatch sales order";
      })

      /* ============================================================= */
      /*                        CONFIRM SALE ORDER                    */
      /* ============================================================= */

      .addCase(confirmSalesOrder.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })

      .addCase(confirmSalesOrder.fulfilled, (state, action) => {
        state.actionLoading = false;

        updateOrderInList(state, action.payload);
      })

      .addCase(confirmSalesOrder.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload || "Failed to confirm sales order";
      })

      /* ============================================================= */
      /*                         CANCEL SALE ORDER                    */
      /* ============================================================= */

      .addCase(cancelSalesOrder.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })

      .addCase(cancelSalesOrder.fulfilled, (state, action) => {
        state.actionLoading = false;

        updateOrderInList(state, action.payload);
      })

      .addCase(cancelSalesOrder.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload || "Failed to cancel sales order";
      })

      /* ============================================================= */
      /*                         DELETE SALE ORDER                    */
      /* ============================================================= */

      .addCase(deleteSalesOrder.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })

      .addCase(deleteSalesOrder.fulfilled, (state, action) => {
        state.actionLoading = false;

        const deletedId = action.payload.id;

        state.salesOrders = state.salesOrders.filter(
          (order) => order.id !== deletedId,
        );

        if (state.salesOrder?.id === deletedId) {
          state.salesOrder = null;
        }

        state.pagination.totalElements = Math.max(
          0,
          state.pagination.totalElements - 1,
        );
      })

      .addCase(deleteSalesOrder.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload || "Failed to delete sales order";
      });
  },
});

/* -------------------------------------------------------------------------- */
/*                                  EXPORTS                                   */
/* -------------------------------------------------------------------------- */

export const {
  clearSalesOrderError,
  clearSalesOrder,
  clearSalesOrders,
  setSalesOrder,
  resetSalesOrderState,
} = salesOrderSlice.actions;

export default salesOrderSlice.reducer;
