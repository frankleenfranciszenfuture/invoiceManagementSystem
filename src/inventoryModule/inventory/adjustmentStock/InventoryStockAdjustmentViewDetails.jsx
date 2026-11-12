
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    ArrowDownToLine,
    ArrowUpFromLine,
    CalendarDays,
    FileText,
    Package,
    Warehouse,
    Ruler,
    Calculator,
    Hash,
    AlertCircle,
    RefreshCw,
} from "lucide-react";

import { fetchInventoryTransactionById } from "../../thunks/inventoryThunk";

const ADJUSTMENT_TYPES = [
    "STOCK_ADJUSTMENT_IN",
    "STOCK_ADJUSTMENT_OUT",
];

const formatNumber = (value) =>
    Number(value || 0).toLocaleString("en-IN", {
        maximumFractionDigits: 4,
    });

const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(value || 0));

const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const DetailField = ({ label, value, icon: Icon }) => (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
            {Icon && <Icon size={14} />}
            {label}
        </div>

        <p className="mt-2 break-words text-sm font-semibold text-gray-800">
            {value ?? "-"}
        </p>
    </div>
);

const Section = ({ title, description, icon: Icon, children }) => (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Icon size={19} />
            </div>

            <div>
                <h2 className="text-base font-semibold text-gray-800">
                    {title}
                </h2>

                {description && (
                    <p className="mt-1 text-sm text-gray-500">
                        {description}
                    </p>
                )}
            </div>
        </div>

        {children}
    </section>
);

const InventoryStockAdjustmentViewDetails = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();

    const {
        transaction,
        transactionLoading,
        transactionError,
    } = useSelector((state) => state.inventory || {});

    const loaded =
        transaction && String(transaction.id) === String(id);

    const data = loaded ? transaction : null;

    const isAdjustment =
        data && ADJUSTMENT_TYPES.includes(data.movementType);

    useEffect(() => {
        if (id) {
            dispatch(fetchInventoryTransactionById(id));
        }
    }, [dispatch, id]);

    const isIncrease =
        data?.movementType === "STOCK_ADJUSTMENT_IN";

    const adjustmentQuantity = isIncrease
        ? data?.quantityIn
        : data?.quantityOut;

    const totalAdjustmentValue =
        Number(adjustmentQuantity || 0) *
        Number(data?.unitCost || 0);

    const handleBack = () => navigate(-1);

    if (transactionLoading && !data) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center bg-gray-50">
                <div className="h-9 w-9 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" />
            </div>
        );
    }

    if (transactionError && !data) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center bg-gray-50 p-5">
                <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
                        <AlertCircle size={23} />
                    </div>

                    <h2 className="text-lg font-semibold text-gray-800">
                        Unable to load adjustment
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                        {transactionError}
                    </p>

                    <div className="mt-5 flex justify-center gap-2">
                        <button
                            type="button"
                            onClick={() => dispatch(fetchInventoryTransactionById(id))}
                            className="inline-flex items-center gap-2 rounded-lg bg-[#408DFB] px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-600"
                        >
                            <RefreshCw size={15} />
                            Retry
                        </button>

                        <button
                            type="button"
                            onClick={handleBack}
                            className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center bg-gray-50 p-5">
                <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
                    <Package className="mx-auto mb-3 text-gray-400" size={30} />

                    <h2 className="text-lg font-semibold text-gray-800">
                        Adjustment not found
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        The requested inventory transaction could not be found.
                    </p>

                    <button
                        type="button"
                        onClick={handleBack}
                        className="mt-5 rounded-lg bg-[#408DFB] px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-600"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    if (!isAdjustment) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center bg-gray-50 p-5">
                <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
                    <AlertCircle className="mx-auto mb-3 text-orange-500" size={30} />

                    <h2 className="text-lg font-semibold text-gray-800">
                        Not a stock adjustment
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        This transaction is not a stock increase or stock decrease adjustment.
                    </p>

                    <button
                        type="button"
                        onClick={handleBack}
                        className="mt-5 rounded-lg bg-[#408DFB] px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-600"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-3 sm:p-5">
            {/* Header */}
            <div className="mb-5 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={handleBack}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50"
                            title="Go back"
                        >
                            <ArrowLeft size={18} />
                        </button>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <FileText size={21} />
                        </div>

                        <div>
                            <h1 className="text-lg font-semibold text-gray-800">
                                Stock Adjustment Details
                            </h1>
                            <p className="mt-0.5 text-sm text-gray-500">
                                Transaction #{data.transactionNo || data.id}
                            </p>
                        </div>
                    </div>

                    <span
                        className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold ${isIncrease
                            ? "bg-green-50 text-green-700"
                            : "bg-orange-50 text-orange-700"
                            }`}
                    >
                        {isIncrease ? (
                            <ArrowDownToLine size={16} />
                        ) : (
                            <ArrowUpFromLine size={16} />
                        )}

                        {isIncrease ? "Stock Increase" : "Stock Decrease"}
                    </span>
                </div>
            </div>

            <div className="mx-auto max-w-7xl space-y-5">
                {/* Adjustment Summary */}
                <Section
                    title="Adjustment Summary"
                    description="Overview of the selected stock adjustment."
                    icon={Calculator}
                >
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <DetailField
                            label="Transaction Number"
                            value={data.transactionNo}
                            icon={Hash}
                        />

                        <DetailField
                            label="Adjustment Type"
                            value={isIncrease ? "Stock Increase" : "Stock Decrease"}
                            icon={isIncrease ? ArrowDownToLine : ArrowUpFromLine}
                        />

                        <DetailField
                            label="Adjustment Date"
                            value={formatDate(data.transactionDate)}
                            icon={CalendarDays}
                        />

                        <DetailField
                            label="Reference Type"
                            value={data.referenceType || "-"}
                            icon={FileText}
                        />
                    </div>
                </Section>

                {/* Product Details */}
                <Section
                    title="Product Details"
                    description="Product and measurement information for this adjustment."
                    icon={Package}
                >
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <DetailField
                            label="Product Name"
                            value={data.productName}
                        />

                        <DetailField
                            label="Product Code"
                            value={data.productCode}
                        />

                        <DetailField
                            label="Unit"
                            value={
                                data.unitName
                                    ? `${data.unitName}${data.unitShortName ? ` (${data.unitShortName})` : ""}`
                                    : "-"
                            }
                            icon={Ruler}
                        />

                        <DetailField
                            label="Size"
                            value={data.sizeName || "-"}
                        />
                    </div>
                </Section>

                {/* Warehouse Details */}
                <Section
                    title="Warehouse Details"
                    description="Warehouse where the adjustment was recorded."
                    icon={Warehouse}
                >
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <DetailField
                            label="Warehouse Name"
                            value={data.warehouseName}
                        />

                        <DetailField
                            label="Warehouse Code"
                            value={data.warehouseCode || "-"}
                        />

                        <DetailField
                            label="Warehouse ID"
                            value={data.warehouseId}
                        />
                    </div>
                </Section>

                {/* Quantity Details */}
                <Section
                    title="Quantity & Cost Details"
                    description="Stock movement and valuation for this adjustment."
                    icon={Calculator}
                >
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <DetailField
                            label="Adjustment Quantity"
                            value={`${formatNumber(adjustmentQuantity)} ${data.unitShortName || ""}`}
                        />

                        <DetailField
                            label="Quantity In"
                            value={formatNumber(data.quantityIn)}
                        />

                        <DetailField
                            label="Quantity Out"
                            value={formatNumber(data.quantityOut)}
                        />

                        <DetailField
                            label="Balance After"
                            value={`${formatNumber(data.balanceAfter)} ${data.unitShortName || ""}`}
                        />

                        <DetailField
                            label="Unit Cost"
                            value={formatCurrency(data.unitCost)}
                        />

                        <DetailField
                            label="Total Adjustment Value"
                            value={formatCurrency(totalAdjustmentValue)}
                        />

                        <DetailField
                            label="Reference ID"
                            value={data.referenceId ?? "-"}
                        />

                        <DetailField
                            label="Movement Type"
                            value={data.movementType}
                        />
                    </div>
                </Section>

                {/* Notes */}
                <Section
                    title="Notes"
                    description="Reason or additional information recorded for this adjustment."
                    icon={FileText}
                >
                    <div className="min-h-20 rounded-lg border border-gray-100 bg-gray-50 p-4">
                        <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
                            {data.notes || "No notes provided."}
                        </p>
                    </div>
                </Section>

                <div className="flex justify-end pb-5">
                    <button
                        type="button"
                        onClick={handleBack}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                    >
                        <ArrowLeft size={16} />
                        Back to Adjustments
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InventoryStockAdjustmentViewDetails;
