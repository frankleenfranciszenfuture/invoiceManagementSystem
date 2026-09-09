import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ChevronDown, Plus } from "lucide-react";
import {
    setActiveTab,
    setOpenCustomerType,
    setCustomerTypeSearch,
    updateSelectedCustomerField,
    setIsEditingCustomerType,
    setEditingField,
    setEditCustomerType,
    saveCustomerType,
    cancelCustomerType,
    setCustomerLanguageSearch,
    setOpenCustomerLanguage,
    addRecentActivity
} from "../../../slices/customerSlices"

import { saveCustomer } from "../../../thunks/customerThunks"

import EditableFieldCustomer from "../../editable/EditableFieldCustomer";
import CustomerPayDueOverviewTableCard from "../tabsCustomerSubDetailsOverviewCards/CustomerPayDueOverviewTableCard";

export default function CustomerPayDueOverviewCard() {
    const dispatch = useDispatch();
    const customer = useSelector((state) => state.customers.selectedCustomer);

    const customers = useSelector((state) => state.customers.customer);

    const { selectedCustomer } = useSelector((state) => state.customers);

    const {
        customerType,
        customerTypes,
        customerTypeSearch,
        openCustomerType,
        isEditingCustomerType,
        editCustomerType,
        customerLanguageSearch,
        openCustomerLanguage,
        contactPersons

    } = useSelector((state) => state.customers);

    const [showOtherDeatils, setShowOtherDeatils] = useState(false);


    // const { receivables, activeTab, data, loading, error } = useSelector(
    //     (state) => state.dashboard,
    // );


    const formatAmount = (amount) =>
        `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const fmt = (v) => {
        if (v == null) return "₹0";
        return (
            "₹" +
            Number(v).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })
        );
    };

    function Skeleton({ className = "h-6 w-24" }) {
        return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
    }

    const customerDetails = [
        {
            label: "Payment Terms",
            value: selectedCustomer?.paymentTerms,
        },

    ];

    const filteredCustomerTypes = customerTypes.filter((type) =>
        type.toLowerCase().includes(customerTypeSearch.toLowerCase())
    );

    return (
        <div className="w-[709px] bg-white border-r border-gray-200 overflow-y-auto  rounded-md bg-white mt-5">
            <div className="col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-left px-5 border-b border-gray-50">
                    <button
                        onClick={() => setShowOtherDeatils(!showOtherDeatils)}
                        className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-700 uppercase w-full border-b border-gray-200 py-2 font-semibold justify-left cursor-pointer"
                    >
                        Payment due period
                    </button>
                </div>


                <div className="mt-1 text-sm text-gray-600 space-y-1 px-5 mb-4  cursor-pointer">
                    <div className="flex font-medium">
                        <div className="w-[450px]">
                            {customerDetails && customerDetails.length > 0 ? (
                                <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 text-md px-3 py-2">
                                    <div className="flex justify-between">
                                        <div className="space-y-4 w-full ">
                                            {customerDetails.map((item) => (
                                                <EditableFieldCustomer
                                                    key={item.label}
                                                    item={item}
                                                    customer={customer}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-5 text-center">
                                    <p className="text-sm text-gray-500">
                                        No details found.
                                    </p>

                                    <button
                                        onClick={() => {
                                            dispatch(setActiveTab("Other Details"));
                                            dispatch(
                                                openModal({
                                                    type: "editCustomer",
                                                })
                                            );
                                        }}
                                        className="mt-3 rounded-md bg-blue-600 px-4 py-2 text-white "
                                    >
                                        + Add Details
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-5 pt-6 pb-3">
                <p className="text-sm text-gray-600 mb-2">
                    {/* Total Receivables {formatAmount(receivables.total)} */}
                </p>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                        className="h-full bg-gray-300 rounded-full"
                        style={{ width: "0%" }}
                    />
                </div>
            </div>

            <div className="col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                    <h1 className="text-md font-semibold text-gray-800 ">
                        Receivables
                    </h1>
                    <button
                        onClick={() => navigate("/admin/dashboard/customers")}
                        className="text-xs text-blue-500 hover:text-blue-700 font-medium"
                    >
                        View All
                    </button>
                </div>

                <table className="w-full table-fixed">
                    <thead>
                        <tr className="text-[11px] text-gray-400 uppercase tracking-wide">
                            <th className="px-5 py-3 text-left font-medium">
                                Default Currency
                            </th>
                            <th className="px-5 py-3 text-left font-medium">
                                Outstanding Credits
                            </th>
                            <th className="px-5 py-3 text-left font-medium">
                                Unused Credits
                            </th>
                            <th className="px-5 py-3 text-left font-medium">
                                Payment Mode
                            </th>
                        </tr>
                    </thead>

                    <tbody className="text-sm text-gray-700">
                        {!selectedCustomer ? (
                            <tr>
                                <td colSpan={4} className="px-5 py-6 text-center text-gray-500">
                                    No customer selected
                                </td>
                            </tr>
                        ) : (
                            <tr className="border-t border-gray-100">
                                <td className="px-5 py-3">
                                    {selectedCustomer.currency || "—"}
                                </td>
                                <td className="px-5 py-3">
                                    {selectedCustomer.outstandingCredits || "0.00"}
                                </td>
                                <td className="px-5 py-3">
                                    {selectedCustomer.unusedCredits || "0.00"}
                                </td>
                                <td className="px-5 py-3">
                                    {selectedCustomer.paymentMode || "—"}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

        </div>
    );
}
