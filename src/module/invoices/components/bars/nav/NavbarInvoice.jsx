
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
    setInvoiceStatus,
    setSelectedInvoiceView,
} from "../../../slices/invoiceViewSlice";

import {
    fetchInvoices,
} from "../../../thunks/invoiceThunks";

import CustomSelect from "../../../../../common/custom/CustomSelect";
import ToolTipText from "../../../../../common/toolTip/ToolTipText";

/* =========================================================
   CONSTANTS
========================================================= */

const INITIAL_FILTERS = {
    invoiceNumber: "",
    invoiceType: "",
    customerName: "",
    invoiceStatus: "",
    currencyCode: "",
    salesPersonName: "",
};

const VALID_STATUSES = [
    "ALL",
    "APPROVED",
    "DRAFT",
    "SENT",
    "PAID",
    "OVERDUE",
    "CANCELLED",
];

const STATUS_LABELS = {
    ALL: "All Invoices",
    APPROVED: "Active Invoices",
    DRAFT: "Draft Invoices",
    SENT: "Sent Invoices",
    PAID: "Paid Invoices",
    OVERDUE: "Overdue Invoices",
    CANCELLED: "Cancel Invoices",
};

/* =========================================================
   COMPONENT
========================================================= */

export default function NavbarInvoice() {

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

    const selectedInvoiceView = useSelector(
        (state) =>
            state.invoiceView?.selectedInvoiceView
    );

    const invoiceStatus = useSelector(
        (state) =>
            state.invoiceView?.invoiceStatus || "ALL"
    );

    const loading = useSelector(
        (state) =>
            state.invoice?.loading === true
    );

    const user = useSelector(
        (state) => state.auth?.user
    );

    /* =====================================================
       BRANCH ID
    ===================================================== */

    const branchId =
        user?.branchId ||
        user?.branch?.id ||
        user?.companyBranchId ||
        null;

    /* =====================================================
       URL STATUS
    ===================================================== */

    const urlStatus = searchParams.get("invoiceStatus");

    const normalizedUrlStatus = String(
        urlStatus || ""
    )
        .trim()
        .toUpperCase();

    const effectiveInvoiceStatus =
        VALID_STATUSES.includes(normalizedUrlStatus)
            ? normalizedUrlStatus
            : invoiceStatus;

    /* =====================================================
       URL STATUS SYNCHRONIZATION
    ===================================================== */

    useEffect(() => {

        const selectedStatus = VALID_STATUSES.includes(
            normalizedUrlStatus
        )
            ? normalizedUrlStatus
            : invoiceStatus;

        const selectedLabel =
            STATUS_LABELS[selectedStatus] ||
            "All Invoices";

        if (invoiceStatus !== selectedStatus) {
            dispatch(
                setInvoiceStatus(selectedStatus)
            );
        }

        if (selectedInvoiceView !== selectedLabel) {
            dispatch(
                setSelectedInvoiceView(selectedLabel)
            );
        }

    }, [
        normalizedUrlStatus,
        invoiceStatus,
        selectedInvoiceView,
        dispatch,
    ]);

    /* =====================================================
       FETCH INVOICES
    ===================================================== */

    const loadInvoices = useCallback(
        (filterValues, selectedViewStatus, page = 0, size = 20) => {

            if (!branchId) {
                return;
            }

            const searchParams = {
                ...filterValues,

                invoiceStatus:
                    filterValues.invoiceStatus ||
                    (
                        selectedViewStatus === "ALL"
                            ? undefined
                            : selectedViewStatus
                    ),
            };

            Object.keys(searchParams).forEach((key) => {
                if (
                    searchParams[key] === "" ||
                    searchParams[key] === undefined ||
                    searchParams[key] === null
                ) {
                    delete searchParams[key];
                }
            });

            dispatch(
                fetchInvoices({
                    id: branchId,
                    page,
                    size,
                    searchParams,
                })
            );

        },
        [
            dispatch,
            branchId,
        ]
    );

    /* =====================================================
       FETCH WHEN FILTERS OR STATUS CHANGE
    ===================================================== */

    useEffect(() => {

        loadInvoices(
            appliedFilters,
            effectiveInvoiceStatus
        );

    }, [
        loadInvoices,
        appliedFilters,
        effectiveInvoiceStatus,
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

        loadInvoices(
            appliedFilters,
            effectiveInvoiceStatus
        );

    };

    /* =====================================================
       STATUS VIEW CHANGE
    ===================================================== */

    const handleViewChange = (view) => {

        if (!view) return;

        dispatch(
            setSelectedInvoiceView(view.label)
        );

        dispatch(
            setInvoiceStatus(view.value)
        );

        navigate(
            `/invoices?invoiceStatus=${view.value}`
        );

    };

    /* =====================================================
       CREATE INVOICE
    ===================================================== */

    const handleCreateInvoice = () => {

        navigate("/invoices/product/new");

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

    const invoiceTypeOptions = [
        { label: "All Types", value: "" },
        { label: "Product Invoice", value: "PRODUCT_INVOICE" },
        { label: "Service Invoice", value: "SERVICE_INVOICE" },
        { label: "Sale Invoice", value: "SALE_INVOICE" },
    ];

    const invoiceStatusOptions = [
        { label: "All Statuses", value: "" },
        { label: "Draft", value: "DRAFT" },
        { label: "Approved", value: "APPROVED" },
        { label: "Sent", value: "SENT" },
        { label: "Paid", value: "PAID" },
        { label: "Partial", value: "PARTIAL" },
        { label: "Overdue", value: "OVERDUE" },
        { label: "Cancelled", value: "CANCELLED" },
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
                            Invoice Overview
                        </h2>

                        <p className="
                            mt-1 text-xs text-gray-500
                        ">
                            Monitor and manage your invoices.
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

                    {/* NEW INVOICE */}

                    <button
                        type="button"
                        onClick={handleCreateInvoice}
                        className="
                            group relative flex items-center gap-1 rounded-md
                            bg-[#0095FD] px-3 py-2
                            text-sm font-medium text-white
                            hover:bg-[#0095FD]/90
                        "

                    >
                        <Plus size={14} />

                        <span>New</span>
                        <ToolTipText text="New Invoice" position="bottom" />
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
                        <ToolTipText text="Home" position="bottom" />
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
                                Filter Invoices
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

                        {/* INVOICE NUMBER */}

                        <div>
                            <label className={labelClass}>
                                Invoice Number
                            </label>

                            <input
                                type="text"
                                name="invoiceNumber"
                                value={filters.invoiceNumber}
                                onChange={handleFilterChange}
                                placeholder="Enter invoice number"
                                className={inputClass}
                            />
                        </div>

                        {/* INVOICE TYPE */}

                        <div>
                            <label className={labelClass}>
                                Invoice Type
                            </label>

                            <CustomSelect
                                name="invoiceType"
                                value={filters.invoiceType}
                                onChange={(value) => {
                                    handleFilterChange(
                                        "invoiceType",
                                        typeof value === "object"
                                            ? value.value
                                            : value
                                    );
                                }}
                                options={invoiceTypeOptions}
                            />
                        </div>

                        {/* CUSTOMER NAME */}

                        <div>
                            <label className={labelClass}>
                                Customer Name
                            </label>

                            <input
                                type="text"
                                name="customerName"
                                value={filters.customerName}
                                onChange={handleFilterChange}
                                placeholder="Enter customer name"
                                className={inputClass}
                            />
                        </div>

                        {/* CURRENCY */}

                        <div>
                            <label className={labelClass}>
                                Currency Code
                            </label>

                            <input
                                type="text"
                                name="currencyCode"
                                value={filters.currencyCode}
                                onChange={handleFilterChange}
                                placeholder="Enter currency code (INR, USD)"
                                className={inputClass}
                            />
                        </div>

                        {/* SALES PERSON */}

                        <div>
                            <label className={labelClass}>
                                Sales Person
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

                        {/* INVOICE STATUS */}

                        <div>
                            <label className={labelClass}>
                                Invoice Status
                            </label>

                            <CustomSelect
                                name="invoiceStatus"
                                value={filters.invoiceStatus}
                                onChange={(value) => {
                                    handleFilterChange(
                                        "invoiceStatus",
                                        typeof value === "object"
                                            ? value.value
                                            : value
                                    );
                                }}
                                options={invoiceStatusOptions}
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
