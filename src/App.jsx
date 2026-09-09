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
import CustomerDashboard from "./module/customer/pages/CustomerDashboard";
import CustomerTable from "./module/customer/pages/CustomerTable";
import CreateCustomer from "./module/customer/pages/CreateCustomer";
import EditCustomer from "./module/customer/pages/EditCustomer";
import CustomerOverViewDashboard from "./module/customer/overviewCard/CustomerOverViewDashboard";


export default function App() {

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuthentication());
  }, [dispatch]);

  return (


    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/login" element={<LoginPage />} />

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/home" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Cutomers */}
          <Route path="/customers" element={<CustomerDashboard />} />
          <Route path="/customers/table" element={<CustomerTable />} />
          <Route path="/customers/new" element={<CreateCustomer />} />
          <Route path="/customers/edit/:id" element={<EditCustomer />} />

          {/* Custoemr OverviewCard */}
          <Route path="/customers/view/:id" element={<CustomerOverViewDashboard />} />
          <Route path="/customers/view/customers?status:id" element={<CustomerOverViewDashboard />} />
        </Route>
      </Routes>

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
  )
}
