
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
    setSalesPersonStatus,
    setSelectedSalesPersonView,
} from "../../../slices/salesPersonViewSlice";

import {
    fetchAllSalesPersons,
} from "../../../thunks/salesPersonThunks";

import CustomSelect from "../../../../../common/custom/CustomSelect";
import ToolTipText from "../../../../../common/toolTip/ToolTipText";

/* =========================================================
   CONSTANTS
========================================================= */

const INITIAL_FILTERS = {
    salesPersonName: "",
    salesPersonCode: "",
    salesPersonType: "",
    email: "",
    mobile: "",
    status: "",
};

const VALID_STATUSES = [
    "ALL",
    "ACTIVE",
    "INACTIVE",
    "DRAFT",
];

const STATUS_LABELS = {
    ALL: "All Sales Persons",
    ACTIVE: "Active Sales Persons",
    INACTIVE: "Inactive Sales Persons",
    DRAFT: "Draft Sales Persons",
};

/* =========================================================
   COMPONENT
========================================================= */

export default function NavbarSalesPerson() {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [searchParams] = useSearchParams();

    /* =====================================================
       LOCAL STATE
    ===================================================== */

    const [filterOpen, setFilterOpen] = useState(false);

    const [filters, setFilters] = useState(INITIAL_FILTERS);

    const [appliedFilters, setAppliedFilters] = useState(
        INITIAL_FILTERS
    );

    /* =====================================================
       REDUX STATE
    ===================================================== */

    const selectedSalesPersonView = useSelector(
        (state) =>
            state.salesPersonView?.selectedSalesPersonView
    );

    const salesPersonStatus = useSelector(
        (state) =>
            state.salesPersonView?.salesPersonStatus || "ALL"
    );

    const loading = useSelector(
        (state) =>
            state.salesPerson?.loading === true
    );

    /* =====================================================
       URL STATUS
    ===================================================== */

    const urlStatus = searchParams.get("salesPersonStatus");

    const normalizedUrlStatus = String(
        urlStatus || ""
    )
        .trim()
        .toUpperCase();

    const effectiveSalesPersonStatus =
        VALID_STATUSES.includes(normalizedUrlStatus)
            ? normalizedUrlStatus
            : salesPersonStatus;

    /* =====================================================
       URL STATUS SYNCHRONIZATION
    ===================================================== */

    useEffect(() => {

        const selectedStatus = VALID_STATUSES.includes(
            normalizedUrlStatus
        )
            ? normalizedUrlStatus
            : salesPersonStatus;

        const selectedLabel =
            STATUS_LABELS[selectedStatus] ||
            "All Sales Persons";

        if (salesPersonStatus !== selectedStatus) {
            dispatch(
                setSalesPersonStatus(selectedStatus)
            );
        }

        if (selectedSalesPersonView !== selectedLabel) {
            dispatch(
                setSelectedSalesPersonView(selectedLabel)
            );
        }

    }, [
        normalizedUrlStatus,
        salesPersonStatus,
        selectedSalesPersonView,
        dispatch,
    ]);

    /* =====================================================
       FETCH SALES PERSONS
    ===================================================== */

    const loadSalesPersons = useCallback(
        (filterValues, selectedViewStatus) => {

            dispatch(
                fetchAllSalesPersons({
                    ...filterValues,

                    status:
                        filterValues.status ||
                        (
                            selectedViewStatus === "ALL"
                                ? undefined
                                : selectedViewStatus
                        ),

                    page: 0,
                    size: 10,
                })
            );

        },
        [dispatch]
    );

    /* =====================================================
       FETCH WHEN FILTERS OR STATUS CHANGE
    ===================================================== */

    useEffect(() => {

        loadSalesPersons(
            appliedFilters,
            effectiveSalesPersonStatus
        );

    }, [
        loadSalesPersons,
        appliedFilters,
        effectiveSalesPersonStatus,
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

        loadSalesPersons(
            appliedFilters,
            effectiveSalesPersonStatus
        );

    };

    /* =====================================================
       STATUS VIEW CHANGE
    ===================================================== */

    const handleViewChange = (view) => {

        if (!view) return;

        dispatch(
            setSelectedSalesPersonView(view.label)
        );

        dispatch(
            setSalesPersonStatus(view.value)
        );

        navigate(
            `/salesPersons?salesPersonStatus=${view.value}`
        );

    };

    /* =====================================================
       CREATE SALES PERSON
    ===================================================== */

    const handleCreateSalesPerson = () => {

        navigate("/salesPersons/create");

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
       FILTER OPTIONS
    ===================================================== */

    const salesPersonTypeOptions = [
        { label: "All Types", value: "" },
        { label: "Employee", value: "EMPLOYEE" },
        { label: "Agent", value: "AGENT" },
    ];

    const salesPersonStatusOptions = [
        { label: "All Statuses", value: "" },
        { label: "Active", value: "ACTIVE" },
        { label: "Inactive", value: "INACTIVE" },
        { label: "Draft", value: "DRAFT" },
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
                    flex min-h-[60px] items-center
                    justify-between gap-2 rounded-md
                    border border-gray-100 bg-white
                    px-2 py-2
                "
            >

                {/* LEFT */}

                <div className="relative flex items-center gap-2">

                    {/* HOME */}

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
                        <ToolTipText text="Home" position="bottom" />
                    </button>

                    {/* TITLE */}

                    <div>
                        <h2 className="
                            text-xl font-semibold text-gray-800
                        ">
                            Sales Person Overview
                        </h2>

                        <p className="
                            mt-1 text-xs text-gray-500
                        ">
                            Monitor and manage your sales team.
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
                            disabled:opacity-50
                        "
                    >
                        <RotateCcw
                            size={15}
                            className={loading ? "animate-spin" : ""}
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

                    {/* NEW SALES PERSON */}

                    <button
                        type="button"
                        onClick={handleCreateSalesPerson}
                        className="
                            group relative flex items-center gap-1 rounded-md
                            bg-[#0095FD] px-3 py-2
                            text-sm font-medium text-white
                            hover:bg-[#0095FD]/90
                        "

                    >
                        <Plus size={14} />

                        <span>New</span>
                        <ToolTipText text="Create New SalesPerson" position="bottom" />
                    </button>

                    {/* SETTINGS */}

                    <button
                        type="button"
                        onClick={() => navigate("/settings")}
                        className="
                            group relative rounded-md border border-gray-300
                            p-2 text-[#0095FD]
                            hover:bg-[#0095FD]/20
                        "

                    >
                        <Settings size={18} />
                        <ToolTipText text="Settings" position="bottom" />
                    </button>

                </div>
            </div>

            {/* ==================================================
                FILTER PANEL
            ================================================== */}

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
                                Filter Sales Persons
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

                        {/* SALES PERSON NAME */}

                        <div>
                            <label className={labelClass}>
                                Sales Person Name
                            </label>

                            <input
                                type="text"
                                name="salesPersonName"
                                value={filters.salesPersonName}
                                onChange={handleFilterChange}
                                placeholder="Enter sales person name"
                                className={inputClass}
                            />
                        </div>

                        {/* SALES PERSON CODE */}

                        <div>
                            <label className={labelClass}>
                                Sales Person Code
                            </label>

                            <input
                                type="text"
                                name="salesPersonCode"
                                value={filters.salesPersonCode}
                                onChange={handleFilterChange}
                                placeholder="Enter sales person code"
                                className={inputClass}
                            />
                        </div>

                        {/* SALES PERSON TYPE */}

                        <div>
                            <label className={labelClass}>
                                Sales Person Type
                            </label>

                            <CustomSelect
                                name="salesPersonType"
                                value={filters.salesPersonType}
                                onChange={(value) => {
                                    handleFilterChange(
                                        "salesPersonType",
                                        typeof value === "object"
                                            ? value.value
                                            : value
                                    );
                                }}
                                options={salesPersonTypeOptions}
                            />
                        </div>

                        {/* EMAIL */}

                        <div>
                            <label className={labelClass}>
                                Email
                            </label>

                            <input
                                type="text"
                                name="email"
                                value={filters.email}
                                onChange={handleFilterChange}
                                placeholder="Enter email"
                                className={inputClass}
                            />
                        </div>

                        {/* MOBILE */}

                        <div>
                            <label className={labelClass}>
                                Mobile Number
                            </label>

                            <input
                                type="text"
                                name="mobile"
                                value={filters.mobile}
                                onChange={handleFilterChange}
                                placeholder="Enter mobile number"
                                className={inputClass}
                            />
                        </div>

                        {/* SALES PERSON STATUS */}

                        <div>
                            <label className={labelClass}>
                                Sales Person Status
                            </label>

                            <CustomSelect
                                name="status"
                                value={filters.status}
                                onChange={(value) => {
                                    handleFilterChange(
                                        "status",
                                        typeof value === "object"
                                            ? value.value
                                            : value
                                    );
                                }}
                                options={salesPersonStatusOptions}
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
