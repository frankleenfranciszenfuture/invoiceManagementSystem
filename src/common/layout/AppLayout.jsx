
import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Outlet, useLocation } from "react-router-dom";

import Sidebar from "../bars/Sidebar";
import Navbar from "../bars/Navbar";

import {
    hideLeaveDialog,
} from "../../module/ui/uiSlice";

import {
    resetCustomerForm,
    resetDirty,
} from "../../module/customer/slices/customerSlices";

import UnsavedChangesDialog from "../dialogue/UnsavedChangesDialog";
import InvoiceSkeleton from "../loader/InvoiceSkeleton";
import Modal from "../model/Model";


export default function AppLayout() {

    const leaveDialog = useSelector(
        (state) => state.ui.leaveDialog
    );

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const sidebarOpen = useSelector(
        (state) => state.ui.sidebarOpen
    );

    const user = useSelector(
        (state) => state.auth.user
    );

    const loading = useSelector(
        (state) => state.auth.loading
    );

    const location = useLocation();

    const pageTitle =
        location.pathname === "/customers"
            ? "New Customer"
            : location.pathname === "/dashboard"
                ? "Dashboard"
                : "";

    console.log("Redux User:", user);


    if (loading) {
        return <InvoiceSkeleton />;
    }


    return (
        <div className="h-screen overflow-hidden bg-gray-50 flex">

            <Sidebar />

            <div
                className={`
                flex-1
                flex
                flex-col
                h-screen
                min-w-0
                transition-all
                duration-300
                ${sidebarOpen ? "lg:ml-60" : "lg:ml-16"}
            `}
            >
                <Navbar title={pageTitle} />

                <main className="flex-1 overflow-auto">
                    <div className="h-full">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* MUST BE HERE */}
            <Modal />

            <UnsavedChangesDialog
                open={leaveDialog.open}
                onStay={() => {
                    dispatch(hideLeaveDialog());
                }}
                onDiscard={() => {
                    dispatch(resetCustomerForm());
                    dispatch(resetDirty());

                    const route = leaveDialog.nextRoute;

                    dispatch(hideLeaveDialog());

                    navigate(route);
                }}
            />

        </div>
    );
}
