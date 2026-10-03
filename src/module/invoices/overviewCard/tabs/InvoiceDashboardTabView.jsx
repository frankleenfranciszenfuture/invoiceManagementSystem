import React from "react";

import InvoiceSubDetailsOverviewCard from "../tabs/InvoiceSubDetailsOverviewCard";
import InvoiceSalesOverviewCard from "./InvoiceSalesOverviewCard";
import InvoicePayDueOverviewCard from "./InvoicePayDueOverviewCard";

export default function InvoiceDashboardTabView() {

    return (

        // <div className="px-3 py-2">

        //     <div className="flex gap-8">

        //         {/* =================================================
        //             LEFT COLUMN
        //         ================================================= */}

        //         <div className="flex-1">

        //             <InvoiceSubDetailsOverviewCard />

        //         </div>

        //         {/* =================================================
        //             RIGHT COLUMN
        //         ================================================= */}

        //         <div className="flex-1">

        //             <InvoicePayDueOverviewCard />

        //             <InvoiceSalesOverviewCard />

        //         </div>

        //     </div>

        // </div>

        <div className="px-3 py-2 space-y-3">
            <InvoiceSubDetailsOverviewCard />
            <InvoicePayDueOverviewCard />
        </div>
    );
}