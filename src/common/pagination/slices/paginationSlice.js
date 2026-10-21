import { createSlice } from "@reduxjs/toolkit";

const createPageState = () => ({
  page: 0,
  size: 20,
  totalElements: 0,
  totalPages: 0,
});

const initialState = {
  invoices: createPageState(),
  customers: createPageState(),
  items: createPageState(),
  payments: createPageState(),
};

const paginationSlice = createSlice({
  name: "pagination",
  initialState,
  reducers: {
    setPage(state, action) {
      const { module, page } = action.payload;

      if (state[module]) {
        state[module].page = Math.max(0, page);
      }
    },

    setPageSize(state, action) {
      const { module, size } = action.payload;

      if (state[module] && size > 0) {
        state[module].size = size;
        state[module].page = 0;
      }
    },

    setPageMetadata(state, action) {
      const { module, metadata } = action.payload;

      if (state[module]) {
        Object.assign(state[module], metadata);
      }
    },

    resetPagination(state, action) {
      const module = action.payload;

      if (state[module]) {
        state[module] = createPageState();
      }
    },
  },
});

export const { setPage, setPageSize, setPageMetadata, resetPagination } =
  paginationSlice.actions;

export default paginationSlice.reducer;
