
import React, { useMemo, useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { setExistingInvoice } from "../../slices/invoiceSlice";
import { fetchInvoiceById } from "../../thunks/invoiceThunks";

const PAGE_SIZE = 5;

export default function InvoiceOverViewSiderDetails() {
    const dispatch = useDispatch();
    const { id } = useParams();

    const invoices = useSelector(
        (state) => state.invoice?.invoices ?? []
    );

    const existingInvoice = useSelector(
        (state) => state.invoice?.exsistingInvoice ?? null
    );

    const previewInvoiceId = useSelector(
        (state) => state.invoice?.previewInvoiceId ?? null
    );

    const invoiceStatus = useSelector(
        (state) => state.invoiceView?.invoiceStatus ?? "ALL"
    );

    const [currentPage, setCurrentPage] = useState(1);

    // Prevent duplicate requests for an invoice already being fetched.
    const requestedInvoiceIdRef = useRef(null);

    const statusColor = {
        DRAFT: "bg-yellow-100 text-yellow-700",
        ACTIVE: "bg-green-100 text-green-700",
        INACTIVE: "bg-red-100 text-red-700",
        CANCELLED: "bg-red-100 text-red-700",
        APPROVED: "bg-green-100 text-green-700",
        REJECTED: "bg-red-100 text-red-700",
        PAID: "bg-green-100 text-green-700",
        SENT: "bg-blue-100 text-blue-700",
        OVERDUE: "bg-red-100 text-red-700",
        PENDING: "bg-amber-100 text-amber-700",
    };

    const getInvoiceId = (invoice) =>
        invoice?.id ?? invoice?.invoiceId ?? null;

    const getStatusLabel = (invoice) =>
        invoice?.status || invoice?.invoiceStatus || "DRAFT";

    const filteredInvoices = useMemo(() => {
        if (!Array.isArray(invoices)) return [];

        const status = String(invoiceStatus || "ALL").toUpperCase();

        if (status === "ALL") return invoices;

        return invoices.filter((invoice) => {
            const invoiceCurrentStatus = String(
                invoice.status || invoice.invoiceStatus || "DRAFT"
            ).toUpperCase();

            return invoiceCurrentStatus === status;
        });
    }, [invoices, invoiceStatus]);

    const sortedInvoices = useMemo(() => {
        return [...filteredInvoices].sort((a, b) => {
            const idA = Number(getInvoiceId(a)) || 0;
            const idB = Number(getInvoiceId(b)) || 0;

            return idB - idA;
        });
    }, [filteredInvoices]);

    const totalPages = Math.max(
        1,
        Math.ceil(sortedInvoices.length / PAGE_SIZE)
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [invoiceStatus]);

    useEffect(() => {
        setCurrentPage((page) => Math.min(page, totalPages));
    }, [totalPages]);

    const startIndex = (currentPage - 1) * PAGE_SIZE;

    const paginatedInvoices = sortedInvoices.slice(
        startIndex,
        startIndex + PAGE_SIZE
    );

    const handleInvoiceClick = async (invoice) => {
        const invoiceId = getInvoiceId(invoice);

        if (invoiceId == null) return;

        const normalizedId = String(invoiceId);

        // Select immediately so the preview header responds at once.
        dispatch(setExistingInvoice(invoice));

        // Skip fetching if these exact full details are already loaded.
        if (
            String(previewInvoiceId) === normalizedId &&
            String(getInvoiceId(existingInvoice)) === normalizedId
        ) {
            return;
        }

        // Avoid starting the same request multiple times.
        if (requestedInvoiceIdRef.current === normalizedId) {
            return;
        }

        requestedInvoiceIdRef.current = normalizedId;

        try {
            await dispatch(fetchInvoiceById(invoiceId)).unwrap();
        } catch (error) {
            console.error(
                `Failed to load invoice ${normalizedId}:`,
                error
            );
        } finally {
            if (requestedInvoiceIdRef.current === normalizedId) {
                requestedInvoiceIdRef.current = null;
            }
        }
    };

    const selectedInvoiceId = getInvoiceId(existingInvoice) ?? id;

    return (
        <div className="flex w-full min-w-0 flex-col bg-white">
            <div className="w-full">
                {paginatedInvoices.length > 0 ? (
                    paginatedInvoices.map((invoice) => {
                        const invoiceId = getInvoiceId(invoice);

                        const isSelected =
                            selectedInvoiceId != null &&
                            String(selectedInvoiceId) === String(invoiceId);

                        const status = String(
                            getStatusLabel(invoice)
                        ).toUpperCase();

                        return (
                            <div
                                key={invoiceId}
                                role="button"
                                tabIndex={0}
                                onClick={() => handleInvoiceClick(invoice)}
                                onKeyDown={(event) => {
                                    if (
                                        event.key === "Enter" ||
                                        event.key === " "
                                    ) {
                                        event.preventDefault();
                                        handleInvoiceClick(invoice);
                                    }
                                }}
                                aria-pressed={isSelected}
                                className={`w-full cursor-pointer border-b border-gray-100 px-3 py-4 transition-colors ${isSelected
                                    ? "border-l-4 border-l-[#0095FD] bg-[#0095FD]/10"
                                    : "border-l-4 border-l-transparent hover:bg-gray-50"
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex min-w-0 gap-2">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            readOnly
                                            tabIndex={-1}
                                            onClick={(event) =>
                                                event.stopPropagation()
                                            }
                                            className="mt-1 shrink-0 accent-blue-600"
                                            aria-label={`Select invoice ${invoice.invoiceNumber ??
                                                invoiceId
                                                }`}
                                        />

                                        <div className="min-w-0">
                                            <h3 className="break-words text-sm font-semibold text-gray-800">
                                                {invoice.invoiceNumber ||
                                                    "Unnamed invoice"}
                                            </h3>

                                            <p className="mt-1 text-xs text-gray-500">
                                                #{invoiceId}
                                            </p>

                                            {invoice.invoiceType && (
                                                <p className="mt-1 break-words text-xs text-gray-400">
                                                    {invoice.invoiceType}
                                                </p>
                                            )}

                                            <span
                                                className={`mt-2 inline-flex rounded-md px-2 py-1 text-xs font-medium ${statusColor[status] ||
                                                    "bg-gray-100 text-gray-700"
                                                    }`}
                                            >
                                                {getStatusLabel(invoice)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="shrink-0 text-right">
                                        <p className="text-sm font-semibold text-gray-800">
                                            ₹
                                            {Number(
                                                invoice.grandTotal || 0
                                            ).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="flex min-h-[200px] flex-col items-center justify-center px-4 text-center">
                        <p className="text-sm font-medium text-gray-700">
                            No invoices found
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                            No invoices match "{invoiceStatus}".
                        </p>
                    </div>
                )}
            </div>

            {sortedInvoices.length > PAGE_SIZE && (
                <div className="sticky bottom-0 z-10 mt-auto border-t border-gray-200 bg-white px-3 py-3">
                    <div className="flex items-center justify-between gap-2">
                        <button
                            type="button"
                            onClick={() =>
                                setCurrentPage((page) =>
                                    Math.max(1, page - 1)
                                )
                            }
                            disabled={currentPage === 1}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-gray-200 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label="Previous page"
                        >
                            <ChevronLeft size={16} />
                        </button>

                        <div className="min-w-0 text-center">
                            <p className="text-xs font-medium text-gray-700">
                                Page {currentPage} of {totalPages}
                            </p>

                            <p className="mt-1 text-[10px] text-gray-400">
                                {startIndex + 1}–
                                {Math.min(
                                    startIndex + PAGE_SIZE,
                                    sortedInvoices.length
                                )}{" "}
                                of {sortedInvoices.length}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                setCurrentPage((page) =>
                                    Math.min(totalPages, page + 1)
                                )
                            }
                            disabled={currentPage === totalPages}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-gray-200 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label="Next page"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
