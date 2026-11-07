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
    setExpensesStatus,
    setSelectedExpensesView,
} from "../../slices/expensesViewSlice";

import {
    fetchAllExpenses,
} from "../../thunks/expenseThunks";

import CustomSelect from "../../../../../common/custom/CustomSelect";
import ToolTipText from "../../../../../common/toolTip/ToolTipText";

/* =========================================================
   CONSTANTS
========================================================= */

const INITIAL_FILTERS = {
    expenseNo: "",
    categoryName: "",
    description: "",
    referenceNo: "",
    vendorName: "",
    expenseType: "",
    paymentStatus: "",
    expenseStatus: "",
    fromDate: "",
    toDate: "",
};

const VALID_STATUSES = [
    "ALL",
    "DRAFT",
    "APPROVED",
    "REJECTED",
    "CANCELLED",
];

const STATUS_LABELS = {
    ALL: "All Expenses",
    DRAFT: "Draft Expenses",
    APPROVED: "Approved Expenses",
    REJECTED: "Rejected Expenses",
    CANCELLED: "Cancelled Expenses",
};

/* =========================================================
   COMPONENT
========================================================= */

export default function NavbarExpense() {
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

    const selectedExpenseView = useSelector(
        (state) =>
            state.expenseView?.selectedExpensesView
    );

    const expenseStatus = useSelector(
        (state) =>
            state.expenseView?.expensesStatus || "ALL"
    );

    const loading = useSelector(
        (state) =>
            state.expense?.loading === true
    );

    /* =====================================================
       URL STATUS
    ===================================================== */

    const urlStatus = searchParams.get("expenseStatus");

    const normalizedUrlStatus = String(
        urlStatus || ""
    )
        .trim()
        .toUpperCase();

    const effectiveExpenseStatus =
        VALID_STATUSES.includes(normalizedUrlStatus)
            ? normalizedUrlStatus
            : expenseStatus;

    /* =====================================================
       URL STATUS SYNCHRONIZATION
    ===================================================== */

    useEffect(() => {
        const selectedStatus = VALID_STATUSES.includes(
            normalizedUrlStatus
        )
            ? normalizedUrlStatus
            : expenseStatus;

        const selectedLabel =
            STATUS_LABELS[selectedStatus] ||
            "All Expenses";

        if (expenseStatus !== selectedStatus) {
            dispatch(
                setExpensesStatus(selectedStatus)
            );
        }

        if (selectedExpenseView !== selectedLabel) {
            dispatch(
                setSelectedExpensesView(selectedLabel)
            );
        }

    }, [
        normalizedUrlStatus,
        expenseStatus,
        selectedExpenseView,
        dispatch,
    ]);

    /* =====================================================
       FETCH EXPENSES
    ===================================================== */

    const loadExpenses = useCallback(
        (filterValues, selectedViewStatus) => {
            dispatch(
                fetchAllExpenses({
                    ...filterValues,

                    expenseStatus:
                        filterValues.expenseStatus ||
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
        loadExpenses(
            appliedFilters,
            effectiveExpenseStatus
        );

    }, [
        loadExpenses,
        appliedFilters,
        effectiveExpenseStatus,
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
        loadExpenses(
            appliedFilters,
            effectiveExpenseStatus
        );
    };

    /* =====================================================
       STATUS VIEW CHANGE
    ===================================================== */

    const handleViewChange = (view) => {
        if (!view) return;

        dispatch(
            setSelectedExpensesView(view.label)
        );

        dispatch(
            setExpensesStatus(view.value)
        );

        navigate(
            `/invoice/expenses?expenseStatus=${view.value}`
        );
    };

    /* =====================================================
       CREATE EXPENSE
    ===================================================== */

    const handleCreateExpense = () => {
        navigate("/invoice/expenses/create");
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

    const expenseTypeOptions = [
        { label: "All Types", value: "" },
        { label: "GENERAL", value: "GENERAL" },
        { label: "PURCHASE", value: "PURCHASE" },
        { label: "TRAVEL", value: "TRAVEL" },
        { label: "OFFICE", value: "OFFICE" },
        { label: "UTILITY", value: "UTILITY" },
    ];

    const expenseStatusOptions = [
        { label: "All Statuses", value: "" },
        { label: "Draft", value: "DRAFT" },
        { label: "Approved", value: "APPROVED" },
        { label: "Rejected", value: "REJECTED" },
        { label: "Cancelled", value: "CANCELLED" },
    ];

    const paymentStatusOptions = [
        { label: "All Payment Statuses", value: "" },
        { label: "Unpaid", value: "UNPAID" },
        { label: "Partial", value: "PARTIAL" },
        { label: "Paid", value: "PAID" },
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

                    >
                        <Home size={18} />
                        <ToolTipText text="Home" position="bottom" />
                    </button>

                    {/* TITLE */}

                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">
                            Expense Overview
                        </h2>

                        <p className="mt-1 text-xs text-gray-500">
                            Monitor and manage your business expenses.
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

                    {/* NEW EXPENSE */}

                    <button
                        type="button"
                        onClick={handleCreateExpense}
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
                        title="New Expense"
                    >
                        <Plus size={14} />

                        <span>New</span>
                        <ToolTipText text="New Expenses" position="bottom" />
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
                                Filter Expenses
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

                        {/* EXPENSE NUMBER */}

                        <div>
                            <label className={labelClass}>
                                Expense Number
                            </label>

                            <input
                                type="text"
                                name="expenseNo"
                                value={filters.expenseNo}
                                onChange={handleFilterChange}
                                placeholder="Enter expense number"
                                className={inputClass}
                            />
                        </div>

                        {/* CATEGORY */}

                        <div>
                            <label className={labelClass}>
                                Category
                            </label>

                            <input
                                type="text"
                                name="categoryName"
                                value={filters.categoryName}
                                onChange={handleFilterChange}
                                placeholder="Search category"
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

                        {/* REFERENCE NUMBER */}

                        <div>
                            <label className={labelClass}>
                                Reference Number
                            </label>

                            <input
                                type="text"
                                name="referenceNo"
                                value={filters.referenceNo}
                                onChange={handleFilterChange}
                                placeholder="Enter reference number"
                                className={inputClass}
                            />
                        </div>

                        {/* VENDOR */}

                        <div>
                            <label className={labelClass}>
                                Vendor
                            </label>

                            <input
                                type="text"
                                name="vendorName"
                                value={filters.vendorName}
                                onChange={handleFilterChange}
                                placeholder="Search vendor"
                                className={inputClass}
                            />
                        </div>

                        {/* EXPENSE TYPE */}

                        <div>
                            <label className={labelClass}>
                                Expense Type
                            </label>

                            <CustomSelect
                                name="expenseType"
                                value={filters.expenseType}
                                onChange={(value) => {
                                    handleFilterChange(
                                        "expenseType",
                                        typeof value === "object"
                                            ? value.value
                                            : value
                                    );
                                }}
                                options={expenseTypeOptions}
                            />
                        </div>

                        {/* EXPENSE STATUS */}

                        <div>
                            <label className={labelClass}>
                                Expense Status
                            </label>

                            <CustomSelect
                                name="expenseStatus"
                                value={filters.expenseStatus}
                                onChange={(value) => {
                                    handleFilterChange(
                                        "expenseStatus",
                                        typeof value === "object"
                                            ? value.value
                                            : value
                                    );
                                }}
                                options={expenseStatusOptions}
                            />
                        </div>

                        {/* PAYMENT STATUS */}

                        <div>
                            <label className={labelClass}>
                                Payment Status
                            </label>

                            <CustomSelect
                                name="paymentStatus"
                                value={filters.paymentStatus}
                                onChange={(value) => {
                                    handleFilterChange(
                                        "paymentStatus",
                                        typeof value === "object"
                                            ? value.value
                                            : value
                                    );
                                }}
                                options={paymentStatusOptions}
                            />
                        </div>

                        {/* FROM DATE */}

                        <div>
                            <label className={labelClass}>
                                From Date
                            </label>

                            <input
                                type="date"
                                name="fromDate"
                                value={filters.fromDate}
                                onChange={handleFilterChange}
                                className={inputClass}
                            />
                        </div>

                        {/* TO DATE */}

                        <div>
                            <label className={labelClass}>
                                To Date
                            </label>

                            <input
                                type="date"
                                name="toDate"
                                value={filters.toDate}
                                min={filters.fromDate || undefined}
                                onChange={handleFilterChange}
                                className={inputClass}
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