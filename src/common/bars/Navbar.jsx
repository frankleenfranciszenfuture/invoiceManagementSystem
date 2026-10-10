import React from "react";

import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { FileText } from "lucide-react";

import QuickCreateButton from "../../common/bars/Nav/QuickCreateButton";
import NotificationButton from "../../common/bars/Nav/NotificationButton";
import SettingsButton from "../../common/bars/Nav/SettingsButton";
import ProfileButton from "../../common/bars/Nav/ProfileButton";

export default function Navbar({ title }) {

    const location = useLocation();

    const user = useSelector(
        (state) => state.auth.user
    );

    const hiddenPaths = ["/customers", "/settings"];

    const hideNavbar = hiddenPaths.some((path) =>
        location.pathname.startsWith(path)
    );

    if (hideNavbar) {
        return null;
    }

    const firstName =
        (
            user?.name ||
            user?.fullName ||
            user?.firstName ||
            user?.username ||
            ""
        )
            .split(" ")[0] || "there";

    const today =
        new Date().toLocaleDateString(
            "en-IN",
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            }
        );

    return (
        /*
         * Floating bar, same surface as the sidebar (#1b1f27, rounded-3xl family).
         * mt-3 lines it up with the sidebar's top edge; mr-3 mirrors the 12px
         * gap that AppLayout's left margin already gives on the other side.
         */
        <header
            className="
                relative z-20 mr-5 mx-2 mt-3 flex h-[54px] shrink-0
                items-center justify-between rounded-md
                border border-white/5 bg-[#FFFFFF] px-3
                shadow-xl shadow-slate-900/20
            "
        >

            {/* ================= LEFT: TITLE + GREETING ================= */}

            <div className="flex min-w-0 items-center gap-3">

                <div
                    className="
                        flex h-10 w-10 shrink-0 items-center justify-center
                        rounded-xl bg-[#0F4659]-to-br from-[green]-500/25 to-green-500/5
                        ring-1 ring-blue-400/20
                    "
                >
                    <FileText className="h-5 w-5 text-[#0F4659]" />
                </div>

                <div className="min-w-0 leading-tight">
                    <h1 className="truncate text-lg font-semibold text-[#0F4659]">
                        {`Hello, ${firstName} 👋`}
                    </h1>

                    <p className="hidden items-center gap-2 truncate text-xs text-[#0F4659] sm:flex">
                        <span className="truncate">Today is {today}</span>
                    </p>
                </div>
            </div>


            {/* ================= RIGHT: ACTIONS ================= */}

            {/*
                Your button components are used exactly as they are.
                The wrapper only adds the pill background and lightens
                the icons so they read on the dark bar. If a dropdown
                looks off, delete the two [&_...] lines below.
            */}

            <div className="flex items-center gap-3">

                <div
                    className="
                        flex items-center gap-1 rounded-xl
                        bg-white/[0.05] p-1 ring-1 ring-white/5
                        [&_button_svg]:text-[#0F4659]
                        [&_button:hover_svg]:text-white
                    "
                >
                    <QuickCreateButton />
                    <NotificationButton />
                    <SettingsButton />
                </div>

                <span className="h-7 w-px bg-white/10" />

                <ProfileButton />
            </div>

        </header>
    );
}