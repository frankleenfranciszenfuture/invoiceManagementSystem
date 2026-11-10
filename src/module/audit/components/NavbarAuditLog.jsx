
import React from "react";

import {
    useLocation,
    useNavigate,
} from "react-router-dom";

import {
    ArrowLeft,
    RefreshCw,
    ShieldCheck,
} from "lucide-react";

export default function NavbarAuditLog({
    title = "Audit Logs",
    subtitle = "Monitor and track system activities",
    onRefresh,
    loading = false,
    showBackButton = false,
}) {

    const navigate = useNavigate();
    const location = useLocation();

    const isDetailsPage = location.pathname.includes(
        "/audit-logs/view/"
    );

    return (
        <div className="
            mb-5 flex flex-wrap items-center
            justify-between gap-4
            rounded-xl border border-gray-200
            bg-white px-5 py-4 shadow-sm
        ">

            {/* LEFT SECTION */}

            <div className="flex items-center gap-3">

                {showBackButton && (
                    <button
                        type="button"
                        onClick={() => navigate("/audit-logs")}
                        className="
                            flex h-9 w-9 shrink-0
                            items-center justify-center
                            rounded-lg border border-gray-200
                            text-gray-600 transition
                            hover:bg-gray-100
                        "
                        title="Back to Audit Logs"
                    >
                        <ArrowLeft size={17} />
                    </button>
                )}

                <div className="
                    flex h-11 w-11 shrink-0
                    items-center justify-center
                    rounded-xl bg-blue-50
                    text-blue-600
                ">
                    <ShieldCheck size={23} />
                </div>

                <div>
                    <h1 className="
                        text-lg font-semibold
                        tracking-tight text-gray-800
                    ">
                        {isDetailsPage
                            ? "Audit Log Details"
                            : title
                        }
                    </h1>

                    <p className="
                        mt-0.5 text-xs text-gray-500
                    ">
                        {isDetailsPage
                            ? "View complete activity history and record changes"
                            : subtitle
                        }
                    </p>
                </div>

            </div>

            {/* RIGHT SECTION */}

            <div className="
                flex items-center gap-3
            ">

                <div className="
                    hidden items-center gap-2
                    rounded-lg border border-gray-200
                    bg-gray-50 px-3 py-2
                    sm:flex
                ">
                    <span className="
                        h-2 w-2 rounded-full bg-green-500
                    " />

                    <span className="
                        text-xs font-medium text-gray-600
                    ">
                        Audit Tracking Active
                    </span>
                </div>

                {!isDetailsPage && onRefresh && (
                    <button
                        type="button"
                        onClick={onRefresh}
                        disabled={loading}
                        className="
                            flex items-center gap-2
                            rounded-lg bg-[#515F73]
                            px-4 py-2.5 text-xs
                            font-medium text-white
                            transition hover:bg-[#3f4b5e]
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                        "
                    >
                        <RefreshCw
                            size={14}
                            className={loading ? "animate-spin" : ""}
                        />

                        Refresh
                    </button>
                )}

            </div>

        </div>
    );
}
