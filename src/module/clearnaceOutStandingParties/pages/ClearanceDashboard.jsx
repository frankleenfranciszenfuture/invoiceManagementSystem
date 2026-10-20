
import React, {
    useEffect,
    useMemo,
} from "react";

import {
    useSelector,
    useDispatch,
} from "react-redux";

import {
    Plus,
    Download,
} from "lucide-react";

import toast from "react-hot-toast";

import ClearanceTable from "../pages/ClearanceTable";
import NavbarClearance from "../components/bars/nav/NavbarClearance";

import {
    fetchAllClearance,
} from "../thunks/clearanceThunks";

import {
    getUserPermission,
} from "../../menuPermission/thunks/menuPermissionThunks";

import {
    setClearanceStatus,
    setSelectedClearanceView,
} from "../slices/clearanceViewSlice";

import {
    openModal,
} from "../../ui/uiSlice";

import InvoiceSkeleton from "../../../common/loader/InvoiceSkeleton";

export default function ClearanceDashboard() {
    const dispatch = useDispatch();

    // ============================================================
    // AUTH STATE
    // ============================================================

    const user = useSelector(
        (state) => state.auth?.user
    );

    const isAuthenticated = useSelector(
        (state) => state.auth?.isAuthenticated === true
    );

    const authChecking = useSelector(
        (state) => state.auth?.authChecking === true
    );

    // ============================================================
    // PERMISSION STATE
    // ============================================================

    const permissions = useSelector((state) =>
        Array.isArray(state.menuPermission?.userPermissions)
            ? state.menuPermission.userPermissions
            : []
    );

    const permissionLoading = useSelector(
        (state) =>
            state.menuPermission?.userPermissionsLoading === true
    );

    const permissionsLoaded = useSelector(
        (state) =>
            state.menuPermission?.userPermissionsLoaded === true
    );

    // ============================================================
    // NORMALIZATION
    // ============================================================

    const normalizeModule = (value) =>
        String(value ?? "").trim().toLowerCase();

    const normalizeAction = (value) =>
        String(value ?? "").trim().toUpperCase();

    // ============================================================
    // USER ROLE
    // ============================================================

    const roleName =
        user?.roleName ||
        user?.role?.roleName ||
        user?.role?.name ||
        user?.role ||
        user?.authority ||
        "";

    const normalizedRole = normalizeAction(roleName);

    const isSuperAdmin = normalizedRole === "SUPER_ADMIN";
    const isAdmin = normalizedRole === "ADMIN";

    const hasFullAccess = isSuperAdmin || isAdmin;

    // ============================================================
    // PERMISSION HELPER
    // ============================================================

    const hasPermission = (moduleName, actionName) => {
        if (hasFullAccess) {
            return true;
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

            if (normalizeAction(permission?.status) === "INACTIVE") {
                return false;
            }

            // ACTION ARRAY
            if (Array.isArray(permission?.actions)) {
                return permission.actions.some((action) => {
                    if (typeof action === "string") {
                        return normalizeAction(action) === requestedAction;
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

                    if (normalizeAction(action?.status) === "INACTIVE") {
                        return false;
                    }

                    return (
                        permissionAction === requestedAction &&
                        allowed
                    );
                });
            }

            // FLAT ACTION
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
    };

    // ============================================================
    // CLEARANCE PERMISSIONS
    // ============================================================

    const canViewClearance = hasPermission("Clearances", "VIEW");
    const canCreateClearance = hasPermission("Clearances", "CREATE");

    // ============================================================
    // CLEARANCE REDUX STATE
    // ============================================================

    const clearancesFromRedux = useSelector(
        (state) => state.clearance?.clearances
    );

    const clearances = Array.isArray(clearancesFromRedux)
        ? clearancesFromRedux
        : [];

    const loading = useSelector(
        (state) => state.clearance?.loading ?? false
    );

    const error = useSelector(
        (state) => state.clearance?.error
    );

    // ============================================================
    // CLEARANCE VIEW STATE
    // ============================================================

    const clearanceStatus = useSelector(
        (state) => state.clearanceView?.clearanceStatus ?? "ALL"
    );

    const search = useSelector(
        (state) => state.clearanceView?.search ?? ""
    );

    // ============================================================
    // LOAD CURRENT USER PERMISSIONS
    // ============================================================

    useEffect(() => {
        if (authChecking || !isAuthenticated || hasFullAccess) {
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

    // ============================================================
    // FETCH CLEARANCES
    // ============================================================

    useEffect(() => {
        if (authChecking || !isAuthenticated) {
            return;
        }

        if (!hasFullAccess) {
            if (!permissionsLoaded || permissionLoading) {
                return;
            }

            if (!canViewClearance) {
                return;
            }
        }

        dispatch(fetchAllClearance());
    }, [
        authChecking,
        isAuthenticated,
        hasFullAccess,
        permissionsLoaded,
        permissionLoading,
        canViewClearance,
        dispatch,
    ]);

    // ============================================================
    // SYNC URL STATUS TO CLEARANCE REDUX STATE
    // Example: /clearances?status=ACTIVE
    // ============================================================

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlStatus = params.get("status");

        if (!urlStatus) {
            return;
        }

        const normalizedStatus = urlStatus.trim().toUpperCase();

        const statusLabels = {
            ALL: "All Clearances",
            ACTIVE: "Active Clearances",
            INACTIVE: "Inactive Clearances",
            DRAFT: "Draft Clearances",
        };

        if (!Object.hasOwn(statusLabels, normalizedStatus)) {
            return;
        }

        // Correct clearance slice actions
        dispatch(setClearanceStatus(normalizedStatus));
        dispatch(setSelectedClearanceView(statusLabels[normalizedStatus]));
    }, [dispatch]);

    // ============================================================
    // FILTER CLEARANCES BY STATUS AND SEARCH
    // ============================================================

    const filteredClearances = useMemo(() => {
        const selectedStatus = String(
            clearanceStatus || "ALL"
        ).trim().toUpperCase();

        const normalizedSearch = String(search || "")
            .trim()
            .toLowerCase();

        return clearances.filter((clearance) => {
            const backendStatus = String(
                clearance?.status || ""
            ).trim().toUpperCase();

            if (
                selectedStatus !== "ALL" &&
                backendStatus !== selectedStatus
            ) {
                return false;
            }

            if (!normalizedSearch) {
                return true;
            }

            const searchableFields = [
                clearance?.clearanceNo,
                clearance?.partyName,
                clearance?.partyCode,
                clearance?.partyType,
                clearance?.creditLimit,
                clearance?.clearanceAmount,
                clearance?.previousOutstandingCredit,
                clearance?.remainingOutstandingCredit,
                clearance?.availableCreditBeforeClearance,
                clearance?.availableCreditAfterClearance,
                clearance?.paymentMethod,
                clearance?.paymentReferenceNumber,
                clearance?.status,
            ];

            return searchableFields.some((value) =>
                String(value ?? "")
                    .toLowerCase()
                    .includes(normalizedSearch)
            );
        });
    }, [
        clearances,
        clearanceStatus,
        search,
    ]);

    // ============================================================
    // OPEN CREATE CLEARANCE MODAL
    // ============================================================

    const handleCreateClearance = () => {
        if (!isAuthenticated) {
            return;
        }

        if (
            !hasFullAccess &&
            (permissionLoading || !permissionsLoaded)
        ) {
            return;
        }

        if (!canCreateClearance) {
            toast.error(
                "You do not have permission to create clearances."
            );
            return;
        }

        dispatch(
            openModal({
                type: "addClearance",
            })
        );
    };

    // ============================================================
    // AUTH CHECKING
    // ============================================================

    if (authChecking) {
        return <InvoiceSkeleton />;
    }

    // ============================================================
    // NOT AUTHENTICATED
    // ============================================================

    if (!isAuthenticated) {
        return null;
    }

    // ============================================================
    // PERMISSION LOADING
    // ============================================================

    if (
        !hasFullAccess &&
        (permissionLoading || !permissionsLoaded)
    ) {
        return <InvoiceSkeleton />;
    }

    // ============================================================
    // VIEW PERMISSION DENIED
    // ============================================================

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
                            items-center justify-center rounded-full
                            bg-red-50 text-2xl font-semibold text-red-500
                        "
                    >
                        !
                    </div>

                    <h2 className="text-lg font-semibold text-gray-800">
                        Access Denied
                    </h2>

                    <p className="mt-1 max-w-sm text-sm text-gray-500">
                        You do not have permission to view clearances.
                    </p>
                </div>
            </div>
        );
    }

    // ============================================================
    // CLEARANCE LOADING
    // ============================================================

    if (loading && clearances.length === 0) {
        return <InvoiceSkeleton />;
    }

    // ============================================================
    // DASHBOARD
    // ============================================================

    return (
        <div
            className="
                flex h-screen overflow-hidden bg-gray-50
                font-sans text-[13px]
            "
        >
            <div
                className="
                    min-h-0 flex-1 overflow-y-auto bg-white
                "
            >
                <div className="w-full max-w-30xl px-2 py-5">
                    <NavbarClearance />

                    {/* ERROR */}

                    {error && (
                        <div
                            className="
                                mx-2 mt-4 rounded-md border
                                border-red-200 bg-red-50 px-4 py-3
                                text-sm text-red-600
                            "
                        >
                            {typeof error === "string"
                                ? error
                                : "Failed to load clearances."}
                        </div>
                    )}

                    {/* CLEARANCE TABLE / EMPTY STATE */}

                    {filteredClearances.length > 0 ? (
                        <ClearanceTable
                            clearances={filteredClearances}
                        />
                    ) : (
                        <div
                            className="
                                flex min-h-full flex-col items-center
                                justify-center gap-3 px-4
                            "
                        >
                            <div
                                className="
                                    relative mt-30 mb-1 flex h-24 w-24
                                    flex-shrink-0 items-center justify-center
                                    rounded-full bg-gray-100
                                "
                            >
                                <div className="text-4xl text-gray-400">
                                    C
                                </div>

                                <div
                                    className="
                                        absolute bottom-1 right-1 flex h-7 w-7
                                        items-center justify-center rounded-full
                                        bg-blue-500 text-white
                                    "
                                >
                                    <Plus className="h-4 w-4" />
                                </div>
                            </div>

                            <p className="text-center text-base font-medium text-gray-800">
                                {clearances.length > 0
                                    ? "No matching clearances found"
                                    : "Your clearances will appear here"}
                            </p>

                            <p className="max-w-sm text-center text-sm text-gray-500">
                                {clearances.length > 0
                                    ? "Try changing your search or selected status."
                                    : "Create and manage credit clearances in one place."}
                            </p>

                            <div
                                className="
                                    mt-1 flex flex-wrap items-center
                                    justify-center gap-2.5
                                "
                            >
                                {canCreateClearance && (
                                    <button
                                        type="button"
                                        onClick={handleCreateClearance}
                                        className="
                                            flex items-center gap-2 whitespace-nowrap
                                            rounded-md bg-[#2B7FFF] px-4 py-2
                                            text-sm font-medium text-white
                                            transition-colors hover:bg-blue-600
                                        "
                                    >
                                        <Plus className="h-4 w-4" />
                                        Create New Clearance
                                    </button>
                                )}

                                <button
                                    type="button"
                                    onClick={() => {
                                        toast(
                                            "Clearance import is not configured yet."
                                        );
                                    }}
                                    className="
                                        flex items-center gap-2 whitespace-nowrap
                                        rounded-md border border-gray-300 bg-white
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
