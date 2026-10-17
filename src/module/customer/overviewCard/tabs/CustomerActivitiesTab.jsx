
import React, { useMemo, useState } from "react";
import {
    FileText,
    Wallet,
    UserRound,
    MapPin,
    History,
} from "lucide-react";

const TYPE_ICON = {
    payment: Wallet,
    invoice: FileText,
    profile: UserRound,
    address: MapPin,
};

const TYPE_TONE = {
    payment: "border-emerald-500 text-emerald-500",
    deleted: "border-rose-500 text-rose-500",
};

const fmtDateTime = (value) =>
    value
        ? new Date(value).toLocaleString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
        : "-";

const cap = (value = "") =>
    value.charAt(0).toUpperCase() + value.slice(1);

export default function CustomerActivitiesTab({ activities = [] }) {
    const [filter, setFilter] = useState("all");

    const activityTypes = useMemo(
        () => [...new Set(activities.map((item) => item.type).filter(Boolean))],
        [activities]
    );

    const visibleActivities = useMemo(
        () =>
            activities.filter(
                (item) => filter === "all" || item.type === filter
            ),
        [activities, filter]
    );

    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <header className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
                <History size={18} className="text-[#088178]" />
                <h2 className="text-[15px] font-semibold text-slate-700">
                    Customer Activities
                </h2>
                <span className="ml-auto text-xs text-slate-400">
                    {visibleActivities.length} activities
                </span>
            </header>

            <div className="space-y-5 p-5 sm:p-6">
                <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
                    {["all", ...activityTypes].map((type) => (
                        <button
                            key={type}
                            type="button"
                            onClick={() => setFilter(type)}
                            className={`rounded-lg px-4 py-2 text-sm transition ${filter === type
                                ? "bg-white font-medium text-slate-800 shadow-sm"
                                : "text-slate-500 hover:text-slate-800"
                                }`}
                        >
                            {type === "all" ? "All activities" : cap(type)}
                        </button>
                    ))}
                </div>

                {visibleActivities.length === 0 ? (
                    <div className="py-12 text-center">
                        <History
                            size={32}
                            className="mx-auto text-slate-300"
                        />
                        <p className="mt-3 text-sm text-slate-500">
                            No activities found.
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                            Customer changes will appear here when available.
                        </p>
                    </div>
                ) : (
                    <ol className="relative ml-4">
                        <span className="absolute bottom-3 left-0 top-3 border-l border-slate-200" />

                        {visibleActivities.map((item, index) => {
                            const Icon = TYPE_ICON[item.type] || FileText;
                            const tone =
                                item.tone ||
                                TYPE_TONE[item.type] ||
                                "border-[#088178] text-[#088178]";

                            return (
                                <li
                                    key={
                                        item.id ??
                                        `${item.type}-${item.title}-${index}`
                                    }
                                    className="relative flex gap-4 pb-7 pl-8 last:pb-0"
                                >
                                    <span
                                        className={`absolute -left-[18px] top-0 flex h-9 w-9 items-center justify-center rounded-full border-2 bg-white ${tone}`}
                                    >
                                        <Icon size={15} />
                                    </span>

                                    <div className="min-w-0 flex-1 rounded-xl border border-slate-100 p-4">
                                        <p className="break-words text-sm font-medium text-slate-700">
                                            {item.title || cap(item.type || "Activity")}
                                        </p>

                                        {item.meta && (
                                            <p className="mt-1 break-words text-xs text-slate-500">
                                                {item.meta}
                                            </p>
                                        )}

                                        <p className="mt-2 text-xs text-slate-400">
                                            {fmtDateTime(
                                                item.createdAt || item.date
                                            )}
                                        </p>
                                    </div>
                                </li>
                            );
                        })}
                    </ol>
                )}
            </div>
        </section>
    );
}
