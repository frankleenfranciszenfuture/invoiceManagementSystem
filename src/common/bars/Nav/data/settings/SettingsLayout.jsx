import React, { useEffect, useMemo, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Search,
    Settings,
    X,
} from "lucide-react";

import { settings } from "../settings/settingsData";

/* Route of the All Settings grid page */
const ALL_SETTINGS_PATH = "/settings";

export default function SettingsLayout() {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const searchRef = useRef(null);

    const [search, setSearch] = useState("");
    const [openTitles, setOpenTitles] = useState([]);

    /* Auto-open the section that contains the active page */
    useEffect(() => {
        const active = settings.find((s) =>
            s.items.some((i) => i.path === pathname)
        );
        if (active) {
            setOpenTitles((prev) =>
                prev.includes(active.title) ? prev : [...prev, active.title]
            );
        }
    }, [pathname]);

    /* "/" focuses search */
    useEffect(() => {
        const onKey = (e) => {
            const tag = document.activeElement?.tagName;
            if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA") {
                e.preventDefault();
                searchRef.current?.focus();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    const toggle = (title) =>
        setOpenTitles((prev) =>
            prev.includes(title)
                ? prev.filter((t) => t !== title)
                : [...prev, title]
        );

    /* Filter sidebar by search */
    const filtered = useMemo(() => {
        const value = search.trim().toLowerCase();
        if (!value) return settings;
        return settings
            .map((s) => ({
                ...s,
                items: s.items.filter((i) =>
                    i.label.toLowerCase().includes(value)
                ),
            }))
            .filter((s) => s.items.length > 0);
    }, [search]);

    const orgSections = filtered.filter((s) => s.group !== "module");
    const moduleSections = filtered.filter((s) => s.group === "module");
    const searching = search.trim().length > 0;

    const renderSection = (section) => {
        const isOpen = searching || openTitles.includes(section.title);

        return (
            <div key={section.title}>
                <button
                    type="button"
                    onClick={() => toggle(section.title)}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[14px] text-gray-800 transition hover:bg-gray-50 ${isOpen ? "bg-gray-100 font-medium" : ""
                        }`}
                >
                    {isOpen ? (
                        <ChevronDown size={13} className="text-gray-600" />
                    ) : (
                        <ChevronRight size={13} className="text-gray-500" />
                    )}
                    {section.title}
                </button>

                {isOpen && (
                    <ul className="mt-1 space-y-0.5">
                        {section.items.map((item) => {
                            const active = pathname === item.path;
                            return (
                                <li key={item.path}>
                                    <button
                                        type="button"
                                        onClick={() => navigate(item.path)}
                                        className={`block w-full rounded-lg py-2.5 pl-8 pr-3 text-left text-[13px] transition ${active
                                                ? "bg-emerald-500 font-semibold text-white"
                                                : "text-gray-700 hover:bg-gray-50"
                                            }`}
                                    >
                                        {item.label}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        );
    };

    return (
        <div className="flex h-screen flex-col bg-white">
            {/* ================= HEADER ================= */}
            <header className="flex h-[74px] shrink-0 items-center border-b border-gray-200 bg-white px-6">
                <div className="flex items-center gap-3">
                    <Settings size={26} className="text-blue-600" />

                    <div className="h-8 border-l border-gray-200" />

                    <button
                        type="button"
                        onClick={() => navigate(ALL_SETTINGS_PATH)}
                        aria-label="Back to all settings"
                        className="flex h-9 w-7 items-center justify-center rounded-md border border-gray-200 text-gray-800 transition hover:bg-gray-50"
                    >
                        <ChevronLeft size={15} />
                    </button>

                    <div>
                        <h1 className="text-[18px] font-medium leading-tight text-gray-900">
                            All Settings
                        </h1>
                        <p className="text-xs text-gray-500">WXYZ</p>
                    </div>
                </div>

                <div className="mx-auto w-full max-w-[300px]">
                    <div className="relative">
                        <Search
                            size={14}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600"
                        />
                        <input
                            ref={searchRef}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search settings ( / )"
                            className="h-10 w-full rounded-lg bg-gray-50 pl-9 pr-3 text-sm text-gray-700 outline-none placeholder:text-gray-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-100"
                >
                    Close Settings
                    <X size={14} className="text-red-500" />
                </button>
            </header>

            {/* ================= SIDEBAR + BODY ================= */}
            <div className="flex min-h-0 flex-1">
                <aside className="w-[240px] shrink-0 overflow-y-auto border-r border-gray-200 bg-white px-2 pb-6 pt-5">
                    {orgSections.length > 0 && (
                        <>
                            <p className="px-3 pb-2 text-[11px] font-medium uppercase tracking-wide text-gray-500">
                                Organization Settings
                            </p>
                            <div className="space-y-1">
                                {orgSections.map(renderSection)}
                            </div>
                        </>
                    )}

                    {moduleSections.length > 0 && (
                        <>
                            <p className="px-3 pb-2 pt-6 text-[11px] font-medium uppercase tracking-wide text-gray-500">
                                Module Settings
                            </p>
                            <div className="space-y-1">
                                {moduleSections.map(renderSection)}
                            </div>
                        </>
                    )}

                    {orgSections.length === 0 && moduleSections.length === 0 && (
                        <p className="px-3 py-6 text-sm text-gray-400">
                            No settings found
                        </p>
                    )}
                </aside>

                {/* Body: the routed page renders here */}
                <main className="min-w-0 flex-1 overflow-y-auto bg-white">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}