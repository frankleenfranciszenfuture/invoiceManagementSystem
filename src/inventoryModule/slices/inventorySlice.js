import { createSlice } from "@reduxjs/toolkit";

import {
  createOpeningStock,
  adjustStock,
  fetchStockById,
  fetchAllStocks,
  fetchStockByProduct,
  fetchStockByWarehouse,
  fetchLowStock,
  fetchAllInventoryTransactions,
  fetchInventoryTransactionById,
  fetchTransactionsByProduct,
  fetchTransactionsByWarehouse,
  fetchInventoryDashboard,
} from "../thunks/inventoryThunk";

const initialState = {
  // Stock
  stocks: [],
  stock: null,

  stockPagination: {
    pageNumber: 0,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0,
    last: true,
  },

  // Transactions
  transactions: [],
  transaction: null,

  transactionPagination: {
    pageNumber: 0,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0,
    last: true,
  },

  // Dashboard
  dashboard: null,

  // Loading states
  stockLoading: false,
  transactionLoading: false,
  dashboardLoading: false,
  loading: false,

  // Error states
  stockError: null,
  transactionError: null,
  dashboardError: null,
  actionError: null,

  // Success messages
  actionSuccess: null,
};

const inventorySlice = createSlice({
  name: "inventory",
  initialState,

  reducers: {
    clearInventoryErrors: (state) => {
      state.stockError = null;
      state.transactionError = null;
      state.dashboardError = null;
      state.actionError = null;
    },

    clearInventorySuccess: (state) => {
      state.actionSuccess = null;
    },

    clearSelectedStock: (state) => {
      state.stock = null;
    },

    clearSelectedTransaction: (state) => {
      state.transaction = null;
    },

    clearInventoryDashboard: (state) => {
      state.dashboard = null;
    },

    resetInventoryState: () => initialState,
  },

  extraReducers: (builder) => {
    // ==========================================
    // OPENING STOCK
    // ==========================================

    builder
      .addCase(createOpeningStock.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
        state.actionSuccess = null;
      })
      .addCase(createOpeningStock.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess =
          action.payload?.message || "Opening stock created successfully.";
      })
      .addCase(createOpeningStock.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload || "Failed to create opening stock.";
      });

    // ==========================================
    // STOCK ADJUSTMENT
    // ==========================================

    builder
      .addCase(adjustStock.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
        state.actionSuccess = null;
      })
      .addCase(adjustStock.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess =
          action.payload?.message || "Stock adjusted successfully.";
      })
      .addCase(adjustStock.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload || "Failed to adjust stock.";
      });

    // ==========================================
    // FETCH STOCK BY ID
    // ==========================================

    builder
      .addCase(fetchStockById.pending, (state) => {
        state.stockLoading = true;
        state.stockError = null;
      })
      .addCase(fetchStockById.fulfilled, (state, action) => {
        state.stockLoading = false;
        state.stock = action.payload;
      })
      .addCase(fetchStockById.rejected, (state, action) => {
        state.stockLoading = false;
        state.stockError = action.payload || "Failed to fetch stock.";
      });

    // ==========================================
    // FETCH ALL STOCKS
    // ==========================================

    builder
      .addCase(fetchAllStocks.pending, (state) => {
        state.stockLoading = true;
        state.stockError = null;
      })
      .addCase(fetchAllStocks.fulfilled, (state, action) => {
        state.stockLoading = false;

        state.stocks = action.payload?.content || [];

        state.stockPagination = {
          pageNumber: action.payload?.pageNumber ?? 0,
          pageSize: action.payload?.pageSize ?? 10,
          totalElements: action.payload?.totalElements ?? 0,
          totalPages: action.payload?.totalPages ?? 0,
          last: action.payload?.last ?? true,
        };
      })
      .addCase(fetchAllStocks.rejected, (state, action) => {
        state.stockLoading = false;
        state.stockError = action.payload || "Failed to fetch stocks.";
      });

    // ==========================================
    // FETCH STOCK BY PRODUCT
    // ==========================================

    builder
      .addCase(fetchStockByProduct.pending, (state) => {
        state.stockLoading = true;
        state.stockError = null;
      })
      .addCase(fetchStockByProduct.fulfilled, (state, action) => {
        state.stockLoading = false;

        state.stocks = action.payload?.content || [];

        state.stockPagination = {
          pageNumber: action.payload?.pageNumber ?? 0,
          pageSize: action.payload?.pageSize ?? 10,
          totalElements: action.payload?.totalElements ?? 0,
          totalPages: action.payload?.totalPages ?? 0,
          last: action.payload?.last ?? true,
        };
      })
      .addCase(fetchStockByProduct.rejected, (state, action) => {
        state.stockLoading = false;
        state.stockError = action.payload || "Failed to fetch product stocks.";
      });

    // ==========================================
    // FETCH STOCK BY WAREHOUSE
    // ==========================================

    builder
      .addCase(fetchStockByWarehouse.pending, (state) => {
        state.stockLoading = true;
        state.stockError = null;
      })
      .addCase(fetchStockByWarehouse.fulfilled, (state, action) => {
        state.stockLoading = false;

        state.stocks = action.payload?.content || [];

        state.stockPagination = {
          pageNumber: action.payload?.pageNumber ?? 0,
          pageSize: action.payload?.pageSize ?? 10,
          totalElements: action.payload?.totalElements ?? 0,
          totalPages: action.payload?.totalPages ?? 0,
          last: action.payload?.last ?? true,
        };
      })
      .addCase(fetchStockByWarehouse.rejected, (state, action) => {
        state.stockLoading = false;
        state.stockError =
          action.payload || "Failed to fetch warehouse stocks.";
      });

    // ==========================================
    // FETCH LOW STOCK
    // ==========================================

    builder
      .addCase(fetchLowStock.pending, (state) => {
        state.stockLoading = true;
        state.stockError = null;
      })
      .addCase(fetchLowStock.fulfilled, (state, action) => {
        state.stockLoading = false;

        state.stocks = action.payload?.content || [];

        state.stockPagination = {
          pageNumber: action.payload?.pageNumber ?? 0,
          pageSize: action.payload?.pageSize ?? 10,
          totalElements: action.payload?.totalElements ?? 0,
          totalPages: action.payload?.totalPages ?? 0,
          last: action.payload?.last ?? true,
        };
      })
      .addCase(fetchLowStock.rejected, (state, action) => {
        state.stockLoading = false;
        state.stockError = action.payload || "Failed to fetch low stocks.";
      });

    // ==========================================
    // FETCH ALL TRANSACTIONS
    // ==========================================

    builder
      .addCase(fetchAllInventoryTransactions.pending, (state) => {
        state.transactionLoading = true;
        state.transactionError = null;
      })
      .addCase(fetchAllInventoryTransactions.fulfilled, (state, action) => {
        state.transactionLoading = false;

        state.transactions = action.payload?.content || [];

        state.transactionPagination = {
          pageNumber: action.payload?.pageNumber ?? 0,
          pageSize: action.payload?.pageSize ?? 10,
          totalElements: action.payload?.totalElements ?? 0,
          totalPages: action.payload?.totalPages ?? 0,
          last: action.payload?.last ?? true,
        };
      })
      .addCase(fetchAllInventoryTransactions.rejected, (state, action) => {
        state.transactionLoading = false;
        state.transactionError =
          action.payload || "Failed to fetch transactions.";
      });

    // ==========================================
    // FETCH TRANSACTION BY ID
    // ==========================================

    builder
      .addCase(fetchInventoryTransactionById.pending, (state) => {
        state.transactionLoading = true;
        state.transactionError = null;
      })
      .addCase(fetchInventoryTransactionById.fulfilled, (state, action) => {
        state.transactionLoading = false;
        state.transaction = action.payload;
      })
      .addCase(fetchInventoryTransactionById.rejected, (state, action) => {
        state.transactionLoading = false;
        state.transactionError =
          action.payload || "Failed to fetch transaction.";
      });

    // ==========================================
    // FETCH TRANSACTIONS BY PRODUCT
    // ==========================================

    builder
      .addCase(fetchTransactionsByProduct.pending, (state) => {
        state.transactionLoading = true;
        state.transactionError = null;
      })
      .addCase(fetchTransactionsByProduct.fulfilled, (state, action) => {
        state.transactionLoading = false;

        state.transactions = action.payload?.content || [];

        state.transactionPagination = {
          pageNumber: action.payload?.pageNumber ?? 0,
          pageSize: action.payload?.pageSize ?? 10,
          totalElements: action.payload?.totalElements ?? 0,
          totalPages: action.payload?.totalPages ?? 0,
          last: action.payload?.last ?? true,
        };
      })
      .addCase(fetchTransactionsByProduct.rejected, (state, action) => {
        state.transactionLoading = false;
        state.transactionError =
          action.payload || "Failed to fetch product transactions.";
      });

    // ==========================================
    // FETCH TRANSACTIONS BY WAREHOUSE
    // ==========================================

    builder
      .addCase(fetchTransactionsByWarehouse.pending, (state) => {
        state.transactionLoading = true;
        state.transactionError = null;
      })
      .addCase(fetchTransactionsByWarehouse.fulfilled, (state, action) => {
        state.transactionLoading = false;

        state.transactions = action.payload?.content || [];

        state.transactionPagination = {
          pageNumber: action.payload?.pageNumber ?? 0,
          pageSize: action.payload?.pageSize ?? 10,
          totalElements: action.payload?.totalElements ?? 0,
          totalPages: action.payload?.totalPages ?? 0,
          last: action.payload?.last ?? true,
        };
      })
      .addCase(fetchTransactionsByWarehouse.rejected, (state, action) => {
        state.transactionLoading = false;
        state.transactionError =
          action.payload || "Failed to fetch warehouse transactions.";
      });

    // ==========================================
    // INVENTORY DASHBOARD
    // ==========================================

    builder
      .addCase(fetchInventoryDashboard.pending, (state) => {
        state.dashboardLoading = true;
        state.dashboardError = null;
      })
      .addCase(fetchInventoryDashboard.fulfilled, (state, action) => {
        state.dashboardLoading = false;
        state.dashboard = action.payload;
      })
      .addCase(fetchInventoryDashboard.rejected, (state, action) => {
        state.dashboardLoading = false;
        state.dashboardError =
          action.payload || "Failed to fetch inventory dashboard.";
      });
  },
});

export const {
  clearInventoryErrors,
  clearInventorySuccess,
  clearSelectedStock,
  clearSelectedTransaction,
  clearInventoryDashboard,
  resetInventoryState,
} = inventorySlice.actions;

export default inventorySlice.reducer;
