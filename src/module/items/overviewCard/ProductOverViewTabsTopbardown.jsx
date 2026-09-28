import React from "react";
import { useSelector } from "react-redux";

import ProductDashboardTabView from "../overviewCard/tabs/ProductDashboardTabView";
// import ProductTransaction from "../overviewCard/tabs/ProductTransaction";
// import ProductRecentUpdates from "../overviewCard/tabs/ProductRecentUpdates";
// import ProductTopQuotation from "../overviewCard/tabs/ProductTopQuotation";

export default function ProductOverViewTabsTopbardown() {

    /* =========================================================
       PRODUCT STATE
       ========================================================= */

    const product = useSelector(
        (state) => state.product?.product
    );

    const exsistingProduct = useSelector(
        (state) => state.product?.exsistingProduct
    );

    /* =========================================================
       SELECT CURRENT PRODUCT
       ========================================================= */

    const selectedProduct =
        exsistingProduct || product;

    /* =========================================================
       ACTIVE TAB
       ========================================================= */

    /*
     * activeTab is not currently stored in productSlice.
     * For now, keep Dashboard as the default tab.
     *
     * When Redux-controlled tabs are needed,
     * add activeTab and setActiveTab to productSlice.
     */

    const activeTab = "Dashboard";

    /* =========================================================
       PRODUCT LOADING
       ========================================================= */

    if (!selectedProduct) {
        return (
            <div className="flex min-h-[300px] items-center justify-center bg-gray-50 p-8 text-center text-gray-500">
                Loading product...
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
                return <ProductDashboardTabView />;

            /*
            case "Transaction":
                return <ProductTransaction />;

            case "Recent Updates":
                return <ProductRecentUpdates />;

            case "Top Quotation":
                return <ProductTopQuotation />;
            */

            default:
                return <ProductDashboardTabView />;
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
                            disabled={tab !== "Dashboard"}
                            className={`relative py-4 text-sm ${isActive
                                ? "font-semibold text-black"
                                : tab !== "Dashboard"
                                    ? "cursor-not-allowed text-gray-300"
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