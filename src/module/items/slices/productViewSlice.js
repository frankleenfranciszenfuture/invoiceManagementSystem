import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedProductView: "All Products",
  productStatus: "ALL",
  search: "",
  views: [
    { label: "All Products", value: "ALL" },
    { label: "Active Products", value: "ACTIVE" },
    { label: "Inactive Products", value: "INACTIVE" },
    { label: "Draft Products", value: "DRAFT" },
  ],
};

const productViewSlice = createSlice({
  name: "productView",

  initialState,

  reducers: {
    setSearch(state, action) {
      state.search = action.payload;
    },

    setSelectedProductView(state, action) {
      state.selectedProductView = action.payload;
    },

    setProductStatus(state, action) {
      state.productStatus = action.payload;
    },

    resetProductView(state) {
      state.selectedProductView = "All Products";
      state.productStatus = "ALL";
      state.search = "";
    },
  },
});

export const {
  setSearch,
  setSelectedProductView,
  setProductStatus,
  resetProductView,
} = productViewSlice.actions;

export default productViewSlice.reducer;
