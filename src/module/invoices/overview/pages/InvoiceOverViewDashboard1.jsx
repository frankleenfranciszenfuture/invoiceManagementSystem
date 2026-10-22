
import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import {
    fetchInvoices,
    fetchInvoiceById,
} from "../../thunks/invoiceThunks";

import InvoiceOverViewSiderTopbar from "./InvoiceOverViewSiderTopbar";
import InvoiceOverViewSiderDetails from "./InvoiceOverViewSiderDetails";
import InvoicePreviewCard from "./InvoicePreviewCard";
import InvoiceOverviewTabTopbar from "./InvoiceOverviewTabTopbar"
import InvoiceprofileOverview from "./InvoiceprofileOverview";

export default function InvoiceOverViewDashboard1() {
    const { id } = useParams();
    const dispatch = useDispatch();

    const invoices = useSelector(
        (state) => state.invoice?.invoices ?? []
    );

    const loading = useSelector(
        (state) => state.invoice?.loading ?? false
    );

    const requestedIdRef = useRef(null);

    useEffect(() => {
        if (invoices.length === 0) {
            dispatch(fetchInvoices());
        }
    }, [dispatch, invoices.length]);

    useEffect(() => {
        if (!id) {
            requestedIdRef.current = null;
            return;
        }

        if (requestedIdRef.current === id) return;

        requestedIdRef.current = id;

        dispatch(fetchInvoiceById(id))
            .unwrap()
            .catch(() => {
                if (requestedIdRef.current === id) {
                    requestedIdRef.current = null;
                }
            });
    }, [id, dispatch]);

    return (
        <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-gray-100 p-2">
            <div className="mt-2 mr-2 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

                {/* Fixed header area */}
                <header className="z-20 shrink-0 border-b border-gray-200 bg-white">
                    {/* <InvoiceOverviewTabTopbar /> */}
                </header>

                {/* Single shared scroll area */}
                <div className="flex min-h-0 min-w-0 flex-1 overflow-auto overscroll-contain">

                    {/* LEFT SIDEBAR */}
                    <aside className="w-[130px] min-w-[220px] shrink-0 border-r border-gray-200 bg-white">
                        <InvoiceOverViewSiderTopbar />
                        <InvoiceOverViewSiderDetails />
                    </aside>

                    {/* RIGHT CONTENT */}
                    <main className="min-w-0 flex-1 bg-gray-50">
                        <InvoiceOverviewTabTopbar />
                        <InvoiceprofileOverview />
                    </main>
                </div>
            </div>
        </div>
    );
}
