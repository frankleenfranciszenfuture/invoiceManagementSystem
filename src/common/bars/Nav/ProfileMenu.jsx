
import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import { closeProfileMenu } from "../../../module/ui/uiSlice";

import {
    logoutUser,
} from "../../../module/auth/thunks/authThunks";

import {
    getUserPermission,
} from "../../../module/menuPermission/thunks/menuPermissionThunks";

import toast from "react-hot-toast";

import {
    X,
    LogOut,
    FileText,
    Package,
    Accessibility,
    Mail,
    Video,
    GraduationCap,
    Sparkles,
    ChevronRight,
    Wallet,
    Settings,
    ChartBarIcon,
    Landmark,
    Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
    setExsistingUser,
} from "../../../module/users/slices/userSlice";

/* =========================================================
   SHORTCUTS
========================================================= */

const shortcuts = [
    {
        icon: Package,
        title: "Inventory",
        sub: "Manage Stock",
        to: "/inventory/dashboard",
        moduleName: "Inventory",
    },
    {
        icon: ChartBarIcon,
        title: "Reports",
        sub: "Manage Reports",
        to: "/reports",
        moduleName: "Reports",
    },
    {
        icon: Wallet,
        title: "Payments",
        sub: "Manage Payments",
        to: "/payments",
        moduleName: "Payments",
    },
    {
        icon: Settings,
        title: "Settings",
        sub: "Preferences",
        to: "/settings",
        moduleName: "Settings",
    },
    {
        icon: FileText,
        title: "Help",
        sub: "Documents",
        to: null,
        moduleName: null,
    },
    {
        icon: ChartBarIcon,
        title: "Audit Logs",
        sub: "Manage Reports",
        to: "/audit-logs",
        moduleName: "Audit Logs",
    },
];

/* =========================================================
   NORMALIZE VALUES
========================================================= */

const normalizeModule = (value = "") =>
    String(value)
        .trim()
        .toLowerCase()
        .replace(/[_-]/g, " ")
        .replace(/\s+/g, " ");

const normalizeAction = (value = "") =>
    String(value).trim().toUpperCase();

/* =========================================================
   COMPONENT
========================================================= */

export default function ProfileMenu({ buttonRef }) {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    /* =====================================================
       REDUX - UI
    ===================================================== */

    const { profileMenuOpen } = useSelector(
        (state) => state.ui
    );

    /* =====================================================
       REDUX - AUTH
    ===================================================== */

    const {
        user,
        isAuthenticated,
        loading,
    } = useSelector((state) => state.auth);

    /* =====================================================
       REDUX - PERMISSIONS
    ===================================================== */

    const {
        userPermissions = [],
        userPermissionsLoading = false,
        userPermissionsLoaded = false,
    } = useSelector(
        (state) => state.menuPermission || {}
    );

    /* =====================================================
       USER ROLE
    ===================================================== */

    const roleName = String(
        user?.roleName ||
        user?.role?.roleName ||
        user?.role?.name ||
        user?.role ||
        user?.authority ||
        ""
    ).toUpperCase();

    const hasFullAccess = [
        "SUPER_ADMIN",
        "ADMIN",
    ].includes(roleName);

    /* =====================================================
       REF
    ===================================================== */

    const menuRef = useRef(null);

    /* =====================================================
       LOAD USER PERMISSIONS
    ===================================================== */

    useEffect(() => {

        if (!isAuthenticated || hasFullAccess) {
            return;
        }

        if (
            !userPermissionsLoading &&
            !userPermissionsLoaded
        ) {
            dispatch(getUserPermission());
        }

    }, [
        dispatch,
        isAuthenticated,
        hasFullAccess,
        userPermissionsLoading,
        userPermissionsLoaded,
    ]);

    /* =====================================================
       PERMISSION CHECK
       Supports grouped and flat permissions
    ===================================================== */

    const hasPermission = (moduleName, actionName) => {

        if (hasFullAccess) {
            return true;
        }

        if (!Array.isArray(userPermissions)) {
            return false;
        }

        const targetModule = normalizeModule(moduleName);
        const targetAction = normalizeAction(actionName);

        return userPermissions.some((permission) => {

            const permissionModule = normalizeModule(
                permission.moduleName ||
                permission.module?.moduleName ||
                permission.module?.name ||
                permission.name ||
                ""
            );

            if (permissionModule !== targetModule) {
                return false;
            }

            if (
                permission.active === false ||
                permission.module?.active === false ||
                permission.status === "INACTIVE"
            ) {
                return false;
            }

            /* =============================================
               GROUPED PERMISSIONS
            ============================================= */

            const actions = [
                ...(Array.isArray(permission.actions)
                    ? permission.actions
                    : []),

                ...(Array.isArray(permission.permissions)
                    ? permission.permissions
                    : []),
            ];

            const groupedAction = actions.find((action) => {

                const name =
                    typeof action === "string"
                        ? action
                        : (
                            action.actionName ||
                            action.name ||
                            action.action?.actionName ||
                            action.action?.name
                        );

                return (
                    normalizeAction(name) === targetAction
                );
            });

            if (groupedAction !== undefined) {

                if (typeof groupedAction === "string") {
                    return true;
                }

                return (
                    groupedAction.allowed === true ||
                    groupedAction.allowed === "true" ||
                    groupedAction.permission === true ||
                    groupedAction.permission === "true"
                );
            }

            /* =============================================
               FLAT PERMISSIONS
            ============================================= */

            const flatAction = normalizeAction(
                permission.actionName ||
                permission.action?.actionName ||
                permission.action?.name ||
                ""
            );

            if (flatAction === targetAction) {

                return (
                    permission.allowed === true ||
                    permission.allowed === "true" ||
                    permission.permission === true ||
                    permission.permission === "true"
                );
            }

            return false;
        });
    };

    /* =====================================================
       FILTER SHORTCUTS
    ===================================================== */

    const visibleShortcuts = shortcuts.filter((item) => {

        if (!item.moduleName) {
            return true;
        }

        if (hasFullAccess) {
            return true;
        }

        return hasPermission(item.moduleName, "VIEW");
    });

    /* =====================================================
       CLOSE MENU WHEN CLICKING OUTSIDE
    ===================================================== */

    useEffect(() => {

        function handleClick(e) {

            if (
                menuRef.current?.contains(e.target) ||
                buttonRef.current?.contains(e.target)
            ) {
                return;
            }

            dispatch(closeProfileMenu());
        }

        document.addEventListener(
            "mousedown",
            handleClick
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClick
            );
        };

    }, [dispatch, buttonRef]);

    /* =====================================================
       OPEN MODULE IN NEW TAB
    ===================================================== */

    const handleShortcutClick = (item) => {

        if (!item.to) return;

        window.open(
            item.to,
            "_blank",
            "noopener,noreferrer"
        );

        dispatch(closeProfileMenu());
    };

    /* =====================================================
       LOGOUT
    ===================================================== */

    const handleLogout = async () => {

        try {

            await dispatch(
                logoutUser()
            ).unwrap();

        } catch (error) {

            console.error(
                "BACKEND LOGOUT FAILED:",
                error
            );
        }

        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("posToken");
        localStorage.removeItem("posRefreshToken");

        dispatch(closeProfileMenu());

        toast.success(
            "Logged out successfully"
        );

        window.location.replace("/login");
    };


    /* =====================================================
       DON'T RENDER WHEN CLOSED
    ===================================================== */

    if (!profileMenuOpen) {
        return null;
    }


    /* =====================================================
   VIEW MY ACCOUNT
===================================================== */

    const handleView = () => {

        if (!user?.id) {
            toast.error("Unable to load your account details.");
            return;
        }

        dispatch(setExsistingUser(user));

        dispatch(closeProfileMenu());

        navigate(`/settings/users/view/${user.id}`);
    };


    /* =====================================================
       UI
    ===================================================== */

    return (
        <>
            {/* BACKDROP */}

            <div
                className="fixed inset-0 z-40"
                onClick={() =>
                    dispatch(closeProfileMenu())
                }
            />

            {/* PROFILE MENU */}

            <div
                ref={menuRef}
                className="
    absolute
    right-0
    top-12
    z-50
    w-[min(390px,calc(100vw-20px))]
    max-h-[calc(100dvh-75px)]
    overflow-y-auto
    overflow-x-hidden
    overscroll-contain
    rounded-xl
    border
    border-gray-200
    bg-white
    shadow-2xl
    custom-scrollbar-hidden
"
                onWheel={(e) => e.stopPropagation()}
            >

                {/* HEADER */}

                <div className="
    sticky top-0 z-20
    relative border-b
    border-gray-200
    bg-white p-5
">

                    <button
                        type="button"
                        onClick={() =>
                            dispatch(closeProfileMenu())
                        }
                        className="
                            absolute right-4 top-4
                            text-red-500 hover:text-red-600
                        "
                    >
                        <X size={18} />
                    </button>

                    {/* USER INFO */}

                    <div className="flex gap-3">

                        <div
                            className="
                                flex h-11 w-11
                                items-center justify-center
                                rounded-lg bg-purple-600
                                text-lg font-semibold text-white
                            "
                        >
                            {user?.name?.charAt(0) || "F"}
                        </div>

                        <div>

                            <h3 className="font-semibold text-gray-800">
                                {user?.name || "Frankleen Francis"}
                            </h3>

                            <p className="text-sm text-gray-500">
                                {user?.email || ""}
                            </p>

                            <div className="mt-2 text-xs text-gray-500">

                                User ID : {user?.id || "-"}

                                <span className="mx-2">
                                    •
                                </span>

                                Organization ID : 60074370991

                            </div>

                            <div className="mt-2">
                                <span className="
                                    rounded-full bg-purple-100
                                    px-2.5 py-1 text-[10px]
                                    font-semibold text-purple-700
                                ">
                                    {roleName || "USER"}
                                </span>
                            </div>

                        </div>

                    </div>

                    {/* ACCOUNT / LOGOUT */}

                    <div className="mt-5 flex items-center justify-between">

                        <button
                            type="button"
                            onClick={handleView}
                            className="
                                rounded border border-blue-500
                                px-3 py-1 text-sm text-blue-600
                                hover:bg-blue-50
                            "
                        >
                            My Account
                        </button>

                        <button
                            type="button"
                            onClick={handleLogout}
                            disabled={loading}
                            className="
                                flex items-center gap-2
                                text-red-500 hover:text-red-600
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            "
                        >

                            <LogOut size={16} />

                            {loading
                                ? "Signing Out..."
                                : "Sign Out"
                            }

                        </button>

                    </div>

                </div>

                {/* SHORTCUTS */}

                <div className="grid grid-cols-3 gap-y-8 p-6">

                    {!hasFullAccess &&
                        (
                            !userPermissionsLoaded ||
                            userPermissionsLoading
                        ) ? (

                        <div className="
                            col-span-3 py-5
                            text-center text-sm text-gray-500
                        ">
                            Loading permissions...
                        </div>

                    ) : visibleShortcuts.length > 0 ? (

                        visibleShortcuts.map((item) => {

                            const Icon = item.icon;

                            return (
                                <button
                                    key={item.title}
                                    type="button"
                                    onClick={() =>
                                        handleShortcutClick(item)
                                    }
                                    disabled={!item.to}
                                    className="
                                        flex flex-col items-center
                                        gap-2 rounded-lg p-2
                                        transition hover:bg-gray-50
                                        focus:outline-none
                                        focus:ring-2 focus:ring-blue-400
                                        disabled:cursor-default
                                    "
                                >

                                    <div className="
                                        rounded-lg bg-gray-100 p-3
                                        transition hover:bg-blue-50
                                    ">

                                        <Icon
                                            size={24}
                                            className="text-gray-600"
                                        />

                                    </div>

                                    <div className="
                                        text-center text-sm text-gray-700
                                    ">

                                        <div className="font-medium">
                                            {item.title}
                                        </div>

                                        {item.sub && (
                                            <div className="text-xs text-gray-500">
                                                {item.sub}
                                            </div>
                                        )}

                                    </div>

                                </button>
                            );
                        })

                    ) : (

                        <div className="
                            col-span-3 py-5
                            text-center text-sm text-gray-500
                        ">
                            No shortcuts available for your account.
                        </div>

                    )}

                </div>





            </div>

        </>
    );
}
