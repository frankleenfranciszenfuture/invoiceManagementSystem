import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, X } from "lucide-react";

import { closeSettingsMenu } from "../../../module/ui/uiSlice";
import { settings } from "../Nav/data/settings/settingsData";

export default function SettingsMenu() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const { settingsOpen } = useSelector((state) => state.ui);

    const menuRef = useRef(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        function handleClick(e) {
            if (
                menuRef.current &&
                !menuRef.current.contains(e.target)
            ) {
                dispatch(closeSettingsMenu());
            }
        }

        document.addEventListener("mousedown", handleClick);

        return () => {
            document.removeEventListener("mousedown", handleClick);
        };
    }, [dispatch]);

    const filteredSettings = useMemo(() => {
        if (!search.trim()) return settings;

        return settings
            .map((section) => ({
                ...section,
                items: section.items.filter((item) =>
                    item.label
                        .toLowerCase()
                        .includes(search.toLowerCase())
                ),
            }))
            .filter((section) => section.items.length > 0);
    }, [search]);

    if (!settingsOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 z-40"
                onClick={() => dispatch(closeSettingsMenu())}
            />

            {/* Panel */}
            <div
                ref={menuRef}
                className="absolute right-0 top-12 z-50 w-[390px] h-[720px] rounded-xl border bg-white shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="border-b p-5">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-semibold">
                            Settings
                        </h2>

                        <button
                            onClick={() => dispatch(closeSettingsMenu())}
                            className="text-red-500 hover:text-red-600"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative mt-5">
                        <Search
                            size={18}
                            className="absolute left-3 top-3 text-gray-400"
                        />

                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search Settings"
                            className="w-full rounded-lg border py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Body */}
                <div className="h-[620px] overflow-y-auto">
                    {filteredSettings.length === 0 ? (
                        <div className="flex h-full items-center justify-center">
                            <p className="text-gray-400">
                                No settings found
                            </p>
                        </div>
                    ) : (
                        filteredSettings.map((section) => (
                            <div
                                key={section.title}
                                className="py-3"
                            >
                                <div className="px-5 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                    {section.title}
                                </div>

                                {section.items.map((item) => {
                                    const Icon = item.icon;

                                    const active =
                                        location.pathname === item.path;

                                    return (
                                        <button
                                            key={item.label}
                                            onClick={() => {
                                                navigate(item.path);
                                                dispatch(closeSettingsMenu());
                                            }}
                                            className={`mx-3 mb-1 flex w-[calc(100%-24px)] items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${active
                                                ? "bg-blue-600 text-white"
                                                : "text-gray-700 hover:bg-gray-100"
                                                }`}
                                        >
                                            <Icon
                                                size={18}
                                                className={
                                                    active
                                                        ? "text-white"
                                                        : "text-gray-400"
                                                }
                                            />

                                            <span className="text-sm">
                                                {item.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}