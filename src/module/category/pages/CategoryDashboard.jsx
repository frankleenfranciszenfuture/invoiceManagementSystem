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

import CategoryTable from "./CategoryTable";
import NavbarCategory from "../components/bars/nav/NavbarCategory";

import {
    fetchAllCategories,
} from "../thunks/categoryThunks";

import {
    getUserPermission,
} from "../../menuPermission/thunks/menuPermissionThunks";

import {
    setCategoryStatus,
    setSelectedCategoryView,
    clearError,
} from "../slices/categorySlice";

import {
    openModal,
} from "../../ui/uiSlice";

import InvoiceSkeleton from "../../../common/loader/InvoiceSkeleton";

// ============================================================
// CATEGORY DASHBOARD
// ============================================================

export default function CategoryDashboard() {

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
            state.menuPermission?.userPermissions || []
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

        // --------------------------------------------------------
        // SUPPORT BOTH:
        //
        // 1. Flat permission:
        // {
        //     moduleName: "Categories",
        //     actionName: "CREATE",
        //     allowed: true
        // }
        //
        // 2. Grouped permission:
        // {
        //     moduleName: "Categories",
        //     actions: [
        //         {
        //             actionName: "CREATE",
        //             allowed: true
        //         }
        //     ]
        // }
        // --------------------------------------------------------

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
                    ).trim().toUpperCase() ===
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
    // CATEGORY PERMISSIONS
    // ============================================================

    const canViewCategory =
        hasPermission(
            "Categories",
            "VIEW"
        );

    const canCreateCategory =
        hasPermission(
            "Categories",
            "CREATE"
        );

    // ============================================================
    // CATEGORY STATE
    // ============================================================

    const categoriesFromRedux =
        useSelector(
            (state) =>
                state.category?.categories
        );

    const categories =
        categoriesFromRedux ?? [];

    const loading =
        useSelector(
            (state) =>
                state.category?.loading || false
        );

    const error =
        useSelector(
            (state) =>
                state.category?.error
        );

    // ============================================================
    // CATEGORY FILTER STATE
    // ============================================================

    const categoryStatus =
        useSelector(
            (state) =>
                state.categoryView?.categoryStatus ||
                "ALL"
        );

    // ============================================================
    // LOAD CURRENT USER PERMISSIONS
    //
    // NOTE:
    //
    // Ideally this should happen in AuthSlice/bootstrap.
    // This fallback ensures CategoryDashboard can still
    // initialize permissions if AuthSlice has not done so.
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
    // FETCH CATEGORIES
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

            // No VIEW permission
            if (!canViewCategory) {
                return;
            }
        }

        // --------------------------------------------------------
        // FETCH CATEGORIES
        // --------------------------------------------------------

        dispatch(
            fetchAllCategories()
        );

    }, [
        authChecking,
        isAuthenticated,
        hasFullAccess,
        permissionsLoaded,
        permissionLoading,
        canViewCategory,
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
                "categoryStatus"
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
            setCategoryStatus(
                normalizedStatus
            )
        );

        const statusLabels = {

            ALL:
                "All Categories",

            ACTIVE:
                "Active Categories",

            INACTIVE:
                "Inactive Categories",

            DRAFT:
                "Draft Categories",
        };

        dispatch(
            setSelectedCategoryView(
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
            "CATEGORY USER:",
            user
        );

        console.log(
            "CATEGORY ROLE:",
            normalizedRole
        );

        console.log(
            "CATEGORY FULL ACCESS:",
            hasFullAccess
        );

        console.log(
            "CATEGORY PERMISSIONS LOADING:",
            permissionLoading
        );

        console.log(
            "CATEGORY PERMISSIONS LOADED:",
            permissionsLoaded
        );

        console.log(
            "CATEGORY PERMISSIONS:",
            permissions
        );

        console.log(
            "CATEGORY VIEW PERMISSION:",
            canViewCategory
        );

        console.log(
            "CATEGORY CREATE PERMISSION:",
            canCreateCategory
        );

        console.log(
            "CATEGORIES FROM REDUX:",
            categories
        );

        console.log(
            "CATEGORY LOADING:",
            loading
        );

        console.log(
            "CATEGORY ERROR:",
            error
        );

        console.log(
            "CATEGORY STATUS:",
            categoryStatus
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
        canViewCategory,
        canCreateCategory,
        categories,
        loading,
        error,
        categoryStatus,
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
                    clearError()
                );

            }, 3000);

        return () =>
            clearTimeout(timer);

    }, [
        error,
        dispatch,
    ]);

    // ============================================================
    // FILTER CATEGORIES BY STATUS
    // ============================================================

    const filteredCategories =
        useMemo(() => {

            const selectedStatus =
                String(
                    categoryStatus || "ALL"
                ).toUpperCase();

            // ----------------------------------------------------
            // ALL
            // ----------------------------------------------------

            if (
                selectedStatus === "ALL"
            ) {
                return categories;
            }

            // ----------------------------------------------------
            // FILTER
            // ----------------------------------------------------

            return categories.filter(
                (category) => {

                    const backendStatus =
                        String(
                            category?.status || ""
                        ).toUpperCase();

                    return (
                        backendStatus ===
                        selectedStatus
                    );
                }
            );

        }, [
            categories,
            categoryStatus,
        ]);

    // ============================================================
    // OPEN CREATE CATEGORY MODAL
    // ============================================================

    const handleCreateCategory = () => {

        // --------------------------------------------------------
        // CREATE PERMISSION
        // --------------------------------------------------------

        if (!canCreateCategory) {

            toast.error(
                "You do not have permission to create categories."
            );

            return;
        }

        // --------------------------------------------------------
        // OPEN MODAL
        // --------------------------------------------------------

        dispatch(
            openModal({
                type: "addCategory",
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

    if (!canViewCategory) {

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
                        to view categories.
                    </p>

                </div>

            </div>
        );
    }

    // ============================================================
    // CATEGORY LOADING
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
                        CATEGORY NAVBAR
                    ================================================= */}

                    <NavbarCategory />

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
                        CATEGORY TABLE / EMPTY STATE
                    ================================================= */}

                    {filteredCategories.length > 0 ? (

                        <CategoryTable
                            categories={
                                filteredCategories
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
                                    C
                                </div>

                                <div
                                    className="
                                        absolute
                                        bottom-1
                                        right-1
                                        w-7
                                        h-7
                                        rounded-full
                                        bg-blue-600
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
                                Every product starts with a category
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
                                Create and manage your categories
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
                                    CREATE CATEGORY
                                ================================================= */}

                                {canCreateCategory && (

                                    <button
                                        type="button"
                                        onClick={
                                            handleCreateCategory
                                        }
                                        className="
                                            flex
                                            items-center
                                            gap-2
                                            bg-blue-600
                                            text-white
                                            text-sm
                                            font-medium
                                            px-4
                                            py-2
                                            rounded-md
                                            hover:bg-blue-700
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

                                        Create New Category

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
                CATEGORY CREATE / EDIT MODAL
            ========================================================= */}

            {/* Global Modal handles CategoryCreate */}

        </div>
    );
}