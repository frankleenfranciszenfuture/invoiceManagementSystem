import React, { useEffect } from "react";

export default function UnsavedChangesDialog({
    open,
    onStay,
    onDiscard,
}) {
    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                onStay(); // Close dialog
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [open, onStay]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-start justify-center pt-4 z-50"

            onClick={onStay}
        >

            <div
                className="bg-white rounded-lg w-[520px] shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="bg-white rounded-lg w-[520px] shadow-xl">
                    <div className="p-6 border-b border-gray-300">
                        <h2 className="text-2xl font-medium">
                            ⚠ Leave this page?
                        </h2>

                        <p className="mt-4 text-gray-600">
                            If you leave, your unsaved changes will be discarded.
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 p-5">

                        <button
                            onClick={onStay}
                            className="bg-blue-600 text-white px-4 py-2 rounded"
                        >
                            Stay Here
                        </button>


                        <button
                            onClick={onDiscard}
                            className="border  border-gray-300 px-4 py-2 rounded hover:bg-gray-200"
                        >
                            Leave & Discard Changes
                        </button>

                    </div>
                </div>
            </div>
        </div>
    );
}