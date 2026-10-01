
import React, { useState } from "react";
import { useSelector } from "react-redux";

import {
    ChevronDown,
    Building2,
    Settings,
} from "lucide-react";

export default function CompanySubDetailsOverviewCard() {

    const company = useSelector(
        (state) => state.company?.company
    );

    const existingCompany = useSelector(
        (state) => state.company?.existingCompany
    );

    const currentCompany =
        company || existingCompany;

    const [showBasicDetails, setShowBasicDetails] = useState(false);
    const [showAddressDetails, setShowAddressDetails] = useState(false);
    const [showTaxDetails, setShowTaxDetails] = useState(false);

    if (!currentCompany) {
        return (
            <div className="w-full rounded-md border border-gray-200 bg-white p-5">
                <p className="text-sm text-gray-500">
                    Loading company...
                </p>
            </div>
        );
    }

    const statusColor = {
        ACTIVE: "bg-green-100 text-green-700",
        INACTIVE: "bg-red-100 text-red-700",
        DRAFT: "bg-yellow-100 text-yellow-700",
    };

    const status =
        currentCompany.status?.toUpperCase() || "DRAFT";

    return (
        <div className="w-full rounded-md border border-gray-100 bg-white shadow-sm">

            {/* =====================================================
                COMPANY HEADER
            ===================================================== */}

            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5">

                <h2 className="text-base font-medium text-gray-800 underline decoration-dotted decoration-gray-300 underline-offset-4">
                    Company Overview
                </h2>

                <button
                    type="button"
                    className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                    <Building2
                        className="h-4 w-4 rounded-full bg-blue-600 p-0.5 text-white"
                    />
                    New
                </button>

            </div>

            {/* =====================================================
                COMPANY BASIC INFO
            ===================================================== */}

            <div className="flex items-center gap-3 px-5 pb-4 pt-5">

                {/* Company Logo */}

                <div className="flex shrink-0 justify-left">

                    <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500">

                        {currentCompany.logoUrl ? (
                            <img
                                src={currentCompany.logoUrl}
                                alt={
                                    currentCompany.companyName ||
                                    "Company"
                                }
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <Building2
                                className="h-7 w-7 text-white"
                            />
                        )}

                    </div>

                </div>

                {/* Company Info */}

                <div className="min-w-0 flex-1">

                    <p className="truncate text-xl text-gray-900">
                        {currentCompany.companyName || "-"}
                    </p>

                    <p className="text-sm text-gray-500">
                        {currentCompany.displayName ||
                            "No display name"}
                    </p>

                    <p className="text-sm text-gray-500">
                        Code: {currentCompany.companyCode || "-"}
                    </p>

                </div>

                {/* Settings */}

                <button
                    type="button"
                    className="mb-6 mr-1 flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                    <Settings
                        className="h-5 w-5 cursor-pointer rounded-lg bg-blue-600 p-0.5 text-white"
                    />
                </button>

            </div>

            {/* =====================================================
                STATUS
            ===================================================== */}

            <div className="border-b border-gray-200 px-5 pb-4">

                <span
                    className={`inline-flex rounded-md px-2.5 py-1 text-xs font-medium ${statusColor[status] ||
                        "bg-gray-100 text-gray-700"
                        }`}
                >
                    {currentCompany.status || "DRAFT"}
                </span>

            </div>

            {/* =====================================================
                DETAILS
            ===================================================== */}

            <div className="rounded-xl border border-gray-100 bg-white">

                {/* =================================================
                    BASIC DETAILS
                ================================================= */}

                <div className="mb-2 flex items-center justify-left border border-gray-50 px-5">

                    <button
                        type="button"
                        onClick={() =>
                            setShowBasicDetails(
                                !showBasicDetails
                            )
                        }
                        className="flex w-full cursor-pointer items-center justify-left gap-1 border-b border-gray-200 py-2 text-sm font-semibold uppercase text-gray-1000 hover:text-gray-700"
                    >
                        Basic Details

                        <ChevronDown
                            size={14}
                            className={`transition-transform ${showBasicDetails
                                ? "rotate-180"
                                : ""
                                }`}
                        />
                    </button>

                </div>

                {!showBasicDetails && (
                    <div className="space-y-1 border-b border-gray-200 px-5 py-3 text-sm text-gray-600">

                        <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-3">

                            <div className="space-y-4">

                                <div className="flex justify-between gap-4">
                                    <span className="font-medium text-gray-700">
                                        Company Name
                                    </span>

                                    <span className="text-right text-gray-600">
                                        {currentCompany.companyName || "-"}
                                    </span>
                                </div>

                                <div className="flex justify-between gap-4">
                                    <span className="font-medium text-gray-700">
                                        Display Name
                                    </span>

                                    <span className="text-right text-gray-600">
                                        {currentCompany.displayName || "-"}
                                    </span>
                                </div>

                                <div className="flex justify-between gap-4">
                                    <span className="font-medium text-gray-700">
                                        Legal Name
                                    </span>

                                    <span className="text-right text-gray-600">
                                        {currentCompany.legalName || "-"}
                                    </span>
                                </div>

                                <div className="flex justify-between gap-4">
                                    <span className="font-medium text-gray-700">
                                        Company Code
                                    </span>

                                    <span className="text-right text-gray-600">
                                        {currentCompany.companyCode || "-"}
                                    </span>
                                </div>

                                <div className="flex justify-between gap-4">
                                    <span className="font-medium text-gray-700">
                                        Email
                                    </span>

                                    <span className="text-right text-gray-600">
                                        {currentCompany.email || "-"}
                                    </span>
                                </div>

                                <div className="flex justify-between gap-4">
                                    <span className="font-medium text-gray-700">
                                        Phone
                                    </span>

                                    <span className="text-right text-gray-600">
                                        {currentCompany.phone || "-"}
                                    </span>
                                </div>

                            </div>

                        </div>

                    </div>
                )}

                {/* =================================================
                    ADDRESS DETAILS
                ================================================= */}

                <div className="mb-2 flex items-center justify-left border border-gray-50 px-5">

                    <button
                        type="button"
                        onClick={() =>
                            setShowAddressDetails(
                                !showAddressDetails
                            )
                        }
                        className="flex w-full cursor-pointer items-center justify-left gap-1 border-b border-gray-200 py-2 text-sm font-semibold uppercase text-gray-1000 hover:text-gray-700"
                    >
                        Address Details

                        <ChevronDown
                            size={14}
                            className={`transition-transform ${showAddressDetails
                                ? "rotate-180"
                                : ""
                                }`}
                        />
                    </button>

                </div>

                {!showAddressDetails && (
                    <div className="space-y-1 border-b border-gray-200 px-5 py-3 text-sm text-gray-600">

                        <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-3">

                            <div className="space-y-4">

                                <div className="flex justify-between gap-4">
                                    <span className="font-medium text-gray-700">
                                        Address
                                    </span>

                                    <span className="text-right text-gray-600">
                                        {currentCompany.address || "-"}
                                    </span>
                                </div>

                                <div className="flex justify-between gap-4">
                                    <span className="font-medium text-gray-700">
                                        City
                                    </span>

                                    <span className="text-right text-gray-600">
                                        {currentCompany.city || "-"}
                                    </span>
                                </div>

                                <div className="flex justify-between gap-4">
                                    <span className="font-medium text-gray-700">
                                        State
                                    </span>

                                    <span className="text-right text-gray-600">
                                        {currentCompany.state || "-"}
                                    </span>
                                </div>

                                <div className="flex justify-between gap-4">
                                    <span className="font-medium text-gray-700">
                                        Pincode
                                    </span>

                                    <span className="text-right text-gray-600">
                                        {currentCompany.pincode || "-"}
                                    </span>
                                </div>

                                <div className="flex justify-between gap-4">
                                    <span className="font-medium text-gray-700">
                                        Country
                                    </span>

                                    <span className="text-right text-gray-600">
                                        {currentCompany.country || "-"}
                                    </span>
                                </div>

                            </div>

                        </div>

                    </div>
                )}

                {/* =================================================
                    TAX DETAILS
                ================================================= */}

                <div className="mb-2 flex items-center justify-left border border-gray-50 px-5">

                    <button
                        type="button"
                        onClick={() =>
                            setShowTaxDetails(
                                !showTaxDetails
                            )
                        }
                        className="flex w-full cursor-pointer items-center justify-left gap-1 border-b border-gray-200 py-2 text-sm font-semibold uppercase text-gray-1000 hover:text-gray-700"
                    >
                        Tax Details

                        <ChevronDown
                            size={14}
                            className={`transition-transform ${showTaxDetails
                                ? "rotate-180"
                                : ""
                                }`}
                        />
                    </button>

                </div>

                {!showTaxDetails && (
                    <div className="space-y-1 border-b border-gray-200 px-5 py-3 text-sm text-gray-600">

                        <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-3">

                            <div className="space-y-4">

                                <div className="flex justify-between gap-4">
                                    <span className="font-medium text-gray-700">
                                        GST Number
                                    </span>

                                    <span className="text-right text-gray-600">
                                        {currentCompany.gstNumber || "-"}
                                    </span>
                                </div>

                                <div className="flex justify-between gap-4">
                                    <span className="font-medium text-gray-700">
                                        PAN Number
                                    </span>

                                    <span className="text-right text-gray-600">
                                        {currentCompany.panNumber || "-"}
                                    </span>
                                </div>

                                <div className="flex justify-between gap-4">
                                    <span className="font-medium text-gray-700">
                                        TAN Number
                                    </span>

                                    <span className="text-right text-gray-600">
                                        {currentCompany.tanNumber || "-"}
                                    </span>
                                </div>

                                <div className="flex justify-between gap-4">
                                    <span className="font-medium text-gray-700">
                                        Currency
                                    </span>

                                    <span className="text-right text-gray-600">
                                        {currentCompany.currency || "-"}
                                    </span>
                                </div>

                                <div className="flex justify-between gap-4">
                                    <span className="font-medium text-gray-700">
                                        Status
                                    </span>

                                    <span
                                        className={`rounded-md px-2 py-1 text-xs font-medium ${statusColor[status] ||
                                            "bg-gray-100 text-gray-700"
                                            }`}
                                    >
                                        {currentCompany.status || "-"}
                                    </span>
                                </div>

                            </div>

                        </div>

                    </div>
                )}

            </div>

        </div>
    );
}
