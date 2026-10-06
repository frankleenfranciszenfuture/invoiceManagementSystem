
import React from "react";

import {
    NavLink,
    useNavigate,
    useLocation,
} from "react-router-dom";

import {
    useDispatch,
    useSelector,
} from "react-redux";

import {
    showLeaveDialog,
    toggleSidebar,
} from "../../module/ui/uiSlice";

import UnsavedChangesDialog from "../dialogue/UnsavedChangesDialog";

import {
    Sparkles,
    ChevronRight,
    ChevronDown,
    LayoutDashboard,
    Users,
    FileText,
    Wallet,
    Plus,
    TrendingUp,
    Menu,
    X,
    Package,
} from "lucide-react";


// ============================================================
// NAVIGATION
// ============================================================

const NAV = [
    {
        label: "Dashboard",
        moduleName: "Dashboard",
        icon: LayoutDashboard,
        to: "/dashboard",
    },

    {
        label: "Customers",
        moduleName: "Customers",
        icon: Users,
        to: "/customers",
        addTo: "/customers/new",
        queryKey: "status",
        dropdown: true,

        children: [
            {
                label: "Customers",
                to: "/customers",
            },
        ],
    },

    {
        label: "Items",
        moduleName: "Products",
        icon: Package,
        to: "/items",
        addTo: "/items/newSimple",
        basePath: "/items",
        dropdown: true,

        children: [
            {
                label: "Items",
                to: "/items",
            },
        ],
    },

    {
        label: "Invoices",
        moduleName: "Invoices",
        icon: FileText,
        to: "/invoices",
        addTo: "/invoices/new",
        basePath: "/invoices",
        dropdown: true,

        children: [
            {
                label: "Invoices",
                to: "/invoices",
            },
        ],
    },

    {
        label: "Payments",
        moduleName: "Payments",
        icon: Wallet,
        to: "/payments",
        addTo: "/payments/new",
        queryKey: "status",
        dropdown: true,

        children: [
            {
                label: "All",
                status: "ALL",
            },
            {
                label: "Active",
                status: "ACTIVE",
            },
            {
                label: "Inactive",
                status: "INACTIVE",
            },
            {
                label: "Draft",
                status: "DRAFT",
            },
        ],
    },
];


// ============================================================
// EMPTY VALUES
// ============================================================

const EMPTY_PERMISSIONS = [];


// ============================================================
// NORMALIZE ACTION
// ============================================================

const normalizeAction = (action) => {
    if (action == null) {
        return "";
    }

    return String(action)
        .trim()
        .toUpperCase();
};


// ============================================================
// NORMALIZE MODULE
// ============================================================

const normalizeModule = (moduleName) => {
    if (moduleName == null) {
        return "";
    }

    return String(moduleName)
        .trim()
        .toLowerCase();
};


// ============================================================
// NORMALIZE PERMISSION ARRAY
// ============================================================

const normalizePermissionArray = (value) => {
    if (Array.isArray(value)) {
        return value;
    }

    if (Array.isArray(value?.data)) {
        return value.data;
    }

    if (Array.isArray(value?.content)) {
        return value.content;
    }

    return EMPTY_PERMISSIONS;
};


// ============================================================
// GET ROLE NAME
// ============================================================

const getRoleName = (user) => {
    if (!user) {
        return "";
    }

    const role =
        user?.roleName ||
        user?.role?.roleName ||
        user?.role?.name ||
        user?.role ||
        user?.authority ||
        "";

    return String(role)
        .trim()
        .toUpperCase();
};


// ============================================================
// SIDEBAR
// ============================================================

const Sidebar = () => {

    const dispatch = useDispatch();

    const navigate = useNavigate();

    const location = useLocation();


    // ========================================================
    // SIDEBAR STATE
    // ========================================================

    const open = useSelector(
        (state) =>
            state.ui?.sidebarOpen
    );


    // ========================================================
    // AUTH STATE
    // ========================================================

    const currentUser = useSelector(
        (state) =>
            state.auth?.user || null
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
    // ROLE PERMISSIONS
    // ========================================================

    const rolePermissionsState = useSelector(
        (state) =>
            state.menuPermission?.rolePermissions ||
            EMPTY_PERMISSIONS
    );


    // ========================================================
    // DIRECT USER PERMISSIONS
    // ========================================================

    const userPermissionsState = useSelector(
        (state) =>
            state.menuPermission?.userPermissions ||
            EMPTY_PERMISSIONS
    );


    // ========================================================
    // PERMISSION LOADING
    // ========================================================

    const permissionLoading = useSelector(
        (state) =>
            state.menuPermission?.loading === true
    );


    // ========================================================
    // NORMALIZED ROLE PERMISSIONS
    // ========================================================

    const rolePermissions = React.useMemo(
        () =>
            normalizePermissionArray(
                rolePermissionsState
            ),
        [
            rolePermissionsState,
        ]
    );


    // ========================================================
    // NORMALIZED USER PERMISSIONS
    // ========================================================

    const userPermissions = React.useMemo(
        () =>
            normalizePermissionArray(
                userPermissionsState
            ),
        [
            userPermissionsState,
        ]
    );


    // ========================================================
    // ROLE
    // ========================================================

    const normalizedRoleName = React.useMemo(
        () =>
            getRoleName(
                currentUser
            ),
        [
            currentUser,
        ]
    );


    // ========================================================
    // ADMIN ACCESS
    // ========================================================

    const isSuperAdmin =
        normalizedRoleName === "SUPER_ADMIN";

    const isAdmin =
        normalizedRoleName === "ADMIN";

    const hasFullAccess =
        isSuperAdmin ||
        isAdmin;


    // ========================================================
    // CURRENT USER IDENTIFIER
    // ========================================================

    const currentUserId =
        currentUser?.id ??
        currentUser?.userId ??
        currentUser?.email ??
        currentUser?.username ??
        null;


    // ========================================================
    // EFFECTIVE PERMISSIONS
    // ========================================================

    /*
     * IMPORTANT
     *
     * Role permissions are loaded by authThunks.
     *
     * Direct user permissions are also loaded by authThunks.
     *
     * Sidebar DOES NOT fetch permissions anymore.
     *
     * Priority:
     *
     * ROLE
     *   ↓
     * USER OVERRIDES ROLE
     *
     * Example:
     *
     * Role:
     * Products -> VIEW -> true
     *
     * User:
     * Products -> VIEW -> false
     *
     * Result:
     * Products -> VIEW -> false
     */

    const effectivePermissions =
        React.useMemo(() => {

            if (hasFullAccess) {
                return [];
            }


            const permissionMap =
                new Map();


            // =================================================
            // ROLE PERMISSIONS
            // =================================================

            rolePermissions.forEach(
                (permission) => {

                    /*
                     * FLAT FORMAT
                     *
                     * {
                     *   roleId,
                     *   moduleId,
                     *   actionId,
                     *   moduleName,
                     *   actionName,
                     *   allowed
                     * }
                     */

                    if (
                        permission?.moduleId != null &&
                        permission?.actionId != null
                    ) {

                        const key =
                            `${permission.moduleId}-${permission.actionId}`;

                        permissionMap.set(
                            key,
                            {
                                ...permission,
                                source: "ROLE",
                            }
                        );

                        return;
                    }


                    /*
                     * GROUPED FORMAT
                     *
                     * {
                     *   roleId,
                     *   moduleId,
                     *   moduleName,
                     *   actions: [...]
                     * }
                     */

                    if (
                        Array.isArray(
                            permission?.actions
                        )
                    ) {

                        permission.actions.forEach(
                            (action) => {

                                const key =
                                    `${permission.moduleId}-${action?.actionId}`;

                                permissionMap.set(
                                    key,
                                    {
                                        ...action,

                                        moduleId:
                                            permission?.moduleId,

                                        moduleName:
                                            permission?.moduleName,

                                        roleId:
                                            permission?.roleId,

                                        source:
                                            "ROLE",
                                    }
                                );
                            }
                        );
                    }

                }
            );


            // =================================================
            // USER PERMISSIONS
            // =================================================

            /*
             * User permissions are added AFTER role
             * permissions.
             *
             * Therefore they override role permissions.
             */

            userPermissions.forEach(
                (permission) => {

                    /*
                     * FLAT FORMAT
                     */

                    if (
                        permission?.moduleId != null &&
                        permission?.actionId != null
                    ) {

                        const key =
                            `${permission.moduleId}-${permission.actionId}`;

                        permissionMap.set(
                            key,
                            {
                                ...permission,
                                source: "USER",
                            }
                        );

                        return;
                    }


                    /*
                     * GROUPED FORMAT
                     */

                    if (
                        Array.isArray(
                            permission?.actions
                        )
                    ) {

                        permission.actions.forEach(
                            (action) => {

                                const key =
                                    `${permission.moduleId}-${action?.actionId}`;

                                permissionMap.set(
                                    key,
                                    {
                                        ...action,

                                        moduleId:
                                            permission?.moduleId,

                                        moduleName:
                                            permission?.moduleName,

                                        userId:
                                            permission?.userId,

                                        source:
                                            "USER",
                                    }
                                );
                            }
                        );
                    }

                }
            );


            return Array.from(
                permissionMap.values()
            );

        }, [
            rolePermissions,
            userPermissions,
            hasFullAccess,
        ]);


    // ========================================================
    // DEBUG PERMISSIONS
    // ========================================================

    React.useEffect(() => {

        if (
            authChecking ||
            !isAuthenticated ||
            !currentUser
        ) {
            return;
        }

        console.log(
            "SIDEBAR CURRENT USER:",
            currentUser
        );

        console.log(
            "SIDEBAR ROLE:",
            normalizedRoleName
        );

        console.log(
            "SIDEBAR ROLE PERMISSIONS:",
            rolePermissions
        );

        console.log(
            "SIDEBAR USER PERMISSIONS:",
            userPermissions
        );

        console.log(
            "SIDEBAR EFFECTIVE PERMISSIONS:",
            effectivePermissions
        );

    }, [
        authChecking,
        isAuthenticated,
        currentUser,
        normalizedRoleName,
        rolePermissions,
        userPermissions,
        effectivePermissions,
    ]);


    // ========================================================
    // UNSAVED CHANGES
    // ========================================================

    const isDirty = useSelector(
        (state) =>
            state.customers?.isDirty
    );

    const leaveDialog = useSelector(
        (state) =>
            state.ui?.leaveDialog
    );


    // ========================================================
    // OPEN MENU
    // ========================================================

    const [
        openMenu,
        setOpenMenu
    ] = React.useState(null);


    // ========================================================
    // HAS PERMISSION
    // ========================================================

    const hasPermission = React.useCallback(
        (
            moduleName,
            action = "VIEW"
        ) => {

            /*
             * ================================================
             * FULL ACCESS
             * ================================================
             */

            if (hasFullAccess) {
                return true;
            }


            if (!moduleName) {
                return false;
            }


            const requestedModule =
                normalizeModule(
                    moduleName
                );

            const requestedAction =
                normalizeAction(
                    action
                );


            /*
             * ================================================
             * FIRST TRY FLAT PERMISSIONS
             * ================================================
             */

            const flatPermission =
                effectivePermissions.find(
                    (permission) => {

                        const permissionModule =
                            normalizeModule(
                                permission?.moduleName
                            );

                        const permissionAction =
                            normalizeAction(
                                permission?.actionName
                            );


                        return (
                            permissionModule ===
                            requestedModule &&

                            permissionAction ===
                            requestedAction
                        );
                    }
                );


            if (flatPermission) {

                return (
                    flatPermission?.allowed === true &&

                    flatPermission?.active !== false &&

                    normalizeAction(
                        flatPermission?.status
                    ) !== "INACTIVE"
                );
            }


            /*
             * ================================================
             * GROUPED PERMISSION FALLBACK
             * ================================================
             */

            const groupedPermission =
                effectivePermissions.find(
                    (permission) =>
                        normalizeModule(
                            permission?.moduleName
                        ) ===
                        requestedModule
                );


            if (
                !groupedPermission ||
                !Array.isArray(
                    groupedPermission?.actions
                )
            ) {
                return false;
            }


            return groupedPermission.actions.some(
                (actionItem) => {

                    if (
                        typeof actionItem ===
                        "string"
                    ) {

                        return (
                            normalizeAction(
                                actionItem
                            ) ===
                            requestedAction
                        );
                    }


                    return (
                        normalizeAction(
                            actionItem?.actionName
                        ) ===
                        requestedAction &&

                        actionItem?.allowed === true &&

                        actionItem?.active !== false &&

                        normalizeAction(
                            actionItem?.status
                        ) !== "INACTIVE"
                    );
                }
            );

        }, [
        effectivePermissions,
        hasFullAccess,
    ]
    );


    // ========================================================
    // VIEW PERMISSION
    // ========================================================

    const canView = React.useCallback(
        (moduleName) =>
            hasPermission(
                moduleName,
                "VIEW"
            ),
        [
            hasPermission,
        ]
    );


    // ========================================================
    // CREATE PERMISSION
    // ========================================================

    const canCreate = React.useCallback(
        (moduleName) =>
            hasPermission(
                moduleName,
                "CREATE"
            ),
        [
            hasPermission,
        ]
    );


    // ========================================================
    // ACTIVE ROUTE
    // ========================================================

    const isActiveRoute = (
        path
    ) => {

        if (!path) {
            return false;
        }

        return (
            location.pathname === path ||
            location.pathname.startsWith(
                `${path}/`
            )
        );
    };


    // ========================================================
    // MENU CLICK
    // ========================================================

    const handleMenuClick = (
        item
    ) => {

        if (!item) {
            return;
        }


        if (item.to) {
            navigate(
                item.to
            );
        }


        if (item.children) {

            setOpenMenu(
                (previous) =>
                    previous === item.label
                        ? null
                        : item.label
            );
        }
    };


    // ========================================================
    // AUTO OPEN ACTIVE MENU
    // ========================================================

    React.useEffect(() => {

        const activeItem =
            NAV.find(
                (item) =>
                    item.to &&
                    isActiveRoute(
                        item.to
                    )
            );


        if (
            activeItem?.children
        ) {

            setOpenMenu(
                activeItem.label
            );
        }

    }, [
        location.pathname,
    ]);


    // ========================================================
    // AUTH CHECKING
    // ========================================================

    /*
     * This is the critical part.
     *
     * Sidebar waits for authentication.
     *
     * loginUser/checkAuthentication already load
     * permissions before becoming fulfilled.
     */

    if (authChecking) {

        return (
            <aside
                className="
                    fixed
                    top-0
                    left-0
                    z-30
                    flex
                    h-full
                    w-14
                    flex-col
                    border-r
                    border-white/10
                    bg-[#080c39]
                "
            />
        );
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

    /*
     * Do NOT display the normal sidebar for a normal user
     * while permissions are still loading.
     *
     * ADMIN/SUPER_ADMIN are not dependent on permission APIs.
     */

    if (
        !hasFullAccess &&
        permissionLoading &&
        rolePermissions.length === 0 &&
        userPermissions.length === 0
    ) {

        return (
            <aside
                className="
                    fixed
                    top-0
                    left-0
                    z-30
                    flex
                    h-full
                    w-14
                    items-center
                    justify-center
                    border-r
                    border-white/10
                    bg-[#080c39]
                "
            >

                <div
                    className="
                        h-5
                        w-5
                        animate-spin
                        rounded-full
                        border-2
                        border-gray-500
                        border-t-blue-500
                    "
                />

            </aside>
        );
    }


    // ========================================================
    // RENDER
    // ========================================================

    return (
        <>

            {/* ==================================================
                OVERLAY
            ================================================== */}

            {open && (
                <div
                    className="
                        fixed
                        inset-0
                        z-20
                        bg-black/30
                        lg:hidden
                    "
                    onClick={() =>
                        dispatch(
                            toggleSidebar()
                        )
                    }
                />
            )}


            {/* ==================================================
                SIDEBAR
            ================================================== */}

            <aside
                className={`
                    fixed
                    top-0
                    left-0
                    z-30
                    flex
                    h-full
                    flex-col
                    border-r
                    border-white/10
                    bg-[#080c39]
                    transition-all
                    duration-300

                    ${open
                        ? "w-55"
                        : "w-14 overflow-visible"
                    }
                `}
            >

                {/* ==================================================
                    LOGO
                ================================================== */}

                <div
                    className="
                        flex
                        h-16
                        items-center
                        gap-3
                        border-b
                        border-white/10
                        px-4
                    "
                >

                    <div
                        className="
                            flex
                            h-8
                            w-8
                            items-center
                            justify-center
                            rounded-lg
                            bg-blue-600
                        "
                    >

                        <TrendingUp
                            size={16}
                            className="text-white"
                        />

                    </div>


                    {open && (
                        <span
                            className="
                                text-sm
                                font-semibold
                                text-gray-200
                            "
                        >
                            InvoicePro
                        </span>
                    )}

                </div>


                {/* ==================================================
                    GETTING STARTED
                ================================================== */}

                <div className="mt-3 px-3">

                    <div
                        className="
                            rounded-xl
                            bg-white/5
                            transition
                            hover:bg-white/10
                        "
                    >

                        <button
                            type="button"
                            className="
                                flex
                                w-full
                                items-center
                                justify-between
                                rounded-lg
                                bg-white/5
                                px-3
                                py-2.5
                                transition-colors
                                hover:bg-white/10
                            "
                        >

                            <span
                                className="
                                    flex
                                    min-w-0
                                    flex-1
                                    items-center
                                    gap-2
                                    text-sm
                                    text-white
                                "
                            >

                                <Sparkles
                                    className="
                                        h-4
                                        w-4
                                        flex-shrink-0
                                        text-amber-300
                                    "
                                />

                                <span
                                    className="
                                        truncate
                                        whitespace-nowrap
                                    "
                                >
                                    Getting Started
                                </span>

                            </span>


                            <ChevronRight
                                className="
                                    h-4
                                    w-4
                                    flex-shrink-0
                                    text-gray-400
                                "
                            />

                        </button>


                        <div className="px-3 pb-3">

                            <div
                                className="
                                    h-1
                                    overflow-hidden
                                    rounded-full
                                    bg-white/10
                                "
                            >

                                <div
                                    className="
                                        h-full
                                        w-[15%]
                                        rounded-full
                                        bg-blue-500
                                    "
                                />

                            </div>

                        </div>

                    </div>

                </div>


                {/* ==================================================
                    NAVIGATION
                ================================================== */}

                <nav
                    className="
                        flex-1
                        space-y-1
                        overflow-y-auto
                        px-2
                        py-3
                    "
                >

                    {NAV
                        .filter(
                            (item) =>
                                canView(
                                    item.moduleName
                                )
                        )
                        .map(
                            (item) => {

                                const Icon =
                                    item.icon;


                                const active =
                                    item.to &&
                                    isActiveRoute(
                                        item.to
                                    );


                                return (
                                    <div
                                        key={
                                            item.label
                                        }
                                        className="
                                            group
                                            relative
                                            flex
                                            flex-col
                                        "
                                    >

                                        {/* ==================================================
                                            MAIN ROW
                                        ================================================== */}

                                        <div
                                            className="
                                                flex
                                                items-stretch
                                                justify-between
                                                overflow-visible
                                                rounded-md
                                            "
                                        >

                                            {/* ==================================================
                                                MAIN MENU
                                            ================================================== */}

                                            {item.children ? (

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleMenuClick(
                                                            item
                                                        )
                                                    }
                                                    className={`
                                                        relative
                                                        flex
                                                        flex-1
                                                        items-center
                                                        gap-3
                                                        px-3
                                                        py-2
                                                        text-gray-300
                                                        hover:bg-white/10
                                                        hover:text-white

                                                        ${active
                                                            ? "bg-white/10 text-white"
                                                            : ""
                                                        }
                                                    `}
                                                >

                                                    {open && (
                                                        <ChevronDown
                                                            size={16}
                                                            className={`
                                                                transition-transform
                                                                duration-200

                                                                ${openMenu ===
                                                                    item.label
                                                                    ? "rotate-180"
                                                                    : ""
                                                                }
                                                            `}
                                                        />
                                                    )}


                                                    <Icon
                                                        size={18}
                                                    />


                                                    {open && (
                                                        <span
                                                            className="
                                                                whitespace-nowrap
                                                            "
                                                        >
                                                            {
                                                                item.label
                                                            }
                                                        </span>
                                                    )}

                                                </button>

                                            ) : (

                                                <NavLink
                                                    to={
                                                        item.to
                                                    }
                                                    className={({
                                                        isActive,
                                                    }) =>
                                                        `
                                                            relative
                                                            flex
                                                            flex-1
                                                            items-center
                                                            gap-2
                                                            px-3
                                                            py-2
                                                            transition

                                                            ${isActive
                                                            ? "bg-blue-500 text-white"
                                                            : "text-gray-300 hover:bg-white/10 hover:text-white"
                                                        }
                                                        `
                                                    }
                                                >

                                                    <Icon
                                                        size={18}
                                                        className="
                                                            flex-shrink-0
                                                        "
                                                    />


                                                    {open && (
                                                        <span
                                                            className="
                                                                whitespace-nowrap
                                                            "
                                                        >
                                                            {
                                                                item.label
                                                            }
                                                        </span>
                                                    )}

                                                </NavLink>

                                            )}


                                            {/* ==================================================
                                                CREATE BUTTON
                                            ================================================== */}

                                            {open &&
                                                item.addTo &&
                                                canCreate(
                                                    item.moduleName
                                                ) && (

                                                    <button
                                                        type="button"
                                                        onClick={() => {

                                                            if (
                                                                isDirty
                                                            ) {

                                                                dispatch(
                                                                    showLeaveDialog(
                                                                        item.addTo
                                                                    )
                                                                );

                                                            } else {

                                                                navigate(
                                                                    item.addTo
                                                                );
                                                            }

                                                        }}
                                                        className="
                                                            flex
                                                            w-8
                                                            items-center
                                                            justify-center
                                                            border-l
                                                            border-white/10
                                                            opacity-0
                                                            hover:bg-white/10
                                                            group-hover:opacity-100
                                                        "
                                                    >

                                                        <Plus
                                                            size={16}
                                                        />

                                                    </button>

                                                )}


                                            {/* ==================================================
                                                COLLAPSED TOOLTIP
                                            ================================================== */}

                                            {!open && (
                                                <div
                                                    className="
                                                        pointer-events-none
                                                        invisible
                                                        absolute
                                                        left-[72px]
                                                        top-1/2
                                                        z-[9999]
                                                        min-w-max
                                                        -translate-y-1/2
                                                        rounded-lg
                                                        bg-blue-600
                                                        px-4
                                                        py-2.5
                                                        text-sm
                                                        font-semibold
                                                        text-white
                                                        opacity-0
                                                        shadow-lg
                                                        transition-opacity
                                                        duration-150
                                                        before:absolute
                                                        before:left-[-8px]
                                                        before:top-1/2
                                                        before:-translate-y-1/2
                                                        before:border-b-[8px]
                                                        before:border-r-[8px]
                                                        before:border-t-[8px]
                                                        before:border-b-transparent
                                                        before:border-t-transparent
                                                        before:border-r-blue-600
                                                        group-hover:visible
                                                        group-hover:opacity-100
                                                    "
                                                >
                                                    {
                                                        item.label
                                                    }
                                                </div>
                                            )}

                                        </div>


                                        {/* ==================================================
                                            CHILDREN
                                        ================================================== */}

                                        {item.children &&
                                            openMenu ===
                                            item.label && (

                                                <div
                                                    className="
                                                        mt-1
                                                        flex
                                                        flex-col
                                                    "
                                                >

                                                    {item.children.map(
                                                        (
                                                            child
                                                        ) => {

                                                            // ==================================================
                                                            // ROUTE CHILD
                                                            // ==================================================

                                                            if (
                                                                child.to
                                                            ) {

                                                                const childActive =
                                                                    location.pathname ===
                                                                    child.to ||
                                                                    location.pathname.startsWith(
                                                                        `${child.to}/`
                                                                    );


                                                                return (
                                                                    <NavLink
                                                                        key={`${item.label}-${child.label}`}
                                                                        to={
                                                                            child.to
                                                                        }
                                                                        className={`
                                                                            ml-6
                                                                            rounded-md
                                                                            px-3
                                                                            py-2
                                                                            text-sm
                                                                            transition

                                                                            ${childActive
                                                                                ? "bg-white/10 font-medium text-white"
                                                                                : "text-gray-400 hover:bg-white/5 hover:text-white"
                                                                            }
                                                                        `}
                                                                        style={{
                                                                            paddingLeft:
                                                                                "2.75rem",
                                                                        }}
                                                                    >
                                                                        {
                                                                            child.label
                                                                        }
                                                                    </NavLink>
                                                                );

                                                            }


                                                            // ==================================================
                                                            // STATUS FILTER
                                                            // ==================================================

                                                            const search =
                                                                new URLSearchParams(
                                                                    location.search
                                                                );


                                                            const childActive =
                                                                location.pathname ===
                                                                item.basePath &&
                                                                search.get(
                                                                    item.queryKey
                                                                ) ===
                                                                child.status;


                                                            return (
                                                                <NavLink
                                                                    key={`${item.label}-${child.status}`}
                                                                    to={`${item.basePath}?${item.queryKey}=${child.status}`}
                                                                    className={`
                                                                        ml-6
                                                                        rounded-md
                                                                        px-3
                                                                        py-2
                                                                        text-sm
                                                                        transition

                                                                        ${childActive
                                                                            ? "bg-white/10 font-medium text-white"
                                                                            : "text-gray-400 hover:bg-white/5 hover:text-white"
                                                                        }
                                                                    `}
                                                                    style={{
                                                                        paddingLeft:
                                                                            "2.75rem",
                                                                    }}
                                                                >
                                                                    {
                                                                        child.label
                                                                    }
                                                                </NavLink>
                                                            );

                                                        }
                                                    )}

                                                </div>
                                            )}

                                    </div>
                                );

                            }
                        )}

                </nav>


                {/* ==================================================
                    BOTTOM TOGGLE
                ================================================== */}

                <div
                    className="
                        border-t
                        border-white/10
                        p-2
                    "
                >

                    <button
                        type="button"
                        onClick={() =>
                            dispatch(
                                toggleSidebar()
                            )
                        }
                        className="
                            flex
                            w-full
                            items-center
                            justify-center
                            gap-2
                            rounded-lg
                            px-3
                            py-2
                            text-gray-400
                            transition
                            hover:bg-white/5
                        "
                    >

                        {open ? (
                            <X size={16} />
                        ) : (
                            <Menu size={16} />
                        )}

                        {open && (
                            <span
                                className="
                                    text-xs
                                "
                            >
                                Collapse
                            </span>
                        )}

                    </button>

                </div>

            </aside>


            {/* ==================================================
                UNSAVED CHANGES
            ================================================== */}

            {leaveDialog?.open && (
                <UnsavedChangesDialog />
            )}

        </>
    );
};


export default Sidebar;