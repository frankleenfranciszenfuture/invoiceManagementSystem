import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import {
    Pencil,
    FileText,
    Wallet,
    UserRound,
    Users,
    CreditCard,
    Building2,
    History,
    Mail,
    Phone,
    MapPin,
    Hash,
    Trash2,
} from "lucide-react";

// Adjust these paths to match your folder structure
import {
    getCustomerById,
    editCustomer,
    removeCustomer,
} from "../thunks/customerThunks";
import {
    setEditingField,
    updateSelectedCustomerField,
    setSelectedCustomerAddressField,
    copySelectedBillingToShipping,
    resetDirty,
    addRecentActivity,
    clearSelectedCustomer,
} from "../slices/customerSlices";


// ============================================================
// HELPERS
// ============================================================

const money = (value, currency) =>
    `${currency || "₹"} ${Number(value || 0).toLocaleString("en-IN")}`;

const initialsOf = (name = "") =>
    name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join("") || "?";

const fmtDate = (v) =>
    v
        ? new Date(v).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        })
        : "-";

const fmtDateTime = (v) =>
    v
        ? new Date(v).toLocaleString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
        : "";

const cap = (s = "") => s.charAt(0).toUpperCase() + s.slice(1);

const TONES = {
    teal: "border-[#088178] text-[#088178]",
    green: "border-emerald-500 text-emerald-500",
    red: "border-rose-500 text-rose-500",
};

// activity.type -> colour + icon (unknown types fall back to teal / FileText)
const TYPE_TONE = { payment: "green", deleted: "red" };
const TYPE_ICON = {
    payment: Wallet,
    invoice: FileText,
    profile: UserRound,
    address: MapPin,
};

const PROFILE_FIELDS = [
    ["displayName", "Display name"],
    ["companyName", "Company"],
    ["firstName", "First name"],
    ["lastName", "Last name"],
    ["email", "Email", "email"],
    ["mobile", "Mobile", "tel"],
    ["workPhone", "Work phone", "tel"],
    ["pan", "PAN"],
    ["designation", "Designation"],
    ["department", "Department"],
];

const ADDRESS_FIELDS = [
    ["attention", "Attention"],
    ["address", "Street"],
    ["city", "City"],
    ["state", "State"],
    ["zipCode", "Zip code"],
    ["country", "Country"],
];

const inputCls =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-[#088178] focus:ring-4 focus:ring-[#088178]/15";

const formatAddress = (a = {}) =>
    [a.attention, a.address, a.city, a.state, a.zipCode, a.country]
        .filter(Boolean)
        .join(", ");


// ============================================================
// SMALL PIECES
// ============================================================

const Card = ({ className = "", children }) => (
    <section
        className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}
    >
        {children}
    </section>
);

const CardHeader = ({ icon: Icon, title, right }) => (
    <header className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <div className="flex items-center gap-3 text-slate-700">
            <Icon size={18} className="text-[#088178]" />
            <h2 className="text-[15px] font-semibold">{title}</h2>
        </div>

        {right}
    </header>
);

const Stat = ({ label, value, tone = "text-slate-800", small = false }) => (
    <div className="min-w-[50%] flex-1 border-l border-slate-200 pl-5 first:border-l-0 first:pl-0 sm:min-w-0">
        <p className="text-[10px] font-semibold uppercase leading-tight tracking-[0.14em] text-slate-400">
            {label}
        </p>
        <p
            className={`mt-1 font-light tabular-nums ${tone} ${small ? "text-xl leading-[36px]" : "text-3xl"
                }`}
        >
            {value}
        </p>
    </div>
);

const SummaryItem = ({ label, value }) => (
    <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            {label}
        </p>
        <p className="mt-1 break-words text-sm text-slate-700">{value || "-"}</p>
    </div>
);

const DetailRow = ({ icon: Icon, label, value, link }) => (
    <div className="flex items-start gap-4 py-3">
        <span className="flex w-40 shrink-0 items-center justify-start gap-2 text-sm text-slate-400">
            <Icon size={14} />
            {label}
        </span>

        <span
            className={`min-w-0 break-words text-sm ${link ? "text-[#088178]" : "text-slate-700"
                }`}
        >
            {value || "-"}
        </span>
    </div>
);

const TextField = ({ label, value, onChange, type = "text" }) => (
    <label className="flex flex-col gap-1.5">
        <span className="text-xs text-slate-400">{label}</span>
        <input
            type={type}
            value={value || ""}
            onChange={onChange}
            className={inputCls}
        />
    </label>
);


// ============================================================
// PAGE
// ============================================================

export default function CustomerProfileOverview() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // NOTE: the store key must match your configureStore reducer key ("customer")
    const {
        selectedCustomer: customer,
        loading,
        error,
        editingField,
        isDirty,
        activities,
        recentActivities,
        totalYouPay,
        totalYouCollect,
    } = useSelector((state) => state.customers);

    const [filter, setFilter] = useState("all");
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState("");

    const editing = editingField === "profile";


    // ---------- load / cleanup ----------

    useEffect(() => {
        if (id) dispatch(getCustomerById(id));

        return () => {
            dispatch(clearSelectedCustomer());
            dispatch(setEditingField(null));
        };
    }, [id, dispatch]);


    // ---------- derived data ----------

    const allActivities = useMemo(
        () =>
            [...(recentActivities || []), ...(activities || [])].sort(
                (a, b) =>
                    new Date(b.createdAt || b.date || 0) -
                    new Date(a.createdAt || a.date || 0)
            ),
        [recentActivities, activities]
    );

    const activityTypes = useMemo(
        () => [...new Set(allActivities.map((a) => a.type).filter(Boolean))],
        [allActivities]
    );

    const visibleActivities = allActivities.filter(
        (item) => filter === "all" || item.type === filter
    );

    const completeness = useMemo(() => {
        if (!customer) return 0;

        const checks = [
            customer.displayName,
            customer.companyName,
            customer.email,
            customer.mobile,
            customer.workPhone,
            customer.currency,
            customer.pan,
            customer.billingAddress?.address,
            customer.billingAddress?.city,
            customer.shippingAddress?.address,
        ];

        return Math.round(
            (checks.filter(Boolean).length / checks.length) * 100
        );
    }, [customer]);


    // ---------- actions ----------

    const setField = (field) => (e) =>
        dispatch(updateSelectedCustomerField({ field, value: e.target.value }));

    const setAddress = (addressType, field) => (e) =>
        dispatch(
            setSelectedCustomerAddressField({
                addressType,
                field,
                value: e.target.value,
            })
        );

    const startEdit = () => {
        setSaveError("");
        dispatch(setEditingField("profile"));
    };

    const cancelEdit = () => {
        setSaveError("");
        dispatch(setEditingField(null));
        dispatch(resetDirty());
        dispatch(getCustomerById(id)); // discard unsaved changes
    };

    const save = async () => {
        setSaving(true);
        setSaveError("");

        const result = await dispatch(editCustomer(customer));

        setSaving(false);

        if (editCustomer.fulfilled.match(result)) {
            dispatch(addRecentActivity({ type: "profile", title: "Profile updated" }));
            dispatch(resetDirty());
            dispatch(setEditingField(null));
        } else {
            const p = result.payload;
            setSaveError(
                typeof p === "string" ? p : p?.message || "Couldn't save changes. Try again."
            );
        }
    };

    const togglePortal = async () => {
        const next = !customer.enablePortal;

        const result = await dispatch(
            editCustomer({ ...customer, enablePortal: next })
        );

        if (editCustomer.fulfilled.match(result)) {
            dispatch(
                addRecentActivity({
                    type: "profile",
                    title: next ? "Portal access enabled" : "Portal access disabled",
                })
            );
        }
    };

    const remove = async () => {
        if (!window.confirm(`Delete ${customer.displayName}? This can't be undone.`))
            return;

        const result = await dispatch(removeCustomer(customer.id));

        if (removeCustomer.fulfilled.match(result)) navigate("/customers");
    };


    // ---------- loading / empty ----------

    if (loading && !customer) {
        return <p className="p-6 py-16 text-center text-slate-400">Loading customer...</p>;
    }

    if (!customer) {
        return (
            <p className="p-6 py-16 text-center text-slate-400">
                {error
                    ? "We couldn't load this customer. Check your connection and try again."
                    : "This customer doesn't exist or was deleted."}
            </p>
        );
    }


    // ---------- view model ----------

    const status = (customer.status || "Active").toUpperCase();
    const active = status === "ACTIVE";
    const currency = customer.currency;

    const location = [
        customer.billingAddress?.city,
        customer.billingAddress?.state,
        customer.billingAddress?.country,
    ]
        .filter(Boolean)
        .join(", ");

    const contactRole = [customer.designation, customer.department]
        .filter(Boolean)
        .join(", ");

    const phone = customer.mobile
        ? `${customer.mobileCode || ""} ${customer.mobile}`.trim()
        : customer.workPhone
            ? `${customer.workPhoneCode || ""} ${customer.workPhone}`.trim()
            : "";


    return (
        <div className="space-y-6 p-6">

            {/* ================= PAGE TITLE ================= */}

            {/* <h1 className="text-2xl font-light text-slate-500">
                Customer Profile
            </h1> */}


            {/* ================= PROFILE HEADER ================= */}

            <div className="flex flex-wrap items-center justify-between gap-6">

                <div className="flex items-center gap-5">

                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#4EBBB4] to-[#088178] text-3xl font-semibold text-white shadow-md ring-4 ring-white">
                        {initialsOf(customer.displayName)}
                    </div>

                    <div className="leading-tight">
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-semibold text-slate-800">
                                {customer.displayName || "Unnamed customer"}
                            </h2>

                            <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                                {customer.customerType || "Business"}
                            </span>
                        </div>

                        <p className="mt-1 text-sm text-slate-400">
                            {contactRole || "No designation added"}
                        </p>

                        <span
                            className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide ${active
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-slate-100 text-slate-500"
                                }`}
                        >
                            <span
                                className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-slate-400"
                                    }`}
                            />
                            {status}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3 pr-4 leading-tight">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#088178]/10 text-[#088178]">
                        <Building2 size={20} />
                    </span>

                    <div>
                        <p className="text-base font-semibold text-slate-700">
                            {customer.companyName || "No company"}
                        </p>
                        <p className="text-sm text-slate-400">{location || "No location added"}</p>
                    </div>
                </div>
            </div>


            {/* ================= STATS ================= */}

            <div className="flex flex-wrap gap-y-4 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
                <Stat
                    label="You collect"
                    value={money(totalYouCollect, currency)}
                    tone="text-emerald-600"
                />
                <Stat
                    label="You pay"
                    value={money(totalYouPay, currency)}
                    tone="text-rose-500"
                />
                <Stat
                    label="Contact persons"
                    value={customer.contactPersons?.length || 0}
                />
                <Stat
                    label="Payment terms"
                    value={customer.paymentTerms || "-"}
                    tone="text-[#088178]"
                    small
                />
            </div>


            {/* ================= TWO COLUMNS ================= */}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

                {/* ---------- LEFT (2/3) ---------- */}

                <div className="space-y-6 xl:col-span-2">

                    {saveError && (
                        <div
                            role="alert"
                            className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                        >
                            {saveError}
                        </div>
                    )}

                    {/* Profile details */}
                    <Card>
                        <CardHeader
                            icon={UserRound}
                            title="Profile Details"
                            right={
                                editing ? (
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={cancelEdit}
                                            disabled={saving}
                                            className="rounded-lg px-3 py-1.5 text-sm text-slate-500 transition hover:bg-slate-100"
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="button"
                                            onClick={save}
                                            disabled={saving || !isDirty}
                                            className="rounded-lg bg-[#088178] px-4 py-1.5 text-sm font-medium text-white transition hover:bg-[#066b63] disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {saving ? "Saving..." : "Save changes"}
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={startEdit}
                                        className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-slate-500 transition hover:bg-[#088178]/10 hover:text-[#088178]"
                                    >
                                        <Pencil size={14} />
                                        Edit Profile
                                    </button>
                                )
                            }
                        />

                        {editing ? (
                            <div className="space-y-6 px-6 py-5">

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    {PROFILE_FIELDS.map(([field, label, type]) => (
                                        <TextField
                                            key={field}
                                            label={label}
                                            type={type}
                                            value={customer[field]}
                                            onChange={setField(field)}
                                        />
                                    ))}

                                    <label className="flex flex-col gap-1.5">
                                        <span className="text-xs text-slate-400">Status</span>
                                        <select
                                            value={customer.status || "Active"}
                                            onChange={setField("status")}
                                            className={inputCls}
                                        >
                                            <option>Active</option>
                                            <option>Inactive</option>
                                        </select>
                                    </label>
                                </div>

                                {[
                                    ["billingAddress", "Billing address"],
                                    ["shippingAddress", "Shipping address"],
                                ].map(([type, title]) => (
                                    <div key={type}>
                                        <div className="mb-3 flex items-center justify-between">
                                            <h3 className="text-sm font-semibold text-slate-600">
                                                {title}
                                            </h3>

                                            {type === "shippingAddress" && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        dispatch(copySelectedBillingToShipping())
                                                    }
                                                    className="text-sm text-[#088178] hover:underline"
                                                >
                                                    Copy from billing
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            {ADDRESS_FIELDS.map(([field, label]) => (
                                                <TextField
                                                    key={field}
                                                    label={label}
                                                    value={customer[type]?.[field]}
                                                    onChange={setAddress(type, field)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50 px-6 py-2">
                                <DetailRow
                                    icon={UserRound}
                                    label="Name"
                                    value={[customer.salutation, customer.firstName, customer.lastName]
                                        .filter(Boolean)
                                        .join(" ")}
                                />
                                <DetailRow icon={Mail} label="Email" value={customer.email} link />
                                <DetailRow icon={Phone} label="Phone" value={phone} link />
                                <DetailRow icon={Hash} label="PAN" value={customer.pan} />
                                <DetailRow
                                    icon={MapPin}
                                    label="Billing address"
                                    value={formatAddress(customer.billingAddress)}
                                />
                                <DetailRow
                                    icon={MapPin}
                                    label="Shipping address"
                                    value={formatAddress(customer.shippingAddress)}
                                />
                            </div>
                        )}
                    </Card>


                    {/* Activities */}
                    <Card>
                        <CardHeader icon={FileText} title="Customer Activities" />

                        <div className="space-y-5 px-6 py-5">

                            <div className="inline-flex flex-wrap gap-1 rounded-full bg-slate-100 p-1 text-sm">
                                {["all", ...activityTypes].map((key) => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => setFilter(key)}
                                        className={`rounded-full px-4 py-1.5 transition ${filter === key
                                            ? "bg-white font-medium text-slate-800 shadow-sm"
                                            : "text-slate-500 hover:text-slate-800"
                                            }`}
                                    >
                                        {cap(key)}
                                    </button>
                                ))}
                            </div>

                            {visibleActivities.length === 0 ? (
                                <p className="py-6 text-center text-sm text-slate-400">
                                    No activity yet. Changes to this customer will show up here.
                                </p>
                            ) : (
                                <ol className="relative ml-5">
                                    <span className="absolute bottom-2 left-0 top-2 border-l border-slate-200" />

                                    {visibleActivities.map((item, index) => {
                                        const Icon = TYPE_ICON[item.type] || FileText;
                                        const tone = item.tone || TYPE_TONE[item.type] || "teal";

                                        return (
                                            <li
                                                key={`${item.id ?? "a"}-${index}`}
                                                className="relative flex items-start gap-4 pb-6 pl-8 last:pb-0"
                                            >
                                                <span
                                                    className={`absolute -left-[18px] top-0 flex h-9 w-9 items-center justify-center rounded-full border-2 bg-white ${TONES[tone] || TONES.teal
                                                        }`}
                                                >
                                                    <Icon size={15} />
                                                </span>

                                                <div className="leading-tight">
                                                    <p className="text-sm font-medium text-slate-700">
                                                        {item.title}
                                                    </p>

                                                    {item.meta && (
                                                        <p className="mt-1 text-xs text-slate-500">
                                                            {item.meta}
                                                        </p>
                                                    )}

                                                    <p className="mt-1 text-xs text-slate-400">
                                                        {fmtDateTime(item.createdAt || item.date)}
                                                    </p>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ol>
                            )}
                        </div>
                    </Card>
                </div>


                {/* ---------- RIGHT (1/3) ---------- */}

                <div className="space-y-6">

                    {/* Account summary */}
                    <Card>
                        <CardHeader icon={CreditCard} title="Account Summary" />

                        <div className="px-6 py-5">

                            <div className="grid grid-cols-2 gap-5 border-b border-slate-100 pb-5">
                                <SummaryItem label="Customer since" value={fmtDate(customer.createdAt)} />
                                <SummaryItem label="Last updated" value={fmtDate(customer.updatedAt)} />
                                <SummaryItem label="Currency" value={currency} />
                                <SummaryItem label="Customer ID" value={customer.id} />
                            </div>

                            <div className="pt-5">
                                <div className="flex items-end justify-between">
                                    <div>
                                        <p className="text-3xl font-light tabular-nums text-slate-800">
                                            {money(totalYouCollect, currency)}
                                        </p>
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                                            Outstanding
                                        </p>
                                    </div>

                                    <span className="text-sm font-semibold text-[#088178]">
                                        {completeness}% complete
                                    </span>
                                </div>

                                <div
                                    role="progressbar"
                                    aria-label="Profile completeness"
                                    aria-valuenow={completeness}
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                    className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100"
                                >
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-[#4EBBB4] to-[#088178]"
                                        style={{ width: `${completeness}%` }}
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={togglePortal}
                                    className="mt-5 w-full rounded-xl bg-[#088178] py-2.5 text-sm font-medium text-white transition hover:bg-[#066b63]"
                                >
                                    {customer.enablePortal ? "Disable portal access" : "Enable portal access"}
                                </button>
                            </div>
                        </div>
                    </Card>


                    {/* Recent changes */}
                    <Card>
                        <CardHeader
                            icon={History}
                            title="Recent Changes"
                            right={<span className="text-xs text-slate-400">Last 5</span>}
                        />

                        {(recentActivities || []).length === 0 ? (
                            <p className="px-6 py-6 text-center text-sm text-slate-400">
                                No recent changes.
                            </p>
                        ) : (
                            <ul className="divide-y divide-slate-50 px-6">
                                {recentActivities.slice(0, 5).map((item, index) => {
                                    const Icon = TYPE_ICON[item.type] || FileText;

                                    return (
                                        <li
                                            key={`${item.id ?? "r"}-${index}`}
                                            className="flex items-center gap-3 py-3.5"
                                        >
                                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#088178]/10 text-[#088178]">
                                                <Icon size={15} />
                                            </span>

                                            <div className="min-w-0 flex-1 leading-tight">
                                                <p className="truncate text-sm text-slate-700">
                                                    {item.title}
                                                </p>
                                                <p className="mt-0.5 text-xs text-slate-400">
                                                    {fmtDateTime(item.createdAt)}
                                                </p>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </Card>


                    {/* Contact persons shortcut */}
                    {customer.contactPersons?.length > 0 && (
                        <Card>
                            <CardHeader icon={Users} title="Contact Persons" />

                            <ul className="divide-y divide-slate-50 px-6">
                                {customer.contactPersons.map((person, index) => (
                                    <li key={person.id ?? index} className="py-3.5 leading-tight">
                                        <p className="text-sm font-medium text-slate-700">
                                            {[person.salutation, person.firstName, person.lastName]
                                                .filter(Boolean)
                                                .join(" ")}
                                        </p>
                                        <p className="mt-0.5 text-xs text-slate-400">
                                            {[person.designation, person.email]
                                                .filter(Boolean)
                                                .join(" · ")}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    )}


                    <button
                        type="button"
                        onClick={remove}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 py-2.5 text-sm text-rose-600 transition hover:bg-rose-50"
                    >
                        <Trash2 size={14} />
                        Delete customer
                    </button>
                </div>
            </div>
        </div>
    );
}