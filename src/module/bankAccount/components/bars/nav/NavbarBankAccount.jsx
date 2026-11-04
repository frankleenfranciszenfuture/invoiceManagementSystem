
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
    setSearch,
    setBankAccountStatus,
    setSelectedBankAccountView,
} from "../../../slices/bankAccountViewSlice";

import {
    fetchAllBankAccounts,
} from "../../../thunks/bankAccountThunks";

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
    "PRIMARY",
];

const STATUS_LABELS = {
    ALL: "All Bank Accounts",
    ACTIVE: "Active Bank Accounts",
    INACTIVE: "Inactive Bank Accounts",
    DRAFT: "Draft Bank Accounts",
    PRIMARY: "Primary Bank Accounts",
};

/* =========================================================
   COMPONENT
========================================================= */

export default function NavbarBankAccount() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [searchParams] = useSearchParams();

    /* =====================================================
       LOCAL STATE
    ===================================================== */

    const [filterOpen, setFilterOpen] = useState(false);

    const [filters, setFilters] = useState(INITIAL_FILTERS);

    /* =====================================================
       REDUX STATE
    ===================================================== */

    const selectedBankAccountView = useSelector(
        (state) =>
            state.bankAccountView?.selectedBankAccountView
    );

    const bankAccountStatus = useSelector(
        (state) =>
            state.bankAccountView?.bankAccountStatus || "ALL"
    );

    const search = useSelector(
        (state) =>
            state.bankAccountView?.search || ""
    );

    const loading = useSelector(
        (state) =>
            state.bankAccount?.loading === true
    );

    /* =====================================================
       URL STATUS
    ===================================================== */

    const urlStatus = searchParams.get("bankAccountStatus");

    const normalizedUrlStatus = String(
        urlStatus || ""
    )
        .trim()
        .toUpperCase();

    const effectiveBankAccountStatus =
        VALID_STATUSES.includes(normalizedUrlStatus)
            ? normalizedUrlStatus
            : bankAccountStatus;

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
            STATUS_LABELS[selectedStatus] ||
            STATUS_LABELS.ALL;

        if (bankAccountStatus !== selectedStatus) {
            dispatch(
                setBankAccountStatus(selectedStatus)
            );
        }

        if (
            selectedBankAccountView !== selectedLabel
        ) {
            dispatch(
                setSelectedBankAccountView(selectedLabel)
            );
        }

    }, [
        normalizedUrlStatus,
        bankAccountStatus,
        selectedBankAccountView,
        dispatch,
    ]);

    /* =====================================================
       FETCH BANK ACCOUNTS

       Fetch all records only.
       Filtering is handled by the dashboard.
    ===================================================== */

    const loadBankAccounts = useCallback(() => {
        dispatch(fetchAllBankAccounts());
    }, [dispatch]);

    useEffect(() => {
        loadBankAccounts();
    }, [loadBankAccounts]);

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

       These values are consumed by BankAccountDashboard.
    ===================================================== */

    const handleApplyFilters = () => {
        dispatch(setSearch(filters.search.trim()));

        const selectedStatus = filters.status || "ALL";

        dispatch(setBankAccountStatus(selectedStatus));

        const selectedLabel =
            STATUS_LABELS[selectedStatus] ||
            STATUS_LABELS.ALL;

        dispatch(setSelectedBankAccountView(selectedLabel));

        navigate(
            `/settings/bankAccount?bankAccountStatus=${selectedStatus}`
        );

        setFilterOpen(false);
    };

    /* =====================================================
       RESET FILTERS
    ===================================================== */

    const handleResetFilters = () => {
        setFilters({
            ...INITIAL_FILTERS,
        });

        dispatch(setSearch(""));
        dispatch(setBankAccountStatus("ALL"));
        dispatch(setSelectedBankAccountView(STATUS_LABELS.ALL));

        navigate("/settings/bankAccount?bankAccountStatus=ALL");
    };

    /* =====================================================
       REFRESH
    ===================================================== */

    const handleRefresh = () => {
        loadBankAccounts();
    };

    /* =====================================================
       STATUS VIEW CHANGE
    ===================================================== */

    const handleViewChange = (view) => {
        if (!view) return;

        dispatch(
            setSelectedBankAccountView(view.label)
        );

        dispatch(
            setBankAccountStatus(view.value)
        );

        navigate(
            `/settings/bankAccount?bankAccountStatus=${view.value}`
        );
    };

    /* =====================================================
       CREATE BANK ACCOUNT
    ===================================================== */

    const handleCreateBankAccount = () => {
        navigate("/settings/bankAccount/create");
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

    const bankAccountStatusOptions = [
        { label: "All Statuses", value: "" },
        { label: "Active", value: "ACTIVE" },
        { label: "Inactive", value: "INACTIVE" },
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
                        <ToolTipText text="Home" position="bottom" />
                    </button>

                    <div>
                        <h2 className="
                            text-xl font-semibold text-gray-800
                        ">
                            Bank Account Overview
                        </h2>

                        <p className="
                            mt-1 text-xs text-gray-500
                        ">
                            Monitor and manage your business bank accounts.
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

                    {/* NEW BANK ACCOUNT */}

                    <button
                        type="button"
                        onClick={handleCreateBankAccount}
                        className="
                            group relative flex items-center gap-1 rounded-md
                            bg-[#0095FD] px-3 py-2
                            text-sm font-medium text-white
                            hover:bg-[#0095FD]/90
                        "

                    >
                        <Plus size={14} />
                        <span>New</span>
                        <ToolTipText text="New BankAcoount" position="bottom" />
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
                                Filter Bank Accounts
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
                                placeholder="Account name, code, bank name, account number..."
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
                                options={bankAccountStatusOptions}
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
