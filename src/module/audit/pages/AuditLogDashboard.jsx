
import React, {
    useEffect,
    useCallback,
    useState,
} from "react";

import {
    useSelector,
    useDispatch,
} from "react-redux";

import { useNavigate } from "react-router-dom";

import toast from "react-hot-toast";

import {
    FileText,
} from "lucide-react";

import NavbarAuditLog from "../components/NavbarAuditLog";
import AuditLogOverview from "../pages/AuditLogOverview";
import AuditLogFilters from "../pages/AuditLogFilters";
import AuditLogTable from "../pages/AuditLogTable";

import InvoiceSkeleton from "../../../common/loader/InvoiceSkeleton";

import {
    getUserPermission,
} from "../../menuPermission/thunks/menuPermissionThunks";

import {
    fetchAuditLogs,
} from "../thunks/auditLogThunks";

import {
    setAuditLogFilters,
    resetAuditLogFilters,
    setAuditLogPage,
    setAuditLogPageSize,
} from "../slices/auditLogSlice";

/* =====================================================
   CONSTANTS
===================================================== */

const EMPTY_ARRAY = [];

const normalizeModule = (value) =>
    String(value ?? "").trim().toLowerCase();

const normalizeAction = (value) =>
    String(value ?? "").trim().toUpperCase();

/* =====================================================
   COMPONENT
===================================================== */

export default function AuditLogDashboard() {

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

    const hasFullAccess = [
        "SUPER_ADMIN",
        "ADMIN",
    ].includes(normalizedRole);

    /* =====================================================
       PERMISSION CHECK
    ===================================================== */

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
                    normalizeAction(permission?.status) === "INACTIVE"
                ) {
                    return false;
                }

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

                        if (
                            action?.active === false ||
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
        [permissions, hasFullAccess]
    );

    const canViewAuditLogs = hasPermission(
        "Audit Logs",
        "VIEW"
    );

    /* =====================================================
       REDUX STATE
    ===================================================== */

    const {
        auditLogs = EMPTY_ARRAY,
        pagination = {},
        filters = {},
        loading = false,
        error = null,
    } = useSelector(
        (state) => state.auditLogs || {}
    );

    const {
        pageNumber = 0,
        pageSize = 10,
        totalElements = 0,
    } = pagination;

    /* =====================================================
       LOCAL FILTER STATE
       Apply only when user clicks Search.
    ===================================================== */

    const [draftFilters, setDraftFilters] = useState({
        ...filters,
    });
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        setDraftFilters({
            ...filters,
        });
    }, [filters]);

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
       FETCH AUDIT LOGS
    ===================================================== */

    useEffect(() => {
        if (!isAuthenticated || !canViewAuditLogs) {
            return;
        }

        dispatch(
            fetchAuditLogs({
                ...filters,
                page: pageNumber,
                size: pageSize,
            })
        );

    }, [
        dispatch,
        isAuthenticated,
        canViewAuditLogs,
        filters,
        pageNumber,
        pageSize,
    ]);

    /* =====================================================
       MODULE SELECTION
    ===================================================== */

    const handleModuleChange = (moduleName) => {
        dispatch(
            setAuditLogFilters({
                entityName:
                    moduleName === "ALL"
                        ? ""
                        : moduleName,
            })
        );

        dispatch(setAuditLogPage(0));
    };

    const handleRefresh = () => {
        dispatch(
            fetchAuditLogs({
                ...filters,
                page: pageNumber,
                size: pageSize,
            })
        );
    };

    /* =====================================================
       FILTER CHANGE
    ===================================================== */

    const handleFilterChange = (changes) => {
        setDraftFilters((previous) => ({
            ...previous,
            ...changes,
        }));
    };

    /* =====================================================
       APPLY FILTERS
    ===================================================== */

    const handleSearch = () => {
        if (
            draftFilters.fromDate &&
            draftFilters.toDate &&
            new Date(draftFilters.fromDate) >
            new Date(draftFilters.toDate)
        ) {
            toast.error(
                "From date cannot be later than To date."
            );

            return;
        }

        dispatch(
            setAuditLogFilters(draftFilters)
        );

        dispatch(setAuditLogPage(0));
    };

    /* =====================================================
       RESET FILTERS
    ===================================================== */

    const handleResetFilters = () => {
        setDraftFilters({
            entityName: "",
            entityId: "",
            action: "",
            performedBy: "",
            performedByType: "",
            keyword: "",
            fromDate: "",
            toDate: "",
            sortBy: "createdAt",
            sortDirection: "DESC",
        });

        dispatch(resetAuditLogFilters());
    };

    /* =====================================================
       TABLE PAGINATION
    ===================================================== */

    const handlePageChange = (page) => {
        dispatch(setAuditLogPage(page));
    };

    const handlePageSizeChange = (size) => {
        dispatch(setAuditLogPageSize(size));
    };

    /* =====================================================
       VIEW AUDIT DETAILS
    ===================================================== */

    const handleViewAudit = (audit) => {
        navigate(`/audit-logs/view/${audit.id}`);
    };

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
       ACCESS DENIED
    ===================================================== */

    if (!canViewAuditLogs) {
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

                    <h2 className="text-lg font-semibold text-gray-800">
                        Access Denied
                    </h2>

                    <p className="mt-1 max-w-sm text-sm text-gray-500">
                        You do not have permission to view audit logs.
                    </p>

                </div>
            </div>
        );
    }

    /* =====================================================
       PAGE
    ===================================================== */

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

                    {/* NAVBAR */}

                    <NavbarAuditLog
                        title="Audit Logs"
                        subtitle="Monitor and track all system activities"
                        loading={loading}
                        onRefresh={handleRefresh}
                    />

                    {/* OVERVIEW */}

                    <AuditLogOverview
                        selectedModule={
                            filters.entityName || "ALL"
                        }
                        onModuleChange={handleModuleChange}
                        totalElements={totalElements}
                        loading={loading}
                    />

                    {/* FILTER TOGGLE */}

                    <div className="
                            mb-3 flex items-center justify-between
                            px-2
                        ">

                        <p className="text-sm font-semibold text-gray-700">
                            Audit Activities
                        </p>

                        <button
                            type="button"
                            onClick={() => setShowFilters((previous) => !previous)}
                            className="
            flex items-center gap-2 rounded-lg
            border border-gray-200 bg-white
            px-4 py-2 text-xs font-medium
            text-gray-600 shadow-sm transition
            hover:border-blue-300 hover:bg-blue-50
            hover:text-blue-600
        "
                        >
                            <icon name="sliders-horizontal" size={15} />

                            {showFilters ? "Hide Filters" : "Show Filters"}

                            <icon
                                name={showFilters ? "chevron-up" : "chevron-down"}
                                size={14}
                            />
                        </button>

                    </div>

                    {/* FILTERS */}

                    {showFilters && (
                        <div className="mb-4">
                            <AuditLogFilters
                                filters={draftFilters}
                                onChange={handleFilterChange}
                                onSearch={handleSearch}
                                onReset={handleResetFilters}
                            />
                        </div>
                    )}

                    {/* ERROR */}

                    {error && (
                        <div className="
                            mx-2 mb-4 rounded-md
                            border border-red-200
                            bg-red-50 px-4 py-3
                            text-sm text-red-600
                        ">
                            {error}
                        </div>
                    )}

                    {/* AUDIT TABLE */}

                    {loading && !auditLogs.length ? (
                        <div className="
                            flex min-h-[250px]
                            items-center justify-center
                        ">
                            <p className="text-sm text-gray-500">
                                Loading audit logs...
                            </p>
                        </div>
                    ) : auditLogs.length > 0 ? (
                        <AuditLogTable
                            auditLogs={auditLogs}
                            onView={handleViewAudit}
                            onPageChange={handlePageChange}
                            onPageSizeChange={handlePageSizeChange}
                        />
                    ) : (
                        <div className="
                            flex min-h-[300px] flex-col
                            items-center justify-center gap-3
                            rounded-xl border border-gray-200
                            bg-white px-4
                        ">

                            <div className="
                                flex h-20 w-20 items-center
                                justify-center rounded-full
                                bg-gray-100 text-gray-400
                            ">
                                <FileText size={36} />
                            </div>

                            <p className="text-base font-medium text-gray-800">
                                No audit activities found
                            </p>

                            <p className="max-w-sm text-center text-sm text-gray-500">
                                No audit records match your selected
                                module or filters.
                            </p>

                        </div>
                    )}

                </div>

            </div>

        </div>
    );
}
