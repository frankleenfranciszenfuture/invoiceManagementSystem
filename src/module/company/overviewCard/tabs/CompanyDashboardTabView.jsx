import React from "react";

import CompanySubDetailsOverviewCard from "../tabs/CompanySubDetailsOverviewCard";
import CompanySalesOverviewCard from "./CompanySalesOverviewCard";
import CompanyPayDueOverviewCard from "./CompanyPayDueOverviewCard";

export default function CompanyDashboardTabView({
    company,
}) {
    if (!company) {
        return null;
    }

    return (
        <div className="px-3 py-2">
            <div className="flex gap-8">

                <div className="flex-1">
                    <CompanySubDetailsOverviewCard
                        company={company}
                    />
                </div>

                <div className="flex-1">
                    <CompanyPayDueOverviewCard
                        company={company}
                    />

                    <CompanySalesOverviewCard
                        company={company}
                    />
                </div>

            </div>
        </div>
    );
}