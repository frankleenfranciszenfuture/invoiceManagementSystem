import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/api";

/* =========================================================
   FETCH ALL PRODUCTS
   ========================================================= */

export const fetchAllProducts = createAsyncThunk(
  "product/fetchProducts",

  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/products");

      console.log("Products:", res.data);

      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch products.",
      );
    }
  },
);

/* =========================================================
   FETCH PRODUCT BY ID
   ========================================================= */

export const fetchProductById = createAsyncThunk(
  "product/fetchProduct",

  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/products/${id}`);

      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch product.",
      );
    }
  },
);

/* =========================================================
   BUILD PRODUCT FORM DATA
   ========================================================= */

const buildProductFormData = (data) => {
  const formData = new FormData();

  /* =======================================================
     PRODUCT JSON
     ======================================================= */

  const product = {
    productName: data.productName?.trim() || "",

    subCategoryId:
      data.subCategoryId !== undefined &&
      data.subCategoryId !== null &&
      data.subCategoryId !== ""
        ? Number(data.subCategoryId)
        : null,

    brand: data.brand?.trim() || "",

    hsnCode: data.hsnCode?.trim() || "",

    sellingPrice:
      data.sellingPrice !== undefined &&
      data.sellingPrice !== null &&
      data.sellingPrice !== ""
        ? Number(data.sellingPrice)
        : null,

    purchasingPrice:
      data.purchasingPrice !== undefined &&
      data.purchasingPrice !== null &&
      data.purchasingPrice !== ""
        ? Number(data.purchasingPrice)
        : null,

    taxId:
      data.taxId !== undefined && data.taxId !== null && data.taxId !== ""
        ? Number(data.taxId)
        : null,

    minimumStock:
      data.minimumStock !== undefined &&
      data.minimumStock !== null &&
      data.minimumStock !== ""
        ? Number(data.minimumStock)
        : null,

    maximumStock:
      data.maximumStock !== undefined &&
      data.maximumStock !== null &&
      data.maximumStock !== ""
        ? Number(data.maximumStock)
        : null,

    sizeIds: Array.isArray(data.sizeIds)
      ? data.sizeIds
          .filter((id) => id !== undefined && id !== null && id !== "")
          .map(Number)
      : [],

    unitIds: Array.isArray(data.unitIds)
      ? data.unitIds
          .filter((id) => id !== undefined && id !== null && id !== "")
          .map(Number)
      : [],

    status: data.status || "ACTIVE",
  };

  /* =======================================================
     APPEND PRODUCT JSON
     ======================================================= */

  formData.append(
    "product",
    new Blob([JSON.stringify(product)], {
      type: "application/json",
    }),
  );

  /* =======================================================
     PRODUCT IMAGE
     ======================================================= */

  if (data.image instanceof File) {
    formData.append("image", data.image);
  }

  return formData;
};

/* =========================================================
   CREATE PRODUCT
   ========================================================= */

export const createProduct = createAsyncThunk(
  "product/createProduct",

  async (data, { rejectWithValue }) => {
    try {
      const formData = buildProductFormData(data);

      /* =====================================================
         DEBUG
         ===================================================== */

      console.log("CREATE PRODUCT:");

      for (const [key, value] of formData.entries()) {
        if (key === "product" && value instanceof Blob) {
          const json = await value.text();

          console.log("product JSON:", JSON.parse(json));
        } else {
          console.log(key, value);
        }
      }

      /* =====================================================
         API
         ===================================================== */

      const res = await api.post("/products", formData);

      return res.data;
    } catch (error) {
      console.error("Create product error:", error);

      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to create product.",
      );
    }
  },
);

/* =========================================================
   UPDATE PRODUCT
   ========================================================= */

export const updateProduct = createAsyncThunk(
  "product/updateProduct",

  async ({ id, data }, { rejectWithValue }) => {
    try {
      const formData = buildProductFormData(data);

      /* =====================================================
         DEBUG
         ===================================================== */

      console.log("UPDATE PRODUCT:");

      for (const [key, value] of formData.entries()) {
        if (key === "product" && value instanceof Blob) {
          const json = await value.text();

          console.log("product JSON:", JSON.parse(json));
        } else {
          console.log(key, value);
        }
      }

      /* =====================================================
         API
         ===================================================== */

      const res = await api.put(`/products/${id}`, formData);

      return res.data;
    } catch (error) {
      console.error("Update product error:", error);

      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update product.",
      );
    }
  },
);

/* =========================================================
   DELETE PRODUCT
   ========================================================= */

export const deleteProduct = createAsyncThunk(
  "product/deleteProduct",

  async (id, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/products/${id}`);

      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to delete product.",
      );
    }
  },
);

/* =========================================================
   FETCH PRODUCTS BY STATUS
   ========================================================= */

export const fetchProductsByStatus = createAsyncThunk(
  "product/fetchProductsByStatus",

  async (status, { rejectWithValue }) => {
    try {
      const res = await api.get(`/products/status/${status}`);

      console.log("Products by status:", res.data);

      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch products by status.",
      );
    }
  },
);

/* =========================================================
   REACTIVATE PRODUCT
   ========================================================= */

export const reactivateProduct = createAsyncThunk(
  "product/reactivateProduct",

  async (id, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/products/${id}/reactivate`);

      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to reactivate product.",
      );
    }
  },
);
