import React from "react";

import InvoicePreviewCard from "../tabs/InvoicePreviewCard";

export default function InvoicePreviewTabView() {
    return (
        <div className="px-3 py-2">
            <div className="grid grid-cols-1 gap-3">

                {/* =================================================
                    INVOICE PREVIEW
                ================================================= */}
                <div className="min-w-0">
                    <InvoicePreviewCard />
                </div>

            </div>
        </div>
    );
}