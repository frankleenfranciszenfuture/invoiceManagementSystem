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

import UnitTable from "../pages/UnitTable";
import NavbarUnit from "../components/bars/nav/NavbarUnits";

import {
    fetchAllUnits,
} from "../thunks/unitThunks";

import {
    setUnitStatus,
    setSelectedUnitView,
} from "../slices/unitViewSlice";

import {
    clearError,
} from "../slices/unitSlice";

import {
    openModal,
} from "../../ui/uiSlice";

import InvoiceSkeleton from "../../../common/loader/InvoiceSkeleton";

export default function UnitDashboard() {

    const dispatch = useDispatch();

    // ============================================================
    // AUTH STATE
    // ============================================================

    const user = useSelector(
        (state) => state.auth?.user
    );

    const isAuthenticated = useSelector(
        (state) =>
            state.auth?.isAuthenticated
    );

    const authChecking = useSelector(
        (state) =>
            state.auth?.authChecking
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
            state.menuPermission
                ?.userPermissionsLoading === true
    );

    const permissionsLoaded = useSelector(
        (state) =>
            state.menuPermission
                ?.userPermissionsLoaded === true
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
    // PERMISSION CHECK
    // ============================================================

    const hasPermission = (
        moduleName,
        actionName
    ) => {

        // SUPER_ADMIN / ADMIN
        if (hasFullAccess) {
            return true;
        }

        if (!Array.isArray(permissions)) {
            return false;
        }

        const requestedModule =
            String(moduleName)
                .trim()
                .toLowerCase();

        const requestedAction =
            String(actionName)
                .trim()
                .toUpperCase();

        return permissions.some(
            (permission) => {

                const permissionModule =
                    String(
                        permission?.moduleName ||
                        permission?.module?.moduleName ||
                        permission?.module?.name ||
                        ""
                    )
                        .trim()
                        .toLowerCase();

                if (
                    permissionModule !==
                    requestedModule
                ) {
                    return false;
                }

                // =================================================
                // IGNORE INACTIVE PERMISSION
                // =================================================

                if (
                    permission?.active === false
                ) {
                    return false;
                }

                if (
                    String(
                        permission?.status || ""
                    )
                        .trim()
                        .toUpperCase() ===
                    "INACTIVE"
                ) {
                    return false;
                }

                // =================================================
                // GROUPED PERMISSION FORMAT
                // =================================================

                if (
                    Array.isArray(
                        permission?.actions
                    )
                ) {

                    return permission.actions.some(
                        (action) => {

                            const permissionAction =
                                String(
                                    action?.actionName ||
                                    action?.action?.actionName ||
                                    action?.action?.name ||
                                    ""
                                )
                                    .trim()
                                    .toUpperCase();

                            const allowed =
                                action?.allowed === true ||
                                action?.allowed === "true";

                            return (
                                permissionAction ===
                                requestedAction &&
                                allowed
                            );
                        }
                    );
                }

                // =================================================
                // FLAT PERMISSION FORMAT
                // =================================================

                const permissionAction =
                    String(
                        permission?.actionName ||
                        permission?.action?.actionName ||
                        permission?.action?.name ||
                        ""
                    )
                        .trim()
                        .toUpperCase();

                const allowed =
                    permission?.allowed === true ||
                    permission?.allowed === "true";

                return (
                    permissionAction ===
                    requestedAction &&
                    allowed
                );
            }
        );
    };

    // ============================================================
    // UNIT PERMISSIONS
    // ============================================================

    const canViewUnit =
        hasPermission(
            "Units",
            "VIEW"
        );

    const canCreateUnit =
        hasPermission(
            "Units",
            "CREATE"
        );

    // ============================================================
    // UNIT STATE
    // ============================================================

    const unitsFromRedux =
        useSelector(
            (state) =>
                state.unit?.units
        );

    const units =
        unitsFromRedux ?? [];

    const loading =
        useSelector(
            (state) =>
                state.unit?.loading || false
        );

    const error =
        useSelector(
            (state) =>
                state.unit?.error
        );

    // ============================================================
    // UNIT FILTER STATE
    // ============================================================

    const unitStatus =
        useSelector(
            (state) =>
                state.unitView?.unitStatus ||
                "ALL"
        );

    // ============================================================
    // FETCH UNITS
    //
    // IMPORTANT:
    // STAFF must have VIEW permission before API call.
    // ============================================================

    useEffect(() => {

        if (authChecking) {
            return;
        }

        if (!isAuthenticated) {
            return;
        }

        // ADMIN / SUPER_ADMIN
        // can directly fetch.
        if (!hasFullAccess) {

            // Wait for permission request.
            if (permissionLoading) {
                return;
            }

            // Wait until permission state is initialized.
            if (!permissionsLoaded) {
                return;
            }

            // No VIEW permission.
            if (!canViewUnit) {
                return;
            }
        }

        dispatch(
            fetchAllUnits()
        );

    }, [
        dispatch,
        authChecking,
        isAuthenticated,
        hasFullAccess,
        permissionLoading,
        permissionsLoaded,
        canViewUnit,
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
            params.get(
                "unitStatus"
            );

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

        if (
            !validStatuses.includes(
                normalizedStatus
            )
        ) {
            return;
        }

        dispatch(
            setUnitStatus(
                normalizedStatus
            )
        );

        const statusLabels = {
            ALL:
                "All Units",

            ACTIVE:
                "Active Units",

            INACTIVE:
                "Inactive Units",

            DRAFT:
                "Draft Units",
        };

        dispatch(
            setSelectedUnitView(
                statusLabels[
                normalizedStatus
                ]
            )
        );

    }, [dispatch]);

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
                    clearError()
                );

            }, 2000);

        return () =>
            clearTimeout(timer);

    }, [
        error,
        dispatch,
    ]);

    // ============================================================
    // FILTER UNITS BY STATUS
    // ============================================================

    const filteredUnits =
        useMemo(() => {

            const selectedStatus =
                String(
                    unitStatus ||
                    "ALL"
                )
                    .toUpperCase();

            // ====================================================
            // ALL
            // ====================================================

            if (
                selectedStatus === "ALL"
            ) {
                return units;
            }

            // ====================================================
            // FILTER
            // ====================================================

            return units.filter(
                (unit) => {

                    const backendStatus =
                        String(
                            unit?.status ||
                            ""
                        )
                            .toUpperCase();

                    return (
                        backendStatus ===
                        selectedStatus
                    );
                }
            );

        }, [
            units,
            unitStatus,
        ]);

    // ============================================================
    // OPEN CREATE UNIT MODAL
    // ============================================================

    const handleCreateUnit = () => {

        // ========================================================
        // PERMISSION LOADING
        // ========================================================

        if (
            !hasFullAccess &&
            !permissionsLoaded
        ) {

            toast.error(
                "Permissions are still loading. Please try again."
            );

            return;
        }

        // ========================================================
        // CREATE PERMISSION
        // ========================================================

        if (!canCreateUnit) {

            toast.error(
                "You do not have permission to create units."
            );

            return;
        }

        // ========================================================
        // OPEN MODAL
        // ========================================================

        dispatch(
            openModal({
                type: "addUnit",
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

    if (
        !hasFullAccess &&
        !canViewUnit
    ) {

        return (
            <div
                className="
                    flex
                    h-screen
                    bg-gray-50
                    font-sans
                    text-[13px]
                    overflow-hidden
                "
            >

                <div
                    className="
                        flex-1
                        flex
                        items-center
                        justify-center
                    "
                >

                    <div
                        className="
                            text-center
                            px-6
                        "
                    >

                        <div
                            className="
                                w-14
                                h-14
                                rounded-full
                                bg-red-50
                                flex
                                items-center
                                justify-center
                                mx-auto
                                mb-4
                            "
                        >

                            <span
                                className="
                                    text-red-500
                                    text-xl
                                    font-semibold
                                "
                            >
                                !
                            </span>

                        </div>

                        <h2
                            className="
                                text-lg
                                font-semibold
                                text-gray-800
                            "
                        >
                            Access Denied
                        </h2>

                        <p
                            className="
                                mt-1
                                text-sm
                                text-gray-500
                            "
                        >
                            You do not have permission
                            to view units.
                        </p>

                    </div>

                </div>

            </div>
        );
    }

    // ============================================================
    // UNIT API LOADING
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
                flex
                h-screen
                bg-gray-50
                font-sans
                text-[13px]
                overflow-hidden
            "
        >

            <div
                className="
                    flex-1
                    min-h-0
                    bg-white
                    overflow-y-auto
                "
            >

                <div
                    className="
                        px-2
                        py-5
                        max-w-30xl
                        w-full
                    "
                >

                    {/* =================================================
                        UNIT NAVBAR
                    ================================================= */}

                    <NavbarUnit />

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
                        UNIT TABLE / EMPTY STATE
                    ================================================= */}

                    {filteredUnits.length > 0 ? (

                        <UnitTable
                            units={
                                filteredUnits
                            }
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

                            {/* EMPTY STATE ICON */}

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

                                <div
                                    className="
                                        text-gray-400
                                        text-4xl
                                    "
                                >
                                    U
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

                                    <Plus
                                        className="
                                            w-4
                                            h-4
                                        "
                                    />

                                </div>

                            </div>

                            {/* EMPTY STATE TITLE */}

                            <p
                                className="
                                    text-base
                                    font-medium
                                    text-gray-800
                                    text-center
                                "
                            >
                                Every setup starts with a unit
                            </p>

                            {/* EMPTY STATE DESCRIPTION */}

                            <p
                                className="
                                    text-sm
                                    text-gray-500
                                    text-center
                                    max-w-sm
                                "
                            >
                                Create and manage your units
                                in one place.
                            </p>

                            {/* ACTION BUTTONS */}

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

                                {/* CREATE UNIT */}

                                {canCreateUnit && (

                                    <button
                                        type="button"
                                        onClick={
                                            handleCreateUnit
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

                                        <Plus
                                            className="
                                                w-4
                                                h-4
                                            "
                                        />

                                        Create New Unit

                                    </button>

                                )}

                                {/* IMPORT */}

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

                                    <Download
                                        className="
                                            w-4
                                            h-4
                                        "
                                    />

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