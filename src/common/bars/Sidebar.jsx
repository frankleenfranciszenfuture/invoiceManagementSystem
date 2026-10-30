
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import RightTooltip from "../toolTip/RightTooltip";
import { showLeaveDialog, toggleSidebar } from "../../module/ui/uiSlice";

import {
    ChevronRight,
    ChevronLeft,
    ChevronDown,
    ChevronUp,
    LayoutDashboard,
    Users,
    FileText,
    Wallet,
    Package,
    LogOut,
    Settings,
    Building2,
    BoxIcon,
    BadgeJapaneseYen,
    PaintBucket,
} from "lucide-react";

// ============================================================
// CONSTANTS
// ============================================================

const EMPTY_ARRAY = [];
const EMPTY_OBJECT = {};

const SETTINGS_PRODUCT_PATHS = [
    "/settings/categories",
    "/settings/subCategoires",
    "/settings/sizes",
    "/settings/units",
];

// ============================================================
// MAIN NAVIGATION
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
        dropdown: true,
        children: [
            {
                label: "Create",
                to: "/customers/new",
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
    },
    {
        label: "Parties",
        moduleName: "Parties",
        icon: Package,
        to: "/parties",
        addTo: "/parties/newSimple",
        basePath: "/parties",
        dropdown: true,
    },
    {
        label: "Sales Persons",
        moduleName: "SalesPersons",
        icon: FileText,
        to: "/salesPersons",
        addTo: "/salesPersons/newSimple",
        basePath: "/salesPersons",
        dropdown: true,
    },

    {
        label: "Invoices",
        moduleName: "Invoices",
        icon: FileText,
        to: "/invoices",
        addTo: "/invoices/new",
        basePath: "/invoices",
        dropdown: true,
    },
    {
        label: "Payments",
        moduleName: "Payments",
        icon: Wallet,
        to: "/payments",
        addTo: "/payments/new",
        dropdown: true,
    },
    {
        label: "Settings",
        moduleName: "Settings",
        icon: Settings,
        to: "/settings",
        dropdown: true,
    },

    {
        label: "Inventory",
        moduleName: "Inventory",
        icon: BoxIcon,
        to: "/inventory",
        dropdown: true,
    },
];

// ============================================================
// SETTINGS NAVIGATION
// ============================================================

const SETTINGS_NAV = [
    {
        label: "General Settings",
        moduleName: "Settings",
        icon: Settings,
        to: "/settings",
    },
    {
        label: "Users",
        moduleName: "Users",
        icon: Users,
        to: "/settings/users",
    },
    {
        label: "Roles",
        moduleName: "Roles",
        icon: Users,
        to: "/settings/roles",
    },
    {
        label: "MenuPermission",
        moduleName: "MenuPermission",
        icon: Users,
        to: "/settings/menuPermission",
    },
    {
        label: "Company Profile",
        moduleName: "Company Profile",
        icon: Building2,
        to: "/settings/companies",
    },
    {
        label: "Bank Accounts",
        moduleName: "Bank Accounts",
        icon: Wallet,
        to: "/settings/bankAccount",
    },
    {
        label: "Currencies",
        moduleName: "Currencies",
        icon: Wallet,
        to: "/settings/currencies",
    },

    {
        label: "Email Signatures",
        moduleName: "Email Signatures",
        icon: FileText,
        to: "/settings/emailSignatures",
    },


    {
        label: "Taxes",
        moduleName: "Taxes",
        icon: BadgeJapaneseYen,
        to: "/settings/taxes",
    },

    {
        label: "Products",
        moduleName: "Products",
        icon: BoxIcon,
        to: "/settings",
        dropdown: true,
        children: [
            {
                label: "Category",
                to: "/settings/categories",
            },
            {
                label: "SubCategory",
                to: "/settings/subCategoires",
            },
            {
                label: "Sizes",
                to: "/settings/sizes",
            },
            {
                label: "Units",
                to: "/settings/units",
            },
        ],
    },
];


const INVENTORY_NAV = [
    {
        label: "Inventory Dashboard",
        moduleName: "Inventory",
        icon: LayoutDashboard,
        to: "/inventory",
    },

    {
        label: "Warehouse",
        moduleName: "Warehouse",
        icon: Building2,
        to: "/inventory/warehouses",
    },

    {
        label: "SaleOrder",
        moduleName: "SaleOrder",
        icon: PaintBucket,
        to: "/inventory/saleOrder/create",
    },
    {
        label: "Stock Adjustment",
        moduleName: "Stock Adjustment",
        icon: Package,
        to: "/inventory/adjustments",
    },
    {
        label: "Stock Transfer",
        moduleName: "Stock Transfer",
        icon: Package,
        to: "/inventory/transfers",
    },
    {
        label: "Stock History",
        moduleName: "Stock History",
        icon: FileText,
        to: "/inventory/history",
    },
];


const PAYMENT_NAV = [
    {
        label: "Payment Dashboard",
        moduleName: "Payments",
        icon: LayoutDashboard,
        to: "/payments",
    },
    {
        label: "All Payments",
        moduleName: "Payments",
        icon: Wallet,
        to: "/payments/list",
    },
    {
        label: "Customer Receipts",
        moduleName: "Customer Receipts",
        icon: Wallet,
        to: "/payments/receipts",
    },
    {
        label: "Party Payments",
        moduleName: "Party Payments",
        icon: Wallet,
        to: "/payments/party-payments",
    },
    {
        label: "Bank Transactions",
        moduleName: "Bank Transactions",
        icon: Building2,
        to: "/payments/bank-transactions",
    },
];

// ============================================================
// HELPERS
// ============================================================

const normalizeAction = (action) =>
    action == null ? "" : String(action).trim().toUpperCase();

const normalizeModule = (moduleName) =>
    moduleName == null ? "" : String(moduleName).trim().toLowerCase();

const normalizePermissionArray = (value) => {
    if (Array.isArray(value)) return value;

    if (Array.isArray(value?.data)) return value.data;

    if (Array.isArray(value?.content)) return value.content;

    return EMPTY_ARRAY;
};

const getRoleName = (user) => {
    if (!user) return "";

    const role =
        user?.roleName ||
        user?.role?.roleName ||
        user?.role?.name ||
        user?.role ||
        user?.authority ||
        "";

    return String(role).trim().toUpperCase();
};

const formatRole = (role) =>
    String(role || "")
        .toLowerCase()
        .split("_")
        .filter(Boolean)
        .map((word) => word[0].toUpperCase() + word.slice(1))
        .join(" ");

const getDisplayName = (user) =>
    user?.name ||
    user?.fullName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.username ||
    user?.email ||
    "User";

const getInitials = (name) =>
    String(name || "User")
        .split(/[\s@._-]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join("");

const getModuleTitle = ({
    isSettingsArea,
    isInventoryArea,
    isPaymentArea,
}) => {
    if (isInventoryArea) return "Inventory";
    if (isPaymentArea) return "Payments";
    if (isSettingsArea) return "Settings";

    return "InvoicePro";
};

const getModuleIcon = ({
    isSettingsArea,
    isInventoryArea,
    isPaymentArea,
}) => {
    if (isInventoryArea) return BoxIcon;
    if (isPaymentArea) return Wallet;
    if (isSettingsArea) return Settings;

    return FileText;
};
// ============================================================
// PERMISSION HELPERS
// ============================================================

const isPermissionAllowed = (permission) =>
    permission?.allowed === true &&
    permission?.active !== false &&
    normalizeAction(permission?.status) !== "INACTIVE";

/*
 * Supports:
 * 1. Flat permission format.
 * 2. Grouped permission format.
 *
 * User permissions override role permissions.
 */

const buildPermissionMap = (rolePermissions, userPermissions) => {
    const permissionMap = new Map();

    const addPermissions = (permissions) => {
        permissions.forEach((permission) => {
            if (!permission) return;

            // Flat permission format
            if (
                permission.moduleName &&
                permission.actionName
            ) {
                const key = `${normalizeModule(
                    permission.moduleName
                )}-${normalizeAction(permission.actionName)}`;

                permissionMap.set(key, permission);
                return;
            }

            // Grouped permission format
            if (Array.isArray(permission.actions)) {
                permission.actions.forEach((action) => {
                    const actionName =
                        typeof action === "string"
                            ? action
                            : action?.actionName;

                    if (!permission.moduleName || !actionName) return;

                    const key = `${normalizeModule(
                        permission.moduleName
                    )}-${normalizeAction(actionName)}`;

                    permissionMap.set(key, {
                        ...action === Object(action) ? action : {},
                        moduleName: permission.moduleName,
                        actionName,
                        allowed:
                            typeof action === "string"
                                ? true
                                : action?.allowed,
                        active:
                            typeof action === "string"
                                ? true
                                : action?.active,
                        status:
                            typeof action === "string"
                                ? "ACTIVE"
                                : action?.status,
                    });
                });
            }
        });
    };

    // Role permissions first
    addPermissions(rolePermissions);

    // User permissions override role permissions
    addPermissions(userPermissions);

    return permissionMap;
};

// ============================================================
// SMALL UI COMPONENTS
// ============================================================

const Badge = ({ value }) => {
    if (!value) return null;

    return (
        <span className="ml-auto rounded-md bg-amber-400 px-1.5 py-0.5 text-[11px] font-bold leading-none text-slate-900">
            {value}
        </span>
    );
};

const ChildRow = ({ child, active, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`
            my-0.5 flex w-full items-center justify-between
            rounded-lg px-3 py-2 text-left text-sm
            transition-colors
            ${active
                ? "bg-white/10 font-medium text-white"
                : "text-white hover:bg-white/10 hover:text-white"
            }
        `}
    >
        <span className="truncate">{child.label}</span>

        {active && <ChevronRight size={15} className="shrink-0" />}
    </button>
);

const AvatarCircle = ({ src, name }) => (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-orange-600 text-sm font-semibold text-[#FCF7F8] ring-2 ring-white/10">
        {src ? (
            <img
                src={src}
                alt={name}
                className="h-full w-full object-cover"
            />
        ) : (
            getInitials(name)
        )}
    </div>
);

// ============================================================
// SIDEBAR
// ============================================================

const Sidebar = ({ onLogout }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    // --------------------------------------------------------
    // REDUX SELECTORS
    // --------------------------------------------------------

    const open = useSelector(
        (state) => state.ui?.sidebarOpen ?? false
    );

    const isDirty = useSelector(
        (state) => state.customers?.isDirty ?? false
    );

    const currentUser = useSelector(
        (state) => state.auth?.user ?? null
    );

    const isAuthenticated = useSelector(
        (state) => state.auth?.isAuthenticated === true
    );

    const authChecking = useSelector(
        (state) => state.auth?.authChecking === true
    );

    const rolePermissionsState = useSelector(
        (state) =>
            state.menuPermission?.rolePermissions ?? EMPTY_ARRAY
    );

    const userPermissionsState = useSelector(
        (state) =>
            state.menuPermission?.userPermissions ?? EMPTY_ARRAY
    );

    const permissionLoading = useSelector(
        (state) => state.menuPermission?.loading === true
    );

    // --------------------------------------------------------
    // LOCAL STATE
    // --------------------------------------------------------

    const [openMenu, setOpenMenu] = React.useState(null);

    // --------------------------------------------------------
    // NORMALIZED DATA
    // --------------------------------------------------------

    const rolePermissions = React.useMemo(
        () => normalizePermissionArray(rolePermissionsState),
        [rolePermissionsState]
    );

    const userPermissions = React.useMemo(
        () => normalizePermissionArray(userPermissionsState),
        [userPermissionsState]
    );

    const normalizedRoleName = React.useMemo(
        () => getRoleName(currentUser),
        [currentUser]
    );

    const hasFullAccess =
        normalizedRoleName === "SUPER_ADMIN" ||
        normalizedRoleName === "ADMIN";

    // --------------------------------------------------------
    // EFFECTIVE PERMISSIONS
    // --------------------------------------------------------

    const effectivePermissions = React.useMemo(
        () =>
            buildPermissionMap(
                rolePermissions,
                userPermissions
            ),
        [rolePermissions, userPermissions]
    );

    const hasPermission = React.useCallback(
        (moduleName, action = "VIEW") => {
            if (hasFullAccess) return true;

            if (!moduleName) return false;

            const key = `${normalizeModule(
                moduleName
            )}-${normalizeAction(action)}`;

            const permission = effectivePermissions.get(key);

            return permission
                ? isPermissionAllowed(permission)
                : false;
        },
        [effectivePermissions, hasFullAccess]
    );

    // --------------------------------------------------------
    // SETTINGS AREA
    // --------------------------------------------------------

    const pathname = location.pathname;

    const isSettingsArea =
        pathname === "/settings" ||
        pathname.startsWith("/settings/");

    const isInventoryArea =
        pathname === "/inventory" ||
        pathname.startsWith("/inventory/");

    const isPaymentArea =
        pathname === "/payments" ||
        pathname.startsWith("/payments/");

    // --------------------------------------------------------
    // ROUTE HELPERS
    // --------------------------------------------------------

    const isActiveRoute = React.useCallback(
        (path) =>
            Boolean(
                path &&
                (pathname === path ||
                    pathname.startsWith(`${path}/`))
            ),
        [pathname]
    );

    const isNavItemActive = React.useCallback(
        (item) => {
            // Settings navigation
            if (isSettingsArea) {
                if (item.label === "General Settings") {
                    return pathname === "/settings";
                }

                if (item.label === "Products") {
                    return SETTINGS_PRODUCT_PATHS.some(
                        (path) =>
                            pathname === path ||
                            pathname.startsWith(`${path}/`)
                    );
                }

                return isActiveRoute(item.to);
            }

            // Inventory navigation
            if (isInventoryArea) {
                if (item.to === "/inventory") {
                    return pathname === "/inventory";
                }

                return isActiveRoute(item.to);
            }

            // Payments navigation
            if (isPaymentArea) {
                if (item.to === "/payments") {
                    return pathname === "/payments";
                }

                return isActiveRoute(item.to);
            }

            return isActiveRoute(item.to);
        },
        [
            isSettingsArea,
            isInventoryArea,
            isPaymentArea,
            isActiveRoute,
            pathname,
        ]
    );

    // --------------------------------------------------------
    // CURRENT NAVIGATION
    // --------------------------------------------------------

    const currentNav = React.useMemo(() => {
        const sourceNav = isSettingsArea
            ? SETTINGS_NAV
            : isInventoryArea
                ? INVENTORY_NAV
                : isPaymentArea
                    ? PAYMENT_NAV
                    : NAV;

        return sourceNav
            .filter((item) =>
                hasPermission(item.moduleName, "VIEW")
            )
            .map((item) => ({
                ...item,
                children: item.children
                    ? item.children.filter((child) =>
                        hasPermission(
                            item.moduleName,
                            child.action || "VIEW"
                        )
                    )
                    : undefined,
            }));
    }, [
        isSettingsArea,
        isInventoryArea,
        isPaymentArea,
        hasPermission,
    ]);

    // --------------------------------------------------------
    // NAVIGATION HANDLER
    // --------------------------------------------------------

    const goTo = React.useCallback(
        (path) => {
            if (!path) return;

            if (isDirty) {
                dispatch(showLeaveDialog(path));
                return;
            }

            navigate(path);
        },
        [isDirty, dispatch, navigate]
    );

    // --------------------------------------------------------
    // AUTOMATICALLY OPEN ACTIVE SUBMENU
    // --------------------------------------------------------

    React.useEffect(() => {
        if (isSettingsArea) {
            const productPage = SETTINGS_PRODUCT_PATHS.some(
                (path) =>
                    pathname === path ||
                    pathname.startsWith(`${path}/`)
            );

            setOpenMenu(productPage ? "Products" : null);
            return;
        }

        if (isInventoryArea || isPaymentArea) {
            setOpenMenu(null);
            return;
        }

        const activeItem = NAV.find(
            (item) =>
                item.children?.length &&
                isActiveRoute(item.to)
        );

        setOpenMenu(activeItem?.label ?? null);

    }, [
        pathname,
        isSettingsArea,
        isInventoryArea,
        isPaymentArea,
        isActiveRoute,
    ]);

    // --------------------------------------------------------
    // PARENT MENU CLICK
    // --------------------------------------------------------

    const handleParentClick = (item) => {
        if (open) {
            setOpenMenu((previous) =>
                previous === item.label ? null : item.label
            );
        }

        // Settings Products is a submenu.
        // Do not navigate back to /settings when opening it.
        if (
            isSettingsArea &&
            item.label === "Products"
        ) {
            return;
        }

        goTo(item.to);
    };

    // --------------------------------------------------------
    // LOGOUT
    // --------------------------------------------------------

    const handleLogout = () => {
        if (typeof onLogout === "function") {
            onLogout();
        } else {
            navigate("/login");
        }
    };

    // --------------------------------------------------------
    // AUTHENTICATION STATES
    // --------------------------------------------------------

    if (authChecking) {
        return (
            <aside className="fixed bottom-3 left-3 top-3 z-30 w-[72px] rounded-3xl bg-[#1b1f27]" />
        );
    }

    if (!isAuthenticated) return null;

    if (
        !hasFullAccess &&
        permissionLoading &&
        rolePermissions.length === 0 &&
        userPermissions.length === 0
    ) {
        return (
            <aside className="fixed bottom-3 left-3 top-3 z-30 flex w-[72px] items-center justify-center rounded-xl bg-[#1b1f27]">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-600 border-t-blue-500" />
            </aside>
        );
    }

    // --------------------------------------------------------
    // USER INFORMATION
    // --------------------------------------------------------

    const displayName = getDisplayName(currentUser);

    const roleLabel = formatRole(normalizedRoleName);

    const avatarSrc =
        currentUser?.avatar ||
        currentUser?.profileImage ||
        currentUser?.imageUrl;

    //module name change
    const moduleTitle = getModuleTitle({
        isSettingsArea,
        isInventoryArea,
        isPaymentArea,
    });

    const ModuleIcon = getModuleIcon({
        isSettingsArea,
        isInventoryArea,
        isPaymentArea,
    });
    // --------------------------------------------------------
    // RENDER
    // --------------------------------------------------------

    return (
        <>
            {/* MOBILE OVERLAY */}

            {open && (
                <div
                    className="fixed inset-0 z-20 bg-black/40 lg:hidden"
                    onClick={() => dispatch(toggleSidebar())}
                />
            )}

            <aside
                className={`
                    fixed bottom-3 left-3 top-2 z-30
                    flex flex-col rounded-md
                    border-l border-r border-lime-500
                    bg-gradient-to-br
                    from-[#515F73] to-[#2E364D]
                    transition-[width] duration-300
                    ${open ? "w-55" : "w-[72px]"}
                `}
            >
                {/* COLLAPSE TOGGLE */}

                <button
                    type="button"
                    onClick={() => dispatch(toggleSidebar())}
                    aria-label={
                        open
                            ? "Collapse sidebar"
                            : "Expand sidebar"
                    }
                    className="
                        absolute -right-3 top-[34px] z-40
                        flex h-6 w-6 items-center justify-center
                        rounded-full border-l border-red-900
                        bg-[#FCF7F8] text-[#0F4659]
                        shadow-lg shadow-blue-500/30
                        transition hover:bg-[#B3E848]
                        hover:text-[#FCF7F8]
                    "
                >
                    {open ? (
                        <ChevronLeft size={14} />
                    ) : (
                        <ChevronRight size={14} />
                    )}
                </button>

                {/* USER HEADER */}

                <div className="px-4 pb-4 pt-5">
                    <div
                        className={`
            flex flex-col gap-3
            ${open ? "border-b border-gray-400 pb-4" : "items-center"}
        `}
                    >
                        {/* BRAND / MODULE TITLE */}

                        <div
                            className={`
                flex items-center gap-3
                ${open ? "" : "justify-center"}
            `}
                        >
                            <ModuleIcon
                                className="
                    h-10 w-10 shrink-0
                    rounded-2xl p-2
                    bg-gradient-to-br
                    from-[#6366F1] to-[#166534]
                    text-[#FCF7F8] shadow-md
                "
                            />

                            {open && (
                                <div className="min-w-0 leading-tight">
                                    <p className="truncate text-base font-semibold text-[#F5F5F5]">
                                        Zenfuture Tech
                                    </p>

                                    <p className="truncate text-base text-[#F5F5F5]">
                                        {moduleTitle}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* BACK TO MAIN MENU */}

                        {(isSettingsArea) && (
                            <button
                                type="button"
                                onClick={() => goTo("/dashboard")}
                                title="Back to Main Menu"
                                className={`
                    flex items-center gap-2
                    rounded-lg text-sm font-semibold
                    text-white transition
                    hover:text-lime-300
                    ${open ? "w-full px-1" : "justify-center"}
                `}
                            >
                                <ChevronLeft size={18} className="shrink-0" />

                                {open && (
                                    <span className="truncate">
                                        Back to Main Menu
                                    </span>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* NAVIGATION */}

                <nav
                    className={`
                        flex-1 space-y-1 px-3 py-1 
                        ${open ? "overflow-y-auto" : "overflow-visible"}
                    `}
                >
                    {currentNav.map((item) => {
                        const Icon = item.icon;

                        const hasChildren =
                            item.children?.length > 0;

                        const active = isNavItemActive(item);

                        const expanded =
                            open &&
                            hasChildren &&
                            openMenu === item.label;

                        return (
                            <div
                                key={item.label}
                                className="group/item relative"
                            >
                                {/* ACTIVE MARKER */}

                                {active && (
                                    <span
                                        className="
                                            absolute -left-3 top-1/2
                                            h-9 w-1.5 -translate-y-1/2
                                            rounded-r-full bg-orange-600
                                        "
                                    />
                                )}

                                {/* MAIN ROW */}

                                <button
                                    type="button"
                                    title={!open ? item.label : undefined}
                                    onClick={() => {
                                        if (hasChildren) {
                                            handleParentClick(item);
                                        } else {
                                            setOpenMenu(null);
                                            goTo(item.to);
                                        }
                                    }}
                                    className={`
                                        flex items-center rounded-lg
                                        text-sm font-medium
                                        transition-colors duration-150
                                        ${open
                                            ? "w-full gap-3 px-5 py-2.5"
                                            : "mx-auto h-11 w-11 justify-center"
                                        }
                                        ${active
                                            ? "border-r border-lime-400 bg-[#FCF7F8]/20 text-[#FCF7F8]"
                                            : "text-[#F5F5F5] hover:bg-[#B3E848]/70 hover:text-[#F5F5F5]"
                                        }
                                    `}
                                >
                                    <Icon
                                        size={18}
                                        className="shrink-0"
                                    />

                                    {open && (
                                        <span className="truncate">
                                            {item.label}
                                        </span>
                                    )}

                                    {open && (
                                        <Badge value={item.badge} />
                                    )}

                                    {open && hasChildren && (
                                        <span className="ml-auto text-white">
                                            {expanded ? (
                                                <ChevronUp size={16} />
                                            ) : (
                                                <ChevronDown size={16} />
                                            )}
                                        </span>
                                    )}
                                </button>

                                {/* EXPANDED SUBMENU */}

                                {expanded && (
                                    <div className="relative mb-1 ml-[22px] mt-1">
                                        {item.children.map(
                                            (child, index) => {
                                                const isLast =
                                                    index ===
                                                    item.children.length - 1;

                                                const childActive =
                                                    pathname === child.to;

                                                return (
                                                    <div
                                                        key={child.to}
                                                        className="relative pl-5"
                                                    >
                                                        {!isLast && (
                                                            <span
                                                                className="
                                                                    absolute left-0 top-0
                                                                    h-full border-l
                                                                    border-white/15
                                                                "
                                                            />
                                                        )}

                                                        <span
                                                            className="
                                                                absolute left-0 top-0
                                                                h-1/2 w-3.5
                                                                rounded-bl-lg
                                                                border-b border-l
                                                                border-white/15
                                                            "
                                                        />

                                                        <ChildRow
                                                            child={child}
                                                            active={childActive}
                                                            onClick={() =>
                                                                goTo(child.to)
                                                            }
                                                        />
                                                    </div>
                                                );
                                            }
                                        )}
                                    </div>
                                )}

                                {/* COLLAPSED TOOLTIP / FLYOUT */}

                                {!open && (
                                    <>
                                        {!hasChildren && (
                                            <RightTooltip
                                                text={item.label}
                                            />
                                        )}

                                        {hasChildren && (
                                            <div
                                                className="
                                                    absolute left-full top-1/2
                                                    z-[9999] hidden
                                                    -translate-y-1/2 pl-5
                                                    group-hover/item:block
                                                    group-focus-within/item:block
                                                "
                                            >
                                                <div
                                                    className="
                                                        min-w-[210px]
                                                        overflow-hidden
                                                        rounded-xl bg-[#088178]
                                                        p-1.5 shadow-2xl
                                                        ring-1 ring-white/10
                                                    "
                                                >
                                                    <div
                                                        className="
                                                            px-3 py-2
                                                            text-xs font-semibold
                                                            text-white
                                                        "
                                                    >
                                                        {item.label}
                                                    </div>

                                                    <div className="mx-2 border-t border-white/10" />

                                                    <div className="pt-1">
                                                        {item.children.map(
                                                            (child) => (
                                                                <ChildRow
                                                                    key={child.to}
                                                                    child={child}
                                                                    active={
                                                                        pathname ===
                                                                        child.to
                                                                    }
                                                                    onClick={() =>
                                                                        goTo(child.to)
                                                                    }
                                                                />
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        );
                    })}
                </nav>

                {/* BOTTOM USER CARD */}

                <div className="shrink-0 p-3">
                    {open ? (
                        <div
                            className="
                                flex items-center gap-3
                                rounded-2xl border border-white/5
                                bg-[#FCF7F8] p-2.5
                            "
                        >
                            <AvatarCircle
                                src={avatarSrc}
                                name={displayName}
                            />

                            <div className="min-w-0 flex-1 leading-tight">
                                <p className="truncate text-sm font-semibold text-[#05142D]">
                                    {displayName}
                                </p>

                                <p className="truncate text-xs text-[#05142D]">
                                    {roleLabel}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleLogout}
                                aria-label="Log out"
                                className="
                                    rounded-lg p-2 text-[#05142D]
                                    transition hover:bg-[#19253A]/80
                                    hover:text-white
                                "
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-1.5">
                            <AvatarCircle
                                src={avatarSrc}
                                name={displayName}
                            />

                            <button
                                type="button"
                                onClick={handleLogout}
                                aria-label="Log out"
                                className="
                                    rounded-lg p-2 text-white
                                    transition hover:bg-white/10
                                "
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
