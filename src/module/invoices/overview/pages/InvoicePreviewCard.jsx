
import React, {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import {
    ChevronDown,
    Settings,
    FileText,
    RefreshCw,
    Home,
    ArrowLeft,
} from "lucide-react";

import { openModal } from "../../../ui/uiSlice";
import { fetchInvoiceById } from "../../thunks/invoiceThunks";
import invoiceTemplates from "../template/templateRegistry";

export default function InvoicePreviewCard() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();

    const [customizeOpen, setCustomizeOpen] = useState(false);
    const [previewScale, setPreviewScale] = useState(1);

    const customizeRef = useRef(null);
    const previewRef = useRef(null);
    const requestedInvoiceIdRef = useRef(null);

    /* ============================================================
       REDUX STATE
    ============================================================ */

    const invoiceState = useSelector(
        (state) => state.invoice || {}
    );

    const {
        invoices = [],
        selectedInvoice,
        invoice: currentInvoice,
        exsistingInvoice,
        previewInvoice,
        previewInvoiceId,
        previewLoading = false,
        previewError,
        error,
        invoiceTemplate: reduxInvoiceTemplate,
    } = invoiceState;

    const getInvoiceId = (item) =>
        item?.id ?? item?.invoiceId ?? null;

    const sameId = (first, second) =>
        first != null &&
        second != null &&
        String(first) === String(second);

    /* ============================================================
       SELECTED INVOICE

       Sidebar selection takes priority over the URL.
       The URL is used when opening or refreshing a preview directly.
    ============================================================ */

    const selectedInvoiceId =
        getInvoiceId(exsistingInvoice) ??
        getInvoiceId(selectedInvoice) ??
        getInvoiceId(currentInvoice) ??
        id ??
        null;

    /* ============================================================
       FULL PREVIEW VALIDATION
    ============================================================ */

    const hasFullPreview =
        previewInvoice != null &&
        sameId(
            getInvoiceId(previewInvoice),
            selectedInvoiceId
        ) &&
        (
            previewInvoiceId == null ||
            sameId(previewInvoiceId, selectedInvoiceId)
        );

    /* ============================================================
       SELECT THE CORRECT INVOICE

       Never use an unrelated invoice as the preview.
       The sidebar object is only a fallback while details load.
    ============================================================ */

    const invoice = useMemo(() => {
        const matchesId = (item, targetId) =>
            item != null &&
            targetId != null &&
            sameId(getInvoiceId(item), targetId);

        if (
            previewInvoice &&
            matchesId(previewInvoice, selectedInvoiceId) &&
            (
                previewInvoiceId == null ||
                sameId(previewInvoiceId, selectedInvoiceId)
            )
        ) {
            return previewInvoice;
        }

        if (matchesId(exsistingInvoice, selectedInvoiceId)) {
            return exsistingInvoice;
        }

        if (matchesId(selectedInvoice, selectedInvoiceId)) {
            return selectedInvoice;
        }

        if (matchesId(currentInvoice, selectedInvoiceId)) {
            return currentInvoice;
        }

        if (Array.isArray(invoices)) {
            const listInvoice = invoices.find((item) =>
                matchesId(item, selectedInvoiceId)
            );

            if (listInvoice) {
                return listInvoice;
            }
        }

        // Permit a fallback only when no target ID exists.
        if (selectedInvoiceId == null) {
            return (
                previewInvoice ||
                exsistingInvoice ||
                selectedInvoice ||
                currentInvoice ||
                null
            );
        }

        return null;
    }, [
        selectedInvoiceId,
        previewInvoice,
        previewInvoiceId,
        exsistingInvoice,
        selectedInvoice,
        currentInvoice,
        invoices,
    ]);

    /* ============================================================
       FETCH ON INITIAL LOAD / REFRESH

       Fetch when the requested URL ID does not match the current
       selection or when its full preview has not been loaded.
    ============================================================ */

    useEffect(() => {
        if (!id) {
            requestedInvoiceIdRef.current = null;
            return;
        }

        const currentRequestId = String(id);

        const previewMatchesUrl =
            hasFullPreview &&
            sameId(selectedInvoiceId, id);

        if (previewMatchesUrl) {
            requestedInvoiceIdRef.current = null;
            return;
        }

        if (
            requestedInvoiceIdRef.current === currentRequestId
        ) {
            return;
        }

        requestedInvoiceIdRef.current = currentRequestId;

        dispatch(fetchInvoiceById(id))
            .unwrap()
            .catch((fetchError) => {
                console.error(
                    "Failed to load invoice preview:",
                    fetchError
                );
            })
            .finally(() => {
                if (
                    requestedInvoiceIdRef.current ===
                    currentRequestId
                ) {
                    requestedInvoiceIdRef.current = null;
                }
            });
    }, [
        id,
        dispatch,
        hasFullPreview,
        selectedInvoiceId,
    ]);

    /* ============================================================
       CLICK OUTSIDE CUSTOMIZE DROPDOWN
    ============================================================ */

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                customizeRef.current &&
                !customizeRef.current.contains(event.target)
            ) {
                setCustomizeOpen(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    /* ============================================================
       RESPONSIVE PREVIEW SCALE
    ============================================================ */

    useEffect(() => {
        const previewElement = previewRef.current;

        if (!previewElement) return;

        const updatePreviewScale = () => {
            const availableWidth = Math.max(
                0,
                previewElement.clientWidth - 32
            );

            setPreviewScale(
                Math.min(1, availableWidth / 950)
            );
        };

        updatePreviewScale();

        let resizeObserver;

        if (typeof ResizeObserver !== "undefined") {
            resizeObserver = new ResizeObserver(
                updatePreviewScale
            );

            resizeObserver.observe(previewElement);
        }

        window.addEventListener(
            "resize",
            updatePreviewScale
        );

        return () => {
            resizeObserver?.disconnect();

            window.removeEventListener(
                "resize",
                updatePreviewScale
            );
        };
    }, []);

    /* ============================================================
       CURRENT TEMPLATE
    ============================================================ */

    const invoiceTemplate =
        invoice?.invoiceTemplate ||
        reduxInvoiceTemplate ||
        "InvoiceTemplate1";

    const Template = invoiceTemplates.find(
        (template) => template.id === invoiceTemplate
    )?.component;

    /* ============================================================
       CHANGE TEMPLATE
    ============================================================ */

    const handleChangeTemplate = () => {
        if (!invoice) return;

        setCustomizeOpen(false);

        dispatch(
            openModal({
                type: "changeTemplate",
                data: invoice,
            })
        );
    };

    /* ============================================================
       EDIT INVOICE
    ============================================================ */

    const handleEditTemplate = () => {
        if (!invoice) return;

        setCustomizeOpen(false);

        console.log(
            "Edit invoice:",
            getInvoiceId(invoice)
        );
    };

    /* ============================================================
       RETRY FETCH
    ============================================================ */

    const handleRetry = async () => {
        const targetId = selectedInvoiceId ?? id;

        if (targetId == null) return;

        requestedInvoiceIdRef.current = String(targetId);

        try {
            await dispatch(
                fetchInvoiceById(targetId)
            ).unwrap();
        } catch (fetchError) {
            console.error(
                "Failed to reload invoice preview:",
                fetchError
            );
        } finally {
            if (
                requestedInvoiceIdRef.current ===
                String(targetId)
            ) {
                requestedInvoiceIdRef.current = null;
            }
        }
    };

    /* ============================================================
       DISPLAY HELPERS
    ============================================================ */

    const invoiceNumber =
        invoice?.invoiceNumber ||
        (
            getInvoiceId(invoice) != null
                ? `INV-${getInvoiceId(invoice)}`
                : "Invoice"
        );

    const status = String(
        invoice?.invoiceStatus ||
        invoice?.status ||
        "DRAFT"
    ).toUpperCase();

    const getStatusStyles = (value) => {
        if (
            ["PAID", "ACTIVE", "COMPLETED"].includes(value)
        ) {
            return "bg-emerald-50 text-emerald-700 ring-emerald-200";
        }

        if (
            ["OVERDUE", "CANCELLED", "REJECTED"].includes(value)
        ) {
            return "bg-rose-50 text-rose-700 ring-rose-200";
        }

        if (
            ["SENT", "PARTIAL", "PARTIALLY_PAID"].includes(value)
        ) {
            return "bg-blue-50 text-blue-700 ring-blue-200";
        }

        return "bg-amber-50 text-amber-700 ring-amber-200";
    };

    const toDisplay = (value) => {
        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return "—";
        }

        if (typeof value === "object") {
            return (
                value.addressLine1 ||
                value.address ||
                value.name ||
                "—"
            );
        }

        return String(value);
    };

    /* ============================================================
       LOADING STATE

       Use previewLoading, not the shared invoice-list loading flag.
    ============================================================ */

    if (
        selectedInvoiceId != null &&
        !hasFullPreview &&
        previewLoading
    ) {
        return (
            <div className="mt-3 flex min-h-[220px] w-full flex-col items-center justify-center rounded-md border border-gray-200 bg-white p-6 text-center">
                <div className="mb-3 rounded-full bg-blue-50 p-3">
                    <FileText className="h-7 w-7 text-blue-500" />
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                    Loading complete invoice preview...
                </div>
            </div>
        );
    }

    /* ============================================================
       INVOICE NOT FOUND / REQUEST FAILED
    ============================================================ */

    if (!invoice || !hasFullPreview) {
        const message =
            previewError ||
            error ||
            (
                id
                    ? "Unable to load this invoice. Check the invoice ID and try again."
                    : "Select an invoice to view its complete details."
            );

        return (
            <div className="mt-3 flex min-h-[220px] w-full flex-col items-center justify-center rounded-md border border-gray-200 bg-white p-6 text-center">
                <div className="mb-3 rounded-full bg-blue-50 p-3">
                    <FileText className="h-7 w-7 text-blue-500" />
                </div>

                <h3 className="text-base font-semibold text-gray-800">
                    {selectedInvoiceId != null
                        ? "Invoice Details Unavailable"
                        : "No Invoice Selected"}
                </h3>

                <p className="mt-1 max-w-sm text-sm text-gray-500">
                    {typeof message === "string"
                        ? message
                        : "Unable to load invoice details."}
                </p>

                {selectedInvoiceId != null && (
                    <button
                        type="button"
                        onClick={handleRetry}
                        disabled={previewLoading}
                        className="mt-4 inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <RefreshCw
                            size={15}
                            className={
                                previewLoading
                                    ? "animate-spin"
                                    : ""
                            }
                        />
                        {previewLoading ? "Retrying..." : "Retry"}
                    </button>
                )}
            </div>
        );
    }

    /* ============================================================
       TEMPLATE NOT FOUND
    ============================================================ */

    if (!Template) {
        return (
            <div className="mt-3 w-full rounded-md border border-gray-200 bg-white p-5">
                <p className="text-sm text-red-500">
                    Invoice template "{invoiceTemplate}" not found.
                </p>

                <button
                    type="button"
                    onClick={handleChangeTemplate}
                    className="mt-3 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                    Change Template
                </button>
            </div>
        );
    }

    /* ============================================================
       RENDER
    ============================================================ */

    const invoiceId = getInvoiceId(invoice);

    return (
        <div
            key={`${invoiceId ?? ""}-${invoiceTemplate}`}
            className="group w-full min-w-0 overflow-hidden rounded-md border border-gray-100 bg-white shadow-sm"
        >
            {/* HEADER */}

            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 sm:px-5">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex shrink-0 items-center gap-2">

                        <button
                            type="button"
                            onClick={() => {
                                const invoiceId = invoice?.id ?? invoice?.invoiceId;

                                if (invoiceId != null) {
                                    navigate(`/invoices/view/${invoiceId}`);
                                } else {
                                    navigate("/invoices");
                                }
                            }}
                            className="flex items-center justify-center rounded-md border border-gray-200 bg-white p-2 text-[#0F4659] transition hover:bg-[#0F4659]/10"
                            title="Back to invoice"
                            aria-label="Back to invoice"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-700 text-white shadow-sm"
                            onClick={() => navigate("/invoices")}
                            title="Home"
                            aria-label="Go to invoices">
                            <FileText size={24} />
                        </div>
                    </div>

                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="break-words text-lg font-semibold text-slate-800">
                                {invoiceNumber}
                            </h1>

                            <span
                                className={`rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide ring-1 ring-inset ${getStatusStyles(status)}`}
                            >
                                {status.replaceAll("_", " ")}
                            </span>
                        </div>

                        <p className="mt-1 break-words text-sm text-slate-500">
                            {invoice.customerName ||
                                invoice.customer?.name ||
                                "No customer selected"}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                            Invoice date: {toDisplay(invoice.invoiceDate)}
                            {" · "}
                            Due: {toDisplay(invoice.dueDate)}
                        </p>
                    </div>
                </div>

                {/* CUSTOMIZE DROPDOWN */}

                <div
                    ref={customizeRef}
                    className="relative shrink-0"
                >
                    <button
                        type="button"
                        onClick={() =>
                            setCustomizeOpen((previous) => !previous)
                        }
                        aria-expanded={customizeOpen}
                        className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
                    >
                        <Settings className="h-4 w-4" />
                        <span>Customize</span>
                        <ChevronDown
                            className={`h-3.5 w-3.5 transition-transform duration-200 ${customizeOpen ? "rotate-180" : ""
                                }`}
                        />
                    </button>

                    {customizeOpen && (
                        <div className="absolute right-0 top-full z-[100] mt-1 w-[min(310px,calc(100vw-32px))] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl">
                            <div className="px-4 py-3 text-sm font-semibold text-gray-500">
                                Invoice Template
                            </div>

                            <button
                                type="button"
                                onClick={handleChangeTemplate}
                                className="mx-2 flex w-[calc(100%-16px)] rounded-md bg-blue-500 px-3 py-2 text-left text-sm font-medium text-white hover:bg-blue-600"
                            >
                                Change Template
                            </button>

                            <button
                                type="button"
                                onClick={handleEditTemplate}
                                className="mx-2 mb-2 flex w-[calc(100%-16px)] rounded-md px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100"
                            >
                                Edit Invoice
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* RESPONSIVE INVOICE PREVIEW */}

            <div
                ref={previewRef}
                className="w-full min-w-0 overflow-hidden bg-gray-50 px-2 py-5 sm:px-4"
            >
                <div className="flex w-full justify-center">
                    <div
                        style={{
                            width: `${950 * previewScale}px`,
                            height: `${1123 * previewScale}px`,
                            flexShrink: 0,
                            position: "relative",
                        }}
                    >
                        <div
                            style={{
                                width: "950px",
                                transform: `scale(${previewScale})`,
                                transformOrigin: "top left",
                            }}
                        >
                            <div className="rounded-md border border-gray-200 bg-white shadow-sm">
                                <Template
                                    key={`${invoiceId ?? ""}-${invoiceTemplate}`}
                                    invoice={invoice}
                                    preview={true}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
