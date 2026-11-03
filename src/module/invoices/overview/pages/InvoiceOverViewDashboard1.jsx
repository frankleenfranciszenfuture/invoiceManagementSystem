
import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import {
    fetchInvoices,
    fetchInvoiceById,
} from "../../thunks/invoiceThunks";

import InvoiceOverViewSiderTopbar from "./InvoiceOverViewSiderTopbar";
import InvoiceOverViewSiderDetails from "./InvoiceOverViewSiderDetails";
import InvoiceOverviewTabTopbar from "./InvoiceOverviewTabTopbar";
import InvoiceViewDetails from "../../pages/InvoiceViewDetails";

export default function InvoiceOverViewDashboard1() {
    const { id } = useParams();
    const dispatch = useDispatch();

    const invoices = useSelector(
        (state) => state.invoice?.invoices ?? []
    );

    const previewInvoice = useSelector(
        (state) => state.invoice?.previewInvoice
    );

    const previewInvoiceId = useSelector(
        (state) => state.invoice?.previewInvoiceId
    );

    const previewLoading = useSelector(
        (state) => state.invoice?.previewLoading
    );

    const requestedIdRef = useRef(null);

    /* =========================================
       FETCH INVOICE LIST
    ========================================= */

    useEffect(() => {
        if (invoices.length === 0) {
            dispatch(fetchInvoices());
        }
    }, [dispatch, invoices.length]);

    /* =========================================
       FETCH URL SELECTED INVOICE
    ========================================= */

    useEffect(() => {
        if (!id) {
            requestedIdRef.current = null;
            return;
        }

        const normalizedId = String(id);

        // Already loaded completely.
        if (
            String(previewInvoiceId) === normalizedId &&
            String(
                previewInvoice?.id ??
                previewInvoice?.invoiceId
            ) === normalizedId
        ) {
            requestedIdRef.current = normalizedId;
            return;
        }

        // Request already running for this URL.
        if (
            previewLoading &&
            requestedIdRef.current === normalizedId
        ) {
            return;
        }

        if (requestedIdRef.current === normalizedId) {
            return;
        }

        requestedIdRef.current = normalizedId;

        dispatch(fetchInvoiceById(id))
            .unwrap()
            .catch((error) => {
                console.error("Invoice loading failed:", error);

                if (requestedIdRef.current === normalizedId) {
                    requestedIdRef.current = null;
                }
            });

    }, [
        id,
        dispatch,
        previewInvoice,
        previewInvoiceId,
        previewLoading,
    ]);

    return (
        <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-gray-100 p-2">

            <div className="mt-2 mr-2 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

                {/* FIXED HEADER */}

                <header className="z-20 shrink-0 border-b border-gray-200 bg-white">
                </header>

                {/* MAIN CONTENT */}

                <div className="flex min-h-0 min-w-0 flex-1 overflow-auto overscroll-contain">

                    {/* LEFT SIDEBAR */}

                    <aside className="w-[220px] min-w-[220px] shrink-0 border-r border-gray-200 bg-white">

                        <InvoiceOverViewSiderTopbar />

                        <InvoiceOverViewSiderDetails />

                    </aside>

                    {/* RIGHT CONTENT */}

                    <main className="min-w-0 flex-1 bg-gray-50">

                        <InvoiceOverviewTabTopbar />

                        <InvoiceViewDetails />

                    </main>

                </div>

            </div>

        </div>
    );
}
