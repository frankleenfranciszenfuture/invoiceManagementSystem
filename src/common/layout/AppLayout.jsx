import React from "react";

import { useNavigate } from "react-router-dom";

import {
    useSelector,
    useDispatch,
} from "react-redux";

import {
    Outlet,
    useLocation,
} from "react-router-dom";

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
import Modal from "../model/Model";


export default function AppLayout() {

    // ============================================================
    // REDUX
    // ============================================================

    const dispatch = useDispatch();

    const navigate = useNavigate();


    // ============================================================
    // LOCATION
    // ============================================================

    const location = useLocation();


    // ============================================================
    // SIDEBAR
    // ============================================================

    const sidebarOpen = useSelector(
        (state) =>
            state.ui?.sidebarOpen
    );


    // ============================================================
    // AUTH USER
    // ============================================================

    const user = useSelector(
        (state) =>
            state.auth?.user
    );


    // ============================================================
    // AUTH STATE
    // ============================================================

    const isAuthenticated = useSelector(
        (state) =>
            state.auth?.isAuthenticated === true
    );

    const authChecking = useSelector(
        (state) =>
            state.auth?.authChecking === true
    );


    // ============================================================
    // LEAVE DIALOG
    // ============================================================

    const leaveDialog = useSelector(
        (state) =>
            state.ui?.leaveDialog
    );


    // ============================================================
    // PAGE TITLE
    // ============================================================

    const pageTitle =
        location.pathname === "/customers"
            ? "New Customer"
            : location.pathname === "/dashboard"
                ? "Dashboard"
                : "";


    // ============================================================
    // DEBUG
    // ============================================================

    React.useEffect(() => {

        console.log(
            "========== APP LAYOUT AUTH =========="
        );

        console.log(
            "Authenticated:",
            isAuthenticated
        );

        console.log(
            "Auth Checking:",
            authChecking
        );

        console.log(
            "Redux User:",
            user
        );

        console.log(
            "Role:",
            user?.roleName ||
            user?.role?.roleName ||
            user?.role
        );

        console.log(
            "====================================="
        );

    }, [
        isAuthenticated,
        authChecking,
        user,
    ]);


    // ============================================================
    // AUTH CHECK
    // ============================================================

    /*
     * ProtectedRoute already handles authentication.
     *
     * This additional guard prevents AppLayout from rendering
     * application content before authentication is ready.
     */

    if (authChecking) {

        return (
            <div
                className="
                    flex
                    h-screen
                    w-full
                    items-center
                    justify-center
                    bg-white
                "
            >

                <div
                    className="
                        text-sm
                        text-gray-500
                    "
                >
                    Checking authentication...
                </div>

            </div>
        );
    }


    // ============================================================
    // NOT AUTHENTICATED
    // ============================================================

    /*
     * Normally ProtectedRoute catches this first.
     *
     * This is only a safety guard.
     */

    if (!isAuthenticated) {
        return null;
    }


    // ============================================================
    // MAIN LAYOUT
    // ============================================================

    return (
        <div
            className="
                flex
                h-screen
                overflow-hidden
                bg-gray-50
            "
        >

            {/* ====================================================
                SIDEBAR
            ==================================================== */}

            <Sidebar />


            {/* ====================================================
                MAIN CONTENT
            ==================================================== */}

            <div
                className={`
                    flex
                    min-w-0
                    flex-1
                    flex-col
                    h-screen
                    transition-all
                    duration-300

                    ${sidebarOpen
                        ? "lg:ml-54"
                        : "lg:ml-14"
                    }
                `}
            >

                {/* ==================================================
                    NAVBAR
                ================================================== */}

                <Navbar
                    title={pageTitle}
                />


                {/* ==================================================
                    PAGE CONTENT
                ================================================== */}

                <main
                    className="
                        flex-1
                        overflow-auto
                    "
                >

                    <div
                        className="
                            h-full
                        "
                    >
                        <Outlet />
                    </div>

                </main>

            </div>


            {/* ====================================================
                GLOBAL MODAL
            ==================================================== */}

            <Modal />


            {/* ====================================================
                UNSAVED CHANGES
            ==================================================== */}

            <UnsavedChangesDialog
                open={
                    leaveDialog?.open
                }

                onStay={() => {

                    dispatch(
                        hideLeaveDialog()
                    );

                }}

                onDiscard={() => {

                    dispatch(
                        resetCustomerForm()
                    );

                    dispatch(
                        resetDirty()
                    );


                    const route =
                        leaveDialog?.nextRoute;


                    dispatch(
                        hideLeaveDialog()
                    );


                    if (route) {

                        navigate(
                            route
                        );

                    }

                }}
            />

        </div>
    );
}