import React, { useState } from "react";
import { useSelector } from "react-redux";

import InvoiceDashboardTabView from "../overviewCard/tabs/InvoiceDashboardTabView";
import InvoicePreviewTabView from "./tabs/InvoicePreviewTabView";

export default function InvoiceOverViewTabsTopbardown() {

    /* =========================================================
       INVOICE STATE
    ========================================================= */

    const invoice = useSelector(
        (state) => state.invoice?.invoice
    );

    const existingInvoice = useSelector(
        (state) => state.invoice?.existingInvoice
    );

    /* =========================================================
       SELECT CURRENT INVOICE
    ========================================================= */

    const selectedInvoice =
        existingInvoice || invoice;

    /* =========================================================
       ACTIVE TAB
    ========================================================= */

    const [activeTab, setActiveTab] = useState("Dashboard");

    /* =========================================================
       INVOICE LOADING
    ========================================================= */

    if (!selectedInvoice) {
        return (
            <div className="flex min-h-[300px] items-center justify-center bg-gray-50 p-8 text-center text-gray-500">
                Loading invoice...
            </div>
        );
    }

    /* =========================================================
       TABS
    ========================================================= */

    const tabs = [
        "Dashboard",
        "Transaction",
        "Recent Updates",
        "Payment History",
    ];

    /* =========================================================
       TAB CONTENT
    ========================================================= */

    const renderTabContent = () => {

        switch (activeTab) {

            case "Dashboard":
                return <InvoiceDashboardTabView />;

            case "Transaction":
                return <InvoicePreviewTabView />;

            case "Recent Updates":
                return (
                    <div className="p-6 text-sm text-gray-500">
                        Recent Updates coming soon...
                    </div>
                );

            case "Payment History":
                return (
                    <div className="p-6 text-sm text-gray-500">
                        Payment History coming soon...
                    </div>
                );

            default:
                return <InvoiceDashboardTabView />;
        }
    };

    /* =========================================================
       RENDER
    ========================================================= */

    return (
        <div className="w-full">

            {/* =====================================================
                TABS
            ===================================================== */}

            <div className="flex gap-8 border-b border-gray-200 bg-white px-6">

                {tabs.map((tab) => {

                    const isActive =
                        activeTab === tab;

                    return (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setActiveTab(tab)}
                            className={`relative py-4 text-sm transition-colors ${isActive
                                ? "font-semibold text-black"
                                : "cursor-pointer text-gray-500 hover:text-gray-800"
                                }`}
                        >
                            {tab}

                            {isActive && (
                                <div className="absolute bottom-0 left-0 h-0.5 w-full bg-blue-600" />
                            )}
                        </button>
                    );
                })}

            </div>

            {/* =====================================================
                TAB CONTENT
            ===================================================== */}

            <div className="min-h-[700px] bg-gray-50 p-6">

                {renderTabContent()}

            </div>

        </div>
    );
}