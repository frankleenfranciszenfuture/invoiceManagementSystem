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
// COMPONENT
// ============================================================

export default function Sidebar() {

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
            state.auth?.user
    );

    const isAuthenticated = useSelector(
        (state) =>
            state.auth?.isAuthenticated
    );

    const authChecking = useSelector(
        (state) =>
            state.auth?.authChecking
    );


    // ========================================================
    // ADMIN CHECK
    // ========================================================

    /*
     * Login response:
     *
     * {
     *     id: 1,
     *     name: "ADMIN",
     *     email: "admin@ims.com",
     *     roleId: 1,
     *     roleName: "ADMIN"
     * }
     *
     * Prefer roleName.
     *
     * Fallback to name because your current login
     * response also contains name: "ADMIN".
     */

    const roleName =
        currentUser?.roleName ||
        currentUser?.name ||
        "";

    const isAdmin =
        String(roleName)
            .trim()
            .toUpperCase() === "ADMIN";


    // ========================================================
    // DEBUG AUTH
    // ========================================================

    React.useEffect(() => {

        console.log(
            "========== SIDEBAR AUTH =========="
        );

        console.log(
            "currentUser:",
            currentUser
        );

        console.log(
            "isAuthenticated:",
            isAuthenticated
        );

        console.log(
            "authChecking:",
            authChecking
        );

        console.log(
            "roleName:",
            roleName
        );

        console.log(
            "isAdmin:",
            isAdmin
        );

        console.log(
            "=================================="
        );

    }, [
        currentUser,
        isAuthenticated,
        authChecking,
        roleName,
        isAdmin,
    ]);


    // ========================================================
    // ROLE PERMISSIONS
    // ========================================================

    const rolePermissionsState =
        useSelector(
            (state) =>
                state.rolePermission
                    ?.rolePermissions
        );


    const rolePermissions =
        React.useMemo(
            () =>
                normalizePermissionArray(
                    rolePermissionsState
                ),
            [
                rolePermissionsState,
            ]
        );


    // ========================================================
    // USER RAW PERMISSIONS
    // ========================================================

    const userRawPermissionsState =
        useSelector(
            (state) =>
                state.userPermission
                    ?.userPermissions
        );


    const userRawPermissions =
        React.useMemo(
            () =>
                normalizePermissionArray(
                    userRawPermissionsState
                ),
            [
                userRawPermissionsState,
            ]
        );


    // ========================================================
    // USER NORMALIZED PERMISSIONS
    // ========================================================

    const userMyPermissionsState =
        useSelector(
            (state) =>
                state.userPermission
                    ?.myPermissions
        );


    const userMyPermissions =
        React.useMemo(
            () =>
                normalizePermissionArray(
                    userMyPermissionsState
                ),
            [
                userMyPermissionsState,
            ]
        );


    // ========================================================
    // EFFECTIVE PERMISSIONS
    // ========================================================

    const effectivePermissions =
        React.useMemo(() => {

            const permissionMap =
                new Map();


            // ====================================================
            // ROLE PERMISSIONS
            // ====================================================

            rolePermissions.forEach(
                (permission) => {

                    const moduleId =
                        permission?.moduleId != null
                            ? Number(
                                permission.moduleId
                            )
                            : null;

                    const actionId =
                        permission?.actionId != null
                            ? Number(
                                permission.actionId
                            )
                            : null;

                    const moduleName =
                        permission?.moduleName;

                    const actionName =
                        normalizeAction(
                            permission?.actionName
                        );


                    if (
                        moduleId == null ||
                        actionId == null ||
                        !moduleName ||
                        !actionName
                    ) {
                        return;
                    }


                    const key =
                        `${moduleId}-${actionId}`;


                    permissionMap.set(
                        key,
                        {
                            moduleId,
                            moduleName,
                            actionId,
                            actionName,

                            allowed:
                                permission?.active !== false &&
                                normalizeAction(
                                    permission?.status
                                ) !== "INACTIVE" &&
                                permission?.allowed === true,

                            source: "ROLE",
                        }
                    );

                }
            );


            // ====================================================
            // USER PERMISSIONS
            // ====================================================

            if (
                userRawPermissions.length > 0
            ) {

                userRawPermissions.forEach(
                    (permission) => {

                        const moduleId =
                            permission?.moduleId != null
                                ? Number(
                                    permission.moduleId
                                )
                                : null;

                        const actionId =
                            permission?.actionId != null
                                ? Number(
                                    permission.actionId
                                )
                                : null;

                        const moduleName =
                            permission?.moduleName;

                        const actionName =
                            normalizeAction(
                                permission?.actionName
                            );


                        if (
                            moduleId == null ||
                            actionId == null ||
                            !moduleName ||
                            !actionName
                        ) {
                            return;
                        }


                        const key =
                            `${moduleId}-${actionId}`;


                        /*
                         * User permission overrides role permission.
                         *
                         * This intentionally inserts allowed:false too.
                         */

                        permissionMap.set(
                            key,
                            {
                                moduleId,
                                moduleName,
                                actionId,
                                actionName,

                                allowed:
                                    permission?.active !== false &&
                                    normalizeAction(
                                        permission?.status
                                    ) !== "INACTIVE" &&
                                    permission?.allowed === true,

                                source: "USER",
                            }
                        );

                    }
                );

            }


            // ====================================================
            // USER NORMALIZED FALLBACK
            // ====================================================

            if (
                userRawPermissions.length === 0 &&
                userMyPermissions.length > 0
            ) {

                userMyPermissions.forEach(
                    (modulePermission) => {

                        const moduleId =
                            modulePermission?.moduleId != null
                                ? Number(
                                    modulePermission.moduleId
                                )
                                : null;

                        const moduleName =
                            modulePermission?.moduleName;


                        if (
                            moduleId == null ||
                            !moduleName
                        ) {
                            return;
                        }


                        const actions =
                            Array.isArray(
                                modulePermission?.actions
                            )
                                ? modulePermission.actions
                                : [];


                        actions.forEach(
                            (actionName) => {

                                const normalizedAction =
                                    normalizeAction(
                                        actionName
                                    );


                                if (
                                    !normalizedAction
                                ) {
                                    return;
                                }


                                const matchingRolePermission =
                                    rolePermissions.find(
                                        (permission) =>
                                            Number(
                                                permission?.moduleId
                                            ) === moduleId &&

                                            normalizeModule(
                                                permission?.moduleName
                                            ) ===
                                            normalizeModule(
                                                moduleName
                                            ) &&

                                            normalizeAction(
                                                permission?.actionName
                                            ) ===
                                            normalizedAction
                                    );


                                if (
                                    matchingRolePermission
                                        ?.actionId != null
                                ) {

                                    const actionId =
                                        Number(
                                            matchingRolePermission
                                                .actionId
                                        );


                                    const key =
                                        `${moduleId}-${actionId}`;


                                    permissionMap.set(
                                        key,
                                        {
                                            moduleId,
                                            moduleName,
                                            actionId,
                                            actionName:
                                                normalizedAction,
                                            allowed: true,
                                            source: "USER",
                                        }
                                    );

                                }

                            }
                        );

                    }
                );

            }


            // ====================================================
            // GROUP PERMISSIONS BY MODULE
            // ====================================================

            const grouped = {};


            permissionMap.forEach(
                (permission) => {

                    if (
                        !permission?.moduleName ||
                        permission?.allowed !== true
                    ) {
                        return;
                    }


                    const moduleKey =
                        normalizeModule(
                            permission.moduleName
                        );


                    if (!moduleKey) {
                        return;
                    }


                    if (
                        !grouped[moduleKey]
                    ) {

                        grouped[moduleKey] = {
                            moduleId:
                                permission.moduleId,

                            moduleName:
                                permission.moduleName,

                            actions: [],
                        };

                    }


                    const actionName =
                        normalizeAction(
                            permission.actionName
                        );


                    if (
                        actionName &&
                        !grouped[
                            moduleKey
                        ].actions.includes(
                            actionName
                        )
                    ) {

                        grouped[
                            moduleKey
                        ].actions.push(
                            actionName
                        );

                    }

                }
            );


            return Object.values(
                grouped
            );

        }, [
            rolePermissions,
            userRawPermissions,
            userMyPermissions,
        ]);


    // ========================================================
    // PERMISSION HELPER
    // ========================================================

    const hasPermission = (
        moduleName,
        action = "VIEW"
    ) => {

        if (!moduleName) {
            return false;
        }


        const normalizedModuleName =
            normalizeModule(
                moduleName
            );


        const normalizedAction =
            normalizeAction(
                action
            );


        const modulePermission =
            effectivePermissions.find(
                (permission) =>
                    normalizeModule(
                        permission?.moduleName
                    ) ===
                    normalizedModuleName
            );


        if (!modulePermission) {
            return false;
        }


        return (
            Array.isArray(
                modulePermission.actions
            ) &&
            modulePermission.actions.includes(
                normalizedAction
            )
        );

    };


    // ========================================================
    // VIEW PERMISSION
    // ========================================================

    const canView = (
        moduleName
    ) => {

        /*
         * ADMIN BYPASS
         *
         * This must happen before checking permissions.
         */

        if (isAdmin) {
            return true;
        }


        return hasPermission(
            moduleName,
            "VIEW"
        );

    };


    // ========================================================
    // CREATE PERMISSION
    // ========================================================

    const canCreate = (
        moduleName
    ) => {

        /*
         * ADMIN BYPASS
         */

        if (isAdmin) {
            return true;
        }


        return hasPermission(
            moduleName,
            "CREATE"
        );

    };


    // ========================================================
    // OPEN MENU
    // ========================================================

    const [
        openMenu,
        setOpenMenu
    ] = React.useState(null);


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
    // DEBUG NAVIGATION
    // ========================================================

    React.useEffect(() => {

        console.log(
            "========== SIDEBAR NAV DEBUG =========="
        );

        console.log(
            "AUTH CHECKING:",
            authChecking
        );

        console.log(
            "AUTHENTICATED:",
            isAuthenticated
        );

        console.log(
            "USER:",
            currentUser
        );

        console.log(
            "ROLE:",
            roleName
        );

        console.log(
            "IS ADMIN:",
            isAdmin
        );

        console.log(
            "ROLE PERMISSIONS COUNT:",
            rolePermissions.length
        );

        console.log(
            "USER PERMISSIONS COUNT:",
            userRawPermissions.length
        );

        console.log(
            "EFFECTIVE PERMISSIONS:",
            effectivePermissions
        );

        console.log(
            "NAV:",
            NAV
        );

        console.log(
            "VISIBLE NAV:",
            NAV.filter(
                (item) =>
                    canView(
                        item.moduleName
                    )
            ).map(
                (item) =>
                    item.moduleName
            )
        );

        console.log(
            "========================================"
        );

    }, [
        authChecking,
        isAuthenticated,
        currentUser,
        roleName,
        isAdmin,
        rolePermissions,
        userRawPermissions,
        effectivePermissions,
    ]);


    // ========================================================
    // AUTH INITIALIZATION
    // ========================================================

    /*
     * Do not make permission decisions while authentication
     * restoration is still running.
     *
     * Once authChecking becomes false:
     *
     * ADMIN -> all modules
     *
     * USER  -> permissions
     */

    if (authChecking) {

        return (
            <aside
                className={`
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
                `}
            />
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
                        ? "w-50"
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
}