
import React from "react";
import { CalendarDays, Clock } from "lucide-react";

export default function CustomDateTimePicker({
    label,
    value = "",
    onChange,
    placeholder = "Select date",
    disabled = false,
    required = false,
    className = "",
    dateOnly = false,
    timeOnly = false,
}) {
    const [dateValue = "", timeValue = "00:00"] =
        String(value || "").split("T");

    const handleDateChange = (date) => {
        if (dateOnly) {
            onChange?.(date);
            return;
        }

        if (!date) {
            onChange?.("");
            return;
        }

        onChange?.(`${date}T${timeValue || "00:00"}`);
    };

    const handleTimeChange = (time) => {
        if (timeOnly) {
            onChange?.(time);
            return;
        }

        if (!dateValue) {
            return;
        }

        onChange?.(`${dateValue}T${time || "00:00"}`);
    };

    const inputClass = `
        h-10 w-full rounded-lg
        border border-gray-200 bg-white
        px-3 text-sm text-gray-700
        outline-none transition
        focus:border-blue-400
        focus:ring-2 focus:ring-blue-100
        disabled:cursor-not-allowed
        disabled:bg-gray-100
        ${className}
    `;

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

            <div className={`
                grid gap-2
                ${dateOnly || timeOnly
                    ? "grid-cols-1"
                    : "grid-cols-1 sm:grid-cols-2"
                }
            `}>

                {!timeOnly && (
                    <div className="relative">
                        <CalendarDays
                            size={15}
                            className="
                                pointer-events-none absolute
                                left-3 top-1/2 -translate-y-1/2
                                text-gray-400
                            "
                        />

                        <input
                            type="date"
                            value={dateValue}
                            onChange={(e) =>
                                handleDateChange(e.target.value)
                            }
                            disabled={disabled}
                            required={required}
                            placeholder={placeholder}
                            className={`${inputClass} pl-9`}
                        />
                    </div>
                )}

                {!dateOnly && (
                    <div className="relative">
                        <Clock
                            size={15}
                            className="
                                pointer-events-none absolute
                                left-3 top-1/2 -translate-y-1/2
                                text-gray-400
                            "
                        />

                        <input
                            type="time"
                            value={timeOnly ? value : timeValue}
                            onChange={(e) =>
                                handleTimeChange(e.target.value)
                            }
                            disabled={disabled}
                            className={`${inputClass} pl-9`}
                        />
                    </div>
                )}

            </div>
        </div>
    );
}
