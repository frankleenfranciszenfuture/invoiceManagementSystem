import { createSlice } from "@reduxjs/toolkit";

import {
  fetchAllExpenses,
  fetchExpenseById,
  createExpense,
  updateExpense,
  approveExpense,
  rejectExpense,
  cancelExpense,
} from "../thunks/expenseThunks";

/* =========================================================
   EMPTY EXPENSE
========================================================= */

export const emptyExpense = {
  id: null,

  // Expense details
  expenseNo: "",
  expenseType: "INTERNAL",
  expenseCategoryId: null,
  categoryCode: "",
  categoryName: "",

  expenseDate: "",
  description: "",
  referenceNo: "",

  // Vendor / Supplier
  vendorId: null,
  vendorName: "",

  // Warehouse
  warehouseId: null,

  // Currency
  currencyId: null,
  currencyCode: "",
  currencyName: "",
  currencySymbol: "",
  exchangeRate: 1,

  // Tax master
  taxMasterId: null,
  taxName: "",

  // Selected currency amounts
  amount: 0,
  discountAmount: 0,
  taxableAmount: 0,

  cgstAmount: 0,
  sgstAmount: 0,
  igstAmount: 0,
  totalTaxAmount: 0,
  totalAmount: 0,

  // Base currency amounts (INR)
  baseAmount: 0,
  baseDiscountAmount: 0,
  baseTaxableAmount: 0,

  baseCgstAmount: 0,
  baseSgstAmount: 0,
  baseIgstAmount: 0,
  baseTotalTaxAmount: 0,
  baseTotalAmount: 0,

  // Payment details
  paidAmount: 0,
  dueAmount: 0,

  // Status
  expenseStatus: "DRAFT",
  paymentStatus: "UNPAID",

  // Approval details
  approvedBy: null,
  approvedAt: null,

  // Rejection details
  rejectedBy: null,
  rejectedAt: null,
  rejectionReason: "",

  // Additional details
  notes: "",

  // Audit
  audit: {
    createdAt: null,
    updatedAt: null,
    createdBy: null,
    updatedBy: null,
    active: true,
  },

  active: true,
};

/* =========================================================
   INITIAL STATE
========================================================= */

const initialState = {
  expenses: [],
  expense: { ...emptyExpense },

  createdExpenseCategorySelection: null,
  createdExpenseReferenceSelection: null,
  loading: false,
  actionLoading: false,
  error: null,
  success: false,

  pagination: {
    pageNumber: 0,
    pageSize: 20,
    totalElements: 0,
    totalPages: 0,
    last: true,
  },

  createdExpenseCategorySelection: null,
};

/* =========================================================
   SLICE
========================================================= */

const expenseSlice = createSlice({
  name: "expense",
  initialState,

  reducers: {
    // Set existing expense for editing
    setExistingExpense: (state, action) => {
      state.expense = {
        ...emptyExpense,
        ...action.payload,
        audit: {
          ...emptyExpense.audit,
          ...(action.payload?.audit ?? {}),
        },
      };
    },

    // Update expense form field
    updateExpenseField: (state, action) => {
      const { field, value } = action.payload;
      state.expense[field] = value;
    },

    // Reset expense form
    resetExpenseForm: (state) => {
      state.expense = { ...emptyExpense };
    },

    // Clear selected expense
    clearSelectedExpense: (state) => {
      state.expense = { ...emptyExpense };
    },

    // Clear error
    clearExpenseError: (state) => {
      state.error = null;
    },

    // Clear success
    clearExpenseSuccess: (state) => {
      state.success = false;
    },

    // Reset complete expense state
    resetExpenseState: () => ({
      ...initialState,
      expense: { ...emptyExpense },
      expenses: [],
      pagination: { ...initialState.pagination },
      createdExpenseCategorySelection: null,
    }),

    // Category selection
    setCreatedExpenseCategorySelection: (state, action) => {
      state.createdExpenseCategorySelection = action.payload;
    },

    clearCreatedExpenseCategorySelection: (state) => {
      state.createdExpenseCategorySelection = null;
    },

    setCreatedExpenseReferenceSelection: (state, action) => {
      state.createdExpenseReferenceSelection = action.payload;
    },

    clearCreatedExpenseReferenceSelection: (state) => {
      state.createdExpenseReferenceSelection = null;
    },
  },

  extraReducers: (builder) => {
    // =========================================
    // FETCH ALL EXPENSES
    // =========================================

    builder
      .addCase(fetchAllExpenses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchAllExpenses.fulfilled, (state, action) => {
        state.loading = false;

        const response = action.payload?.data ?? {};

        const expenseList = Array.isArray(response)
          ? response
          : Array.isArray(response.content)
            ? response.content
            : [];

        state.expenses = expenseList;

        state.pagination = {
          pageNumber: response.pageNumber ?? 0,
          pageSize: response.pageSize ?? 20,
          totalElements: response.totalElements ?? expenseList.length,
          totalPages: response.totalPages ?? 1,
          last: response.last ?? true,
        };

        state.error = null;
      })

      .addCase(fetchAllExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? action.error.message;
      });

    // =========================================
    // FETCH EXPENSE BY ID
    // =========================================

    builder
      .addCase(fetchExpenseById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(fetchExpenseById.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        const fetchedExpense = action.payload?.data ?? {};

        state.expense = {
          ...emptyExpense,
          ...fetchedExpense,
          audit: {
            ...emptyExpense.audit,
            ...(fetchedExpense.audit ?? {}),
          },
        };

        state.error = null;
      })

      .addCase(fetchExpenseById.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload ?? action.error.message;
      });

    // =========================================
    // CREATE EXPENSE
    // =========================================

    builder
      .addCase(createExpense.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(createExpense.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.success = true;

        const createdExpense = action.payload?.data ?? null;

        if (createdExpense?.id) {
          state.expenses.unshift(createdExpense);
          state.pagination.totalElements += 1;
        }

        state.expense = { ...emptyExpense };
        state.error = null;
      })

      .addCase(createExpense.rejected, (state, action) => {
        state.actionLoading = false;
        state.success = false;
        state.error = action.payload ?? action.error.message;
      });

    // =========================================
    // UPDATE EXPENSE
    // =========================================

    builder
      .addCase(updateExpense.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(updateExpense.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.success = true;

        const updatedExpense = action.payload?.data ?? null;

        if (updatedExpense?.id) {
          state.expenses = state.expenses.map((item) =>
            item.id === updatedExpense.id ? updatedExpense : item,
          );

          if (state.expense.id === updatedExpense.id) {
            state.expense = {
              ...emptyExpense,
              ...updatedExpense,
              audit: {
                ...emptyExpense.audit,
                ...(updatedExpense.audit ?? {}),
              },
            };
          }
        }

        state.error = null;
      })

      .addCase(updateExpense.rejected, (state, action) => {
        state.actionLoading = false;
        state.success = false;
        state.error = action.payload ?? action.error.message;
      });

    // =========================================
    // APPROVE EXPENSE
    // =========================================

    builder
      .addCase(approveExpense.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })

      .addCase(approveExpense.fulfilled, (state, action) => {
        state.actionLoading = false;

        const approvedExpense = action.payload?.data ?? null;

        if (approvedExpense?.id) {
          state.expenses = state.expenses.map((item) =>
            item.id === approvedExpense.id ? approvedExpense : item,
          );

          if (state.expense.id === approvedExpense.id) {
            state.expense = {
              ...emptyExpense,
              ...approvedExpense,
            };
          }
        }

        state.error = null;
      })

      .addCase(approveExpense.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload ?? action.error.message;
      });

    // =========================================
    // REJECT EXPENSE
    // =========================================

    builder
      .addCase(rejectExpense.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })

      .addCase(rejectExpense.fulfilled, (state, action) => {
        state.actionLoading = false;

        const rejectedExpense = action.payload?.data ?? null;

        if (rejectedExpense?.id) {
          state.expenses = state.expenses.map((item) =>
            item.id === rejectedExpense.id ? rejectedExpense : item,
          );

          if (state.expense.id === rejectedExpense.id) {
            state.expense = {
              ...emptyExpense,
              ...rejectedExpense,
            };
          }
        }

        state.error = null;
      })

      .addCase(rejectExpense.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload ?? action.error.message;
      });

    // =========================================
    // CANCEL EXPENSE
    // =========================================

    builder
      .addCase(cancelExpense.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })

      .addCase(cancelExpense.fulfilled, (state, action) => {
        state.actionLoading = false;

        const cancelledExpense = action.payload?.data ?? null;

        if (cancelledExpense?.id) {
          state.expenses = state.expenses.map((item) =>
            item.id === cancelledExpense.id ? cancelledExpense : item,
          );

          if (state.expense.id === cancelledExpense.id) {
            state.expense = {
              ...emptyExpense,
              ...cancelledExpense,
            };
          }
        }

        state.error = null;
      })

      .addCase(cancelExpense.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload ?? action.error.message;
      });
  },
});

/* =========================================================
   EXPORT ACTIONS
========================================================= */

export const {
  setExistingExpense,
  updateExpenseField,
  resetExpenseForm,
  clearSelectedExpense,
  clearExpenseError,
  clearExpenseSuccess,
  resetExpenseState,
  setCreatedExpenseCategorySelection,
  clearCreatedExpenseCategorySelection,

  setCreatedExpenseReferenceSelection,
  clearCreatedExpenseReferenceSelection,
} = expenseSlice.actions;

export default expenseSlice.reducer;
