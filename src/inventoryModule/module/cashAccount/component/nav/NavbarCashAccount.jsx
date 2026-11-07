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
    setCashAccountsStatus,
    setSelectedCashAccountsView,
} from "../../slices/cashAccountsViewSlice";

import {
    fetchAllCashAccounts,
} from "../../thunks/cashAccountThunks";

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
];

const STATUS_LABELS = {
    ALL: "All Cash Accounts",
    ACTIVE: "Active Cash Accounts",
    INACTIVE: "Inactive Cash Accounts",
};

/* =========================================================
   COMPONENT
========================================================= */

export default function NavbarCashAccount() {

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

    const selectedCashAccountsView = useSelector(
        (state) =>
            state.cashAccountsView?.selectedCashAccountsView
    );

    const cashAccountStatus = useSelector(
        (state) =>
            state.cashAccountsView?.cashAccountsStatus || "ALL"
    );

    const loading = useSelector(
        (state) =>
            state.cashAccount?.loading === true
    );

    /* =====================================================
       URL STATUS
    ===================================================== */

    const urlStatus = searchParams.get("status");

    const normalizedUrlStatus = String(
        urlStatus || ""
    )
        .trim()
        .toUpperCase();

    const effectiveCashAccountStatus =
        VALID_STATUSES.includes(normalizedUrlStatus)
            ? normalizedUrlStatus
            : cashAccountStatus;

    /* =====================================================
       URL STATUS SYNCHRONIZATION
    ===================================================== */

    useEffect(() => {

        const selectedStatus = VALID_STATUSES.includes(
            normalizedUrlStatus
        )
            ? normalizedUrlStatus
            : cashAccountStatus;

        const selectedLabel =
            STATUS_LABELS[selectedStatus] ||
            "All Cash Accounts";

        if (cashAccountStatus !== selectedStatus) {
            dispatch(
                setCashAccountsStatus(selectedStatus)
            );
        }

        if (
            selectedCashAccountsView !== selectedLabel
        ) {
            dispatch(
                setSelectedCashAccountsView(selectedLabel)
            );
        }

    }, [
        normalizedUrlStatus,
        cashAccountStatus,
        selectedCashAccountsView,
        dispatch,
    ]);

    /* =====================================================
       FETCH CASH ACCOUNTS
    ===================================================== */

    const loadCashAccounts = useCallback(
        (filterValues, selectedViewStatus) => {

            dispatch(
                fetchAllCashAccounts({

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

        loadCashAccounts(
            appliedFilters,
            effectiveCashAccountStatus
        );

    }, [
        loadCashAccounts,
        appliedFilters,
        effectiveCashAccountStatus,
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

        loadCashAccounts(
            appliedFilters,
            effectiveCashAccountStatus
        );

    };

    /* =====================================================
       STATUS VIEW CHANGE
    ===================================================== */

    const handleViewChange = (view) => {

        if (!view) return;

        dispatch(
            setSelectedCashAccountsView(view.label)
        );

        dispatch(
            setCashAccountsStatus(view.value)
        );

        navigate(
            `/settings/cash-accounts?status=${view.value}`
        );

    };

    /* =====================================================
       CREATE CASH ACCOUNT
    ===================================================== */

    const handleCreateCashAccount = () => {
        navigate("/settings/cash-accounts/create");
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

    const cashAccountStatusOptions = [
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
                            group relative 
                            flex items-center justify-center
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
                            Cash Account Overview
                        </h2>

                        <p className="
                            mt-1 text-xs text-gray-500
                        ">
                            Monitor and manage your business cash accounts.
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

                    {/* NEW CASH ACCOUNT */}

                    <button
                        type="button"
                        onClick={handleCreateCashAccount}
                        className="
                            group relative
                            flex items-center gap-1 rounded-md
                            bg-[#0095FD] px-3 py-2
                            text-sm font-medium text-white
                            hover:bg-[#0095FD]/90
                        "

                    >
                        <Plus size={14} />

                        <span>New</span>

                        <ToolTipText text="Create New Cash Account" position="bottom" />
                    </button>

                    {/* SETTINGS */}

                    <button
                        type="button"
                        onClick={() => navigate("/settings")}
                        className="
                            group relative
                            rounded-md border border-gray-300
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
                                Filter Cash Accounts
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
                                placeholder="Account name, code, currency..."
                                className={inputClass}
                            />

                        </div>

                        {/* ACCOUNT STATUS */}

                        <div>

                            <label className={labelClass}>
                                Account Status
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
                                options={cashAccountStatusOptions}
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