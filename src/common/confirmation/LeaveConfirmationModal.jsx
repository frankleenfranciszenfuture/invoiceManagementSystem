
import React from "react";

export default function LeaveConfirmationModal({
    show,
    title = "Leave This Page?",
    message = "Do you want to leave this page?",
    stayText = "Stay Here",
    leaveText = "Leave",
    onStay,
    onLeave,
    leaveButtonClassName = "",
}) {
    if (!show) return null;

    return (
        <div
            className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/50 p-4"
            onClick={(event) => {
                if (event.target === event.currentTarget) {
                    onStay?.();
                }
            }}
        >
            <div
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="leave-confirmation-title"
                className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
            >
                <h2
                    id="leave-confirmation-title"
                    className="text-lg font-semibold text-gray-900"
                >
                    {title}
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                    {message}
                </p>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onStay}
                        className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                        {stayText}
                    </button>

                    <button
                        type="button"
                        onClick={onLeave}
                        className={`rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 ${leaveButtonClassName}`}
                    >
                        {leaveText}
                    </button>
                </div>
            </div>
        </div>
    );
}
