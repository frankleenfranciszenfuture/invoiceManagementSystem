import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "react-toastify/dist/ReactToastify.css";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { checkAuthentication } from "./module/auth/slice/authSlice";

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
import TaxMasterCreate from "./module/taxMaster/pages/taxMasterCreate";
import TaxMasterDashboard from "./module/taxMaster/pages/TaxMasterDashboard";

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuthentication());
  }, [dispatch]);

  return (
    <BrowserRouter>

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

                    AppLayout provides:
                    - Sidebar
                    - Navbar
                    - Main content
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
            path="/items/table"
            element={<ProductTable />}
          />

          {/* =================================================
              TAX MASTER
          ================================================= */}

          <Route
            path="/taxes"
            element={<TaxMasterDashboard />}
          />

          <Route
            path="/items/taxes"
            element={<TaxMasterCreate />}
          />
        </Route>




      </Routes>

      {/* =====================================================
                TOAST
            ===================================================== */}

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,

          success: {
            style: {
              background: "#16a34a",
              color: "#fff",
            },
          },

          error: {
            style: {
              background: "#dc2626",
              color: "#fff",
            },
          },
        }}
      />

    </BrowserRouter>
  );
}