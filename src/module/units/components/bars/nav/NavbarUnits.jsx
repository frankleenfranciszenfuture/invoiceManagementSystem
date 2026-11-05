
import React, {
    useState,
    useEffect,
    useCallback,
} from "react";

import {
    useDispatch,
    useSelector,
} from "react-redux";

import {
    useNavigate,
    useSearchParams,
} from "react-router-dom";

import {
    Plus,
    ChevronDown,
    Home,
    Settings,
    Filter,
    Search,
    RotateCcw,
    X,
} from "lucide-react";

import {
    setUnitStatus,
    setSelectedUnitView,
} from "../../../slices/unitViewSlice";

import {
    fetchAllUnits,
} from "../../../thunks/unitThunks";

import CustomSelect from "../../../../../common/custom/CustomSelect";
import ToolTipText from "../../../../../common/toolTip/ToolTipText";

/* =========================================================
   CONSTANTS
========================================================= */

const INITIAL_FILTERS = {
    unitName: "",
    unitShortName: "",
    status: "",
};

const VALID_STATUSES = [
    "ALL",
    "ACTIVE",
    "INACTIVE",
    "DRAFT",
];

const STATUS_LABELS = {
    ALL: "All Units",
    ACTIVE: "Active Units",
    INACTIVE: "Inactive Units",
    DRAFT: "Draft Units",
};

/* =========================================================
   COMPONENT
========================================================= */

export default function NavbarUnit() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [searchParams] = useSearchParams();

    /* =====================================================
       LOCAL STATE
    ===================================================== */

    const [filterOpen, setFilterOpen] = useState(false);

    const [filters, setFilters] = useState({
        ...INITIAL_FILTERS,
    });

    const [appliedFilters, setAppliedFilters] = useState({
        ...INITIAL_FILTERS,
    });

    /* =====================================================
       REDUX STATE
    ===================================================== */

    const selectedUnitView = useSelector(
        (state) =>
            state.unitView?.selectedUnitView || "All Units"
    );

    const unitStatus = useSelector(
        (state) =>
            state.unitView?.unitStatus || "ALL"
    );

    const loading = useSelector(
        (state) =>
            state.unit?.loading === true
    );

    /* =====================================================
       URL STATUS
    ===================================================== */

    const urlStatus = searchParams.get("unitStatus");

    const normalizedUrlStatus = String(
        urlStatus || ""
    )
        .trim()
        .toUpperCase();

    const effectiveUnitStatus =
        VALID_STATUSES.includes(normalizedUrlStatus)
            ? normalizedUrlStatus
            : unitStatus;

    /* =====================================================
       URL STATUS SYNCHRONIZATION
    ===================================================== */

    useEffect(() => {
        const selectedStatus = VALID_STATUSES.includes(
            normalizedUrlStatus
        )
            ? normalizedUrlStatus
            : "ALL";

        const selectedLabel =
            STATUS_LABELS[selectedStatus] || "All Units";

        if (unitStatus !== selectedStatus) {
            dispatch(setUnitStatus(selectedStatus));
        }

        if (selectedUnitView !== selectedLabel) {
            dispatch(setSelectedUnitView(selectedLabel));
        }
    }, [
        normalizedUrlStatus,
        unitStatus,
        selectedUnitView,
        dispatch,
    ]);

    /* =====================================================
       FETCH UNITS
    ===================================================== */

    const loadUnits = useCallback(
        (filterValues, selectedStatus) => {
            const unitName = filterValues.unitName?.trim() || "";
            const unitShortName =
                filterValues.unitShortName?.trim() || "";

            const filterStatus = filterValues.status || "";

            /*
             * UnitController supports:
             *
             * search
             * status
             * page
             * size
             *
             * Unit name and short name are combined
             * into the backend search parameter.
             */

            const searchValue = [
                unitName,
                unitShortName,
            ]
                .filter(Boolean)
                .join(" ")
                .trim();

            const queryParams = {
                page: 0,
                size: 10,
            };

            if (searchValue) {
                queryParams.search = searchValue;
            }

            const finalStatus =
                filterStatus || selectedStatus;

            if (finalStatus && finalStatus !== "ALL") {
                queryParams.status = finalStatus;
            }

            dispatch(fetchAllUnits(queryParams));
        },
        [dispatch]
    );

    /* =====================================================
       FETCH WHEN FILTERS OR STATUS CHANGE
    ===================================================== */

    useEffect(() => {
        loadUnits(
            appliedFilters,
            effectiveUnitStatus
        );
    }, [
        loadUnits,
        appliedFilters,
        effectiveUnitStatus,
    ]);

    /* =====================================================
       FILTER INPUT CHANGE
    ===================================================== */

    const handleFilterChange = useCallback(
        (eOrName, selectedValue) => {
            const name =
                typeof eOrName === "string"
                    ? eOrName
                    : eOrName.target.name;

            const value =
                typeof eOrName === "string"
                    ? selectedValue
                    : eOrName.target.value;

            setFilters((previous) => ({
                ...previous,
                [name]: value,
            }));
        },
        []
    );

    /* =====================================================
       APPLY FILTERS
    ===================================================== */

    const handleApplyFilters = () => {
        setAppliedFilters({
            ...filters,
        });

        setFilterOpen(false);
    };

    /* =====================================================
       RESET FILTERS
    ===================================================== */

    const handleResetFilters = () => {
        setFilters({
            ...INITIAL_FILTERS,
        });

        setAppliedFilters({
            ...INITIAL_FILTERS,
        });
    };

    /* =====================================================
       REFRESH
    ===================================================== */

    const handleRefresh = () => {
        loadUnits(
            appliedFilters,
            effectiveUnitStatus
        );
    };

    /* =====================================================
       STATUS VIEW CHANGE
    ===================================================== */

    const handleViewChange = (view) => {
        if (!view) return;

        dispatch(
            setSelectedUnitView(view.label)
        );

        dispatch(
            setUnitStatus(view.value)
        );

        navigate(
            `/settings/units?unitStatus=${view.value}`
        );
    };

    /* =====================================================
       CREATE UNIT
    ===================================================== */

    const handleCreateUnit = () => {
        navigate("/settings/units/create");
    };

    /* =====================================================
       INPUT STYLES
    ===================================================== */

    const inputClass = `
        w-full
        rounded-md
        border
        border-gray-200
        bg-white
        px-3
        py-2
        text-sm
        text-gray-700
        outline-none
        transition
        focus:border-[#0095FD]
        focus:ring-2
        focus:ring-[#0095FD]/10
    `;

    const labelClass = `
        mb-1.5
        block
        text-xs
        font-medium
        text-gray-600
    `;

    /* =====================================================
       STATUS OPTIONS
    ===================================================== */

    const statusOptions = [
        {
            label: "All Statuses",
            value: "",
        },
        {
            label: "Active",
            value: "ACTIVE",
        },
        {
            label: "Inactive",
            value: "INACTIVE",
        },
        {
            label: "Draft",
            value: "DRAFT",
        },
    ];

    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <div className="relative">

            {/* ==================================================
                NAVBAR
            ================================================== */}

            <div
                className="
                    flex
                    min-h-[60px]
                    items-center
                    justify-between
                    gap-2
                    rounded-md
                    border
                    border-gray-100
                    bg-white
                    px-2
                    py-2
                "
            >

                {/* LEFT */}

                <div className="relative flex items-center gap-2">

                    {/* HOME */}

                    <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="
                            group
                            relative
                            flex
                            items-center
                            justify-center
                            rounded-md
                            border
                            border-blue-300
                            bg-white
                            p-2
                            text-[#0095FD]
                            transition
                            hover:bg-[#0095FD]/20
                        "
                        title="Home"
                    >
                        <Home size={18} />

                        <ToolTipText
                            text="Home"
                            position="bottom"
                        />
                    </button>

                    {/* TITLE */}

                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">
                            Unit Overview
                        </h2>

                        <p className="mt-1 text-xs text-gray-500">
                            Manage and organize your product units.
                        </p>
                    </div>

                </div>

                {/* RIGHT */}

                <div className="flex items-center gap-2">

                    {/* REFRESH */}

                    <button
                        type="button"
                        onClick={handleRefresh}
                        disabled={loading}
                        className="
                            flex
                            items-center
                            gap-2
                            rounded-md
                            border
                            border-gray-200
                            bg-white
                            px-3
                            py-2
                            text-sm
                            text-gray-600
                            transition
                            hover:bg-gray-50
                            disabled:opacity-50
                        "
                    >
                        <RotateCcw
                            size={15}
                            className={
                                loading ? "animate-spin" : ""
                            }
                        />

                        Refresh
                    </button>

                    {/* FILTER BUTTON */}

                    <button
                        type="button"
                        onClick={() =>
                            setFilterOpen((previous) => !previous)
                        }
                        className={`
                            flex
                            items-center
                            gap-2
                            rounded-md
                            border
                            px-3
                            py-2
                            text-sm
                            font-medium
                            transition
                            ${filterOpen
                                ? "border-[#0095FD] bg-[#0095FD] text-white"
                                : "border-gray-200 bg-white text-gray-600 hover:bg-blue-50 hover:text-[#0095FD]"
                            }
                        `}
                    >
                        <Filter size={16} />

                        <span>Filters</span>

                        <ChevronDown
                            size={14}
                            className={`
                                transition
                                ${filterOpen ? "rotate-180" : ""}
                            `}
                        />
                    </button>

                    {/* NEW UNIT */}

                    <button
                        type="button"
                        onClick={handleCreateUnit}
                        className="
                            group
                            relative
                            flex
                            items-center
                            gap-1
                            rounded-md
                            bg-[#0095FD]
                            px-3
                            py-2
                            text-sm
                            font-medium
                            text-white
                            hover:bg-[#0095FD]/90
                        "
                    >
                        <Plus size={14} />

                        <span>New</span>

                        <ToolTipText
                            text="New Unit"
                            position="bottom"
                        />
                    </button>

                    {/* SETTINGS */}

                    <button
                        type="button"
                        onClick={() => navigate("/settings")}
                        className="
                            group
                            relative
                            rounded-md
                            border
                            border-gray-300
                            p-2
                            text-[#0095FD]
                            hover:bg-[#0095FD]/20
                        "
                    >
                        <Settings size={18} />

                        <ToolTipText
                            text="Settings"
                            position="bottom"
                        />
                    </button>

                </div>
            </div>

            {/* ==================================================
                FILTER PANEL
            ================================================== */}

            {filterOpen && (
                <div
                    className="
                        absolute
                        left-0
                        right-0
                        top-full
                        z-40
                        mt-2
                        rounded-lg
                        border
                        border-gray-200
                        bg-white
                        p-4
                        shadow-xl
                    "
                >

                    {/* FILTER HEADER */}

                    <div className="mb-4 flex items-center justify-between">

                        <div className="flex items-center gap-2">
                            <Filter
                                size={17}
                                className="text-[#0095FD]"
                            />

                            <h3 className="text-sm font-semibold text-gray-800">
                                Filter Units
                            </h3>
                        </div>

                        <button
                            type="button"
                            onClick={() => setFilterOpen(false)}
                            className="
                                rounded-md
                                p-1
                                text-gray-400
                                hover:bg-gray-100
                                hover:text-gray-700
                            "
                            title="Close filters"
                        >
                            <X size={17} />
                        </button>

                    </div>

                    {/* FILTER INPUTS */}

                    <div
                        className="
                            grid
                            grid-cols-1
                            gap-4
                            sm:grid-cols-2
                            lg:grid-cols-3
                        "
                    >

                        {/* UNIT NAME */}

                        <div>
                            <label className={labelClass}>
                                Unit Name
                            </label>

                            <input
                                type="text"
                                name="unitName"
                                value={filters.unitName}
                                onChange={handleFilterChange}
                                placeholder="Enter unit name"
                                className={inputClass}
                            />
                        </div>

                        {/* UNIT SHORT NAME */}

                        <div>
                            <label className={labelClass}>
                                Unit Short Name
                            </label>

                            <input
                                type="text"
                                name="unitShortName"
                                value={filters.unitShortName}
                                onChange={handleFilterChange}
                                placeholder="Enter short name"
                                className={inputClass}
                            />
                        </div>

                        {/* STATUS */}

                        <div>
                            <label className={labelClass}>
                                Unit Status
                            </label>

                            <CustomSelect
                                name="status"
                                value={filters.status || ""}
                                onChange={(value) => {
                                    handleFilterChange(
                                        "status",
                                        typeof value === "object"
                                            ? value.value
                                            : value
                                    );
                                }}
                                options={statusOptions}
                            />
                        </div>

                    </div>

                    {/* ACTION BUTTONS */}

                    <div
                        className="
                            mt-5
                            flex
                            flex-wrap
                            items-center
                            justify-between
                            gap-3
                            border-t
                            border-gray-100
                            pt-4
                        "
                    >

                        {/* RESET */}

                        <button
                            type="button"
                            onClick={handleResetFilters}
                            className="
                                flex
                                items-center
                                gap-2
                                rounded-md
                                border
                                border-gray-200
                                px-3
                                py-2
                                text-sm
                                text-gray-600
                                transition
                                hover:bg-gray-50
                            "
                        >
                            <RotateCcw size={14} />

                            Reset
                        </button>

                        <div className="flex items-center gap-2">

                            {/* CANCEL */}

                            <button
                                type="button"
                                onClick={() => setFilterOpen(false)}
                                className="
                                    rounded-md
                                    border
                                    border-gray-200
                                    px-4
                                    py-2
                                    text-sm
                                    text-gray-600
                                    hover:bg-gray-50
                                "
                            >
                                Cancel
                            </button>

                            {/* APPLY */}

                            <button
                                type="button"
                                onClick={handleApplyFilters}
                                className="
                                    flex
                                    items-center
                                    gap-2
                                    rounded-md
                                    bg-[#0095FD]
                                    px-4
                                    py-2
                                    text-sm
                                    font-medium
                                    text-white
                                    hover:bg-[#0095FD]/90
                                "
                            >
                                <Search size={14} />

                                Apply Filters
                            </button>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
