
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
    fetchAllTaxMasters,
} from "../../../thunks/taxMasterThunks";

import {
    setSearch,
    setTaxMasterStatus,
    resetTaxMasterView,
} from "../../../slices/taxMasterViewSlice";

import CustomSelect from "../../../../../common/custom/CustomSelect";
import ToolTipText from "../../../../../common/toolTip/ToolTipText";

/* =========================================================
   CONSTANTS
========================================================= */

const INITIAL_FILTERS = {
    search: "",
    status: "",
};

const VALID_STATUSES = [
    "ALL",
    "ACTIVE",
    "INACTIVE",
    "DRAFT",
];

/* =========================================================
   HELPERS
========================================================= */

const normalizeStatus = (value) => {

    const status = String(value ?? "")
        .trim()
        .toUpperCase();

    return VALID_STATUSES.includes(status)
        ? status
        : "ALL";
};

const getSelectedValue = (value) => {

    if (value && typeof value === "object") {
        return value.value ?? "";
    }

    return value ?? "";
};

/* =========================================================
   COMPONENT
========================================================= */

export default function NavbarTaxMaster() {

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

    const loading = useSelector(
        (state) => state.taxMaster?.loading === true
    );

    const search = useSelector(
        (state) => state.taxMasterView?.search ?? ""
    );

    const taxMasterStatus = useSelector(
        (state) => state.taxMasterView?.taxMasterStatus ?? "ALL"
    );

    /* =====================================================
       URL STATUS
    ===================================================== */

    const urlStatusParam = searchParams.get("status");

    const normalizedUrlStatus =
        urlStatusParam !== null
            ? normalizeStatus(urlStatusParam)
            : null;

    /* =====================================================
       URL -> REDUX SYNCHRONIZATION

       Only synchronize if URL has status.
       Missing status must not overwrite Redux.
    ===================================================== */

    useEffect(() => {

        if (normalizedUrlStatus === null) {
            return;
        }

        dispatch(
            setTaxMasterStatus(normalizedUrlStatus)
        );

    }, [
        dispatch,
        normalizedUrlStatus,
    ]);

    /* =====================================================
       REDUX SEARCH -> LOCAL FILTER
    ===================================================== */

    useEffect(() => {

        setFilters((previous) => {

            if (previous.search === search) {
                return previous;
            }

            return {
                ...previous,
                search,
            };

        });

    }, [
        search,
    ]);

    /* =====================================================
       REDUX STATUS -> LOCAL FILTER
    ===================================================== */

    useEffect(() => {

        const nextStatus =
            taxMasterStatus === "ALL"
                ? ""
                : taxMasterStatus;

        setFilters((previous) => {

            if (previous.status === nextStatus) {
                return previous;
            }

            return {
                ...previous,
                status: nextStatus,
            };

        });

    }, [
        taxMasterStatus,
    ]);

    /* =====================================================
       FETCH TAX MASTERS
    ===================================================== */

    const loadTaxMasters = useCallback(() => {

        dispatch(fetchAllTaxMasters());

    }, [
        dispatch,
    ]);

    /* =====================================================
       INITIAL FETCH
    ===================================================== */

    useEffect(() => {

        loadTaxMasters();

    }, [
        loadTaxMasters,
    ]);

    /* =====================================================
       FILTER INPUT CHANGE
    ===================================================== */

    const handleFilterChange = useCallback(
        (nameOrEvent, selectedValue) => {

            let name;
            let value;

            if (typeof nameOrEvent === "string") {

                name = nameOrEvent;
                value = getSelectedValue(selectedValue);

            } else {

                name = nameOrEvent?.target?.name;
                value = nameOrEvent?.target?.value;

            }

            if (!name) {
                return;
            }

            setFilters((previous) => ({
                ...previous,
                [name]: value ?? "",
            }));

        },
        []
    );

    /* =====================================================
       APPLY FILTERS
    ===================================================== */

    const handleApplyFilters = useCallback(() => {

        const nextSearch = String(filters.search ?? "")
            .trim();

        const nextStatus = normalizeStatus(
            filters.status || "ALL"
        );

        // Update Redux search.
        dispatch(
            setSearch(nextSearch)
        );

        // Updates status and selected view label.
        dispatch(
            setTaxMasterStatus(nextStatus)
        );

        // Update URL.
        navigate(
            `/settings/taxes?status=${nextStatus}`
        );

        setFilterOpen(false);

    }, [
        filters,
        dispatch,
        navigate,
    ]);

    /* =====================================================
       RESET FILTERS
    ===================================================== */

    const handleResetFilters = useCallback(() => {

        setFilters({
            ...INITIAL_FILTERS,
        });

        dispatch(
            resetTaxMasterView()
        );

        navigate(
            "/settings/taxes?status=ALL"
        );

        setFilterOpen(false);

    }, [
        dispatch,
        navigate,
    ]);

    /* =====================================================
       REFRESH
    ===================================================== */

    const handleRefresh = useCallback(() => {

        loadTaxMasters();

    }, [
        loadTaxMasters,
    ]);

    /* =====================================================
       CREATE TAX MASTER
    ===================================================== */

    const handleCreateTaxMaster = useCallback(() => {

        navigate(
            "/settings/taxes/create"
        );

    }, [
        navigate,
    ]);

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
       FILTER OPTIONS
    ===================================================== */

    const taxMasterStatusOptions = [
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

            {/* NAVBAR */}

            <div
                className="
                    flex min-h-[60px] items-center
                    justify-between gap-2 rounded-md
                    border border-gray-100 bg-white
                    px-2 py-2
                "
            >

                {/* LEFT */}

                <div className="relative flex items-center gap-2">

                    <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="
                            group relative flex items-center justify-center
                            rounded-md border border-blue-300
                            bg-white p-2 text-[#0095FD]
                            transition hover:bg-[#0095FD]/20
                        "
                    >
                        <Home size={18} />

                        <ToolTipText
                            text="Home"
                            position="bottom"
                        />
                    </button>

                    <div>

                        <h2 className="
                            text-xl font-semibold text-gray-800
                        ">
                            Tax Master Overview
                        </h2>

                        <p className="
                            mt-1 text-xs text-gray-500
                        ">
                            Monitor and manage your tax configurations.
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
                            flex items-center gap-2 rounded-md
                            border border-gray-200 bg-white
                            px-3 py-2 text-sm text-gray-600
                            transition hover:bg-gray-50
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        "
                    >
                        <RotateCcw
                            size={15}
                            className={loading ? "animate-spin" : ""}
                        />

                        Refresh
                    </button>

                    {/* FILTER */}

                    <button
                        type="button"
                        onClick={() =>
                            setFilterOpen((previous) => !previous)
                        }
                        aria-expanded={filterOpen}
                        className={`
                            flex items-center gap-2 rounded-md
                            border px-3 py-2 text-sm font-medium
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

                    {/* NEW */}

                    <button
                        type="button"
                        onClick={handleCreateTaxMaster}
                        className="
                            group relative flex items-center gap-1
                            rounded-md bg-[#0095FD] px-3 py-2
                            text-sm font-medium text-white
                            hover:bg-[#0095FD]/90
                        "
                    >
                        <Plus size={14} />

                        <span>New</span>

                        <ToolTipText
                            text="New Tax Master"
                            position="bottom"
                        />
                    </button>

                    {/* SETTINGS */}

                    <button
                        type="button"
                        onClick={() => navigate("/settings")}
                        className="
                            group relative rounded-md border
                            border-gray-300 p-2 text-[#0095FD]
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

            {/* FILTER PANEL */}

            {filterOpen && (

                <div
                    className="
                        absolute left-0 right-0 top-full
                        z-40 mt-2 rounded-lg border
                        border-gray-200 bg-white p-4 shadow-xl
                    "
                >

                    {/* FILTER HEADER */}

                    <div className="
                        mb-4 flex items-center justify-between
                    ">

                        <div className="flex items-center gap-2">

                            <Filter
                                size={17}
                                className="text-[#0095FD]"
                            />

                            <h3 className="
                                text-sm font-semibold text-gray-800
                            ">
                                Filter Tax Masters
                            </h3>

                        </div>

                        <button
                            type="button"
                            onClick={() => setFilterOpen(false)}
                            className="
                                rounded-md p-1 text-gray-400
                                hover:bg-gray-100 hover:text-gray-700
                            "
                            title="Close filters"
                        >
                            <X size={17} />
                        </button>

                    </div>

                    {/* FILTER INPUTS */}

                    <div className="
                        grid grid-cols-1 gap-4
                        sm:grid-cols-2 lg:grid-cols-3
                    ">

                        {/* SEARCH */}

                        <div>

                            <label className={labelClass}>
                                Search
                            </label>

                            <input
                                type="text"
                                name="search"
                                value={filters.search}
                                onChange={handleFilterChange}
                                placeholder="Tax name or description..."
                                className={inputClass}
                            />

                        </div>

                        {/* STATUS */}

                        <div>

                            <label className={labelClass}>
                                Tax Master Status
                            </label>

                            <CustomSelect
                                name="status"
                                value={filters.status}
                                onChange={(value) =>
                                    handleFilterChange(
                                        "status",
                                        value
                                    )
                                }
                                options={taxMasterStatusOptions}
                            />

                        </div>

                    </div>

                    {/* ACTION BUTTONS */}

                    <div className="
                        mt-5 flex flex-wrap items-center
                        justify-between gap-3 border-t
                        border-gray-100 pt-4
                    ">

                        {/* RESET */}

                        <button
                            type="button"
                            onClick={handleResetFilters}
                            className="
                                flex items-center gap-2 rounded-md
                                border border-gray-200 px-3 py-2
                                text-sm text-gray-600 transition
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
                                    rounded-md border border-gray-200
                                    px-4 py-2 text-sm text-gray-600
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
                                    flex items-center gap-2 rounded-md
                                    bg-[#0095FD] px-4 py-2
                                    text-sm font-medium text-white
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
