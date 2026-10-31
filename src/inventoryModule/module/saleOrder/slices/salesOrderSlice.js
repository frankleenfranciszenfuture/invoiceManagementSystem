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
/*                           EMPTY SALE ORDER                                 */
/* -------------------------------------------------------------------------- */

export const emptySaleOrder = {
  partyType: "CUSTOMER",
  customerId: null,
  partyId: null,
  warehouseId: null,

  orderDate: new Date().toISOString().split("T")[0],
  expectedDeliveryDate: "",

  currencyId: null,

  discountType: "PERCENTAGE",
  discountValue: 0,

  notes: "",

  items: [
    {
      productId: null,
      description: "",
      unitId: null,
      sizeId: null,
      quantity: 1,
      baseUnitPrice: 0,

      discountType: "AMOUNT",
      discountValue: 0,

      taxMasterId: null,
    },
  ],
};

/* -------------------------------------------------------------------------- */
/*                              INITIAL STATE                                 */
/* -------------------------------------------------------------------------- */

const initialState = {
  salesOrders: [],
  salesOrder: null,

  // Existing selected/editing sales order
  exsistingSaleOrder: null,

  // Default sales order form
  emptySaleOrder: {
    ...emptySaleOrder,
    items: emptySaleOrder.items.map((item) => ({ ...item })),
  },

  // Pagination
  pagination: {
    pageNumber: 0,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0,
    last: true,
  },

  // Loading states
  loading: false,
  actionLoading: false,

  // Error states
  error: null,
  actionError: null,
};

/* -------------------------------------------------------------------------- */
/*                              HELPER FUNCTIONS                              */
/* -------------------------------------------------------------------------- */

// Update an existing sales order in the list and selected order
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

// Reset error messages
const resetErrors = (state) => {
  state.error = null;
  state.actionError = null;
};

// Create a fresh empty sales order form
const createEmptySaleOrder = () => ({
  ...emptySaleOrder,
  orderDate: new Date().toISOString().split("T")[0],
  items: emptySaleOrder.items.map((item) => ({ ...item })),
});

/* -------------------------------------------------------------------------- */
/*                                  SLICE                                     */
/* -------------------------------------------------------------------------- */

const salesOrderSlice = createSlice({
  name: "salesOrder",

  initialState,

  reducers: {
    /* ------------------------- CLEAR ERRORS -------------------------- */

    clearSalesOrderError: (state) => {
      resetErrors(state);
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

    /* ------------------------- SET EXISTING -------------------------- */

    setExsistingSaleOrder: (state, action) => {
      state.exsistingSaleOrder = action.payload;
    },

    /* ------------------------- CLEAR EXISTING ------------------------ */

    clearExsistingSaleOrder: (state) => {
      state.exsistingSaleOrder = null;
    },

    /* ------------------------- RESET EMPTY FORM ---------------------- */

    resetEmptySaleOrder: (state) => {
      state.emptySaleOrder = createEmptySaleOrder();
    },

    /* ------------------------- UPDATE EMPTY FORM --------------------- */

    setEmptySaleOrder: (state, action) => {
      state.emptySaleOrder = {
        ...state.emptySaleOrder,
        ...action.payload,
      };
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

        state.salesOrders = action.payload?.content ?? [];

        state.pagination = {
          pageNumber: action.payload?.pageNumber ?? 0,
          pageSize: action.payload?.pageSize ?? 10,
          totalElements: action.payload?.totalElements ?? 0,
          totalPages: action.payload?.totalPages ?? 0,
          last: action.payload?.last ?? true,
        };

        state.error = null;
      })

      .addCase(fetchAllSalesOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message;
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

        const deletedId = action.payload?.id;

        if (!deletedId) return;

        state.salesOrders = state.salesOrders.filter(
          (order) => order.id !== deletedId,
        );

        if (state.salesOrder?.id === deletedId) {
          state.salesOrder = null;
        }

        if (state.exsistingSaleOrder?.id === deletedId) {
          state.exsistingSaleOrder = null;
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
  setExsistingSaleOrder,
  clearExsistingSaleOrder,
  resetEmptySaleOrder,
  setEmptySaleOrder,
  resetSalesOrderState,
} = salesOrderSlice.actions;

export default salesOrderSlice.reducer;
