import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import React, { useEffect } from "react";
import {
    loadCustomers,
    getCustomerById,
} from "../../../thunks/customerThunks";

import {
    setCurrentPage,
    setSelectedCustomer,
} from "../../../slices/customerSlices";

import { openModal } from "../../../../ui/uiSlice";
import { Pencil, Trash2, User } from "lucide-react";
import toast from "react-hot-toast";

export default function CustomerPayDueOverviewTableCard() {

    const dispatch = useDispatch();

    const { customers, selectedCustomer, loading, error, page, pageSize, totalElements } =
        useSelector((state) => state.customer);

    useEffect(() => {
        dispatch(loadCustomers({ page, size: pageSize }));
    }, [dispatch, page, pageSize]);

    const startIndex = (page - 1) * pageSize;
    const currentCustomers = customers.slice(startIndex, startIndex + pageSize);

    const totalPages = Math.ceil(customers.length / pageSize);

    const navigate = useNavigate();

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this customer?")) return;

        try {
            await dispatch(removeCustomer(id)).unwrap();
            toast.success("Customer deleted");
        } catch (e) {
            toast.error(e.message || "Failed to delete customer");
        }
    };

    const initials = (customerName) =>
        customerName
            ?.split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "??";

    // get colors
    const avatarColors = [
        "bg-pink-500 text-white",
        "bg-green-500 text-white",
        "bg-blue-500 text-white",
        "bg-purple-500 text-white",
        "bg-orange-500 text-white",
        "bg-cyan-500 text-white",
        "bg-indigo-500 text-white",
    ];

    const getAvatarColor = (name) => {
        const index =
            name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
            avatarColors.length;

        return avatarColors[index];
    };

    if (!customers || customers.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
                <User className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                <p className="text-gray-500">No customers yet. Add your first one!</p>

                {/* Debug */}
                {/* <pre>{JSON.stringify(customerState, null, 2)}</pre> */}
            </div>
        );
    }

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!customers.length) {
        return (
            <div className="p-10 text-center text-gray-500">No customers found.</div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            {[
                                "Display Name",
                                "Default Currency",
                                "Customer Type",

                                "PAN",
                                "Actions",
                            ].map((h) => (
                                <th
                                    key={h}
                                    className={`px-4 py-3 font-medium text-sm text-gray-500 uppercase ${h === "Actions" ? "text-right" : "text-left"
                                        }`}
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {!selectedCustomer ? (
                            <tr>
                                <td colSpan={4} className="text-center py-6 text-gray-500">
                                    No customer selected
                                </td>
                            </tr>
                        ) : (
                            <tr>
                                <td className="px-5 py-3">
                                    {selectedCustomer.currency || "—"}
                                </td>
                                <td className="px-3 py-3">
                                    {selectedCustomer.outstandingCredits || "0.00"}
                                </td>
                                <td className="px-3 py-3">
                                    {selectedCustomer.unusedCredits || "0.00"}
                                </td>
                                <td className="px-3 py-3">
                                    {selectedCustomer.paymentMode || "—"}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="p-5 border-t border-gray-100 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                    Showing {currentCustomers.length} of {totalElements} customers
                </p>

                <div className="flex items-center gap-3">
                    <button
                        disabled={page === 0}
                        onClick={() => dispatch(setCurrentPage(page - 1))}
                        className="text-sm text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    >
                        Previous
                    </button>

                    <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-600 text-white text-sm font-medium">
                        {page + 1}
                    </span>

                    <button
                        disabled={page >= totalPages - 1}
                        onClick={() => dispatch(setCurrentPage(page + 1))}
                        className="text-sm text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
