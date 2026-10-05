import React from "react";

import {
    useSelector,
} from "react-redux";

import RoleDashboardTabView from "../overviewCard/tabs/RoleDashboardTabView";
// import RoleUsersTabView from "../overviewCard/tabs/RoleUsersTabView";
// import RolePermissionsTabView from "../overviewCard/tabs/RolePermissionsTabView";
// import RoleRecentUpdatesTabView from "../overviewCard/tabs/RoleRecentUpdatesTabView";

export default function RoleOverViewTabsTopbardown() {

    /* =========================================================
       ROLE STATE
    ========================================================= */

    const role = useSelector(
        (state) =>
            state.role?.role
    );

    const existingRole = useSelector(
        (state) =>
            state.role?.existingRole
    );

    /* =========================================================
       SELECT CURRENT ROLE
    ========================================================= */

    const selectedRole =
        existingRole || role;

    /* =========================================================
       ACTIVE TAB
    ========================================================= */

    /*
     * activeTab is not currently stored in roleSlice.
     * For now, keep Dashboard as the default tab.
     *
     * When Redux-controlled tabs are needed,
     * add activeTab and setActiveTab to roleSlice.
     */

    const activeTab = "Dashboard";

    /* =========================================================
       ROLE LOADING
    ========================================================= */

    if (!selectedRole) {

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
                Loading role...
            </div>

        );
    }

    /* =========================================================
       TABS
    ========================================================= */

    const tabs = [
        "Dashboard",
        "Users",
        "Permissions",
        "Recent Updates",
    ];

    /* =========================================================
       TAB CONTENT
    ========================================================= */

    const renderTabContent = () => {

        switch (activeTab) {

            case "Dashboard":

                return (
                    <RoleDashboardTabView />
                );

            /*
            case "Users":

                return (
                    <RoleUsersTabView />
                );

            case "Permissions":

                return (
                    <RolePermissionsTabView />
                );

            case "Recent Updates":

                return (
                    <RoleRecentUpdatesTabView />
                );
            */

            default:

                return (
                    <RoleDashboardTabView />
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