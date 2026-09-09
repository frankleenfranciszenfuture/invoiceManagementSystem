
import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import { closeProfileMenu } from "../../../module/ui/uiSlice";

import {
    logout,
    logoutUser,
} from "../../../module/auth/slice/authSlice";

import toast from "react-hot-toast";

import {
    X,
    LogOut,
    FileText,
    MessageSquare,
    Monitor,
    PlayCircle,
    Globe,
    Package,
    Accessibility,
    Mail,
    Video,
    GraduationCap,
    Sparkles,
    ChevronRight,
} from "lucide-react";

/* =========================================================
   SHORTCUTS
   ========================================================= */

const shortcuts = [
    {
        icon: FileText,
        title: "Help",
        sub: "Documents",
    },
    {
        icon: MessageSquare,
        title: "FAQs",
    },
    {
        icon: Monitor,
        title: "Forum",
    },
    {
        icon: PlayCircle,
        title: "Video",
        sub: "Tutorials",
    },
    {
        icon: Globe,
        title: "Explore",
        sub: "Features",
    },
    {
        icon: Package,
        title: "Migration",
        sub: "Guide",
    },
];

/* =========================================================
   COMPONENT
   ========================================================= */

export default function ProfileMenu({ buttonRef }) {

    const dispatch = useDispatch();

    /* =====================================================
       REDUX
       ===================================================== */

    const { profileMenuOpen } =
        useSelector((state) => state.ui);

    const {
        user,
        isAuthenticated,
        loading,
    } = useSelector((state) => state.auth);

    /* =====================================================
       REF
       ===================================================== */

    const menuRef = useRef(null);

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
       DEBUG AUTH STATE
       ===================================================== */

    useEffect(() => {

        console.log(
            "AUTH USER:",
            user
        );

        console.log(
            "IS AUTHENTICATED:",
            isAuthenticated
        );

    }, [user, isAuthenticated]);

    /* =====================================================
       LOGOUT
       ===================================================== */

    const handleLogout = async () => {

        console.log("🔴 LOGOUT CLICKED");

        try {

            /*
             * IMPORTANT:
             *
             * Call backend /logout first.
             *
             * This expires the HttpOnly jwt cookie.
             */
            const result =
                await dispatch(
                    logoutUser()
                ).unwrap();

            console.log(
                "✅ BACKEND LOGOUT SUCCESS:",
                result
            );

        } catch (error) {

            console.error(
                "❌ BACKEND LOGOUT FAILED:",
                error
            );

            /*
             * Even if backend logout fails,
             * clear Redux authentication state.
             */
            dispatch(logout());
        }

        /* =================================================
           CLEAR OLD LOCAL STORAGE TOKENS
           ================================================= */

        /*
         * These are kept only for cleaning up tokens
         * created by the previous authentication implementation.
         */
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("posToken");
        localStorage.removeItem("posRefreshToken");

        /* =================================================
           CLOSE PROFILE MENU
           ================================================= */

        dispatch(closeProfileMenu());

        /* =================================================
           TOAST
           ================================================= */

        toast.success(
            "Logged out successfully"
        );

        /* =================================================
           REDIRECT
           ================================================= */

        window.location.replace("/login");
    };

    /* =====================================================
       DON'T RENDER WHEN CLOSED
       ===================================================== */

    if (!profileMenuOpen) {
        return null;
    }

    /* =====================================================
       UI
       ===================================================== */

    return (
        <>
            {/* =================================================
                BACKDROP
                ================================================= */}

            <div
                className="fixed inset-0 z-40"
                onClick={() =>
                    dispatch(closeProfileMenu())
                }
            />

            {/* =================================================
                PROFILE MENU
                ================================================= */}

            <div
                ref={menuRef}
                className="
                    absolute
                    right-0
                    top-12
                    z-50
                    w-[390px]
                    overflow-hidden
                    rounded-xl
                    border
                    bg-white
                    shadow-2xl
                "
            >

                {/* =================================================
                    HEADER
                    ================================================= */}

                <div className="relative border-b p-5">

                    {/* CLOSE BUTTON */}

                    <button
                        onClick={() =>
                            dispatch(closeProfileMenu())
                        }
                        className="
                            absolute
                            right-4
                            top-4
                            text-red-500
                            hover:text-red-600
                        "
                    >
                        <X size={18} />
                    </button>

                    {/* USER INFO */}

                    <div className="flex gap-3">

                        <div
                            className="
                                flex
                                h-11
                                w-11
                                items-center
                                justify-center
                                rounded-lg
                                bg-purple-600
                                text-lg
                                font-semibold
                                text-white
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

                        </div>

                    </div>

                    {/* ACCOUNT / LOGOUT */}

                    <div className="mt-5 flex items-center justify-between">

                        <button
                            className="
                                rounded
                                border
                                border-blue-500
                                px-3
                                py-1
                                text-sm
                                text-blue-600
                                hover:bg-blue-50
                            "
                        >
                            My Account
                        </button>

                        <button
                            onClick={handleLogout}
                            disabled={loading}
                            className="
                                flex
                                items-center
                                gap-2
                                text-red-500
                                hover:text-red-600
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

                {/* =================================================
                    SHORTCUTS
                    ================================================= */}

                <div className="grid grid-cols-3 gap-y-8 p-6">

                    {shortcuts.map((item) => {

                        const Icon = item.icon;

                        return (
                            <button
                                key={item.title}
                                className="
                                    flex
                                    flex-col
                                    items-center
                                    gap-2
                                    rounded-lg
                                    p-2
                                    hover:bg-gray-50
                                "
                            >

                                <div className="rounded-lg bg-gray-100 p-3">

                                    <Icon
                                        size={24}
                                        className="text-gray-600"
                                    />

                                </div>

                                <div className="text-center text-sm text-gray-700">

                                    <div>
                                        {item.title}
                                    </div>

                                    {item.sub && (
                                        <div>
                                            {item.sub}
                                        </div>
                                    )}

                                </div>

                            </button>
                        );
                    })}

                </div>

                {/* =================================================
                    ACCESSIBILITY
                    ================================================= */}

                <div className="px-5">

                    <button
                        className="
                            flex
                            w-full
                            items-center
                            justify-between
                            rounded-lg
                            border
                            p-3
                            hover:bg-gray-50
                        "
                    >

                        <div className="flex items-center gap-3">

                            <Accessibility
                                size={18}
                                className="text-gray-600"
                            />

                            <span className="text-sm">
                                Accessibility Preferences
                            </span>

                        </div>

                        <ChevronRight size={18} />

                    </button>

                </div>

                {/* =================================================
                    NEED ASSISTANCE
                    ================================================= */}

                <div className="mt-5 border-t p-5">

                    <h3 className="mb-5 text-2xl font-semibold">
                        Need Assistance?
                    </h3>

                    <div className="space-y-4">

                        <button
                            className="
                                flex
                                items-center
                                gap-3
                                text-gray-700
                                hover:text-blue-600
                            "
                        >
                            <Mail size={18} />
                            Send an email
                        </button>

                        <button
                            className="
                                flex
                                items-center
                                gap-3
                                text-gray-700
                                hover:text-blue-600
                            "
                        >
                            <Video size={18} />
                            Record screen & share feedback
                        </button>

                        <button
                            className="
                                flex
                                items-center
                                gap-3
                                text-gray-700
                                hover:text-blue-600
                            "
                        >
                            <GraduationCap size={18} />
                            Register for webinars
                        </button>

                    </div>

                </div>

                {/* =================================================
                    WHAT'S NEW
                    ================================================= */}

                <div className="border-t bg-gray-50 p-5">

                    <div className="flex items-start gap-3">

                        <Sparkles className="text-orange-500" />

                        <div>

                            <h4 className="font-semibold">
                                What's New?
                            </h4>

                            <p className="mt-1 text-sm text-gray-500">
                                View the latest features and enhancements.
                            </p>

                        </div>

                    </div>

                </div>

            </div>
        </>
    );
}