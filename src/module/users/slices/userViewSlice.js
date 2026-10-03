import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedUserView: "All Users",

  userStatus: "ALL",

  search: "",

  views: [
    {
      label: "All Users",
      value: "ALL",
    },
    {
      label: "Active Users",
      value: "ACTIVE",
    },
    {
      label: "Inactive Users",
      value: "INACTIVE",
    },
    {
      label: "Draft Users",
      value: "DRAFT",
    },
  ],
};

const userViewSlice = createSlice({
  name: "userView",

  initialState,

  reducers: {
    /* =====================================================
       SEARCH
    ===================================================== */

    setSearch(state, action) {
      state.search = action.payload;
    },

    /* =====================================================
       SELECTED VIEW
    ===================================================== */

    setSelectedUserView(state, action) {
      state.selectedUserView = action.payload;
    },

    /* =====================================================
       USER STATUS
    ===================================================== */

    setUserStatus(state, action) {
      state.userStatus = action.payload;
    },

    /* =====================================================
       RESET VIEW
    ===================================================== */

    resetUserView(state) {
      state.selectedUserView = "All Users";
      state.userStatus = "ALL";
      state.search = "";
    },
  },
});

export const { setSearch, setSelectedUserView, setUserStatus, resetUserView } =
  userViewSlice.actions;

export default userViewSlice.reducer;
