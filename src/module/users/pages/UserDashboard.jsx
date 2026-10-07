
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

import UserTable from "./UserTable";
import NavbarUser from "../components/bars/nav/NavbarUser";

import {
    fetchAllUsers,
} from "../thunks/userThunks";

import {
    getUserPermission,
} from "../../menuPermission/thunks/menuPermissionThunks";

import {
    setUserStatus,
    setSelectedUserView,
} from "../slices/userViewSlice";

import {
    openModal,
} from "../../ui/uiSlice";

import InvoiceSkeleton from "../../../common/loader/InvoiceSkeleton";


export default function UserDashboard() {

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
        isSuperAdmin ||
        isAdmin;


    // ============================================================
    // PERMISSION CHECK
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
            String(moduleName)
                .trim()
                .toLowerCase();

        const requestedAction =
            String(actionName)
                .trim()
                .toUpperCase();


        return permissions.some(
            (permission) => {

                // ==================================================
                // MODULE
                // ==================================================

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


                // ==================================================
                // ACTIVE STATUS
                // ==================================================

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


                // ==================================================
                // GROUPED ACTIONS
                // ==================================================

                if (
                    Array.isArray(
                        permission?.actions
                    )
                ) {

                    return permission.actions.some(
                        (action) => {

                            // --------------------------------------
                            // ACTION AS STRING
                            // --------------------------------------

                            if (
                                typeof action ===
                                "string"
                            ) {

                                return (
                                    String(action)
                                        .trim()
                                        .toUpperCase() ===
                                    requestedAction
                                );
                            }


                            // --------------------------------------
                            // ACTION NAME
                            // --------------------------------------

                            const permissionAction =
                                String(
                                    action?.actionName ||
                                    action?.action?.actionName ||
                                    action?.action?.name ||
                                    action?.name ||
                                    ""
                                )
                                    .trim()
                                    .toUpperCase();


                            const allowed =
                                action?.allowed === true ||
                                action?.allowed === "true";


                            // --------------------------------------
                            // ACTION STATUS
                            // --------------------------------------

                            if (
                                action?.active === false
                            ) {
                                return false;
                            }


                            if (
                                String(
                                    action?.status || ""
                                )
                                    .trim()
                                    .toUpperCase() ===
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
                // FLAT ACTION
                // ==================================================

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
    // USER PERMISSIONS
    // ============================================================

    const canViewUser =
        hasPermission(
            "Users",
            "VIEW"
        );

    const canCreateUser =
        hasPermission(
            "Users",
            "CREATE"
        );


    // ============================================================
    // USER STATE
    // ============================================================

    const usersFromRedux = useSelector(
        (state) =>
            state.user?.users
    );

    const users =
        usersFromRedux ?? [];


    const loading = useSelector(
        (state) =>
            state.user?.loading ||
            false
    );


    const error = useSelector(
        (state) =>
            state.user?.error
    );


    // ============================================================
    // PAGINATION
    // ============================================================

    const pagination = useSelector(
        (state) =>
            state.user?.pagination || {
                pageNumber: 0,
                pageSize: 10,
                totalElements: 0,
                totalPages: 0,
                last: true,
            }
    );


    // ============================================================
    // USER FILTER STATE
    // ============================================================

    const userStatus = useSelector(
        (state) =>
            state.userView?.userStatus ||
            "ALL"
    );


    const search = useSelector(
        (state) =>
            state.userView?.search ||
            ""
    );


    // ============================================================
    // LOAD CURRENT USER PERMISSIONS
    // ============================================================

    useEffect(() => {

        // --------------------------------------------------------
        // AUTH STILL CHECKING
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
        // LOAD PERMISSIONS
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
    // FETCH USERS
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

            if (!canViewUser) {
                return;
            }
        }


        // --------------------------------------------------------
        // FETCH USERS
        // --------------------------------------------------------

        console.log(
            "Fetching users..."
        );

        dispatch(
            fetchAllUsers({
                page: 0,
                size: 10,
            })
        );

    }, [
        authChecking,
        isAuthenticated,
        hasFullAccess,
        permissionsLoaded,
        permissionLoading,
        canViewUser,
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
                "userStatus"
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
            setUserStatus(
                normalizedStatus
            )
        );


        const statusLabels = {

            ALL:
                "All Users",

            ACTIVE:
                "Active Users",

            INACTIVE:
                "Inactive Users",

            DRAFT:
                "Draft Users",

        };


        dispatch(
            setSelectedUserView(
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
            "USER:",
            user
        );

        console.log(
            "USER ROLE:",
            normalizedRole
        );

        console.log(
            "USER FULL ACCESS:",
            hasFullAccess
        );

        console.log(
            "USER PERMISSIONS LOADING:",
            permissionLoading
        );

        console.log(
            "USER PERMISSIONS LOADED:",
            permissionsLoaded
        );

        console.log(
            "USER PERMISSIONS:",
            permissions
        );

        console.log(
            "USER VIEW PERMISSION:",
            canViewUser
        );

        console.log(
            "USER CREATE PERMISSION:",
            canCreateUser
        );

        console.log(
            "USERS FROM REDUX:",
            users
        );

        console.log(
            "USER LOADING:",
            loading
        );

        console.log(
            "USER ERROR:",
            error
        );

        console.log(
            "USER STATUS:",
            userStatus
        );

        console.log(
            "USER SEARCH:",
            search
        );

        console.log(
            "USER PAGINATION:",
            pagination
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
        canViewUser,
        canCreateUser,
        users,
        loading,
        error,
        userStatus,
        search,
        pagination,
    ]);


    // ============================================================
    // FILTER USERS BY STATUS + SEARCH
    // ============================================================

    const filteredUsers =
        useMemo(() => {

            const selectedStatus =
                String(
                    userStatus ||
                    "ALL"
                ).toUpperCase();


            const normalizedSearch =
                String(
                    search ||
                    ""
                )
                    .trim()
                    .toLowerCase();


            let result =
                users;


            // ====================================================
            // STATUS FILTER
            // ====================================================

            if (
                selectedStatus !==
                "ALL"
            ) {

                result =
                    result.filter(
                        (user) => {

                            const backendStatus =
                                String(
                                    user?.status ||
                                    ""
                                ).toUpperCase();


                            return (
                                backendStatus ===
                                selectedStatus
                            );
                        }
                    );
            }


            // ====================================================
            // SEARCH FILTER
            // ====================================================

            if (
                normalizedSearch
            ) {

                result =
                    result.filter(
                        (user) => {

                            const name =
                                String(
                                    user?.name ||
                                    ""
                                )
                                    .toLowerCase();


                            const email =
                                String(
                                    user?.email ||
                                    ""
                                )
                                    .toLowerCase();


                            const userId =
                                String(
                                    user?.userId ||
                                    ""
                                )
                                    .toLowerCase();


                            const role =
                                String(
                                    user?.role ||
                                    ""
                                )
                                    .toLowerCase();


                            return (
                                name.includes(
                                    normalizedSearch
                                ) ||
                                email.includes(
                                    normalizedSearch
                                ) ||
                                userId.includes(
                                    normalizedSearch
                                ) ||
                                role.includes(
                                    normalizedSearch
                                )
                            );

                        }
                    );
            }


            return result;

        }, [
            users,
            userStatus,
            search,
        ]);


    // ============================================================
    // OPEN CREATE USER MODAL
    // ============================================================

    const handleCreateUser = () => {

        // --------------------------------------------------------
        // AUTH CHECK
        // --------------------------------------------------------

        if (!isAuthenticated) {

            toast.error(
                "Please login to create users."
            );

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

            toast.error(
                "Permissions are still loading. Please try again."
            );

            return;
        }


        // --------------------------------------------------------
        // CREATE PERMISSION
        // --------------------------------------------------------

        if (!canCreateUser) {

            toast.error(
                "You do not have permission to create users."
            );

            return;
        }


        // --------------------------------------------------------
        // OPEN MODAL
        // --------------------------------------------------------

        console.log(
            "Opening Add User modal"
        );


        dispatch(
            openModal({
                type: "addUser",
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

    if (!canViewUser) {

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
                        to view users.
                    </p>

                </div>

            </div>
        );
    }


    // ============================================================
    // USER LOADING
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
                        USER NAVBAR
                    ================================================= */}

                    <NavbarUser />


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
                        USER TABLE / EMPTY STATE
                    ================================================= */}

                    {filteredUsers.length > 0 ? (

                        <UserTable
                            users={
                                filteredUsers
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
                                Every setup starts with a user
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
                                Create and manage your users
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
                                    CREATE USER
                                ================================================= */}

                                {canCreateUser && (

                                    <button
                                        type="button"
                                        onClick={
                                            handleCreateUser
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

                                        Create New User

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
                USER CREATE / EDIT MODAL
            ========================================================= */}

            {/* Global Modal handles UserCreate */}

        </div>
    );
}
