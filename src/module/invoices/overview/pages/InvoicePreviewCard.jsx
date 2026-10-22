
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
    ArrowLeft,
    Building2,
    UserRound,
    CalendarDays,
    Landmark,
    Coins,
    ReceiptText,
    Signature,
    ExternalLink,
} from "lucide-react";

import { openModal } from "../../../ui/uiSlice";
import { fetchInvoiceById } from "../../thunks/invoiceThunks";
import invoiceTemplates from "../template/templateRegistry";
import { normalizeInvoice } from "../template/invoiceTemplateUtils";

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
    } = useSelector((state) => state.invoice || {});


    const getInvoiceId = (item) =>
        item?.id ?? item?.invoiceId ?? null;

    const sameId = (first, second) =>
        first != null &&
        second != null &&
        String(first) === String(second);

    /* ============================================================
       URL INVOICE ID
    ============================================================ */

    const targetInvoiceId = id ?? null;

    /* ============================================================
       VALIDATE COMPLETE PREVIEW
    ============================================================ */

    const hasFullPreview =
        previewInvoice != null &&
        sameId(getInvoiceId(previewInvoice), targetInvoiceId) &&
        (
            previewInvoiceId == null ||
            sameId(previewInvoiceId, targetInvoiceId)
        );

    /* ============================================================
       SELECT INVOICE
    ============================================================ */

    const invoice = useMemo(() => {
        if (!targetInvoiceId) {
            return null;
        }

        if (
            previewInvoice &&
            sameId(
                previewInvoice.id ?? previewInvoice.invoiceId,
                targetInvoiceId
            ) &&
            (
                previewInvoiceId == null ||
                sameId(previewInvoiceId, targetInvoiceId)
            )
        ) {
            return previewInvoice;
        }

        const candidates = [
            exsistingInvoice,
            selectedInvoice,
            currentInvoice,
            ...(Array.isArray(invoices) ? invoices : []),
        ];

        return (
            candidates.find((item) =>
                sameId(
                    item?.id ?? item?.invoiceId,
                    targetInvoiceId
                )
            ) || null
        );
    }, [
        targetInvoiceId,
        previewInvoice,
        previewInvoiceId,
        exsistingInvoice,
        selectedInvoice,
        currentInvoice,
        invoices,
    ]);

    /* ============================================================
   SHARED NORMALIZED INVOICE DATA
============================================================ */

    const sharedInvoice = useMemo(
        () => (invoice ? normalizeInvoice(invoice) : null),
        [invoice]
    );

    /* ============================================================
       FETCH COMPLETE INVOICE
    ============================================================ */

    useEffect(() => {
        if (!targetInvoiceId) {
            requestedInvoiceIdRef.current = null;
            return;
        }

        if (hasFullPreview) {
            requestedInvoiceIdRef.current = null;
            return;
        }

        const requestId = String(targetInvoiceId);

        if (requestedInvoiceIdRef.current === requestId) {
            return;
        }

        requestedInvoiceIdRef.current = requestId;

        dispatch(fetchInvoiceById(targetInvoiceId))
            .unwrap()
            .catch((fetchError) => {
                console.error(
                    "Failed to load invoice preview:",
                    fetchError
                );
            })
            .finally(() => {
                if (
                    requestedInvoiceIdRef.current === requestId
                ) {
                    requestedInvoiceIdRef.current = null;
                }
            });
    }, [
        dispatch,
        targetInvoiceId,
        hasFullPreview,
    ]);

    /* ============================================================
       CLOSE CUSTOMIZE DROPDOWN ON OUTSIDE CLICK
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
        const element = previewRef.current;

        if (!element) {
            return;
        }

        const updatePreviewScale = () => {
            const availableWidth = Math.max(
                0,
                element.clientWidth - 32
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

            resizeObserver.observe(element);
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
        if (!invoice) {
            return;
        }

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
        if (!invoice) {
            return;
        }

        setCustomizeOpen(false);

        const invoiceId = getInvoiceId(invoice);

        const invoiceType = String(
            invoice.invoiceType || ""
        ).toUpperCase();

        if (invoiceId == null) {
            return;
        }

        const editRoute =
            invoiceType === "SERVICE_INVOICE"
                ? `/invoices/service/edit/${invoiceId}`
                : `/invoices/product/edit/${invoiceId}`;

        navigate(editRoute, {
            state: {
                invoiceType,
                invoice,
            },
        });
    };

    /* ============================================================
       OPEN PREVIEW IN NEW TAB
    ============================================================ */

    const handleOpenPreviewInNewTab = () => {
        const invoiceId = getInvoiceId(invoice);

        if (invoiceId == null) {
            return;
        }

        const previewUrl =
            `${window.location.origin}/invoices/preview/${invoiceId}`;

        window.open(
            previewUrl,
            "_blank",
            "noopener,noreferrer"
        );
    };

    /* ============================================================
       RETRY FETCH
    ============================================================ */

    const handleRetry = async () => {
        if (!targetInvoiceId || previewLoading) {
            return;
        }

        requestedInvoiceIdRef.current =
            String(targetInvoiceId);

        try {
            await dispatch(
                fetchInvoiceById(targetInvoiceId)
            ).unwrap();
        } catch (fetchError) {
            console.error(
                "Failed to reload invoice preview:",
                fetchError
            );
        } finally {
            if (
                requestedInvoiceIdRef.current ===
                String(targetInvoiceId)
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

    const invoiceType = String(
        invoice?.invoiceType || "INVOICE"
    ).replaceAll("_", " ");

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

    const formatAmount = (value) => {
        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return "—";
        }

        const amount = Number(value);

        if (!Number.isFinite(amount)) {
            return String(value);
        }

        return amount.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    const currencyCode =
        invoice?.currencyCode ||
        invoice?.currency?.currencyCode ||
        "";

    const currencyName =
        invoice?.currencyName ||
        invoice?.currency?.currencyName ||
        "";

    const formatCurrency = (value) => {
        const amount = formatAmount(value);

        return currencyCode
            ? `${currencyCode} ${amount}`
            : amount;
    };

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

    /* ============================================================
       COMPANY DETAILS
    ============================================================ */

    const companyName =
        invoice?.companyName ||
        invoice?.company?.companyName ||
        "—";

    const companyCode =
        invoice?.companyCode ||
        invoice?.company?.companyCode ||
        "";

    const logoUrl =
        invoice?.logo ||
        invoice?.companyLogo ||
        invoice?.company?.logo ||
        "";

    /* ============================================================
       CUSTOMER AND SALESPERSON
    ============================================================ */

    const customerName =
        invoice?.customerName ||
        invoice?.customer?.name ||
        invoice?.partyName ||
        invoice?.party?.name ||
        "No customer selected";

    const salesPersonName =
        invoice?.salesPersonName ||
        invoice?.salesPerson?.name ||
        "";

    /* ============================================================
       BANK DETAILS
    ============================================================ */

    const bankName =
        invoice?.bankName ||
        invoice?.bankAccount?.bankName ||
        "";

    const accountNumber =
        invoice?.accountNumber ||
        invoice?.bankAccount?.accountNumber ||
        "";

    const ifsc =
        invoice?.ifsc ||
        invoice?.bankAccount?.ifsc ||
        "";

    /* ============================================================
       SIGNATURE DETAILS
    ============================================================ */

    const signatureName =
        invoice?.signatureName ||
        invoice?.emailSignature?.signatureName ||
        "";

    const signatureContent =
        invoice?.signatureContent ||
        invoice?.emailSignature?.signatureContent ||
        "";

    /* ============================================================
       INVOICE ITEMS
    ============================================================ */

    const invoiceItems = Array.isArray(invoice?.invoiceItems)
        ? invoice.invoiceItems
        : [];

    /* ============================================================
       LOADING STATE
    ============================================================ */

    if (!targetInvoiceId) {
        return (
            <div className="mt-3 rounded-md border border-gray-200 bg-white p-6 text-center">
                <FileText className="mx-auto mb-3 h-7 w-7 text-blue-500" />

                <p className="text-sm text-gray-500">
                    Open an invoice to view its preview.
                </p>

                <button
                    type="button"
                    onClick={() => navigate("/invoices")}
                    className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                    View Invoices
                </button>
            </div>
        );
    }

    if (previewLoading && !hasFullPreview) {
        return (
            <div className="mt-3 flex min-h-[220px] flex-col items-center justify-center rounded-md border border-gray-200 bg-white p-6 text-center">
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
       ERROR / MISSING FULL INVOICE
    ============================================================ */

    if (!hasFullPreview) {
        const message =
            previewError ||
            error ||
            "Unable to load this invoice. Please try again.";

        return (
            <div className="mt-3 flex min-h-[220px] flex-col items-center justify-center rounded-md border border-gray-200 bg-white p-6 text-center">
                <div className="mb-3 rounded-full bg-blue-50 p-3">
                    <FileText className="h-7 w-7 text-blue-500" />
                </div>

                <h3 className="text-base font-semibold text-gray-800">
                    Invoice Details Unavailable
                </h3>

                <p className="mt-1 max-w-sm text-sm text-gray-500">
                    {typeof message === "string"
                        ? message
                        : message?.message ||
                        "Unable to load invoice details."}
                </p>

                <button
                    type="button"
                    onClick={handleRetry}
                    disabled={previewLoading}
                    className="mt-4 inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <RefreshCw
                        size={15}
                        className={
                            previewLoading ? "animate-spin" : ""
                        }
                    />

                    {previewLoading ? "Loading..." : "Retry"}
                </button>
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
            key={`${invoiceId}-${invoiceTemplate}`}
            className="group w-full min-w-0 overflow-hidden rounded-md border border-gray-100 bg-white shadow-sm"
        >
            {/* COMMON HEADER */}

            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 sm:px-5">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex shrink-0 items-center gap-2">
                        <button
                            type="button"
                            onClick={() =>
                                navigate(`/invoices/view/${invoiceId}`)
                            }
                            className="flex items-center justify-center rounded-md border border-gray-200 bg-white p-2 text-[#0F4659] transition hover:bg-[#0F4659]/10"
                            title="Back to invoice"
                            aria-label="Back to invoice"
                        >
                            <ArrowLeft size={24} />
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate("/invoices")}
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-700 text-white shadow-sm"
                            title="View invoices"
                            aria-label="Go to invoices"
                        >
                            <FileText size={24} />
                        </button>
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
                            {customerName}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                            {toDisplay(invoice.invoiceDate)}
                            {" · Due: "}
                            {toDisplay(invoice.dueDate)}
                        </p>
                    </div>
                </div>

                {/* HEADER ACTIONS */}

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={handleOpenPreviewInNewTab}
                        className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                        title="Open preview in a new tab"
                    >
                        <ExternalLink size={15} />
                        <span>New Tab</span>
                    </button>

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
            </div>

            {/* COMMON INVOICE DETAILS */}

            {/* RESPONSIVE TEMPLATE PREVIEW */}

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
                                    key={`${invoiceId}-${invoiceTemplate}`}
                                    invoice={sharedInvoice}
                                    preview
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
