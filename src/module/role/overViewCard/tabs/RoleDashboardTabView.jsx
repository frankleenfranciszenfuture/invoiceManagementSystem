import React from "react";

import RoleSubDetailsOverviewCard from "../tabs/RoleSubDetailsOverviewCard";
import RolePermissionsOverviewCard from "./RolePermissionsOverviewCard";
import RoleUsersOverviewCard from "./RoleUsersOverviewCard";

export default function RoleDashboardTabView() {

    return (

        <div className="px-3 py-2">

            <div className="flex gap-8">

                {/* =================================================
                    LEFT COLUMN
                ================================================= */}

                <div className="flex-1">

                    <RoleSubDetailsOverviewCard />

                </div>

                {/* =================================================
                    RIGHT COLUMN
                ================================================= */}

                <div className="flex-1">

                    <RolePermissionsOverviewCard />

                    <RoleUsersOverviewCard />

                </div>

            </div>

        </div>

    );

}