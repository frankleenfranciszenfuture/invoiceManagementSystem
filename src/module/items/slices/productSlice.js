import { createSlice } from "@reduxjs/toolkit";

import {
  fetchAllProducts,
  fetchProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  reactivateProduct,
  fetchProductsByStatus,
} from "../thunks/productThunks";

/* =========================================================
   EMPTY PRODUCT FORM
   ========================================================= */

const emptyProduct = {
  id: null,

  productName: "",

  categoryId: "",

  subCategoryId: "",

  brand: "",

  hsnCode: "",

  sellingPrice: "",

  purchasingPrice: "",

  taxId: "",

  minimumStock: "",

  maximumStock: "",

  /*
   * IMPORTANT
   * Keep complete objects here because ProductCreate
   * SearchMultiSelect needs sizeName / sizeCode etc.
   */
  sizes: [],

  units: [],

  status: "ACTIVE",

  image: null,
};

/* =========================================================
   INITIAL STATE
   ========================================================= */

const initialState = {
  products: [],

  product: {
    ...emptyProduct,
  },

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
      state.products = [];

      state.product = {
        ...emptyProduct,
        sizes: [],
        units: [],
      };

      state.exsistingProduct = null;

      state.pagination = {
        pageNumber: 0,
        pageSize: 20,
        totalElements: 0,
        totalPages: 0,
        last: true,
      };

      state.loading = false;

      state.success = false;

      state.error = null;

      state.message = "";
    },

    /* =====================================================
       CLEAR SELECTED PRODUCT
    ===================================================== */

    clearSelectedProduct: (state) => {
      state.product = {
        ...emptyProduct,
        sizes: [],
        units: [],
      };

      state.exsistingProduct = null;
    },

    /* =====================================================
       RESET PRODUCT FORM
    ===================================================== */

    resetProductForm: (state) => {
      state.product = {
        ...emptyProduct,
        sizes: [],
        units: [],
      };

      state.exsistingProduct = null;
    },

    /* =====================================================
       SET PRODUCT FIELD
    ===================================================== */

    setProductField: (state, action) => {
      const { field, value } = action.payload;

      state.product = {
        ...(state.product || emptyProduct),
        [field]: value,
      };
    },

    /* =====================================================
       SET PRODUCT SIZES
    ===================================================== */

    setProductSizes: (state, action) => {
      state.product.sizes = Array.isArray(action.payload) ? action.payload : [];
    },

    /* =====================================================
       SET PRODUCT UNITS
    ===================================================== */

    setProductUnits: (state, action) => {
      state.product.units = Array.isArray(action.payload) ? action.payload : [];
    },

    /* =====================================================
       ADD PRODUCT SIZE
    ===================================================== */

    addProductSize: (state, action) => {
      const size = action.payload;

      if (!size) {
        return;
      }

      const sizeId = Number(size.sizeId ?? size.id);

      const exists = state.product.sizes.some(
        (item) => Number(item.sizeId ?? item.id) === sizeId,
      );

      if (!exists) {
        state.product.sizes.push(size);
      }
    },

    /* =====================================================
       REMOVE PRODUCT SIZE
    ===================================================== */

    removeProductSize: (state, action) => {
      const sizeId = Number(action.payload);

      state.product.sizes = state.product.sizes.filter(
        (item) => Number(item.sizeId ?? item.id) !== sizeId,
      );
    },

    /* =====================================================
       ADD PRODUCT UNIT
    ===================================================== */

    addProductUnit: (state, action) => {
      const unit = action.payload;

      if (!unit) {
        return;
      }

      const unitId = Number(unit.unitId ?? unit.id);

      const exists = state.product.units.some(
        (item) => Number(item.unitId ?? item.id) === unitId,
      );

      if (!exists) {
        state.product.units.push(unit);
      }
    },

    /* =====================================================
       REMOVE PRODUCT UNIT
    ===================================================== */

    removeProductUnit: (state, action) => {
      const unitId = Number(action.payload);

      state.product.units = state.product.units.filter(
        (item) => Number(item.unitId ?? item.id) !== unitId,
      );
    },
  },

  /* =======================================================
     EXTRA REDUCERS
  ======================================================= */

  extraReducers: (builder) => {
    /* =====================================================
       FETCH ALL PRODUCTS
    ===================================================== */

    builder

      .addCase(fetchAllProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = "";
      })

      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        const response = action.payload;
        const data = response?.data;

        state.products = Array.isArray(data?.content)
          ? data.content
          : Array.isArray(data)
            ? data
            : [];

        state.pagination = {
          pageNumber: data?.pageNumber ?? 0,
          pageSize: data?.pageSize ?? 20,
          totalElements: data?.totalElements ?? state.products.length,
          totalPages: data?.totalPages ?? (state.products.length > 0 ? 1 : 0),
          last: data?.last ?? true,
        };

        state.message = response?.message || "";
      })

      .addCase(fetchAllProducts.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error = action.payload || "Failed to fetch products.";

        state.message = "";
      });

    /* =====================================================
       FETCH PRODUCT BY ID
    ===================================================== */

    builder

      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = "";
      })

      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        const product = action.payload?.data || action.payload;

        state.product = product || {
          ...emptyProduct,
          sizes: [],
          units: [],
        };

        state.message = action.payload?.message || "";
      })

      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error = action.payload || "Failed to fetch product.";

        state.message = "";
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
        state.error = null;

        state.message =
          action.payload?.message || "Product created successfully.";

        const newProduct = action.payload?.data;

        if (newProduct) {
          state.product = newProduct;

          state.exsistingProduct = newProduct;

          state.products.push(newProduct);

          state.pagination.totalElements += 1;
        }
      })

      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error =
          action.payload || "Something went wrong while creating product.";

        state.message = "";
      });

    /* =====================================================
       UPDATE PRODUCT
    ===================================================== */

    builder

      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
        state.message = "";
      })

      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        state.message =
          action.payload?.message || "Product updated successfully.";

        const updatedProduct = action.payload?.data;

        if (updatedProduct) {
          state.product = updatedProduct;

          state.exsistingProduct = updatedProduct;

          const index = state.products.findIndex(
            (item) => item.id === updatedProduct.id,
          );

          if (index !== -1) {
            state.products[index] = updatedProduct;
          }
        }
      })

      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error =
          action.payload || "Something went wrong while updating product.";

        state.message = "";
      });

    /* =====================================================
       DELETE PRODUCT
    ===================================================== */

    builder

      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
        state.message = "";
      })

      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        state.message =
          action.payload?.message || "Product deleted successfully.";

        const deletedId = action.meta.arg;

        state.products = state.products.filter((item) => item.id !== deletedId);

        if (state.pagination.totalElements > 0) {
          state.pagination.totalElements -= 1;
        }

        if (state.product?.id === deletedId) {
          state.product = {
            ...emptyProduct,
            sizes: [],
            units: [],
          };
        }

        if (state.exsistingProduct?.id === deletedId) {
          state.exsistingProduct = null;
        }
      })

      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error =
          action.payload || "Something went wrong while deleting product.";

        state.message = "";
      });

    /* =====================================================
       REACTIVATE PRODUCT
    ===================================================== */

    builder

      .addCase(reactivateProduct.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
        state.message = "";
      })

      .addCase(reactivateProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        state.message =
          action.payload?.message || "Product reactivated successfully.";

        const reactivatedProduct = action.payload?.data;

        if (reactivatedProduct) {
          state.product = reactivatedProduct;

          state.exsistingProduct = reactivatedProduct;

          const index = state.products.findIndex(
            (item) => item.id === reactivatedProduct.id,
          );

          if (index !== -1) {
            state.products[index] = reactivatedProduct;
          } else {
            state.products.push(reactivatedProduct);

            state.pagination.totalElements += 1;
          }
        }
      })

      .addCase(reactivateProduct.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error =
          action.payload || "Something went wrong while reactivating product.";

        state.message = "";
      });

    /* =====================================================
       FETCH PRODUCTS BY STATUS
    ===================================================== */

    builder

      .addCase(fetchProductsByStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = "";
      })

      .addCase(fetchProductsByStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        const response = action.payload;

        const data = response?.data;

        if (data && Array.isArray(data.content)) {
          state.products = data.content;

          state.pagination = {
            pageNumber: data.pageNumber ?? 0,

            pageSize: data.pageSize ?? 20,

            totalElements: data.totalElements ?? 0,

            totalPages: data.totalPages ?? 0,

            last: data.last ?? true,
          };
        } else if (Array.isArray(data)) {
          state.products = data;

          state.pagination = {
            pageNumber: 0,

            pageSize: data.length || 20,

            totalElements: data.length,

            totalPages: data.length > 0 ? 1 : 0,

            last: true,
          };
        } else {
          state.products = [];

          state.pagination = {
            pageNumber: 0,
            pageSize: 20,
            totalElements: 0,
            totalPages: 0,
            last: true,
          };
        }

        state.message = response?.message || "";
      })

      .addCase(fetchProductsByStatus.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error = action.payload || "Failed to fetch products by status.";

        state.message = "";
      });
  },
});

/* =========================================================
   ACTIONS
   ========================================================= */

export const {
  setExsistingProduct,

  clearProductState,

  clearSelectedProduct,

  resetProductForm,

  setProductField,

  setProductSizes,

  setProductUnits,

  addProductSize,

  removeProductSize,

  addProductUnit,

  removeProductUnit,
} = productSlice.actions;

/* =========================================================
   REDUCER
   ========================================================= */

export default productSlice.reducer;
