import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import {
    ArrowLeft,
    Pencil,
    ShoppingCart,
    CalendarDays,
    Warehouse,
    UserRound,
    Package,
    MapPin,
    Building2,
    CreditCard,
    FileText,
    Receipt,
    RefreshCw,
    Truck,
    CheckCircle,
    Clock,
    Wallet,
    PackageCheck
} from "lucide-react";

import {
    fetchPurchaseOrderById,
} from "../thunks/purchaseOrderThunks";

import {
    setPurchaseOrder,
} from "../slices/purchaseOrderSlice";

// ============================================================
// HELPERS
// ============================================================

const pick = (...values) =>
    values.find(
        (value) =>
            value !== undefined &&
            value !== null &&
            value !== ""
    );

const number = (value) => {
    const result = Number(value ?? 0);
    return Number.isFinite(result) ? result : 0;
};

const formatAmount = (value, order) => {
    const amount = number(value);

    const currencyCode =
        order?.currencyCode ||
        order?.currency?.currencyCode ||
        "INR";

    try {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: currencyCode,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    } catch {
        return `${currencyCode} ${amount.toFixed(2)}`;
    }
};

const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) {
        return date;
    }

    return parsedDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const formatQuantity = (value) =>
    number(value).toLocaleString("en-IN", {
        maximumFractionDigits: 4,
    });

const getSupplierName = (order) => {
    const party = order?.party || order?.supplier;

    return (
        party?.companyName ||
        party?.displayName ||
        party?.partyName ||
        [
            party?.firstName,
            party?.lastName,
        ].filter(Boolean).join(" ") ||
        order?.supplierName ||
        "—"
    );
};

const getStatus = (order) =>
    String(
        order?.purchaseOrderStatus ||
        order?.status ||
        "DRAFT"
    ).toUpperCase();

const getDefaultAddress = (party) => {
    const addresses = Array.isArray(party?.addresses)
        ? party.addresses
        : [];

    return (
        addresses.find((address) => address.defaultAddress) ||
        addresses[0] ||
        null
    );
};

const getPrimaryBank = (party) => {
    const accounts = Array.isArray(party?.bankAccounts)
        ? party.bankAccounts
        : [];

    return (
        accounts.find((account) => account.primaryAccount) ||
        accounts[0] ||
        null
    );
};

// ============================================================
// REUSABLE COMPONENTS
// ============================================================

const SectionCard = ({ title, icon: Icon, children, right }) => (
    <section className="rounded-xl border border-gray-200 bg-white shadow-sm">

        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">

            <div className="flex items-center gap-2">
                {Icon && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#0095FD]">
                        <Icon size={17} />
                    </div>
                )}

                <h3 className="text-sm font-semibold text-gray-800">
                    {title}
                </h3>
            </div>

            {right}

        </div>

        <div className="p-5">
            {children}
        </div>

    </section>
);

const ReadField = ({
    label,
    value,
    className = "",
}) => (
    <div className={`min-w-0 ${className}`}>

        <p className="mb-1 text-xs font-medium text-gray-500">
            {label}
        </p>

        <p className="break-words text-sm font-medium text-gray-800">
            {value !== undefined &&
                value !== null &&
                value !== ""
                ? value
                : "—"}
        </p>

    </div>
);

const StatusBadge = ({ status }) => {

    const colors = {
        DRAFT: "bg-yellow-50 text-yellow-700 border-yellow-200",
        CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",
        PARTIALLY_RECEIVED: "bg-amber-50 text-amber-700 border-amber-200",
        RECEIVED: "bg-green-50 text-green-700 border-green-200",
        CANCELLED: "bg-red-50 text-red-700 border-red-200",
    };

    const icons = {
        DRAFT: Clock,
        CONFIRMED: CheckCircle,
        PARTIALLY_RECEIVED: Truck,
        RECEIVED: CheckCircle,
        CANCELLED: Clock,
    };

    const Icon = icons[status] || Clock;

    return (
        <span
            className={`
                inline-flex items-center gap-1.5
                rounded-full border px-3 py-1.5
                text-xs font-semibold
                ${colors[status] || "bg-gray-50 text-gray-600 border-gray-200"}
            `}
        >
            <Icon size={13} />
            {status?.replaceAll("_", " ") || "DRAFT"}
        </span>
    );
};

const SummaryTile = ({
    label,
    value,
    highlight = false,
}) => (
    <div
        className={`
            rounded-xl border p-4
            ${highlight
                ? "border-blue-100 bg-blue-50"
                : "border-gray-100 bg-gray-50/70"
            }
        `}
    >

        <p className="text-xs font-medium text-gray-500">
            {label}
        </p>

        <p
            className={`
                mt-2 text-lg font-semibold
                ${highlight ? "text-blue-700" : "text-gray-800"}
            `}
        >
            {value}
        </p>

    </div>
);

// ============================================================
// PAGE
// ============================================================

export default function PurchaseOrderViewDetails() {

    const { id } = useParams();

    const dispatch = useDispatch();
    const navigate = useNavigate();

    // ========================================================
    // REDUX STATE
    // ========================================================

    const {
        purchaseOrder,
        loading,
        error,
    } = useSelector((state) => state.purchaseOrder);

    // Ignore previous purchase order data
    const loaded =
        purchaseOrder &&
        String(purchaseOrder.id) === String(id);

    // ========================================================
    // FETCH PURCHASE ORDER BY ID
    // ========================================================

    useEffect(() => {

        if (id) {
            dispatch(fetchPurchaseOrderById(id));
        }

    }, [id, dispatch]);

    // ========================================================
    // ACTIONS
    // ========================================================

    const handleBack = () => {
        navigate("/inventory/purchaseOrder");
    };

    const handleEdit = () => {

        if (!loaded) return;

        if (getStatus(purchaseOrder) !== "DRAFT") {
            return;
        }

        dispatch(setPurchaseOrder(purchaseOrder));

        navigate(`/inventory/purchaseOrder/edit/${purchaseOrder.id}`);
    };

    const handleRefresh = () => {
        if (id) {
            dispatch(fetchPurchaseOrderById(id));
        }
    };

    // ========================================================
    // LOADING / ERROR
    // ========================================================

    if (!loaded) {

        return (
            <div className="flex min-h-[350px] flex-col items-center justify-center gap-4">

                {loading ? (
                    <>
                        <RefreshCw
                            size={28}
                            className="animate-spin text-[#0095FD]"
                        />

                        <p className="text-sm text-gray-500">
                            Loading purchase order details...
                        </p>
                    </>
                ) : (
                    <>
                        <p className="text-sm text-red-500">
                            {error || "Purchase order not found."}
                        </p>

                        <div className="flex gap-2">

                            <button
                                type="button"
                                onClick={handleRefresh}
                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                            >
                                Try Again
                            </button>

                            <button
                                type="button"
                                onClick={handleBack}
                                className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                            >
                                Back
                            </button>

                        </div>
                    </>
                )}

            </div>
        );
    }

    // ========================================================
    // PURCHASE ORDER DATA
    // ========================================================

    const order = purchaseOrder;

    const party = order.party || order.supplier || {};

    const address = getDefaultAddress(party);

    const bank = getPrimaryBank(party);

    const items = Array.isArray(order.items)
        ? order.items
        : [];

    const status = getStatus(order);

    const isDraft = status === "DRAFT";


    const receivedAmount = Number(purchaseOrder?.receivedTotalAmount || 0);
    const grandTotal = Number(purchaseOrder?.grandTotal || 0);

    const pendingAmount = Math.max(
        grandTotal - receivedAmount,
        0
    );

    const statsCards = [
        {
            title: "Grand Total",
            value: formatAmount(purchaseOrder.grandTotal, purchaseOrder),
            description: "Purchase order value",
            icon: Wallet,
            color: "blue",
        },
        {
            title: "Received Amount",
            value: formatAmount(purchaseOrder.receivedTotalAmount, purchaseOrder),
            description: "Goods received value",
            icon: PackageCheck,
            color: "green",
        },
        {
            title: "Pending Amount",
            value: formatAmount(pendingAmount, purchaseOrder),
            description: "Remaining order value",
            icon: Clock,
            color: "amber",
        },
        {
            title: "Total Tax",
            value: formatAmount(purchaseOrder.totalTaxAmount, purchaseOrder),
            description: "Total GST amount",
            icon: Receipt,
            color: "purple",
        },
    ];

    const colorStyles = {
        blue: {
            icon: "bg-blue-50 text-blue-600",
            value: "text-blue-700",
        },
        green: {
            icon: "bg-green-50 text-green-600",
            value: "text-green-700",
        },
        amber: {
            icon: "bg-amber-50 text-amber-600",
            value: "text-amber-700",
        },
        purple: {
            icon: "bg-purple-50 text-purple-600",
            value: "text-purple-700",
        },
    };
    // ========================================================
    // RENDER
    // ========================================================

    return (

        <div className="space-y-4 p-3">

            {/* =================================================
                TOP HEADER
            ================================================= */}

            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">

                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

                    <div className="flex min-w-0 items-start gap-3">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <ShoppingCart size={24} />
                        </div>

                        <div className="min-w-0">

                            <div className="flex flex-wrap items-center gap-3">

                                <h2 className="text-xl font-semibold text-[#12203F]">
                                    Purchase Order Details
                                </h2>

                                <StatusBadge status={status} />

                            </div>

                            <p className="mt-1 text-sm text-gray-500">
                                {order.orderNo || "—"}
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                                Manage and review purchase order information.
                            </p>

                        </div>

                    </div>

                    <div className="flex flex-wrap items-center gap-2">

                        <button
                            type="button"
                            onClick={handleBack}
                            className="
                                flex items-center gap-2
                                rounded-lg border border-gray-200
                                px-4 py-2.5 text-sm font-medium
                                text-gray-600 transition
                                hover:bg-gray-50
                            "
                        >
                            <ArrowLeft size={15} />
                            Back
                        </button>

                        <button
                            type="button"
                            onClick={handleRefresh}
                            disabled={loading}
                            className="
                                flex items-center gap-2
                                rounded-lg border border-gray-200
                                px-4 py-2.5 text-sm font-medium
                                text-gray-600 transition
                                hover:bg-gray-50
                                disabled:opacity-50
                            "
                        >
                            <RefreshCw
                                size={15}
                                className={loading ? "animate-spin" : ""}
                            />
                            Refresh
                        </button>

                        {isDraft && (
                            <button
                                type="button"
                                onClick={handleEdit}
                                className="
                                    flex items-center gap-2
                                    rounded-lg bg-[#0095FD]
                                    px-4 py-2.5 text-sm font-medium
                                    text-white transition
                                    hover:bg-[#0085E5]
                                "
                            >
                                <Pencil size={15} />
                                Edit Purchase Order
                            </button>
                        )}

                    </div>

                </div>

            </div>

            {/* =================================================
                ORDER SUMMARY
            ================================================= */}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

                <SummaryTile
                    label="Order Number"
                    value={order.orderNo}
                />

                <SummaryTile
                    label="Order Date"
                    value={formatDate(order.orderDate)}
                />

                <SummaryTile
                    label="Expected Delivery"
                    value={formatDate(order.expectedDeliveryDate)}
                />

                <SummaryTile
                    label="Grand Total"
                    value={formatAmount(order.grandTotal, order)}
                    highlight
                />

            </div>

            {/* =================================================
                PURCHASE ORDER INFORMATION
            ================================================= */}

            <SectionCard
                title="Purchase Order Information"
                icon={FileText}
            >

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

                    <ReadField
                        label="Purchase Order ID"
                        value={`#${order.id}`}
                    />

                    <ReadField
                        label="Order Number"
                        value={order.orderNo}
                    />

                    <ReadField
                        label="Order Date"
                        value={formatDate(order.orderDate)}
                    />

                    <ReadField
                        label="Expected Delivery Date"
                        value={formatDate(order.expectedDeliveryDate)}
                    />

                    <ReadField
                        label="Purchase Order Status"
                        value={status.replaceAll("_", " ")}
                    />

                    <ReadField
                        label="Warehouse ID"
                        value={order.warehouseId}
                    />

                    <ReadField
                        label="Warehouse Name"
                        value={order.warehouseName}
                    />

                    <ReadField
                        label="Supplier Code"
                        value={order.partyCode}
                    />

                </div>

                <div className="mt-5 border-t border-gray-100 pt-4">

                    <ReadField
                        label="Notes"
                        value={order.notes}
                    />

                </div>

            </SectionCard>

            {/* =================================================
                SUPPLIER INFORMATION
            ================================================= */}

            <SectionCard
                title="Supplier Information"
                icon={UserRound}
            >

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

                    <ReadField
                        label="Supplier Name"
                        value={getSupplierName(order)}
                    />

                    <ReadField
                        label="Party Code"
                        value={party.partyCode || order.partyCode}
                    />

                    <ReadField
                        label="Party Type"
                        value={party.partyType}
                    />

                    <ReadField
                        label="Contact Person"
                        value={party.contactPerson}
                    />

                    <ReadField
                        label="Email"
                        value={party.email}
                    />

                    <ReadField
                        label="Mobile"
                        value={party.mobile}
                    />

                    <ReadField
                        label="Alternate Mobile"
                        value={party.alternateMobile}
                    />

                    <ReadField
                        label="GST Number"
                        value={party.gstNumber}
                    />

                    <ReadField
                        label="PAN Number"
                        value={party.panNumber}
                    />

                    <ReadField
                        label="Website"
                        value={party.website}
                    />

                    <ReadField
                        label="Payment Terms"
                        value={party.paymentTerms}
                    />

                    <ReadField
                        label="Supplier Status"
                        value={party.status}
                    />

                    <ReadField
                        label="Credit Limit"
                        value={formatAmount(party.creditLimit, order)}
                    />

                    <ReadField
                        label="Outstanding Credit"
                        value={formatAmount(party.outstandingCredit, order)}
                    />

                    <ReadField
                        label="Available Credit"
                        value={formatAmount(party.availableCredit, order)}
                    />

                </div>

            </SectionCard>

            {/* =================================================
                SUPPLIER ADDRESS
            ================================================= */}

            <SectionCard
                title="Supplier Address"
                icon={MapPin}
                right={
                    address?.defaultAddress && (
                        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-600">
                            Default Address
                        </span>
                    )
                }
            >

                {address ? (

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

                        <ReadField
                            label="Address Line 1"
                            value={address.addressLine1}
                        />

                        <ReadField
                            label="Address Line 2"
                            value={address.addressLine2}
                        />

                        <ReadField
                            label="City"
                            value={address.city}
                        />

                        <ReadField
                            label="District"
                            value={address.district}
                        />

                        <ReadField
                            label="State"
                            value={address.state}
                        />

                        <ReadField
                            label="Country"
                            value={address.country}
                        />

                        <ReadField
                            label="Postal Code"
                            value={address.postalCode}
                        />

                    </div>

                ) : (
                    <p className="text-sm text-gray-400">
                        No supplier address available.
                    </p>
                )}

                {/* ALL ADDRESSES */}

                {party.addresses?.length > 1 && (

                    <div className="mt-5 border-t border-gray-100 pt-4">

                        <h4 className="mb-3 text-sm font-semibold text-gray-700">
                            All Supplier Addresses
                        </h4>

                        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">

                            {party.addresses.map((item, index) => (

                                <div
                                    key={item.id || index}
                                    className="rounded-lg border border-gray-100 bg-gray-50 p-4"
                                >

                                    <div className="mb-2 flex items-center justify-between">

                                        <p className="text-xs font-semibold text-gray-700">
                                            Address {index + 1}
                                        </p>

                                        {item.defaultAddress && (
                                            <span className="text-[10px] font-medium text-green-600">
                                                DEFAULT
                                            </span>
                                        )}

                                    </div>

                                    <p className="text-sm text-gray-700">
                                        {item.addressLine1}
                                    </p>

                                    {item.addressLine2 && (
                                        <p className="text-sm text-gray-600">
                                            {item.addressLine2}
                                        </p>
                                    )}

                                    <p className="mt-1 text-sm text-gray-500">
                                        {[
                                            item.city,
                                            item.district,
                                            item.state,
                                            item.country,
                                            item.postalCode,
                                        ].filter(Boolean).join(", ")}
                                    </p>

                                </div>

                            ))}

                        </div>

                    </div>

                )}

            </SectionCard>

            {/* =================================================
                SUPPLIER BANK ACCOUNT
            ================================================= */}

            <SectionCard
                title="Supplier Bank Account"
                icon={CreditCard}
            >

                {bank ? (

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

                        <ReadField
                            label="Bank Name"
                            value={bank.bankName}
                        />

                        <ReadField
                            label="Account Holder Name"
                            value={bank.accountHolderName}
                        />

                        <ReadField
                            label="Account Number"
                            value={bank.accountNumber}
                        />

                        <ReadField
                            label="IFSC Code"
                            value={bank.ifscCode}
                        />

                        <ReadField
                            label="Branch Name"
                            value={bank.branchName}
                        />

                        <ReadField
                            label="Account Type"
                            value={bank.accountType}
                        />

                        <ReadField
                            label="Primary Account"
                            value={bank.primaryAccount ? "Yes" : "No"}
                        />

                        <ReadField
                            label="Bank Status"
                            value={bank.status}
                        />

                        <ReadField
                            label="Remarks"
                            value={bank.remarks}
                        />

                    </div>

                ) : (
                    <p className="text-sm text-gray-400">
                        No supplier bank account available.
                    </p>
                )}

                {/* ALL BANK ACCOUNTS */}

                {party.bankAccounts?.length > 1 && (

                    <div className="mt-5 border-t border-gray-100 pt-4">

                        <h4 className="mb-3 text-sm font-semibold text-gray-700">
                            All Bank Accounts
                        </h4>

                        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">

                            {party.bankAccounts.map((account, index) => (

                                <div
                                    key={account.id || index}
                                    className="rounded-lg border border-gray-100 bg-gray-50 p-4"
                                >

                                    <div className="mb-3 flex items-center justify-between">

                                        <p className="text-sm font-semibold text-gray-800">
                                            {account.bankName}
                                        </p>

                                        {account.primaryAccount && (
                                            <span className="rounded-full bg-green-50 px-2 py-1 text-[10px] font-medium text-green-600">
                                                PRIMARY
                                            </span>
                                        )}

                                    </div>

                                    <div className="grid grid-cols-2 gap-3">

                                        <ReadField
                                            label="Account Holder"
                                            value={account.accountHolderName}
                                        />

                                        <ReadField
                                            label="Account Number"
                                            value={account.accountNumber}
                                        />

                                        <ReadField
                                            label="IFSC"
                                            value={account.ifscCode}
                                        />

                                        <ReadField
                                            label="Account Type"
                                            value={account.accountType}
                                        />

                                    </div>

                                </div>

                            ))}

                        </div>

                    </div>

                )}

            </SectionCard>

            {/* =================================================
                CURRENCY AND DISCOUNT INFORMATION
            ================================================= */}

            <SectionCard
                title="Currency & Discount Information"
                icon={Receipt}
            >

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

                    <ReadField
                        label="Currency ID"
                        value={order.currencyId}
                    />

                    <ReadField
                        label="Currency Code"
                        value={order.currencyCode}
                    />

                    <ReadField
                        label="Currency Name"
                        value={order.currencyName}
                    />

                    <ReadField
                        label="Currency Symbol"
                        value={order.currencySymbol}
                    />

                    <ReadField
                        label="Exchange Rate"
                        value={number(order.exchangeRate).toFixed(8)}
                    />

                    <ReadField
                        label="Discount Type"
                        value={order.discountType}
                    />

                    <ReadField
                        label="Discount Value"
                        value={
                            order.discountType === "PERCENTAGE"
                                ? `${number(order.discountValue)}%`
                                : formatAmount(order.discountValue, order)
                        }
                    />

                </div>

            </SectionCard>

            {/* =================================================
                PURCHASE ORDER ITEMS
            ================================================= */}

            <SectionCard
                title="Purchase Order Items"
                icon={Package}
                right={
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                        {items.length} Items
                    </span>
                }
            >

                <div className="overflow-x-auto">

                    <table className="w-full min-w-[1250px]">

                        <thead className="border-b border-gray-200 bg-gray-50">

                            <tr>
                                {[
                                    "Product",
                                    "HSN",
                                    "Unit",
                                    "Size",
                                    "Ordered",
                                    "Received",
                                    "Pending",
                                    "Unit Price",
                                    "Gross Amount",
                                    "Discount",
                                    "Taxable Amount",
                                    "Tax",
                                    "Tax Amount",
                                    "Total Amount",
                                ].map((heading) => (

                                    <th
                                        key={heading}
                                        className="whitespace-nowrap px-3 py-3 text-left text-[11px] font-semibold uppercase text-gray-500"
                                    >
                                        {heading}
                                    </th>

                                ))}

                            </tr>

                        </thead>

                        <tbody>

                            {items.length > 0 ? (

                                items.map((item, index) => (

                                    <tr
                                        key={item.id || index}
                                        className="border-b border-gray-100 transition hover:bg-gray-50"
                                    >

                                        {/* PRODUCT */}

                                        <td className="px-3 py-4">

                                            <p className="max-w-[200px] truncate text-xs font-semibold text-gray-800">
                                                {item.productName || "—"}
                                            </p>

                                            {item.description && (
                                                <p className="mt-1 max-w-[200px] truncate text-[10px] text-gray-400">
                                                    {item.description}
                                                </p>
                                            )}

                                            <p className="mt-1 text-[10px] text-gray-400">
                                                ID: #{item.productId ?? "—"}
                                            </p>

                                        </td>

                                        {/* HSN */}

                                        <td className="px-3 py-4 text-xs text-gray-600">
                                            {item.hsnCode || "—"}
                                        </td>

                                        {/* UNIT */}

                                        <td className="px-3 py-4 text-xs text-gray-600">
                                            {item.unitName || "—"}
                                        </td>

                                        {/* SIZE */}

                                        <td className="px-3 py-4 text-xs text-gray-600">
                                            {item.sizeName || "—"}
                                        </td>

                                        {/* QUANTITY */}

                                        <td className="px-3 py-4 text-xs font-medium text-gray-700">
                                            {formatQuantity(item.quantity)}
                                        </td>

                                        {/* RECEIVED */}

                                        <td className="px-3 py-4 text-xs font-medium text-green-600">
                                            {formatQuantity(item.receivedQuantity)}
                                        </td>

                                        {/* PENDING */}

                                        <td className="px-3 py-4 text-xs font-medium text-amber-600">
                                            {formatQuantity(
                                                pick(
                                                    item.pendingQuantity,
                                                    number(item.quantity) - number(item.receivedQuantity)
                                                )
                                            )}
                                        </td>

                                        {/* UNIT PRICE */}

                                        <td className="whitespace-nowrap px-3 py-4 text-xs text-gray-700">
                                            {formatAmount(item.unitPrice, order)}
                                        </td>

                                        {/* GROSS */}

                                        <td className="whitespace-nowrap px-3 py-4 text-xs text-gray-700">
                                            {formatAmount(item.grossAmount, order)}
                                        </td>

                                        {/* DISCOUNT */}

                                        <td className="px-3 py-4">

                                            <p className="text-xs font-medium text-gray-700">
                                                {item.discountType === "PERCENTAGE"
                                                    ? `${number(item.discountValue)}%`
                                                    : formatAmount(item.discountValue, order)}
                                            </p>

                                            <p className="mt-1 text-[10px] text-gray-400">
                                                {formatAmount(item.discountAmount, order)}
                                            </p>

                                        </td>

                                        {/* TAXABLE */}

                                        <td className="whitespace-nowrap px-3 py-4 text-xs text-gray-700">
                                            {formatAmount(item.taxableAmount, order)}
                                        </td>

                                        {/* TAX */}

                                        <td className="px-3 py-4">

                                            <p className="text-xs font-medium text-gray-700">
                                                {item.taxName || "—"}
                                            </p>

                                            <p className="mt-1 text-[10px] text-gray-400">
                                                {number(item.taxPercentage)}%
                                            </p>

                                        </td>

                                        {/* TAX AMOUNT */}

                                        <td className="whitespace-nowrap px-3 py-4 text-xs text-gray-700">
                                            {formatAmount(item.taxAmount, order)}
                                        </td>

                                        {/* TOTAL */}

                                        <td className="whitespace-nowrap px-3 py-4 text-xs font-semibold text-gray-900">
                                            {formatAmount(item.totalAmount, order)}
                                        </td>

                                    </tr>

                                ))

                            ) : (

                                <tr>
                                    <td
                                        colSpan={14}
                                        className="px-4 py-10 text-center text-sm text-gray-400"
                                    >
                                        No purchase order items found.
                                    </td>
                                </tr>

                            )}

                        </tbody>

                    </table>

                </div>

                {/* ITEM TAX BREAKDOWN */}

                {items.length > 0 && (

                    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">

                        <SummaryTile
                            label="CGST"
                            value={formatAmount(
                                items.reduce(
                                    (total, item) => total + number(item.cgstAmount),
                                    0
                                ),
                                order
                            )}
                        />

                        <SummaryTile
                            label="SGST"
                            value={formatAmount(
                                items.reduce(
                                    (total, item) => total + number(item.sgstAmount),
                                    0
                                ),
                                order
                            )}
                        />

                        <SummaryTile
                            label="IGST"
                            value={formatAmount(
                                items.reduce(
                                    (total, item) => total + number(item.igstAmount),
                                    0
                                ),
                                order
                            )}
                        />

                    </div>

                )}

            </SectionCard>

            {/* =================================================
                TAX AND TOTAL SUMMARY
            ================================================= */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {statsCards.map((card) => {
                    const Icon = card.icon;
                    const styles = colorStyles[card.color];

                    return (
                        <div
                            key={card.title}
                            className="
                    rounded-xl
                    border border-gray-200
                    bg-white
                    p-4
                    shadow-sm
                    transition
                    hover:shadow-md
                "
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                        {card.title}
                                    </p>

                                    <h3 className={`mt-2 truncate text-xl font-bold ${styles.value}`}>
                                        {card.value}
                                    </h3>

                                    <p className="mt-1 text-xs text-gray-400">
                                        {card.description}
                                    </p>
                                </div>

                                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${styles.icon}`}>
                                    <Icon size={20} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <SectionCard
                title="Purchase Order Amount Summary"
                icon={Receipt}
            >

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

                    {/* LEFT: BASE AMOUNTS */}

                    <div>

                        <h4 className="mb-4 text-sm font-semibold text-gray-700">
                            Base Currency Amounts (INR)
                        </h4>

                        <div className="space-y-3">

                            <div className="flex justify-between gap-4 text-sm">
                                <span className="text-gray-500">
                                    Base Subtotal
                                </span>
                                <span className="font-medium text-gray-800">
                                    {formatAmount(order.baseSubtotal, {
                                        currencyCode: "INR",
                                    })}
                                </span>
                            </div>

                            <div className="flex justify-between gap-4 text-sm">
                                <span className="text-gray-500">
                                    Base Discount
                                </span>
                                <span className="font-medium text-gray-800">
                                    {formatAmount(order.baseDiscountAmount, {
                                        currencyCode: "INR",
                                    })}
                                </span>
                            </div>

                            <div className="flex justify-between gap-4 text-sm">
                                <span className="text-gray-500">
                                    Base Taxable Amount
                                </span>
                                <span className="font-medium text-gray-800">
                                    {formatAmount(order.baseTaxableAmount, {
                                        currencyCode: "INR",
                                    })}
                                </span>
                            </div>

                            <div className="flex justify-between gap-4 text-sm">
                                <span className="text-gray-500">
                                    Base Total Tax
                                </span>
                                <span className="font-medium text-gray-800">
                                    {formatAmount(order.baseTotalTaxAmount, {
                                        currencyCode: "INR",
                                    })}
                                </span>
                            </div>

                            <div className="flex justify-between gap-4 border-t border-gray-100 pt-3 text-sm">
                                <span className="font-semibold text-gray-700">
                                    Base Grand Total
                                </span>
                                <span className="font-bold text-gray-900">
                                    {formatAmount(order.baseGrandTotal, {
                                        currencyCode: "INR",
                                    })}
                                </span>
                            </div>

                            <div className="flex justify-between gap-4 text-sm">
                                <span className="text-green-600">
                                    Base Received Amount
                                </span>
                                <span className="font-semibold text-green-600">
                                    {formatAmount(order.baseReceivedTotalAmount, {
                                        currencyCode: "INR",
                                    })}
                                </span>
                            </div>

                        </div>

                    </div>

                    {/* RIGHT: SELECTED CURRENCY */}

                    <div>

                        <h4 className="mb-4 text-sm font-semibold text-gray-700">
                            Order Currency Amounts ({order.currencyCode || "INR"})
                        </h4>

                        <div className="space-y-3">

                            <div className="flex justify-between gap-4 text-sm">
                                <span className="text-gray-500">
                                    Subtotal
                                </span>
                                <span className="font-medium text-gray-800">
                                    {formatAmount(order.subtotal, order)}
                                </span>
                            </div>

                            <div className="flex justify-between gap-4 text-sm">
                                <span className="text-gray-500">
                                    Discount Amount
                                </span>
                                <span className="font-medium text-gray-800">
                                    {formatAmount(order.discountAmount, order)}
                                </span>
                            </div>

                            <div className="flex justify-between gap-4 text-sm">
                                <span className="text-gray-500">
                                    Taxable Amount
                                </span>
                                <span className="font-medium text-gray-800">
                                    {formatAmount(order.taxableAmount, order)}
                                </span>
                            </div>

                            <div className="flex justify-between gap-4 text-sm">
                                <span className="text-gray-500">
                                    CGST
                                </span>
                                <span className="font-medium text-gray-800">
                                    {formatAmount(order.cgstAmount, order)}
                                </span>
                            </div>

                            <div className="flex justify-between gap-4 text-sm">
                                <span className="text-gray-500">
                                    SGST
                                </span>
                                <span className="font-medium text-gray-800">
                                    {formatAmount(order.sgstAmount, order)}
                                </span>
                            </div>

                            <div className="flex justify-between gap-4 text-sm">
                                <span className="text-gray-500">
                                    IGST
                                </span>
                                <span className="font-medium text-gray-800">
                                    {formatAmount(order.igstAmount, order)}
                                </span>
                            </div>

                            <div className="flex justify-between gap-4 text-sm">
                                <span className="text-gray-500">
                                    Total Tax
                                </span>
                                <span className="font-medium text-gray-800">
                                    {formatAmount(order.totalTaxAmount, order)}
                                </span>
                            </div>

                            <div className="flex justify-between gap-4 border-t border-gray-100 pt-3 text-sm">
                                <span className="font-semibold text-gray-700">
                                    Grand Total
                                </span>
                                <span className="font-bold text-blue-700">
                                    {formatAmount(order.grandTotal, order)}
                                </span>
                            </div>

                            <div className="flex justify-between gap-4 text-sm">
                                <span className="text-green-600">
                                    Received Amount
                                </span>
                                <span className="font-semibold text-green-600">
                                    {formatAmount(order.receivedTotalAmount, order)}
                                </span>
                            </div>

                        </div>

                    </div>

                </div>

            </SectionCard>



        </div>
    );
}