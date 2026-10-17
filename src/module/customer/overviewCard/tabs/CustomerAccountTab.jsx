
import React from "react";
import {
    CreditCard,
    CalendarDays,
    ShieldCheck,
    Trash2,
    UserRound,
    Wallet,
} from "lucide-react";

const Card = ({ children, className = "" }) => (
    <section className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>
        {children}
    </section>
);

const fmtDate = (value) =>
    value
        ? new Date(value).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        })
        : "-";

const SummaryItem = ({ label, value, icon: Icon }) => (
    <div className="flex min-w-0 items-start gap-3 rounded-xl border border-slate-100 p-4">
        {Icon && (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-[#088178]">
                <Icon size={16} />
            </span>
        )}

        <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                {label}
            </p>
            <p className="mt-1 break-words text-sm font-medium text-slate-700">
                {value || "-"}
            </p>
        </div>
    </div>
);

export default function CustomerAccountTab({
    customer,
    totalYouCollect,
    completeness,
    onTogglePortal,
    portalUpdating,
    onDelete,
    deleting,
}) {
    const currency = customer.currency || "₹";

    const money = (value) =>
        `${currency} ${Number(value || 0).toLocaleString("en-IN")}`;

    return (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="space-y-6 xl:col-span-2">
                <Card>
                    <header className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
                        <CreditCard size={18} className="text-[#088178]" />
                        <h2 className="text-[15px] font-semibold text-slate-700">
                            Account Summary
                        </h2>
                    </header>

                    <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:p-6">
                        <SummaryItem
                            label="Customer since"
                            value={fmtDate(customer.createdAt)}
                            icon={CalendarDays}
                        />
                        <SummaryItem
                            label="Last updated"
                            value={fmtDate(customer.updatedAt)}
                            icon={CalendarDays}
                        />
                        <SummaryItem
                            label="Currency"
                            value={customer.currency}
                            icon={Wallet}
                        />
                        <SummaryItem
                            label="Payment terms"
                            value={customer.paymentTerms}
                            icon={CreditCard}
                        />
                        <SummaryItem
                            label="Customer ID"
                            value={customer.id}
                            icon={UserRound}
                        />
                        <SummaryItem
                            label="Customer type"
                            value={customer.customerType}
                            icon={UserRound}
                        />
                    </div>
                </Card>

                <Card>
                    <header className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
                        <Wallet size={18} className="text-[#088178]" />
                        <h2 className="text-[15px] font-semibold text-slate-700">
                            Outstanding Balance
                        </h2>
                    </header>

                    <div className="p-5 sm:p-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                            You collect
                        </p>

                        <p className="mt-2 break-words text-3xl font-light tabular-nums text-slate-800">
                            {money(totalYouCollect)}
                        </p>

                        <p className="mt-2 text-sm text-slate-500">
                            Outstanding amount associated with this customer.
                        </p>
                    </div>
                </Card>

                <Card>
                    <header className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
                        <ShieldCheck size={18} className="text-[#088178]" />
                        <h2 className="text-[15px] font-semibold text-slate-700">
                            Customer Portal
                        </h2>
                    </header>

                    <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                        <div>
                            <p className="text-sm font-medium text-slate-700">
                                Portal access
                            </p>
                            <p className="mt-1 text-sm text-slate-400">
                                {customer.enablePortal
                                    ? "Portal access is currently enabled."
                                    : "Portal access is currently disabled."}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={onTogglePortal}
                            disabled={portalUpdating}
                            className={`rounded-xl px-5 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${customer.enablePortal
                                ? "border border-rose-200 text-rose-600 hover:bg-rose-50"
                                : "bg-[#088178] text-white hover:bg-[#066b63]"
                                }`}
                        >
                            {portalUpdating
                                ? "Updating..."
                                : customer.enablePortal
                                    ? "Disable portal access"
                                    : "Enable portal access"}
                        </button>
                    </div>
                </Card>
            </div>

            <div className="space-y-6">
                <Card>
                    <header className="border-b border-slate-100 px-5 py-4">
                        <h2 className="text-[15px] font-semibold text-slate-700">
                            Profile Completeness
                        </h2>
                    </header>

                    <div className="p-5">
                        <div className="flex items-end justify-between gap-3">
                            <span className="text-3xl font-light tabular-nums text-slate-800">
                                {completeness}%
                            </span>
                            <span className="text-xs text-slate-400">
                                Profile completed
                            </span>
                        </div>

                        <div
                            role="progressbar"
                            aria-label="Profile completeness"
                            aria-valuenow={completeness}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100"
                        >
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-[#4EBBB4] to-[#088178] transition-all"
                                style={{ width: `${completeness}%` }}
                            />
                        </div>

                        <p className="mt-3 text-xs leading-5 text-slate-400">
                            Add missing customer information to keep the account details complete.
                        </p>
                    </div>
                </Card>

                <Card>
                    <header className="border-b border-slate-100 px-5 py-4">
                        <h2 className="text-[15px] font-semibold text-slate-700">
                            Account Status
                        </h2>
                    </header>

                    <div className="space-y-4 p-5">
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-sm text-slate-500">
                                Customer status
                            </span>

                            <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${(customer.status || "Active").toUpperCase() === "ACTIVE"
                                    ? "bg-emerald-50 text-emerald-600"
                                    : "bg-slate-100 text-slate-500"
                                    }`}
                            >
                                {(customer.status || "Active").toUpperCase()}
                            </span>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                            <span className="text-sm text-slate-500">
                                Portal access
                            </span>
                            <span className="text-sm font-medium text-slate-700">
                                {customer.enablePortal ? "Enabled" : "Disabled"}
                            </span>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="p-5">
                        <h2 className="text-sm font-semibold text-slate-700">
                            Delete customer
                        </h2>

                        <p className="mt-2 text-xs leading-5 text-slate-400">
                            Deleting this customer may affect access to its associated records, depending on your backend rules.
                        </p>

                        <button
                            type="button"
                            onClick={onDelete}
                            disabled={deleting}
                            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Trash2 size={15} />
                            {deleting ? "Deleting..." : "Delete customer"}
                        </button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
