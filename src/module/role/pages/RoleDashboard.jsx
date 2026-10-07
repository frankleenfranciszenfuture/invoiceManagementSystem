
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

import RoleTable
    from "./RoleTable";

import NavbarRole
    from "../components/bars/nav/NavbarRole";

import {
    fetchAllRoles,
} from "../thunks/roleThunks";

import {
    getUserPermission,
} from "../../menuPermission/thunks/menuPermissionThunks";

import {
    setRoleStatus,
    setSelectedRoleView,
} from "../slices/roleViewSlice";

import {
    openModal,
} from "../../ui/uiSlice";

import InvoiceSkeleton
    from "../../../common/loader/InvoiceSkeleton";


export default function RoleDashboard() {

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
                state.menuPermission
                    ?.userPermissions
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
    // NORMALIZE HELPERS
    // ============================================================

    const normalizeModule = (
        value
    ) =>
        String(value ?? "")
            .trim()
            .toLowerCase();


    const normalizeAction = (
        value
    ) =>
        String(value ?? "")
            .trim()
            .toUpperCase();


    // ============================================================
    // ROLE / USER ROLE
    // ============================================================

    const roleName =
        user?.roleName ||
        user?.role?.roleName ||
        user?.role?.name ||
        user?.role ||
        user?.authority ||
        "";


    const normalizedRole =
        normalizeAction(
            roleName
        );


    const isSuperAdmin =
        normalizedRole ===
        "SUPER_ADMIN";


    const isAdmin =
        normalizedRole ===
        "ADMIN";


    const hasFullAccess =
        isSuperAdmin ||
        isAdmin;


    // ============================================================
    // HAS PERMISSION
    // ============================================================

    const hasPermission = (
        moduleName,
        actionName
    ) => {

        // --------------------------------------------------------
        // SUPER ADMIN / ADMIN
        // --------------------------------------------------------

        if (hasFullAccess) {
            return true;
        }


        // --------------------------------------------------------
        // PERMISSION ARRAY
        // --------------------------------------------------------

        if (!Array.isArray(permissions)) {
            return false;
        }


        const requestedModule =
            normalizeModule(
                moduleName
            );


        const requestedAction =
            normalizeAction(
                actionName
            );


        // --------------------------------------------------------
        // FIND PERMISSION
        // --------------------------------------------------------

        return permissions.some(
            (permission) => {

                // ==================================================
                // MODULE
                // ==================================================

                const permissionModule =
                    normalizeModule(
                        permission?.moduleName ||
                        permission?.module?.moduleName ||
                        permission?.module?.name ||
                        ""
                    );


                if (
                    permissionModule !==
                    requestedModule
                ) {
                    return false;
                }


                // ==================================================
                // MODULE ACTIVE STATUS
                // ==================================================

                if (
                    permission?.active === false
                ) {
                    return false;
                }


                if (
                    normalizeAction(
                        permission?.status
                    ) ===
                    "INACTIVE"
                ) {
                    return false;
                }


                // ==================================================
                // ACTION ARRAY
                // ==================================================

                if (
                    Array.isArray(
                        permission?.actions
                    )
                ) {

                    return permission.actions.some(
                        (action) => {

                            // --------------------------------------
                            // STRING ACTION
                            // --------------------------------------

                            if (
                                typeof action ===
                                "string"
                            ) {

                                return (
                                    normalizeAction(
                                        action
                                    ) ===
                                    requestedAction
                                );

                            }


                            // --------------------------------------
                            // OBJECT ACTION
                            // --------------------------------------

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


                            // --------------------------------------
                            // ACTION ACTIVE STATUS
                            // --------------------------------------

                            if (
                                action?.active === false
                            ) {
                                return false;
                            }


                            if (
                                normalizeAction(
                                    action?.status
                                ) ===
                                "INACTIVE"
                            ) {
                                return false;
                            }


                            return (
                                permissionAction ===
                                requestedAction &&
                                allowed
                            );

                        }
                    );

                }


                // ==================================================
                // DIRECT / FLAT ACTION
                // ==================================================

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
                    permissionAction ===
                    requestedAction &&
                    allowed
                );

            }
        );

    };


    // ============================================================
    // ROLE PERMISSIONS
    // ============================================================

    const canViewRole =
        hasPermission(
            "Roles",
            "VIEW"
        );


    const canCreateRole =
        hasPermission(
            "Roles",
            "CREATE"
        );


    // ============================================================
    // ROLE STATE
    // ============================================================

    const rolesFromRedux = useSelector(
        (state) =>
            state.role?.roles
    );


    const roles =
        rolesFromRedux ?? [];


    const loading = useSelector(
        (state) =>
            state.role?.loading ||
            false
    );


    const error = useSelector(
        (state) =>
            state.role?.error
    );


    // ============================================================
    // ROLE FILTER STATE
    // ============================================================

    const roleStatus = useSelector(
        (state) =>
            state.roleView?.roleStatus ||
            "ALL"
    );


    // ============================================================
    // LOAD CURRENT USER PERMISSIONS
    // ============================================================

    useEffect(() => {

        // --------------------------------------------------------
        // AUTH CHECKING
        // --------------------------------------------------------

        if (authChecking) {
            return;
        }


        // --------------------------------------------------------
        // NOT AUTHENTICATED
        // --------------------------------------------------------

        if (!isAuthenticated) {
            return;
        }


        // --------------------------------------------------------
        // ADMIN / SUPER ADMIN
        //
        // No permission request required.
        // --------------------------------------------------------

        if (hasFullAccess) {
            return;
        }


        // --------------------------------------------------------
        // ALREADY LOADED
        // --------------------------------------------------------

        if (permissionsLoaded) {
            return;
        }


        // --------------------------------------------------------
        // CURRENTLY LOADING
        // --------------------------------------------------------

        if (permissionLoading) {
            return;
        }


        // --------------------------------------------------------
        // LOAD CURRENT USER EFFECTIVE PERMISSIONS
        // --------------------------------------------------------

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
    // FETCH ROLES
    // ============================================================

    useEffect(() => {

        // --------------------------------------------------------
        // AUTH CHECKING
        // --------------------------------------------------------

        if (authChecking) {
            return;
        }


        // --------------------------------------------------------
        // NOT AUTHENTICATED
        // --------------------------------------------------------

        if (!isAuthenticated) {
            return;
        }


        // --------------------------------------------------------
        // STAFF / OTHER ROLE
        //
        // Wait until permissions are loaded.
        // --------------------------------------------------------

        if (!hasFullAccess) {

            if (!permissionsLoaded) {
                return;
            }


            if (permissionLoading) {
                return;
            }


            // ----------------------------------------------------
            // NO VIEW PERMISSION
            // ----------------------------------------------------

            if (!canViewRole) {
                return;
            }

        }


        // --------------------------------------------------------
        // FETCH ROLES
        // --------------------------------------------------------

        dispatch(
            fetchAllRoles()
        );

    }, [
        authChecking,
        isAuthenticated,
        hasFullAccess,
        permissionsLoaded,
        permissionLoading,
        canViewRole,
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
            params.get(
                "roleStatus"
            );


        if (!urlStatus) {
            return;
        }


        const normalizedStatus =
            String(
                urlStatus
            ).toUpperCase();


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
            setRoleStatus(
                normalizedStatus
            )
        );


        const statusLabels = {

            ALL:
                "All Roles",

            ACTIVE:
                "Active Roles",

            INACTIVE:
                "Inactive Roles",

            DRAFT:
                "Draft Roles",

        };


        dispatch(
            setSelectedRoleView(
                statusLabels[
                normalizedStatus
                ]
            )
        );

    }, [
        dispatch,
    ]);


    // ============================================================
    // DEBUG
    // ============================================================

    useEffect(() => {

        console.log(
            "================================"
        );

        console.log(
            "ROLE USER:",
            user
        );

        console.log(
            "ROLE NAME:",
            normalizedRole
        );

        console.log(
            "ROLE FULL ACCESS:",
            hasFullAccess
        );

        console.log(
            "ROLE PERMISSIONS LOADING:",
            permissionLoading
        );

        console.log(
            "ROLE PERMISSIONS LOADED:",
            permissionsLoaded
        );

        console.log(
            "ROLE PERMISSIONS:",
            permissions
        );

        console.log(
            "ROLE VIEW PERMISSION:",
            canViewRole
        );

        console.log(
            "ROLE CREATE PERMISSION:",
            canCreateRole
        );

        console.log(
            "ROLES FROM REDUX:",
            roles
        );

        console.log(
            "ROLE LOADING:",
            loading
        );

        console.log(
            "ROLE ERROR:",
            error
        );

        console.log(
            "ROLE STATUS:",
            roleStatus
        );

        console.log(
            "================================"
        );

    }, [
        user,
        normalizedRole,
        hasFullAccess,
        permissionLoading,
        permissionsLoaded,
        permissions,
        canViewRole,
        canCreateRole,
        roles,
        loading,
        error,
        roleStatus,
    ]);


    // ============================================================
    // FILTER ROLES BY STATUS
    // ============================================================

    const filteredRoles = useMemo(() => {

        const selectedStatus =
            String(
                roleStatus || "ALL"
            )
                .toUpperCase();


        // ========================================================
        // ALL
        // ========================================================

        if (
            selectedStatus ===
            "ALL"
        ) {
            return roles;
        }


        // ========================================================
        // FILTER
        // ========================================================

        return roles.filter(
            (role) => {

                const backendStatus =
                    String(
                        role?.status || ""
                    )
                        .toUpperCase();


                return (
                    backendStatus ===
                    selectedStatus
                );

            }
        );

    }, [
        roles,
        roleStatus,
    ]);


    // ============================================================
    // OPEN CREATE ROLE MODAL
    // ============================================================

    const handleCreateRole = () => {

        // --------------------------------------------------------
        // AUTH CHECK
        // --------------------------------------------------------

        if (!isAuthenticated) {
            return;
        }


        // --------------------------------------------------------
        // PERMISSION LOADING
        // --------------------------------------------------------

        if (
            !hasFullAccess &&
            (
                permissionLoading ||
                !permissionsLoaded
            )
        ) {
            return;
        }


        // --------------------------------------------------------
        // CREATE PERMISSION
        // --------------------------------------------------------

        if (!canCreateRole) {

            toast.error(
                "You do not have permission to create roles."
            );

            return;
        }


        // --------------------------------------------------------
        // OPEN MODAL
        // --------------------------------------------------------

        dispatch(
            openModal({
                type: "addRole",
            })
        );

    };


    // ============================================================
    // AUTH CHECKING
    // ============================================================

    if (authChecking) {

        return (
            <InvoiceSkeleton />
        );

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

        return (
            <InvoiceSkeleton />
        );

    }


    // ============================================================
    // VIEW PERMISSION DENIED
    // ============================================================

    if (!canViewRole) {

        return (
            <div
                className="
                    flex
                    h-screen
                    items-center
                    justify-center
                    bg-gray-50
                    font-sans
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
                            mx-auto
                            mb-4
                            w-16
                            h-16
                            rounded-full
                            bg-red-50
                            flex
                            items-center
                            justify-center
                            text-red-500
                            text-2xl
                            font-semibold
                        "
                    >
                        !
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
                            max-w-sm
                        "
                    >
                        You do not have permission
                        to view roles.
                    </p>

                </div>

            </div>
        );

    }


    // ============================================================
    // ROLE LOADING
    // ============================================================

    if (loading) {

        return (
            <InvoiceSkeleton />
        );

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
                        ROLE NAVBAR
                    ================================================= */}

                    <NavbarRole />


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
                        ROLE TABLE / EMPTY STATE
                    ================================================= */}

                    {filteredRoles.length > 0 ? (

                        <RoleTable
                            roles={
                                filteredRoles
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

                            {/* =================================================
                                EMPTY STATE ICON
                            ================================================= */}

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
                                    R
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


                            {/* =================================================
                                EMPTY STATE TITLE
                            ================================================= */}

                            <p
                                className="
                                    text-base
                                    font-medium
                                    text-gray-800
                                    text-center
                                "
                            >
                                Every setup starts with a role
                            </p>


                            {/* =================================================
                                EMPTY STATE DESCRIPTION
                            ================================================= */}

                            <p
                                className="
                                    text-sm
                                    text-gray-500
                                    text-center
                                    max-w-sm
                                "
                            >
                                Create and manage your roles
                                in one place.
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
                                    CREATE ROLE
                                ================================================= */}

                                {canCreateRole && (

                                    <button
                                        type="button"
                                        onClick={
                                            handleCreateRole
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

                                        Create New Role

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


            {/* =========================================================
                ROLE CREATE / EDIT MODAL
            ========================================================= */}

            {/* Global Modal handles RoleCreate */}

        </div>
    );

}
