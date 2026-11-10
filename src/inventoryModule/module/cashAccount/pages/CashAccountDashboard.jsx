import React, {
    useEffect,
    useMemo,
    useCallback,
} from "react";

import {
    useSelector,
    useDispatch,
} from "react-redux";

import {
    Plus,
    Download,
    Wallet,
    Building2,
} from "lucide-react";

import toast from "react-hot-toast";

import CashAccountTable from "../pages/CashAccountTable";
import NavbarCashAccount from "../component/nav/NavbarCashAccount";

import {
    clearCashAccountError,
} from "../slices/cashAccountSlice";

import {
    openModal,
} from "../../../../module/ui/uiSlice";

import {
    getUserPermission,
} from "../../../../module/menuPermission/thunks/menuPermissionThunks";

import InvoiceSkeleton from "../../../../common/loader/InvoiceSkeleton";

import CashAccountOverview from "./CashAccountOverview";
import { useNavigate } from "react-router-dom";

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

export default function CashAccountDashboard() {

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
       CASH ACCOUNT PERMISSIONS
    ===================================================== */

    const canViewCashAccount = hasPermission(
        "Cash Accounts",
        "VIEW"
    );

    const canCreateCashAccount = hasPermission(
        "Cash Accounts",
        "CREATE"
    );

    /* =====================================================
       CASH ACCOUNT STATE
    ===================================================== */

    const cashAccountsFromRedux = useSelector(
        (state) => state.cashAccount?.cashAccounts
    );

    const cashAccounts = Array.isArray(cashAccountsFromRedux)
        ? cashAccountsFromRedux
        : EMPTY_ARRAY;

    const loading = useSelector(
        (state) => state.cashAccount?.loading === true
    );

    const error = useSelector(
        (state) => state.cashAccount?.error
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
       FILTER CASH ACCOUNTS
    ===================================================== */

    const filteredCashAccounts = useMemo(() => {

        return cashAccounts;

    }, [
        cashAccounts,
    ]);

    /* =====================================================
       OPEN CREATE CASH ACCOUNT MODAL
    ===================================================== */

    const handleCreateCashAccount = useCallback(() => {

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

        if (!canCreateCashAccount) {
            toast.error(
                "You do not have permission to create cash accounts."
            );
            return;
        }

        // dispatch(
        //     openModal({
        //         type: "addCashAccount",
        //     })
        // );
        navigate("/settings/cash-accounts/create");

    }, [
        isAuthenticated,
        hasFullAccess,
        permissionLoading,
        permissionsLoaded,
        canCreateCashAccount,
        dispatch,
    ]);

    /* =====================================================
       CLEAR ERROR
    ===================================================== */

    useEffect(() => {

        if (!error) {
            return;
        }

        const timer = setTimeout(() => {
            dispatch(clearCashAccountError());
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

    if (!canViewCashAccount) {

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
                        You do not have permission to view cash accounts.
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

                    {/* CASH ACCOUNT NAVBAR */}

                    <NavbarCashAccount />

                    {/* CASH ACCOUNT OVERVIEW */}

                    <CashAccountOverview
                        canViewCashAccount={canViewCashAccount}
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

                    {/* CASH ACCOUNT TABLE / LOADING / EMPTY STATE */}

                    {loading ? (

                        <div
                            className="
                                flex min-h-[250px]
                                items-center justify-center
                            "
                        >
                            <p className="text-sm text-gray-500">
                                Loading cash accounts...
                            </p>
                        </div>

                    ) : filteredCashAccounts.length > 0 ? (

                        <CashAccountTable
                            cashAccounts={filteredCashAccounts}
                        />

                    ) : cashAccounts.length > 0 ? (

                        // FILTERED EMPTY STATE

                        <div className="
                            flex min-h-[250px] flex-col
                            items-center justify-center gap-2
                            px-4 text-center
                        ">

                            <Building2
                                size={38}
                                className="text-gray-300"
                            />

                            <p className="
                                text-sm font-medium text-gray-700
                            ">
                                No matching companies found
                            </p>

                            <p className="
                                text-xs text-gray-400
                            ">
                                Try changing your search or status filter.
                            </p>

                        </div>

                    ) : (

                        // NO COMPANIES

                        <div className="
                            flex min-h-full flex-col
                            items-center justify-center
                            gap-3 px-4
                        ">

                            {/* EMPTY STATE ICON */}

                            <div className="
                                relative mt-10 mb-1
                                flex h-24 w-24 shrink-0
                                items-center justify-center
                                rounded-full bg-gray-100
                            ">

                                <div className="
                                    flex items-center justify-center
                                    text-gray-400
                                ">
                                    <Building2
                                        size={42}
                                        strokeWidth={1.7}
                                    />
                                </div>

                                <div className="
                                    absolute bottom-1 right-1
                                    flex h-7 w-7 items-center
                                    justify-center rounded-full
                                    bg-blue-500 text-white
                                ">
                                    <Plus className="h-4 w-4" />
                                </div>

                            </div>

                            {/* EMPTY STATE TITLE */}

                            <p
                                className="
                                    text-center text-base
                                    font-medium text-gray-500
                                "
                            >
                                No cashAccount records found
                                <span className="flex text-gray-600">
                                    Create and manage your cashAccounts details
                                </span>
                            </p>
                            {/* ACTION BUTTONS */}

                            <div className="
                                mt-1 flex flex-wrap
                                items-center justify-center gap-2.5
                            ">

                                {/* CREATE COMPANY */}

                                {canCreateCashAccount && (

                                    <button
                                        type="button"
                                        onClick={handleCreateCashAccount}
                                        className="
                                            flex items-center gap-2
                                            whitespace-nowrap rounded-md
                                            bg-blue-500 px-4 py-2
                                            text-sm font-medium text-white
                                            transition-colors hover:bg-blue-600
                                        "
                                    >
                                        <Plus className="h-4 w-4" />
                                        Create Cash Account
                                    </button>

                                )}


                            </div>

                        </div>

                    )}

                </div>

            </div>

        </div>
    );
}