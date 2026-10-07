import React, { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Plus, Download } from "lucide-react";
import toast from "react-hot-toast";

import TaxMasterTable from "./TaxMasterTable";
import NavbarTaxMaster from "../components/bars/nav/NavbarTaxMaster";

import { fetchAllTaxMasters } from "../thunks/taxMasterThunks";

import {
    setTaxMasterStatus,
    setSelectedTaxMasterView,
} from "../slices/taxMasterViewSlice";

import { openModal } from "../../../module/ui/uiSlice";

import InvoiceSkeleton from "../../../common/loader/InvoiceSkeleton";

import {
    getUserPermission,
} from "../../menuPermission/thunks/menuPermissionThunks";


export default function TaxMasterDashboard() {

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
    // USER PERMISSIONS
    // ============================================================

    const permissions = useSelector(
        (state) =>
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
    // ROLE
    // ============================================================

    const roleName =
        user?.roleName ||
        user?.role?.roleName ||
        user?.role?.name ||
        user?.role ||
        user?.authority ||
        "";

    const normalizedRole =
        String(roleName)
            .trim()
            .toUpperCase();

    const isSuperAdmin =
        normalizedRole === "SUPER_ADMIN";

    const isAdmin =
        normalizedRole === "ADMIN";

    const hasFullAccess =
        isSuperAdmin || isAdmin;

    // ============================================================
    // PERMISSION CHECKER
    //
    // Supports both:
    //
    // Flat:
    // {
    //     moduleName: "TaxMasters",
    //     actionName: "VIEW",
    //     allowed: true
    // }
    //
    // Grouped:
    // {
    //     moduleName: "TaxMasters",
    //     actions: [
    //         {
    //             actionName: "VIEW",
    //             allowed: true
    //         }
    //     ]
    // }
    // ============================================================

    const hasPermission = (
        moduleName,
        actionName
    ) => {

        // ADMIN / SUPER_ADMIN
        if (hasFullAccess) {
            return true;
        }

        if (!Array.isArray(permissions)) {
            return false;
        }

        const normalizedModule =
            String(moduleName)
                .trim()
                .toLowerCase();

        const normalizedAction =
            String(actionName)
                .trim()
                .toUpperCase();

        return permissions.some((permission) => {

            const permissionModule =
                permission?.moduleName ||
                permission?.module?.moduleName ||
                permission?.module?.name ||
                permission?.module;

            if (
                String(permissionModule || "")
                    .trim()
                    .toLowerCase() !== normalizedModule
            ) {
                return false;
            }

            // ====================================================
            // GROUPED PERMISSION
            // ====================================================

            if (Array.isArray(permission?.actions)) {

                return permission.actions.some((action) => {

                    const actionNameFromPermission =
                        action?.actionName ||
                        action?.action?.actionName ||
                        action?.action?.name ||
                        action?.name;

                    const isActive =
                        action?.active !== false &&
                        String(action?.status || "")
                            .toUpperCase() !== "INACTIVE";

                    const isAllowed =
                        action?.allowed === true ||
                        String(action?.allowed)
                            .toLowerCase() === "true";

                    return (
                        isActive &&
                        String(actionNameFromPermission || "")
                            .trim()
                            .toUpperCase() === normalizedAction &&
                        isAllowed
                    );
                });
            }

            // ====================================================
            // FLAT PERMISSION
            // ====================================================

            const actionNameFromPermission =
                permission?.actionName ||
                permission?.action?.actionName ||
                permission?.action?.name ||
                permission?.name;

            const isActive =
                permission?.active !== false &&
                String(permission?.status || "")
                    .toUpperCase() !== "INACTIVE";

            const isAllowed =
                permission?.allowed === true ||
                String(permission?.allowed)
                    .toLowerCase() === "true";

            return (
                isActive &&
                String(actionNameFromPermission || "")
                    .trim()
                    .toUpperCase() === normalizedAction &&
                isAllowed
            );
        });
    };

    // ============================================================
    // TAX MASTER PERMISSIONS
    // ============================================================

    const canViewTaxMaster =
        hasPermission(
            "TaxMasters",
            "VIEW"
        );

    const canCreateTaxMaster =
        hasPermission(
            "TaxMasters",
            "CREATE"
        );

    // ============================================================
    // TAX MASTER STATE
    // ============================================================

    const taxMastersFromRedux = useSelector(
        (state) => state.taxMaster?.taxMasters
    );

    const taxMasters =
        taxMastersFromRedux ?? [];

    const loading = useSelector(
        (state) => state.taxMaster?.loading || false
    );

    const error = useSelector(
        (state) => state.taxMaster?.error
    );

    // ============================================================
    // TAX MASTER FILTER STATE
    // ============================================================

    const taxMasterStatus = useSelector(
        (state) =>
            state.taxMasterView?.taxMasterStatus || "ALL"
    );

    // ============================================================
    // LOAD CURRENT USER PERMISSIONS
    //
    // This is a fallback in case permissions were not already
    // loaded during auth bootstrap.
    // ============================================================

    useEffect(() => {

        if (authChecking) {
            return;
        }

        if (!isAuthenticated) {
            return;
        }

        if (hasFullAccess) {
            return;
        }

        if (permissionsLoaded) {
            return;
        }

        if (permissionLoading) {
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
    // FETCH TAX MASTERS
    //
    // STAFF users can fetch only when:
    // 1. Authentication is ready
    // 2. Permissions are loaded
    // 3. VIEW permission exists
    //
    // ADMIN / SUPER_ADMIN can fetch immediately.
    // ============================================================

    useEffect(() => {

        if (authChecking) {
            return;
        }

        if (!isAuthenticated) {
            return;
        }

        if (hasFullAccess) {

            dispatch(
                fetchAllTaxMasters()
            );

            return;
        }

        if (!permissionsLoaded) {
            return;
        }

        if (permissionLoading) {
            return;
        }

        if (!canViewTaxMaster) {
            return;
        }

        dispatch(
            fetchAllTaxMasters()
        );

    }, [
        authChecking,
        isAuthenticated,
        hasFullAccess,
        permissionsLoaded,
        permissionLoading,
        canViewTaxMaster,
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
            params.get("taxMasterStatus");

        if (!urlStatus) {
            return;
        }

        const normalizedStatus =
            String(urlStatus)
                .toUpperCase();

        const validStatuses = [
            "ALL",
            "ACTIVE",
            "INACTIVE",
            "DRAFT",
        ];

        if (!validStatuses.includes(normalizedStatus)) {
            return;
        }

        dispatch(
            setTaxMasterStatus(
                normalizedStatus
            )
        );

        const statusLabels = {
            ALL: "All Tax Masters",
            ACTIVE: "Active Tax Masters",
            INACTIVE: "Inactive Tax Masters",
            DRAFT: "Draft Tax Masters",
        };

        dispatch(
            setSelectedTaxMasterView(
                statusLabels[normalizedStatus]
            )
        );

    }, [dispatch]);

    // ============================================================
    // FILTER TAX MASTERS BY STATUS
    // ============================================================

    const filteredTaxMasters = useMemo(() => {

        const selectedStatus =
            String(taxMasterStatus || "ALL")
                .toUpperCase();

        if (selectedStatus === "ALL") {
            return taxMasters;
        }

        return taxMasters.filter(
            (taxMaster) => {

                const backendStatus =
                    String(taxMaster?.status || "")
                        .toUpperCase();

                return (
                    backendStatus ===
                    selectedStatus
                );
            }
        );

    }, [
        taxMasters,
        taxMasterStatus,
    ]);

    // ============================================================
    // OPEN CREATE TAX MASTER MODAL
    // ============================================================

    const handleCreateTaxMaster = () => {

        if (authChecking) {

            toast.error(
                "Authentication is still loading. Please try again."
            );

            return;
        }

        if (!isAuthenticated) {

            toast.error(
                "Please login to create a tax master."
            );

            return;
        }

        if (!hasFullAccess && !permissionsLoaded) {

            toast.error(
                "Permissions are still loading. Please try again."
            );

            return;
        }

        if (!canCreateTaxMaster) {

            toast.error(
                "You do not have permission to create tax masters."
            );

            return;
        }

        dispatch(
            openModal({
                type: "addTaxMaster",
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
    // STAFF PERMISSION LOADING
    // ============================================================

    if (!hasFullAccess && !permissionsLoaded) {
        return <InvoiceSkeleton />;
    }

    if (
        !hasFullAccess &&
        permissionLoading
    ) {
        return <InvoiceSkeleton />;
    }

    // ============================================================
    // VIEW PERMISSION DENIED
    // ============================================================

    if (!canViewTaxMaster) {

        return (
            <div className="flex h-screen bg-gray-50 font-sans text-[13px] overflow-hidden">

                <div className="flex-1 min-h-0 bg-white overflow-y-auto">

                    <div className="h-full flex items-center justify-center px-6">

                        <div className="text-center max-w-md">

                            <div
                                className="
                                    mx-auto
                                    w-20
                                    h-20
                                    rounded-full
                                    bg-red-50
                                    flex
                                    items-center
                                    justify-center
                                    mb-5
                                "
                            >
                                <span className="text-3xl text-red-500">
                                    !
                                </span>
                            </div>

                            <h2 className="text-lg font-semibold text-gray-800">
                                Access Denied
                            </h2>

                            <p className="mt-2 text-sm text-gray-500">
                                You do not have permission to view tax masters.
                            </p>

                        </div>

                    </div>

                </div>

            </div>
        );
    }

    // ============================================================
    // TAX MASTER LOADING
    // ============================================================

    if (loading) {
        return <InvoiceSkeleton />;
    }

    // ============================================================
    // PAGE
    // ============================================================

    return (
        <div className="flex h-screen bg-gray-50 font-sans text-[13px] overflow-hidden">

            <div className="flex-1 min-h-0 bg-white overflow-y-auto">

                <div className="px-2 py-5 max-w-30xl w-full">

                    {/* =================================================
                        TAX MASTER NAVBAR
                    ================================================= */}

                    <NavbarTaxMaster />

                    {/* =================================================
                        ERROR
                    ================================================= */}

                    {error && (
                        <div
                            className="
                                mx-2
                                mt-4
                                px-4
                                py-3
                                rounded-md
                                border
                                border-red-200
                                bg-red-50
                                text-sm
                                text-red-600
                            "
                        >
                            {error}
                        </div>
                    )}

                    {/* =================================================
                        TAX MASTER TABLE / EMPTY STATE
                    ================================================= */}

                    {filteredTaxMasters.length > 0 ? (

                        <TaxMasterTable
                            taxMasters={filteredTaxMasters}
                        />

                    ) : (

                        <div
                            className="
                                min-h-full
                                flex
                                flex-col
                                items-center
                                justify-center
                                gap-3
                                px-4
                            "
                        >

                            <div
                                className="
                                    relative
                                    w-24
                                    h-24
                                    rounded-full
                                    bg-gray-100
                                    flex
                                    items-center
                                    justify-center
                                    mb-1
                                    flex-shrink-0
                                    mt-30
                                "
                            >

                                <div className="text-gray-400 text-4xl">
                                    %
                                </div>

                                <div
                                    className="
                                        absolute
                                        bottom-1
                                        right-1
                                        w-7
                                        h-7
                                        rounded-full
                                        bg-blue-500
                                        flex
                                        items-center
                                        justify-center
                                        text-white
                                    "
                                >
                                    <Plus className="w-4 h-4" />
                                </div>

                            </div>

                            <p className="text-base font-medium text-gray-800 text-center">
                                Every setup starts with a taxss
                            </p>

                            <p className="text-sm text-gray-500 text-center max-w-sm">
                                Create and manage your tax masters and GST tax
                                configurations, all in one place.
                            </p>

                            {/* =================================================
                                ACTION BUTTONS
                            ================================================= */}

                            <div
                                className="
                                    flex
                                    items-center
                                    gap-2.5
                                    mt-1
                                    flex-wrap
                                    justify-center
                                "
                            >

                                {/* =================================================
                                    CREATE TAX MASTER
                                    CREATE permission
                                ================================================= */}

                                {canCreateTaxMaster && (

                                    <button
                                        type="button"
                                        onClick={
                                            handleCreateTaxMaster
                                        }
                                        className="
                                            flex
                                            items-center
                                            gap-2
                                            bg-blue-500
                                            text-white
                                            text-sm
                                            font-medium
                                            px-4
                                            py-2
                                            rounded-md
                                            hover:bg-blue-600
                                            transition-colors
                                            whitespace-nowrap
                                        "
                                    >
                                        <Plus className="w-4 h-4" />

                                        Create New Tax
                                    </button>

                                )}

                                {/* =================================================
                                    IMPORT
                                ================================================= */}

                                <button
                                    type="button"
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                        bg-white
                                        text-gray-700
                                        text-sm
                                        border
                                        border-gray-300
                                        px-4
                                        py-2
                                        rounded-md
                                        hover:bg-gray-50
                                        transition-colors
                                        whitespace-nowrap
                                    "
                                >
                                    <Download className="w-4 h-4" />

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