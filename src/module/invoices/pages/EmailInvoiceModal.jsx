
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import {
    X,
    Mail,
    Send,
    FileText,
    Loader2,
    Paperclip,
} from "lucide-react";

import toast from "react-hot-toast";

import { closeModal } from "../../ui/uiSlice";

import { sendInvoiceEmail } from "../thunks/invoiceThunks";

import {
    getInvoicePdfGenerator,
    clearInvoicePdfGenerator,
} from "../utils/invoicePdfGenerator";


export default function EmailInvoiceModal({ data }) {

    const dispatch = useDispatch();

    /* =====================================================
       MODAL DATA
    ===================================================== */

    const invoice = data?.invoice || {};

    const invoiceId =
        invoice?.id ??
        invoice?.invoiceId ??
        null;

    const customer = invoice?.customer || {};

    const invoiceNumber =
        invoice?.invoiceNumber ||
        invoice?.invoiceNo ||
        (invoiceId ? `INV-${invoiceId}` : "Invoice");

    const invoiceStatus = String(invoice?.status || "DRAFT").toUpperCase();

    const isDraft = invoiceStatus === "DRAFT";

    const canSendEmail = !isDraft;

    const customerName =
        customer?.displayName ||
        customer?.companyName ||
        invoice?.customerName ||
        invoice?.partyName ||
        "Customer";

    const customerEmail =
        customer?.email ||
        invoice?.customerEmail ||
        invoice?.email ||
        "";


    /* =====================================================
       LOCAL STATE
    ===================================================== */

    const [toEmail, setToEmail] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");

    const [loading, setLoading] = useState(false);


    /* =====================================================
       INITIALIZE FORM
    ===================================================== */

    useEffect(() => {

        if (!invoiceId) return;

        setToEmail(customerEmail);

        setSubject(`Invoice ${invoiceNumber}`);

        setMessage(
            `Dear ${customerName},

Please find attached your invoice ${invoiceNumber}.

Thank you for your business.`
        );

    }, [
        invoiceId,
        customerEmail,
        invoiceNumber,
        customerName,
    ]);


    /* =====================================================
       CLOSE MODAL
    ===================================================== */

    const handleClose = () => {

        if (loading) return;

        clearInvoicePdfGenerator();

        dispatch(closeModal());

    };


    /* =====================================================
       CLEANUP
    ===================================================== */

    useEffect(() => {

        return () => {
            clearInvoicePdfGenerator();
        };

    }, []);


    /* =====================================================
       EMAIL VALIDATION
    ===================================================== */

    const validateEmail = (email) => {

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        return emailRegex.test(email);

    };


    /* =====================================================
       SEND EMAIL
    ===================================================== */

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (loading) return;

        if (!invoiceId) {

            toast.error("Invoice information is missing.");

            return;
        }
        if (isDraft) {
            toast.error("Draft invoices cannot be emailed. Please approve the invoice first.");
            return;
        }
        const recipientEmail = toEmail.trim();

        if (!recipientEmail) {

            toast.error(
                "Please enter recipient email address."
            );

            return;
        }

        if (!validateEmail(recipientEmail)) {

            toast.error(
                "Please enter a valid email address."
            );

            return;
        }

        if (!subject.trim()) {

            toast.error(
                "Please enter email subject."
            );

            return;
        }

        try {

            setLoading(true);


            /* =============================================
               GET REGISTERED PDF GENERATOR
            ============================================= */

            const generatePdf =
                getInvoicePdfGenerator();

            if (typeof generatePdf !== "function") {

                throw new Error(
                    "Invoice PDF generator is unavailable. Please close and reopen the email window."
                );

            }


            /* =============================================
               GENERATE PDF
            ============================================= */

            const pdfBlob = await generatePdf();

            if (
                !(pdfBlob instanceof Blob) ||
                pdfBlob.size === 0
            ) {

                throw new Error(
                    "Unable to generate invoice PDF."
                );

            }


            /* =============================================
               SAFE FILE NAME
            ============================================= */

            const safeInvoiceNumber = String(
                invoiceNumber
            ).replace(/[^a-zA-Z0-9_-]/g, "_");

            const fileName =
                `${safeInvoiceNumber}.pdf`;


            /* =============================================
               PREPARE MULTIPART REQUEST
            ============================================= */

            const formData = new FormData();

            formData.append(
                "toEmail",
                recipientEmail
            );

            formData.append(
                "subject",
                subject.trim()
            );

            formData.append(
                "message",
                message.trim()
            );

            formData.append(
                "file",
                pdfBlob,
                fileName
            );


            /* =============================================
               SEND EMAIL THROUGH REDUX
            ============================================= */

            const response = await dispatch(
                sendInvoiceEmail({
                    id: invoiceId,
                    formData,
                })
            ).unwrap();


            /* =============================================
               SUCCESS
            ============================================= */

            toast.success(
                response?.message ||
                "Invoice email sent successfully!"
            );

            clearInvoicePdfGenerator();

            dispatch(closeModal());


        } catch (error) {

            console.error(
                "Invoice email error:",
                error
            );

            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    "Failed to send invoice email."
            );

        } finally {

            setLoading(false);

        }

    };


    /* =====================================================
       UI
    ===================================================== */

    return (

        <div className="w-full bg-white rounded-xl flex flex-col overflow-hidden">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-200">

                <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">

                        <Mail className="w-5 h-5 text-blue-600" />

                    </div>

                    <div>

                        <h2 className="text-lg font-semibold text-gray-800">
                            Email Invoice
                        </h2>

                        <p className="text-xs text-gray-500 mt-0.5">
                            Send invoice directly to your customer
                        </p>

                    </div>

                </div>




            </div>


            {/* =================================================
                BODY
            ================================================= */}

            <form
                onSubmit={handleSubmit}
                className="flex flex-col min-h-0"
            >

                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">


                    {/* =========================================
                        INVOICE INFORMATION
                    ========================================= */}

                    <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-4">

                        <div className="flex items-center gap-2 mb-3">

                            <FileText className="w-4 h-4 text-blue-600" />

                            <h3 className="text-sm font-semibold text-gray-700">
                                Invoice Details
                            </h3>

                        </div>


                        <div className="grid grid-cols-2 gap-4">

                            <div className="grid grid-cols-2 gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">

                                <div>
                                    <p className="text-xs text-gray-500">Invoice Number</p>
                                    <p className="mt-1 text-sm font-semibold text-gray-800">
                                        {invoiceNumber}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500">Invoice Status</p>

                                    <span
                                        className={`mt-1 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${isDraft
                                            ? "bg-yellow-100 text-yellow-700"
                                            : invoiceStatus === "APPROVED"
                                                ? "bg-green-100 text-green-700"
                                                : invoiceStatus === "SENT"
                                                    ? "bg-blue-100 text-blue-700"
                                                    : "bg-gray-100 text-gray-700"
                                            }`}
                                    >
                                        {invoiceStatus.replaceAll("_", " ")}
                                    </span>
                                </div>

                            </div>

                            {isDraft && (
                                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                                    <p className="text-sm font-medium text-amber-800">
                                        This invoice is still in Draft status.
                                    </p>

                                    <p className="mt-1 text-xs text-amber-700">
                                        Approve the invoice before sending it by email.
                                    </p>
                                </div>
                            )}


                            <div>

                                <p className="text-xs text-gray-500">
                                    Customer
                                </p>

                                <p className="text-sm font-medium text-gray-800 mt-1">
                                    {customerName}
                                </p>

                            </div>


                            <div>

                                <p className="text-xs text-gray-500">
                                    Invoice Date
                                </p>

                                <p className="text-sm font-medium text-gray-800 mt-1">
                                    {invoice?.invoiceDate || "—"}
                                </p>

                            </div>


                            <div>

                                <p className="text-xs text-gray-500">
                                    Due Date
                                </p>

                                <p className="text-sm font-medium text-gray-800 mt-1">
                                    {invoice?.dueDate || "—"}
                                </p>

                            </div>

                        </div>

                    </div>


                    {/* =========================================
                        RECIPIENT
                    ========================================= */}

                    <div className="space-y-2">

                        <label className="text-sm font-medium text-gray-700">

                            Recipient Email

                            <span className="text-red-500 ml-1">
                                *
                            </span>

                        </label>


                        <div className="relative">

                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                            <input
                                type="email"
                                value={toEmail}
                                onChange={(e) =>
                                    setToEmail(e.target.value)
                                }
                                placeholder="customer@example.com"
                                disabled={loading}
                                required
                                className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                            />

                        </div>

                    </div>


                    {/* =========================================
                        SUBJECT
                    ========================================= */}

                    <div className="space-y-2">

                        <label className="text-sm font-medium text-gray-700">

                            Subject

                            <span className="text-red-500 ml-1">
                                *
                            </span>

                        </label>

                        <input
                            type="text"
                            value={subject}
                            onChange={(e) =>
                                setSubject(e.target.value)
                            }
                            placeholder="Invoice subject"
                            disabled={loading}
                            required
                            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                        />

                    </div>


                    {/* =========================================
                        MESSAGE
                    ========================================= */}

                    <div className="space-y-2">

                        <label className="text-sm font-medium text-gray-700">
                            Message
                        </label>

                        <textarea
                            rows={6}
                            value={message}
                            onChange={(e) =>
                                setMessage(e.target.value)
                            }
                            placeholder="Enter your email message..."
                            disabled={loading}
                            className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm outline-none resize-y focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                        />

                    </div>


                    {/* =========================================
                        ATTACHMENT
                    ========================================= */}

                    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">

                        <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">

                            <Paperclip className="w-4 h-4 text-red-500" />

                        </div>


                        <div className="flex-1 min-w-0">

                            <p className="text-sm font-medium text-gray-700">
                                {invoiceNumber}.pdf
                            </p>

                            <p className="text-xs text-gray-500">
                                The currently selected invoice template will be attached automatically.
                            </p>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    FOOTER
                ================================================= */}

                <div className="shrink-0 flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-white">

                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={loading}
                        className="px-5 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>


                    <button
                        type="submit"
                        disabled={loading || !canSendEmail}
                        className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition ${loading || !canSendEmail
                            ? "cursor-not-allowed bg-gray-400"
                            : "bg-blue-600 hover:bg-blue-700"
                            }`}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <Send className="h-4 w-4" />
                                Send Email
                            </>
                        )}
                    </button>

                </div>

            </form>

        </div>

    );

}
