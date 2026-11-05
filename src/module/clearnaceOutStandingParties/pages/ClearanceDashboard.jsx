
import React, {
    useEffect,
    useMemo,
    useCallback,
} from "react";

import {
    useSelector,
    useDispatch,
} from "react-redux";

import { useNavigate } from "react-router-dom";

import {
    Plus,
    Download,
    Wallet,
} from "lucide-react";

import toast from "react-hot-toast";

import ClearanceTable from "../pages/ClearanceTable";
import NavbarClearance from "../components/bars/nav/NavbarClearance";

import {
    clearError,
} from "../slices/clearanceSlice";

import {
    getUserPermission,
} from "../../menuPermission/thunks/menuPermissionThunks";

import InvoiceSkeleton from "../../../common/loader/InvoiceSkeleton";

import ClearanceOverview from "../pages/ClearanceOverview";

/* =========================================================
   CONSTANTS
========================================================= */

const EMPTY_ARRAY = [];

/* =========================================================
   NORMALIZE HELPERS
========================================================= */

const normalizeModule = (value) =>
    String(value ?? "").trim().toLowerCase();

const normalizeAction = (value) =>
    String(value ?? "").trim().toUpperCase();

/* =========================================================
   COMPONENT
========================================================= */

export default function ClearanceDashboard() {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    /* =====================================================
       AUTH STATE
    ===================================================== */

    const user = useSelector(
        (state) => state.auth?.user
    );

    const isAuthenticated = useSelector(
        (state) => state.auth?.isAuthenticated === true
    );

    const authChecking = useSelector(
        (state) => state.auth?.authChecking === true
    );

    /* =====================================================
       PERMISSION STATE
    ===================================================== */

    const permissions = useSelector(
        (state) => {
            const value = state.menuPermission?.userPermissions;

            return Array.isArray(value)
                ? value
                : EMPTY_ARRAY;
        }
    );

    const permissionLoading = useSelector(
        (state) =>
            state.menuPermission?.userPermissionsLoading === true
    );

    const permissionsLoaded = useSelector(
        (state) =>
            state.menuPermission?.userPermissionsLoaded === true
    );

    /* =====================================================
       ROLE
    ===================================================== */

    const roleName =
        user?.roleName ||
        user?.role?.roleName ||
        user?.role?.name ||
        user?.role ||
        user?.authority ||
        "";

    const normalizedRole = normalizeAction(roleName);

    const hasFullAccess =
        normalizedRole === "SUPER_ADMIN" ||
        normalizedRole === "ADMIN";

    /* =====================================================
       PERMISSION CHECK
    ===================================================== */

    const hasPermission = useCallback(
        (moduleName, actionName) => {

            if (hasFullAccess) {
                return true;
            }

            if (!Array.isArray(permissions)) {
                return false;
            }

            const requestedModule = normalizeModule(moduleName);
            const requestedAction = normalizeAction(actionName);

            return permissions.some((permission) => {

                const permissionModule = normalizeModule(
                    permission?.moduleName ||
                    permission?.module?.moduleName ||
                    permission?.module?.name ||
                    ""
                );

                if (permissionModule !== requestedModule) {
                    return false;
                }

                if (permission?.active === false) {
                    return false;
                }

                if (
                    normalizeAction(permission?.status) === "INACTIVE"
                ) {
                    return false;
                }

                /* ACTION ARRAY */

                if (Array.isArray(permission?.actions)) {

                    return permission.actions.some((action) => {

                        if (typeof action === "string") {
                            return (
                                normalizeAction(action) === requestedAction
                            );
                        }

                        const permissionAction = normalizeAction(
                            action?.actionName ||
                            action?.action?.actionName ||
                            action?.action?.name ||
                            action?.name ||
                            ""
                        );

                        const allowed =
                            action?.allowed === true ||
                            action?.allowed === "true";

                        if (action?.active === false) {
                            return false;
                        }

                        if (
                            normalizeAction(action?.status) === "INACTIVE"
                        ) {
                            return false;
                        }

                        return (
                            permissionAction === requestedAction &&
                            allowed
                        );
                    });
                }

                /* DIRECT / FLAT ACTION */

                const permissionAction = normalizeAction(
                    permission?.actionName ||
                    permission?.action?.actionName ||
                    permission?.action?.name ||
                    ""
                );

                const allowed =
                    permission?.allowed === true ||
                    permission?.allowed === "true";

                return (
                    permissionAction === requestedAction &&
                    allowed
                );
            });

        },
        [
            hasFullAccess,
            permissions,
        ]
    );

    /* =====================================================
       CLEARANCE PERMISSIONS
    ===================================================== */

    const canViewClearance = hasPermission(
        "Credit Clearance",
        "VIEW"
    );

    const canCreateClearance = hasPermission(
        "Credit Clearance",
        "CREATE"
    );

    /* =====================================================
       CLEARANCE STATE
    ===================================================== */

    const clearancesFromRedux = useSelector(
        (state) => state.clearance?.clearances
    );

    const clearances = Array.isArray(clearancesFromRedux)
        ? clearancesFromRedux
        : EMPTY_ARRAY;

    const loading = useSelector(
        (state) => state.clearance?.loading === true
    );

    const error = useSelector(
        (state) => state.clearance?.error
    );

    /* =====================================================
       CLEARANCE VIEW STATE
    ===================================================== */

    const clearanceStatus = useSelector(
        (state) => state.clearanceView?.clearanceStatus || "ALL"
    );

    const search = useSelector(
        (state) => state.clearanceView?.search || ""
    );

    /* =====================================================
       LOAD USER PERMISSIONS
    ===================================================== */

    useEffect(() => {

        if (authChecking || !isAuthenticated) {
            return;
        }

        // Admin and Super Admin have full access.
        if (hasFullAccess) {
            return;
        }

        if (permissionsLoaded || permissionLoading) {
            return;
        }

        dispatch(getUserPermission());

    }, [
        authChecking,
        isAuthenticated,
        hasFullAccess,
        permissionsLoaded,
        permissionLoading,
        dispatch,
    ]);

    /* =====================================================
       FILTER CLEARANCES BY STATUS AND SEARCH
    ===================================================== */

    const filteredClearances = useMemo(() => {

        const selectedStatus = String(
            clearanceStatus || "ALL"
        )
            .trim()
            .toUpperCase();

        const searchValue = String(search ?? "")
            .trim()
            .toLowerCase();

        return clearances.filter((clearance) => {

            // STATUS FILTER
            if (
                selectedStatus !== "ALL" &&
                String(clearance?.status ?? "")
                    .trim()
                    .toUpperCase() !== selectedStatus
            ) {
                return false;
            }

            // SEARCH FILTER
            if (searchValue) {

                const searchableValues = [
                    clearance?.clearanceNo,
                    clearance?.partyName,
                    clearance?.partyCode,
                    clearance?.partyType,
                    clearance?.paymentMethod,
                    clearance?.paymentReferenceNumber,
                    clearance?.remarks,
                    clearance?.clearanceDate,
                ];

                const matchesSearch = searchableValues.some((value) =>
                    String(value ?? "")
                        .toLowerCase()
                        .includes(searchValue)
                );

                if (!matchesSearch) {
                    return false;
                }
            }

            return true;
        });

    }, [
        clearances,
        clearanceStatus,
        search,
    ]);

    /* =====================================================
       OPEN CREATE CLEARANCE PAGE
    ===================================================== */

    const handleCreateClearance = useCallback(() => {

        if (!isAuthenticated) {
            return;
        }

        if (
            !hasFullAccess &&
            (
                permissionLoading ||
                !permissionsLoaded
            )
        ) {
            return;
        }

        if (!canCreateClearance) {
            toast.error(
                "You do not have permission to create credit clearances."
            );
            return;
        }

        navigate("/clearances/create");

    }, [
        isAuthenticated,
        hasFullAccess,
        permissionLoading,
        permissionsLoaded,
        canCreateClearance,
        navigate,
    ]);

    /* =====================================================
       CLEAR ERROR
    ===================================================== */

    useEffect(() => {

        if (!error) {
            return;
        }

        const timer = setTimeout(() => {
            dispatch(clearError());
        }, 2000);

        return () => clearTimeout(timer);

    }, [
        error,
        dispatch,
    ]);

    /* =====================================================
       AUTH CHECKING
    ===================================================== */

    if (authChecking) {
        return <InvoiceSkeleton />;
    }

    /* =====================================================
       NOT AUTHENTICATED
    ===================================================== */

    if (!isAuthenticated) {
        return null;
    }

    /* =====================================================
       PERMISSION LOADING
    ===================================================== */

    if (
        !hasFullAccess &&
        (
            permissionLoading ||
            !permissionsLoaded
        )
    ) {
        return <InvoiceSkeleton />;
    }

    /* =====================================================
       VIEW PERMISSION DENIED
    ===================================================== */

    if (!canViewClearance) {

        return (
            <div
                className="
                    flex h-screen items-center justify-center
                    bg-gray-50 font-sans
                "
            >
                <div className="px-6 text-center">

                    <div
                        className="
                            mx-auto mb-4 flex h-16 w-16
                            items-center justify-center
                            rounded-full bg-red-50
                            text-2xl font-semibold text-red-500
                        "
                    >
                        !
                    </div>

                    <h2 className="text-lg font-semibold text-gray-800">
                        Access Denied
                    </h2>

                    <p className="mt-1 max-w-sm text-sm text-gray-500">
                        You do not have permission to view credit clearances.
                    </p>

                </div>
            </div>
        );
    }

    /* =====================================================
       PAGE
    ===================================================== */

    return (

        <div
            className="
                flex h-screen overflow-hidden
                bg-gray-50 font-sans text-[13px]
            "
        >

            <div
                className="
                    min-h-0 flex-1 overflow-y-auto bg-white
                "
            >

                <div
                    className="
                        w-full max-w-30xl px-2 py-5
                    "
                >

                    {/* CLEARANCE NAVBAR */}

                    <NavbarClearance />

                    {/* CLEARANCE OVERVIEW */}

                    <ClearanceOverview
                        canViewClearance={canViewClearance}
                        isAuthenticated={isAuthenticated}
                        authChecking={authChecking}
                    />

                    {/* ERROR */}

                    {error && (

                        <div
                            className="
                                mx-2 mt-4 rounded-md
                                border border-red-200
                                bg-red-50 px-4 py-3
                                text-sm text-red-600
                            "
                        >
                            {error}
                        </div>

                    )}

                    {/* CLEARANCE TABLE / LOADING / EMPTY STATE */}

                    {loading ? (

                        <div
                            className="
                                flex min-h-[250px]
                                items-center justify-center
                            "
                        >
                            <p className="text-sm text-gray-500">
                                Loading credit clearances...
                            </p>
                        </div>

                    ) : filteredClearances.length > 0 ? (

                        <ClearanceTable
                            clearances={filteredClearances}
                        />

                    ) : (

                        <div
                            className="
                                flex min-h-full flex-col
                                items-center justify-center
                                gap-3 px-4
                            "
                        >

                            {/* EMPTY STATE ICON */}

                            <div
                                className="
                                    relative mt-30 mb-1
                                    flex h-24 w-24 shrink-0
                                    items-center justify-center
                                    rounded-full bg-gray-100
                                "
                            >

                                <div
                                    className="
                                        flex items-center justify-center
                                        text-gray-400
                                    "
                                >
                                    <Wallet
                                        size={42}
                                        strokeWidth={1.7}
                                    />
                                </div>

                                <div
                                    className="
                                        absolute bottom-1 right-1
                                        flex h-7 w-7 items-center
                                        justify-center rounded-full
                                        bg-blue-500 text-white
                                    "
                                >
                                    <Plus className="h-4 w-4" />
                                </div>

                            </div>

                            {/* EMPTY STATE TITLE */}

                            <p
                                className="
                                    text-center text-base
                                    font-medium text-gray-800
                                "
                            >
                                Manage your credit clearances
                            </p>

                            {/* EMPTY STATE DESCRIPTION */}

                            <p
                                className="
                                    max-w-sm text-center
                                    text-sm text-gray-500
                                "
                            >
                                Track customer and supplier credit
                                payments, monitor outstanding balances,
                                and manage your credit clearances in one place.
                            </p>

                            {/* ACTION BUTTONS */}

                            <div
                                className="
                                    mt-1 flex flex-wrap
                                    items-center justify-center gap-2.5
                                "
                            >

                                {/* CREATE CLEARANCE */}

                                {canCreateClearance && (

                                    <button
                                        type="button"
                                        onClick={handleCreateClearance}
                                        className="
                                            flex items-center gap-2
                                            whitespace-nowrap rounded-md
                                            bg-blue-500 px-4 py-2
                                            text-sm font-medium text-white
                                            transition-colors hover:bg-blue-600
                                        "
                                    >
                                        <Plus className="h-4 w-4" />
                                        Create New Clearance
                                    </button>

                                )}

                                {/* IMPORT */}

                                <button
                                    type="button"
                                    onClick={() => {
                                        toast(
                                            "Credit clearance import is not configured yet."
                                        );
                                    }}
                                    className="
                                        flex items-center gap-2
                                        whitespace-nowrap rounded-md
                                        border border-gray-300 bg-white
                                        px-4 py-2 text-sm text-gray-700
                                        transition-colors hover:bg-gray-50
                                    "
                                >
                                    <Download className="h-4 w-4" />
                                    Import File
                                </button>

                            </div>

                        </div>

                    )}

                </div>

            </div>

        </div>
    );
}
