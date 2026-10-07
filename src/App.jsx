import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import { Toaster } from "react-hot-toast";
import "react-toastify/dist/ReactToastify.css";

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import { checkAuthentication } from "./module/auth/thunks/authThunks";

import LoginPage from "./module/auth/page/LoginPage";
import ProtectedRoute from "./roots/ProtectedRoute";

import Dashboard from "./module/dashboard/Dashboard";
import AppLayout from "./common/layout/AppLayout";

// =====================================================
// CUSTOMER
// =====================================================

import CustomerDashboard from "./module/customer/pages/CustomerDashboard";
import CustomerTable from "./module/customer/pages/CustomerTable";
import CreateCustomer from "./module/customer/pages/CreateCustomer";
import EditCustomer from "./module/customer/pages/EditCustomer";
import CustomerOverViewDashboard from "./module/customer/overviewCard/CustomerOverViewDashboard";

// =====================================================
// PRODUCTS / ITEMS
// =====================================================

import ProductDashboard from "./module/items/pages/productDashboard";
import ProductTable from "./module/items/pages/ProductTable";
import ProductOverViewDashboard from "./module/items/overviewCard/ProductOverViewDashboard";
import ProductCreate from "./module/items/pages/ProductCreate";
import ProductCreateSimple from "./module/items/pages/ProductCreateSimple";

// =====================================================
// TAX MASTER
// =====================================================

import TaxMasterDashboard from "./module/taxMaster/pages/TaxMasterDashboard";

// =====================================================
// SIZE / UNIT / CATEGORY
// =====================================================

import SizesDashboard from "./module/sizes/pages/SizesDashboard";
import UnitDashboard from "./module/units/pages/UnitDashboard";
import SubCategoryDashboard from "./module/subCategory/pages/SubCategoryDashboard";
import CategoryDashboard from "./module/category/pages/CategoryDashboard";

// =====================================================
// INVOICE
// =====================================================

import InvoiceCreate from "./module/invoices/pages/InvoiceCreate";
import InvoiceDashboard from "./module/invoices/pages/InvoiceDashboard";
import InvoiceOverViewDashboard from "./module/invoices/overviewCard/InvoiceOverViewDashboard";

// =====================================================
// ROLE
// =====================================================

import RoleDashboard from "./module/role/pages/RoleDashboard";
import RoleOverViewCardDashboard from "./module/role/overViewCard/roleOverViewCardDashboard";

// =====================================================
// USER
// =====================================================

import UserDashboard from "./module/users/pages/UserDashboard";
import UserOverViewCardDashboard from "./module/users/overviewCard/UserOverViewCardDashboard";

// =====================================================
// BANK ACCOUNT
// =====================================================

import BankAccountDashboard from "./module/bankAccount/pages/BankAccountDashboard";

// =====================================================
// COMPANY
// =====================================================

import CompanyDashboard from "./module/company/pages/CompanyDashboard";
import CompanyOverViewDashboard from "./module/company/overviewCard/CompanyOverViewDashboard";

// =====================================================
// MENU PERMISSION
// =====================================================

import MenuPermissions from "./module/menuPermission/pages/MenuPermission";

// =====================================================
// GLOBAL TOAST
// =====================================================

import GlobalModalToast from "./common/toast/GlobalModalToast";
import CompanyCreateSimple from "./module/company/pages/CompanyCreateSimple";
import BankAccountCreateSimple from "./module/bankAccount/pages/BankAccountCreateSimple";
import SettingsDashboard from "./common/bars/Nav/data/settings/SettingsDashboard";
import CompanyProfileOverview from "./module/company/pages/CompanyProfileOverview";
import UserProfileOverview from "./module/users/pages/UserProfileOverview";


// =====================================================
// APP CONTENT
// =====================================================

function AppContent() {
  const dispatch = useDispatch();
  const location = useLocation();

  const authChecking = useSelector(
    (state) => state.auth?.authChecking
  );

  /*
   * ============================================================
   * AUTH INITIALIZATION
   * ============================================================
   *
   * IMPORTANT:
   *
   * checkAuthentication() must run only when the application
   * initially loads.
   *
   * We must NOT execute it again after:
   *
   * LoginPage
   *      ↓
   * loginUser()
   *      ↓
   * navigate("/dashboard")
   *
   * Otherwise authentication restoration can race with the
   * newly completed login and affect permission loading.
   *
   * useRef makes this initialization happen only once.
   */

  const authenticationInitialized = useRef(false);

  useEffect(() => {
    /*
     * Already initialized.
     */
    if (authenticationInitialized.current) {
      return;
    }

    /*
     * Mark initialization immediately.
     */
    authenticationInitialized.current = true;

    /*
     * If the application starts on login page,
     * do NOT call checkAuthentication().
     *
     * LoginPage will handle loginUser().
     */
    if (location.pathname === "/login") {
      return;
    }

    /*
     * Application was opened directly on a protected route.
     *
     * Example:
     *
     * /dashboard
     * /customers
     * /items
     *
     * Restore the existing authentication session.
     */
    dispatch(checkAuthentication());
  }, [dispatch, location.pathname]);


  /*
   * ============================================================
   * INITIAL AUTH CHECK LOADING
   * ============================================================
   *
   * Only show this when the application starts on a protected
   * route and authentication is being restored.
   *
   * Login page is never blocked by this.
   */

  if (
    authChecking &&
    location.pathname !== "/login"
  ) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div
            className="
              h-8
              w-8
              animate-spin
              rounded-full
              border-4
              border-slate-200
              border-t-blue-600
            "
          />

          <p className="text-sm text-slate-500">
            Loading...
          </p>
        </div>
      </div>
    );
  }


  return (
    <Routes>

      {/* =====================================================
                  DEFAULT
          ===================================================== */}

      <Route
        path="/"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />


      {/* =====================================================
                  LOGIN
          ===================================================== */}

      <Route
        path="/login"
        element={<LoginPage />}
      />


      {/* =====================================================
                  PROTECTED APPLICATION ROUTES
          ===================================================== */}

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >

        {/* =================================================
                    DASHBOARD
            ================================================= */}

        <Route
          path="/home"
          element={<Dashboard />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />


        {/* =================================================
                    CUSTOMERS
            ================================================= */}

        <Route
          path="/customers"
          element={<CustomerDashboard />}
        />

        <Route
          path="/customers/table"
          element={<CustomerTable />}
        />

        <Route
          path="/customers/new"
          element={<CreateCustomer />}
        />

        <Route
          path="/customers/edit/:id"
          element={<EditCustomer />}
        />

        <Route
          path="/customers/view/:id"
          element={<CustomerOverViewDashboard />}
        />


        {/* =================================================
                    PRODUCTS / ITEMS
            ================================================= */}

        <Route
          path="/items"
          element={<ProductDashboard />}
        />

        <Route
          path="/items/new"
          element={<ProductCreate />}
        />

        <Route
          path="/items/editSimple/:id"
          element={<ProductCreateSimple />}
        />

        <Route
          path="/items/newSimple"
          element={<ProductCreateSimple />}
        />

        <Route
          path="/items/table"
          element={<ProductTable />}
        />

        <Route
          path="/items/view/:id"
          element={<ProductOverViewDashboard />}
        />


        {/* =================================================
                    TAX MASTER
            ================================================= */}

        <Route
          path="/taxes"
          element={<TaxMasterDashboard />}
        />


        {/* =================================================
                    SIZES
            ================================================= */}

        <Route
          path="/sizes"
          element={<SizesDashboard />}
        />


        {/* =================================================
                    UNITS
            ================================================= */}

        <Route
          path="/units"
          element={<UnitDashboard />}
        />


        {/* =================================================
                    SUB CATEGORY
            ================================================= */}

        <Route
          path="/subCategoires"
          element={<SubCategoryDashboard />}
        />


        {/* =================================================
                    CATEGORY
            ================================================= */}

        <Route
          path="/categories"
          element={<CategoryDashboard />}
        />


        {/* =================================================
                    ROLE
            ================================================= */}

        <Route
          path="/roles"
          element={<RoleDashboard />}
        />

        <Route
          path="/roles/view/:id"
          element={<RoleOverViewCardDashboard />}
        />


        {/* =================================================
                    USER
            ================================================= */}

        <Route
          path="/users"
          element={<UserDashboard />}
        />

        <Route
          path="/users/view/:id"
          element={<UserProfileOverview />}
        />


        {/* =================================================
                    BANK ACCOUNT
            ================================================= */}

        <Route
          path="/bankAccount"
          element={<BankAccountDashboard />}
        />

        <Route
          path="/bankAccount/newSimple"
          element={<BankAccountCreateSimple />}
        />

        {/* =================================================
                    COMPANY
            ================================================= */}

        <Route
          path="/companies"
          element={<CompanyDashboard />}
        />

        <Route
          path="/companies/view/:id"
          element={<CompanyProfileOverview />}
        />

        <Route
          path="/companies/view/"
          element={<CompanyProfileOverview />}
        />

        <Route
          path="/companies/newSimple"
          element={<CompanyCreateSimple />}
        />


        {/* =================================================
                    INVOICES
            ================================================= */}

        <Route
          path="/invoices/new"
          element={<InvoiceCreate />}
        />

        <Route
          path="/invoices/edit/:id"
          element={<InvoiceCreate />}
        />

        <Route
          path="/invoices"
          element={<InvoiceDashboard />}
        />

        <Route
          path="/invoices/view/:id"
          element={<InvoiceOverViewDashboard />}
        />


        {/* =================================================
                    MENU PERMISSION
            ================================================= */}

        <Route
          path="/menuPermission"
          element={<MenuPermissions />}
        />


        {/* =================================================
                    Settings
            ================================================= */}

        <Route
          path="/settings"
          element={<SettingsDashboard />}
        />

      </Route>

    </Routes>
  );
}


// =====================================================
// ROOT APP
// =====================================================

export default function App() {
  return (
    <BrowserRouter>

      <AppContent />

      {/* =====================================================
                  GLOBAL MODAL TOAST
          ===================================================== */}

      {/* 
      <GlobalModalToast />
      */}


      {/* =====================================================
                  TOAST
          ===================================================== */}

      <Toaster
        position="top-center"
        containerStyle={{
          zIndex: 99999,
        }}
        toastOptions={{
          duration: 2000,

          success: {
            style: {
              background: "#dcfce7",
              color: "#15803d",
              border: "1px solid #bbf7d0",
            },
          },

          error: {
            style: {
              background: "#ffffff",
              color: "#d00505",
              border: "1px solid #fecaca",
            },
          },
        }}
      />

    </BrowserRouter>
  );
}