
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
    Coins,
} from "lucide-react";

import toast from "react-hot-toast";

import CurrencyTable from "../pages/CurrencyTable";
import NavbarCurrency from "../components/bars/nav/NavbarCurrency";

import {
    clearError,
} from "../slices/currencySlice";

import {
    setSearch,
    setCurrencyStatus,
} from "../slices/currencyViewSlice";

import {
    openModal,
} from "../../ui/uiSlice";

import {
    getUserPermission,
} from "../../menuPermission/thunks/menuPermissionThunks";

import InvoiceSkeleton from "../../../common/loader/InvoiceSkeleton";

import CurrencyOverview from "../../currency/pages/CurrencyOverview";

/* =========================================================
   CONSTANTS
========================================================= */

const EMPTY_ARRAY = [];

const VALID_STATUSES = [
    "ALL",
    "ACTIVE",
    "INACTIVE",
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

/* =========================================================
   CURRENCY STATUS
========================================================= */

const getCurrencyStatus = (currency) => {
    const status = String(currency?.status || "")
        .trim()
        .toUpperCase();

    if (status === "ACTIVE" || status === "INACTIVE") {
        return status;
    }

    if (typeof currency?.active === "boolean") {
        return currency.active ? "ACTIVE" : "INACTIVE";
    }

    if (typeof currency?.audit?.active === "boolean") {
        return currency.audit.active ? "ACTIVE" : "INACTIVE";
    }

    return "UNKNOWN";
};

/* =========================================================
   CURRENCY SEARCH
========================================================= */

const matchesCurrencySearch = (currency, search) => {
    if (!search) return true;

    const searchableValues = [
        currency?.currencyName,
        currency?.currencyCode,
        currency?.symbol,
        currency?.status,
        currency?.decimalPlaces,
        currency?.description,
        currency?.countryName,
        currency?.country,
    ];

    return searchableValues.some((value) =>
        normalizeSearch(value).includes(search)
    );
};

/* =========================================================
   COMPONENT
========================================================= */

export default function CurrencyDashboard() {
    const dispatch = useDispatch();

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
       CURRENCY PERMISSIONS
    ===================================================== */

    const canViewCurrency = hasPermission(
        "Currencies",
        "VIEW"
    );

    const canCreateCurrency = hasPermission(
        "Currencies",
        "CREATE"
    );

    /* =====================================================
       CURRENCY DATA
    ===================================================== */

    const currenciesFromRedux = useSelector(
        (state) => state.currency?.currencies
    );

    const currencies = Array.isArray(currenciesFromRedux)
        ? currenciesFromRedux
        : EMPTY_ARRAY;

    const loading = useSelector(
        (state) => state.currency?.loading === true
    );

    const error = useSelector(
        (state) => state.currency?.error
    );

    /* =====================================================
       CURRENCY VIEW STATE
    ===================================================== */

    const search = useSelector(
        (state) => state.currencyView?.search || ""
    );

    const currencyStatus = useSelector(
        (state) => state.currencyView?.currencyStatus || "ALL"
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
       FILTER CURRENCIES

       Search and status are handled locally.
       No additional API request is required.
    ===================================================== */

    const filteredCurrencies = useMemo(() => {
        const normalizedSearch = normalizeSearch(search);

        const selectedStatus = VALID_STATUSES.includes(
            String(currencyStatus).toUpperCase()
        )
            ? String(currencyStatus).toUpperCase()
            : "ALL";

        return currencies.filter((currency) => {
            const matchesSearch = matchesCurrencySearch(
                currency,
                normalizedSearch
            );

            const currentStatus = getCurrencyStatus(currency);

            const matchesStatus =
                selectedStatus === "ALL" ||
                currentStatus === selectedStatus;

            return matchesSearch && matchesStatus;
        });

    }, [
        currencies,
        search,
        currencyStatus,
    ]);

    /* =====================================================
       ACTIVE FILTER CHECK
    ===================================================== */

    const hasActiveFilters =
        Boolean(search.trim()) ||
        (
            VALID_STATUSES.includes(currencyStatus) &&
            currencyStatus !== "ALL"
        );

    /* =====================================================
       CLEAR FILTERS
    ===================================================== */

    const handleClearFilters = useCallback(() => {
        dispatch(setSearch(""));
        dispatch(setCurrencyStatus("ALL"));
    }, [dispatch]);

    /* =====================================================
       OPEN CREATE CURRENCY MODAL
    ===================================================== */

    const handleCreateCurrency = useCallback(() => {
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

        if (!canCreateCurrency) {
            toast.error(
                "You do not have permission to create currencies."
            );
            return;
        }

        dispatch(
            openModal({
                type: "addCurrency",
            })
        );

    }, [
        isAuthenticated,
        hasFullAccess,
        permissionLoading,
        permissionsLoaded,
        canCreateCurrency,
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

    if (!canViewCurrency) {
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
                        You do not have permission to view currencies.
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
                    {/* CURRENCY NAVBAR */}

                    <NavbarCurrency />

                    {/* CURRENCY OVERVIEW */}

                    <CurrencyOverview />

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
                                Loading currencies...
                            </p>
                        </div>

                    ) : filteredCurrencies.length > 0 ? (

                        /* CURRENCY TABLE */

                        <CurrencyTable
                            currencies={filteredCurrencies}
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
                                <Coins
                                    size={38}
                                    strokeWidth={1.7}
                                />
                            </div>

                            <h3 className="
                                text-base font-semibold text-gray-800
                            ">
                                No matching currencies found
                            </h3>

                            <p className="
                                max-w-sm text-center text-sm text-gray-500
                            ">
                                No currencies match your current search
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
                                    <Coins
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
                                Manage your currencies
                            </p>

                            {/* EMPTY STATE DESCRIPTION */}

                            <p
                                className="
                                    max-w-sm text-center
                                    text-sm text-gray-500
                                "
                            >
                                Create and manage currencies,
                                configure currency codes and symbols,
                                set decimal precision, and maintain
                                currency availability for your invoices
                                and transactions.
                            </p>

                            {/* ACTION BUTTONS */}

                            <div
                                className="
                                    mt-1 flex flex-wrap
                                    items-center justify-center gap-2.5
                                "
                            >
                                {/* CREATE CURRENCY */}

                                {canCreateCurrency && (
                                    <button
                                        type="button"
                                        onClick={handleCreateCurrency}
                                        className="
                                            flex items-center gap-2
                                            whitespace-nowrap rounded-md
                                            bg-blue-500 px-4 py-2
                                            text-sm font-medium text-white
                                            transition-colors hover:bg-blue-600
                                        "
                                    >
                                        <Plus className="h-4 w-4" />
                                        Create Currency
                                    </button>
                                )}

                                {/* IMPORT */}

                                <button
                                    type="button"
                                    onClick={() => {
                                        toast(
                                            "Currency import is not configured yet."
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
