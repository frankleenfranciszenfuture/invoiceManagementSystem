
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
    Building2,
    LayoutDashboard,
    UserRound,
    MapPin,
    History,
    Users,
    CreditCard,
    Trash2,
} from "lucide-react";

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

import CustomerOverviewTab from "../overviewCard/tabs/CustomerOverviewTab";
import CustomerProfileTab from "../overviewCard/tabs/CustomerProfileTab";
import CustomerAddressTab from "../overviewCard/tabs/CustomerAddressTab";
import CustomerActivitiesTab from "../overviewCard/tabs/CustomerActivitiesTab";
import CustomerContactPersonsTab from "../overviewCard/tabs/CustomerContactPersonsTab";
import CustomerAccountTab from "../overviewCard/tabs/CustomerAccountTab";

const TABS = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "profile", label: "Profile", icon: UserRound },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "activities", label: "Activities", icon: History },
    { id: "contacts", label: "Contact Persons", icon: Users },
    { id: "account", label: "Account", icon: CreditCard },
];

const initialsOf = (name = "") =>
    name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join("") || "?";

const formatAddress = (address = {}) =>
    [
        address.attention,
        address.address,
        address.city,
        address.state,
        address.zipCode,
        address.country,
    ]
        .filter(Boolean)
        .join(", ");

export default function CustomerProfileOverview() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

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

    const [activeTab, setActiveTab] = useState("overview");
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState("");
    const [portalUpdating, setPortalUpdating] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const editingProfile = editingField === "profile";
    const editingAddresses = editingField === "addresses";
    const editing = editingProfile || editingAddresses;

    useEffect(() => {
        if (id) {
            dispatch(getCustomerById(id));
        }

        return () => {
            dispatch(clearSelectedCustomer());
            dispatch(setEditingField(null));
            dispatch(resetDirty());
        };
    }, [id, dispatch]);

    const allActivities = useMemo(
        () =>
            [...(recentActivities || []), ...(activities || [])].sort(
                (a, b) =>
                    new Date(b.createdAt || b.date || 0) -
                    new Date(a.createdAt || a.date || 0)
            ),
        [recentActivities, activities]
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

    const setField = (field) => (event) => {
        dispatch(
            updateSelectedCustomerField({
                field,
                value: event.target.value,
            })
        );
    };

    const setAddress = (addressType, field) => (event) => {
        dispatch(
            setSelectedCustomerAddressField({
                addressType,
                field,
                value: event.target.value,
            })
        );
    };

    const startEdit = (section) => {
        setSaveError("");
        dispatch(setEditingField(section));
    };

    const cancelEdit = async () => {
        setSaveError("");
        dispatch(setEditingField(null));
        dispatch(resetDirty());

        // Reload the saved customer to discard unsaved changes.
        if (id) {
            await dispatch(getCustomerById(id));
        }
    };

    const save = async () => {
        if (!customer || saving) return;

        setSaving(true);
        setSaveError("");

        try {
            const result = await dispatch(editCustomer(customer));

            if (editCustomer.fulfilled.match(result)) {
                dispatch(
                    addRecentActivity({
                        type: "profile",
                        title: "Customer details updated",
                        createdAt: new Date().toISOString(),
                    })
                );

                dispatch(resetDirty());
                dispatch(setEditingField(null));
            } else {
                const payload = result.payload;

                setSaveError(
                    typeof payload === "string"
                        ? payload
                        : payload?.message ||
                        result.error?.message ||
                        "Couldn't save changes. Please try again."
                );
            }
        } catch (err) {
            setSaveError(
                err?.message || "Couldn't save changes. Please try again."
            );
        } finally {
            setSaving(false);
        }
    };

    const togglePortal = async () => {
        if (!customer || portalUpdating) return;

        const next = !customer.enablePortal;

        setPortalUpdating(true);
        setSaveError("");

        try {
            const result = await dispatch(
                editCustomer({
                    ...customer,
                    enablePortal: next,
                })
            );

            if (editCustomer.fulfilled.match(result)) {
                dispatch(
                    addRecentActivity({
                        type: "profile",
                        title: next
                            ? "Portal access enabled"
                            : "Portal access disabled",
                        createdAt: new Date().toISOString(),
                    })
                );
            } else {
                const payload = result.payload;

                setSaveError(
                    typeof payload === "string"
                        ? payload
                        : payload?.message ||
                        "Couldn't update portal access."
                );
            }
        } finally {
            setPortalUpdating(false);
        }
    };

    const remove = async () => {
        if (!customer || deleting) return;

        const confirmed = window.confirm(
            `Delete ${customer.displayName || "this customer"}? This can't be undone.`
        );

        if (!confirmed) return;

        setDeleting(true);

        try {
            const result = await dispatch(removeCustomer(customer.id));

            if (removeCustomer.fulfilled.match(result)) {
                navigate("/customers");
            } else {
                const payload = result.payload;
                setSaveError(
                    typeof payload === "string"
                        ? payload
                        : payload?.message || "Couldn't delete customer."
                );
            }
        } finally {
            setDeleting(false);
        }
    };

    if (loading && !customer) {
        return (
            <p className="px-6 py-16 text-center text-slate-400">
                Loading customer...
            </p>
        );
    }

    if (!customer) {
        return (
            <div className="px-6 py-16 text-center">
                <p className="text-slate-500">
                    {error
                        ? "We couldn't load this customer. Check your connection and try again."
                        : "This customer doesn't exist or was deleted."}
                </p>

                <button
                    type="button"
                    onClick={() => navigate("/customers")}
                    className="mt-4 text-sm font-medium text-[#088178] hover:underline"
                >
                    Back to customers
                </button>
            </div>
        );
    }

    const status = (customer.status || "Active").toUpperCase();
    const active = status === "ACTIVE";
    const currency = customer.currency || "₹";

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
        <div className="mt-5 space-y-6 rounded-md border border-gray-200 p-4 sm:p-6">
            {/* Customer header */}
            <div className="flex flex-wrap items-center justify-between gap-5">
                <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#4EBBB4] to-[#088178] text-2xl font-semibold text-white shadow-md ring-4 ring-white sm:h-24 sm:w-24 sm:text-3xl">
                        {initialsOf(customer.displayName)}
                    </div>

                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="break-words text-xl font-semibold text-slate-800">
                                {customer.displayName || "Unnamed customer"}
                            </h1>

                            <span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                                {customer.customerType || "Business"}
                            </span>
                        </div>

                        <p className="mt-1 text-sm text-slate-400">
                            {contactRole || "No designation added"}
                        </p>

                        <span
                            className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${active
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

                <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#088178]/10 text-[#088178]">
                        <Building2 size={20} />
                    </span>

                    <div className="min-w-0">
                        <p className="break-words text-base font-semibold text-slate-700">
                            {customer.companyName || "No company"}
                        </p>
                        <p className="text-sm text-slate-400">
                            {location || "No location added"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Financial summary */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                    {
                        label: "You collect",
                        value: `${currency} ${Number(totalYouCollect || 0).toLocaleString("en-IN")}`,
                        color: "text-emerald-600",
                    },
                    {
                        label: "You pay",
                        value: `${currency} ${Number(totalYouPay || 0).toLocaleString("en-IN")}`,
                        color: "text-rose-500",
                    },
                    {
                        label: "Contact persons",
                        value: customer.contactPersons?.length || 0,
                        color: "text-slate-800",
                    },
                    {
                        label: "Payment terms",
                        value: customer.paymentTerms || "-",
                        color: "text-[#088178]",
                    },
                ].map((item) => (
                    <div
                        key={item.label}
                        className="min-w-0 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm"
                    >
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                            {item.label}
                        </p>
                        <p className={`mt-2 break-words text-xl font-medium ${item.color}`}>
                            {item.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200">
                <div className="flex gap-5 overflow-x-auto sm:gap-7">
                    {TABS.map(({ id: tabId, label, icon: Icon }) => (
                        <button
                            key={tabId}
                            type="button"
                            onClick={() => setActiveTab(tabId)}
                            className={`flex shrink-0 items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium transition ${activeTab === tabId
                                ? "border-[#088178] text-[#088178]"
                                : "border-transparent text-slate-500 hover:text-slate-800"
                                }`}
                        >
                            <Icon size={16} />
                            {label}
                            {tabId === "contacts" &&
                                customer.contactPersons?.length > 0 && (
                                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                                        {customer.contactPersons.length}
                                    </span>
                                )}
                        </button>
                    ))}
                </div>
            </div>

            {saveError && (
                <div
                    role="alert"
                    className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                >
                    {saveError}
                </div>
            )}

            {/* Selected tab */}
            <div className="min-w-0">
                {activeTab === "overview" && (
                    <CustomerOverviewTab
                        customer={customer}
                        totalYouCollect={totalYouCollect}
                        totalYouPay={totalYouPay}
                        recentActivities={recentActivities}
                        completeness={completeness}
                        currency={currency}
                        phone={phone}
                        formatAddress={formatAddress}
                        onOpenTab={setActiveTab}
                    />
                )}

                {activeTab === "profile" && (
                    <CustomerProfileTab
                        customer={customer}
                        editing={editingProfile}
                        saving={saving}
                        isDirty={isDirty}
                        onStartEdit={() => startEdit("profile")}
                        onCancelEdit={cancelEdit}
                        onSave={save}
                        onFieldChange={setField}
                    />
                )}

                {activeTab === "addresses" && (
                    <CustomerAddressTab
                        customer={customer}
                        editing={editingAddresses}
                        saving={saving}
                        isDirty={isDirty}
                        onStartEdit={() => startEdit("addresses")}
                        onCancelEdit={cancelEdit}
                        onSave={save}
                        onAddressChange={setAddress}
                        onCopyBilling={() =>
                            dispatch(copySelectedBillingToShipping())
                        }
                    />
                )}

                {activeTab === "activities" && (
                    <CustomerActivitiesTab activities={allActivities} />
                )}

                {activeTab === "contacts" && (
                    <CustomerContactPersonsTab
                        contactPersons={customer.contactPersons || []}
                    />
                )}

                {activeTab === "account" && (
                    <CustomerAccountTab
                        customer={customer}
                        totalYouCollect={totalYouCollect}
                        completeness={completeness}
                        onTogglePortal={togglePortal}
                        portalUpdating={portalUpdating}
                        onDelete={remove}
                        deleting={deleting}
                    />
                )}
            </div>
        </div>
    );
}
