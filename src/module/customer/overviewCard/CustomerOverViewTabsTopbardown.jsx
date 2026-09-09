import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setActiveTab } from "../slices/customerSlices";

import DashboardTabView from "../overviewCard/tabs/DashboardTabView";
import CustomerTransaction from "../overviewCard/tabs/CustomerTransaction";
import CustomerTopQuotation from "../overviewCard/tabs/CustomerTopQuotation";
import CustomerRecentUpdates from "../overviewCard/tabs/CustomerRecentUpdates";

export default function CustomerOverViewTabsTopbardown() {
    const dispatch = useDispatch();

    const { activeTab, selectedCustomer } = useSelector(
        (state) => state.customers
    );

    if (!selectedCustomer) {
        return (
            <div className="p-8 text-center text-gray-500">
                Customer not found
            </div>
        );
    }

    const tabs = [
        "Dashboard",
        "Transaction",
        "Recent Updates",
        "Top Quotation",
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case "Dashboard":
                return <DashboardTabView />;

            case "Transaction":
                return <CustomerTransaction />;

            case "Recent Updates":
                return <CustomerRecentUpdates />;

            case "Top Quotation":
                return <CustomerTopQuotation />;

            default:
                return <DashboardTabView />;
        }
    };

    return (
        <div className="w-full">
            {/* Tabs */}
            <div className="flex gap-8 border-b border-gray-200 bg-white px-6">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        type="button"
                        onClick={() => dispatch(setActiveTab(tab))}
                        className={`relative cursor-pointer py-4 text-sm ${activeTab === tab
                            ? "font-semibold text-black"
                            : "text-gray-500 hover:text-gray-800"
                            }`}
                    >
                        {tab}

                        {activeTab === tab && (
                            <div className="absolute bottom-0 left-0 h-0.5 w-full bg-blue-600" />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[700px] bg-gray-50 p-6">
                {renderTabContent()}
            </div>
        </div>
    );
}