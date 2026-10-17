
import React from "react";
import { MapPin, Pencil, Copy } from "lucide-react";

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

const Card = ({ children }) => (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {children}
    </section>
);

const AddressCard = ({
    title,
    address = {},
    editing,
    onChange,
    onCopyBilling,
    showCopy,
}) => (
    <div className="rounded-xl border border-slate-200 p-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
                <MapPin size={17} className="text-[#088178]" />
                <h3 className="text-sm font-semibold text-slate-700">
                    {title}
                </h3>
            </div>

            {showCopy && editing && (
                <button
                    type="button"
                    onClick={onCopyBilling}
                    className="flex items-center gap-2 text-xs font-medium text-[#088178] hover:underline"
                >
                    <Copy size={14} />
                    Copy from billing
                </button>
            )}
        </div>

        {editing ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {ADDRESS_FIELDS.map(([field, label]) => (
                    <label
                        key={field}
                        className="flex min-w-0 flex-col gap-1.5"
                    >
                        <span className="text-xs text-slate-500">{label}</span>
                        <input
                            value={address[field] ?? ""}
                            onChange={onChange(field)}
                            className={inputCls}
                        />
                    </label>
                ))}
            </div>
        ) : (
            <div className="space-y-3">
                {ADDRESS_FIELDS.map(([field, label]) => (
                    <div
                        key={field}
                        className="grid grid-cols-1 gap-1 sm:grid-cols-[130px_minmax(0,1fr)] sm:gap-4"
                    >
                        <span className="text-sm text-slate-400">{label}</span>
                        <span className="break-words text-sm text-slate-700">
                            {address[field] || "-"}
                        </span>
                    </div>
                ))}
            </div>
        )}
    </div>
);

export default function CustomerAddressTab({
    customer,
    editing,
    saving,
    isDirty,
    onStartEdit,
    onCancelEdit,
    onSave,
    onAddressChange,
    onCopyBilling,
}) {
    return (
        <Card>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                    <MapPin size={18} className="text-[#088178]" />
                    <h2 className="text-[15px] font-semibold text-slate-700">
                        Billing & Shipping Addresses
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
                            {saving ? "Saving..." : "Save addresses"}
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={onStartEdit}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-teal-50 hover:text-[#088178]"
                    >
                        <Pencil size={14} />
                        Edit Addresses
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 gap-5 p-5 sm:p-6 xl:grid-cols-2">
                <AddressCard
                    title="Billing Address"
                    address={customer.billingAddress}
                    editing={editing}
                    onChange={(field) =>
                        onAddressChange("billingAddress", field)
                    }
                />

                <AddressCard
                    title="Shipping Address"
                    address={customer.shippingAddress}
                    editing={editing}
                    onChange={(field) =>
                        onAddressChange("shippingAddress", field)
                    }
                    onCopyBilling={onCopyBilling}
                    showCopy
                />
            </div>
        </Card>
    );
}
