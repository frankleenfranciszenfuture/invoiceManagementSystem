
import React from "react";

import {
    Search,
    RotateCcw,
    Filter,
} from "lucide-react";

import CustomSelect from "../../../common/custom/CustomSelect";
import CustomDatePicker from "../../../common/custom/CustomDatePicker";
import CustomTimePicker from "../../../common/custom/CustomTimePicker";

const inputClass = `
    h-10 w-full rounded-lg border border-gray-300
    bg-white px-3 text-xs text-gray-700 outline-none
    transition focus:border-blue-500 focus:ring-2
    focus:ring-blue-100
`;

export default function AuditLogFilters({
    filters = {},
    onChange = () => { },
    onSearch = () => { },
    onReset = () => { },
}) {
    const updateFilter = (name, value) => {
        onChange({
            [name]: value,
        });
    };

    // Combine separate date and time into LocalDateTime format.
    const updateDateTime = (field, type, value) => {
        const currentValue = filters[field] || "";
        const [currentDate = "", currentTime = "00:00"] =
            currentValue.split("T");

        const date = type === "date" ? value : currentDate;
        const time = type === "time" ? value : currentTime;

        updateFilter(
            field,
            date ? `${date}T${time || "00:00"}` : ""
        );
    };

    const getDate = (field) =>
        filters[field]?.split("T")[0] || "";

    const getTime = (field) =>
        filters[field]?.split("T")[1] || "";

    return (
        <div className="
            mb-4 rounded-xl border border-gray-200
            bg-white p-4
        ">

            <div className="
                mb-4 flex flex-wrap items-center
                justify-between gap-2
            ">
                <div className="flex items-center gap-2">
                    <Filter
                        size={17}
                        className="text-gray-500"
                    />

                    <h3 className="text-sm font-semibold text-gray-800">
                        Filter Audit Logs
                    </h3>
                </div>

                <button
                    type="button"
                    onClick={onReset}
                    className="
                        flex items-center gap-1.5
                        text-xs font-medium text-gray-500
                        transition hover:text-red-600
                    "
                >
                    <RotateCcw size={13} />
                    Reset Filters
                </button>
            </div>

            <div className="
                grid grid-cols-1 gap-3
                sm:grid-cols-2 lg:grid-cols-3
                xl:grid-cols-4
            ">

                {/* KEYWORD */}

                <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-600">
                        Search
                    </label>

                    <input
                        type="text"
                        value={filters.keyword || ""}
                        onChange={(e) =>
                            updateFilter("keyword", e.target.value)
                        }
                        onKeyDown={(e) => {
                            if (e.key === "Enter") onSearch();
                        }}
                        placeholder="Description, performer..."
                        className={inputClass}
                    />
                </div>

                {/* ENTITY NAME */}

                <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-600">
                        Module / Entity
                    </label>

                    <CustomSelect
                        value={filters.entityName || ""}
                        onChange={(selected) =>
                            updateFilter("entityName", selected)
                        }
                        options={[
                            { value: "", label: "All Modules" },
                            { value: "USER", label: "User" },
                            { value: "ROLE", label: "Role" },
                        ]}
                        placeholder="Select Module"
                    />
                </div>

                {/* ENTITY ID */}

                <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-600">
                        Entity ID
                    </label>

                    <input
                        type="text"
                        value={filters.entityId || ""}
                        onChange={(e) =>
                            updateFilter("entityId", e.target.value)
                        }
                        placeholder="Enter entity ID"
                        className={inputClass}
                    />
                </div>

                {/* ACTION */}

                <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-600">
                        Action
                    </label>

                    <CustomSelect
                        value={filters.action || ""}
                        onChange={(selected) =>
                            updateFilter("action", selected)
                        }
                        options={[
                            { value: "", label: "All Actions" },
                            { value: "CREATE", label: "Create" },
                            { value: "UPDATE", label: "Update" },
                            { value: "STATUS_CHANGE", label: "Status Change" },
                            { value: "DELETE", label: "Delete" },
                        ]}
                        placeholder="Select Action"
                    />
                </div>

                {/* PERFORMED BY */}

                <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-600">
                        Performed By ID
                    </label>

                    <input
                        type="number"
                        min="1"
                        value={filters.performedBy || ""}
                        onChange={(e) =>
                            updateFilter("performedBy", e.target.value)
                        }
                        placeholder="User ID"
                        className={inputClass}
                    />
                </div>

                {/* PERFORMER TYPE */}

                <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-600">
                        Performer Type
                    </label>

                    <CustomSelect
                        value={filters.performedByType || ""}
                        onChange={(selected) =>
                            updateFilter("performedByType", selected)
                        }
                        options={[
                            { value: "", label: "All Types" },
                            { value: "ADMIN", label: "Admin" },
                            { value: "EMPLOYEE", label: "Employee" },
                        ]}
                        placeholder="Select Performer Type"
                    />
                </div>



                {/* SORT BY */}

                <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-600">
                        Sort By
                    </label>

                    <CustomSelect
                        value={filters.sortBy || "createdAt"}
                        onChange={(selected) =>
                            updateFilter("sortBy", selected)
                        }
                        options={[
                            { value: "createdAt", label: "Created Date" },
                            { value: "id", label: "Audit ID" },
                            { value: "entityId", label: "Entity ID" },
                            { value: "action", label: "Action" },
                        ]}
                        placeholder="Select Sort By"
                    />
                </div>

                {/* SORT DIRECTION */}

                <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-600">
                        Sort Direction
                    </label>

                    <CustomSelect
                        value={filters.sortDirection || "DESC"}
                        onChange={(selected) =>
                            updateFilter("sortDirection", selected)
                        }
                        options={[
                            { value: "DESC", label: "Newest First" },
                            { value: "ASC", label: "Oldest First" },
                        ]}
                        placeholder="Select Sort Direction"
                    />
                </div>

            </div>
            <div className="mt-3 border-b border-gray-300" />

            <div className="mt-2
                grid grid-cols-1 gap-3
                sm:grid-cols-2 lg:grid-cols-3
                xl:grid-cols-2
            ">
                {/* FROM DATE */}

                <div className="flex flex-col gap-1.5 ">
                    <CustomDatePicker
                        label="From Date"
                        value={getDate("fromDate")}
                        onChange={(value) =>
                            updateDateTime("fromDate", "date", value)
                        }
                    />

                    <CustomTimePicker
                        label="From Time"
                        value={getTime("fromDate")}
                        onChange={(value) =>
                            updateDateTime("fromDate", "time", value)
                        }
                    />
                </div>

                {/* TO DATE */}

                <div className="flex flex-col gap-1.5">
                    <CustomDatePicker
                        label="To Date"
                        value={getDate("toDate")}
                        onChange={(value) =>
                            updateDateTime("toDate", "date", value)
                        }
                    />

                    <CustomTimePicker
                        label="To Time"
                        value={getTime("toDate")}
                        onChange={(value) =>
                            updateDateTime("toDate", "time", value)
                        }
                    />
                </div>
            </div>


            {/* SEARCH BUTTON */}

            <div className="mt-4 flex justify-end">
                <button
                    type="button"
                    onClick={onSearch}
                    className="
                        flex items-center gap-2 rounded-lg
                        bg-blue-500 px-5 py-2.5
                        text-xs font-semibold text-white
                        transition hover:bg-blue-600
                    "
                >
                    <Search size={15} />
                    Apply Filters
                </button>
            </div>

        </div>
    );
}
