
import React from "react";
import { Pencil, UserRound } from "lucide-react";

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

const inputCls =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-[#088178] focus:ring-4 focus:ring-[#088178]/15";

const Card = ({ children }) => (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {children}
    </section>
);

const TextField = ({ label, value, onChange, type = "text" }) => (
    <label className="flex min-w-0 flex-col gap-1.5">
        <span className="text-xs text-slate-500">{label}</span>
        <input
            type={type}
            value={value ?? ""}
            onChange={onChange}
            className={inputCls}
        />
    </label>
);

const Detail = ({ label, value }) => (
    <div className="min-w-0 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            {label}
        </p>
        <p className="mt-1 break-words text-sm text-slate-700">
            {value || "-"}
        </p>
    </div>
);

export default function CustomerProfileTab({
    customer,
    editing,
    saving,
    isDirty,
    onStartEdit,
    onCancelEdit,
    onSave,
    onFieldChange,
}) {
    return (
        <Card>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                    <UserRound size={18} className="text-[#088178]" />
                    <h2 className="text-[15px] font-semibold text-slate-700">
                        Profile Details
                    </h2>
                </div>

                {editing ? (
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onCancelEdit}
                            disabled={saving}
                            className="rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100 disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            onClick={onSave}
                            disabled={saving || !isDirty}
                            className="rounded-lg bg-[#088178] px-4 py-2 text-sm font-medium text-white hover:bg-[#066b63] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {saving ? "Saving..." : "Save changes"}
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={onStartEdit}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-500 transition hover:bg-teal-50 hover:text-[#088178]"
                    >
                        <Pencil size={14} />
                        Edit Profile
                    </button>
                )}
            </div>

            {editing ? (
                <div className="p-5 sm:p-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {PROFILE_FIELDS.map(([field, label, type]) => (
                            <TextField
                                key={field}
                                label={label}
                                type={type}
                                value={customer[field]}
                                onChange={onFieldChange(field)}
                            />
                        ))}

                        <label className="flex flex-col gap-1.5">
                            <span className="text-xs text-slate-500">Status</span>
                            <select
                                value={customer.status || "Active"}
                                onChange={onFieldChange("status")}
                                className={inputCls}
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </label>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-x-8 divide-y divide-slate-100 px-5 sm:grid-cols-2 sm:divide-y-0 sm:px-6 lg:grid-cols-3">
                    <Detail label="Display name" value={customer.displayName} />
                    <Detail label="Company" value={customer.companyName} />
                    <Detail
                        label="Full name"
                        value={[
                            customer.salutation,
                            customer.firstName,
                            customer.lastName,
                        ].filter(Boolean).join(" ")}
                    />
                    <Detail label="Email" value={customer.email} />
                    <Detail
                        label="Mobile"
                        value={`${customer.mobileCode || ""} ${customer.mobile || ""}`.trim()}
                    />
                    <Detail
                        label="Work phone"
                        value={`${customer.workPhoneCode || ""} ${customer.workPhone || ""}`.trim()}
                    />
                    <Detail label="PAN" value={customer.pan} />
                    <Detail label="Designation" value={customer.designation} />
                    <Detail label="Department" value={customer.department} />
                    <Detail
                        label="Customer type"
                        value={customer.customerType}
                    />
                    <Detail label="Status" value={customer.status || "Active"} />
                </div>
            )}
        </Card>
    );
}
