import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

import "./Invoice.css";

import {
    fetchInvoices,
    fetchInvoiceById,
    removeInvoice,
    setExsistingInvoice,
    resetExsistingInvoice,
} from "../../slices/InvoiceSlice";

import {
    loadCustomers,
} from "../../customer/thunks/customerThunks";

import {
    fetchAllProducts,
} from "../../items/thunks/productThunks";

import {
    fetchAllUnits,
} from "../../units/thunks/unitThunks";

import {
    fetchAllSizes,
} from "../../sizes/thunks/sizeThunks";

import {
    fetchAllTaxMasters,
} from "../../taxMaster/thunks/taxMasterThunks";

import InvoiceCreate from "./InvoiceCreate";

import {
    generateInvoicePdf,
} from "./InvoicePdf";

const EMPTY_ARRAY = [];
const EMPTY_OBJECT = {};

/* =========================================================
   CUSTOMER ADDRESS
========================================================= */

const getCustomerBillingAddress = (customer) => {
    return (
        customer?.billingAddress ||
        customer?.shippingAddress ||
        null
    );
};

const formatCustomerAddress = (address) => {
    if (!address) {
        return "";
    }

    const parts = [
        address.attention,
        address.address,
        address.city,
        address.state,
        address.country,
        address.zipCode,
    ].filter(
        (part) =>
            part !== null &&
            part !== undefined &&
            String(part).trim() !== ""
    );

    return parts.join(", ");
};

/* =========================================================
   CUSTOMER DISPLAY NAME
========================================================= */

const getCustomerDisplayName = (customer) => {
    if (!customer) {
        return "";
    }

    return (
        customer.displayName ||
        customer.companyName ||
        [
            customer.salutation,
            customer.firstName,
            customer.lastName,
        ]
            .filter(Boolean)
            .join(" ")
            .trim()
    );
};

/* =========================================================
   TAX BREAKDOWN
========================================================= */

const getItemTaxBreakdown = (
    item,
    taxMasters = []
) => {
    const quantity =
        Number(item?.quantity) || 0;

    const unitPrice =
        Number(item?.unitPrice) || 0;

    const discountAmount =
        Number(item?.discountAmount) || 0;

    const grossAmount =
        quantity * unitPrice;

    const taxableAmount = Math.max(
        grossAmount - discountAmount,
        0
    );

    const taxMaster =
        item?.taxMaster ||
        taxMasters.find(
            (tax) =>
                String(tax?.id) ===
                String(item?.taxMasterId)
        );

    const taxType = (
        item?.taxType ||
        taxMaster?.taxType ||
        ""
    ).toUpperCase();

    const explicitTaxRate =
        item?.taxRate != null
            ? Number(item.taxRate) || 0
            : Number(taxMaster?.taxRate) || 0;

    const hasExplicitTax =
        item?.taxAmount != null ||
        item?.cgstAmount != null ||
        item?.sgstAmount != null ||
        item?.igstAmount != null;

    let taxAmount = 0;
    let totalAmount = taxableAmount;

    if (hasExplicitTax) {
        taxAmount =
            item?.taxAmount != null
                ? Number(item.taxAmount) || 0
                : (Number(item?.cgstAmount) || 0) +
                (Number(item?.sgstAmount) || 0) +
                (Number(item?.igstAmount) || 0);

        totalAmount =
            item?.totalAmount != null
                ? Number(item.totalAmount) || 0
                : taxableAmount + taxAmount;
    } else if (
        item?.totalAmount != null
    ) {
        totalAmount =
            Number(item.totalAmount) || 0;

        taxAmount = Math.max(
            totalAmount - taxableAmount,
            0
        );
    } else {
        taxAmount =
            (taxableAmount *
                explicitTaxRate) /
            100;

        totalAmount =
            taxableAmount + taxAmount;
    }

    const taxRate =
        explicitTaxRate > 0
            ? explicitTaxRate
            : taxableAmount > 0
                ? (taxAmount /
                    taxableAmount) *
                100
                : 0;

    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;

    if (taxType === "IGST") {
        igstAmount =
            item?.igstAmount != null
                ? Number(item.igstAmount) || 0
                : taxAmount;
    } else {
        cgstAmount =
            item?.cgstAmount != null
                ? Number(item.cgstAmount) || 0
                : taxAmount / 2;

        sgstAmount =
            item?.sgstAmount != null
                ? Number(item.sgstAmount) || 0
                : taxAmount / 2;
    }

    return {
        grossAmount,
        taxableAmount,
        taxAmount,
        taxRate,
        taxType,
        totalAmount,
        cgstAmount,
        sgstAmount,
        igstAmount,
    };
};

/* =========================================================
   COMPONENT
========================================================= */

export const Invoice = () => {
    const dispatch = useDispatch();

    const [showModal, setShowModal] =
        useState(false);

    const [viewInvoice, setViewInvoice] =
        useState(null);

    const [showViewModal, setShowViewModal] =
        useState(false);

    const [viewLoading, setViewLoading] =
        useState(false);

    const [pdfLoading, setPdfLoading] =
        useState(false);

    const [searchTerm, setSearchTerm] =
        useState("");

    const [invoiceTypeFilter, setInvoiceTypeFilter] =
        useState("");

    const [currentPage, setCurrentPage] =
        useState(1);

    const recordsPerPage = 10;

    /* =========================================================
       REDUX
    ========================================================= */

    const customers = useSelector(
        (state) =>
            state.customers?.customers ??
            EMPTY_ARRAY
    );

    const products = useSelector(
        (state) =>
            state.product?.products ??
            EMPTY_ARRAY
    );

    const units = useSelector(
        (state) =>
            state.unit?.units ??
            EMPTY_ARRAY
    );

    const sizes = useSelector(
        (state) =>
            state.size?.sizes ??
            EMPTY_ARRAY
    );

    const taxMasters = useSelector(
        (state) =>
            state.taxMaster?.taxes ??
            state.taxInfo?.taxes ??
            EMPTY_ARRAY
    );

    const invoiceState = useSelector(
        (state) =>
            state.invoice ??
            EMPTY_OBJECT
    );

    const {
        invoices = EMPTY_ARRAY,
        exsistingInvoice = null,
        loading = false,
        totalElements = 0,
    } = invoiceState;

    /* =========================================================
       INITIAL MASTER DATA
    ========================================================= */

    useEffect(() => {
        dispatch(loadCustomers());
        dispatch(fetchAllProducts());
        dispatch(fetchAllUnits());
        dispatch(fetchAllSizes());
        dispatch(fetchAllTaxMasters());
    }, [dispatch]);

    /* =========================================================
       FETCH INVOICES
    ========================================================= */

    useEffect(() => {
        dispatch(
            fetchInvoices({
                searchParams: {
                    page:
                        currentPage - 1,
                    size:
                        recordsPerPage,
                },
            })
        );
    }, [
        dispatch,
        currentPage,
    ]);

    /* =========================================================
       INVOICE LIST
    ========================================================= */

    const invoiceList = Array.isArray(
        invoices
    )
        ? invoices
        : EMPTY_ARRAY;

    const sortedData = useMemo(
        () =>
            [...invoiceList].sort(
                (a, b) =>
                    Number(b?.id || 0) -
                    Number(a?.id || 0)
            ),
        [invoiceList]
    );

    /* =========================================================
       FILTER
    ========================================================= */

    const filteredData = useMemo(() => {
        const term =
            searchTerm
                .toLowerCase()
                .trim();

        return sortedData.filter(
            (item) => {
                const invoiceNumber =
                    String(
                        item?.invoiceNumber ||
                        ""
                    ).toLowerCase();

                const customerName =
                    String(
                        item?.customerName ||
                        item?.customer?.displayName ||
                        ""
                    ).toLowerCase();

                const invoiceType =
                    String(
                        item?.invoiceType ||
                        ""
                    ).toUpperCase();

                const matchSearch =
                    !term ||
                    invoiceNumber.includes(
                        term
                    ) ||
                    customerName.includes(
                        term
                    );

                const matchInvoiceType =
                    !invoiceTypeFilter ||
                    invoiceType ===
                    invoiceTypeFilter;

                return (
                    matchSearch &&
                    matchInvoiceType
                );
            }
        );
    }, [
        sortedData,
        searchTerm,
        invoiceTypeFilter,
    ]);

    /* =========================================================
       PAGINATION
    ========================================================= */

    const totalRecords =
        Number(totalElements) > 0
            ? Number(totalElements)
            : filteredData.length;

    const totalPages =
        Math.ceil(
            totalRecords /
            recordsPerPage
        ) || 1;

    const safeCurrentPage =
        Math.min(
            Math.max(
                currentPage,
                1
            ),
            totalPages
        );

    const startIndex =
        (safeCurrentPage - 1) *
        recordsPerPage;

    const endIndex =
        startIndex +
        recordsPerPage;

    const paginatedData =
        filteredData.slice(
            startIndex,
            endIndex
        );

    useEffect(() => {
        if (
            currentPage >
            totalPages
        ) {
            setCurrentPage(
                totalPages
            );
        }
    }, [
        currentPage,
        totalPages,
    ]);

    const goToPage = (page) => {
        if (
            page < 1 ||
            page > totalPages
        ) {
            return;
        }

        setCurrentPage(page);
    };

    /* =========================================================
       REFRESH
    ========================================================= */

    const refreshList = () => {
        dispatch(
            fetchInvoices({
                searchParams: {
                    page:
                        currentPage - 1,
                    size:
                        recordsPerPage,
                },
            })
        );
    };

    /* =========================================================
       ADD
    ========================================================= */

    const handleAddInvoice = () => {
        dispatch(
            setExsistingInvoice(null)
        );

        setShowModal(true);
    };

    /* =========================================================
       CLOSE
    ========================================================= */

    const closeModal = () => {
        setShowModal(false);

        dispatch(
            resetExsistingInvoice()
        );
    };

    /* =========================================================
       EDIT
    ========================================================= */

    const handleUpdate = (
        invoiceItem
    ) => {
        dispatch(
            setExsistingInvoice(
                invoiceItem
            )
        );

        setShowModal(true);
    };

    /* =========================================================
       DELETE
    ========================================================= */

    const handleDelete = async (
        id
    ) => {
        if (
            !window.confirm(
                "Delete this invoice?"
            )
        ) {
            return;
        }

        try {
            await dispatch(
                removeInvoice(id)
            ).unwrap();

            refreshList();

            toast.success(
                "Invoice deleted successfully"
            );
        } catch (error) {
            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    "Failed to delete invoice"
            );
        }
    };

    /* =========================================================
       VIEW
    ========================================================= */

    const handleView = async (
        invoice
    ) => {
        try {
            setViewLoading(true);

            const response =
                await dispatch(
                    fetchInvoiceById(
                        invoice.id
                    )
                ).unwrap();

            setViewInvoice(response);
            setShowViewModal(true);
        } catch (error) {
            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    "Failed to load invoice"
            );
        } finally {
            setViewLoading(false);
        }
    };

    /* =========================================================
       PDF
    ========================================================= */

    const handleDownloadPdf = async (
        invoice
    ) => {
        setPdfLoading(true);

        try {
            const customer =
                customers.find(
                    (item) =>
                        String(
                            item?.id
                        ) ===
                        String(
                            invoice?.customerId
                        )
                );

            await generateInvoicePdf(
                invoice,
                {
                    dispatch,
                    customers,
                    customer,
                    taxMasters,
                    getCustomerBillingAddress,
                    formatCustomerAddress,
                }
            );
        } catch (error) {
            console.error(
                "Invoice PDF error:",
                error
            );

            toast.error(
                error?.message ||
                "Failed to generate invoice PDF"
            );
        } finally {
            setPdfLoading(false);
        }
    };

    /* =========================================================
       VIEW TOTALS
    ========================================================= */

    const viewTotals = useMemo(() => {
        const list =
            viewInvoice?.invoiceItems ||
            [];

        return list.reduce(
            (acc, item) => {
                const breakdown =
                    getItemTaxBreakdown(
                        item,
                        taxMasters
                    );

                acc.subtotal +=
                    Number(
                        breakdown.grossAmount
                    ) || 0;

                acc.discount +=
                    Number(
                        item?.discountAmount
                    ) || 0;

                acc.tax +=
                    Number(
                        breakdown.taxAmount
                    ) || 0;

                acc.cgst +=
                    Number(
                        breakdown.cgstAmount
                    ) || 0;

                acc.sgst +=
                    Number(
                        breakdown.sgstAmount
                    ) || 0;

                acc.igst +=
                    Number(
                        breakdown.igstAmount
                    ) || 0;

                return acc;
            },
            {
                subtotal: 0,
                discount: 0,
                tax: 0,
                cgst: 0,
                sgst: 0,
                igst: 0,
            }
        );
    }, [
        viewInvoice,
        taxMasters,
    ]);

    /* =========================================================
       STATS
    ========================================================= */

    const invoiceStats = useMemo(
        () =>
            filteredData.reduce(
                (acc, item) => {
                    const status =
                        item?.status ||
                        "DRAFT";

                    acc.totalInvoices +=
                        1;

                    acc.totalAmount +=
                        Number(
                            item?.grandTotal
                        ) || 0;

                    if (
                        status ===
                        "DRAFT"
                    ) {
                        acc.draftInvoices +=
                            1;
                    }

                    if (
                        status ===
                        "PAID"
                    ) {
                        acc.paidInvoices +=
                            1;
                    }

                    return acc;
                },
                {
                    totalInvoices: 0,
                    totalAmount: 0,
                    draftInvoices: 0,
                    paidInvoices: 0,
                }
            ),
        [filteredData]
    );

    /* =========================================================
       RENDER
    ========================================================= */

    return (
        <>
            {/* =====================================================
                HEADER
            ===================================================== */}

            <div className="wrapper_header">
                <div className="mb-3">
                    <h5 className="header_title">
                        Invoice Management
                    </h5>

                    <p className="header_text">
                        Manage all invoices and
                        their billing details.
                    </p>
                </div>
            </div>

            {/* =====================================================
                STATS
            ===================================================== */}

            <div
                className="invoice-stats-row mt-3"
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "16px",
                    marginBottom: "16px",
                }}
            >
                {[
                    {
                        label: "Total Invoices",
                        value:
                            invoiceStats.totalInvoices,
                        color: "#0ea5e9",
                        icon:
                            "bi-receipt-cutoff",
                    },
                    {
                        label: "Total Amount",
                        value: `₹${invoiceStats.totalAmount.toFixed(
                            2
                        )}`,
                        color: "#16a34a",
                        icon:
                            "bi-currency-rupee",
                    },
                    {
                        label: "Draft Invoices",
                        value:
                            invoiceStats.draftInvoices,
                        color: "#d97706",
                        icon:
                            "bi-pencil-square",
                    },
                    {
                        label: "Paid Invoices",
                        value:
                            invoiceStats.paidInvoices,
                        color: "#7c3aed",
                        icon:
                            "bi-check-circle",
                    },
                ].map((stat) => (
                    <div
                        key={stat.label}
                        style={{
                            display: "flex",
                            alignItems:
                                "center",
                            gap: "12px",
                            background:
                                "#fff",
                            border:
                                "1px solid #e5e7eb",
                            borderRadius:
                                "10px",
                            padding:
                                "14px 16px",
                        }}
                    >
                        <div
                            style={{
                                flexShrink: 0,
                                width: "40px",
                                height: "40px",
                                borderRadius:
                                    "10px",
                                background:
                                    `${stat.color}1f`,
                                display:
                                    "flex",
                                alignItems:
                                    "center",
                                justifyContent:
                                    "center",
                            }}
                        >
                            <i
                                className={`bi ${stat.icon}`}
                                style={{
                                    color:
                                        stat.color,
                                    fontSize:
                                        "18px",
                                }}
                            />
                        </div>

                        <div>
                            <div
                                style={{
                                    color:
                                        "#6b7280",
                                    fontWeight: 600,
                                    fontSize:
                                        "11px",
                                    letterSpacing:
                                        "0.04em",
                                    textTransform:
                                        "uppercase",
                                    marginBottom:
                                        "4px",
                                }}
                            >
                                {stat.label}
                            </div>

                            <div
                                style={{
                                    fontSize:
                                        "20px",
                                    fontWeight: 700,
                                    color:
                                        "#111827",
                                }}
                            >
                                {stat.value}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* =====================================================
                FILTERS
            ===================================================== */}

            <div className="filter-wrapper d-flex gap-2 align-items-center mb-3 flex-wrap">
                <div className="filter-header">
                    <i className="bi bi-funnel-fill" />
                    &nbsp;Filters :
                </div>

                <div className="search-item">
                    <div className="search-box">
                        <input
                            className="search-input"
                            placeholder="Search by invoice number or customer..."
                            type="text"
                            value={
                                searchTerm
                            }
                            onChange={(e) =>
                                setSearchTerm(
                                    e.target.value
                                )
                            }
                        />

                        <i className="bi bi-search search-icon" />
                    </div>
                </div>

                <div
                    style={{
                        width: "200px",
                    }}
                >
                    <select
                        className="form-select"
                        value={
                            invoiceTypeFilter
                        }
                        onChange={(e) =>
                            setInvoiceTypeFilter(
                                e.target.value
                            )
                        }
                    >
                        <option value="">
                            Select Type
                        </option>

                        <option value="SALE_INVOICE">
                            Sale Invoice
                        </option>

                        <option value="PURCHASE_INVOICE">
                            Purchase Invoice
                        </option>

                        <option value="STOCK_TRANSFER">
                            Stock Transfer
                        </option>

                        <option value="CREDIT_NOTE">
                            Credit Note
                        </option>

                        <option value="DEBIT_NOTE">
                            Debit Note
                        </option>
                    </select>
                </div>

                <button
                    className="btn main-btn"
                    onClick={
                        handleAddInvoice
                    }
                >
                    <i className="bi bi-plus" />
                    &nbsp; Add Invoice
                </button>
            </div>

            {/* =====================================================
                TABLE
            ===================================================== */}

            <div className="table-card">
                <div className="table-responsive">
                    <table className="modern-table">
                        <thead>
                            <tr>
                                <th>
                                    Invoice No.
                                </th>

                                <th>
                                    Type
                                </th>

                                <th>
                                    Customer
                                </th>

                                <th>
                                    Invoice Date
                                </th>

                                <th>
                                    Grand Total
                                </th>

                                <th>
                                    Status
                                </th>

                                <th className="text-end">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="text-center py-4"
                                    >
                                        Loading...
                                    </td>
                                </tr>
                            ) : paginatedData.length ===
                                0 ? (
                                <tr>
                                    <td colSpan="7">
                                        <div className="settings_empty">
                                            <div className="settings_empty_icon">
                                                <i className="fi fi-rs-file-invoice" />
                                            </div>

                                            <h6>
                                                No Invoices
                                                found
                                            </h6>

                                            <p>
                                                Try adjusting
                                                your search
                                                or create a
                                                new invoice.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map(
                                    (item) => (
                                        <tr
                                            key={
                                                item?.id
                                            }
                                        >
                                            <td className="dt-role-name">
                                                <i className="bi bi-receipt me-2" />

                                                {
                                                    item?.invoiceNumber
                                                }
                                            </td>

                                            <td>
                                                {
                                                    item?.invoiceType
                                                }
                                            </td>

                                            <td>
                                                {
                                                    item?.customerName ||
                                                    item
                                                        ?.customer
                                                        ?.displayName ||
                                                    ""
                                                }
                                            </td>

                                            <td>
                                                {
                                                    item?.invoiceDate
                                                }
                                            </td>

                                            <td>
                                                ₹
                                                {Number(
                                                    item?.grandTotal ||
                                                    0
                                                ).toFixed(
                                                    2
                                                )}
                                            </td>

                                            <td>
                                                <small
                                                    className={`py-1 px-2 rounded-pill ${item?.status ===
                                                            "PAID" ||
                                                            item?.status ===
                                                            "SENT"
                                                            ? "bg-success-subtle text-success"
                                                            : item?.status ===
                                                                "CANCELLED"
                                                                ? "bg-danger-subtle text-danger"
                                                                : "bg-warning-subtle text-warning"
                                                        }`}
                                                    style={{
                                                        fontSize:
                                                            "10px",
                                                    }}
                                                >
                                                    {item?.status ||
                                                        "DRAFT"}
                                                </small>
                                            </td>

                                            <td className="d-flex justify-content-end gap-2">
                                                <button
                                                    type="button"
                                                    className="dt-icon-btn dt-icon-btn--view"
                                                    onClick={() =>
                                                        handleView(
                                                            item
                                                        )
                                                    }
                                                    title="View Invoice"
                                                    disabled={
                                                        viewLoading
                                                    }
                                                >
                                                    <i className="bi bi-eye" />
                                                </button>

                                                <button
                                                    type="button"
                                                    className="dt-icon-btn dt-icon-btn--pdf"
                                                    onClick={() =>
                                                        handleDownloadPdf(
                                                            item
                                                        )
                                                    }
                                                    title="Download PDF"
                                                    disabled={
                                                        pdfLoading
                                                    }
                                                >
                                                    <i
                                                        className="bi bi-file-earmark-pdf-fill"
                                                        style={{
                                                            color:
                                                                "#c20b0b",
                                                        }}
                                                    />
                                                </button>

                                                <button
                                                    type="button"
                                                    className="dt-icon-btn dt-icon-btn--edit"
                                                    onClick={() =>
                                                        handleUpdate(
                                                            item
                                                        )
                                                    }
                                                    title="Edit Invoice"
                                                >
                                                    <i className="bi bi-pencil" />
                                                </button>

                                                <button
                                                    type="button"
                                                    className="dt-icon-btn dt-icon-btn--delete"
                                                    onClick={() =>
                                                        handleDelete(
                                                            item?.id
                                                        )
                                                    }
                                                    title="Delete Invoice"
                                                >
                                                    <i className="bi bi-trash" />
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                )
                            )}
                        </tbody>

                        <tfoot className="table-footer">
                            <tr>
                                <td colSpan="3">
                                    <div className="entry-count">
                                        Showing{" "}
                                        {totalRecords ===
                                            0
                                            ? 0
                                            : startIndex +
                                            1}{" "}
                                        to{" "}
                                        {Math.min(
                                            endIndex,
                                            totalRecords
                                        )}{" "}
                                        of{" "}
                                        {
                                            totalRecords
                                        }{" "}
                                        entries
                                    </div>
                                </td>

                                <td colSpan="4">
                                    <div className="pagination">
                                        <span
                                            className={`page-btn ${safeCurrentPage ===
                                                    1
                                                    ? "disabled"
                                                    : ""
                                                }`}
                                            onClick={() =>
                                                goToPage(
                                                    safeCurrentPage -
                                                    1
                                                )
                                            }
                                        >
                                            «
                                        </span>

                                        {Array.from(
                                            {
                                                length:
                                                    totalPages,
                                            },
                                            (_, i) =>
                                                i + 1
                                        ).map(
                                            (page) => (
                                                <span
                                                    key={
                                                        page
                                                    }
                                                    onClick={() =>
                                                        goToPage(
                                                            page
                                                        )
                                                    }
                                                    className={`page-number ${safeCurrentPage ===
                                                            page
                                                            ? "active"
                                                            : ""
                                                        }`}
                                                >
                                                    {
                                                        page
                                                    }
                                                </span>
                                            )
                                        )}

                                        <span
                                            className={`page-btn ${safeCurrentPage ===
                                                    totalPages
                                                    ? "disabled"
                                                    : ""
                                                }`}
                                            onClick={() =>
                                                goToPage(
                                                    safeCurrentPage +
                                                    1
                                                )
                                            }
                                        >
                                            »
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* =====================================================
                CREATE / EDIT
            ===================================================== */}

            {showModal && (
                <InvoiceCreate
                    existingInvoice={
                        exsistingInvoice
                    }
                    customers={
                        customers
                    }
                    products={
                        products
                    }
                    units={
                        units
                    }
                    sizes={
                        sizes
                    }
                    taxMasters={
                        taxMasters
                    }
                    onClose={
                        closeModal
                    }
                    onSuccess={() => {
                        closeModal();
                        refreshList();
                    }}
                />
            )}

            {/* =====================================================
                VIEW MODAL
            ===================================================== */}

            {showViewModal &&
                viewInvoice && (
                    <div
                        className="modal modal-form show d-block"
                        style={{
                            background:
                                "rgba(0,0,0,0.45)",
                        }}
                        onMouseDown={(e) => {
                            if (
                                e.target ===
                                e.currentTarget
                            ) {
                                setShowViewModal(
                                    false
                                );
                                setViewInvoice(
                                    null
                                );
                            }
                        }}
                    >
                        <div className="modal-dialog modal_form modal-dialog-centered modal-xl modal-dialog-scrollable">
                            <div className="modal-content">

                                {/* HEADER */}

                                <div
                                    className="modal-header"
                                    style={{
                                        background:
                                            "var(--main-color)",
                                    }}
                                >
                                    <h5
                                        className="invoice-modal-title"
                                        style={{
                                            color:
                                                "#fff",
                                        }}
                                    >
                                        <i className="bi bi-eye me-2" />
                                        View Invoice
                                    </h5>

                                    <button
                                        className="btn-close btn-close-white"
                                        onClick={() => {
                                            setShowViewModal(
                                                false
                                            );

                                            setViewInvoice(
                                                null
                                            );
                                        }}
                                        aria-label="Close"
                                    />
                                </div>

                                {/* BODY */}

                                <div className="modal-body form_content">

                                    <div className="row g-3">

                                        <div className="col-lg-4 col-md-6 col-12">
                                            <label className="form-label">
                                                Invoice Number
                                            </label>

                                            <input
                                                className="form-control"
                                                type="text"
                                                value={
                                                    viewInvoice.invoiceNumber ||
                                                    ""
                                                }
                                                disabled
                                            />
                                        </div>

                                        <div className="col-lg-4 col-md-6 col-12">
                                            <label className="form-label">
                                                Invoice Type
                                            </label>

                                            <input
                                                className="form-control"
                                                type="text"
                                                value={
                                                    viewInvoice.invoiceType ||
                                                    ""
                                                }
                                                disabled
                                            />
                                        </div>

                                        <div className="col-lg-4 col-md-6 col-12">
                                            <label className="form-label">
                                                Status
                                            </label>

                                            <input
                                                className="form-control"
                                                type="text"
                                                value={
                                                    viewInvoice.status ||
                                                    "DRAFT"
                                                }
                                                disabled
                                            />
                                        </div>

                                        <div className="col-lg-4 col-md-6 col-12">
                                            <label className="form-label">
                                                Invoice Date
                                            </label>

                                            <input
                                                className="form-control"
                                                type="date"
                                                value={
                                                    viewInvoice.invoiceDate ||
                                                    ""
                                                }
                                                disabled
                                            />
                                        </div>

                                        <div className="col-lg-4 col-md-6 col-12">
                                            <label className="form-label">
                                                Due Date
                                            </label>

                                            <input
                                                className="form-control"
                                                type="date"
                                                value={
                                                    viewInvoice.dueDate ||
                                                    ""
                                                }
                                                disabled
                                            />
                                        </div>

                                        <div className="col-lg-4 col-md-6 col-12">
                                            <label className="form-label">
                                                Customer
                                            </label>

                                            <input
                                                className="form-control"
                                                type="text"
                                                value={
                                                    viewInvoice.customerName ||
                                                    viewInvoice.customer?.displayName ||
                                                    ""
                                                }
                                                disabled
                                            />
                                        </div>

                                    </div>

                                    {/* CUSTOMER ADDRESS */}

                                    {(viewInvoice.customer?.billingAddress ||
                                        viewInvoice.customer?.shippingAddress) && (
                                            <div className="mt-3">
                                                <label className="form-label">
                                                    Billing Address
                                                </label>

                                                <textarea
                                                    className="form-control"
                                                    rows="2"
                                                    value={formatCustomerAddress(
                                                        viewInvoice.customer?.billingAddress ||
                                                        viewInvoice.customer?.shippingAddress
                                                    )}
                                                    disabled
                                                />
                                            </div>
                                        )}

                                    {/* ITEMS */}

                                    <div className="invoice-items-section mt-4">

                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <label className="form-label fw-semibold mb-0">
                                                Invoice Items
                                            </label>

                                            <small className="text-muted">
                                                {
                                                    viewInvoice
                                                        .invoiceItems
                                                        ?.length ||
                                                    0
                                                }{" "}
                                                items
                                            </small>
                                        </div>

                                        <div className="table-responsive">
                                            <table className="modern-table">

                                                <thead>
                                                    <tr>
                                                        <th>
                                                            Item Name
                                                        </th>

                                                        <th>
                                                            Description
                                                        </th>

                                                        <th>
                                                            Qty
                                                        </th>

                                                        <th>
                                                            Unit Price
                                                        </th>

                                                        <th>
                                                            Tax
                                                        </th>

                                                        <th>
                                                            Discount
                                                        </th>

                                                        <th>
                                                            Total
                                                        </th>
                                                    </tr>
                                                </thead>

                                                <tbody>

                                                    {(
                                                        viewInvoice.invoiceItems ||
                                                        []
                                                    ).map(
                                                        (
                                                            item,
                                                            index
                                                        ) => {

                                                            const breakdown =
                                                                getItemTaxBreakdown(
                                                                    item,
                                                                    taxMasters
                                                                );

                                                            const quantity =
                                                                Number(
                                                                    item?.quantity
                                                                ) || 0;

                                                            const unitPrice =
                                                                Number(
                                                                    item?.unitPrice
                                                                ) || 0;

                                                            const discount =
                                                                Number(
                                                                    item?.discountAmount
                                                                ) || 0;

                                                            const displayTaxRate =
                                                                Number.isInteger(
                                                                    breakdown.taxRate
                                                                )
                                                                    ? breakdown.taxRate
                                                                    : breakdown.taxRate.toFixed(
                                                                        2
                                                                    );

                                                            return (
                                                                <tr
                                                                    key={
                                                                        item?.id ||
                                                                        index
                                                                    }
                                                                >
                                                                    <td>
                                                                        {item?.productName ||
                                                                            item?.itemName ||
                                                                            item?.product
                                                                                ?.productName ||
                                                                            ""}
                                                                    </td>

                                                                    <td>
                                                                        {
                                                                            item?.description
                                                                        }
                                                                    </td>

                                                                    <td>
                                                                        {
                                                                            quantity
                                                                        }
                                                                    </td>

                                                                    <td>
                                                                        ₹
                                                                        {unitPrice.toFixed(
                                                                            2
                                                                        )}
                                                                    </td>

                                                                    <td>
                                                                        {
                                                                            displayTaxRate
                                                                        }
                                                                        %
                                                                    </td>

                                                                    <td>
                                                                        ₹
                                                                        {discount.toFixed(
                                                                            2
                                                                        )}
                                                                    </td>

                                                                    <td>
                                                                        <strong>
                                                                            ₹
                                                                            {breakdown.totalAmount.toFixed(
                                                                                2
                                                                            )}
                                                                        </strong>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        }
                                                    )}

                                                    {(
                                                        viewInvoice.invoiceItems ||
                                                        []
                                                    ).length ===
                                                        0 && (
                                                            <tr>
                                                                <td
                                                                    colSpan="7"
                                                                    className="text-center py-4"
                                                                >
                                                                    No invoice
                                                                    items
                                                                    found.
                                                                </td>
                                                            </tr>
                                                        )}

                                                </tbody>

                                            </table>
                                        </div>
                                    </div>

                                    {/* NOTES + TOTALS */}

                                    <div className="row g-3 mt-3">

                                        <div className="col-lg-7 col-md-12">

                                            <div className="mb-3">

                                                <label className="form-label">
                                                    Notes
                                                </label>

                                                <textarea
                                                    className="form-control"
                                                    rows="4"
                                                    value={
                                                        viewInvoice.notes ||
                                                        ""
                                                    }
                                                    disabled
                                                />

                                            </div>

                                            <div>

                                                <label className="form-label">
                                                    Terms &
                                                    Conditions
                                                </label>

                                                <textarea
                                                    className="form-control"
                                                    rows="4"
                                                    value={
                                                        viewInvoice.termsAndConditions ||
                                                        ""
                                                    }
                                                    disabled
                                                />

                                            </div>

                                        </div>

                                        <div className="col-lg-5 col-md-12">

                                            <div className="invoice-total-box">

                                                <div className="invoice-total-row">
                                                    <span>
                                                        Subtotal
                                                    </span>

                                                    <strong>
                                                        ₹
                                                        {viewTotals.subtotal.toFixed(
                                                            2
                                                        )}
                                                    </strong>
                                                </div>

                                                <div className="invoice-total-row">
                                                    <span>
                                                        Tax
                                                    </span>

                                                    <strong>
                                                        ₹
                                                        {viewTotals.tax.toFixed(
                                                            2
                                                        )}
                                                    </strong>
                                                </div>

                                                {viewTotals.cgst >
                                                    0 && (
                                                        <div className="invoice-total-row tax-sub-row">
                                                            <span>
                                                                CGST
                                                            </span>

                                                            <strong>
                                                                ₹
                                                                {viewTotals.cgst.toFixed(
                                                                    2
                                                                )}
                                                            </strong>
                                                        </div>
                                                    )}

                                                {viewTotals.sgst >
                                                    0 && (
                                                        <div className="invoice-total-row tax-sub-row">
                                                            <span>
                                                                SGST
                                                            </span>

                                                            <strong>
                                                                ₹
                                                                {viewTotals.sgst.toFixed(
                                                                    2
                                                                )}
                                                            </strong>
                                                        </div>
                                                    )}

                                                {viewTotals.igst >
                                                    0 && (
                                                        <div className="invoice-total-row tax-sub-row">
                                                            <span>
                                                                IGST
                                                            </span>

                                                            <strong>
                                                                ₹
                                                                {viewTotals.igst.toFixed(
                                                                    2
                                                                )}
                                                            </strong>
                                                        </div>
                                                    )}

                                                <div className="invoice-total-row">
                                                    <span>
                                                        Discount
                                                    </span>

                                                    <strong>
                                                        ₹
                                                        {viewTotals.discount.toFixed(
                                                            2
                                                        )}
                                                    </strong>
                                                </div>

                                                <div className="invoice-total-row">
                                                    <span>
                                                        Shipping
                                                    </span>

                                                    <strong>
                                                        ₹
                                                        {Number(
                                                            viewInvoice.shippingAmount ||
                                                            0
                                                        ).toFixed(
                                                            2
                                                        )}
                                                    </strong>
                                                </div>

                                                <div className="invoice-grand-total">
                                                    <strong>
                                                        Grand Total
                                                    </strong>

                                                    <strong>
                                                        ₹
                                                        {Number(
                                                            viewInvoice.grandTotal ||
                                                            0
                                                        ).toFixed(
                                                            2
                                                        )}
                                                    </strong>
                                                </div>

                                            </div>

                                        </div>

                                    </div>

                                </div>

                                {/* FOOTER */}

                                <div className="modal-footer">

                                    <button
                                        type="button"
                                        className="btn light-btn"
                                        onClick={() => {
                                            setShowViewModal(
                                                false
                                            );

                                            setViewInvoice(
                                                null
                                            );
                                        }}
                                    >
                                        Close
                                    </button>

                                </div>

                            </div>
                        </div>
                    </div>
                )}
        </>
    );
};

export default Invoice;