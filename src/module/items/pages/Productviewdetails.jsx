import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { Pencil, Trash2, RotateCcw, ImageOff, PlusCircle, Plus } from "lucide-react";

// Adjust these paths to match your folder structure
import {
    fetchProductById,
    deleteProduct,
    reactivateProduct,
} from "../thunks/productThunks";
import { setExsistingProduct } from "../slices/productSlice";
import { setProductStatus } from "../slices/productViewSlice";


// ============================================================
// HELPERS
// ============================================================

const pick = (...values) =>
    values.find((v) => v !== undefined && v !== null && v !== "");

const money = (v) =>
    v === undefined || v === null || v === "" || Number.isNaN(Number(v))
        ? "-"
        : `₹ ${Number(v).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

const sizeLabel = (s) =>
    typeof s === "object" ? pick(s.sizeName, s.sizeCode, s.name, s.size) : s;

const sizeKey = (s, i) =>
    typeof s === "object" ? pick(s.sizeId, s.id, sizeLabel(s), i) : `${s}-${i}`;

const unitLabel = (u) =>
    typeof u === "object" ? pick(u.unitName, u.unitCode, u.name, u.unit) : u;

const unitKey = (u, i) =>
    typeof u === "object" ? pick(u.unitId, u.id, unitLabel(u), i) : `${u}-${i}`;

const imageOf = (p) =>
    typeof p?.image === "string" && p.image
        ? p.image
        : pick(p?.imageUrl, p?.thumbnail, "");


// ============================================================
// SMALL PIECES
// ============================================================

const Panel = ({ title, children, right }) => (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            {right}
        </div>
        {children}
    </section>
);

/* Looks like the input boxes in the design but is read-only */
const ReadField = ({ label, value, className = "", tall = false }) => (
    <div className={`flex flex-col gap-1 ${className}`}>
        <span className="text-sm font-medium text-gray-700">
            {label}
        </span>

        <div
            title={label === "Product Name" ? value || "" : undefined}
            className={`w-full rounded-xl border border-gray-200 px-2 py-2 text-sm ${tall
                ? "min-h-[120px] whitespace-pre-wrap bg-gray-50"
                : "bg-white"
                } ${value ? "text-gray-800" : "text-gray-400"
                } ${label === "Product Name"
                    ? "truncate cursor-help"
                    : "break-words"
                }`}
        >
            {value || "-"}
        </div>
    </div>
);

const Chip = ({ label, small = false, selected = true }) => (
    <span
        className={`inline-flex items-center justify-center rounded-lg border font-medium ${small ? "h-6 min-w-7 px-1 text-[9px]" : "h-10 min-w-12 px-3 text-sm"
            } ${selected
                ? "border-[#088178] bg-[#088178]/20 text-gray-900"
                : "border-gray-200 bg-white text-gray-600"
            }`}
    >
        {label}
    </span>
);

const StatusBadge = ({ status }) => {
    const active = (status || "").toUpperCase() === "ACTIVE";

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide ${active ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"
                }`}
        >
            <span
                className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-gray-400"
                    }`}
            />
            {(status || "ACTIVE").toUpperCase()}
        </span>
    );
};


// ============================================================
// PAGE
// ============================================================

export default function ProductViewDetails() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { product, loading, error } = useSelector((state) => state.product);
    const productStatus = useSelector(
        (state) => state.productView?.productStatus ?? "ALL"
    );
    const [busy, setBusy] = useState(false);
    const [actionError, setActionError] = useState("");

    /* ---------- load ---------- */

    useEffect(() => {
        if (id) dispatch(fetchProductById(id));
    }, [id, dispatch]);

    // Ignore a stale product left in the store from a previous page
    const loaded = product && String(product.id) === String(id);


    const normalizedProductStatus = product?.status?.toUpperCase();
    const normalizedFilterStatus = (productStatus ?? "ALL").toUpperCase();

    const matchesSelectedStatus =
        normalizedFilterStatus === "ALL" ||
        normalizedProductStatus === normalizedFilterStatus;

    /* ---------- actions ---------- */

    const handleNew = () => {
        dispatch(setExsistingProduct(null));
        dispatch(setProductStatus("ALL"));
        navigate("/items/newSimple");
    };

    const handleEdit = () => {
        dispatch(setExsistingProduct(product));
        navigate(`/items/editSimple/${product.id}`);
    };


    const handleDelete = async () => {
        if (!window.confirm(`Delete "${product.productName}"? This can't be undone.`))
            return;

        setBusy(true);
        setActionError("");

        const result = await dispatch(deleteProduct(product.id));

        setBusy(false);

        if (deleteProduct.fulfilled.match(result)) {
            navigate("/products");
        } else {
            setActionError(result.payload || "Couldn't delete this product.");
        }
    };

    const handleReactivate = async () => {
        setBusy(true);
        setActionError("");

        const result = await dispatch(reactivateProduct(product.id));

        setBusy(false);

        if (!reactivateProduct.fulfilled.match(result)) {
            setActionError(result.payload || "Couldn't reactivate this product.");
        }
    };


    /* ---------- loading / error ---------- */

    if (!loaded) {
        return (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 p-6 text-center text-gray-500">
                {loading ? (
                    <p>Loading product...</p>
                ) : (
                    <>
                        <p>{error || "We couldn't find this product."}</p>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => dispatch(fetchProductById(id))}
                                className="rounded-full bg-orange-400 px-5 py-2 text-sm font-medium text-white hover:bg-orange-500"
                            >
                                Try again
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate("/items")}
                                className="rounded-full bg-gray-100 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                            >
                                Back to products
                            </button>
                        </div>
                    </>
                )}
            </div>
        );
    }

    if (!matchesSelectedStatus) {
        return (
            <div className="flex min-h-[300px] flex-col items-center justify-center p-6 text-center">
                <p className="text-sm font-medium text-gray-700">
                    Product doesn't match the selected filter
                </p>

                <p className="mt-1 text-xs text-gray-500">
                    This product is not included in the selected status.
                </p>
            </div>
        );
    }

    /* ---------- view model ---------- */

    const sizes = Array.isArray(product.sizes) ? product.sizes : [];
    const units = Array.isArray(product.units) ? product.units : [];

    const image = imageOf(product);
    const inactive = (product.status || "").toUpperCase() === "INACTIVE";

    const category = pick(
        product.categoryName,
        product.category?.categoryName,
        product.category?.name,
        product.categoryId
    );

    const subCategory = pick(
        product.subCategoryName,
        product.subCategory?.subCategoryName,
        product.subCategory?.name,
        product.subCategoryId
    );

    const tax = pick(
        product.taxName,
        product.tax?.taxName,
        product.tax?.name,
        product.taxId
    );


    return (
        <div className="space-y-4 p-3">

            {/* TOP: PRODUCT DETAILS */}
            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">

                    {/* Product Image */}
                    <div className="flex h-38 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-100 sm:w-44">
                        {image ? (
                            <img
                                src={image}
                                alt={product.productName}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <ImageOff size={28} className="text-gray-400" />
                        )}
                    </div>

                    {/* Product Summary */}
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                            <h2 className="text-lg font-semibold text-gray-900">
                                {product.productName}
                            </h2>
                            <StatusBadge status={product.status} />
                        </div>

                        <p className="mt-2 max-w-2xl text-sm leading-5 text-gray-500">
                            {product.description || "No description added."}
                        </p>

                        <p className="mt-3 text-xl font-semibold text-[#0F4659]">
                            {money(product.sellingPrice)}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-5 text-xs text-gray-500">
                            <span>
                                <span className="font-medium text-gray-700">Sizes:</span>{" "}
                                {sizes.length
                                    ? sizes.map(sizeLabel).join(", ")
                                    : "-"}
                            </span>

                            <span>
                                <span className="font-medium text-gray-700">Units:</span>{" "}
                                {units.length
                                    ? units.map(unitLabel).join(", ")
                                    : "-"}
                            </span>

                            <span>
                                <span className="font-medium text-gray-700">Tax: </span>{" "}
                                {tax}
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col">
                        <button
                            type="button"
                            onClick={() => navigate("/items")}
                            className="rounded-full bg-[#ECE6D5] px-5 py-2.5 text-xs font-medium text-gray-700 transition hover:bg-gray-200"
                        >
                            Back
                        </button>

                        <button
                            type="button"
                            onClick={handleNew}
                            className="flex items-center justify-center gap-1.5 rounded-full bg-[#0F4659] px-5 py-2.5 text-xs font-medium text-white transition hover:bg-[#066b63]"
                        >
                            <Plus size={13} />
                            New Product
                        </button>

                        <button
                            type="button"
                            onClick={handleEdit}
                            className="flex items-center justify-center gap-1.5 rounded-full bg-orange-400 px-5 py-2.5 text-xs font-medium text-white transition hover:bg-orange-500"
                        >
                            <Pencil size={13} />
                            Edit Product
                        </button>

                        {/* {inactive ? (
                            <button
                                type="button"
                                onClick={handleReactivate}
                                disabled={busy}
                                className="flex items-center justify-center gap-1.5 rounded-full border border-emerald-200 px-5 py-2.5 text-xs font-medium text-emerald-600 transition hover:bg-emerald-50 disabled:opacity-60"
                            >
                                <RotateCcw size={13} />
                                {busy ? "Reactivating..." : "Reactivate"}
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={busy}
                                className="flex items-center justify-center gap-1.5 rounded-full border border-red-200 px-5 py-2.5 text-xs font-medium text-red-500 transition hover:bg-red-50 disabled:opacity-60"
                            >
                                <Trash2 size={13} />
                                {busy ? "Deleting..." : "Delete"}
                            </button>
                        )} */}
                    </div>
                </div>
            </div>

            {/* ERROR MESSAGE */}
            {actionError && (
                <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
                >
                    {actionError}
                </div>
            )}

            {/* BOTTOM: TWO COLUMNS */}
            <div className="grid grid-cols-1 items-start gap-2 sm:grid-cols-1">

                {/* LEFT: PRODUCT INFORMATION */}
                <Panel title="Product Information">
                    <div className="grid grid-cols-1 gap-2">
                        {/* <ReadField
                            label="Product Name"
                            value={product.productName}
                        /> */}

                        <div className="grid grid-cols-3 gap-3">
                            <ReadField
                                label="Product Categories"
                                value={category}
                            />
                            <ReadField
                                label="Sub Category"
                                value={subCategory}
                            />
                            <ReadField label="HSN Code" value={product.hsnCode} />
                        </div>

                        <div className="grid grid-cols-2 gap-3">

                        </div>
                    </div>
                </Panel>

                {/* RIGHT: PRICING & STOCK */}
                <Panel title="Pricing & Stock">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
                        <ReadField
                            label="Selling Price"
                            value={money(product.sellingPrice)}
                        />
                        <ReadField
                            label="Purchasing Price"
                            value={money(product.purchasingPrice)}
                        />


                        <ReadField
                            label="Minimum Stock"
                            value={product.minimumStock}
                        />
                        <ReadField
                            label="Maximum Stock"
                            value={product.maximumStock}
                        />

                        {/* <div className="flex flex-col gap-2">
                            <span className="text-sm font-medium text-gray-700">
                                Status
                            </span>
                            <div className="flex h-[46px] items-center">
                                <StatusBadge status={product.status} />
                            </div>
                        </div> */}
                    </div>
                </Panel>
            </div>
        </div>
    );

}