import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import {
    ArrowLeft,
    Building2,
    CalendarDays,
    CheckCircle2,
    Clock,
    FileText,
    MapPin,
    Package,
    Receipt,
    ShoppingCart,
    UserRound,
    Wallet,
    Percent,
    Warehouse,
    CreditCard,
    RefreshCw,
    Pencil,
} from "lucide-react";

import { fetchSalesOrderById } from "../thunks/salesOrderThunks";
import { setSalesOrder } from "../slices/salesOrderSlice";

// ------------------------------------------------------
// Helpers
// ------------------------------------------------------

const formatAmount = (value, order) => {
    const amount = Number(value || 0);

    return `${order?.currencyCode || "INR"} ${amount.toLocaleString(
        "en-IN",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }
    )}`;
};

const formatDate = (date) => {
    if (!date) return "—";

    return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const getStatusStyles = (status) => {
    const styles = {
        DRAFT: "bg-gray-100 text-gray-700",
        CONFIRMED: "bg-blue-100 text-blue-700",
        PARTIALLY_DELIVERED: "bg-amber-100 text-amber-700",
        DELIVERED: "bg-green-100 text-green-700",
        CANCELLED: "bg-red-100 text-red-700",
    };

    return styles[status] || "bg-gray-100 text-gray-700";
};

const formatLabel = (value) => {
    if (!value) return "—";

    return value
        .toLowerCase()
        .replaceAll("_", " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

// ------------------------------------------------------
// Reusable Components
// ------------------------------------------------------

const SectionCard = ({ title, icon: Icon, children, className = "" }) => {
    return (
        <section
            className={`overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm ${className}`}
        >
            <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
                {Icon && (
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <Icon size={18} />
                    </div>
                )}

                <h2 className="text-sm font-semibold text-gray-800">
                    {title}
                </h2>
            </div>

            <div className="p-5">{children}</div>
        </section>
    );
};

const ReadField = ({ label, value, className = "" }) => {
    return (
        <div className={`min-w-0 ${className}`}>
            <p className="mb-1 text-xs font-medium text-gray-400">
                {label}
            </p>

            <p className="break-words text-sm font-medium text-gray-700">
                {value === null || value === undefined || value === ""
                    ? "—"
                    : value}
            </p>
        </div>
    );
};

const StatusBadge = ({ status }) => {
    return (
        <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyles(
                status
            )}`}
        >
            {formatLabel(status)}
        </span>
    );
};

const StatCard = ({ title, value, description, icon: Icon, color }) => {
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

    const styles = colorStyles[color] || colorStyles.blue;

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        {title}
                    </p>

                    <h3
                        className={`mt-2 truncate text-xl font-bold ${styles.value}`}
                    >
                        {value}
                    </h3>

                    <p className="mt-1 text-xs text-gray-400">
                        {description}
                    </p>
                </div>

                <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${styles.icon}`}
                >
                    <Icon size={20} />
                </div>
            </div>
        </div>
    );
};

const getStatus = (order) =>
    String(
        order?.purchaseOrderStatus ||
        order?.status ||
        "DRAFT"
    )

// ------------------------------------------------------
// Main Component
// ------------------------------------------------------

const SaleOrderViewDetails = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();

    const {
        salesOrder,
        loading,
        error,
    } = useSelector((state) => state.salesOrder);

    // Fetch sales order details
    useEffect(() => {
        if (id) {
            dispatch(fetchSalesOrderById(id));
        }
    }, [dispatch, id]);

    // Prevent displaying previously selected sales order
    const loaded = salesOrder && String(salesOrder.id) === String(id);

    const order = loaded ? salesOrder : null;

    const status = getStatus(order);

    const isDraft = status === "DRAFT";

    const customer = order?.customer || order?.party || null;

    const billingAddress = customer?.billingAddress;
    const shippingAddress = customer?.shippingAddress;

    const items = Array.isArray(order?.items) ? order.items : [];

    // Amount calculations
    const grandTotal = Number(order?.grandTotal || 0);
    const subtotal = Number(order?.subtotal || 0);
    const discountAmount = Number(order?.discountAmount || 0);
    const totalTaxAmount = Number(order?.totalTaxAmount || 0);

    const statsCards = useMemo(() => {
        if (!order) return [];

        return [
            {
                title: "Grand Total",
                value: formatAmount(order.grandTotal, order),
                description: "Total sales order value",
                icon: Wallet,
                color: "blue",
            },
            {
                title: "Subtotal",
                value: formatAmount(order.subtotal, order),
                description: "Before discount and tax",
                icon: ShoppingCart,
                color: "green",
            },
            {
                title: "Total Discount",
                value: formatAmount(order.discountAmount, order),
                description: "Discount applied",
                icon: Percent,
                color: "amber",
            },
            {
                title: "Total Tax",
                value: formatAmount(order.totalTaxAmount, order),
                description: "Total GST amount",
                icon: Receipt,
                color: "purple",
            },
        ];
    }, [order]);

    // Loading
    if (loading && !loaded) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

                    <p className="mt-3 text-sm text-gray-500">
                        Loading sales order details...
                    </p>
                </div>
            </div>
        );
    }

    // Error / Not found
    if (!loaded) {
        return (
            <div className="flex min-h-[400px] flex-col items-center justify-center">
                <FileText size={42} className="text-gray-300" />

                <h2 className="mt-3 text-lg font-semibold text-gray-700">
                    Sales Order Not Found
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                    {error || "Unable to load sales order details."}
                </p>

                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="mt-5 flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                    <ArrowLeft size={16} />
                    Go Back
                </button>
            </div>
        );
    }

    const handleRefresh = () => {
        if (id) {
            dispatch(fetchPurchaseOrderById(id));
        }
    };

    const handleBack = () => {
        navigate("/inventory/salesOrders");
    };

    const handleEdit = () => {

        if (!loaded) return;

        if (getStatus(salesOrder) !== "DRAFT") {
            return;
        }

        dispatch(setSalesOrder(salesOrder));

        navigate(`/inventory/saleOrder/edit/${salesOrder.id}`);
    };

    return (
        <div className="space-y-6 pb-8 mt-2">

            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">

                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

                    <div className="flex min-w-0 items-start gap-3">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <ShoppingCart size={24} />
                        </div>

                        <div className="min-w-0">

                            <div className="flex flex-wrap items-center gap-3">

                                <h1 className="text-xl font-bold text-gray-800">
                                    {order.orderNo}
                                </h1>

                                <StatusBadge status={order.salesOrderStatus} />

                            </div>

                            <p className="mt-1 text-sm text-gray-500">
                                {order.orderNo || "—"}
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                                Manage and review sales order information.
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
                                Edit sales Order
                            </button>
                        )}

                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600">
                                <CalendarDays size={16} className="text-gray-400" />
                                {formatDate(order.orderDate)}
                            </div>
                        </div>
                    </div>

                </div>

            </div>

            {/* Header */}
            {/* <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

            </div> */}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {statsCards.map((card) => (
                    <StatCard key={card.title} {...card} />
                ))}
            </div>

            {/* Sales Order Information */}
            <SectionCard
                title="Sales Order Information"
                icon={FileText}
            >
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <ReadField
                        label="Sales Order Number"
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
                        label="Order Status"
                        value={<StatusBadge status={order.salesOrderStatus} />}
                    />

                    <ReadField
                        label="Currency"
                        value={`${order.currencyName || "—"} (${order.currencyCode || "—"})`}
                    />

                    <ReadField
                        label="Currency Symbol"
                        value={order.currencySymbol}
                    />

                    <ReadField
                        label="Exchange Rate"
                        value={Number(order.exchangeRate || 0).toFixed(6)}
                    />

                    <ReadField
                        label="Party Type"
                        value={formatLabel(order.partyType)}
                    />

                    <ReadField
                        label="Discount Type"
                        value={formatLabel(order.discountType)}
                    />

                    <ReadField
                        label="Discount Value"
                        value={order.discountValue}
                    />

                    <ReadField
                        label="Warehouse"
                        value={order.warehouseName}
                    />
                </div>

                {order.notes && (
                    <div className="mt-5 border-t border-gray-100 pt-4">
                        <ReadField
                            label="Notes"
                            value={order.notes}
                        />
                    </div>
                )}
            </SectionCard>

            {/* Customer Information */}
            <SectionCard
                title={order.partyType === "CUSTOMER" ? "Customer Information" : "Party Information"}
                icon={UserRound}
            >
                {customer ? (
                    <>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            <ReadField
                                label="Customer Name"
                                value={
                                    customer.displayName ||
                                    customer.companyName ||
                                    `${customer.firstName || ""} ${customer.lastName || ""}`.trim()
                                }
                            />

                            <ReadField
                                label="Customer Type"
                                value={customer.customerType}
                            />

                            <ReadField
                                label="Customer ID"
                                value={customer.id}
                            />

                            <ReadField
                                label="Status"
                                value={customer.status}
                            />

                            <ReadField
                                label="Email"
                                value={customer.email}
                            />

                            <ReadField
                                label="Work Phone"
                                value={`${customer.workPhoneCode || ""} ${customer.workPhone || ""}`.trim()}
                            />

                            <ReadField
                                label="Mobile"
                                value={`${customer.mobileCode || ""} ${customer.mobile || ""}`.trim()}
                            />

                            <ReadField
                                label="PAN"
                                value={customer.pan}
                            />

                            <ReadField
                                label="Payment Terms"
                                value={customer.paymentTerms}
                            />

                            <ReadField
                                label="Currency"
                                value={customer.currency}
                            />

                            <ReadField
                                label="Website"
                                value={customer.websiteUrl}
                            />

                            <ReadField
                                label="Language"
                                value={customer.customerLanguage}
                            />

                            <ReadField
                                label="Department"
                                value={customer.department}
                            />

                            <ReadField
                                label="Designation"
                                value={customer.designation}
                            />

                            <ReadField
                                label="Salutation"
                                value={customer.salutation}
                            />

                            <ReadField
                                label="Portal Enabled"
                                value={customer.enablePortal ? "Yes" : "No"}
                            />
                        </div>

                        {/* Billing and Shipping */}
                        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">

                            {/* Billing Address */}
                            <div className="rounded-xl border border-gray-200 p-4">
                                <div className="mb-4 flex items-center gap-2">
                                    <MapPin size={17} className="text-blue-600" />

                                    <h3 className="text-sm font-semibold text-gray-800">
                                        Billing Address
                                    </h3>
                                </div>

                                {billingAddress ? (
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <ReadField
                                            label="Attention"
                                            value={billingAddress.attention}
                                        />

                                        <ReadField
                                            label="Address"
                                            value={billingAddress.address}
                                        />

                                        <ReadField
                                            label="City"
                                            value={billingAddress.city}
                                        />

                                        <ReadField
                                            label="State"
                                            value={billingAddress.state}
                                        />

                                        <ReadField
                                            label="Country"
                                            value={billingAddress.country}
                                        />

                                        <ReadField
                                            label="Postal Code"
                                            value={billingAddress.zipCode}
                                        />

                                        <ReadField
                                            label="Phone"
                                            value={billingAddress.phone}
                                        />

                                        <ReadField
                                            label="Fax"
                                            value={billingAddress.fax}
                                        />
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400">
                                        No billing address available.
                                    </p>
                                )}
                            </div>

                            {/* Shipping Address */}
                            <div className="rounded-xl border border-gray-200 p-4">
                                <div className="mb-4 flex items-center gap-2">
                                    <MapPin size={17} className="text-green-600" />

                                    <h3 className="text-sm font-semibold text-gray-800">
                                        Shipping Address
                                    </h3>
                                </div>

                                {shippingAddress ? (
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <ReadField
                                            label="Attention"
                                            value={shippingAddress.attention}
                                        />

                                        <ReadField
                                            label="Address"
                                            value={shippingAddress.address}
                                        />

                                        <ReadField
                                            label="City"
                                            value={shippingAddress.city}
                                        />

                                        <ReadField
                                            label="State"
                                            value={shippingAddress.state}
                                        />

                                        <ReadField
                                            label="Country"
                                            value={shippingAddress.country}
                                        />

                                        <ReadField
                                            label="Postal Code"
                                            value={shippingAddress.zipCode}
                                        />

                                        <ReadField
                                            label="Phone"
                                            value={shippingAddress.phone}
                                        />

                                        <ReadField
                                            label="Fax"
                                            value={shippingAddress.fax}
                                        />
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400">
                                        No shipping address available.
                                    </p>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <p className="text-sm text-gray-400">
                        No customer or party information available.
                    </p>
                )}
            </SectionCard>

            {/* Warehouse Information */}
            <SectionCard
                title="Warehouse Information"
                icon={Warehouse}
            >
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <ReadField
                        label="Warehouse ID"
                        value={order.warehouseId}
                    />

                    <ReadField
                        label="Warehouse Name"
                        value={order.warehouseName}
                    />
                </div>
            </SectionCard>

            {/* Items */}
            <SectionCard
                title={`Order Items (${items.length})`}
                icon={Package}
            >
                {items.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1100px] border-collapse text-left">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500">
                                        #
                                    </th>

                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500">
                                        Product
                                    </th>

                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500">
                                        HSN
                                    </th>

                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500">
                                        Unit / Size
                                    </th>

                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">
                                        Quantity
                                    </th>

                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">
                                        Unit Price
                                    </th>

                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">
                                        Gross Amount
                                    </th>

                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">
                                        Discount
                                    </th>

                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">
                                        Taxable Amount
                                    </th>

                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">
                                        Tax
                                    </th>

                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">
                                        Total
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {items.map((item, index) => (
                                    <tr
                                        key={item.id || index}
                                        className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-4 text-sm text-gray-500">
                                            {index + 1}
                                        </td>

                                        <td className="px-4 py-4">
                                            <p className="max-w-[220px] truncate text-sm font-semibold text-gray-800">
                                                {item.productName || "—"}
                                            </p>

                                            <p className="mt-1 max-w-[220px] truncate text-xs text-gray-400">
                                                {item.description || "—"}
                                            </p>
                                        </td>

                                        <td className="px-4 py-4 text-sm text-gray-600">
                                            {item.hsnCode || "—"}
                                        </td>

                                        <td className="px-4 py-4">
                                            <p className="text-sm text-gray-700">
                                                {item.unitName || "—"}
                                            </p>

                                            <p className="mt-1 text-xs text-gray-400">
                                                {item.sizeName || "—"}
                                            </p>
                                        </td>

                                        <td className="px-4 py-4 text-right text-sm text-gray-700">
                                            {Number(item.quantity || 0).toLocaleString("en-IN")}
                                        </td>

                                        <td className="px-4 py-4 text-right text-sm text-gray-700">
                                            {formatAmount(item.unitPrice, order)}
                                        </td>

                                        <td className="px-4 py-4 text-right text-sm text-gray-700">
                                            {formatAmount(item.grossAmount, order)}
                                        </td>

                                        <td className="px-4 py-4 text-right text-sm text-gray-700">
                                            {formatAmount(item.discountAmount, order)}
                                        </td>

                                        <td className="px-4 py-4 text-right text-sm text-gray-700">
                                            {formatAmount(item.taxableAmount, order)}
                                        </td>

                                        <td className="px-4 py-4 text-right">
                                            <p className="text-sm text-gray-700">
                                                {formatAmount(item.taxAmount, order)}
                                            </p>

                                            <p className="mt-1 text-xs text-gray-400">
                                                {item.taxName || "No Tax"}
                                            </p>
                                        </td>

                                        <td className="px-4 py-4 text-right text-sm font-semibold text-gray-800">
                                            {formatAmount(item.totalAmount, order)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-sm text-gray-400">
                        No items found in this sales order.
                    </p>
                )}
            </SectionCard>

            {/* Item Tax Details */}
            <SectionCard
                title="Tax Details"
                icon={Receipt}
            >
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[750px] border-collapse text-left">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50">
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500">
                                    Product
                                </th>

                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">
                                    Tax %
                                </th>

                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">
                                    CGST %
                                </th>

                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">
                                    SGST %
                                </th>

                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">
                                    IGST %
                                </th>

                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">
                                    CGST Amount
                                </th>

                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">
                                    SGST Amount
                                </th>

                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">
                                    IGST Amount
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {items.map((item, index) => (
                                <tr
                                    key={item.id || index}
                                    className="border-b border-gray-100 last:border-0"
                                >
                                    <td className="px-4 py-3 text-sm font-medium text-gray-700">
                                        {item.productName || "—"}
                                    </td>

                                    <td className="px-4 py-3 text-right text-sm text-gray-600">
                                        {Number(item.taxPercentage || 0).toFixed(2)}%
                                    </td>

                                    <td className="px-4 py-3 text-right text-sm text-gray-600">
                                        {Number(item.cgstPercentage || 0).toFixed(2)}%
                                    </td>

                                    <td className="px-4 py-3 text-right text-sm text-gray-600">
                                        {Number(item.sgstPercentage || 0).toFixed(2)}%
                                    </td>

                                    <td className="px-4 py-3 text-right text-sm text-gray-600">
                                        {Number(item.igstPercentage || 0).toFixed(2)}%
                                    </td>

                                    <td className="px-4 py-3 text-right text-sm text-gray-600">
                                        {formatAmount(item.cgstAmount, order)}
                                    </td>

                                    <td className="px-4 py-3 text-right text-sm text-gray-600">
                                        {formatAmount(item.sgstAmount, order)}
                                    </td>

                                    <td className="px-4 py-3 text-right text-sm text-gray-600">
                                        {formatAmount(item.igstAmount, order)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </SectionCard>

            {/* Amount Summary */}
            <SectionCard
                title="Sales Order Amount Summary"
                icon={Wallet}
            >
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

                    {/* Base Currency */}
                    <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-800">
                                Base Currency Amounts
                            </h3>

                            <span className="rounded-md bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                                INR
                            </span>
                        </div>

                        <div className="space-y-3">
                            <SummaryRow
                                label="Subtotal"
                                value={formatAmount(
                                    order.baseSubtotal,
                                    { currencyCode: "INR" }
                                )}
                            />

                            <SummaryRow
                                label="Discount"
                                value={formatAmount(
                                    order.baseDiscountAmount,
                                    { currencyCode: "INR" }
                                )}
                            />

                            <SummaryRow
                                label="Taxable Amount"
                                value={formatAmount(
                                    order.baseTaxableAmount,
                                    { currencyCode: "INR" }
                                )}
                            />

                            <SummaryRow
                                label="Total Tax"
                                value={formatAmount(
                                    order.baseTotalTaxAmount,
                                    { currencyCode: "INR" }
                                )}
                            />

                            <div className="border-t border-blue-200 pt-3">
                                <SummaryRow
                                    label="Grand Total"
                                    value={formatAmount(
                                        order.baseGrandTotal,
                                        { currencyCode: "INR" }
                                    )}
                                    strong
                                />
                            </div>
                        </div>
                    </div>

                    {/* Selected Currency */}
                    <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-800">
                                Selected Currency Amounts
                            </h3>

                            <span className="rounded-md bg-gray-200 px-2 py-1 text-xs font-semibold text-gray-700">
                                {order.currencyCode || "INR"}
                            </span>
                        </div>

                        <div className="space-y-3">
                            <SummaryRow
                                label="Subtotal"
                                value={formatAmount(order.subtotal, order)}
                            />

                            <SummaryRow
                                label="Discount"
                                value={formatAmount(order.discountAmount, order)}
                            />

                            <SummaryRow
                                label="Taxable Amount"
                                value={formatAmount(order.taxableAmount, order)}
                            />

                            <SummaryRow
                                label="CGST"
                                value={formatAmount(order.cgstAmount, order)}
                            />

                            <SummaryRow
                                label="SGST"
                                value={formatAmount(order.sgstAmount, order)}
                            />

                            <SummaryRow
                                label="IGST"
                                value={formatAmount(order.igstAmount, order)}
                            />

                            <SummaryRow
                                label="Total Tax"
                                value={formatAmount(order.totalTaxAmount, order)}
                            />

                            <div className="border-t border-gray-200 pt-3">
                                <SummaryRow
                                    label="Grand Total"
                                    value={formatAmount(order.grandTotal, order)}
                                    strong
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-gray-50 px-4 py-3">
                    <span className="text-sm text-gray-600">
                        Exchange Rate
                    </span>

                    <span className="text-sm font-semibold text-gray-800">
                        1 {order.currencyCode || "INR"} ={" "}
                        {Number(order.exchangeRate || 1).toFixed(6)} INR
                    </span>
                </div>
            </SectionCard>
        </div>
    );
};

// ------------------------------------------------------
// Summary Row
// ------------------------------------------------------

const SummaryRow = ({ label, value, strong = false }) => {
    return (
        <div className="flex items-center justify-between gap-3">
            <span
                className={`text-sm ${strong
                    ? "font-bold text-gray-800"
                    : "text-gray-500"
                    }`}
            >
                {label}
            </span>

            <span
                className={`text-sm ${strong
                    ? "font-bold text-blue-700"
                    : "font-medium text-gray-700"
                    }`}
            >
                {value}
            </span>
        </div>
    );
};

export default SaleOrderViewDetails;