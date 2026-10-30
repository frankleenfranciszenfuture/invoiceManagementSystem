
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
    Landmark,
} from "lucide-react";

import toast from "react-hot-toast";

import WarehouseTable
    from "../pages/WarehouseTable";

import NavbarWarehouse
    from "../component/nav/NavbarWarehouse";

import {
    fetchAllWarehouse,
} from "../thunks/warehouseThunks";

import {
    setWarehousesStatus,
    setSelectedWarehousesView,
} from "../../warehouse/slices/warehouseViewSlice";

import {
    clearWarehouseError,
} from "../slices/warehouseSlice";

import {
    openModal,
} from "../../../../module/ui/uiSlice";

import {
    getUserPermission,
} from "../../../../module/menuPermission/thunks/menuPermissionThunks";

import InvoiceSkeleton
    from "../../../../common/loader/InvoiceSkeleton";


export default function WarehouseDashboard() {

    const dispatch = useDispatch();


    // ============================================================
    // AUTH STATE
    // ============================================================

    const user = useSelector(
        (state) =>
            state.auth?.user
    );

    const isAuthenticated = useSelector(
        (state) =>
            state.auth?.isAuthenticated === true
    );

    const authChecking = useSelector(
        (state) =>
            state.auth?.authChecking === true
    );


    // ============================================================
    // PERMISSION STATE
    // ============================================================

    const permissions = useSelector(
        (state) =>
            Array.isArray(
                state.menuPermission?.userPermissions
            )
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
    // NORMALIZE HELPERS
    // ============================================================

    const normalizeModule = (value) =>
        String(value ?? "")
            .trim()
            .toLowerCase();

    const normalizeAction = (value) =>
        String(value ?? "")
            .trim()
            .toUpperCase();


    // ============================================================
    // ROLE
    // ============================================================

    const roleName =
        user?.roleName ||
        user?.role?.roleName ||
        user?.role?.name ||
        user?.role ||
        user?.authority ||
        "";

    const normalizedRole = normalizeAction(roleName);

    const isSuperAdmin =
        normalizedRole === "SUPER_ADMIN";

    const isAdmin =
        normalizedRole === "ADMIN";

    const hasFullAccess =
        isSuperAdmin || isAdmin;


    // ============================================================
    // HAS PERMISSION
    // ============================================================

    const hasPermission = (
        moduleName,
        actionName
    ) => {

        // SUPER ADMIN / ADMIN

        if (hasFullAccess) {
            return true;
        }

        if (!Array.isArray(permissions)) {
            return false;
        }

        const requestedModule =
            normalizeModule(moduleName);

        const requestedAction =
            normalizeAction(actionName);

        return permissions.some(
            (permission) => {

                // MODULE

                const permissionModule =
                    normalizeModule(
                        permission?.moduleName ||
                        permission?.module?.moduleName ||
                        permission?.module?.name ||
                        ""
                    );

                if (
                    permissionModule !== requestedModule
                ) {
                    return false;
                }

                // MODULE ACTIVE STATUS

                if (permission?.active === false) {
                    return false;
                }

                if (
                    normalizeAction(permission?.status) === "INACTIVE"
                ) {
                    return false;
                }

                // ACTION ARRAY

                if (Array.isArray(permission?.actions)) {

                    return permission.actions.some(
                        (action) => {

                            if (typeof action === "string") {
                                return (
                                    normalizeAction(action) ===
                                    requestedAction
                                );
                            }

                            const permissionAction =
                                normalizeAction(
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
                                normalizeAction(action?.status) ===
                                "INACTIVE"
                            ) {
                                return false;
                            }

                            return (
                                permissionAction === requestedAction &&
                                allowed
                            );
                        }
                    );
                }

                // DIRECT / FLAT ACTION

                const permissionAction =
                    normalizeAction(
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
            }
        );
    };


    // ============================================================
    // WAREHOUSE PERMISSIONS
    // ============================================================

    const canViewWarehouse =
        hasPermission(
            "Warehouses",
            "VIEW"
        );

    const canCreateWarehouse =
        hasPermission(
            "Warehouses",
            "CREATE"
        );


    // ============================================================
    // WAREHOUSE STATE
    // ============================================================

    const warehousesFromRedux =
        useSelector(
            (state) =>
                state.warehouse?.warehouses
        );

    const warehouses =
        warehousesFromRedux ?? [];

    const loading =
        useSelector(
            (state) =>
                state.warehouse?.loading || false
        );

    const error =
        useSelector(
            (state) =>
                state.warehouse?.error
        );


    // ============================================================
    // WAREHOUSE FILTER STATE
    // ============================================================

    const warehouseStatus =
        useSelector(
            (state) =>
                state.warehouseView?.warehouseStatus || "ALL"
        );


    // ============================================================
    // LOAD CURRENT USER PERMISSIONS
    // ============================================================

    useEffect(() => {

        if (authChecking) {
            return;
        }

        if (!isAuthenticated) {
            return;
        }

        // ADMIN / SUPER ADMIN

        if (hasFullAccess) {
            return;
        }

        if (permissionsLoaded) {
            return;
        }

        if (permissionLoading) {
            return;
        }

        dispatch(
            getUserPermission()
        );

    }, [
        authChecking,
        isAuthenticated,
        hasFullAccess,
        permissionsLoaded,
        permissionLoading,
        dispatch,
    ]);


    // ============================================================
    // FETCH WAREHOUSES
    // ============================================================

    useEffect(() => {

        if (authChecking) {
            return;
        }

        if (!isAuthenticated) {
            return;
        }

        // STAFF / OTHER ROLE

        if (!hasFullAccess) {

            if (!permissionsLoaded) {
                return;
            }

            if (permissionLoading) {
                return;
            }

            if (!canViewWarehouse) {
                return;
            }
        }

        dispatch(
            fetchAllWarehouse()
        );

    }, [
        authChecking,
        isAuthenticated,
        hasFullAccess,
        permissionsLoaded,
        permissionLoading,
        canViewWarehouse,
        dispatch,
    ]);


    // ============================================================
    // SYNC URL STATUS → REDUX
    // ============================================================

    useEffect(() => {

        const params =
            new URLSearchParams(
                window.location.search
            );

        const urlStatus =
            params.get("warehouseStatus");

        if (!urlStatus) {
            return;
        }

        const normalizedStatus =
            String(urlStatus).toUpperCase();

        const validStatuses = [
            "ALL",
            "ACTIVE",
            "INACTIVE",
            "DRAFT",
        ];

        if (
            !validStatuses.includes(normalizedStatus)
        ) {
            return;
        }

        dispatch(
            setWarehousesStatus(
                normalizedStatus
            )
        );

        const statusLabels = {
            ALL: "All Warehouses",
            ACTIVE: "Active Warehouses",
            INACTIVE: "Inactive Warehouses",
            DRAFT: "Draft Warehouses",
        };

        dispatch(
            setSelectedWarehousesView(
                statusLabels[normalizedStatus]
            )
        );

    }, [
        dispatch,
    ]);


    // ============================================================
    // DEBUG
    // ============================================================

    useEffect(() => {

        console.log("================================");

        console.log("WAREHOUSE USER:", user);
        console.log("WAREHOUSE ROLE:", normalizedRole);
        console.log("WAREHOUSE FULL ACCESS:", hasFullAccess);

        console.log(
            "WAREHOUSE PERMISSIONS LOADING:",
            permissionLoading
        );

        console.log(
            "WAREHOUSE PERMISSIONS LOADED:",
            permissionsLoaded
        );

        console.log(
            "WAREHOUSE PERMISSIONS:",
            permissions
        );

        console.log(
            "WAREHOUSE VIEW PERMISSION:",
            canViewWarehouse
        );

        console.log(
            "WAREHOUSE CREATE PERMISSION:",
            canCreateWarehouse
        );

        console.log(
            "WAREHOUSES FROM REDUX:",
            warehouses
        );

        console.log(
            "WAREHOUSE LOADING:",
            loading
        );

        console.log(
            "WAREHOUSE ERROR:",
            error
        );

        console.log(
            "WAREHOUSE STATUS:",
            warehouseStatus
        );

        console.log("================================");

    }, [
        user,
        normalizedRole,
        hasFullAccess,
        permissionLoading,
        permissionsLoaded,
        permissions,
        canViewWarehouse,
        canCreateWarehouse,
        warehouses,
        loading,
        error,
        warehouseStatus,
    ]);


    // ============================================================
    // CLEAR ERROR
    // ============================================================

    useEffect(() => {

        if (!error) {
            return;
        }

        const timer =
            setTimeout(() => {

                dispatch(
                    clearWarehouseError()
                );

            }, 2000);

        return () =>
            clearTimeout(timer);

    }, [
        error,
        dispatch,
    ]);


    // ============================================================
    // FILTER WAREHOUSES BY STATUS
    // ============================================================

    const filteredWarehouses = useMemo(() => {

        const selectedStatus =
            String(warehouseStatus || "ALL")
                .trim()
                .toUpperCase();

        switch (selectedStatus) {

            case "ALL":
                return warehouses;

            case "ACTIVE":
                return warehouses.filter(
                    (warehouse) =>
                        String(warehouse?.status ?? "")
                            .trim()
                            .toUpperCase() === "ACTIVE"
                );

            case "INACTIVE":
                return warehouses.filter(
                    (warehouse) =>
                        String(warehouse?.status ?? "")
                            .trim()
                            .toUpperCase() === "INACTIVE"
                );

            case "DRAFT":
                return warehouses.filter(
                    (warehouse) =>
                        String(warehouse?.status ?? "")
                            .trim()
                            .toUpperCase() === "DRAFT"
                );

            default:
                return warehouses;
        }

    }, [
        warehouses,
        warehouseStatus,
    ]);


    // ============================================================
    // OPEN CREATE WAREHOUSE MODAL
    // ============================================================

    const handleCreateWarehouse = () => {

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

        if (!canCreateWarehouse) {

            toast.error(
                "You do not have permission to create warehouses."
            );

            return;
        }

        dispatch(
            openModal({
                type: "addWarehouse",
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
        (
            permissionLoading ||
            !permissionsLoaded
        )
    ) {
        return <InvoiceSkeleton />;
    }


    // ============================================================
    // VIEW PERMISSION DENIED
    // ============================================================

    if (!canViewWarehouse) {

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
                        You do not have permission to view warehouses.
                    </p>

                </div>
            </div>
        );
    }


    // ============================================================
    // WAREHOUSE LOADING
    // ============================================================

    if (loading) {
        return <InvoiceSkeleton />;
    }


    // ============================================================
    // PAGE
    // ============================================================

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

                    {/* WAREHOUSE NAVBAR */}

                    <NavbarWarehouse />


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


                    {/* WAREHOUSE TABLE / EMPTY STATE */}

                    {filteredWarehouses.length > 0 ? (

                        <WarehouseTable
                            warehouses={filteredWarehouses}
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
                                    <Landmark
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
                                Every setup starts with a warehouse
                            </p>


                            {/* EMPTY STATE DESCRIPTION */}

                            <p
                                className="
                                    max-w-sm text-center
                                    text-sm text-gray-500
                                "
                            >
                                Create and manage your warehouses
                                in one place.
                            </p>


                            {/* ACTION BUTTONS */}

                            <div
                                className="
                                    mt-1 flex flex-wrap
                                    items-center justify-center gap-2.5
                                "
                            >

                                {/* CREATE WAREHOUSE */}

                                {canCreateWarehouse && (

                                    <button
                                        type="button"
                                        onClick={handleCreateWarehouse}
                                        className="
                                            flex items-center gap-2
                                            whitespace-nowrap rounded-md
                                            bg-blue-500 px-4 py-2
                                            text-sm font-medium text-white
                                            transition-colors hover:bg-blue-600
                                        "
                                    >

                                        <Plus className="h-4 w-4" />

                                        Create New Warehouse

                                    </button>

                                )}


                                {/* IMPORT */}

                                <button
                                    type="button"
                                    onClick={() => {
                                        toast("Warehouse import is not configured yet.");
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
