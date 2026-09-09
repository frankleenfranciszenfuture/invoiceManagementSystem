import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";

import {
    loadCustomers,
    getCustomerById,
    removeCustomer,
} from "../thunks/customerThunks";

import {
    setCurrentPage,
    setSelectedCustomer,
} from "../slices/customerSlices"


import { openModal } from "../../ui/uiSlice";
import { ChevronDown, Edit, Pencil, Trash2, User } from "lucide-react";
import toast from "react-hot-toast";

export default function CustomerTable() {

    const dispatch = useDispatch();

    const navigate = useNavigate();

    const {
        customers,
        loading,
        error,
        page,
        pageSize,
        totalPages,
        totalElements,
    } = useSelector((state) => state.customers);


    const currentCustomers = customers || [];


    const [showEdit, setShowEdit] = useState(false);
    const [showMenu, setShowMenu] = useState(false);


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

    //status color
    const statusColor = {
        DRAFT: "bg-gray-100 text-gray-700",
        SENT: "bg-blue-100 text-blue-700",
        PENDING: "bg-yellow-100 text-yellow-700",
        ACTIVE: "bg-green-100 text-green-700",
    };


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

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p className="text-red-500">{error}</p>;
    }

    if (!customers?.length) {
        return (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
                <User className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                <p className="text-gray-500">No customers found.</p>
            </div>
        );
    }


    return (

        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto overflow-y-visible">
            <div className="overflow-x-auto overflow-y-visible">
                <table className="w-full">
                    <thead className="bg-gray-100 border-b border-gray-300">
                        <tr>
                            {[
                                "Display Name",
                                "Customer Type",
                                "Currency",
                                "Email",
                                "Mobile",
                                "PAN",
                                "Receivables",
                                "UnUsedCredits",
                                "Status",
                                "Actions",
                            ].map((h) => (
                                <th
                                    key={h}
                                    className={`px-4 py-3 font-medium text-sm text-gray-600 uppercase ${h === "Actions" ? "text-right" : "text-left"
                                        }`}
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {customers?.length > 0 ? (
                            [...customers]
                                .sort((a, b) => a.id - b.id)
                                .map((c, index) => (
                                    <tr
                                        key={c.id || index}
                                        onClick={() => {
                                            dispatch(setSelectedCustomer(c));
                                            navigate(`/customers/view/${c.id}`);
                                        }}
                                        className="border-b border-gray-100 hover:bg-gray-50 text-md cursor-pointer transition-colors"
                                    >
                                        {/* Customer Info */}
                                        <td className="px-2 py-3">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-md font-bold ${getAvatarColor(
                                                        c.displayName || c.customerName,
                                                    )}`}
                                                >
                                                    {initials(c.displayName || c.customerName)}
                                                </div>

                                                <div>
                                                    <p className="font-medium text-gray-800">
                                                        {c.displayName}
                                                    </p>
                                                    <p className="text-sm text-gray-500">ID: #{c.id}</p>
                                                </div>
                                            </div>
                                        </td>


                                        {/* Type */}
                                        <td className="px-4 py-3">{c.customerType || "—"}</td>

                                        {/* Currency */}
                                        <td className="px-4 py-3">{c.currency || "—"}</td>

                                        {/* Email */}
                                        <td className="px-4 py-3">{c.email || "—"}</td>

                                        {/* Mobile */}
                                        <td className="px-4 py-3">
                                            {c.mobileCode || "+91"} {c.mobile || "—"}
                                        </td>

                                        {/* PAN */}
                                        <td className="px-4 py-3">{c.pan || "—"}</td>

                                        {/* Receivables */}
                                        <td className="px-4 py-3">{c.receivable || "—"}</td>

                                        {/* UnUsed credits */}
                                        <td className="px-4 py-3">{c.unusedCredits || "—"}</td>

                                        {/* Status */}
                                        <td className="px-5 py-3 font-semibold">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[c.status]}`}
                                            >
                                                {c.status || "—"}
                                            </span>
                                        </td>


                                        {/* Actions */}
                                        <td className="relative overflow-visible px-4 py-3">
                                            <div className="flex justify-end">
                                                <div className="relative group inline-block">
                                                    <button className="p-1 rounded-full bg-blue-500 text-white ">
                                                        <ChevronDown size={16} />
                                                    </button>

                                                    <div
                                                        className="
                                absolute
                                right-0
                                top-full
                                mt-1
                                z-[9999]
                                opacity-0
                                invisible
                                group-hover:opacity-100
                                group-hover:visible
                                transition-all
                              "
                                                    >
                                                        <div className="w-32 rounded-md bg-blue-500 shadow-lg ">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation(); // Prevent row click
                                                                    setShowEdit(true);
                                                                    dispatch(setSelectedCustomer(c));
                                                                    navigate(`/customers/edit/${c.id}`);
                                                                }}
                                                                className="flex w-full items-center gap-2 px-4 py-2 text-white hover:bg-blue-600 rounded-md"
                                                            >
                                                                <Edit size={16} />
                                                                Edit
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                            </div>
                                        </td>
                                    </tr>
                                ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center py-6 text-gray-500">
                                    No customers found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>


                <div className="p-5 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                        Showing {currentCustomers.length} of {totalElements || 0} customers
                    </p>

                    <div className="flex items-center gap-3">
                        <button
                            disabled={page <= 0}
                            onClick={() => dispatch(setCurrentPage(Math.max(0, page - 1)))}
                            className="text-sm text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                            Previous
                        </button>

                        <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-600 text-white text-sm font-medium">
                            {(Number(page) || 0) + 1}
                        </span>

                        <button
                            disabled={
                                (Number(page) || 0) >= (Number(totalPages) || 1) - 1
                            }
                            onClick={() =>
                                dispatch(setCurrentPage((Number(page) || 0) + 1))
                            }
                            className="text-sm text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div >
        </div>
    );
}
