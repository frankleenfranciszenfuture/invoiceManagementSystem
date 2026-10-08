import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Search,
    X,
    Settings,
    Building2,
    Users,
    SlidersHorizontal,
    FileText,
    Palette,
    Zap,
    Folder,
} from "lucide-react";

import { settings } from "../settings/settingsData";

/* =========================================================
   LAYOUT CONFIG  (organization panel only)
   Each entry = one column card. Titles must match
   `section.title` in settingsData. Organization sections
   not listed here get their own column at the end.
========================================================= */
const COLUMNS = [
    ["Organization"],
    ["Users & Roles", "Taxes & Compliance"],
    ["Setup & Configurations"],
    ["Customization"],
    ["Automation"],
];

/* Icon + colors per section (full class names so Tailwind keeps them) */
const SECTION_STYLE = {
    Organization: { icon: Building2, header: "from-emerald-50 to-white", iconColor: "text-emerald-600" },
    "Users & Roles": { icon: Users, header: "from-rose-50 to-white", iconColor: "text-rose-500" },
    "Taxes & Compliance": { icon: FileText, header: "from-blue-50 to-white", iconColor: "text-blue-600" },
    "Setup & Configurations": { icon: SlidersHorizontal, header: "from-orange-50 to-white", iconColor: "text-orange-500" },
    Customization: { icon: Palette, header: "from-amber-50 to-white", iconColor: "text-amber-500" },
    Automation: { icon: Zap, header: "from-red-50 to-white", iconColor: "text-red-500" },
};

const DEFAULT_STYLE = {
    icon: Folder,
    header: "from-gray-50 to-white",
    iconColor: "text-gray-500",
};

/* One section: gradient header + list of links */
function SectionBlock({ section, onNavigate }) {
    const style = SECTION_STYLE[section.title] || DEFAULT_STYLE;
    const SectionIcon = style.icon;

    return (
        <div>
            <div
                className={`flex items-center gap-2.5 rounded-lg bg-gradient-to-r ${style.header} px-3 py-2.5`}
            >
                <SectionIcon size={17} className={style.iconColor} />
                <h3 className="text-[15px] font-medium text-gray-800">
                    {section.title}
                </h3>
            </div>

            <ul className="mt-1">
                {section.items.map((item) => (
                    <li key={item.path}>
                        <button
                            type="button"
                            onClick={() => onNavigate(item.path)}
                            className="block w-full px-4 py-2.5 text-left text-[14px] text-gray-700 transition hover:text-blue-600"
                        >
                            {item.label}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

/* Big white panel with a title and a grid of column cards */
function Panel({ title, children }) {
    return (
        <div className="rounded-2xl bg-white px-4 pb-4 pt-7 shadow-sm">
            <h2 className="mb-5 px-4 text-[20px] font-normal text-gray-800">
                {title}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {children}
            </div>
        </div>
    );
}

export default function SettingsDash() {

    const navigate = useNavigate();
    const searchRef = useRef(null);

    const [search, setSearch] = useState("");
    const [showBanner, setShowBanner] = useState(true);

    /* Press "/" to focus search */
    useEffect(() => {
        const onKeyDown = (e) => {
            const tag = document.activeElement?.tagName;
            if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA") {
                e.preventDefault();
                searchRef.current?.focus();
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, []);

    /* Filter items by search text */
    const filteredSettings = useMemo(() => {
        const value = search.trim().toLowerCase();
        if (!value) return settings;

        return settings
            .map((section) => ({
                ...section,
                items: section.items.filter((item) =>
                    item.label.toLowerCase().includes(value)
                ),
            }))
            .filter((section) => section.items.length > 0);
    }, [search]);

    /* Organization sections arranged into columns */
    const orgColumns = useMemo(() => {
        const orgSections = filteredSettings.filter((s) => s.group !== "module");
        const byTitle = Object.fromEntries(orgSections.map((s) => [s.title, s]));
        const used = new Set(COLUMNS.flat());

        const result = COLUMNS.map((titles) =>
            titles.map((t) => byTitle[t]).filter(Boolean)
        ).filter((col) => col.length > 0);

        orgSections.forEach((s) => {
            if (!used.has(s.title)) result.push([s]);
        });

        return result;
    }, [filteredSettings]);

    /* Module sections: one card per module */
    const moduleSections = useMemo(
        () => filteredSettings.filter((s) => s.group === "module"),
        [filteredSettings]
    );

    const isEmpty = orgColumns.length === 0 && moduleSections.length === 0;

    return (
        <div className="flex h-screen bg-gray-50 font-sans text-[13px] overflow-hidden mt-5  px-2">
            <div className="flex-1 min-h-0 bg-white overflow-hidden rounded-lg">
                <div className="px-2 py-5 max-w-30xl w-full">
                    {/* ================= TOP HEADER ================= */}
                    <header className="sticky top-0 z-40 h-[74px] border-b border-gray-200 bg-white rounded-lg ">
                        <div className="flex h-full items-center px-6">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center">
                                    <Settings size={26} className="text-blue-600" />
                                </div>

                                <div className="border-l border-gray-200 pl-3">
                                    <h1 className="text-[18px] font-medium leading-tight text-gray-900">
                                        All Settings
                                    </h1>
                                    <p className="text-xs text-gray-500">WXYZ</p>
                                </div>
                            </div>

                            <div className="mx-auto w-full max-w-[350px]">
                                <div className="relative">
                                    <Search
                                        size={15}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600"
                                    />
                                    <input
                                        ref={searchRef}
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search settings ( / )"
                                        className="h-11 w-full rounded-xl border border-blue-400 bg-white pl-9 pr-4 text-sm text-gray-700 outline-none ring-2 ring-blue-100 transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-200"
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
                        </div>
                    </header>

                    {/* ================= CONTENT ================= */}
                    <main className="px-6 py-7">
                        {/* Promo banner */}
                        {showBanner && (
                            <div className="mb-10 flex items-center gap-4 rounded-xl bg-[#eef3fd] px-4 py-3.5">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                                    <Settings size={20} className="text-blue-600" />
                                </div>

                                <p className="flex-1 text-[13px] text-gray-700">

                                </p>

                                <button
                                    type="button"
                                    onClick={() => setShowBanner(false)}
                                    aria-label="Dismiss banner"
                                    className="shrink-0 rounded p-1 text-red-500 transition hover:bg-red-50"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}

                        {isEmpty ? (
                            <div className="flex min-h-[500px] items-center justify-center">
                                <div className="text-center">
                                    <Search size={42} className="mx-auto mb-4 text-gray-300" />
                                    <h2 className="text-lg font-semibold text-gray-700">
                                        No settings found
                                    </h2>
                                    <p className="mt-1 text-sm text-gray-400">
                                        Try another search term.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Organization settings */}
                                {orgColumns.length > 0 && (
                                    <Panel title="Organization Settings">
                                        {orgColumns.map((sections, i) => (
                                            <div
                                                key={i}
                                                className="flex min-h-[370px] flex-col gap-3 rounded-xl border border-gray-200 bg-white p-1"
                                            >
                                                {sections.map((section) => (
                                                    <SectionBlock
                                                        key={section.title}
                                                        section={section}
                                                        onNavigate={navigate}
                                                    />
                                                ))}
                                            </div>
                                        ))}
                                    </Panel>
                                )}

                                {/* Module settings */}
                                {moduleSections.length > 0 && (
                                    <Panel title="Module Settings">
                                        {moduleSections.map((section) => (
                                            <div
                                                key={section.title}
                                                className="min-h-[200px] rounded-xl border border-gray-200 bg-white p-1"
                                            >
                                                <SectionBlock
                                                    section={section}
                                                    onNavigate={navigate}
                                                />
                                            </div>
                                        ))}
                                    </Panel>
                                )}
                            </div>
                        )}
                    </main>
                </div>

            </div>
        </div>

    )
}
