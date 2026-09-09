import React from 'react'
import { Pencil, Check, X, ChevronDown } from "lucide-react";

import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import {
    setEditingField,
    setOpenCustomerType,
    setOpenCustomerLanguage,
    setCustomerTypeSearch,
    setCustomerLanguage,
    updateSelectedCustomerField,
    setCustomerLanguageSearch,
    setOpenPaymentTerms,
    setPaymentTermsSearch,

} from "../../slices/customerSlices"

import { saveCustomer } from "../../thunks/customerThunks"


export default function EditableFieldCustomer({ item, customer }) {
    const dispatch = useDispatch();

    const {
        editingField,

        openCustomerType,
        openCustomerLanguage,

        customerTypeSearch,
        customerLanguageSearch,


        openPaymentTerms,
        paymentTermsSearch,

    } = useSelector((state) => state.customers);

    const customerTypes = ["Business", "Individual"];

    const customerLanguages = ["English", "Tamil", "Hindi"];


    const paymentTerms = [
        "Due on Receipt",
        "Net 15",
        "Net 30",
        "Net 45",
        "Net 60",
    ];

    const filteredCustomerTypes = customerTypes.filter((x) =>
        x.toLowerCase().includes(customerTypeSearch.toLowerCase()),
    );

    const filteredCustomerLanguages = customerLanguages.filter((x) =>
        x.toLowerCase().includes(customerLanguageSearch.toLowerCase()),
    );

    const filteredPaymentTerms = paymentTerms.filter((x) =>
        x.toLowerCase().includes(paymentTermsSearch.toLowerCase())
    );

    const editableFields = {
        "Customer Type": {
            key: "customerType",
            open: openCustomerType,
            setOpen: setOpenCustomerType,
            options: filteredCustomerTypes,
            search: customerTypeSearch,
            setSearch: setCustomerTypeSearch,
        },

        "Customer Language": {
            key: "customerLanguage",
            open: openCustomerLanguage,
            setOpen: setOpenCustomerLanguage,
            options: filteredCustomerLanguages,
            search: customerLanguageSearch,
            setSearch: setCustomerLanguageSearch,
        },

        "Payment Terms": {
            key: "paymentTerms",
            open: openPaymentTerms,
            setOpen: setOpenPaymentTerms,
            options: filteredPaymentTerms,
            search: paymentTermsSearch,
            setSearch: setPaymentTermsSearch,
        },
    };

    const editable = editableFields[item.label];

    const handleSave = async () => {
        try {
            await dispatch(saveCustomer()).unwrap();

            toast.success("Customer updated successfully");

            dispatch(setEditingField(null));

            if (editable) {
                dispatch(editable.setOpen(false));
            }
        } catch (err) {
            toast.error(err || "Failed to update customer");
        }
    };

    return (

        <div className="flex items-center gap-6">
            <div className="w-48 font-medium cursor-pointer ">{item.label}</div>


            <div className="flex-1 flex items-center bg-gray-100 rounded-md cursor-pointer ">
                <div className="flex-1 px-3 py-2 relative ">
                    {editable && editingField === editable.key ? (
                        <>
                            <div
                                onClick={() => dispatch(editable.setOpen(!editable.open))}
                                className="flex items-center justify-between w-full rounded-md border border-blue-500 bg-white px-3 py-2 cursor-pointer"
                            >
                                <span className="text-sm text-gray-700">
                                    {customer?.[editable.key]}
                                </span>

                                <ChevronDown
                                    size={16}
                                    className={` text-gray-500 transition-transform ${editable.open ? "rotate-180" : ""
                                        }`}
                                />
                            </div>

                            {editable.open && (
                                <div className="absolute left-0 top-full mt-1 w-full bg-white border rounded-md shadow-lg z-50 max-h-60 overflow-auto cursor-pointer">
                                    <div className="p-2">
                                        <input
                                            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
                                            placeholder="Search..."
                                            value={editable.search}
                                            onChange={(e) =>
                                                dispatch(editable.setSearch(e.target.value))
                                            }
                                        />
                                    </div>

                                    {editable.options
                                        .filter((option) =>
                                            option.toLowerCase().includes(editable.search?.toLowerCase() || "")
                                        )
                                        .map((option) => {
                                            const isSelected = customer?.[editable.key] === option;

                                            return (
                                                <div
                                                    key={option}
                                                    onClick={() => {
                                                        dispatch(
                                                            updateSelectedCustomerField({
                                                                field: editable.key,
                                                                value: option,
                                                            })
                                                        );

                                                        dispatch(editable.setOpen(false));
                                                    }}
                                                    className={`px-3 py-2 flex items-center justify-between cursor-pointer
                                                        ${isSelected ? "bg-blue-500 text-white" : "hover:bg-blue-100"}
                                                        `}
                                                >
                                                    <span>{option}</span>

                                                    {isSelected && <Check size={16} />}
                                                </div>
                                            );
                                        })}
                                </div>
                            )}
                        </>
                    ) : (
                        item.value
                    )}
                </div>

                <div className="border-l border-gray-300 flex items-center gap-2 px-2 cursor-pointer">
                    {editable && editingField === editable.key ? (
                        <div className="flex gap-2">
                            <button
                                onClick={handleSave}
                                className="flex h-7 w-7 items-center justify-center rounded bg-green-500 text-white hover:bg-green-600"
                            >
                                <div className="flex items-center justify-center w-8 h-8 rounded  cursor-pointer">
                                    <Check size={15} className="text-gray-600" />
                                </div>

                            </button>

                            <button
                                onClick={() => {
                                    dispatch(setEditingField(null));
                                    dispatch(editable.setOpen(false));
                                }}
                                className="flex h-7 w-7 items-center justify-center rounded bg-red-100 text-red-500 hover:bg-red-200"
                            >

                                <div className="flex items-center justify-center w-8 h-8 rounded  cursor-pointer">
                                    <X size={15} className="text-gray-600" />
                                </div>

                            </button>
                        </div>
                    ) : (
                        editable && (
                            <button onClick={() => dispatch(setEditingField(editable.key))}>
                                <div className="flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 cursor-pointer">
                                    <Pencil size={16} className="text-gray-600" />
                                </div>

                            </button>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
