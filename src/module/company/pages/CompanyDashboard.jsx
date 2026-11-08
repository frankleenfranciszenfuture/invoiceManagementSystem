
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
    Building2,
} from "lucide-react";

import toast from "react-hot-toast";

import CompanyTable from "../pages/CompanyTable";
import NavbarCompany from "../components/bars/nav/NavbarCompany";
import CompanyOverview from "../pages/CompanyOverview";

import {
    clearError,
} from "../slices/companySlice";

import {
    openModal,
} from "../../ui/uiSlice";

import {
    getUserPermission,
} from "../../menuPermission/thunks/menuPermissionThunks";

import InvoiceSkeleton from "../../../common/loader/InvoiceSkeleton";

// ============================================================
// CONSTANTS
// ============================================================

const EMPTY_ARRAY = [];

const VALID_STATUSES = [
    "ALL",
    "ACTIVE",
    "INACTIVE",
    "DRAFT",
];

// ============================================================
// NORMALIZE HELPERS
// ============================================================

const normalizeModule = (value) =>
    String(value ?? "").trim().toLowerCase();

const normalizeAction = (value) =>
    String(value ?? "").trim().toUpperCase();

const normalizeSearch = (value) =>
    String(value ?? "").trim().toLowerCase();

// ============================================================
// COMPANY STATUS
// ============================================================

const getCompanyStatus = (company) => {

    const status = String(
        company?.status || ""
    )
        .trim()
        .toUpperCase();

    if (
        ["ACTIVE", "INACTIVE", "DRAFT"].includes(status)
    ) {
        return status;
    }

    if (typeof company?.audit?.active === "boolean") {
        return company.audit.active
            ? "ACTIVE"
            : "INACTIVE";
    }

    return "UNKNOWN";
};

// ============================================================
// COMPANY SEARCH
// ============================================================

const matchesCompanySearch = (company, search) => {

    if (!search) {
        return true;
    }

    const searchableValues = [
        company?.companyName,
        company?.name,
        company?.companyCode,
        company?.code,
        company?.email,
        company?.phone,
        company?.mobile,
        company?.website,
        company?.gstNumber,
        company?.gstin,
        company?.panNumber,
        company?.address,
        company?.city,
        company?.state,
        company?.country,
    ];

    return searchableValues.some((value) =>
        normalizeSearch(value).includes(search)
    );
};

// ============================================================
// COMPONENT
// ============================================================

export default function CompanyDashboard() {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    // ========================================================
    // AUTH STATE
    // ========================================================

    const user = useSelector(
        (state) => state.auth?.user
    );

    const isAuthenticated = useSelector(
        (state) =>
            state.auth?.isAuthenticated === true
    );

    const authChecking = useSelector(
        (state) =>
            state.auth?.authChecking === true
    );

    // ========================================================
    // PERMISSION STATE
    // ========================================================

    const permissions = useSelector((state) => {

        const value =
            state.menuPermission?.userPermissions;

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

    // ========================================================
    // ROLE
    // ========================================================

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

    // ========================================================
    // PERMISSION CHECK
    // ========================================================

    const hasPermission = useCallback(
        (moduleName, actionName) => {

            if (hasFullAccess) {
                return true;
            }

            const requestedModule =
                normalizeModule(moduleName);

            const requestedAction =
                normalizeAction(actionName);

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
                    normalizeAction(permission?.status) ===
                    "INACTIVE"
                ) {
                    return false;
                }

                // ACTION ARRAY

                if (Array.isArray(permission?.actions)) {

                    return permission.actions.some((action) => {

                        if (typeof action === "string") {
                            return (
                                normalizeAction(action) ===
                                requestedAction
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
                            normalizeAction(action?.status) ===
                            "INACTIVE"
                        ) {
                            return false;
                        }

                        return (
                            permissionAction === requestedAction &&
                            allowed
                        );
                    });
                }

                // DIRECT / FLAT ACTION

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

    // ========================================================
    // COMPANY PERMISSIONS
    // ========================================================

    const canViewCompany = hasPermission(
        "Companies",
        "VIEW"
    );

    const canCreateCompany = hasPermission(
        "Companies",
        "CREATE"
    );

    // ========================================================
    // COMPANY STATE
    // ========================================================

    const companies = useSelector((state) => {

        const value = state.company?.companies;

        return Array.isArray(value)
            ? value
            : EMPTY_ARRAY;
    });

    const loading = useSelector(
        (state) =>
            state.company?.loading === true
    );

    const error = useSelector(
        (state) =>
            state.company?.error
    );

    // ========================================================
    // COMPANY VIEW STATE
    // ========================================================

    const searchValue = useSelector(
        (state) =>
            state.companyView?.search || ""
    );

    const selectedStatus = useSelector(
        (state) => {

            const status =
                state.companyView?.companyStatus || "ALL";

            return VALID_STATUSES.includes(status)
                ? status
                : "ALL";
        }
    );

    // ========================================================
    // LOAD USER PERMISSIONS
    // ========================================================

    useEffect(() => {

        if (authChecking || !isAuthenticated) {
            return;
        }

        if (hasFullAccess) {
            return;
        }

        if (
            permissionsLoaded ||
            permissionLoading
        ) {
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

    // ========================================================
    // FILTER COMPANIES
    // ========================================================

    const filteredCompanies = useMemo(() => {

        const search = normalizeSearch(searchValue);

        return companies.filter((company) => {

            // STATUS FILTER

            if (selectedStatus !== "ALL") {

                const companyStatus =
                    getCompanyStatus(company);

                if (companyStatus !== selectedStatus) {
                    return false;
                }
            }

            // SEARCH FILTER

            if (
                !matchesCompanySearch(
                    company,
                    search
                )
            ) {
                return false;
            }

            return true;
        });

    }, [
        companies,
        searchValue,
        selectedStatus,
    ]);

    // ========================================================
    // OPEN CREATE COMPANY MODAL
    // ========================================================

    const handleCreateCompany = useCallback(() => {

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

        if (!canCreateCompany) {

            toast.error(
                "You do not have permission to create companies."
            );

            return;
        }

        navigate("/settings/companies/create");

    }, [
        isAuthenticated,
        hasFullAccess,
        permissionLoading,
        permissionsLoaded,
        canCreateCompany,
        dispatch,
    ]);

    // ========================================================
    // CLEAR ERROR
    // ========================================================

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

    // ========================================================
    // AUTH CHECKING
    // ========================================================

    if (authChecking) {
        return <InvoiceSkeleton />;
    }

    // ========================================================
    // NOT AUTHENTICATED
    // ========================================================

    if (!isAuthenticated) {
        return null;
    }

    // ========================================================
    // PERMISSION LOADING
    // ========================================================

    if (
        !hasFullAccess &&
        (
            permissionLoading ||
            !permissionsLoaded
        )
    ) {
        return <InvoiceSkeleton />;
    }

    // ========================================================
    // VIEW PERMISSION DENIED
    // ========================================================

    if (!canViewCompany) {

        return (
            <div className="
                flex h-screen items-center justify-center
                bg-gray-50 font-sans
            ">

                <div className="px-6 text-center">

                    <div className="
                        mx-auto mb-4 flex h-16 w-16
                        items-center justify-center
                        rounded-full bg-red-50
                        text-2xl font-semibold text-red-500
                    ">
                        !
                    </div>

                    <h2 className="
                        text-lg font-semibold text-gray-800
                    ">
                        Access Denied
                    </h2>

                    <p className="
                        mt-1 max-w-sm text-sm text-gray-500
                    ">
                        You do not have permission to view companies.
                    </p>

                </div>
            </div>
        );
    }

    // ========================================================
    // PAGE
    // ========================================================

    return (

        <div className="
            flex h-screen overflow-hidden
            bg-gray-50 font-sans text-[13px]
        ">

            <div className="
                min-h-0 flex-1 overflow-y-auto bg-white
            ">

                <div className="
                    w-full max-w-30xl px-2 py-5
                ">

                    {/* COMPANY NAVBAR */}

                    <NavbarCompany />

                    {/* COMPANY OVERVIEW */}

                    <CompanyOverview
                        canViewCompany={canViewCompany}
                        isAuthenticated={isAuthenticated}
                        authChecking={authChecking}
                    />

                    {/* ERROR */}

                    {error && (
                        <div className="
                            my-3 rounded-lg border border-red-200
                            bg-red-50 px-4 py-2 text-sm text-red-600
                        ">
                            {error}
                        </div>
                    )}

                    {/* COMPANY TABLE / LOADING / EMPTY STATE */}

                    {loading ? (

                        <div className="
                            flex min-h-[250px]
                            items-center justify-center
                        ">
                            <p className="text-sm text-gray-500">
                                Loading companies...
                            </p>
                        </div>

                    ) : filteredCompanies.length > 0 ? (

                        <CompanyTable
                            companies={filteredCompanies}
                        />

                    ) : companies.length > 0 ? (

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
                                No company records found
                                <span className="flex text-gray-600">
                                    Create and manage your company details
                                </span>
                            </p>
                            {/* ACTION BUTTONS */}

                            <div className="
                                mt-1 flex flex-wrap
                                items-center justify-center gap-2.5
                            ">

                                {/* CREATE COMPANY */}

                                {canCreateCompany && (

                                    <button
                                        type="button"
                                        onClick={handleCreateCompany}
                                        className="
                                            flex items-center gap-2
                                            whitespace-nowrap rounded-md
                                            bg-blue-500 px-4 py-2
                                            text-sm font-medium text-white
                                            transition-colors hover:bg-blue-600
                                        "
                                    >
                                        <Plus className="h-4 w-4" />
                                        Create Company
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
