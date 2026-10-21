
import React from "react";
import { ChevronDown } from "lucide-react";

export default function Pagination({
    page = 0,
    size = 10,
    totalElements = 0,
    totalPages = 0,
    onPageChange,
    onPageSizeChange,
    loading = false,
    label = "records",
}) {
    const currentPage = Number(page) || 0;
    const pageSize = Number(size) || 10;
    const elements = Number(totalElements) || 0;
    const pages = Number(totalPages) || 0;

    const firstRecord =
        elements === 0 ? 0 : currentPage * pageSize + 1;

    const lastRecord = Math.min(
        (currentPage + 1) * pageSize,
        elements
    );

    return (
        <div
            className="
                p-4
                border-t
                border-gray-100
                flex
                flex-col
                sm:flex-row
                items-center
                justify-between
                gap-3
                bg-white
            "
        >
            {/* SHOWING COUNT + PAGE SIZE */}
            <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm text-gray-500">
                    Showing {firstRecord}–{lastRecord} of {elements} {label}
                </p>
            </div>

            {/* PAGINATION CONTROLS */}
            <div className="flex items-center gap-3">
                {/* PREVIOUS */}
                <button
                    type="button"
                    disabled={currentPage <= 0 || loading}
                    onClick={() =>
                        onPageChange?.(currentPage - 1)
                    }
                    className="
                        text-sm
                        text-gray-400
                        hover:text-[#754DD2]
                        disabled:opacity-40
                        disabled:cursor-not-allowed
                        transition-colors
                    "
                >
                    Previous
                </button>

                {/* CURRENT PAGE */}
                <span
                    className="
                        w-8
                        h-8
                        flex
                        items-center
                        justify-center
                        rounded-lg
                        bg-[#754DD2]
                        text-white
                        text-sm
                        font-medium
                    "
                >
                    {pages === 0 ? 0 : currentPage + 1}
                </span>

                <span className="text-sm text-gray-400">
                    of {pages}
                </span>

                {/* NEXT */}
                <button
                    type="button"
                    disabled={
                        currentPage >= pages - 1 || loading
                    }
                    onClick={() =>
                        onPageChange?.(currentPage + 1)
                    }
                    className="
                        text-sm
                        text-gray-400
                        hover:text-[#754DD2]
                        disabled:opacity-40
                        disabled:cursor-not-allowed
                        transition-colors
                    "
                >
                    Next
                </button>
            </div>
        </div>
    );
}
