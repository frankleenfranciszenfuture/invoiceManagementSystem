import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { Pencil, Trash2, RotateCcw, ImageOff } from "lucide-react";

// Adjust these paths to match your folder structure
import {
    fetchProductById,
    deleteProduct,
    reactivateProduct,
} from "../thunks/productThunks";
import { setExsistingProduct } from "../slices/productSlice";


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
    <div className={`flex flex-col gap-2 ${className}`}>
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <div
            className={`w-full break-words rounded-xl border border-gray-200 px-4 py-3 text-sm ${tall ? "min-h-[120px] whitespace-pre-wrap bg-gray-50" : "bg-white"
                } ${value ? "text-gray-800" : "text-gray-400"}`}
        >
            {value || "-"}
        </div>
    </div>
);

const Chip = ({ label, small = false, selected = true }) => (
    <span
        className={`inline-flex items-center justify-center rounded-lg border font-medium ${small ? "h-6 min-w-7 px-1 text-[9px]" : "h-10 min-w-12 px-3 text-sm"
            } ${selected
                ? "border-orange-400 bg-orange-50 text-gray-900"
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

    const [busy, setBusy] = useState(false);
    const [actionError, setActionError] = useState("");

    /* ---------- load ---------- */

    useEffect(() => {
        if (id) dispatch(fetchProductById(id));
    }, [id, dispatch]);

    // Ignore a stale product left in the store from a previous page
    const loaded = product && String(product.id) === String(id);

    /* ---------- actions ---------- */

    const handleEdit = () => {
        dispatch(setExsistingProduct(product));
        navigate(`/products/${product.id}/edit`);
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
                                onClick={() => navigate("/products")}
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
        <div className="grid grid-cols-1 gap-5 p-4 lg:grid-cols-[350px_minmax(0,1fr)]">

            {/* ---------- LEFT: PRODUCT CARD ---------- */}

            <aside className="h-fit rounded-2xl bg-white p-3 shadow-sm lg:sticky lg:top-4">

                <div className="flex aspect-[3/3] items-center justify-center overflow-hidden rounded-xl bg-gray-200">
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

                <div className="mt-3 flex items-start justify-between gap-2">
                    <h3 className="text-[15px] font-semibold leading-tight text-gray-900">
                        {product.productName}
                    </h3>
                    <StatusBadge status={product.status} />
                </div>

                <p className="mt-1 line-clamp-2 min-h-[2rem] text-[11px] leading-4 text-gray-500">
                    {product.description || "No description added."}
                </p>

                <p className="mt-2 text-sm font-semibold text-gray-900">
                    {money(product.sellingPrice)}
                </p>

                <div className="mt-3 grid grid-cols-2 gap-3">
                    <div>
                        <p className="mb-1.5 text-[11px] text-gray-500">Size :</p>
                        <div className="flex flex-wrap gap-1">
                            {sizes.length ? (
                                sizes.map((s, i) => (
                                    <span
                                        key={sizeKey(s, i)}
                                        className="flex h-6 min-w-7 items-center justify-center rounded-md bg-gray-100 px-1 text-[9px] text-gray-600"
                                    >
                                        {sizeLabel(s)}
                                    </span>
                                ))
                            ) : (
                                <span className="text-[11px] text-gray-400">-</span>
                            )}
                        </div>
                    </div>

                    <div>
                        <p className="mb-1.5 text-[11px] text-gray-500">Units :</p>
                        <div className="flex flex-wrap gap-1">
                            {units.length ? (
                                units.map((u, i) => (
                                    <span
                                        key={unitKey(u, i)}
                                        className="flex h-6 min-w-7 items-center justify-center rounded-md bg-gray-100 px-1 text-[9px] text-gray-600"
                                    >
                                        {unitLabel(u)}
                                    </span>
                                ))
                            ) : (
                                <span className="text-[11px] text-gray-400">-</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                        type="button"
                        onClick={() => navigate("/products")}
                        className="rounded-full bg-gray-100 py-2.5 text-xs font-medium text-gray-700 transition hover:bg-gray-200"
                    >
                        Back
                    </button>

                    <button
                        type="button"
                        onClick={handleEdit}
                        className="flex items-center justify-center gap-1.5 rounded-full bg-orange-400 py-2.5 text-xs font-medium text-white transition hover:bg-orange-500"
                    >
                        <Pencil size={13} />
                        Edit Product
                    </button>
                </div>

                {inactive ? (
                    <button
                        type="button"
                        onClick={handleReactivate}
                        disabled={busy}
                        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-full border border-emerald-200 py-2.5 text-xs font-medium text-emerald-600 transition hover:bg-emerald-50 disabled:opacity-60"
                    >
                        <RotateCcw size={13} />
                        {busy ? "Reactivating..." : "Reactivate"}
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={busy}
                        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-full border border-red-200 py-2.5 text-xs font-medium text-red-500 transition hover:bg-red-50 disabled:opacity-60"
                    >
                        <Trash2 size={13} />
                        {busy ? "Deleting..." : "Delete"}
                    </button>
                )}
            </aside>


            {/* ---------- RIGHT: DETAILS ---------- */}

            <div className="space-y-5">

                {actionError && (
                    <div
                        role="alert"
                        className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
                    >
                        {actionError}
                    </div>
                )}



                <Panel title="Product Information">

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <ReadField label="Product Name" value={product.productName} />
                        <ReadField label="Product Categories" value={category} />
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
                        <ReadField label="Brand" value={product.brand} />
                        <ReadField label="Sub Category" value={subCategory} />
                        <ReadField label="HSN Code" value={product.hsnCode} />
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div>
                            <p className="mb-2 text-sm font-medium text-gray-700">Size :</p>
                            <div className="flex flex-wrap gap-2">
                                {sizes.length ? (
                                    sizes.map((s, i) => (
                                        <Chip key={sizeKey(s, i)} label={sizeLabel(s)} />
                                    ))
                                ) : (
                                    <span className="text-sm text-gray-400">No sizes added</span>
                                )}
                            </div>
                        </div>

                        <div>
                            <p className="mb-2 text-sm font-medium text-gray-700">Units :</p>
                            <div className="flex flex-wrap gap-2">
                                {units.length ? (
                                    units.map((u, i) => (
                                        <Chip key={unitKey(u, i)} label={unitLabel(u)} />
                                    ))
                                ) : (
                                    <span className="text-sm text-gray-400">No units added</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* <ReadField
                        label="Description"
                        value={product.description}
                        className="mt-5"
                        tall
                    /> */}
                </Panel>


                <Panel title="Pricing & Stock">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                        <ReadField label="Selling Price" value={money(product.sellingPrice)} />
                        <ReadField label="Purchasing Price" value={money(product.purchasingPrice)} />
                        <ReadField label="Tax" value={tax} />
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
                        <ReadField label="Minimum Stock" value={product.minimumStock} />
                        <ReadField label="Maximum Stock" value={product.maximumStock} />

                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-medium text-gray-700">Status</span>
                            <div className="flex h-[46px] items-center">
                                <StatusBadge status={product.status} />
                            </div>
                        </div>
                    </div>
                </Panel>
            </div>
        </div>
    );
}