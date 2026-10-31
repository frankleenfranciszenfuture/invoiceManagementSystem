import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    selectedPurchaseOrderView: "All Purchase Orders",

    purchaseOrderStatus: "ALL",

    search: "",

    views: [
        {
            label: "All Purchase Orders",
            value: "ALL",
        },
        {
            label: "Draft Purchase Orders",
            value: "DRAFT",
        },
        {
            label: "Confirmed Purchase Orders",
            value: "CONFIRMED",
        },
        {
            label: "Partially Received Purchase Orders",
            value: "PARTIALLY_RECEIVED",
        },
        {
            label: "Received Purchase Orders",
            value: "RECEIVED",
        },
        {
            label: "Cancelled Purchase Orders",
            value: "CANCELLED",
        },
    ],
};

const purchaseOrderViewSlice = createSlice({
    name: "purchaseOrderView",

    initialState,

    reducers: {
        // =====================================================
        // SEARCH
        // =====================================================

        setSearch(state, action) {
            state.search = action.payload;
        },

        // =====================================================
        // SELECTED VIEW
        // =====================================================

        setSelectedPurchaseOrderView(state, action) {
            state.selectedPurchaseOrderView = action.payload;
        },

        // =====================================================
        // PURCHASE ORDER STATUS
        // =====================================================

        setPurchaseOrderStatus(state, action) {
            state.purchaseOrderStatus = action.payload;
        },

        // =====================================================
        // RESET VIEW
        // =====================================================

        resetPurchaseOrderView(state) {
            state.selectedPurchaseOrderView = "All Purchase Orders";
            state.purchaseOrderStatus = "ALL";
            state.search = "";
        },
    },
});

export const {
    setSearch,
    setSelectedPurchaseOrderView,
    setPurchaseOrderStatus,
    resetPurchaseOrderView,
} = purchaseOrderViewSlice.actions;

export default purchaseOrderViewSlice.reducer;