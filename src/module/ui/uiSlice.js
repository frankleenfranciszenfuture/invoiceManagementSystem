import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  sidebarOpen: true,

  // Common modal
  // type examples:
  // addRole, editRole, addSize, editSize,
  // addCustomer, editCustomer, createInvoice, editInvoice
  modal: {
    open: false,
    type: null,
    data: null,
  },

  showQuickAddMenu: null,

  // Leave dialog
  leaveDialog: {
    open: false,
    nextRoute: null,
  },

  // Quick modal view
  quickCreateOpen: false,

  // Profile menu
  profileMenuOpen: false,

  // Notification menu
  notificationsOpen: false,

  // Settings menu
  settingsOpen: false,

  // Invoice new menu
  invoiceNewMenuOpen: false,

  // Customer modal
  customerModalOpen: false,
  isCustomerModalOpen: false,

  // Invoice number change
  showInvoiceNumberModal: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,

  reducers: {
    // =====================================================
    // SIDEBAR
    // =====================================================

    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },

    // =====================================================
    // LEAVE DIALOG
    // =====================================================

    showLeaveDialog: (state, action) => {
      state.leaveDialog.open = true;
      state.leaveDialog.nextRoute = action.payload;
    },

    hideLeaveDialog: (state) => {
      state.leaveDialog.open = false;
      state.leaveDialog.nextRoute = null;
    },

    // =====================================================
    // COMMON MODAL
    // =====================================================

    openModal: (state, action) => {
      state.modal = {
        open: true,
        type: action.payload?.type || null,
        data: action.payload?.data || null,
      };
    },

    closeModal: (state) => {
      state.modal = {
        open: false,
        type: null,
        data: null,
      };
    },

    // =====================================================
    // QUICK CREATE
    // =====================================================

    openQuickCreate: (state) => {
      state.quickCreateOpen = true;
    },

    closeQuickCreate: (state) => {
      state.quickCreateOpen = false;
    },

    toggleQuickCreate: (state) => {
      state.quickCreateOpen = !state.quickCreateOpen;
    },

    // =====================================================
    // PROFILE MENU
    // =====================================================

    toggleProfileMenu: (state) => {
      state.profileMenuOpen = !state.profileMenuOpen;
    },

    closeProfileMenu: (state) => {
      state.profileMenuOpen = false;
    },

    // =====================================================
    // NOTIFICATIONS
    // =====================================================

    toggleNotifications: (state) => {
      state.notificationsOpen = !state.notificationsOpen;
    },

    closeNotifications: (state) => {
      state.notificationsOpen = false;
    },

    // =====================================================
    // SETTINGS
    // =====================================================

    toggleSettings: (state) => {
      state.settingsOpen = !state.settingsOpen;
    },

    closeSettingsMenu: (state) => {
      state.settingsOpen = false;
    },

    // =====================================================
    // INVOICE NEW MENU
    // =====================================================

    toggleInvoiceNewMenuOpen: (state) => {
      state.invoiceNewMenuOpen = !state.invoiceNewMenuOpen;
    },

    closeInvoiceNewMenuOpen: (state) => {
      state.invoiceNewMenuOpen = false;
    },

    // =====================================================
    // CUSTOMER MODAL
    // =====================================================

    openCustomerModal: (state) => {
      state.customerModalOpen = true;
      state.isCustomerModalOpen = true;
    },

    closeCustomerModal: (state) => {
      state.customerModalOpen = false;
      state.isCustomerModalOpen = false;
    },

    // =====================================================
    // INVOICE NUMBER MODAL
    // =====================================================

    openInvoiceNumberModal: (state) => {
      state.showInvoiceNumberModal = true;
    },

    closeInvoiceNumberModal: (state) => {
      state.showInvoiceNumberModal = false;
    },
  },
});

export const {
  // Sidebar
  toggleSidebar,

  // Common modal
  openModal,
  closeModal,

  // Leave dialog
  showLeaveDialog,
  hideLeaveDialog,

  // Quick create
  openQuickCreate,
  closeQuickCreate,
  toggleQuickCreate,

  // Profile
  toggleProfileMenu,
  closeProfileMenu,

  // Notifications
  toggleNotifications,
  closeNotifications,

  // Settings
  toggleSettings,
  closeSettingsMenu,

  // Invoice new menu
  toggleInvoiceNewMenuOpen,
  closeInvoiceNewMenuOpen,

  // Customer modal
  openCustomerModal,
  closeCustomerModal,

  // Invoice number modal
  openInvoiceNumberModal,
  closeInvoiceNumberModal,
} = uiSlice.actions;

export default uiSlice.reducer;
