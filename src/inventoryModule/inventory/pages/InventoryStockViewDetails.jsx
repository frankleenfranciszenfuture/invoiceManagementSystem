
import React, { useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import {
    ArrowLeft,
    Package,
    Warehouse,
    Ruler,
    Layers,
    Boxes,
    Hash,
    Calculator,
    ClipboardList,
    FileText,
    PackageCheck,
    PackageOpen,
    TrendingUp,
    Coins,
    Box,
} from "lucide-react";

import { fetchStockById } from "../../thunks/inventoryThunk";

// ------------------------------------------------------
// Helpers
// ------------------------------------------------------

const formatDateTime = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return date;
    }

    return parsedDate.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const formatNumber = (value, decimals = 4) => {
    if (value === null || value === undefined || value === "") {
        return "—";
    }

    return Number(value).toLocaleString("en-IN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals,
    });
};

const formatCurrency = (value) => {
    if (value === null || value === undefined || value === "") {
        return "—";
    }

    return `₹ ${formatNumber(value, 2)}`;
};

// ------------------------------------------------------
// Reusable Components
// ------------------------------------------------------

const SectionCard = ({ title, icon: Icon, children }) => {
    return (
        <section className="
            overflow-hidden rounded-xl border
            border-gray-200 bg-white shadow-sm
        ">
            <div className="
                flex items-center gap-2 border-b
                border-gray-100 px-5 py-4
            ">
                {Icon && (
                    <div className="
                        flex h-9 w-9 items-center justify-center
                        rounded-lg bg-blue-50 text-blue-600
                    ">
                        <Icon size={18} />
                    </div>
                )}

                <h2 className="
                    text-sm font-semibold text-gray-800
                ">
                    {title}
                </h2>
            </div>

            <div className="p-5">
                {children}
            </div>
        </section>
    );
};

const ReadField = ({ label, value }) => {
    return (
        <div className="min-w-0">
            <p className="
                mb-1 text-xs font-medium text-gray-400
            ">
                {label}
            </p>

            <div className="
                break-words text-sm font-medium text-gray-700
            ">
                {value === null ||
                    value === undefined ||
                    value === ""
                    ? "—"
                    : value}
            </div>
        </div>
    );
};

const InfoCard = ({ title, value, icon: Icon, color }) => {

    const styles = {
        blue: "bg-blue-50 text-blue-600",
        green: "bg-green-50 text-green-600",
        purple: "bg-purple-50 text-purple-600",
        amber: "bg-amber-50 text-amber-600",
    };

    return (
        <div className="
            rounded-xl border border-gray-200
            bg-white p-4 shadow-sm transition hover:shadow-md
        ">
            <div className="
                flex items-center justify-between gap-3
            ">
                <div className="min-w-0">
                    <p className="
                        text-xs font-medium uppercase
                        tracking-wide text-gray-500
                    ">
                        {title}
                    </p>

                    <p className="
                        mt-2 truncate text-lg font-bold text-gray-800
                    ">
                        {value ?? "—"}
                    </p>
                </div>

                <div className={`
                    flex h-10 w-10 shrink-0 items-center
                    justify-center rounded-lg
                    ${styles[color] || styles.blue}
                `}>
                    <Icon size={20} />
                </div>
            </div>
        </div>
    );
};

const QuantityBadge = ({ value, label, color = "blue" }) => {

    const styles = {
        blue: "bg-blue-50 text-blue-700",
        green: "bg-green-50 text-green-700",
        amber: "bg-amber-50 text-amber-700",
        red: "bg-red-50 text-red-700",
    };

    return (
        <span className={`
            inline-flex items-center gap-1 rounded-full
            px-3 py-1 text-xs font-semibold
            ${styles[color] || styles.blue}
        `}>
            {label}: {formatNumber(value)}
        </span>
    );
};

// ------------------------------------------------------
// Main Component
// ------------------------------------------------------

const InventoryStockViewDetails = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { id } = useParams();

    const {
        stock,
        stockLoading,
        stockError,
    } = useSelector((state) => state.inventory || {});

    // --------------------------------------------------
    // Fetch Stock Details
    // --------------------------------------------------

    useEffect(() => {

        if (id) {
            dispatch(fetchStockById(id));
        }

    }, [
        dispatch,
        id,
    ]);

    // --------------------------------------------------
    // Prevent Displaying Stale Stock Details
    // --------------------------------------------------

    const loaded =
        stock &&
        String(stock.id) === String(id);

    const data = loaded ? stock : null;

    const audit = data?.audit;
    // --------------------------------------------------
    // Loading
    // --------------------------------------------------

    if (stockLoading && !loaded) {

        return (
            <div className="
                flex min-h-[400px] items-center justify-center
            ">
                <div className="text-center">

                    <div className="
                        mx-auto h-9 w-9 animate-spin rounded-full
                        border-4 border-blue-100 border-t-blue-600
                    " />

                    <p className="
                        mt-3 text-sm text-gray-500
                    ">
                        Loading inventory stock details...
                    </p>

                </div>
            </div>
        );
    }

    // --------------------------------------------------
    // Error / Not Found
    // --------------------------------------------------

    if (!loaded) {

        return (
            <div className="
                flex min-h-[400px] flex-col items-center justify-center
            ">

                <Package
                    size={42}
                    className="text-gray-300"
                />

                <h2 className="
                    mt-3 text-lg font-semibold text-gray-700
                ">
                    Inventory Stock Not Found
                </h2>

                <p className="
                    mt-1 text-sm text-gray-500
                ">
                    {stockError || "Unable to load inventory stock details."}
                </p>

                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="
                        mt-5 flex items-center gap-2 rounded-lg
                        bg-blue-600 px-4 py-2 text-sm font-medium
                        text-white transition hover:bg-blue-700
                    "
                >
                    <ArrowLeft size={16} />
                    Go Back
                </button>

            </div>
        );
    }

    // --------------------------------------------------
    // Render
    // --------------------------------------------------

    return (

        <div className="mt-3 space-y-6 pb-8">

            {/* Header */}

            <div className="
                rounded-xl border border-gray-100
                bg-white p-5 shadow-sm
            ">

                <div className="
                    flex flex-col justify-between gap-4
                    lg:flex-row lg:items-center
                ">

                    <div className="
                        flex items-start gap-3
                    ">

                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            title="Go back"
                            className="
                                mt-1 flex h-9 w-9 shrink-0
                                items-center justify-center rounded-lg
                                border border-gray-200 bg-white
                                text-gray-600 transition hover:bg-gray-50
                            "
                        >
                            <ArrowLeft size={18} />
                        </button>

                        <div>

                            <div className="
                                flex flex-wrap items-center gap-3
                            ">

                                <h1 className="
                                    text-xl font-bold text-gray-800
                                ">
                                    {data.productName || "Inventory Stock Details"}
                                </h1>

                                <span className="
                                    inline-flex rounded-full px-3 py-1
                                    text-xs font-semibold
                                    bg-green-100 text-green-700
                                ">
                                    Stock Available
                                </span>

                            </div>

                            <p className="
                                mt-1 text-sm text-gray-500
                            ">
                                Inventory Stock Details
                            </p>

                        </div>

                    </div>

                    <div className="
                        flex items-center gap-2 rounded-lg
                        border border-gray-200 bg-white
                        px-3 py-2 text-sm text-gray-600
                    ">
                        <Hash
                            size={16}
                            className="text-gray-400"
                        />

                        Stock ID: {data.id}
                    </div>

                </div>

            </div>

            {/* Statistics Cards */}

            <div className="
                grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4
            ">

                <InfoCard
                    title="Total Quantity"
                    value={formatNumber(data.quantity)}
                    icon={Boxes}
                    color="blue"
                />

                <InfoCard
                    title="Reserved Quantity"
                    value={formatNumber(data.reservedQuantity)}
                    icon={PackageOpen}
                    color="amber"
                />

                <InfoCard
                    title="Available Quantity"
                    value={formatNumber(data.availableQuantity)}
                    icon={PackageCheck}
                    color="green"
                />

                <InfoCard
                    title="Average Cost"
                    value={formatCurrency(data.averageCost)}
                    icon={Coins}
                    color="purple"
                />

            </div>

            {/* Product Information */}

            <SectionCard
                title="Product Information"
                icon={Package}
            >

                <div className="
                    grid grid-cols-1 gap-5
                    sm:grid-cols-2 lg:grid-cols-4
                ">

                    <ReadField
                        label="Product Name"
                        value={data.productName}
                    />

                    <ReadField
                        label="Product Code"
                        value={data.productCode}
                    />

                    <ReadField
                        label="Product ID"
                        value={data.productId}
                    />

                    <ReadField
                        label="Stock ID"
                        value={data.id}
                    />

                </div>

            </SectionCard>

            {/* Warehouse Information */}

            <SectionCard
                title="Warehouse Information"
                icon={Warehouse}
            >

                <div className="
                    grid grid-cols-1 gap-5
                    sm:grid-cols-2 lg:grid-cols-4
                ">

                    <ReadField
                        label="Warehouse Name"
                        value={data.warehouseName}
                    />

                    <ReadField
                        label="Warehouse Code"
                        value={data.warehouseCode}
                    />

                    <ReadField
                        label="Warehouse ID"
                        value={data.warehouseId}
                    />

                </div>

            </SectionCard>

            {/* Unit and Size Information */}

            <SectionCard
                title="Unit and Size Information"
                icon={Ruler}
            >

                <div className="
                    grid grid-cols-1 gap-5
                    sm:grid-cols-2 lg:grid-cols-4
                ">

                    <ReadField
                        label="Unit Name"
                        value={data.unitName}
                    />

                    <ReadField
                        label="Unit Short Name"
                        value={data.unitShortName}
                    />

                    <ReadField
                        label="Unit ID"
                        value={data.unitId}
                    />

                    <ReadField
                        label="Size Name"
                        value={data.sizeName}
                    />

                    <ReadField
                        label="Size ID"
                        value={data.sizeId}
                    />

                </div>

            </SectionCard>

            {/* Stock Quantity Information */}

            <SectionCard
                title="Stock Quantity Information"
                icon={Layers}
            >

                <div className="
                    grid grid-cols-1 gap-5
                    sm:grid-cols-2 lg:grid-cols-4
                ">

                    <ReadField
                        label="Total Quantity"
                        value={`${formatNumber(data.quantity)} ${data.unitShortName || data.unitName || ""}`}
                    />

                    <ReadField
                        label="Reserved Quantity"
                        value={`${formatNumber(data.reservedQuantity)} ${data.unitShortName || data.unitName || ""}`}
                    />

                    <ReadField
                        label="Available Quantity"
                        value={`${formatNumber(data.availableQuantity)} ${data.unitShortName || data.unitName || ""}`}
                    />

                    <ReadField
                        label="Average Cost"
                        value={formatCurrency(data.averageCost)}
                    />

                </div>

                {/* Quantity Badges */}

                <div className="
                    mt-6 flex flex-wrap gap-2 border-t
                    border-gray-100 pt-5
                ">

                    <QuantityBadge
                        label="Total"
                        value={data.quantity}
                        color="blue"
                    />

                    <QuantityBadge
                        label="Reserved"
                        value={data.reservedQuantity}
                        color="amber"
                    />

                    <QuantityBadge
                        label="Available"
                        value={data.availableQuantity}
                        color="green"
                    />

                </div>

            </SectionCard>

            {/* Stock Valuation Information */}

            <SectionCard
                title="Stock Valuation Information"
                icon={Calculator}
            >

                <div className="
                    grid grid-cols-1 gap-5
                    sm:grid-cols-2 lg:grid-cols-4
                ">

                    <ReadField
                        label="Average Cost Per Unit"
                        value={formatCurrency(data.averageCost)}
                    />

                    <ReadField
                        label="Total Stock Quantity"
                        value={formatNumber(data.quantity)}
                    />

                    <ReadField
                        label="Estimated Stock Value"
                        value={
                            data.averageCost != null &&
                                data.quantity != null
                                ? formatCurrency(
                                    Number(data.averageCost) *
                                    Number(data.quantity)
                                )
                                : "—"
                        }
                    />

                    <ReadField
                        label="Available Stock Value"
                        value={
                            data.averageCost != null &&
                                data.availableQuantity != null
                                ? formatCurrency(
                                    Number(data.averageCost) *
                                    Number(data.availableQuantity)
                                )
                                : "—"
                        }
                    />

                </div>

                <p className="
                    mt-4 text-xs text-gray-400
                ">
                    Stock valuation is an estimate based on the current average cost.
                </p>

            </SectionCard>

            {/* Audit Information */}

            <SectionCard
                title="Audit Information"
                icon={FileText}
            >

                <div className="
                    grid grid-cols-1 gap-5
                    sm:grid-cols-2 lg:grid-cols-4
                ">

                    <ReadField
                        label="Created At"
                        value={formatDateTime(audit?.createdAt)}
                    />

                    <ReadField
                        label="Updated At"
                        value={formatDateTime(audit?.updatedAt)}
                    />

                    <ReadField
                        label="Created By"
                        value={audit?.createdBy}
                    />

                    <ReadField
                        label="Updated By"
                        value={audit?.updatedBy}
                    />

                    <ReadField
                        label="Active"
                        value={
                            audit?.active === true
                                ? "Yes"
                                : audit?.active === false
                                    ? "No"
                                    : "—"
                        }
                    />

                </div>

            </SectionCard>

        </div>
    );
};

export default InventoryStockViewDetails;
