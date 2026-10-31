
import React, {
    useState,
    useEffect,
    useRef,
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
    setSalesOrderStatus,
    setSelectedSalesOrderView,
} from "../../slices/saleOrderViewSlice";

import {
    fetchAllSalesOrders,
} from "../../thunks/salesOrderThunks";
import CustomSelect from "../../../../../common/custom/CustomSelect";

export default function NavbarSaleOrder() {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);

    const dropdownOpenRef = useRef(null);

    // ============================================================
    // FILTER STATE
    // ============================================================

    const initialFilters = {
        orderNo: "",
        partyType: "",
        customerId: "",
        partyId: "",
        warehouseId: "",
        fromDate: "",
        toDate: "",
    };

    const [filters, setFilters] = useState(initialFilters);

    const [appliedFilters, setAppliedFilters] = useState(initialFilters);

    // ============================================================
    // SALES ORDER VIEW STATE
    // ============================================================

    const selectedSalesOrderView = useSelector(
        (state) => state.saleOrderView?.selectedSalesOrderView
    );

    const views = useSelector(
        (state) => state.saleOrderView?.views ?? []
    );

    const salesOrderStatus = useSelector(
        (state) => state.saleOrderView?.salesOrderStatus || "ALL"
    );

    const loading = useSelector(
        (state) => state.salesOrder?.loading || false
    );
    const selectedStatus = useSelector(
        (state) => state.saleOrderView?.salesOrderStatus || "ALL"
    );

    // ============================================================
    // URL STATUS SYNCHRONIZATION
    // ============================================================

    useEffect(() => {

        const urlStatus = searchParams.get("salesOrderStatus") || "ALL";

        const selectedView = views.find(
            (view) => view.value === urlStatus
        );

        if (selectedView) {

            if (salesOrderStatus !== selectedView.value) {
                dispatch(setSalesOrderStatus(selectedView.value));
            }

            if (selectedSalesOrderView !== selectedView.label) {
                dispatch(setSelectedSalesOrderView(selectedView.label));
            }

        } else if (urlStatus === "ALL") {

            dispatch(setSalesOrderStatus("ALL"));
            dispatch(setSelectedSalesOrderView("All Sales Orders"));

        }

    }, [
        searchParams,
        views,
        salesOrderStatus,
        selectedSalesOrderView,
        dispatch,
    ]);

    // ============================================================
    // FETCH SALES ORDERS
    // ============================================================

    const loadSalesOrders = (filterValues, status) => {

        dispatch(
            fetchAllSalesOrders({
                ...filterValues,

                orderNo: filterValues.orderNo || undefined,
                partyType: filterValues.partyType || undefined,

                customerId: filterValues.customerId
                    ? Number(filterValues.customerId)
                    : undefined,

                partyId: filterValues.partyId
                    ? Number(filterValues.partyId)
                    : undefined,

                warehouseId: filterValues.warehouseId
                    ? Number(filterValues.warehouseId)
                    : undefined,

                salesOrderStatus:
                    status === "ALL" ? undefined : status,

                fromDate: filterValues.fromDate || undefined,
                toDate: filterValues.toDate || undefined,

                page: 0,
                size: 10,
            })
        );
    };

    // ============================================================
    // FETCH WHEN STATUS CHANGES
    // ============================================================

    useEffect(() => {

        loadSalesOrders(appliedFilters, salesOrderStatus);

    }, [salesOrderStatus, appliedFilters]);

    // ============================================================
    // CLICK OUTSIDE
    // ============================================================

    useEffect(() => {

        const handleClickOutside = (e) => {

            if (
                dropdownOpenRef.current &&
                !dropdownOpenRef.current.contains(e.target)
            ) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };

    }, []);

    // ============================================================
    // FILTER INPUT CHANGE
    // ============================================================

    const handleFilterChange = (eOrName, selectedValue) => {
        const name =
            typeof eOrName === "string"
                ? eOrName
                : eOrName.target.name;

        const value =
            typeof eOrName === "string"
                ? selectedValue
                : eOrName.target.value;

        setFilters((prev) => ({
            ...prev,
            [name]: value,
            page: 0,
        }));
    };

    // ============================================================
    // APPLY FILTERS
    // ============================================================

    const handleApplyFilters = () => {

        setAppliedFilters({ ...filters });
        setFilterOpen(false);

    };

    // ============================================================
    // RESET FILTERS
    // ============================================================

    const handleResetFilters = () => {

        setFilters(initialFilters);
        setAppliedFilters(initialFilters);

    };

    // ============================================================
    // STATUS VIEW CHANGE
    // ============================================================

    const handleViewChange = (view) => {

        dispatch(setSelectedSalesOrderView(view.label));
        dispatch(setSalesOrderStatus(view.value));

        navigate(
            `/inventory/salesOrders?salesOrderStatus=${view.value}`
        );

        setDropdownOpen(false);
    };

    // ============================================================
    // CREATE SALES ORDER
    // ============================================================

    const handleCreateSalesOrder = () => {
        navigate("/inventory/saleOrder/create");
    };

    const handleRefresh = () => {
        loadSalesOrders(appliedFilters, selectedStatus);
    };



    // ============================================================
    // INPUT STYLE
    // ============================================================

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

    const partyOptions = [
        { label: "All Party Types", value: "" },
        { label: "Customer", value: "CUSTOMER" },
        { label: "Party", value: "PARTY" },
    ];

    // ============================================================
    // RENDER
    // ============================================================

    return (

        <div className="relative">


            {/* ================================================== */}
            {/* NAVBAR */}
            {/* ================================================== */}

            <div
                className="
                    min-h-[60px]
                    rounded-md
                    border
                    border-gray-100
                    flex
                    items-center
                    justify-between
                    bg-white
                    px-2
                    py-2
                    gap-2
                "
            >


                {/* LEFT */}

                <div className="flex items-center gap-2">


                    {/* HOME */}

                    <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="
                            flex
                            items-center
                            justify-center
                            rounded-md
                            border
                            border-blue-300
                            bg-white
                            p-2
                            text-[#0095FD]
                            hover:bg-[#0095FD]/20
                            transition
                        "
                        title="Home"
                    >
                        <Home size={18} />
                    </button>

                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">
                            Sales Order Overview
                            <p className="mt-1 text-xs text-gray-500">
                                Monitor and manage your sales orders.
                            </p>
                        </h2>


                    </div>
                    {/* STATUS DROPDOWN */}

                    {/* <div
                        ref={dropdownOpenRef}
                        className="relative"
                    >

                        <button
                            type="button"
                            onClick={() => setDropdownOpen((prev) => !prev)}
                            className="
                                flex
                                items-center
                                gap-1
                                rounded-md
                                bg-[#0095FD]
                                px-3
                                py-2
                                hover:bg-[#0095FD]/90
                            "
                        >

                            <h2 className="font-semibold text-gray-100">
                                {selectedSalesOrderView || "All Sales Orders"}
                            </h2>

                            <ChevronDown
                                size={14}
                                className={`
                                    text-gray-100
                                    transition
                                    ${dropdownOpen ? "rotate-180" : ""}
                                `}
                            />

                        </button>

                        {dropdownOpen && (

                            <div
                                className="
                                    absolute
                                    left-0
                                    mt-2
                                    w-72
                                    rounded-md
                                    border
                                    border-gray-200
                                    bg-white
                                    shadow-lg
                                    z-50
                                "
                            >

                                <div className="max-h-72 overflow-y-auto">

                                    {views.map((view) => (

                                        <button
                                            type="button"
                                            key={view.value}
                                            onClick={() => handleViewChange(view)}
                                            className={`
                                                w-full
                                                px-5
                                                py-4
                                                border-b
                                                border-gray-50
                                                text-left
                                                text-sm
                                                rounded-md
                                                transition
                                                ${salesOrderStatus === view.value
                                                    ? "bg-[#0095FD] text-white"
                                                    : "text-gray-700 hover:bg-[#0095FD]/90 hover:text-white"
                                                }
                                            `}
                                        >
                                            {view.label}
                                        </button>

                                    ))}

                                </div>

                            </div>

                        )}

                    </div> */}



                </div>

                {/* RIGHT */}

                <div className="flex items-center gap-2">

                    <button
                        type="button"
                        onClick={handleRefresh}
                        disabled={loading}
                        className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
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
                        onClick={() => setFilterOpen((prev) => !prev)}
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
                            className={`transition ${filterOpen ? "rotate-180" : ""}`}
                        />

                    </button>

                    {/* NEW SALES ORDER */}

                    <button
                        type="button"
                        onClick={handleCreateSalesOrder}
                        className="
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
                        title="New Sales Order"
                    >

                        <Plus size={14} />

                        <span>New</span>

                    </button>

                    {/* SETTINGS */}

                    <button
                        type="button"
                        onClick={() => navigate("/settings")}
                        className="
                            rounded-md
                            border
                            border-gray-300
                            p-2
                            text-[#0095FD]
                            hover:bg-[#0095FD]/20
                        "
                        title="Settings"
                    >
                        <Settings size={18} />
                    </button>

                </div>

            </div>

            {/* ================================================== */}
            {/* FILTER PANEL */}
            {/* ================================================== */}

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

                            <Filter size={17} className="text-[#0095FD]" />

                            <h3 className="text-sm font-semibold text-gray-800">
                                Filter Sales Orders
                            </h3>

                        </div>

                        <button
                            type="button"
                            onClick={() => setFilterOpen(false)}
                            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                            title="Close filters"
                        >
                            <X size={17} />
                        </button>

                    </div>

                    {/* FILTER INPUTS */}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                        {/* ORDER NUMBER */}

                        <div>

                            <label className={labelClass}>
                                Order Number
                            </label>

                            <input
                                type="text"
                                name="orderNo"
                                value={filters.orderNo}
                                onChange={handleFilterChange}
                                placeholder="Search order number"
                                className={inputClass}
                            />

                        </div>

                        {/* PARTY TYPE */}

                        <div>

                            <label className={labelClass}>
                                Party Type
                            </label>

                            <CustomSelect
                                name="partyType"
                                value={filters.partyType}
                                onChange={(value) =>
                                    handleFilterChange(
                                        "partyType",
                                        typeof value === "object" ? value.value : value?.toUpperCase()
                                    )
                                }
                                options={partyOptions}
                            />

                        </div>

                        {/* CUSTOMER ID */}

                        <div>

                            <label className={labelClass}>
                                Customer ID
                            </label>

                            <input
                                type="number"
                                min="1"
                                name="customerId"
                                value={filters.customerId}
                                onChange={handleFilterChange}
                                placeholder="Enter customer ID"
                                className={inputClass}
                            />

                        </div>

                        {/* PARTY ID */}

                        <div>

                            <label className={labelClass}>
                                Party ID
                            </label>

                            <input
                                type="number"
                                min="1"
                                name="partyId"
                                value={filters.partyId}
                                onChange={handleFilterChange}
                                placeholder="Enter party ID"
                                className={inputClass}
                            />

                        </div>

                        {/* WAREHOUSE ID */}

                        <div>

                            <label className={labelClass}>
                                Warehouse ID
                            </label>

                            <input
                                type="number"
                                min="1"
                                name="warehouseId"
                                value={filters.warehouseId}
                                onChange={handleFilterChange}
                                placeholder="Enter warehouse ID"
                                className={inputClass}
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

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">

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
