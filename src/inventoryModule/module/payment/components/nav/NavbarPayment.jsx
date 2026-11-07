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
    setPaymentsStatus,
    setSelectedPaymentsView,
} from "../../slices/paymentsViewSlice";

import {
    fetchAllPayments,
} from "../../thunks/paymentThunks";

import CustomSelect from "../../../../../common/custom/CustomSelect";
import ToolTipText from "../../../../../common/toolTip/ToolTipText";

/* =========================================================
   CONSTANTS
========================================================= */

const INITIAL_FILTERS = {
    paymentNumber: "",
    sourceId: "",
    sourceNumber: "",
    referenceNumber: "",
    paymentType: "",
    paymentDirection: "",
    paymentMethod: "",
    paymentStatus: "",
    fromDate: "",
    toDate: "",
};

const VALID_STATUSES = [
    "ALL",
    "COMPLETED",
    "PENDING",
    "FAILED",
    "REVERSED",
];

const STATUS_LABELS = {
    ALL: "All Payments",
    COMPLETED: "Completed Payments",
    PENDING: "Pending Payments",
    FAILED: "Failed Payments",
    REVERSED: "Reversed Payments",
};

/* =========================================================
   COMPONENT
========================================================= */

export default function NavbarPayment() {
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

    const selectedPaymentView = useSelector(
        (state) =>
            state.paymentsView?.selectedPaymentsView
    );

    const paymentStatus = useSelector(
        (state) =>
            state.paymentsView?.paymentsStatus || "ALL"
    );

    const loading = useSelector(
        (state) =>
            state.payment?.loading === true
    );

    /* =====================================================
       URL STATUS
    ===================================================== */

    const urlStatus = searchParams.get("paymentStatus");

    const normalizedUrlStatus = String(
        urlStatus || ""
    )
        .trim()
        .toUpperCase();

    const effectivePaymentStatus =
        VALID_STATUSES.includes(normalizedUrlStatus)
            ? normalizedUrlStatus
            : paymentStatus;

    /* =====================================================
       URL STATUS SYNCHRONIZATION
    ===================================================== */

    useEffect(() => {
        const selectedStatus = VALID_STATUSES.includes(
            normalizedUrlStatus
        )
            ? normalizedUrlStatus
            : paymentStatus;

        const selectedLabel =
            STATUS_LABELS[selectedStatus] ||
            "All Payments";

        if (paymentStatus !== selectedStatus) {
            dispatch(
                setPaymentsStatus(selectedStatus)
            );
        }

        if (selectedPaymentView !== selectedLabel) {
            dispatch(
                setSelectedPaymentsView(selectedLabel)
            );
        }

    }, [
        normalizedUrlStatus,
        paymentStatus,
        selectedPaymentView,
        dispatch,
    ]);

    /* =====================================================
       FETCH PAYMENTS
    ===================================================== */

    const loadPayments = useCallback(
        (filterValues, selectedViewStatus) => {
            dispatch(
                fetchAllPayments({
                    ...filterValues,

                    paymentStatus:
                        filterValues.paymentStatus ||
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
        loadPayments(
            appliedFilters,
            effectivePaymentStatus
        );

    }, [
        loadPayments,
        appliedFilters,
        effectivePaymentStatus,
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
        loadPayments(
            appliedFilters,
            effectivePaymentStatus
        );
    };

    /* =====================================================
       STATUS VIEW CHANGE
    ===================================================== */

    const handleViewChange = (view) => {
        if (!view) return;

        dispatch(
            setSelectedPaymentsView(view.label)
        );

        dispatch(
            setPaymentsStatus(view.value)
        );

        navigate(
            `/invoice/payments?paymentStatus=${view.value}`
        );
    };

    /* =====================================================
       CREATE PAYMENT
    ===================================================== */

    const handleCreatePayment = () => {
        navigate("/invoice/payments/create");
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

    const paymentTypeOptions = [
        { label: "All Types", value: "" },
        { label: "Sales", value: "SALES" },
        { label: "Purchase", value: "PURCHASE" },
        { label: "Expense", value: "EXPENSE" },
    ];

    const paymentDirectionOptions = [
        { label: "All Directions", value: "" },
        { label: "Received", value: "RECEIVED" },
        { label: "Paid", value: "PAID" },
    ];

    const paymentStatusOptions = [
        { label: "All Statuses", value: "" },
        { label: "Completed", value: "COMPLETED" },
        { label: "Pending", value: "PENDING" },
        { label: "Failed", value: "FAILED" },
        { label: "Reversed", value: "REVERSED" },
    ];

    const paymentMethodOptions = [
        { label: "All Methods", value: "" },
        { label: "Bank Transfer", value: "BANK_TRANSFER" },
        { label: "UPI", value: "UPI" },
        { label: "Card", value: "CARD" },
        { label: "Cheque", value: "CHEQUE" },
        { label: "Cash", value: "CASH" },
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
                            Payment Overview
                        </h2>

                        <p className="
                            mt-1 text-xs text-gray-500
                        ">
                            Monitor and manage your business payments.
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

                    {/* NEW PAYMENT */}

                    <button
                        type="button"
                        onClick={handleCreatePayment}
                        className="
                            group relative flex items-center gap-1 rounded-md
                            bg-[#0095FD] px-3 py-2
                            text-sm font-medium text-white
                            hover:bg-[#0095FD]/90
                        "
                        title="Record New Payment"
                    >
                        <Plus size={14} />

                        <span>New</span>
                        <ToolTipText text="New Payment" position="bottom" />
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
                        title="Settings"
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
                                Filter Payments
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

                        {/* PAYMENT NUMBER */}

                        <div>
                            <label className={labelClass}>
                                Payment Number
                            </label>

                            <input
                                type="text"
                                name="paymentNumber"
                                value={filters.paymentNumber}
                                onChange={handleFilterChange}
                                placeholder="Enter payment number"
                                className={inputClass}
                            />
                        </div>

                        {/* SOURCE ID */}

                        <div>
                            <label className={labelClass}>
                                Source Document ID
                            </label>

                            <input
                                type="number"
                                name="sourceId"
                                value={filters.sourceId}
                                onChange={handleFilterChange}
                                placeholder="Enter source ID"
                                className={inputClass}
                            />
                        </div>

                        {/* SOURCE NUMBER */}

                        <div>
                            <label className={labelClass}>
                                Source Document Number
                            </label>

                            <input
                                type="text"
                                name="sourceNumber"
                                value={filters.sourceNumber}
                                onChange={handleFilterChange}
                                placeholder="Enter source number"
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
                                name="referenceNumber"
                                value={filters.referenceNumber}
                                onChange={handleFilterChange}
                                placeholder="Enter reference number"
                                className={inputClass}
                            />
                        </div>

                        {/* PAYMENT TYPE */}

                        <div>
                            <label className={labelClass}>
                                Payment Type
                            </label>

                            <CustomSelect
                                name="paymentType"
                                value={filters.paymentType}
                                onChange={(value) => {
                                    handleFilterChange(
                                        "paymentType",
                                        typeof value === "object"
                                            ? value.value
                                            : value
                                    );
                                }}
                                options={paymentTypeOptions}
                            />
                        </div>

                        {/* PAYMENT DIRECTION */}

                        <div>
                            <label className={labelClass}>
                                Payment Direction
                            </label>

                            <CustomSelect
                                name="paymentDirection"
                                value={filters.paymentDirection}
                                onChange={(value) => {
                                    handleFilterChange(
                                        "paymentDirection",
                                        typeof value === "object"
                                            ? value.value
                                            : value
                                    );
                                }}
                                options={paymentDirectionOptions}
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