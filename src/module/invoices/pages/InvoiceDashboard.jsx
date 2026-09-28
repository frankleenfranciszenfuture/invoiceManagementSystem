
import React, { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Plus, Download } from "lucide-react";

import InvoiceTable from "./InvoiceTable";
import NavbarInvoice from "../components/bars/nav/NavbarInvoice";

import { fetchInvoices } from "../thunks/invoiceThunks";

import {
    setInvoiceStatus,
    setSelectedInvoiceView,
} from "../slices/invoiceViewSlice";

import { openModal } from "../../../module/ui/uiSlice";

import InvoiceSkeleton from "../../../common/loader/InvoiceSkeleton";
import InvoiceCreate from "./InvoiceCreate";

export default function InvoiceDashboard() {

    const dispatch = useDispatch();

    // ============================================================
    // INVOICE STATE
    // ============================================================

    const invoicesFromRedux = useSelector(
        (state) => state.invoice?.invoices
    );

    const invoices = invoicesFromRedux ?? [];

    const loading = useSelector(
        (state) => state.invoice?.loading || false
    );

    const error = useSelector(
        (state) => state.invoice?.error
    );

    // ============================================================
    // INVOICE FILTER STATE
    // ============================================================

    const invoiceStatus = useSelector(
        (state) =>
            state.invoiceView?.invoiceStatus || "ALL"
    );

    // ============================================================
    // FETCH INVOICES
    // ============================================================

    useEffect(() => {

        console.log("Fetching invoices...");

        dispatch(
            fetchInvoices({
                page: 0,
                size: 20,
            })
        );

    }, [dispatch]);

    // ============================================================
    // SYNC URL STATUS → REDUX
    // ============================================================

    useEffect(() => {

        const params = new URLSearchParams(
            window.location.search
        );

        const urlStatus =
            params.get("invoiceStatus");

        if (!urlStatus) {
            return;
        }

        const normalizedStatus =
            String(urlStatus).toUpperCase();

        const validStatuses = [
            "ALL",
            "ACTIVE",
            "INACTIVE",
            "DRAFT",
        ];

        if (!validStatuses.includes(normalizedStatus)) {
            return;
        }

        dispatch(
            setInvoiceStatus(normalizedStatus)
        );

        const statusLabels = {
            ALL: "All Invoices",
            ACTIVE: "Active Invoices",
            INACTIVE: "Inactive Invoices",
            DRAFT: "Draft Invoices",
        };

        dispatch(
            setSelectedInvoiceView(
                statusLabels[normalizedStatus]
            )
        );

    }, [dispatch]);

    // ============================================================
    // DEBUG
    // ============================================================

    useEffect(() => {

        console.log("================================");
        console.log(
            "INVOICES FROM REDUX:",
            invoices
        );

        console.log(
            "INVOICE LOADING:",
            loading
        );

        console.log(
            "INVOICE ERROR:",
            error
        );

        console.log(
            "INVOICE STATUS:",
            invoiceStatus
        );

        console.log("================================");

    }, [
        invoices,
        loading,
        error,
        invoiceStatus,
    ]);

    // ============================================================
    // FILTER INVOICES BY STATUS
    // ============================================================

    const filteredInvoices = useMemo(() => {

        const selectedStatus =
            String(invoiceStatus || "ALL")
                .toUpperCase();

        // ========================================================
        // ALL
        // ========================================================

        if (selectedStatus === "ALL") {
            return invoices;
        }

        // ========================================================
        // FILTER
        // ========================================================

        return invoices.filter((invoice) => {

            const backendStatus =
                String(invoice?.status || "")
                    .toUpperCase();

            console.log(
                "Invoice:",
                invoice?.invoiceNumber,
                "| Backend Status:",
                backendStatus,
                "| Selected Status:",
                selectedStatus
            );

            return backendStatus === selectedStatus;
        });

    }, [
        invoices,
        invoiceStatus,
    ]);

    // ============================================================
    // OPEN CREATE INVOICE MODAL
    // ============================================================

    const handleCreateInvoice = () => {

        console.log("Opening Add Invoice modal");

        dispatch(
            openModal({
                type: "addInvoice",
            })
        );

    };

    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {
        return <InvoiceSkeleton />;
    }

    // ============================================================
    // PAGE
    // ============================================================

    return (
        <div className="flex h-screen bg-gray-50 font-sans text-[13px] overflow-hidden">

            <div className="flex-1 min-h-0 bg-white overflow-y-auto">

                <div className="px-2 py-5 max-w-30xl w-full">

                    {/* =================================================
                        INVOICE NAVBAR
                    ================================================= */}

                    <NavbarInvoice />

                    {/* =================================================
                        ERROR
                    ================================================= */}

                    {error && (
                        <div
                            className="
                                mx-2
                                mt-4
                                px-4
                                py-3
                                rounded-md
                                border
                                border-red-200
                                bg-red-50
                                text-sm
                                text-red-600
                            "
                        >
                            {error}
                        </div>
                    )}

                    {/* =================================================
                        INVOICE TABLE / EMPTY STATE
                    ================================================= */}

                    {filteredInvoices.length > 0 ? (

                        <InvoiceTable
                            invoices={filteredInvoices}
                        />

                    ) : (

                        <div
                            className="
                                min-h-full
                                flex
                                flex-col
                                items-center
                                justify-center
                                gap-3
                                px-4
                            "
                        >

                            {/* =================================================
                                EMPTY STATE ICON
                            ================================================= */}

                            <div
                                className="
                                    relative
                                    w-24
                                    h-24
                                    rounded-full
                                    bg-gray-100
                                    flex
                                    items-center
                                    justify-center
                                    mb-1
                                    flex-shrink-0
                                    mt-30
                                "
                            >

                                <div className="text-gray-400 text-3xl">
                                    ₹
                                </div>

                                <div
                                    className="
                                        absolute
                                        bottom-1
                                        right-1
                                        w-7
                                        h-7
                                        rounded-full
                                        bg-blue-600
                                        flex
                                        items-center
                                        justify-center
                                        text-white
                                    "
                                >
                                    <Plus className="w-4 h-4" />
                                </div>

                            </div>

                            {/* =================================================
                                EMPTY STATE TITLE
                            ================================================= */}

                            <p className="text-base font-medium text-gray-800 text-center">
                                Every sale starts with an invoice
                            </p>

                            {/* =================================================
                                EMPTY STATE DESCRIPTION
                            ================================================= */}

                            <p className="text-sm text-gray-500 text-center max-w-sm">
                                Create and manage your customer invoices,
                                sales details, GST calculations, and payment
                                information, all in one place.
                            </p>

                            {/* =================================================
                                ACTION BUTTONS
                            ================================================= */}

                            <div
                                className="
                                    flex
                                    items-center
                                    gap-2.5
                                    mt-1
                                    flex-wrap
                                    justify-center
                                "
                            >

                                {/* CREATE INVOICE */}

                                <button
                                    type="button"
                                    onClick={handleCreateInvoice}
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                        bg-blue-600
                                        text-white
                                        text-sm
                                        font-medium
                                        px-4
                                        py-2
                                        rounded-md
                                        hover:bg-blue-700
                                        transition-colors
                                        whitespace-nowrap
                                    "
                                >
                                    <Plus className="w-4 h-4" />

                                    Create New Invoice
                                </button>

                                {/* IMPORT */}

                                <button
                                    type="button"
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                        bg-white
                                        text-gray-700
                                        text-sm
                                        border
                                        border-gray-300
                                        px-4
                                        py-2
                                        rounded-md
                                        hover:bg-gray-50
                                        transition-colors
                                        whitespace-nowrap
                                    "
                                >
                                    <Download className="w-4 h-4" />

                                    Import File
                                </button>

                            </div>

                        </div>
                    )}

                </div>

            </div>

            {/* =========================================================
                INVOICE CREATE / EDIT MODAL
            ========================================================= */}

            {/* <InvoiceCreate /> */}

        </div>
    );
}
