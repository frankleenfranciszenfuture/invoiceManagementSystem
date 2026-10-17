
import React from "react";
import {
    FileText,
    Wallet,
    CreditCard,
    Mail,
    Phone,
    MapPin,
    UserRound,
    History,
    ArrowRight,
} from "lucide-react";

const Card = ({ children, className = "" }) => (
    <section className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>
        {children}
    </section>
);

const CardHeader = ({ icon: Icon, title, right }) => (
    <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3 text-slate-700">
            <Icon size={18} className="text-[#088178]" />
            <h2 className="text-[15px] font-semibold">{title}</h2>
        </div>
        {right}
    </header>
);

const DetailRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 py-3">
        <Icon size={15} className="mt-0.5 shrink-0 text-slate-400" />
        <span className="w-32 shrink-0 text-sm text-slate-400">{label}</span>
        <span className="min-w-0 break-words text-sm text-slate-700">
            {value || "-"}
        </span>
    </div>
);

const fmtDateTime = (value) =>
    value
        ? new Date(value).toLocaleString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
        : "-";

export default function CustomerOverviewTab({
    customer,
    totalYouCollect,
    totalYouPay,
    recentActivities,
    completeness,
    currency,
    phone,
    formatAddress,
    onOpenTab,
}) {
    const money = (value) =>
        `${currency} ${Number(value || 0).toLocaleString("en-IN")}`;

    const shortcuts = [
        { id: "profile", label: "Profile details", icon: UserRound },
        { id: "addresses", label: "Billing & shipping", icon: MapPin },
        { id: "activities", label: "Customer activities", icon: History },
        { id: "contacts", label: "Contact persons", icon: FileText },
        { id: "account", label: "Account settings", icon: CreditCard },
    ];

    return (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="space-y-6 xl:col-span-2">
                <Card>
                    <CardHeader icon={UserRound} title="Customer Information" />

                    <div className="divide-y divide-slate-50 px-5 sm:px-6">
                        <DetailRow
                            icon={UserRound}
                            label="Name"
                            value={[
                                customer.salutation,
                                customer.firstName,
                                customer.lastName,
                            ]
                                .filter(Boolean)
                                .join(" ")}
                        />
                        <DetailRow icon={Mail} label="Email" value={customer.email} />
                        <DetailRow icon={Phone} label="Phone" value={phone} />
                        <DetailRow icon={FileText} label="PAN" value={customer.pan} />
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

                    <div className="border-t border-slate-100 px-5 py-3 sm:px-6">
                        <button
                            type="button"
                            onClick={() => onOpenTab("profile")}
                            className="flex items-center gap-2 text-sm font-medium text-[#088178] hover:underline"
                        >
                            View profile <ArrowRight size={15} />
                        </button>
                    </div>
                </Card>

                <Card>
                    <CardHeader icon={Wallet} title="Financial Overview" />

                    <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:p-6">
                        <div className="rounded-xl bg-emerald-50 p-5">
                            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                                You collect
                            </p>
                            <p className="mt-2 break-words text-2xl font-medium text-emerald-700">
                                {money(totalYouCollect)}
                            </p>
                        </div>

                        <div className="rounded-xl bg-rose-50 p-5">
                            <p className="text-xs font-semibold uppercase tracking-wide text-rose-600">
                                You pay
                            </p>
                            <p className="mt-2 break-words text-2xl font-medium text-rose-600">
                                {money(totalYouPay)}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="space-y-6">
                <Card>
                    <CardHeader icon={CreditCard} title="Account Summary" />

                    <div className="grid grid-cols-2 gap-5 px-5 py-5 sm:px-6">
                        {[
                            ["Customer since", customer.createdAt
                                ? new Date(customer.createdAt).toLocaleDateString("en-GB")
                                : "-"],
                            ["Last updated", customer.updatedAt
                                ? new Date(customer.updatedAt).toLocaleDateString("en-GB")
                                : "-"],
                            ["Currency", customer.currency],
                            ["Payment terms", customer.paymentTerms],
                            ["Customer ID", customer.id],
                            ["Status", customer.status || "Active"],
                        ].map(([label, value]) => (
                            <div key={label} className="min-w-0">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                                    {label}
                                </p>
                                <p className="mt-1 break-words text-sm text-slate-700">
                                    {value || "-"}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-slate-100 px-5 py-5 sm:px-6">
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-sm text-slate-500">
                                Profile completeness
                            </span>
                            <span className="font-semibold text-[#088178]">
                                {completeness}%
                            </span>
                        </div>

                        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
                            <div
                                className="h-full rounded-full bg-[#088178] transition-all"
                                style={{ width: `${completeness}%` }}
                            />
                        </div>

                        <button
                            type="button"
                            onClick={() => onOpenTab("account")}
                            className="mt-4 text-sm font-medium text-[#088178] hover:underline"
                        >
                            View account settings
                        </button>
                    </div>
                </Card>

                <Card>
                    <CardHeader
                        icon={History}
                        title="Recent Changes"
                        right={
                            <button
                                type="button"
                                onClick={() => onOpenTab("activities")}
                                className="text-xs font-medium text-[#088178] hover:underline"
                            >
                                View all
                            </button>
                        }
                    />

                    {!recentActivities?.length ? (
                        <p className="px-6 py-6 text-center text-sm text-slate-400">
                            No recent changes.
                        </p>
                    ) : (
                        <ul className="divide-y divide-slate-50 px-5 sm:px-6">
                            {recentActivities.slice(0, 5).map((item, index) => (
                                <li
                                    key={item.id ?? `${item.title}-${index}`}
                                    className="flex items-start gap-3 py-4"
                                >
                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#088178]/10 text-[#088178]">
                                        <FileText size={15} />
                                    </span>
                                    <div className="min-w-0">
                                        <p className="break-words text-sm text-slate-700">
                                            {item.title || "Customer update"}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-400">
                                            {fmtDateTime(item.createdAt || item.date)}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>

                <Card>
                    <CardHeader icon={ArrowRight} title="Quick Navigation" />
                    <div className="p-3">
                        {shortcuts.map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                type="button"
                                onClick={() => onOpenTab(id)}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm text-slate-600 transition hover:bg-teal-50 hover:text-[#088178]"
                            >
                                <Icon size={16} />
                                <span className="flex-1">{label}</span>
                                <ArrowRight size={14} />
                            </button>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}
