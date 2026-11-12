
import React, { useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import {
    ArrowLeft,
    Package,
    Warehouse,
    CalendarDays,
    FileText,
    Hash,
    Coins,
    Calculator,
    ClipboardList,
    ArrowDownToLine,
    ArrowUpFromLine,
    Boxes,
    Ruler,
    Layers,
    RefreshCw,
    PackageCheck,
    Tag,
    ArrowRightLeft,
} from "lucide-react";

import {
    fetchInventoryTransactionById,
} from "../../thunks/inventoryThunk";

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

const formatLabel = (value) => {
    if (!value) return "—";

    return String(value)
        .toLowerCase()
        .replaceAll("_", " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
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

const MovementBadge = ({ movementType }) => {

    const styles = {
        OPENING_STOCK: "bg-blue-100 text-blue-700",
        PURCHASE: "bg-green-100 text-green-700",
        PURCHASE_RETURN: "bg-red-100 text-red-700",
        SALES: "bg-purple-100 text-purple-700",
        SALES_RETURN: "bg-amber-100 text-amber-700",
        STOCK_ADJUSTMENT: "bg-orange-100 text-orange-700",
        TRANSFER_IN: "bg-green-100 text-green-700",
        TRANSFER_OUT: "bg-red-100 text-red-700",
    };

    return (
        <span className={`
            inline-flex rounded-full px-3 py-1
            text-xs font-semibold
            ${styles[movementType] || "bg-gray-100 text-gray-700"}
        `}>
            {formatLabel(movementType)}
        </span>
    );
};

// ------------------------------------------------------
// Main Component
// ------------------------------------------------------

const InventoryTransactionViewDetails = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { id } = useParams();

    const {
        transaction,
        transactionLoading,
        transactionError,
    } = useSelector((state) => state.inventory || {});

    // --------------------------------------------------
    // Fetch Transaction Details
    // --------------------------------------------------

    useEffect(() => {

        if (id) {
            dispatch(fetchInventoryTransactionById(id));
        }

    }, [
        dispatch,
        id,
    ]);

    // --------------------------------------------------
    // Prevent Stale Transaction Details
    // --------------------------------------------------

    const loaded =
        transaction &&
        String(transaction.id) === String(id);

    const data = loaded ? transaction : null;

    const audit = data?.audit;

    const unit = data?.unitShortName || data?.unitName || "";

    // --------------------------------------------------
    // Loading
    // --------------------------------------------------

    if (transactionLoading && !loaded) {

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
                        Loading inventory transaction details...
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

                <ArrowRightLeft
                    size={42}
                    className="text-gray-300"
                />

                <h2 className="
                    mt-3 text-lg font-semibold text-gray-700
                ">
                    Inventory Transaction Not Found
                </h2>

                <p className="
                    mt-1 text-sm text-gray-500
                ">
                    {transactionError || "Unable to load inventory transaction details."}
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
                                    {data.transactionNo || "Inventory Transaction"}
                                </h1>

                                <MovementBadge
                                    movementType={data.movementType}
                                />

                            </div>

                            <p className="
                                mt-1 text-sm text-gray-500
                            ">
                                Inventory Transaction Details
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

                        Transaction ID: {data.id}

                    </div>

                </div>

            </div>

            {/* Statistics Cards */}

            <div className="
                grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4
            ">

                <InfoCard
                    title="Quantity In"
                    value={`${formatNumber(data.quantityIn)} ${unit}`}
                    icon={ArrowDownToLine}
                    color="green"
                />

                <InfoCard
                    title="Quantity Out"
                    value={`${formatNumber(data.quantityOut)} ${unit}`}
                    icon={ArrowUpFromLine}
                    color="amber"
                />

                <InfoCard
                    title="Balance After"
                    value={`${formatNumber(data.balanceAfter)} ${unit}`}
                    icon={Boxes}
                    color="blue"
                />

                <InfoCard
                    title="Unit Cost"
                    value={formatCurrency(data.unitCost)}
                    icon={Coins}
                    color="purple"
                />

            </div>

            {/* Transaction Information */}

            <SectionCard
                title="Transaction Information"
                icon={ArrowRightLeft}
            >

                <div className="
                    grid grid-cols-1 gap-5
                    sm:grid-cols-2 lg:grid-cols-4
                ">

                    <ReadField
                        label="Transaction Number"
                        value={data.transactionNo}
                    />

                    <ReadField
                        label="Transaction ID"
                        value={data.id}
                    />

                    <ReadField
                        label="Movement Type"
                        value={
                            <MovementBadge
                                movementType={data.movementType}
                            />
                        }
                    />

                    <ReadField
                        label="Transaction Date"
                        value={formatDateTime(data.transactionDate)}
                    />

                    <ReadField
                        label="Reference Type"
                        value={formatLabel(data.referenceType)}
                    />

                    <ReadField
                        label="Reference ID"
                        value={data.referenceId}
                    />

                </div>

            </SectionCard>

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

            {/* Quantity Movement Information */}

            <SectionCard
                title="Quantity Movement Information"
                icon={Layers}
            >

                <div className="
                    grid grid-cols-1 gap-5
                    sm:grid-cols-2 lg:grid-cols-4
                ">

                    <ReadField
                        label="Quantity In"
                        value={`${formatNumber(data.quantityIn)} ${unit}`}
                    />

                    <ReadField
                        label="Quantity Out"
                        value={`${formatNumber(data.quantityOut)} ${unit}`}
                    />

                    <ReadField
                        label="Balance After Transaction"
                        value={`${formatNumber(data.balanceAfter)} ${unit}`}
                    />

                    <ReadField
                        label="Unit Cost"
                        value={formatCurrency(data.unitCost)}
                    />

                </div>

                {/* Movement Summary */}

                <div className="
                    mt-6 rounded-xl border border-gray-100
                    bg-gray-50 p-4
                ">

                    <h3 className="
                        mb-4 text-sm font-semibold text-gray-700
                    ">
                        Stock Movement Summary
                    </h3>

                    <div className="
                        grid grid-cols-1 gap-4 sm:grid-cols-3
                    ">

                        <div>
                            <p className="text-xs text-gray-500">
                                Incoming Stock
                            </p>

                            <p className="
                                mt-1 text-lg font-bold text-green-600
                            ">
                                +{formatNumber(data.quantityIn)} {unit}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500">
                                Outgoing Stock
                            </p>

                            <p className="
                                mt-1 text-lg font-bold text-red-600
                            ">
                                -{formatNumber(data.quantityOut)} {unit}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500">
                                Closing Balance
                            </p>

                            <p className="
                                mt-1 text-lg font-bold text-blue-600
                            ">
                                {formatNumber(data.balanceAfter)} {unit}
                            </p>
                        </div>

                    </div>

                </div>

            </SectionCard>

            {/* Cost Information */}

            <SectionCard
                title="Cost Information"
                icon={Calculator}
            >

                <div className="
                    grid grid-cols-1 gap-5
                    sm:grid-cols-2 lg:grid-cols-4
                ">

                    <ReadField
                        label="Unit Cost"
                        value={formatCurrency(data.unitCost)}
                    />

                    <ReadField
                        label="Quantity In"
                        value={formatNumber(data.quantityIn)}
                    />

                    <ReadField
                        label="Quantity Out"
                        value={formatNumber(data.quantityOut)}
                    />

                    <ReadField
                        label="Incoming Transaction Value"
                        value={
                            data.unitCost != null &&
                                data.quantityIn != null
                                ? formatCurrency(
                                    Number(data.unitCost) *
                                    Number(data.quantityIn)
                                )
                                : "—"
                        }
                    />

                </div>

            </SectionCard>

            {/* Notes */}

            <SectionCard
                title="Transaction Notes"
                icon={ClipboardList}
            >

                <p className="
                    whitespace-pre-wrap break-words
                    text-sm leading-6 text-gray-700
                ">
                    {data.notes || "No notes available for this transaction."}
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

export default InventoryTransactionViewDetails;
