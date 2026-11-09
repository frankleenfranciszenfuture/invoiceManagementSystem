
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
    Receipt,
} from "lucide-react";

import toast from "react-hot-toast";

import TaxMasterTable from "../pages/TaxMasterTable";
import NavbarTaxMaster from "../components/bars/nav/NavbarTaxMaster";

import {
    setSearch,
    setTaxMasterStatus,
} from "../slices/taxMasterViewSlice";

import {
    openModal,
} from "../../ui/uiSlice";

import {
    getUserPermission,
} from "../../menuPermission/thunks/menuPermissionThunks";

import InvoiceSkeleton from "../../../common/loader/InvoiceSkeleton";

import TaxMasterOverview from "../../taxMaster/pages/TaxMasterOverview";
import { useNavigate } from "react-router-dom";

/* =========================================================
   CONSTANTS
========================================================= */

const EMPTY_ARRAY = [];

const VALID_STATUSES = [
    "ALL",
    "ACTIVE",
    "INACTIVE",
    "DRAFT",
];

/* =========================================================
   NORMALIZE HELPERS
========================================================= */

const normalizeModule = (value) =>
    String(value ?? "").trim().toLowerCase();

const normalizeAction = (value) =>
    String(value ?? "").trim().toUpperCase();

const normalizeSearch = (value) =>
    String(value ?? "").trim().toLowerCase();

const normalizeTaxMasterStatus = (value) => {

    const status = String(value ?? "")
        .trim()
        .toUpperCase();

    return VALID_STATUSES.includes(status)
        ? status
        : "ALL";
};

/* =========================================================
   TAX MASTER STATUS
========================================================= */


const getTaxMasterStatus = (taxMaster) => {
    const status = String(taxMaster?.status ?? "")
        .trim()
        .toUpperCase();

    // DRAFT is an explicit business status.
    if (status === "DRAFT") {
        return "DRAFT";
    }

    // Prefer the actual active flag over a potentially stale status.
    if (typeof taxMaster?.active === "boolean") {
        return taxMaster.active ? "ACTIVE" : "INACTIVE";
    }

    if (typeof taxMaster?.audit?.active === "boolean") {
        return taxMaster.audit.active ? "ACTIVE" : "INACTIVE";
    }

    // Fallback to the status field.
    if (status === "ACTIVE" || status === "INACTIVE") {
        return status;
    }

    return "UNKNOWN";
};


/* =========================================================
   TAX MASTER SEARCH
========================================================= */

const matchesTaxMasterSearch = (taxMaster, search) => {

    if (!search) {
        return true;
    }

    const searchableValues = [
        taxMaster?.id,
        taxMaster?.taxName,
        taxMaster?.taxType,
        taxMaster?.taxRate,
        taxMaster?.cgstRate,
        taxMaster?.sgstRate,
        taxMaster?.igstRate,
        taxMaster?.description,
        taxMaster?.status,
        taxMaster?.active,
    ];

    return searchableValues.some((value) =>
        normalizeSearch(value).includes(search)
    );
};

/* =========================================================
   COMPONENT
========================================================= */

export default function TaxMasterDashboard() {

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

    const permissions = useSelector((state) => {

        const value = state.menuPermission?.userPermissions;

        return Array.isArray(value)
            ? value
            : EMPTY_ARRAY;

    });

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

                /* GROUPED ACTIONS */

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

                /* FLAT ACTION */

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
       TAX MASTER PERMISSIONS
    ===================================================== */

    const canViewTaxMaster = hasPermission(
        "Taxes",
        "VIEW"
    );

    const canCreateTaxMaster = hasPermission(
        "Taxes",
        "CREATE"
    );

    /* =====================================================
       TAX MASTER DATA
    ===================================================== */

    const taxMastersFromRedux = useSelector(
        (state) => state.taxMaster?.taxMasters
    );

    const taxMasters = Array.isArray(taxMastersFromRedux)
        ? taxMastersFromRedux
        : EMPTY_ARRAY;

    const loading = useSelector(
        (state) => state.taxMaster?.loading === true
    );

    const error = useSelector(
        (state) => state.taxMaster?.error
    );

    /* =====================================================
       TAX MASTER VIEW STATE
    ===================================================== */

    const search = useSelector(
        (state) => state.taxMasterView?.search || ""
    );

    const taxMasterStatus = useSelector(
        (state) => state.taxMasterView?.taxMasterStatus || "ALL"
    );

    /* =====================================================
       LOAD USER PERMISSIONS
    ===================================================== */

    useEffect(() => {

        if (authChecking || !isAuthenticated) {
            return;
        }

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
       FILTER TAX MASTERS

       Status and search filtering happen locally.
       No API request is triggered when clicking cards.
    ===================================================== */

    const filteredTaxMasters = useMemo(() => {

        const normalizedSearch = normalizeSearch(search);
        const normalizedStatus = normalizeTaxMasterStatus(taxMasterStatus);

        return taxMasters.filter((taxMaster) => {

            const matchesSearch = matchesTaxMasterSearch(
                taxMaster,
                normalizedSearch
            );

            const recordStatus = getTaxMasterStatus(taxMaster);

            const matchesStatus =
                normalizedStatus === "ALL" ||
                recordStatus === normalizedStatus;

            return matchesSearch && matchesStatus;
        });

    }, [
        taxMasters,
        search,
        taxMasterStatus,
    ]);


    /* =====================================================
       ACTIVE FILTER CHECK
    ===================================================== */

    const normalizedSelectedStatus = normalizeTaxMasterStatus(
        taxMasterStatus
    );

    const hasActiveFilters =
        Boolean(String(search ?? "").trim()) ||
        normalizedSelectedStatus !== "ALL";

    /* =====================================================
       CLEAR FILTERS
    ===================================================== */

    const handleClearFilters = useCallback(() => {

        dispatch(setSearch(""));

        dispatch(setTaxMasterStatus("ALL"));

        navigate("/settings/taxes?status=ALL");

    }, [
        dispatch,
        navigate,
    ]);

    /* =====================================================
       CREATE TAX MASTER
    ===================================================== */

    const handleCreateTaxMaster = useCallback(() => {

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

        if (!canCreateTaxMaster) {

            toast.error(
                "You do not have permission to create tax masters."
            );

            return;
        }

        // dispatch(
        //     openModal({
        //         type: "addTaxMaster",
        //     })
        // );

        navigate("/settings/taxes/create");

    }, [
        isAuthenticated,
        hasFullAccess,
        permissionLoading,
        permissionsLoaded,
        canCreateTaxMaster,
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

    if (!canViewTaxMaster) {

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
                        You do not have permission to view tax masters.
                    </p>

                </div>

            </div>

        );
    }

    /* =====================================================
       EMPTY STATE MESSAGE
    ===================================================== */

    const emptyStateTitle =
        taxMasterStatus === "ALL"
            ? "Every product starts with a tax"
            : `No ${taxMasterStatus.toLowerCase()} taxes found`;

    const emptyStateDescription =
        taxMasterStatus === "ALL"
            ? "Create and organize your product taxes in one place."
            : `There are currently no ${taxMasterStatus.toLowerCase()} taxes to display.`;


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

                    {/* NAVBAR */}

                    <NavbarTaxMaster />

                    {/* OVERVIEW */}

                    <TaxMasterOverview />

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

                    {/* LOADING */}

                    {loading ? (

                        <div
                            className="
                                flex min-h-[250px]
                                items-center justify-center
                            "
                        >

                            <p className="text-sm text-gray-500">
                                Loading tax masters...
                            </p>

                        </div>

                    ) : filteredTaxMasters.length > 0 ? (

                        /* FILTERED TABLE */

                        <TaxMasterTable
                            taxMasters={filteredTaxMasters}
                        />

                    ) : hasActiveFilters ? (

                        /* FILTERED EMPTY STATE */

                        <div
                            className="
                                flex min-h-[300px] flex-col
                                items-center justify-center
                                gap-3 px-4
                            "
                        >

                            <div
                                className="
                                    flex h-20 w-20 items-center
                                    justify-center rounded-full
                                    bg-gray-100 text-gray-400
                                "
                            >
                                <Receipt
                                    size={38}
                                    strokeWidth={1.7}
                                />
                            </div>

                            <h3 className="
                                text-base font-semibold text-gray-800
                            ">
                                No matching tax masters found
                            </h3>

                            <p className="
                                max-w-sm text-center text-sm text-gray-500
                            ">
                                No tax masters match your current search
                                or status filter. Try changing your filters.
                            </p>

                            <button
                                type="button"
                                onClick={handleClearFilters}
                                className="
                                    mt-2 rounded-md bg-blue-500
                                    px-4 py-2 text-sm font-medium
                                    text-white transition
                                    hover:bg-blue-600
                                "
                            >
                                Clear Filters
                            </button>

                        </div>

                    ) : (

                        /* INITIAL EMPTY STATE */

                        <div
                            className="
                                flex min-h-full flex-col
                                items-center justify-center
                                gap-3 px-4
                            "
                        >

                            <div
                                className="
                                    relative mt-10 mb-1
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
                                    <Receipt
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

                            <p
                                className="
                                    text-center text-base
                                    font-medium text-gray-800
                                "
                            >
                                {emptyStateTitle}
                            </p>

                            {/* EMPTY STATE DESCRIPTION */}

                            <p
                                className="
                                    max-w-sm text-center
                                    text-sm text-gray-500
                                "
                            >
                                {emptyStateDescription}
                            </p>

                            <div
                                className="
                                    mt-1 flex flex-wrap
                                    items-center justify-center gap-2.5
                                "
                            >

                                {canCreateTaxMaster && (

                                    <button
                                        type="button"
                                        onClick={handleCreateTaxMaster}
                                        className="
                                            flex items-center gap-2
                                            whitespace-nowrap rounded-md
                                            bg-blue-500 px-4 py-2
                                            text-sm font-medium text-white
                                            transition-colors hover:bg-blue-600
                                        "
                                    >
                                        <Plus className="h-4 w-4" />
                                        Create Tax Master
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
