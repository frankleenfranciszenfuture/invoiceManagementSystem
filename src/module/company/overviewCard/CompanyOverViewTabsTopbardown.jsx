import React from "react";

import {
    useSelector,
} from "react-redux";

import CompanyDashboardTabView from "../overviewCard/tabs/CompanyDashboardTabView";
// import CompanyTransaction from "../overviewCard/tabs/CompanyTransaction";
// import CompanyRecentUpdates from "../overviewCard/tabs/CompanyRecentUpdates";
// import CompanyTopQuotation from "../overviewCard/tabs/CompanyTopQuotation";

export default function CompanyOverViewTabsTopbardown() {

    /* =========================================================
       COMPANY STATE
    ========================================================= */

    const company = useSelector(
        (state) =>
            state.company?.company
    );

    const existingCompany = useSelector(
        (state) =>
            state.company?.existingCompany
    );

    /* =========================================================
       SELECT CURRENT COMPANY
    ========================================================= */

    const selectedCompany =
        existingCompany || company;

    /* =========================================================
       ACTIVE TAB
    ========================================================= */

    /*
     * activeTab is not currently stored in companySlice.
     * For now, keep Dashboard as the default tab.
     *
     * When Redux-controlled tabs are needed,
     * add activeTab and setActiveTab to companySlice.
     */

    const activeTab = "Dashboard";

    /* =========================================================
       COMPANY LOADING
    ========================================================= */

    if (!selectedCompany) {
        return (
            <div
                className="
                    flex
                    min-h-[300px]
                    items-center
                    justify-center
                    bg-gray-50
                    p-8
                    text-center
                    text-gray-500
                "
            >
                Loading company...
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
        "Top Quotation",
    ];

    /* =========================================================
       TAB CONTENT
    ========================================================= */

    const renderTabContent = () => {

        switch (activeTab) {

            case "Dashboard":
                return (
                    <CompanyDashboardTabView />
                );

            /*
            case "Transaction":
                return (
                    <CompanyTransaction />
                );

            case "Recent Updates":
                return (
                    <CompanyRecentUpdates />
                );

            case "Top Quotation":
                return (
                    <CompanyTopQuotation />
                );
            */

            default:
                return (
                    <CompanyDashboardTabView />
                );
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

            <div
                className="
                    flex
                    gap-8
                    border-b
                    border-gray-200
                    bg-white
                    px-6
                "
            >

                {tabs.map((tab) => {

                    const isActive =
                        activeTab === tab;

                    return (

                        <button
                            key={tab}
                            type="button"
                            disabled={
                                tab !== "Dashboard"
                            }
                            className={`
                                relative
                                py-4
                                text-sm

                                ${isActive
                                    ? "font-semibold text-black"
                                    : tab !== "Dashboard"
                                        ? "cursor-not-allowed text-gray-300"
                                        : "cursor-pointer text-gray-500 hover:text-gray-800"
                                }
                            `}
                        >

                            {tab}

                            {isActive && (

                                <div
                                    className="
                                        absolute
                                        bottom-0
                                        left-0
                                        h-0.5
                                        w-full
                                        bg-blue-600
                                    "
                                />

                            )}

                        </button>

                    );

                })}

            </div>

            {/* =====================================================
                TAB CONTENT
            ===================================================== */}

            <div
                className="
                    min-h-[700px]
                    bg-gray-50
                    p-6
                "
            >
                {renderTabContent()}
            </div>

        </div>

    );
}