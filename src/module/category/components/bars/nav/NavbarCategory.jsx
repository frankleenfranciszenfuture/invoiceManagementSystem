
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
    setCategoryStatus,
    setSelectedCategoryView,
} from "../../../slices/categoryViewSlice";

import {
    fetchAllCategories,
} from "../../../thunks/categoryThunks";

import CustomSelect from "../../../../../common/custom/CustomSelect";

import ToolTipText from "../../../../../common/toolTip/ToolTipText";

/* =========================================================
   CONSTANTS
========================================================= */

const INITIAL_FILTERS = {
    categoryCode: "",
    categoryName: "",
    description: "",
    status: "",
};

const VALID_STATUSES = [
    "ALL",
    "ACTIVE",
    "INACTIVE",
    "DRAFT",
];

const STATUS_LABELS = {
    ALL: "All Categories",
    ACTIVE: "Active Categories",
    INACTIVE: "Inactive Categories",
    DRAFT: "Draft Categories",
};

/* =========================================================
   COMPONENT
========================================================= */

export default function NavbarCategory() {
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

    /* =====================================================
       REDUX STATE
    ===================================================== */

    const selectedCategoryView = useSelector(
        (state) =>
            state.categoryView?.selectedCategoryView
    );

    const categoryStatus = useSelector(
        (state) =>
            state.categoryView?.status || "ALL"
    );

    const loading = useSelector(
        (state) =>
            state.category?.loading === true
    );

    /* =====================================================
       URL STATUS
    ===================================================== */

    const urlStatus = searchParams.get("categoryStatus");

    const normalizedUrlStatus = String(urlStatus || "ALL")
        .trim()
        .toUpperCase();

    const effectiveCategoryStatus = VALID_STATUSES.includes(
        normalizedUrlStatus
    )
        ? normalizedUrlStatus
        : "ALL";

    /* =====================================================
       URL STATUS SYNCHRONIZATION
    ===================================================== */

    useEffect(() => {
        const selectedLabel =
            STATUS_LABELS[effectiveCategoryStatus];

        if (categoryStatus !== effectiveCategoryStatus) {
            dispatch(
                setCategoryStatus(effectiveCategoryStatus)
            );
        }

        if (selectedCategoryView !== selectedLabel) {
            dispatch(
                setSelectedCategoryView(selectedLabel)
            );
        }
    }, [
        dispatch,
        effectiveCategoryStatus,
        categoryStatus,
        selectedCategoryView,
    ]);

    /* =====================================================
       FETCH CATEGORIES
    ===================================================== */

    const loadCategories = useCallback(
        (selectedStatus = "ALL") => {
            dispatch(
                fetchAllCategories({
                    status:
                        selectedStatus === "ALL"
                            ? undefined
                            : selectedStatus,
                    page: 0,
                    size: 20,
                })
            );
        },
        [dispatch]
    );

    /* =====================================================
       FETCH WHEN URL STATUS CHANGES
    ===================================================== */

    useEffect(() => {
        loadCategories(effectiveCategoryStatus);
    }, [
        loadCategories,
        effectiveCategoryStatus,
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
        const selectedStatus = filters.status || "ALL";

        setFilterOpen(false);

        const params = new URLSearchParams(searchParams);

        if (selectedStatus === "ALL") {
            params.delete("categoryStatus");
        } else {
            params.set("categoryStatus", selectedStatus);
        }

        navigate({
            pathname: "/settings/categories",
            search: params.toString()
                ? `?${params.toString()}`
                : "",
        });
    };

    /* =====================================================
       RESET FILTERS
    ===================================================== */

    const handleResetFilters = () => {
        setFilters({
            ...INITIAL_FILTERS,
        });

        setFilterOpen(false);

        const params = new URLSearchParams(searchParams);

        params.delete("categoryStatus");

        navigate({
            pathname: "/settings/categories",
            search: params.toString()
                ? `?${params.toString()}`
                : "",
        });
    };

    /* =====================================================
       REFRESH
    ===================================================== */

    const handleRefresh = () => {
        loadCategories(effectiveCategoryStatus);
    };

    /* =====================================================
       STATUS VIEW CHANGE
    ===================================================== */

    const handleViewChange = (view) => {
        if (
            !view ||
            !VALID_STATUSES.includes(view.value)
        ) {
            return;
        }

        const params = new URLSearchParams(searchParams);

        if (view.value === "ALL") {
            params.delete("categoryStatus");
        } else {
            params.set("categoryStatus", view.value);
        }

        navigate({
            pathname: "/settings/categories",
            search: params.toString()
                ? `?${params.toString()}`
                : "",
        });
    };

    /* =====================================================
       CREATE CATEGORY
    ===================================================== */

    const handleCreateCategory = () => {
        navigate("/settings/categories/create");
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
                            Category Overview
                        </h2>

                        <p className="mt-1 text-xs text-gray-500">
                            Organize and manage your product categories.
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

                    {/* NEW CATEGORY */}

                    <button
                        type="button"
                        onClick={handleCreateCategory}
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
                            text="New Category"
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
                                Filter Categories
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
                            grid grid-cols-1 gap-4
                            sm:grid-cols-2 lg:grid-cols-3
                        "
                    >

                        {/* CATEGORY CODE */}

                        <div>
                            <label className={labelClass}>
                                Category Code
                            </label>

                            <input
                                type="text"
                                name="categoryCode"
                                value={filters.categoryCode}
                                onChange={handleFilterChange}
                                placeholder="Enter category code"
                                className={inputClass}
                            />
                        </div>

                        {/* CATEGORY NAME */}

                        <div>
                            <label className={labelClass}>
                                Category Name
                            </label>

                            <input
                                type="text"
                                name="categoryName"
                                value={filters.categoryName}
                                onChange={handleFilterChange}
                                placeholder="Search category name"
                                className={inputClass}
                            />
                        </div>

                        {/* DESCRIPTION */}

                        <div>
                            <label className={labelClass}>
                                Description
                            </label>

                            <input
                                type="text"
                                name="description"
                                value={filters.description}
                                onChange={handleFilterChange}
                                placeholder="Search description"
                                className={inputClass}
                            />
                        </div>

                        {/* STATUS */}

                        <div>
                            <label className={labelClass}>
                                Category Status
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
                            flex flex-wrap
                            items-center justify-between
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
