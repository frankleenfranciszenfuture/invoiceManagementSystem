
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
    setStatus,
    setSelectedView,
} from "../../slices/customerViewSlice";

import {
    fetchAllCustomers,
} from "../../thunks/customerThunks";

import CustomSelect from "../../../../common/custom/CustomSelect";
import ToolTipText from "../../../../common/toolTip/ToolTipText";

/* =========================================================
   CONSTANTS
========================================================= */

const INITIAL_FILTERS = {
    customerName: "",
    customerCode: "",
    email: "",
    phone: "",
    gstNumber: "",
    panNumber: "",
    status: "",
};

const VALID_STATUSES = [
    "ALL",
    "ACTIVE",
    "INACTIVE",
];

const STATUS_LABELS = {
    ALL: "All Customers",
    ACTIVE: "Active Customers",
    INACTIVE: "Inactive Customers",
};

/* =========================================================
   COMPONENT
========================================================= */

export default function NavbarCustomer() {

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

    const selectedCustomerView = useSelector(
        (state) =>
            state.customerView?.selectedCustomerView
    );

    const customerStatus = useSelector(
        (state) =>
            state.customerView?.customerStatus || "ALL"
    );

    const loading = useSelector(
        (state) =>
            state.customer?.loading === true
    );

    /* =====================================================
       URL STATUS
    ===================================================== */

    const urlStatus = searchParams.get("customerStatus");

    const normalizedUrlStatus = String(
        urlStatus || ""
    )
        .trim()
        .toUpperCase();

    const effectiveCustomerStatus =
        VALID_STATUSES.includes(normalizedUrlStatus)
            ? normalizedUrlStatus
            : customerStatus;

    /* =====================================================
       URL STATUS SYNCHRONIZATION
    ===================================================== */

    useEffect(() => {

        const selectedStatus = VALID_STATUSES.includes(
            normalizedUrlStatus
        )
            ? normalizedUrlStatus
            : customerStatus;

        const selectedLabel =
            STATUS_LABELS[selectedStatus] ||
            "All Customers";

        if (customerStatus !== selectedStatus) {
            dispatch(
                setStatus(selectedStatus)
            );
        }

        if (selectedCustomerView !== selectedLabel) {
            dispatch(
                setSelectedView(selectedLabel)
            );
        }

    }, [
        normalizedUrlStatus,
        customerStatus,
        selectedCustomerView,
        dispatch,
    ]);

    /* =====================================================
       FETCH CUSTOMERS
    ===================================================== */

    const loadCustomers = useCallback(
        (filterValues, selectedViewStatus) => {

            dispatch(
                fetchAllCustomers({
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

        loadCustomers(
            appliedFilters,
            effectiveCustomerStatus
        );

    }, [
        loadCustomers,
        appliedFilters,
        effectiveCustomerStatus,
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

        loadCustomers(
            appliedFilters,
            effectiveCustomerStatus
        );

    };

    /* =====================================================
       STATUS VIEW CHANGE
    ===================================================== */

    const handleViewChange = (view) => {

        if (!view) return;

        dispatch(
            setSelectedCustomerView(view.label)
        );

        dispatch(
            setStatus(view.value)
        );

        navigate(
            `/ customers ? customerStatus = ${view.value} `
        );

    };

    /* =====================================================
       CREATE CUSTOMER
    ===================================================== */

    const handleCreateCustomer = () => {

        navigate("/customers/create");

    };

    /* =====================================================
       INPUT STYLES
    ===================================================== */

    const inputClass = `
w - full
rounded - md
border
border - gray - 200
bg - white
px - 3
py - 2
text - sm
text - gray - 700
outline - none
transition
focus: border - [#0095FD]
focus: ring - 2
focus: ring - [#0095FD] / 10
    `;

    const labelClass = `
mb - 1.5
block
text - xs
font - medium
text - gray - 600
    `;

    /* =====================================================
       FILTER OPTIONS
    ===================================================== */

    const customerStatusOptions = [
        { label: "All Statuses", value: "" },
        { label: "Active", value: "ACTIVE" },
        { label: "Inactive", value: "INACTIVE" },
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
                            Customer Overview
                        </h2>

                        <p className="
                            mt-1 text-xs text-gray-500
                        ">
                            Monitor and manage your customers.
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
                            flex items - center gap - 2 rounded - md
                            border px - 3 py - 2 text - sm font - medium
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

                    {/* NEW CUSTOMER */}

                    <button
                        type="button"
                        onClick={handleCreateCustomer}
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
                            text="New Customer"
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
                                Filter Customers
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

                        {/* CUSTOMER CODE */}

                        <div>
                            <label className={labelClass}>
                                Customer Code
                            </label>

                            <input
                                type="text"
                                name="customerCode"
                                value={filters.customerCode}
                                onChange={handleFilterChange}
                                placeholder="Enter customer code"
                                className={inputClass}
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

                        {/* PHONE */}

                        <div>
                            <label className={labelClass}>
                                Phone Number
                            </label>

                            <input
                                type="text"
                                name="phone"
                                value={filters.phone}
                                onChange={handleFilterChange}
                                placeholder="Enter phone number"
                                className={inputClass}
                            />
                        </div>

                        {/* GST NUMBER */}

                        <div>
                            <label className={labelClass}>
                                GST Number
                            </label>

                            <input
                                type="text"
                                name="gstNumber"
                                value={filters.gstNumber}
                                onChange={handleFilterChange}
                                placeholder="Enter GST number"
                                className={inputClass}
                            />
                        </div>

                        {/* PAN NUMBER */}

                        <div>
                            <label className={labelClass}>
                                PAN Number
                            </label>

                            <input
                                type="text"
                                name="panNumber"
                                value={filters.panNumber}
                                onChange={handleFilterChange}
                                placeholder="Enter PAN number"
                                className={inputClass}
                            />
                        </div>

                        {/* CUSTOMER STATUS */}

                        <div>
                            <label className={labelClass}>
                                Customer Status
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
                                options={customerStatusOptions}
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