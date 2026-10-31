import { createSlice } from "@reduxjs/toolkit";

import {
  createPurchaseOrder,
  fetchPurchaseOrderById,
  fetchAllPurchaseOrders,
  updatePurchaseOrder,
  confirmPurchaseOrder,
  cancelPurchaseOrder,
  deletePurchaseOrder,
  createPurchaseOrderGoodsReceipt,
  fetchPurchaseOrderGoodsReceiptById,
  fetchPurchaseOrderGoodsReceipts,
} from "../thunks/purchaseOrderThunks";

/* ============================================================
   EMPTY PURCHASE ORDER ITEM
============================================================ */

const emptyPurchaseOrderItem = {
  productId: "",
  description: "",
  unitId: "",
  sizeId: "",
  quantity: "",
  baseUnitPrice: "",
  discountType: "PERCENTAGE",
  discountValue: 0,
  taxMasterId: "",
};

/* ============================================================
   EMPTY PURCHASE ORDER CREATE
============================================================ */

const initialPurchaseOrderCreate = {
  partyId: "",
  warehouseId: "",
  orderDate: "",
  expectedDeliveryDate: "",
  currencyId: "",
  discountType: "PERCENTAGE",
  discountValue: 0,
  notes: "",
  items: [{ ...emptyPurchaseOrderItem }],
};

/* ============================================================
   EMPTY GOODS RECEIPT ITEM
============================================================ */

const emptyGoodsReceiptItem = {
  purchaseOrderItemId: "",
  receivedQuantity: "",
  receivedUnitCost: "",
};

/* ============================================================
   EMPTY GOODS RECEIPT CREATE
============================================================ */

const initialGoodsReceiptCreate = {
  purchaseOrderId: "",
  receiptDate: "",
  notes: "",
  items: [{ ...emptyGoodsReceiptItem }],
};

/* ============================================================
   INITIAL STATE
============================================================ */

const initialState = {
  /* PURCHASE ORDER FORM */

  purchaseOrderCreate: {
    ...initialPurchaseOrderCreate,
    items: [{ ...emptyPurchaseOrderItem }],
  },

  /* GOODS RECEIPT FORM */

  goodsReceiptCreate: {
    ...initialGoodsReceiptCreate,
    items: [{ ...emptyGoodsReceiptItem }],
  },

  /* PURCHASE ORDER DATA */

  purchaseOrders: [],
  purchaseOrder: null,

  /* GOODS RECEIPT DATA */

  goodsReceipts: [],
  goodsReceipt: null,

  /* PAGINATION */

  pagination: {
    pageNumber: 0,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0,
    last: true,
    first: true,
  },

  /* LOADING STATES */

  loading: false,
  listLoading: false,
  detailsLoading: false,
  createLoading: false,
  updateLoading: false,
  confirmLoading: false,
  cancelLoading: false,
  deleteLoading: false,

  goodsReceiptLoading: false,
  goodsReceiptListLoading: false,
  goodsReceiptCreateLoading: false,

  /* ERROR STATES */

  error: null,
  listError: null,
  detailsError: null,
  createError: null,
  updateError: null,
  confirmError: null,
  cancelError: null,
  deleteError: null,

  goodsReceiptError: null,
  goodsReceiptListError: null,
  goodsReceiptCreateError: null,

  /* SUCCESS MESSAGES */

  successMessage: null,
};

/* ============================================================
   HELPER: UPDATE PURCHASE ORDER IN LIST
============================================================ */

const updatePurchaseOrderInList = (state, updatedOrder) => {
  if (!updatedOrder?.id) return;

  const index = state.purchaseOrders.findIndex(
    (item) => item.id === updatedOrder.id,
  );

  if (index !== -1) {
    state.purchaseOrders[index] = updatedOrder;
  }
};

/* ============================================================
   HELPER: RESET ERRORS
============================================================ */

const resetErrors = (state) => {
  state.error = null;
  state.listError = null;
  state.detailsError = null;
  state.createError = null;
  state.updateError = null;
  state.confirmError = null;
  state.cancelError = null;
  state.deleteError = null;

  state.goodsReceiptError = null;
  state.goodsReceiptListError = null;
  state.goodsReceiptCreateError = null;
};

/* ============================================================
   SLICE
============================================================ */

const purchaseOrderSlice = createSlice({
  name: "purchaseOrder",
  initialState,

  reducers: {
    /* ====================================================
           PURCHASE ORDER FORM
        ==================================================== */

    setPurchaseOrderCreate: (state, action) => {
      state.purchaseOrderCreate = action.payload;
    },

    updatePurchaseOrderCreateField: (state, action) => {
      const { name, value } = action.payload;

      state.purchaseOrderCreate[name] = value;
    },

    resetPurchaseOrderCreate: (state) => {
      state.purchaseOrderCreate = {
        ...initialPurchaseOrderCreate,
        items: [{ ...emptyPurchaseOrderItem }],
      };

      state.createError = null;
    },

    /* ====================================================
           PURCHASE ORDER ITEM FORM
        ==================================================== */

    addPurchaseOrderItem: (state) => {
      state.purchaseOrderCreate.items.push({
        ...emptyPurchaseOrderItem,
      });
    },

    updatePurchaseOrderItem: (state, action) => {
      const { index, name, value } = action.payload;

      if (state.purchaseOrderCreate.items[index]) {
        state.purchaseOrderCreate.items[index][name] = value;
      }
    },

    removePurchaseOrderItem: (state, action) => {
      const index = action.payload;

      if (state.purchaseOrderCreate.items.length > 1) {
        state.purchaseOrderCreate.items.splice(index, 1);
      }
    },

    /* ====================================================
           GOODS RECEIPT FORM
        ==================================================== */

    setGoodsReceiptCreate: (state, action) => {
      state.goodsReceiptCreate = action.payload;
    },

    updateGoodsReceiptCreateField: (state, action) => {
      const { name, value } = action.payload;

      state.goodsReceiptCreate[name] = value;
    },

    resetGoodsReceiptCreate: (state) => {
      state.goodsReceiptCreate = {
        ...initialGoodsReceiptCreate,
        items: [{ ...emptyGoodsReceiptItem }],
      };

      state.goodsReceiptCreateError = null;
    },

    /* ====================================================
           GOODS RECEIPT ITEM FORM
        ==================================================== */

    addGoodsReceiptItem: (state) => {
      state.goodsReceiptCreate.items.push({
        ...emptyGoodsReceiptItem,
      });
    },

    updateGoodsReceiptItem: (state, action) => {
      const { index, name, value } = action.payload;

      if (state.goodsReceiptCreate.items[index]) {
        state.goodsReceiptCreate.items[index][name] = value;
      }
    },

    removeGoodsReceiptItem: (state, action) => {
      const index = action.payload;

      if (state.goodsReceiptCreate.items.length > 1) {
        state.goodsReceiptCreate.items.splice(index, 1);
      }
    },

    /* ====================================================
           SELECTED PURCHASE ORDER
        ==================================================== */

    setPurchaseOrder: (state, action) => {
      state.purchaseOrder = action.payload;
    },

    clearPurchaseOrder: (state) => {
      state.purchaseOrder = null;
      state.detailsError = null;
    },

    /* ====================================================
           SELECTED GOODS RECEIPT
        ==================================================== */

    setGoodsReceipt: (state, action) => {
      state.goodsReceipt = action.payload;
    },

    clearGoodsReceipt: (state) => {
      state.goodsReceipt = null;
      state.goodsReceiptError = null;
    },

    /* ====================================================
           CLEAR ERRORS AND MESSAGES
        ==================================================== */

    clearPurchaseOrderErrors: (state) => {
      resetErrors(state);
    },

    clearPurchaseOrderMessages: (state) => {
      state.successMessage = null;
      resetErrors(state);
    },

    /* ====================================================
           RESET COMPLETE SLICE
        ==================================================== */

    resetPurchaseOrderState: () => initialState,
  },

  /* ========================================================
       EXTRA REDUCERS
    ======================================================== */

  extraReducers: (builder) => {
    /* ====================================================
           CREATE PURCHASE ORDER
        ==================================================== */

    builder
      .addCase(createPurchaseOrder.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createPurchaseOrder.fulfilled, (state, action) => {
        state.createLoading = false;

        state.purchaseOrder = action.payload;

        if (action.payload) {
          state.successMessage = "Purchase order created successfully.";
        }
      })
      .addCase(createPurchaseOrder.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload;
        state.error = action.payload;
      });

    /* ====================================================
           FETCH PURCHASE ORDER BY ID
        ==================================================== */

    builder
      .addCase(fetchPurchaseOrderById.pending, (state) => {
        state.detailsLoading = true;
        state.detailsError = null;
        state.error = null;
      })
      .addCase(fetchPurchaseOrderById.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.purchaseOrder = action.payload;
      })
      .addCase(fetchPurchaseOrderById.rejected, (state, action) => {
        state.detailsLoading = false;
        state.detailsError = action.payload;
        state.error = action.payload;
      });

    /* ====================================================
           FETCH ALL PURCHASE ORDERS
        ==================================================== */

    builder
      .addCase(fetchAllPurchaseOrders.pending, (state) => {
        state.listLoading = true;
        state.listError = null;
        state.error = null;
      })
      .addCase(fetchAllPurchaseOrders.fulfilled, (state, action) => {
        state.listLoading = false;

        const result = action.payload;

        state.purchaseOrders = result?.content || [];

        state.pagination = {
          pageNumber: result?.number ?? result?.pageNumber ?? 0,
          pageSize: result?.size ?? result?.pageSize ?? 10,
          totalElements: result?.totalElements ?? 0,
          totalPages: result?.totalPages ?? 0,
          last: result?.last ?? true,
          first: result?.first ?? true,
        };
      })
      .addCase(fetchAllPurchaseOrders.rejected, (state, action) => {
        state.listLoading = false;
        state.listError = action.payload;
        state.error = action.payload;
      });

    /* ====================================================
           UPDATE PURCHASE ORDER
        ==================================================== */

    builder
      .addCase(updatePurchaseOrder.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updatePurchaseOrder.fulfilled, (state, action) => {
        state.updateLoading = false;

        state.purchaseOrder = action.payload;

        updatePurchaseOrderInList(state, action.payload);

        state.successMessage = "Purchase order updated successfully.";
      })
      .addCase(updatePurchaseOrder.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
        state.error = action.payload;
      });

    /* ====================================================
           CONFIRM PURCHASE ORDER
        ==================================================== */

    builder
      .addCase(confirmPurchaseOrder.pending, (state) => {
        state.confirmLoading = true;
        state.confirmError = null;
        state.error = null;
      })
      .addCase(confirmPurchaseOrder.fulfilled, (state, action) => {
        state.confirmLoading = false;

        state.purchaseOrder = action.payload;

        updatePurchaseOrderInList(state, action.payload);

        state.successMessage = "Purchase order confirmed successfully.";
      })
      .addCase(confirmPurchaseOrder.rejected, (state, action) => {
        state.confirmLoading = false;
        state.confirmError = action.payload;
        state.error = action.payload;
      });

    /* ====================================================
           CANCEL PURCHASE ORDER
        ==================================================== */

    builder
      .addCase(cancelPurchaseOrder.pending, (state) => {
        state.cancelLoading = true;
        state.cancelError = null;
        state.error = null;
      })
      .addCase(cancelPurchaseOrder.fulfilled, (state, action) => {
        state.cancelLoading = false;

        state.purchaseOrder = action.payload;

        updatePurchaseOrderInList(state, action.payload);

        state.successMessage = "Purchase order cancelled successfully.";
      })
      .addCase(cancelPurchaseOrder.rejected, (state, action) => {
        state.cancelLoading = false;
        state.cancelError = action.payload;
        state.error = action.payload;
      });

    /* ====================================================
           DELETE PURCHASE ORDER
        ==================================================== */

    builder
      .addCase(deletePurchaseOrder.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
        state.error = null;
      })
      .addCase(deletePurchaseOrder.fulfilled, (state, action) => {
        state.deleteLoading = false;

        const deletedId = action.payload?.id;

        state.purchaseOrders = state.purchaseOrders.filter(
          (item) => item.id !== deletedId,
        );

        if (state.purchaseOrder?.id === deletedId) {
          state.purchaseOrder = null;
        }

        state.successMessage = "Purchase order deleted successfully.";
      })
      .addCase(deletePurchaseOrder.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload;
        state.error = action.payload;
      });

    /* ====================================================
           CREATE GOODS RECEIPT
        ==================================================== */

    builder
      .addCase(createPurchaseOrderGoodsReceipt.pending, (state) => {
        state.goodsReceiptCreateLoading = true;
        state.goodsReceiptCreateError = null;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createPurchaseOrderGoodsReceipt.fulfilled, (state, action) => {
        state.goodsReceiptCreateLoading = false;

        state.goodsReceipt = action.payload;

        if (action.payload) {
          state.successMessage = "Goods receipt created successfully.";

          if (action.payload.purchaseOrder) {
            state.purchaseOrder = action.payload.purchaseOrder;

            updatePurchaseOrderInList(state, action.payload.purchaseOrder);
          }
        }
      })
      .addCase(createPurchaseOrderGoodsReceipt.rejected, (state, action) => {
        state.goodsReceiptCreateLoading = false;
        state.goodsReceiptCreateError = action.payload;
        state.error = action.payload;
      });

    /* ====================================================
           FETCH GOODS RECEIPT BY ID
        ==================================================== */

    builder
      .addCase(fetchPurchaseOrderGoodsReceiptById.pending, (state) => {
        state.goodsReceiptLoading = true;
        state.goodsReceiptError = null;
        state.error = null;
      })
      .addCase(
        fetchPurchaseOrderGoodsReceiptById.fulfilled,
        (state, action) => {
          state.goodsReceiptLoading = false;
          state.goodsReceipt = action.payload;
        },
      )
      .addCase(fetchPurchaseOrderGoodsReceiptById.rejected, (state, action) => {
        state.goodsReceiptLoading = false;
        state.goodsReceiptError = action.payload;
        state.error = action.payload;
      });

    /* ====================================================
           FETCH GOODS RECEIPTS BY PURCHASE ORDER ID
        ==================================================== */

    builder
      .addCase(fetchPurchaseOrderGoodsReceipts.pending, (state) => {
        state.goodsReceiptListLoading = true;
        state.goodsReceiptListError = null;
      })
      .addCase(fetchPurchaseOrderGoodsReceipts.fulfilled, (state, action) => {
        state.goodsReceiptListLoading = false;
        state.goodsReceipts = action.payload || [];
      })
      .addCase(fetchPurchaseOrderGoodsReceipts.rejected, (state, action) => {
        state.goodsReceiptListLoading = false;
        state.goodsReceiptListError = action.payload;
      });
  },
});

/* ============================================================
   EXPORT ACTIONS
============================================================ */

export const {
  setPurchaseOrderCreate,
  updatePurchaseOrderCreateField,
  resetPurchaseOrderCreate,

  addPurchaseOrderItem,
  updatePurchaseOrderItem,
  removePurchaseOrderItem,

  setGoodsReceiptCreate,
  updateGoodsReceiptCreateField,
  resetGoodsReceiptCreate,

  addGoodsReceiptItem,
  updateGoodsReceiptItem,
  removeGoodsReceiptItem,

  setPurchaseOrder,
  clearPurchaseOrder,

  setGoodsReceipt,
  clearGoodsReceipt,

  clearPurchaseOrderErrors,
  clearPurchaseOrderMessages,

  resetPurchaseOrderState,
} = purchaseOrderSlice.actions;

/* ============================================================
   EXPORT REDUCER
============================================================ */

export default purchaseOrderSlice.reducer;
