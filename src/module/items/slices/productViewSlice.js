import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  productsStatus: "ALL",
  selectedProductsView: "All Products",
};

const productsViewSlice = createSlice({
  name: "productsView",
  initialState,
  reducers: {
    setProductsStatus: (state, action) => {
      state.productsStatus = action.payload;
    },

    setSelectedProductsView: (state, action) => {
      state.selectedProductsView = action.payload;
    },

    resetProductsView: (state) => {
      state.productsStatus = "ALL";
      state.selectedProductsView = "All Products";
    },
  },
});

export const { setProductsStatus, setSelectedProductsView, resetProductsView } =
  productsViewSlice.actions;

export default productsViewSlice.reducer;
