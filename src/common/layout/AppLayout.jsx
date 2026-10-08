// import React from "react";

// import { useNavigate } from "react-router-dom";

// import {
//     useSelector,
//     useDispatch,
// } from "react-redux";

// import {
//     Outlet,
//     useLocation,
// } from "react-router-dom";

// import Sidebar from "../bars/Sidebar";
// import Navbar from "../bars/Navbar";

// import {
//     hideLeaveDialog,
// } from "../../module/ui/uiSlice";

// import {
//     resetCustomerForm,
//     resetDirty,
// } from "../../module/customer/slices/customerSlices";

// import UnsavedChangesDialog from "../dialogue/UnsavedChangesDialog";
// import Modal from "../model/Model";


// export default function AppLayout() {

//     // ============================================================
//     // REDUX
//     // ============================================================

//     const dispatch = useDispatch();

//     const navigate = useNavigate();


//     // ============================================================
//     // LOCATION
//     // ============================================================

//     const location = useLocation();


//     // ============================================================
//     // SIDEBAR
//     // ============================================================

//     const sidebarOpen = useSelector(
//         (state) =>
//             state.ui?.sidebarOpen
//     );


//     // ============================================================
//     // AUTH USER
//     // ============================================================

//     const user = useSelector(
//         (state) =>
//             state.auth?.user
//     );


//     // ============================================================
//     // AUTH STATE
//     // ============================================================

//     const isAuthenticated = useSelector(
//         (state) =>
//             state.auth?.isAuthenticated === true
//     );

//     const authChecking = useSelector(
//         (state) =>
//             state.auth?.authChecking === true
//     );


//     // ============================================================
//     // LEAVE DIALOG
//     // ============================================================

//     const leaveDialog = useSelector(
//         (state) =>
//             state.ui?.leaveDialog
//     );


//     // ============================================================
//     // PAGE TITLE
//     // ============================================================

//     const pageTitle =
//         location.pathname === "/customers"
//             ? "New Customer"
//             : location.pathname === "/dashboard"
//                 ? "Dashboard"
//                 : "";


//     // ============================================================
//     // DEBUG
//     // ============================================================

//     React.useEffect(() => {

//         console.log(
//             "========== APP LAYOUT AUTH =========="
//         );

//         console.log(
//             "Authenticated:",
//             isAuthenticated
//         );

//         console.log(
//             "Auth Checking:",
//             authChecking
//         );

//         console.log(
//             "Redux User:",
//             user
//         );

//         console.log(
//             "Role:",
//             user?.roleName ||
//             user?.role?.roleName ||
//             user?.role
//         );

//         console.log(
//             "====================================="
//         );

//     }, [
//         isAuthenticated,
//         authChecking,
//         user,
//     ]);


//     // ============================================================
//     // AUTH CHECK
//     // ============================================================

//     /*
//      * ProtectedRoute already handles authentication.
//      *
//      * This additional guard prevents AppLayout from rendering
//      * application content before authentication is ready.
//      */

//     if (authChecking) {

//         return (
//             <div
//                 className="
//                     flex
//                     h-screen
//                     w-full
//                     items-center
//                     justify-center
//                     bg-white
//                 "
//             >

//                 <div
//                     className="
//                         text-sm
//                         text-gray-500
//                     "
//                 >
//                     Checking authentication...
//                 </div>

//             </div>
//         );
//     }


//     // ============================================================
//     // NOT AUTHENTICATED
//     // ============================================================

//     /*
//      * Normally ProtectedRoute catches this first.
//      *
//      * This is only a safety guard.
//      */

//     if (!isAuthenticated) {
//         return null;
//     }


//     // ============================================================
//     // MAIN LAYOUT
//     // ============================================================

//     return (
//         <div
//             className="
//                 flex
//                 h-screen
//                 overflow-hidden
//                 bg-gray-50
//             "
//         >

//             {/* ====================================================
//                 SIDEBAR
//             ==================================================== */}

//             <Sidebar />


//             {/* ====================================================
//                 MAIN CONTENT
//             ==================================================== */}

//             <div
//                 className={`
//                     flex
//                     min-w-0
//                     flex-1
//                     flex-col
//                     h-screen
//                     transition-all
//                     duration-300

//                     ${sidebarOpen
//                         ? "lg:ml-54"
//                         : "lg:ml-14"
//                     }
//                 `}
//             >

//                 {/* ==================================================
//                     NAVBAR
//                 ================================================== */}

//                 <Navbar
//                     title={pageTitle}
//                 />


//                 {/* ==================================================
//                     PAGE CONTENT
//                 ================================================== */}

//                 <main
//                     className="
//                         flex-1
//                         overflow-auto
//                     "
//                 >

//                     <div
//                         className="
//                             h-full
//                         "
//                     >
//                         <Outlet />
//                     </div>

//                 </main>

//             </div>


//             {/* ====================================================
//                 GLOBAL MODAL
//             ==================================================== */}

//             <Modal />


//             {/* ====================================================
//                 UNSAVED CHANGES
//             ==================================================== */}

//             <UnsavedChangesDialog
//                 open={
//                     leaveDialog?.open
//                 }

//                 onStay={() => {

//                     dispatch(
//                         hideLeaveDialog()
//                     );

//                 }}

//                 onDiscard={() => {

//                     dispatch(
//                         resetCustomerForm()
//                     );

//                     dispatch(
//                         resetDirty()
//                     );


//                     const route =
//                         leaveDialog?.nextRoute;


//                     dispatch(
//                         hideLeaveDialog()
//                     );


//                     if (route) {

//                         navigate(
//                             route
//                         );

//                     }

//                 }}
//             />

//         </div>
//     );
// }

import React from "react";

import {
    Outlet,
    useLocation,
    useNavigate,
} from "react-router-dom";

import { useSelector, useDispatch } from "react-redux";

import Sidebar from "../bars/Sidebar";
import Navbar from "../bars/Navbar";

import { hideLeaveDialog } from "../../module/ui/uiSlice";

import {
    resetCustomerForm,
    resetDirty,
} from "../../module/customer/slices/customerSlices";

import UnsavedChangesDialog from "../dialogue/UnsavedChangesDialog";
import Modal from "../model/Model";


// ============================================================
// PAGE TITLES
// ============================================================
/*
 * The longest matching path wins, so "/customers/new" beats "/customers".
 * Add new routes here.
 */

const PAGE_TITLES = [
    ["/dashboard", "Dashboard"],
    ["/customers/new", "New customer"],
    ["/customers", "Customers"],
    ["/items/newSimple", "New item"],
    ["/items", "Items"],
    ["/invoices/new", "New invoice"],
    ["/invoices", "Invoices"],
    ["/payments/new", "New payment"],
    ["/payments", "Payments"],
];

const getPageTitle = (pathname) => {
    const match = PAGE_TITLES
        .filter(
            ([path]) =>
                pathname === path || pathname.startsWith(`${path}/`)
        )
        .sort((a, b) => b[0].length - a[0].length)[0];

    return match ? match[1] : "";
};


export default function AppLayout() {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();


    // ---------- STORE ----------

    const sidebarOpen = useSelector((state) => state.ui?.sidebarOpen);
    const leaveDialog = useSelector((state) => state.ui?.leaveDialog);

    const isAuthenticated = useSelector(
        (state) => state.auth?.isAuthenticated === true
    );

    const authChecking = useSelector(
        (state) => state.auth?.authChecking === true
    );

    const pageTitle = getPageTitle(location.pathname);


    // ---------- AUTH GUARDS ----------
    // ProtectedRoute handles auth first; these are safety guards.

    if (authChecking) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-50">
                <div className="flex items-center gap-3 text-sm text-slate-500">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-500" />
                    Checking authentication...
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }


    // ---------- LAYOUT ----------

    return (
        <div
            className="
                flex h-screen overflow-hidden
                bg-gradient-to-br from-slate-50 via-slate-50 to-indigo-50
            "
        >

            {/* SIDEBAR (fixed: w-64 open, w-[72px] collapsed) */}
            <Sidebar />


            {/* MAIN CONTENT: margin always matches the sidebar width */}
            <div
                className={`
                    flex h-screen min-w-0 flex-1 flex-col
                    transition-[margin] duration-300
                    ${sidebarOpen ? "ml-[92px] lg:ml-60" : "ml-[92px]"}
                `}
            >

                <Navbar title={pageTitle} />

                <main className="flex-1 overflow-auto">
                    <div className="h-full">
                        <Outlet />
                    </div>
                </main>

            </div>


            {/* GLOBAL MODAL */}
            <Modal />


            {/* UNSAVED CHANGES (the only place it is rendered) */}
            <UnsavedChangesDialog
                open={leaveDialog?.open}

                onStay={() => {
                    dispatch(hideLeaveDialog());
                }}

                onDiscard={() => {
                    dispatch(resetCustomerForm());
                    dispatch(resetDirty());

                    const route = leaveDialog?.nextRoute;

                    dispatch(hideLeaveDialog());

                    if (route) {
                        navigate(route);
                    }
                }}
            />

        </div>
    );
}