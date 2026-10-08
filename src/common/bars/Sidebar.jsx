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
    Plus,
    Package,
    LogOut,
} from "lucide-react";
import { assets } from "../../assets/assets";


// ============================================================
// NAVIGATION
// ============================================================
/*
 * children[].action  -> permission needed to see the child (default VIEW)
 * badge              -> optional number/string shown as an amber chip
 */

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

        // children: [
        //     {
        //         label: "Customers",
        //         to: "/customers",
        //     },
        // ],
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
        label: "Invoices",
        moduleName: "Invoices",
        icon: FileText,
        to: "/invoices",
        addTo: "/invoices/new",
        basePath: "/invoices",
        dropdown: true,

        // children: [
        //     { label: "All invoices", to: "/invoices", action: "VIEW" },
        //     { label: "New invoice", to: "/invoices/new", action: "CREATE" },
        // ],
    },


    {
        label: "Payments",
        moduleName: "Payments",
        icon: Wallet,
        to: "/payments",
        addTo: "/payments/new",
        queryKey: "status",
        dropdown: true,

        // children: [
        //     { label: "All payments", to: "/payments", action: "VIEW" },
        //     { label: "New payment", to: "/payments/new", action: "CREATE" },
        // ],
    },
];


// ============================================================
// HELPERS
// ============================================================

const EMPTY_PERMISSIONS = [];

const normalizeAction = (action) =>
    action == null ? "" : String(action).trim().toUpperCase();

const normalizeModule = (moduleName) =>
    moduleName == null ? "" : String(moduleName).trim().toLowerCase();

const normalizePermissionArray = (value) => {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.data)) return value.data;
    if (Array.isArray(value?.content)) return value.content;
    return EMPTY_PERMISSIONS;
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

// SUPER_ADMIN -> Super Admin
const formatRole = (role) =>
    role
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
    String(name)
        .split(/[\s@._-]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join("");

/*
 * Merge flat / grouped permission formats into one flat list.
 * User permissions are applied after role permissions, so they override.
 */
const collectPermissions = (list, source, permissionMap) => {
    list.forEach((permission) => {
        if (permission?.moduleId != null && permission?.actionId != null) {
            permissionMap.set(`${permission.moduleId}-${permission.actionId}`, {
                ...permission,
                source,
            });
            return;
        }

        if (Array.isArray(permission?.actions)) {
            permission.actions.forEach((action) => {
                permissionMap.set(`${permission.moduleId}-${action?.actionId}`, {
                    ...action,
                    moduleId: permission?.moduleId,
                    moduleName: permission?.moduleName,
                    roleId: permission?.roleId,
                    userId: permission?.userId,
                    source,
                });
            });
        }
    });
};


// ============================================================
// SMALL UI PIECES
// ============================================================

const Badge = ({ value }) =>
    value ? (
        <span className="ml-auto rounded-md bg-amber-400 px-1.5 py-0.5 text-[11px] font-bold leading-none text-slate-900">
            {value}
        </span>
    ) : null;

/* Row used inside the expanded tree and inside the collapsed flyout */
const ChildRow = ({ child, active, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`
            my-0.5 flex w-full items-center justify-between rounded-lg
            px-3 py-2 text-left text-sm transition-colors
            ${active
                ? "bg-white/10 font-medium text-white"
                : "text-white hover:bg-white/10 hover:text-white"}
        `}
    >
        <span className="truncate">{child.label}</span>
        {active && <ChevronRight size={15} className="shrink-0" />}
    </button>
);

/* Round initials avatar used in the bottom user card */
const AvatarCircle = ({ src, name }) => (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-sky-100 text-sm font-semibold text-sky-600 ring-2 ring-white/10">
        {src ? (
            <img src={assets.zenfutureLogo} alt={name} className="h-full w-full object-cover" />
        ) : (
            getInitials(name)
        )}
    </div>
);


// ============================================================
// SIDEBAR
// ============================================================

/*
 * onLogout: pass your logout handler, e.g.
 *   <Sidebar onLogout={() => dispatch(logoutUser())} />
 * Falls back to navigating to /login.
 */
const Sidebar = ({ onLogout }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();


    // ---------- STORE ----------

    const open = useSelector((state) => state.ui?.sidebarOpen);
    const isDirty = useSelector((state) => state.customers?.isDirty);

    const currentUser = useSelector((state) => state.auth?.user || null);
    const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated === true);
    const authChecking = useSelector((state) => state.auth?.authChecking === true);

    const rolePermissionsState = useSelector(
        (state) => state.menuPermission?.rolePermissions || EMPTY_PERMISSIONS
    );
    const userPermissionsState = useSelector(
        (state) => state.menuPermission?.userPermissions || EMPTY_PERMISSIONS
    );
    const permissionLoading = useSelector(
        (state) => state.menuPermission?.loading === true
    );

    const [openMenu, setOpenMenu] = React.useState(null);


    // ---------- PERMISSIONS ----------

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
        normalizedRoleName === "SUPER_ADMIN" || normalizedRoleName === "ADMIN";

    // ROLE first, USER overrides ROLE
    const effectivePermissions = React.useMemo(() => {
        if (hasFullAccess) return [];

        const permissionMap = new Map();
        collectPermissions(rolePermissions, "ROLE", permissionMap);
        collectPermissions(userPermissions, "USER", permissionMap);

        return Array.from(permissionMap.values());
    }, [rolePermissions, userPermissions, hasFullAccess]);

    const hasPermission = React.useCallback(
        (moduleName, action = "VIEW") => {
            if (hasFullAccess) return true;
            if (!moduleName) return false;

            const requestedModule = normalizeModule(moduleName);
            const requestedAction = normalizeAction(action);

            // flat format
            const flat = effectivePermissions.find(
                (p) =>
                    normalizeModule(p?.moduleName) === requestedModule &&
                    normalizeAction(p?.actionName) === requestedAction
            );

            if (flat) {
                return (
                    flat.allowed === true &&
                    flat.active !== false &&
                    normalizeAction(flat.status) !== "INACTIVE"
                );
            }

            // grouped format fallback
            const grouped = effectivePermissions.find(
                (p) => normalizeModule(p?.moduleName) === requestedModule
            );

            if (!grouped || !Array.isArray(grouped.actions)) return false;

            return grouped.actions.some((a) => {
                if (typeof a === "string") {
                    return normalizeAction(a) === requestedAction;
                }

                return (
                    normalizeAction(a?.actionName) === requestedAction &&
                    a?.allowed === true &&
                    a?.active !== false &&
                    normalizeAction(a?.status) !== "INACTIVE"
                );
            });
        },
        [effectivePermissions, hasFullAccess]
    );


    // ---------- NAVIGATION ----------

    const isActiveRoute = (path) =>
        !!path &&
        (location.pathname === path || location.pathname.startsWith(`${path}/`));

    const goTo = (path) => {
        if (!path) return;

        if (isDirty) {
            dispatch(showLeaveDialog(path));
        } else {
            navigate(path);
        }
    };

    // Only the items (and children) the user may see
    const visibleNav = React.useMemo(
        () =>
            NAV.filter((item) => hasPermission(item.moduleName, "VIEW")).map(
                (item) => ({
                    ...item,
                    children: item.children?.filter((child) =>
                        hasPermission(item.moduleName, child.action || "VIEW")
                    ),
                })
            ),
        [hasPermission]
    );

    // Auto-open the menu that matches the current route
    React.useEffect(() => {
        const activeItem = NAV.find(
            (item) => item.children?.length && isActiveRoute(item.to)
        );

        if (activeItem) setOpenMenu(activeItem.label);
    }, [location.pathname]);

    const handleParentClick = (item) => {
        if (!open) {
            // collapsed: icon goes straight to the module
            goTo(item.to);
            return;
        }

        setOpenMenu((prev) => (prev === item.label ? null : item.label));
    };

    const handleLogout = () => {
        if (typeof onLogout === "function") {
            onLogout();
        } else {
            navigate("/login");
        }
    };


    // ---------- EARLY STATES ----------

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


    // ---------- DERIVED ----------

    const displayName = getDisplayName(currentUser);
    const roleLabel = formatRole(normalizedRoleName);
    const avatarSrc =
        currentUser?.avatar || currentUser?.profileImage || currentUser?.imageUrl;

    const canCreateInvoice = hasPermission("Invoices", "CREATE");

    const Avatar = (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#088178] text-sm font-semibold text-white ring-1 ring-white/10">
            {avatarSrc ? (
                <img src={avatarSrc} alt={displayName} className="h-full w-full object-cover" />
            ) : (
                getInitials(displayName)
            )}
        </div>
    );


    // ---------- RENDER ----------

    return (
        <>
            {/* Mobile overlay */}
            {open && (
                <div
                    className="fixed inset-0 z-20 bg-black/40 lg:hidden"
                    onClick={() => dispatch(toggleSidebar())}
                />
            )}

            <aside
                className={`
                    fixed bottom-3 left-3 top-3 z-30 flex flex-col
                    rounded-xl border border-white/5 bg-[#088178]
                    shadow-2xl shadow-black/30
                    transition-[width] duration-300
                    ${open ? "w-54" : "w-[72px]"}
                `}
            >

                {/* ================= COLLAPSE TOGGLE ================= */}

                <button
                    type="button"
                    onClick={() => dispatch(toggleSidebar())}
                    aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
                    className="
                        absolute -right-3 top-[34px] z-40 flex h-6 w-6
                        items-center justify-center rounded-full
                        bg-[#4EBBB4] text-[white] hover:text-[#088178] shadow-lg shadow-blue-500/30
                        transition hover:bg-[#B6E7E4]
                    "
                >
                    {open ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                </button>


                {/* ================= USER HEADER ================= */}

                <div className={`px-4 pb-4 pt-5 ${open ? "" : "flex justify-center px-0"}`}>
                    <div className={`flex items-center gap-3 ${open ? "border-b border-white/10 pb-4" : ""}`}>
                        {Avatar}

                        {open && (
                            <div className="min-w-0 leading-tight">
                                <p className="text-[12px] text-white">InvoicePro</p>
                                <p className="truncate text-base font-semibold text-white">
                                    {displayName}
                                </p>
                            </div>
                        )}
                    </div>
                </div>


                {/* ================= NAV ================= */}

                <nav
                    className={`
                        flex-1 space-y-1 px-3 py-1
                        ${open ? "overflow-y-auto" : "overflow-visible"}
                    `}
                >
                    {visibleNav.map((item) => {
                        const Icon = item.icon;
                        const hasChildren = item.children?.length > 0;
                        const active = isActiveRoute(item.to);
                        const expanded = open && hasChildren && openMenu === item.label;

                        return (
                            <div key={item.label} className="group/item relative">

                                {/* active marker on the panel edge */}
                                {active && (
                                    <span className="absolute -left-3 top-1/2 h-9 w-1.5 -translate-y-1/2 rounded-r-full bg-lime-400" />
                                )}

                                {/* ---------- MAIN ROW ---------- */}
                                <button
                                    type="button"
                                    title={!open ? item.label : undefined}
                                    onClick={() =>
                                        hasChildren
                                            ? handleParentClick(item)
                                            : goTo(item.to)
                                    }
                                    className={`
        flex items-center rounded-xl text-sm font-medium
        transition-colors duration-150
        ${open
                                            ? "w-full gap-3 px-5 py-2.5"
                                            : "mx-auto h-11 w-11 justify-center"
                                        }
        ${active
                                            ? "bg-white/[0.08] text-white"
                                            : "text-white hover:bg-white/10 hover:text-white"
                                        }
    `}
                                >
                                    <Icon size={18} className="shrink-0" />

                                    {open && <span className="truncate">{item.label}</span>}

                                    {open && <Badge value={item.badge} />}

                                    {open && hasChildren && (
                                        <span className="ml-auto text-white">
                                            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </span>
                                    )}
                                </button>

                                {/* ---------- EXPANDED TREE ---------- */}
                                {expanded && (
                                    <div className="relative ml-[22px] mt-1 mb-1">
                                        {item.children.map((child, index) => {
                                            const isLast = index === item.children.length - 1;
                                            const childActive = location.pathname === child.to;

                                            return (
                                                <div key={child.to} className="relative pl-5">
                                                    {!isLast && (
                                                        <span className="absolute left-0 top-0 h-full border-l border-white/15" />
                                                    )}

                                                    <span className="absolute left-0 top-0 h-1/2 w-3.5 rounded-bl-lg border-b border-l border-white/15" />

                                                    <ChildRow
                                                        child={child}
                                                        active={childActive}
                                                        onClick={() => goTo(child.to)}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {!open && (
                                    <>
                                        {/* =====================================================
            NORMAL MODULE → SIMPLE TOOLTIP
        ===================================================== */}
                                        {!hasChildren && (
                                            <RightTooltip text={item.label} />
                                        )}

                                        {/* =====================================================
                                        MODULE WITH CHILDREN → FLYOUT TOOLTIP
                                    ===================================================== */}
                                        {hasChildren && (
                                            <div
                                                className="
                                                    absolute
                                                    left-full
                                                    top-1/2
                                                    z-[9999]
                                                    hidden
                                                    -translate-y-1/2
                                                    pl-5
                                                    group-hover/item:block
                                                    group-focus-within/item:block
                                                "
                                            >
                                                <div
                                                    className="
                                                            min-w-[210px]
                                                            overflow-hidden
                                                            rounded-xl
                                                            bg-[#088178]
                                                            p-1.5
                                                            shadow-2xl
                                                            ring-1
                                                            ring-white/10
                                                        "
                                                >
                                                    {/* Parent / tooltip title */}
                                                    <div
                                                        className="
                                                        px-3
                                                        py-2
                                                        text-xs
                                                        font-semibold
                                                        text-white
                                                    "
                                                    >
                                                        {item.label}
                                                    </div>

                                                    {/* Divider */}
                                                    <div className="mx-2 border-t border-white/10" />

                                                    {/* Children */}
                                                    <div className="pt-1">
                                                        {item.children.map((child) => (
                                                            <ChildRow
                                                                key={child.to}
                                                                child={child}
                                                                active={location.pathname === child.to}
                                                                onClick={() => goTo(child.to)}
                                                            />
                                                        ))}
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


                {/* ================= QUICK ACTION ================= */}

                {/* {canCreateInvoice && (
                    <div className="px-3 pt-3">
                        {open ? (
                            <button
                                type="button"
                                onClick={() => goTo("/invoices/new")}
                                className="
                                    flex w-full flex-col items-center gap-2 rounded-2xl
                                    border border-dashed border-white/15 px-4 py-4
                                    transition hover:border-blue-400/60 hover:bg-white/[0.03]
                                "
                            >
                                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg shadow-blue-500/30">
                                    <Plus size={20} />
                                </span>

                                <span className="text-sm font-semibold text-white">
                                    Create invoice
                                </span>

                                <span className="text-[11px] text-gray-500">
                                    Start a new bill
                                </span>
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => goTo("/invoices/new")}
                                className="mx-auto flex flex-col items-center gap-1.5"
                                aria-label="Create invoice"
                            >
                                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-400">
                                    <Plus size={20} />
                                </span>

                                <span className="text-xs font-semibold text-white">New</span>
                            </button>
                        )}
                    </div>
                )} */}


                {/* ================= USER CARD (BOTTOM) ================= */}

                <div className="shrink-0 p-3">
                    {open ? (
                        <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.04] p-2.5">
                            <AvatarCircle src={avatarSrc} name={displayName} />

                            <div className="min-w-0 flex-1 leading-tight">
                                <p className="truncate text-sm font-semibold text-white">
                                    {displayName}
                                </p>
                                <p className="truncate text-xs text-gray-400">{roleLabel}</p>
                            </div>

                            <button
                                type="button"
                                onClick={handleLogout}
                                aria-label="Log out"
                                className="rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-1.5">
                            <AvatarCircle src={avatarSrc} name={displayName} />

                            <button
                                type="button"
                                onClick={handleLogout}
                                aria-label="Log out"
                                className="rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
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