import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setSelectedCustomer } from "../slices/customerSlices";

export default function CustomerOverViewSiderDetails() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { customers, selectedCustomer } = useSelector(
        (state) => state.customers
    );

    const { status = "ALL" } = useSelector(
        (state) => state.customerView ?? {}
    );

    const statusColor = {
        DRAFT: "bg-yellow-100 text-gray-700",
        SENT: "bg-blue-100 text-blue-700",
        PENDING: "bg-amber-100 text-amber-700",
        ACTIVE: "bg-green-100 text-green-700",
        INACTIVE: "bg-red-100 text-red-700",
        CANCELLED: "bg-red-100 text-red-700",
        PAID: "bg-emerald-100 text-emerald-700",
        OVERDUE: "bg-orange-100 text-orange-700",
        CLOSED: "bg-slate-100 text-slate-700",
        APPROVED: "bg-green-100 text-green-700",
        REJECTED: "bg-red-100 text-red-700",
    };

    const filteredCustomers =
        status === "ALL"
            ? customers
            : customers?.filter(
                (customer) =>
                    customer.status?.toUpperCase() ===
                    status?.toUpperCase()
            );

    return (

        <div className="w-full bg-white border-b border-gray-200">
            {filteredCustomers?.length > 0 ? (
                <div className="w-full">
                    {[...filteredCustomers]
                        .sort((a, b) => a.id - b.id)
                        .map((c) => (
                            <div
                                key={c.id}
                                onClick={() => {
                                    dispatch(setSelectedCustomer(c));
                                    navigate(`/customers/view/${c.id}`);
                                }}
                                className={`w-full cursor-pointer border-b border-gray-100 px-4 py-4 transition-all ${selectedCustomer?.id === c.id
                                    ? "bg-blue-50 border-l-4 border-l-blue-600"
                                    : "hover:bg-gray-50"
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex gap-3">
                                        <input
                                            type="checkbox"
                                            onClick={(e) => e.stopPropagation()}
                                            className="mt-1"
                                        />

                                        <div>
                                            <h3 className="font-semibold text-gray-800">
                                                {c.displayName}
                                            </h3>

                                            <p className="text-sm text-gray-500">
                                                #{c.id}
                                            </p>

                                            <span
                                                className={`mt-2 inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${statusColor[c.status] ||
                                                    "bg-gray-100 text-gray-700"
                                                    }`}
                                            >
                                                {c.status || "Draft"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <p className="font-semibold">
                                            ₹{Number(c.total || 0).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            ) : (
                <div className="flex min-h-[200px] items-center justify-center text-gray-500">
                    No customers found.
                </div>
            )}
        </div>
    );
}