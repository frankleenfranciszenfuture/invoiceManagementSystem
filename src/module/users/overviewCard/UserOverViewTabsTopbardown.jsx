import React from "react";

import {
    useSelector,
} from "react-redux";

import UserDashboardTabView
    from "../overviewCard/tabs/UserDashboardTabView";

// import UserRolesTabView
//     from "../overviewCard/tabs/UserRolesTabView";

// import UserPermissionsTabView
//     from "../overviewCard/tabs/UserPermissionsTabView";

// import UserRecentUpdatesTabView
//     from "../overviewCard/tabs/UserRecentUpdatesTabView";

export default function UserOverViewTabsTopbardown() {

    /* =========================================================
       USER STATE
    ========================================================= */

    const user = useSelector(
        (state) =>
            state.user?.user
    );

    const existingUser = useSelector(
        (state) =>
            state.user?.existingUser
    );

    /* =========================================================
       SELECT CURRENT USER
    ========================================================= */

    const selectedUser =
        existingUser || user;

    /* =========================================================
       ACTIVE TAB
    ========================================================= */

    /*
     * activeTab is not currently stored in userSlice.
     * For now, keep Dashboard as the default tab.
     *
     * When Redux-controlled tabs are needed,
     * add activeTab and setActiveTab to userSlice.
     */

    const activeTab = "Dashboard";

    /* =========================================================
       USER LOADING
    ========================================================= */

    if (!selectedUser) {

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
                Loading user...
            </div>

        );
    }

    /* =========================================================
       TABS
    ========================================================= */

    const tabs = [
        "Dashboard",
        "Roles",
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
                    <UserDashboardTabView />
                );

            /*
            case "Roles":

                return (
                    <UserRolesTabView />
                );

            case "Permissions":

                return (
                    <UserPermissionsTabView />
                );

            case "Recent Updates":

                return (
                    <UserRecentUpdatesTabView />
                );
            */

            default:

                return (
                    <UserDashboardTabView />
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