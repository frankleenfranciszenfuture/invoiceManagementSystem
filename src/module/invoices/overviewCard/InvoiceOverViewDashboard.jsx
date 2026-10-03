import React, { useEffect } from "react";
import {
    useDispatch,
    useSelector,
} from "react-redux";
import { useParams } from "react-router-dom";

import {
    fetchInvoices,
    fetchInvoiceById,
} from "../thunks/invoiceThunks";

import InvoiceOverViewSiderTopbar from "../overviewCard/InvoiceOverViewSiderTopbar";
import InvoiceOverViewSiderDetails from "../overviewCard/InvoiceOverViewSiderDetails";
import InvoiceOverviewTabTopbar from "../overviewCard/InvoiceOverviewTabTopbar";
import InvoiceOverViewTabsTopbardown from "../overviewCard/InvoiceOverViewTabsTopbardown";

export default function InvoiceOverViewDashboard() {

    const { id } = useParams();
    const dispatch = useDispatch();

    /* =========================================================
       INVOICE LIST
    ========================================================= */

    const invoices = useSelector(
        (state) => state.invoice?.invoices ?? []
    );

    /* =========================================================
       FETCH INVOICES
    ========================================================= */

    useEffect(() => {

        if (!id) {
            return;
        }

        // Load invoice list for left sidebar
        if (invoices.length === 0) {
            dispatch(fetchInvoices({
                page: 0,
                size: 20,
                searchParams: {},
            }));
        }

        // Load currently selected invoice
        dispatch(fetchInvoiceById(id));

    }, [id, dispatch, invoices.length]);

    /* =========================================================
       RENDER
    ========================================================= */

    return (
        <div className="flex h-screen flex-col bg-gray-100">

            <div className="flex min-h-0 flex-1">

                {/* =================================================
                    LEFT SIDEBAR
                ================================================= */}

                <div className="flex w-[287px] shrink-0 flex-col overflow-y-auto border-r border-gray-200 bg-white">

                    <InvoiceOverViewSiderTopbar />

                    <InvoiceOverViewSiderDetails />

                </div>

                {/* =================================================
                    RIGHT CONTENT
                ================================================= */}

                <div className="flex min-w-0 flex-1 flex-col">

                    <InvoiceOverviewTabTopbar />

                    <div className="min-h-0 flex-1">

                        <InvoiceOverViewTabsTopbardown />

                    </div>

                </div>

            </div>

        </div>
    );
}