import React from "react";

import UserSubDetailsOverviewCard
    from "../tabs/UserSubDetailsOverviewCard";

import UserRolesOverviewCard
    from "./UserRolesOverviewCard";

import UserPermissionsOverviewCard
    from "./UserPermissionsOverviewCard";

export default function UserDashboardTabView() {

    return (

        <div className="px-3 py-2">

            <div className="flex gap-8">

                {/* =================================================
                    LEFT COLUMN
                ================================================= */}

                <div className="flex-1">

                    <UserSubDetailsOverviewCard />

                </div>

                {/* =================================================
                    RIGHT COLUMN
                ================================================= */}

                <div className="flex-1">

                    <UserRolesOverviewCard />

                    <UserPermissionsOverviewCard />

                </div>

            </div>

        </div>

    );

}