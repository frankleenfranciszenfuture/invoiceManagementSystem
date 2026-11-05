import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import {
    ArrowLeft,
    Tags,
    CalendarDays,
    ShieldCheck,
    FileText,
    Hash,
    Layers,
    FolderTree,
    Tag,
    AlignLeft,
} from "lucide-react";

import { fetchCategoryById } from "../thunks/categoryThunks";

// ------------------------------------------------------
// Helpers
// ------------------------------------------------------

const formatDateTime = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
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

const SectionCard = ({ title, icon: Icon, children }) => {
    return (
        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
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

            <div className="p-5">
                {children}
            </div>
        </section>
    );
};

const ReadField = ({ label, value }) => {
    return (
        <div className="min-w-0">
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
    const styles = {
        ACTIVE: "bg-green-100 text-green-700",
        INACTIVE: "bg-red-100 text-red-700",
        DRAFT: "bg-gray-100 text-gray-700",
    };

    return (
        <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles[status] || "bg-gray-100 text-gray-700"
                }`}
        >
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
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        {title}
                    </p>

                    <p className="mt-2 truncate text-lg font-bold text-gray-800">
                        {value || "—"}
                    </p>
                </div>

                <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${styles[color] || styles.blue
                        }`}
                >
                    <Icon size={20} />
                </div>
            </div>
        </div>
    );
};

// ------------------------------------------------------
// Main Component
// ------------------------------------------------------

const CategoryViewDetails = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();

    const {
        category,
        loading,
        error,
    } = useSelector((state) => state.category);

    // Fetch category details
    useEffect(() => {
        if (id) {
            dispatch(fetchCategoryById(id));
        }
    }, [dispatch, id]);

    // Prevent displaying stale category details
    const loaded =
        category && String(category.id) === String(id);

    const data = loaded ? category : null;
    const audit = data?.audit;

    const subCategories = Array.isArray(data?.subCategories)
        ? data.subCategories
        : [];

    const activeSubCategories = subCategories.filter(
        (item) => item.status === "ACTIVE"
    ).length;

    const inactiveSubCategories = subCategories.filter(
        (item) => item.status === "INACTIVE"
    ).length;

    // Loading
    if (loading && !loaded) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

                    <p className="mt-3 text-sm text-gray-500">
                        Loading category details...
                    </p>
                </div>
            </div>
        );
    }

    // Error / Not Found
    if (!loaded) {
        return (
            <div className="flex min-h-[400px] flex-col items-center justify-center">
                <Tags size={42} className="text-gray-300" />

                <h2 className="mt-3 text-lg font-semibold text-gray-700">
                    Category Not Found
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                    {typeof error === "string"
                        ? error
                        : "Unable to load category details."}
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

    return (
        <div className="mt-3 space-y-6 pb-8">

            {/* Header */}
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                    <div className="flex items-start gap-3">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            title="Go back"
                            className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50"
                        >
                            <ArrowLeft size={18} />
                        </button>

                        <div>
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-xl font-bold text-gray-800">
                                    {data.categoryName}
                                </h1>

                                <StatusBadge status={data.status} />
                            </div>

                            <p className="mt-1 text-sm text-gray-500">
                                Category Details
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600">
                        <CalendarDays size={16} className="text-gray-400" />
                        Created {formatDateTime(audit?.createdAt)}
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <InfoCard
                    title="Category Code"
                    value={data.categoryCode}
                    icon={Hash}
                    color="blue"
                />

                <InfoCard
                    title="Category Status"
                    value={formatLabel(data.status)}
                    icon={ShieldCheck}
                    color="green"
                />

                <InfoCard
                    title="Total Subcategories"
                    value={subCategories.length}
                    icon={Layers}
                    color="purple"
                />

                <InfoCard
                    title="Active Subcategories"
                    value={activeSubCategories}
                    icon={FolderTree}
                    color="amber"
                />
            </div>

            {/* Category Information */}
            <SectionCard
                title="Category Information"
                icon={Tags}
            >
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <ReadField
                        label="Category Code"
                        value={data.categoryCode}
                    />

                    <ReadField
                        label="Category Name"
                        value={data.categoryName}
                    />

                    <ReadField
                        label="Category Status"
                        value={<StatusBadge status={data.status} />}
                    />

                    <ReadField
                        label="Category ID"
                        value={data.id}
                    />

                    <div className="sm:col-span-2 lg:col-span-4">
                        <ReadField
                            label="Description"
                            value={data.description}
                        />
                    </div>
                </div>
            </SectionCard>

            {/* Subcategory Information */}
            <SectionCard
                title={`Subcategory Information (${subCategories.length})`}
                icon={Layers}
            >
                {subCategories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <FolderTree
                            size={38}
                            className="text-gray-300"
                        />

                        <p className="mt-3 text-sm font-medium text-gray-600">
                            No subcategories found
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                            Subcategories created under this category will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[750px] text-left">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50">
                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Subcategory
                                    </th>

                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Code
                                    </th>

                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Description
                                    </th>

                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Display Order
                                    </th>

                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Status
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {subCategories.map((subCategory) => (
                                    <tr
                                        key={subCategory.id}
                                        className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                                    <Tag size={17} />
                                                </div>

                                                <div>
                                                    <p className="text-sm font-semibold text-gray-800">
                                                        {subCategory.name || "—"}
                                                    </p>

                                                    <p className="mt-1 text-xs text-gray-400">
                                                        ID: {subCategory.id ?? "—"}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-4 py-4 text-sm font-medium text-gray-600">
                                            {subCategory.subCategoryCode || "—"}
                                        </td>

                                        <td className="max-w-[250px] px-4 py-4 text-sm text-gray-600">
                                            <p className="line-clamp-2">
                                                {subCategory.description || "—"}
                                            </p>
                                        </td>

                                        <td className="px-4 py-4 text-sm text-gray-600">
                                            {subCategory.displayOrder ?? "—"}
                                        </td>

                                        <td className="px-4 py-4">
                                            <StatusBadge
                                                status={subCategory.status}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </SectionCard>

            {/* Subcategory Summary */}
            <SectionCard
                title="Subcategory Summary"
                icon={FolderTree}
            >
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <ReadField
                        label="Total Subcategories"
                        value={subCategories.length}
                    />

                    <ReadField
                        label="Active Subcategories"
                        value={activeSubCategories}
                    />

                    <ReadField
                        label="Inactive Subcategories"
                        value={inactiveSubCategories}
                    />

                    <ReadField
                        label="Parent Category"
                        value={data.categoryName}
                    />
                </div>
            </SectionCard>

            {/* Audit Information */}
            <SectionCard
                title="Audit Information"
                icon={FileText}
            >
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
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

export default CategoryViewDetails;