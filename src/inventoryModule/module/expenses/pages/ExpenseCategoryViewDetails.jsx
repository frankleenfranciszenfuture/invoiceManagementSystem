
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import {
    ArrowLeft,
    Tag,
    CalendarDays,
    ShieldCheck,
    FileText,
    Hash,
    ClipboardList,
    Layers,
    CheckCircle,
} from "lucide-react";

import { fetchExpenseCategoryById } from "../thunks/expenseCategoryThunks";

// ======================================================
// HELPERS
// ======================================================

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

    return String(value)
        .toLowerCase()
        .replaceAll("_", " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

// ======================================================
// REUSABLE COMPONENTS
// ======================================================

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

            <div className="break-words text-sm font-medium text-gray-700">
                {value === null || value === undefined || value === ""
                    ? "—"
                    : value}
            </div>
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

// ======================================================
// MAIN COMPONENT
// ======================================================

const ExpenseCategoryViewDetails = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();

    const {
        expenseCategory,
        existingExpenseCategory,
        loading,
        error,
    } = useSelector((state) => state.expenseCategory);

    // Fetch category details
    useEffect(() => {
        if (id) {
            dispatch(fetchExpenseCategoryById(id));
        }
    }, [dispatch, id]);

    // Support either selected-category state property.
    const selectedCategory =
        expenseCategory?.id != null &&
            String(expenseCategory.id) === String(id)
            ? expenseCategory
            : existingExpenseCategory?.id != null &&
                String(existingExpenseCategory.id) === String(id)
                ? existingExpenseCategory
                : null;

    const data = selectedCategory;
    const audit = data?.audit;

    // Loading
    if (loading && !data) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

                    <p className="mt-3 text-sm text-gray-500">
                        Loading expense category details...
                    </p>
                </div>
            </div>
        );
    }

    // Error / Not Found
    if (!data) {
        return (
            <div className="flex min-h-[400px] flex-col items-center justify-center">
                <Tag size={42} className="text-gray-300" />

                <h2 className="mt-3 text-lg font-semibold text-gray-700">
                    Expense Category Not Found
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                    {error || "Unable to load expense category details."}
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
                                    {data.categoryName || "Expense Category Details"}
                                </h1>

                                <StatusBadge status={data.status} />
                            </div>

                            <p className="mt-1 text-sm text-gray-500">
                                Expense Category Details
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600">
                        <Layers size={16} className="text-gray-400" />
                        {formatLabel(data.expenseType)}
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
                    title="Category Name"
                    value={data.categoryName}
                    icon={Tag}
                    color="green"
                />

                <InfoCard
                    title="Expense Type"
                    value={formatLabel(data.expenseType)}
                    icon={Layers}
                    color="purple"
                />

                <InfoCard
                    title="Status"
                    value={formatLabel(data.status)}
                    icon={CheckCircle}
                    color="amber"
                />
            </div>

            {/* Category Information */}
            <SectionCard
                title="Category Information"
                icon={Tag}
            >
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <ReadField
                        label="Category ID"
                        value={data.id}
                    />

                    <ReadField
                        label="Category Code"
                        value={data.categoryCode}
                    />

                    <ReadField
                        label="Category Name"
                        value={data.categoryName}
                    />

                    <ReadField
                        label="Expense Type"
                        value={formatLabel(data.expenseType)}
                    />

                    <ReadField
                        label="Status"
                        value={<StatusBadge status={data.status} />}
                    />
                </div>

                {data.description && (
                    <div className="mt-5 border-t border-gray-100 pt-4">
                        <ReadField
                            label="Description"
                            value={data.description}
                        />
                    </div>
                )}
            </SectionCard>

            {/* Status Information */}
            <SectionCard
                title="Status Information"
                icon={ShieldCheck}
            >
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <ReadField
                        label="Category Status"
                        value={<StatusBadge status={data.status} />}
                    />

                    <ReadField
                        label="Expense Type"
                        value={formatLabel(data.expenseType)}
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

export default ExpenseCategoryViewDetails;
