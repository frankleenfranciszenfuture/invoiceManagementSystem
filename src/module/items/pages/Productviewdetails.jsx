
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import {
    ArrowLeft,
    Package,
    CalendarDays,
    FileText,
    Hash,
    Tag,
    Ruler,
    Layers,
    Coins,
    Calculator,
    ClipboardList,
    Barcode,
    Image as ImageIcon,
    RefreshCw,
    Warehouse,
    CheckCircle,
    XCircle,
} from "lucide-react";

import { fetchProductById } from "../thunks/productThunks";

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

const formatLabel = (value) => {
    if (!value) return "—";

    return String(value)
        .toLowerCase()
        .replaceAll("_", " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatAmount = (amount, symbol = "₹") => {
    if (
        amount === null ||
        amount === undefined ||
        amount === ""
    ) {
        return "—";
    }

    return `${symbol}${Number(amount).toLocaleString(
        "en-IN",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }
    )}`;
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

const ProductStatusBadge = ({ status }) => {
    const styles = {
        ACTIVE: "bg-green-100 text-green-700",
        INACTIVE: "bg-red-100 text-red-700",
        DRAFT: "bg-amber-100 text-amber-700",
    };

    return (
        <span className={`
            inline-flex rounded-full px-3 py-1
            text-xs font-semibold
            ${styles[String(status || "").toUpperCase()] ||
            "bg-gray-100 text-gray-700"}
        `}>
            {formatLabel(status)}
        </span>
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

// ------------------------------------------------------
// Main Component
// ------------------------------------------------------

const ProductViewDetails = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();

    const {
        product,
        loading,
        error,
    } = useSelector((state) => state.product || {});

    // --------------------------------------------------
    // Fetch product details
    // --------------------------------------------------

    useEffect(() => {
        if (id) {
            dispatch(fetchProductById(id));
        }
    }, [dispatch, id]);

    // --------------------------------------------------
    // Prevent displaying stale product details
    // --------------------------------------------------

    const loaded =
        product &&
        String(product.id) === String(id);

    const data = loaded ? product : null;
    const audit = data?.audit;

    const sizes = data?.sizes || [];
    const units = data?.units || [];

    // --------------------------------------------------
    // Loading
    // --------------------------------------------------

    if (loading && !loaded) {
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
                        Loading product details...
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
                    Product Not Found
                </h2>

                <p className="
                    mt-1 text-sm text-gray-500
                ">
                    {error || "Unable to load product details."}
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
                                    {data.productName || "Product Details"}
                                </h1>

                                <ProductStatusBadge
                                    status={data.status}
                                />
                            </div>

                            <p className="
                                mt-1 text-sm text-gray-500
                            ">
                                Product Code: {data.productCode || "—"}
                            </p>
                        </div>
                    </div>

                    <div className="
                        flex items-center gap-2 rounded-lg
                        border border-gray-200 bg-white
                        px-3 py-2 text-sm text-gray-600
                    ">
                        <CalendarDays
                            size={16}
                            className="text-gray-400"
                        />

                        Created: {formatDateTime(audit?.createdAt)}
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}

            <div className="
                grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4
            ">
                <InfoCard
                    title="Product Code"
                    value={data.productCode}
                    icon={Hash}
                    color="blue"
                />

                <InfoCard
                    title="Selling Price"
                    value={formatAmount(data.sellingPrice)}
                    icon={Coins}
                    color="green"
                />

                <InfoCard
                    title="Purchase Price"
                    value={formatAmount(data.purchasingPrice)}
                    icon={Calculator}
                    color="purple"
                />

                <InfoCard
                    title="Tax Rate"
                    value={
                        data.taxRate !== null &&
                            data.taxRate !== undefined
                            ? `${data.taxRate}%`
                            : "—"
                    }
                    icon={RefreshCw}
                    color="amber"
                />
            </div>

            {/* Product Image */}

            {data.imageUrl && (
                <SectionCard
                    title="Product Image"
                    icon={ImageIcon}
                >
                    <div className="
                        flex flex-wrap items-center gap-5
                    ">
                        <img
                            src={data.imageUrl}
                            alt={data.productName || "Product"}
                            className="
                                h-40 w-40 rounded-lg border
                                border-gray-200 bg-gray-50
                                object-contain p-2
                            "
                        />

                        <div>
                            <p className="
                                text-sm font-semibold text-gray-700
                            ">
                                {data.productName}
                            </p>

                            <p className="
                                mt-1 text-xs text-gray-500
                            ">
                                SKU: {data.sku || "—"}
                            </p>
                        </div>
                    </div>
                </SectionCard>
            )}

            {/* Basic Product Information */}

            <SectionCard
                title="Product Information"
                icon={Package}
            >
                <div className="
                    grid grid-cols-1 gap-5
                    sm:grid-cols-2 lg:grid-cols-4
                ">
                    <ReadField
                        label="Product ID"
                        value={data.id}
                    />

                    <ReadField
                        label="Product Name"
                        value={data.productName}
                    />

                    <ReadField
                        label="Product Code"
                        value={data.productCode}
                    />

                    <ReadField
                        label="SKU"
                        value={data.sku}
                    />

                    <ReadField
                        label="Brand"
                        value={data.brand}
                    />

                    <ReadField
                        label="HSN Code"
                        value={data.hsnCode}
                    />

                    <ReadField
                        label="Product Status"
                        value={
                            <ProductStatusBadge
                                status={data.status}
                            />
                        }
                    />
                </div>
            </SectionCard>

            {/* Category Information */}

            <SectionCard
                title="Category Information"
                icon={Layers}
            >
                <div className="
                    grid grid-cols-1 gap-5
                    sm:grid-cols-2 lg:grid-cols-4
                ">
                    <ReadField
                        label="Category ID"
                        value={data.categoryId}
                    />

                    <ReadField
                        label="Category Name"
                        value={data.categoryName}
                    />

                    <ReadField
                        label="Subcategory ID"
                        value={data.subCategoryId}
                    />

                    <ReadField
                        label="Subcategory Name"
                        value={data.subCategoryName}
                    />
                </div>
            </SectionCard>

            {/* Size Information */}

            <SectionCard
                title="Product Sizes"
                icon={Ruler}
            >
                {sizes.length > 0 ? (
                    <div className="
                        overflow-x-auto rounded-lg border border-gray-100
                    ">
                        <table className="w-full text-left text-sm">
                            <thead className="
                                bg-gray-50 text-xs uppercase text-gray-500
                            ">
                                <tr>
                                    <th className="px-4 py-3">Size Name</th>
                                    <th className="px-4 py-3">Short Name</th>
                                    <th className="px-4 py-3">Size Code</th>
                                    <th className="px-4 py-3">Description</th>
                                    <th className="px-4 py-3">Status</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {sizes.map((size) => (
                                    <tr key={size.id}>
                                        <td className="
                                            px-4 py-3 font-medium text-gray-700
                                        ">
                                            {size.sizeName || "—"}
                                        </td>

                                        <td className="px-4 py-3 text-gray-600">
                                            {size.sizeShortName || "—"}
                                        </td>

                                        <td className="px-4 py-3 text-gray-600">
                                            {size.sizeCode || "—"}
                                        </td>

                                        <td className="px-4 py-3 text-gray-600">
                                            {size.description || "—"}
                                        </td>

                                        <td className="px-4 py-3">
                                            <ProductStatusBadge
                                                status={size.status}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-sm text-gray-500">
                        No sizes assigned to this product.
                    </p>
                )}
            </SectionCard>

            {/* Unit Information */}

            <SectionCard
                title="Product Units"
                icon={Barcode}
            >
                {units.length > 0 ? (
                    <div className="
                        overflow-x-auto rounded-lg border border-gray-100
                    ">
                        <table className="w-full text-left text-sm">
                            <thead className="
                                bg-gray-50 text-xs uppercase text-gray-500
                            ">
                                <tr>
                                    <th className="px-4 py-3">Unit Name</th>
                                    <th className="px-4 py-3">Short Name</th>
                                    <th className="px-4 py-3">Unit Code</th>
                                    <th className="px-4 py-3">Description</th>
                                    <th className="px-4 py-3">Status</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {units.map((unit) => (
                                    <tr key={unit.id}>
                                        <td className="
                                            px-4 py-3 font-medium text-gray-700
                                        ">
                                            {unit.unitName || "—"}
                                        </td>

                                        <td className="px-4 py-3 text-gray-600">
                                            {unit.unitShortName || "—"}
                                        </td>

                                        <td className="px-4 py-3 text-gray-600">
                                            {unit.unitCode || "—"}
                                        </td>

                                        <td className="px-4 py-3 text-gray-600">
                                            {unit.description || "—"}
                                        </td>

                                        <td className="px-4 py-3">
                                            <ProductStatusBadge
                                                status={unit.status}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-sm text-gray-500">
                        No units assigned to this product.
                    </p>
                )}
            </SectionCard>

            {/* Pricing Information */}

            <SectionCard
                title="Pricing Information"
                icon={Coins}
            >
                <div className="
                    grid grid-cols-1 gap-5
                    sm:grid-cols-2 lg:grid-cols-4
                ">
                    <ReadField
                        label="Purchasing Price"
                        value={formatAmount(data.purchasingPrice)}
                    />

                    <ReadField
                        label="Selling Price"
                        value={formatAmount(data.sellingPrice)}
                    />

                    <ReadField
                        label="Price Difference"
                        value={
                            data.sellingPrice != null &&
                                data.purchasingPrice != null
                                ? formatAmount(
                                    Number(data.sellingPrice) -
                                    Number(data.purchasingPrice)
                                )
                                : "—"
                        }
                    />
                </div>
            </SectionCard>

            {/* Tax Information */}

            <SectionCard
                title="Tax Information"
                icon={Calculator}
            >
                <div className="
                    grid grid-cols-1 gap-5
                    sm:grid-cols-2 lg:grid-cols-4
                ">
                    <ReadField
                        label="Tax ID"
                        value={data.taxId}
                    />

                    <ReadField
                        label="Tax Name"
                        value={data.taxName}
                    />

                    <ReadField
                        label="Tax Rate"
                        value={
                            data.taxRate !== null &&
                                data.taxRate !== undefined
                                ? `${data.taxRate}%`
                                : "—"
                        }
                    />
                </div>
            </SectionCard>

            {/* Stock Information */}

            <SectionCard
                title="Stock Information"
                icon={Warehouse}
            >
                <div className="
                    grid grid-cols-1 gap-5
                    sm:grid-cols-2 lg:grid-cols-4
                ">
                    <ReadField
                        label="Minimum Stock"
                        value={data.minimumStock}
                    />

                    <ReadField
                        label="Maximum Stock"
                        value={data.maximumStock}
                    />
                </div>
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

export default ProductViewDetails;
