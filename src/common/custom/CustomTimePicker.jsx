
import React from "react";
import { Clock } from "lucide-react";

export default function CustomTimePicker({
    label,
    value = "",
    onChange,
    disabled = false,
    required = false,
    className = "",
}) {
    return (
        <div className="flex w-full flex-col gap-1.5">
            {label && (
                <label className="text-xs font-medium text-gray-600">
                    {label}
                    {required && (
                        <span className="ml-1 text-red-500">*</span>
                    )}
                </label>
            )}

            <div className="relative">
                <Clock
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                    type="time"
                    value={value || ""}
                    onChange={(e) => onChange?.(e.target.value)}
                    disabled={disabled}
                    required={required}
                    className={`
                        h-10 w-full rounded-lg border border-gray-200
                        bg-white pl-9 pr-3 text-sm text-gray-700
                        outline-none transition
                        focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                        disabled:cursor-not-allowed disabled:bg-gray-100
                        ${className}
                    `}
                />
            </div>
        </div>
    );
}
