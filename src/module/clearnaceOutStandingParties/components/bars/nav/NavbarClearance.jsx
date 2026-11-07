
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
    setClearanceStatus,
    setSelectedClearanceView,
} from "../../../slices/clearanceViewSlice";

import {
    fetchAllClearance,
} from "../../../thunks/clearanceThunks";

import CustomSelect from "../../../../../common/custom/CustomSelect";
import ToolTipText from "../../../../../common/toolTip/ToolTipText";

/* =========================================================
   CONSTANTS
========================================================= */

const INITIAL_FILTERS = {
    partyName: "",
    partyCode: "",
    paymentMethod: "",
    paymentReferenceNumber: "",
    clearanceDate: "",
    minAmount: "",
    maxAmount: "",
    status: "",
};

const VALID_STATUSES = [
    "ALL",
    "ACTIVE",
    "INACTIVE",
    "DRAFT",
];

const STATUS_LABELS = {
    ALL: "All Clearances",
    ACTIVE: "Active Clearances",
    INACTIVE: "Inactive Clearances",
    DRAFT: "Draft Clearances",
};

/* =========================================================
   COMPONENT
========================================================= */

export default function NavbarClearance() {

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

    const selectedClearanceView = useSelector(
        (state) =>
            state.clearanceView?.selectedClearanceView
    );

    const clearanceStatus = useSelector(
        (state) =>
            state.clearanceView?.clearanceStatus || "ALL"
    );

    const loading = useSelector(
        (state) =>
            state.clearance?.loading === true
    );

    /* =====================================================
       URL STATUS
    ===================================================== */

    const urlStatus = searchParams.get("clearanceStatus");

    const normalizedUrlStatus = String(
        urlStatus || ""
    )
        .trim()
        .toUpperCase();

    const effectiveClearanceStatus =
        VALID_STATUSES.includes(normalizedUrlStatus)
            ? normalizedUrlStatus
            : clearanceStatus;

    /* =====================================================
       URL STATUS SYNCHRONIZATION
    ===================================================== */

    useEffect(() => {

        const selectedStatus = VALID_STATUSES.includes(
            normalizedUrlStatus
        )
            ? normalizedUrlStatus
            : clearanceStatus;

        const selectedLabel =
            STATUS_LABELS[selectedStatus] ||
            "All Clearances";

        if (clearanceStatus !== selectedStatus) {
            dispatch(
                setClearanceStatus(selectedStatus)
            );
        }

        if (selectedClearanceView !== selectedLabel) {
            dispatch(
                setSelectedClearanceView(selectedLabel)
            );
        }

    }, [
        normalizedUrlStatus,
        clearanceStatus,
        selectedClearanceView,
        dispatch,
    ]);

    /* =====================================================
       FETCH CLEARANCES
    ===================================================== */

    const loadClearances = useCallback(
        (filterValues, selectedViewStatus) => {

            dispatch(
                fetchAllClearance({
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

        loadClearances(
            appliedFilters,
            effectiveClearanceStatus
        );

    }, [
        loadClearances,
        appliedFilters,
        effectiveClearanceStatus,
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

        loadClearances(
            appliedFilters,
            effectiveClearanceStatus
        );

    };

    /* =====================================================
       STATUS VIEW CHANGE
    ===================================================== */

    const handleViewChange = (view) => {

        if (!view) return;

        dispatch(
            setSelectedClearanceView(view.label)
        );

        dispatch(
            setClearanceStatus(view.value)
        );

        navigate(
            `/inventory/parties/clearances?clearanceStatus=${view.value}`
        );

    };

    /* =====================================================
       CREATE CLEARANCE
    ===================================================== */

    const handleCreateClearance = () => {

        navigate("/inventory/parties/clearances/create");

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

    const paymentMethodOptions = [
        { label: "All Methods", value: "" },
        { label: "Cash", value: "CASH" },
        { label: "UPI", value: "UPI" },
        { label: "Bank Transfer", value: "BANK_TRANSFER" },
        { label: "Card", value: "CARD" },
        { label: "Cheque", value: "CHEQUE" },
    ];

    const clearanceStatusOptions = [
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
                            Credit Clearance Overview
                        </h2>

                        <p className="
                            mt-1 text-xs text-gray-500
                        ">
                            Monitor and manage party credit clearances.
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

                    {/* NEW CLEARANCE */}

                    <button
                        type="button"
                        onClick={handleCreateClearance}
                        className="
                            group relative flex items-center gap-1 rounded-md
                            bg-[#0095FD] px-3 py-2
                            text-sm font-medium text-white
                            hover:bg-[#0095FD]/90
                        "
                    >
                        <Plus size={14} />

                        <span>New</span>

                        <ToolTipText
                            text="New Clearance"
                            position="bottom"
                        />
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
                                Filter Clearances
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

                        {/* PARTY NAME */}

                        <div>
                            <label className={labelClass}>
                                Party Name
                            </label>

                            <input
                                type="text"
                                name="partyName"
                                value={filters.partyName}
                                onChange={handleFilterChange}
                                placeholder="Enter party name"
                                className={inputClass}
                            />
                        </div>

                        {/* PARTY CODE */}

                        <div>
                            <label className={labelClass}>
                                Party Code
                            </label>

                            <input
                                type="text"
                                name="partyCode"
                                value={filters.partyCode}
                                onChange={handleFilterChange}
                                placeholder="Enter party code"
                                className={inputClass}
                            />
                        </div>

                        {/* PAYMENT METHOD */}

                        <div>
                            <label className={labelClass}>
                                Payment Method
                            </label>

                            <CustomSelect
                                name="paymentMethod"
                                value={filters.paymentMethod}
                                onChange={(value) => {
                                    handleFilterChange(
                                        "paymentMethod",
                                        typeof value === "object"
                                            ? value.value
                                            : value
                                    );
                                }}
                                options={paymentMethodOptions}
                            />
                        </div>

                        {/* PAYMENT REFERENCE */}

                        <div>
                            <label className={labelClass}>
                                Payment Reference Number
                            </label>

                            <input
                                type="text"
                                name="paymentReferenceNumber"
                                value={filters.paymentReferenceNumber}
                                onChange={handleFilterChange}
                                placeholder="Enter reference number"
                                className={inputClass}
                            />
                        </div>

                        {/* CLEARANCE DATE */}

                        <div>
                            <label className={labelClass}>
                                Clearance Date
                            </label>

                            <input
                                type="date"
                                name="clearanceDate"
                                value={filters.clearanceDate}
                                onChange={handleFilterChange}
                                className={inputClass}
                            />
                        </div>

                        {/* MIN AMOUNT */}

                        <div>
                            <label className={labelClass}>
                                Minimum Amount
                            </label>

                            <input
                                type="number"
                                name="minAmount"
                                min="0"
                                value={filters.minAmount}
                                onChange={handleFilterChange}
                                placeholder="Enter minimum amount"
                                className={inputClass}
                            />
                        </div>

                        {/* MAX AMOUNT */}

                        <div>
                            <label className={labelClass}>
                                Maximum Amount
                            </label>

                            <input
                                type="number"
                                name="maxAmount"
                                min="0"
                                value={filters.maxAmount}
                                onChange={handleFilterChange}
                                placeholder="Enter maximum amount"
                                className={inputClass}
                            />
                        </div>

                        {/* CLEARANCE STATUS */}

                        <div>
                            <label className={labelClass}>
                                Clearance Status
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
                                options={clearanceStatusOptions}
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
