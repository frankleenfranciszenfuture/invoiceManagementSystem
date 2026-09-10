import { createSlice } from "@reduxjs/toolkit";

import {
  fetchAllProducts,
  fetchProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../thunks/productThunks";

/* =========================================================
   INITIAL STATE
   ========================================================= */

const initialState = {
  products: [],
  product: null,

  exsistingProduct: null,

  pagination: {
    pageNumber: 0,
    pageSize: 20,
    totalElements: 0,
    totalPages: 0,
    last: true,
  },

  loading: false,
  success: false,
  error: null,
  message: "",
};

/* =========================================================
   SLICE
   ========================================================= */

const productSlice = createSlice({
  name: "product",

  initialState,

  reducers: {
    /* =====================================================
       SET EXISTING PRODUCT
       ===================================================== */

    setExsistingProduct: (state, action) => {
      state.exsistingProduct = action.payload;
    },

    /* =====================================================
       CLEAR PRODUCT STATE
       ===================================================== */

    clearProductState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.message = "";
    },

    /* =====================================================
       CLEAR SELECTED PRODUCT
       ===================================================== */

    clearSelectedProduct: (state) => {
      state.product = null;
    },
  },

  /* =======================================================
     ASYNC THUNKS
     ======================================================= */

  extraReducers: (builder) => {
    /* =====================================================
       FETCH ALL PRODUCTS
       ===================================================== */

    builder

      .addCase(fetchAllProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        const response = action.payload;

        console.log("PRODUCT REDUX RESPONSE:", response);
        console.log("PRODUCT CONTENT:", response?.data?.content);

        state.products = response?.data?.content || [];

        state.pagination = {
          pageNumber: response?.data?.pageNumber ?? 0,
          pageSize: response?.data?.pageSize ?? 20,
          totalElements: response?.data?.totalElements ?? 0,
          totalPages: response?.data?.totalPages ?? 0,
          last: response?.data?.last ?? true,
        };
      })

      .addCase(fetchAllProducts.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      });

    /* =====================================================
       FETCH PRODUCT BY ID
       ===================================================== */

    builder

      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        state.product = action.payload?.data || action.payload || null;
      })

      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      });

    /* =====================================================
       CREATE PRODUCT
       ===================================================== */

    builder

      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
        state.message = "";
      })

      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        state.message =
          action.payload?.message || "Product created successfully";

        const newProduct = action.payload?.data;

        if (newProduct) {
          state.products.push(newProduct);
        }
      })

      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error = action.payload || "Something went wrong";
      });

    /* =====================================================
       UPDATE PRODUCT
       ===================================================== */

    builder

      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })

      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        state.message =
          action.payload?.message || "Product updated successfully";

        const updatedProduct = action.payload?.data;

        if (updatedProduct) {
          const index = state.products.findIndex(
            (item) => item.id === updatedProduct.id,
          );

          if (index !== -1) {
            state.products[index] = updatedProduct;
          }

          state.product = updatedProduct;
        }
      })

      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error = action.payload || "Something went wrong";
      });

    /* =====================================================
       DELETE PRODUCT
       ===================================================== */

    builder

      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })

      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        state.message =
          action.payload?.message || "Product deleted successfully";

        const deletedId = action.payload?.data?.id || action.payload?.id;

        if (deletedId) {
          state.products = state.products.filter(
            (item) => item.id !== deletedId,
          );
        }
      })

      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error = action.payload || "Something went wrong";
      });
  },
});

/* =========================================================
   ACTIONS
   ========================================================= */

export const { setExsistingProduct, clearProductState, clearSelectedProduct } =
  productSlice.actions;

/* =========================================================
   REDUCER
   ========================================================= */

export default productSlice.reducer;
