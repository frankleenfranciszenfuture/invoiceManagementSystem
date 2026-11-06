/*
 * ============================================================
 * REPORT MODULE CONFIGURATION
 * Backend source: ReportModule.java
 * ============================================================
 */

export const reportModuleConfig = {
  CUSTOMER: {
    displayName: "Customers",

    reports: {
      CUSTOMER_REGISTER: {
        name: "Customer Register",
        description: "View and filter customer records.",
        defaultSortBy: "displayName",
        defaultSortDirection: "ASC",

        sortFields: [
          { label: "Customer Name", value: "displayName" },
          { label: "Company Name", value: "companyName" },
          { label: "Email", value: "email" },
          { label: "Mobile", value: "mobile" },
          { label: "Created Date", value: "createdAt" },
        ],

        filters: [
          {
            key: "customerType",
            label: "Customer Type",
            type: "TEXT",
            placeholder: "Enter customer type",
          },
          {
            key: "displayName",
            label: "Customer Name",
            type: "TEXT",
            placeholder: "Enter customer name",
          },
          {
            key: "companyName",
            label: "Company Name",
            type: "TEXT",
            placeholder: "Enter company name",
          },
          {
            key: "currency",
            label: "Currency",
            type: "TEXT",
            placeholder: "Enter currency",
          },
          {
            key: "email",
            label: "Email",
            type: "TEXT",
            placeholder: "Enter email",
          },
          {
            key: "mobile",
            label: "Mobile",
            type: "TEXT",
            placeholder: "Enter mobile number",
          },
          {
            key: "paymentTerms",
            label: "Payment Terms",
            type: "TEXT",
            placeholder: "Enter payment terms",
          },
          {
            key: "enablePortal",
            label: "Portal Enabled",
            type: "SELECT",
            options: [
              { label: "Enabled", value: "true" },
              { label: "Disabled", value: "false" },
            ],
          },
          {
            key: "status",
            label: "Customer Status",
            type: "SELECT",
            options: [
              { label: "Active", value: "ACTIVE" },
              { label: "Inactive", value: "INACTIVE" },
            ],
          },
        ],

        columns: [
          { key: "customerType", label: "Customer Type" },
          { key: "displayName", label: "Customer Name" },
          { key: "companyName", label: "Company Name" },
          { key: "currency", label: "Currency" },
          { key: "email", label: "Email" },
          { key: "mobile", label: "Mobile" },
          { key: "paymentTerms", label: "Payment Terms" },
          { key: "enablePortal", label: "Portal Enabled" },
          { key: "status", label: "Status" },
          { key: "createdAt", label: "Created Date" },
        ],
      },
    },
  },

  INVOICE: {
    displayName: "Invoices",

    reports: {
      INVOICE_REGISTER: {
        name: "Invoice Register",
        description: "View and filter invoice records.",
        defaultSortBy: "invoiceDate",
        defaultSortDirection: "DESC",

        sortFields: [
          { label: "Invoice Date", value: "invoiceDate" },
          { label: "Invoice Number", value: "invoiceNumber" },
          { label: "Customer Name", value: "customerName" },
          { label: "Invoice Amount", value: "grandTotal" },
          { label: "Due Date", value: "dueDate" },
          { label: "Created Date", value: "createdAt" },
        ],

        filters: [
          {
            key: "invoiceNumber",
            label: "Invoice Number",
            type: "TEXT",
            placeholder: "Enter invoice number",
          },
          {
            key: "invoiceType",
            label: "Invoice Type",
            type: "SELECT",
            options: [
              { label: "Product Invoice", value: "PRODUCT_INVOICE" },
              { label: "Service Invoice", value: "SERVICE_INVOICE" },
              { label: "Sale Invoice", value: "SALE_INVOICE" },
            ],
          },
          {
            key: "invoiceStatus",
            label: "Invoice Status",
            type: "SELECT",
            options: [
              { label: "Draft", value: "DRAFT" },
              { label: "Sent", value: "SENT" },
              { label: "Partially Paid", value: "PARTIALLY_PAID" },
              { label: "Paid", value: "PAID" },
              { label: "Overdue", value: "OVERDUE" },
              { label: "Cancelled", value: "CANCELLED" },
            ],
          },
          {
            key: "customerId",
            label: "Customer ID",
            type: "NUMBER",
            min: 1,
            step: 1,
          },
          {
            key: "customerName",
            label: "Customer Name",
            type: "TEXT",
          },
          {
            key: "salesPersonId",
            label: "Sales Person ID",
            type: "NUMBER",
            min: 1,
            step: 1,
          },
          {
            key: "companyId",
            label: "Company ID",
            type: "NUMBER",
            min: 1,
            step: 1,
          },
          {
            key: "currencyId",
            label: "Currency ID",
            type: "NUMBER",
            min: 1,
            step: 1,
          },
          {
            key: "minAmount",
            label: "Minimum Grand Total",
            type: "NUMBER",
            min: 0,
            step: "any",
          },
          {
            key: "maxAmount",
            label: "Maximum Grand Total",
            type: "NUMBER",
            min: 0,
            step: "any",
          },
        ],

        columns: [
          { key: "invoiceNumber", label: "Invoice Number" },
          { key: "invoiceType", label: "Invoice Type" },
          { key: "invoiceDate", label: "Invoice Date" },
          { key: "dueDate", label: "Due Date" },
          { key: "customerName", label: "Customer Name" },
          { key: "subtotal", label: "Subtotal" },
          { key: "discountAmount", label: "Discount" },
          { key: "taxAmount", label: "Tax Amount" },
          { key: "shippingAmount", label: "Shipping Amount" },
          { key: "grandTotal", label: "Grand Total" },
          { key: "currencyCode", label: "Currency" },
          { key: "salesPersonName", label: "Sales Person" },
          { key: "companyName", label: "Company" },
          { key: "status", label: "Status" },
        ],
      },
    },
  },

  PURCHASE_ORDER: {
    displayName: "Purchase Orders",

    reports: {
      PURCHASE_ORDER_REGISTER: {
        name: "Purchase Order Register",
        description: "View and filter purchase order records.",

        defaultSortBy: "orderDate",
        defaultSortDirection: "DESC",

        sortFields: [
          { label: "Order Date", value: "orderDate" },
          { label: "Order Number", value: "orderNo" },
          { label: "Expected Delivery Date", value: "expectedDeliveryDate" },
          { label: "Supplier ID", value: "partyId" },
          { label: "Warehouse ID", value: "warehouseId" },
          { label: "Grand Total", value: "grandTotal" },
          { label: "Received Amount", value: "receivedTotalAmount" },
          { label: "Created Date", value: "createdAt" },
        ],

        filters: [
          {
            key: "orderNo",
            label: "Purchase Order Number",
            type: "TEXT",
            placeholder: "Enter purchase order number",
          },
          {
            key: "partyId",
            label: "Supplier ID",
            type: "NUMBER",
            min: 1,
            step: 1,
          },
          {
            key: "warehouseId",
            label: "Warehouse ID",
            type: "NUMBER",
            min: 1,
            step: 1,
          },
          {
            key: "purchaseOrderStatus",
            label: "Purchase Order Status",
            type: "SELECT",
            options: [
              { label: "Draft", value: "DRAFT" },
              { label: "Open", value: "OPEN" },
              { label: "Approved", value: "APPROVED" },
              { label: "Partially Received", value: "PARTIALLY_RECEIVED" },
              { label: "Received", value: "RECEIVED" },
              { label: "Cancelled", value: "CANCELLED" },
            ],
          },
          {
            key: "currencyId",
            label: "Currency ID",
            type: "NUMBER",
            min: 1,
            step: 1,
          },
          {
            key: "expectedDeliveryFrom",
            label: "Expected Delivery From",
            type: "DATE",
          },
          {
            key: "expectedDeliveryTo",
            label: "Expected Delivery To",
            type: "DATE",
          },
          {
            key: "minAmount",
            label: "Minimum Grand Total",
            type: "NUMBER",
            min: 0,
            step: "any",
          },
          {
            key: "maxAmount",
            label: "Maximum Grand Total",
            type: "NUMBER",
            min: 0,
            step: "any",
          },
        ],

        columns: [
          { key: "orderNo", label: "Purchase Order Number" },
          { key: "partyId", label: "Supplier ID" },
          { key: "warehouseId", label: "Warehouse ID" },
          { key: "orderDate", label: "Order Date" },
          { key: "expectedDeliveryDate", label: "Expected Delivery Date" },
          { key: "purchaseOrderStatus", label: "Status" },
          { key: "currencyId", label: "Currency ID" },
          { key: "exchangeRate", label: "Exchange Rate" },
          { key: "subtotal", label: "Subtotal" },
          { key: "discountAmount", label: "Discount" },
          { key: "taxableAmount", label: "Taxable Amount" },
          { key: "cgstAmount", label: "CGST" },
          { key: "sgstAmount", label: "SGST" },
          { key: "igstAmount", label: "IGST" },
          { key: "totalTaxAmount", label: "Total Tax" },
          { key: "grandTotal", label: "Grand Total" },
          { key: "receivedTotalAmount", label: "Received Amount" },
          { key: "baseGrandTotal", label: "Grand Total (INR)" },
          { key: "baseReceivedTotalAmount", label: "Received Amount (INR)" },
        ],
      },
    },
  },

  PURCHASE_ORDER_GOODS_RECEIPT: {
    displayName: "Purchase Order Goods Receipts",

    reports: {
      GOODS_RECEIPT_REGISTER: {
        name: "Goods Receipt Register",
        description: "View and filter purchase order goods receipt records.",

        defaultSortBy: "receiptDate",
        defaultSortDirection: "DESC",

        sortFields: [
          { label: "Receipt Date", value: "receiptDate" },
          { label: "Receipt Number", value: "receiptNo" },
          { label: "Purchase Order ID", value: "purchaseOrderId" },
          { label: "Purchase Order Number", value: "orderNo" },
          { label: "Warehouse ID", value: "warehouseId" },
          { label: "Created Date", value: "createdAt" },
        ],

        filters: [
          {
            key: "receiptNo",
            label: "Receipt Number",
            type: "TEXT",
            placeholder: "Enter receipt number",
          },
          {
            key: "purchaseOrderId",
            label: "Purchase Order ID",
            type: "NUMBER",
            min: 1,
            step: 1,
          },
          {
            key: "warehouseId",
            label: "Warehouse ID",
            type: "NUMBER",
            min: 1,
            step: 1,
          },
          {
            key: "receiptDateFrom",
            label: "Receipt Date From",
            type: "DATE",
          },
          {
            key: "receiptDateTo",
            label: "Receipt Date To",
            type: "DATE",
          },
        ],

        columns: [
          { key: "receiptNo", label: "Receipt Number" },
          { key: "purchaseOrderId", label: "Purchase Order ID" },
          { key: "orderNo", label: "Purchase Order Number" },
          { key: "warehouseId", label: "Warehouse ID" },
          { key: "receiptDate", label: "Receipt Date" },
          { key: "notes", label: "Notes" },
          { key: "active", label: "Active" },
          { key: "createdAt", label: "Created Date" },
          { key: "updatedAt", label: "Updated Date" },
        ],
      },

      GOODS_RECEIPT_DETAILS: {
        name: "Goods Receipt Details",
        description:
          "View detailed goods receipt and purchase order information.",

        defaultSortBy: "receiptDate",
        defaultSortDirection: "DESC",

        sortFields: [
          { label: "Receipt Date", value: "receiptDate" },
          { label: "Receipt Number", value: "receiptNo" },
          { label: "Purchase Order Number", value: "orderNo" },
          { label: "Created Date", value: "createdAt" },
        ],

        filters: [
          {
            key: "receiptNo",
            label: "Receipt Number",
            type: "TEXT",
            placeholder: "Enter receipt number",
          },
          {
            key: "purchaseOrderId",
            label: "Purchase Order ID",
            type: "NUMBER",
            min: 1,
            step: 1,
          },
          {
            key: "warehouseId",
            label: "Warehouse ID",
            type: "NUMBER",
            min: 1,
            step: 1,
          },
          {
            key: "receiptDateFrom",
            label: "Receipt Date From",
            type: "DATE",
          },
          {
            key: "receiptDateTo",
            label: "Receipt Date To",
            type: "DATE",
          },
        ],

        columns: [
          { key: "id", label: "Receipt ID" },
          { key: "receiptNo", label: "Receipt Number" },
          { key: "purchaseOrderId", label: "Purchase Order ID" },
          { key: "orderNo", label: "Purchase Order Number" },
          { key: "warehouseId", label: "Warehouse ID" },
          { key: "receiptDate", label: "Receipt Date" },
          { key: "notes", label: "Notes" },
          { key: "active", label: "Active" },
          { key: "createdAt", label: "Created Date" },
          { key: "updatedAt", label: "Updated Date" },
        ],
      },

      GOODS_RECEIPT_DATE_REPORT: {
        name: "Goods Receipt Date Report",
        description:
          "Analyze goods receipts within a selected receipt date range.",

        defaultSortBy: "receiptDate",
        defaultSortDirection: "DESC",

        sortFields: [
          { label: "Receipt Date", value: "receiptDate" },
          { label: "Receipt Number", value: "receiptNo" },
          { label: "Purchase Order Number", value: "orderNo" },
          { label: "Created Date", value: "createdAt" },
        ],

        filters: [
          {
            key: "receiptDateFrom",
            label: "Receipt Date From",
            type: "DATE",
          },
          {
            key: "receiptDateTo",
            label: "Receipt Date To",
            type: "DATE",
          },
          {
            key: "purchaseOrderId",
            label: "Purchase Order ID",
            type: "NUMBER",
            min: 1,
            step: 1,
          },
          {
            key: "warehouseId",
            label: "Warehouse ID",
            type: "NUMBER",
            min: 1,
            step: 1,
          },
        ],

        columns: [
          { key: "receiptNo", label: "Receipt Number" },
          { key: "orderNo", label: "Purchase Order Number" },
          { key: "warehouseId", label: "Warehouse ID" },
          { key: "receiptDate", label: "Receipt Date" },
          { key: "notes", label: "Notes" },
        ],
      },
    },
  },

  PARTY: {
    displayName: "Parties",

    reports: {
      // =====================================================
      // PARTY REGISTER
      // =====================================================

      PARTY_REGISTER: {
        name: "Party Register",
        description:
          "View and filter party records including company details, party type, contact information and status.",

        defaultSortBy: "createdAt",
        defaultSortDirection: "DESC",

        sortFields: [
          { label: "Party Code", value: "partyCode" },
          { label: "Party Type", value: "partyType" },
          { label: "Company Name", value: "companyName" },
          { label: "Contact Person", value: "contactPerson" },
          { label: "Mobile", value: "mobile" },
          { label: "Email", value: "email" },
          { label: "Status", value: "status" },
          { label: "Created Date", value: "createdAt" },
          { label: "Updated Date", value: "updatedAt" },
        ],

        filters: [
          {
            key: "partyCode",
            label: "Party Code",
            type: "TEXT",
            placeholder: "Enter party code",
          },
          {
            key: "companyName",
            label: "Company Name",
            type: "TEXT",
            placeholder: "Enter company name",
          },
          {
            key: "partyType",
            label: "Party Type",
            type: "SELECT",
            options: [
              { label: "Customer", value: "CUSTOMER" },
              { label: "Supplier", value: "SUPPLIER" },
            ],
          },
          {
            key: "status",
            label: "Status",
            type: "SELECT",
            options: [
              { label: "Active", value: "ACTIVE" },
              { label: "Inactive", value: "INACTIVE" },
            ],
          },
          {
            key: "email",
            label: "Email",
            type: "TEXT",
            placeholder: "Enter email",
          },
          {
            key: "mobile",
            label: "Mobile",
            type: "TEXT",
            placeholder: "Enter mobile number",
          },
          {
            key: "gstNumber",
            label: "GST Number",
            type: "TEXT",
            placeholder: "Enter GST number",
          },
          {
            key: "panNumber",
            label: "PAN Number",
            type: "TEXT",
            placeholder: "Enter PAN number",
          },
          {
            key: "active",
            label: "Active",
            type: "SELECT",
            options: [
              { label: "Active", value: "true" },
              { label: "Inactive", value: "false" },
            ],
          },
        ],

        columns: [
          { key: "id", label: "Party ID" },
          { key: "partyCode", label: "Party Code" },
          { key: "partyType", label: "Party Type" },
          { key: "companyName", label: "Company Name" },
          { key: "contactPerson", label: "Contact Person" },
          { key: "email", label: "Email" },
          { key: "mobile", label: "Mobile" },
          { key: "alternateMobile", label: "Alternate Mobile" },
          { key: "gstNumber", label: "GST Number" },
          { key: "panNumber", label: "PAN Number" },
          { key: "website", label: "Website" },
          { key: "status", label: "Status" },
          { key: "active", label: "Active" },
          { key: "createdAt", label: "Created Date" },
          { key: "updatedAt", label: "Updated Date" },
        ],
      },

      // =====================================================
      // PARTY CREDIT REPORT
      // =====================================================

      PARTY_CREDIT_REPORT: {
        name: "Party Credit Report",
        description:
          "View party credit limits, outstanding credit, receivables, payables and available credit.",

        defaultSortBy: "companyName",
        defaultSortDirection: "ASC",

        sortFields: [
          { label: "Party Code", value: "partyCode" },
          { label: "Party Type", value: "partyType" },
          { label: "Company Name", value: "companyName" },
          { label: "Credit Limit", value: "creditLimit" },
          { label: "Outstanding Credit", value: "outstandingCredit" },
          { label: "Outstanding Receivable", value: "outstandingReceivable" },
          { label: "Outstanding Payable", value: "outstandingPayable" },
        ],

        filters: [
          {
            key: "partyType",
            label: "Party Type",
            type: "SELECT",
            options: [
              { label: "Customer", value: "CUSTOMER" },
              { label: "Supplier", value: "SUPPLIER" },
            ],
          },
          {
            key: "minCreditLimit",
            label: "Minimum Credit Limit",
            type: "NUMBER",
            min: 0,
            step: "any",
          },
          {
            key: "maxCreditLimit",
            label: "Maximum Credit Limit",
            type: "NUMBER",
            min: 0,
            step: "any",
          },
          {
            key: "minOutstandingCredit",
            label: "Minimum Outstanding Credit",
            type: "NUMBER",
            min: 0,
            step: "any",
          },
          {
            key: "maxOutstandingCredit",
            label: "Maximum Outstanding Credit",
            type: "NUMBER",
            min: 0,
            step: "any",
          },
          {
            key: "minOutstandingReceivable",
            label: "Minimum Outstanding Receivable",
            type: "NUMBER",
            min: 0,
            step: "any",
          },
          {
            key: "maxOutstandingReceivable",
            label: "Maximum Outstanding Receivable",
            type: "NUMBER",
            min: 0,
            step: "any",
          },
          {
            key: "minOutstandingPayable",
            label: "Minimum Outstanding Payable",
            type: "NUMBER",
            min: 0,
            step: "any",
          },
          {
            key: "maxOutstandingPayable",
            label: "Maximum Outstanding Payable",
            type: "NUMBER",
            min: 0,
            step: "any",
          },
        ],

        columns: [
          { key: "id", label: "Party ID" },
          { key: "partyCode", label: "Party Code" },
          { key: "partyType", label: "Party Type" },
          { key: "companyName", label: "Company Name" },
          { key: "creditLimit", label: "Credit Limit" },
          { key: "outstandingCredit", label: "Outstanding Credit" },
          { key: "outstandingReceivable", label: "Outstanding Receivable" },
          { key: "outstandingPayable", label: "Outstanding Payable" },
          { key: "availableCredit", label: "Available Credit" },
          { key: "paymentTerms", label: "Payment Terms" },
          { key: "status", label: "Status" },
          { key: "active", label: "Active" },
        ],
      },

      // =====================================================
      // PARTY CONTACT REPORT
      // =====================================================

      PARTY_CONTACT_REPORT: {
        name: "Party Contact Report",
        description:
          "View party contact details including contact person, email, mobile, GST, PAN and website.",

        defaultSortBy: "companyName",
        defaultSortDirection: "ASC",

        sortFields: [
          { label: "Party Code", value: "partyCode" },
          { label: "Party Type", value: "partyType" },
          { label: "Company Name", value: "companyName" },
          { label: "Contact Person", value: "contactPerson" },
          { label: "Email", value: "email" },
          { label: "Mobile", value: "mobile" },
        ],

        filters: [
          {
            key: "partyType",
            label: "Party Type",
            type: "SELECT",
            options: [
              { label: "Customer", value: "CUSTOMER" },
              { label: "Supplier", value: "SUPPLIER" },
            ],
          },
          {
            key: "email",
            label: "Email",
            type: "TEXT",
            placeholder: "Enter email",
          },
          {
            key: "mobile",
            label: "Mobile",
            type: "TEXT",
            placeholder: "Enter mobile number",
          },
          {
            key: "gstNumber",
            label: "GST Number",
            type: "TEXT",
            placeholder: "Enter GST number",
          },
          {
            key: "panNumber",
            label: "PAN Number",
            type: "TEXT",
            placeholder: "Enter PAN number",
          },
        ],

        columns: [
          { key: "id", label: "Party ID" },
          { key: "partyCode", label: "Party Code" },
          { key: "partyType", label: "Party Type" },
          { key: "companyName", label: "Company Name" },
          { key: "contactPerson", label: "Contact Person" },
          { key: "email", label: "Email" },
          { key: "mobile", label: "Mobile" },
          { key: "alternateMobile", label: "Alternate Mobile" },
          { key: "gstNumber", label: "GST Number" },
          { key: "panNumber", label: "PAN Number" },
          { key: "website", label: "Website" },
        ],
      },
    },
  },

  CREDIT_CLEARANCE: {
    displayName: "Credit Clearances",

    reports: {
      CREDIT_CLEARANCE_REGISTER: {
        name: "Credit Clearance Register",
        description: "View and filter credit clearance records.",

        defaultSortBy: "clearanceDate",
        defaultSortDirection: "DESC",

        sortFields: [
          { label: "Clearance Date", value: "clearanceDate" },
          { label: "Clearance Number", value: "clearanceNo" },
          { label: "Party ID", value: "partyId" },
          { label: "Party Name", value: "partyName" },
          { label: "Party Type", value: "partyType" },
          { label: "Clearance Amount", value: "clearanceAmount" },
          { label: "Payment Method", value: "paymentMethod" },
          { label: "Status", value: "status" },
          { label: "Created Date", value: "createdAt" },
        ],

        filters: [
          {
            key: "clearanceNo",
            label: "Clearance Number",
            type: "TEXT",
            placeholder: "Enter clearance number",
          },
          {
            key: "partyId",
            label: "Party ID",
            type: "NUMBER",
            min: 1,
            step: 1,
          },
          {
            key: "partyType",
            label: "Party Type",
            type: "SELECT",
            options: [
              { label: "Customer", value: "CUSTOMER" },
              { label: "Supplier", value: "SUPPLIER" },
            ],
          },
          {
            key: "paymentMethod",
            label: "Payment Method",
            type: "SELECT",
            options: [
              { label: "Cash", value: "CASH" },
              { label: "Card", value: "CARD" },
              { label: "UPI", value: "UPI" },
              { label: "Bank Transfer", value: "BANK_TRANSFER" },
              { label: "Cheque", value: "CHEQUE" },
            ],
          },
          {
            key: "status",
            label: "Status",
            type: "SELECT",
            options: [
              { label: "Active", value: "ACTIVE" },
              { label: "Inactive", value: "INACTIVE" },
            ],
          },
          {
            key: "clearanceDateFrom",
            label: "Clearance Date From",
            type: "DATE",
          },
          {
            key: "clearanceDateTo",
            label: "Clearance Date To",
            type: "DATE",
          },
          {
            key: "minAmount",
            label: "Minimum Clearance Amount",
            type: "NUMBER",
            min: 0,
            step: "any",
          },
          {
            key: "maxAmount",
            label: "Maximum Clearance Amount",
            type: "NUMBER",
            min: 0,
            step: "any",
          },
        ],

        columns: [
          { key: "clearanceNo", label: "Clearance Number" },
          { key: "partyId", label: "Party ID" },
          { key: "partyCode", label: "Party Code" },
          { key: "partyName", label: "Party Name" },
          { key: "partyType", label: "Party Type" },
          { key: "creditLimit", label: "Credit Limit" },
          { key: "clearanceAmount", label: "Clearance Amount" },
          {
            key: "previousOutstandingCredit",
            label: "Previous Outstanding Credit",
          },
          {
            key: "remainingOutstandingCredit",
            label: "Remaining Outstanding Credit",
          },
          { key: "paymentMethod", label: "Payment Method" },
          {
            key: "paymentReferenceNumber",
            label: "Payment Reference Number",
          },
          { key: "clearanceDate", label: "Clearance Date" },
          { key: "status", label: "Status" },
          { key: "active", label: "Active" },
          { key: "createdAt", label: "Created Date" },
        ],
      },

      CREDIT_CLEARANCE_DETAILS: {
        name: "Credit Clearance Details",
        description: "View detailed credit clearance and payment information.",

        defaultSortBy: "clearanceDate",
        defaultSortDirection: "DESC",

        sortFields: [
          { label: "Clearance Date", value: "clearanceDate" },
          { label: "Clearance Number", value: "clearanceNo" },
          { label: "Party Name", value: "partyName" },
          { label: "Clearance Amount", value: "clearanceAmount" },
          { label: "Created Date", value: "createdAt" },
        ],

        filters: [
          {
            key: "clearanceNo",
            label: "Clearance Number",
            type: "TEXT",
            placeholder: "Enter clearance number",
          },
          {
            key: "partyId",
            label: "Party ID",
            type: "NUMBER",
            min: 1,
            step: 1,
          },
          {
            key: "paymentMethod",
            label: "Payment Method",
            type: "SELECT",
            options: [
              { label: "Cash", value: "CASH" },
              { label: "Card", value: "CARD" },
              { label: "UPI", value: "UPI" },
              { label: "Bank Transfer", value: "BANK_TRANSFER" },
              { label: "Cheque", value: "CHEQUE" },
            ],
          },
          {
            key: "clearanceDateFrom",
            label: "Clearance Date From",
            type: "DATE",
          },
          {
            key: "clearanceDateTo",
            label: "Clearance Date To",
            type: "DATE",
          },
          {
            key: "minAmount",
            label: "Minimum Clearance Amount",
            type: "NUMBER",
            min: 0,
            step: "any",
          },
          {
            key: "maxAmount",
            label: "Maximum Clearance Amount",
            type: "NUMBER",
            min: 0,
            step: "any",
          },
        ],

        columns: [
          { key: "clearanceNo", label: "Clearance Number" },
          { key: "partyId", label: "Party ID" },
          { key: "partyCode", label: "Party Code" },
          { key: "partyName", label: "Party Name" },
          { key: "partyType", label: "Party Type" },
          { key: "creditLimit", label: "Credit Limit" },
          {
            key: "previousOutstandingCredit",
            label: "Previous Outstanding Credit",
          },
          { key: "clearanceAmount", label: "Clearance Amount" },
          {
            key: "remainingOutstandingCredit",
            label: "Remaining Outstanding Credit",
          },
          { key: "paymentMethod", label: "Payment Method" },
          {
            key: "paymentReferenceNumber",
            label: "Payment Reference Number",
          },
          { key: "clearanceDate", label: "Clearance Date" },
          { key: "remarks", label: "Remarks" },
          { key: "status", label: "Status" },
        ],
      },

      CREDIT_CLEARANCE_PARTY_REPORT: {
        name: "Credit Clearance Party Report",
        description: "View credit clearance history by party.",

        defaultSortBy: "clearanceDate",
        defaultSortDirection: "DESC",

        sortFields: [
          { label: "Clearance Date", value: "clearanceDate" },
          { label: "Party Name", value: "partyName" },
          { label: "Party Code", value: "partyCode" },
          { label: "Clearance Number", value: "clearanceNo" },
          { label: "Clearance Amount", value: "clearanceAmount" },
        ],

        filters: [
          {
            key: "partyId",
            label: "Party ID",
            type: "NUMBER",
            min: 1,
            step: 1,
          },
          {
            key: "partyType",
            label: "Party Type",
            type: "SELECT",
            options: [
              { label: "Customer", value: "CUSTOMER" },
              { label: "Supplier", value: "SUPPLIER" },
            ],
          },
          {
            key: "clearanceDateFrom",
            label: "Clearance Date From",
            type: "DATE",
          },
          {
            key: "clearanceDateTo",
            label: "Clearance Date To",
            type: "DATE",
          },
          {
            key: "minAmount",
            label: "Minimum Clearance Amount",
            type: "NUMBER",
            min: 0,
            step: "any",
          },
          {
            key: "maxAmount",
            label: "Maximum Clearance Amount",
            type: "NUMBER",
            min: 0,
            step: "any",
          },
        ],

        columns: [
          { key: "partyId", label: "Party ID" },
          { key: "partyCode", label: "Party Code" },
          { key: "partyName", label: "Party Name" },
          { key: "partyType", label: "Party Type" },
          { key: "clearanceNo", label: "Clearance Number" },
          { key: "clearanceDate", label: "Clearance Date" },
          { key: "creditLimit", label: "Credit Limit" },
          {
            key: "previousOutstandingCredit",
            label: "Previous Outstanding Credit",
          },
          { key: "clearanceAmount", label: "Clearance Amount" },
          {
            key: "remainingOutstandingCredit",
            label: "Remaining Outstanding Credit",
          },
          { key: "paymentMethod", label: "Payment Method" },
          { key: "status", label: "Status" },
        ],
      },
    },
  },

  BANK_TRANSACTION: {
    displayName: "Bank Transactions",

    reports: {
      // =====================================================
      // BANK TRANSACTION REGISTER
      // =====================================================

      BANK_TRANSACTION_REGISTER: {
        name: "Bank Transaction Register",
        description: "Complete bank transaction register.",

        defaultSortBy: "transactionDate",
        defaultSortDirection: "DESC",

        sortFields: [
          { label: "Transaction Number", value: "transactionNumber" },
          { label: "Transaction Date", value: "transactionDate" },
          { label: "Amount", value: "amount" },
          { label: "Base Amount", value: "baseAmount" },
          { label: "Direction", value: "direction" },
          { label: "Currency", value: "currencyCode" },
          { label: "Created Date", value: "createdAt" },
        ],

        filters: [
          {
            key: "transactionNumber",
            label: "Transaction Number",
            type: "TEXT",
            placeholder: "Enter transaction number",
          },
          {
            key: "bankAccountId",
            label: "Bank Account ID",
            type: "NUMBER",
            min: 1,
            step: 1,
          },
          {
            key: "direction",
            label: "Direction",
            type: "SELECT",
            options: [
              { label: "Credit", value: "CREDIT" },
              { label: "Debit", value: "DEBIT" },
            ],
          },
          {
            key: "currencyCode",
            label: "Currency Code",
            type: "TEXT",
            placeholder: "Enter currency code",
          },
          {
            key: "minAmount",
            label: "Minimum Amount",
            type: "NUMBER",
            min: 0,
            step: "any",
          },
          {
            key: "maxAmount",
            label: "Maximum Amount",
            type: "NUMBER",
            min: 0,
            step: "any",
          },
          {
            key: "transactionDateFrom",
            label: "Transaction Date From",
            type: "DATE",
          },
          {
            key: "transactionDateTo",
            label: "Transaction Date To",
            type: "DATE",
          },
        ],

        columns: [
          { key: "id", label: "Transaction ID" },
          { key: "transactionNumber", label: "Transaction Number" },
          { key: "bankAccountId", label: "Bank Account ID" },
          { key: "bankAccountName", label: "Bank Account" },
          { key: "direction", label: "Direction" },
          { key: "transactionDate", label: "Transaction Date" },
          { key: "amount", label: "Amount" },
          { key: "baseAmount", label: "Base Amount (INR)" },
          { key: "exchangeRate", label: "Exchange Rate" },
          { key: "currencyCode", label: "Currency" },
          { key: "referenceNumber", label: "Reference Number" },
          { key: "description", label: "Description" },
          { key: "active", label: "Active" },
          { key: "createdAt", label: "Created Date" },
        ],
      },

      // =====================================================
      // BANK TRANSACTION DETAILS
      // =====================================================

      BANK_TRANSACTION_DETAILS: {
        name: "Bank Transaction Details",
        description: "Detailed transaction, payment and party information.",

        defaultSortBy: "transactionDate",
        defaultSortDirection: "DESC",

        sortFields: [
          { label: "Transaction Number", value: "transactionNumber" },
          { label: "Transaction Date", value: "transactionDate" },
          { label: "Amount", value: "amount" },
          { label: "Direction", value: "direction" },
          { label: "Created Date", value: "createdAt" },
        ],

        filters: [
          {
            key: "bankAccountId",
            label: "Bank Account ID",
            type: "NUMBER",
            min: 1,
            step: 1,
          },
          {
            key: "paymentId",
            label: "Payment ID",
            type: "NUMBER",
            min: 1,
            step: 1,
          },
          {
            key: "partyId",
            label: "Party ID",
            type: "NUMBER",
            min: 1,
            step: 1,
          },
          {
            key: "direction",
            label: "Direction",
            type: "SELECT",
            options: [
              { label: "Credit", value: "CREDIT" },
              { label: "Debit", value: "DEBIT" },
            ],
          },
          {
            key: "referenceNumber",
            label: "Reference Number",
            type: "TEXT",
            placeholder: "Enter reference number",
          },
          {
            key: "transactionDateFrom",
            label: "Transaction Date From",
            type: "DATE",
          },
          {
            key: "transactionDateTo",
            label: "Transaction Date To",
            type: "DATE",
          },
        ],

        columns: [
          { key: "id", label: "Transaction ID" },
          { key: "transactionNumber", label: "Transaction Number" },
          { key: "bankAccountId", label: "Bank Account ID" },
          { key: "bankAccountName", label: "Bank Account" },
          { key: "paymentId", label: "Payment ID" },
          { key: "partyId", label: "Party ID" },
          { key: "partyName", label: "Party Name" },
          { key: "direction", label: "Direction" },
          { key: "transactionDate", label: "Transaction Date" },
          { key: "amount", label: "Amount" },
          { key: "baseAmount", label: "Base Amount (INR)" },
          { key: "exchangeRate", label: "Exchange Rate" },
          { key: "currencyCode", label: "Currency" },
          { key: "referenceNumber", label: "Reference Number" },
          { key: "description", label: "Description" },
          { key: "reversalOfId", label: "Original Transaction ID" },
        ],
      },

      // =====================================================
      // BANK TRANSACTION REVERSALS
      // =====================================================

      BANK_TRANSACTION_REVERSALS: {
        name: "Bank Transaction Reversals",
        description: "Original and reversal transaction tracking.",

        defaultSortBy: "transactionDate",
        defaultSortDirection: "DESC",

        sortFields: [
          { label: "Transaction Number", value: "transactionNumber" },
          { label: "Transaction Date", value: "transactionDate" },
          { label: "Amount", value: "amount" },
          { label: "Created Date", value: "createdAt" },
        ],

        filters: [
          {
            key: "bankAccountId",
            label: "Bank Account ID",
            type: "NUMBER",
            min: 1,
            step: 1,
          },
          {
            key: "reversalOfId",
            label: "Original Transaction ID",
            type: "NUMBER",
            min: 1,
            step: 1,
          },
          {
            key: "transactionDateFrom",
            label: "Transaction Date From",
            type: "DATE",
          },
          {
            key: "transactionDateTo",
            label: "Transaction Date To",
            type: "DATE",
          },
        ],

        columns: [
          { key: "id", label: "Transaction ID" },
          { key: "transactionNumber", label: "Transaction Number" },
          { key: "reversalOfId", label: "Original Transaction ID" },
          { key: "bankAccountId", label: "Bank Account ID" },
          { key: "bankAccountName", label: "Bank Account" },
          { key: "direction", label: "Direction" },
          { key: "transactionDate", label: "Transaction Date" },
          { key: "amount", label: "Amount" },
          { key: "baseAmount", label: "Base Amount (INR)" },
          { key: "referenceNumber", label: "Reference Number" },
          { key: "description", label: "Description" },
        ],
      },
    },
  },

  EXPENSE: {
    displayName: "Expenses",

    reports: {
      // =====================================================
      // EXPENSE REGISTER
      // =====================================================

      EXPENSE_REGISTER: {
        name: "Expense Register",
        description:
          "Complete expense register with category, vendor and amount details.",

        defaultSortBy: "expenseDate",
        defaultSortDirection: "DESC",

        sortFields: [
          { label: "Expense Number", value: "expenseNo" },
          { label: "Expense Date", value: "expenseDate" },
          { label: "Expense Type", value: "expenseType" },
          { label: "Total Amount", value: "totalAmount" },
          { label: "Paid Amount", value: "paidAmount" },
          { label: "Due Amount", value: "dueAmount" },
          { label: "Expense Status", value: "expenseStatus" },
          { label: "Payment Status", value: "paymentStatus" },
          { label: "Created Date", value: "createdAt" },
        ],

        filters: [
          {
            key: "expenseNo",
            label: "Expense Number",
            type: "TEXT",
            placeholder: "Enter expense number",
          },
          {
            key: "expenseType",
            label: "Expense Type",
            type: "TEXT",
            placeholder: "Enter expense type",
          },
          {
            key: "expenseCategoryId",
            label: "Expense Category ID",
            type: "NUMBER",
            min: 1,
            step: 1,
          },
          {
            key: "vendorId",
            label: "Vendor ID",
            type: "NUMBER",
            min: 1,
            step: 1,
          },
          {
            key: "warehouseId",
            label: "Warehouse ID",
            type: "NUMBER",
            min: 1,
            step: 1,
          },
          {
            key: "currencyId",
            label: "Currency ID",
            type: "NUMBER",
            min: 1,
            step: 1,
          },
          {
            key: "expenseStatus",
            label: "Expense Status",
            type: "TEXT",
            placeholder: "Enter expense status",
          },
          {
            key: "paymentStatus",
            label: "Payment Status",
            type: "TEXT",
            placeholder: "Enter payment status",
          },
          {
            key: "minAmount",
            label: "Minimum Total Amount",
            type: "NUMBER",
            min: 0,
            step: "any",
          },
          {
            key: "maxAmount",
            label: "Maximum Total Amount",
            type: "NUMBER",
            min: 0,
            step: "any",
          },
          {
            key: "expenseDateFrom",
            label: "Expense Date From",
            type: "DATE",
          },
          {
            key: "expenseDateTo",
            label: "Expense Date To",
            type: "DATE",
          },
        ],

        columns: [
          { key: "id", label: "Expense ID" },
          { key: "expenseNo", label: "Expense Number" },
          { key: "expenseType", label: "Expense Type" },
          { key: "expenseCategoryId", label: "Category ID" },
          { key: "vendorId", label: "Vendor ID" },
          { key: "vendorName", label: "Vendor Name" },
          { key: "warehouseId", label: "Warehouse ID" },
          { key: "expenseDate", label: "Expense Date" },
          { key: "currencyId", label: "Currency ID" },
          { key: "amount", label: "Amount" },
          { key: "discountAmount", label: "Discount Amount" },
          { key: "taxableAmount", label: "Taxable Amount" },
          { key: "totalTaxAmount", label: "Total Tax" },
          { key: "totalAmount", label: "Total Amount" },
          { key: "paidAmount", label: "Paid Amount" },
          { key: "dueAmount", label: "Due Amount" },
          { key: "expenseStatus", label: "Expense Status" },
          { key: "paymentStatus", label: "Payment Status" },
          { key: "active", label: "Active" },
          { key: "createdAt", label: "Created Date" },
        ],
      },

      // =====================================================
      // EXPENSE DETAILS
      // =====================================================

      EXPENSE_DETAILS: {
        name: "Expense Details",
        description:
          "Detailed expense information including vendor, tax, currency and approval details.",

        defaultSortBy: "expenseDate",
        defaultSortDirection: "DESC",

        sortFields: [
          { label: "Expense Number", value: "expenseNo" },
          { label: "Expense Date", value: "expenseDate" },
          { label: "Expense Type", value: "expenseType" },
          { label: "Total Amount", value: "totalAmount" },
          { label: "Base Total Amount", value: "baseTotalAmount" },
          { label: "Vendor", value: "vendor.id" },
          { label: "Created Date", value: "createdAt" },
        ],

        filters: [
          {
            key: "expenseCategoryId",
            label: "Expense Category ID",
            type: "NUMBER",
            min: 1,
            step: 1,
          },
          {
            key: "vendorId",
            label: "Vendor ID",
            type: "NUMBER",
            min: 1,
            step: 1,
          },
          {
            key: "taxMasterId",
            label: "Tax Master ID",
            type: "NUMBER",
            min: 1,
            step: 1,
          },
          {
            key: "currencyId",
            label: "Currency ID",
            type: "NUMBER",
            min: 1,
            step: 1,
          },
          {
            key: "expenseStatus",
            label: "Expense Status",
            type: "TEXT",
            placeholder: "Enter expense status",
          },
          {
            key: "expenseDateFrom",
            label: "Expense Date From",
            type: "DATE",
          },
          {
            key: "expenseDateTo",
            label: "Expense Date To",
            type: "DATE",
          },
        ],

        columns: [
          { key: "id", label: "Expense ID" },
          { key: "expenseNo", label: "Expense Number" },
          { key: "expenseType", label: "Expense Type" },
          { key: "expenseCategoryId", label: "Category ID" },
          { key: "expenseDate", label: "Expense Date" },
          { key: "description", label: "Description" },
          { key: "referenceNo", label: "Reference Number" },
          { key: "vendorId", label: "Vendor ID" },
          { key: "vendorName", label: "Vendor Name" },
          { key: "warehouseId", label: "Warehouse ID" },
          { key: "currencyId", label: "Currency ID" },
          { key: "exchangeRate", label: "Exchange Rate" },
          { key: "taxMasterId", label: "Tax Master ID" },
          { key: "amount", label: "Amount" },
          { key: "discountAmount", label: "Discount Amount" },
          { key: "taxableAmount", label: "Taxable Amount" },
          { key: "cgstAmount", label: "CGST Amount" },
          { key: "sgstAmount", label: "SGST Amount" },
          { key: "igstAmount", label: "IGST Amount" },
          { key: "totalTaxAmount", label: "Total Tax Amount" },
          { key: "totalAmount", label: "Total Amount" },
          { key: "baseAmount", label: "Base Amount (INR)" },
          { key: "baseDiscountAmount", label: "Base Discount (INR)" },
          { key: "baseTaxableAmount", label: "Base Taxable Amount (INR)" },
          { key: "baseCgstAmount", label: "Base CGST (INR)" },
          { key: "baseSgstAmount", label: "Base SGST (INR)" },
          { key: "baseIgstAmount", label: "Base IGST (INR)" },
          { key: "baseTotalTaxAmount", label: "Base Total Tax (INR)" },
          { key: "baseTotalAmount", label: "Base Total Amount (INR)" },
          { key: "expenseStatus", label: "Expense Status" },
          { key: "paymentStatus", label: "Payment Status" },
          { key: "approvedBy", label: "Approved By" },
          { key: "approvedAt", label: "Approved Date" },
          { key: "rejectedBy", label: "Rejected By" },
          { key: "rejectedAt", label: "Rejected Date" },
          { key: "rejectionReason", label: "Rejection Reason" },
          { key: "notes", label: "Notes" },
          { key: "active", label: "Active" },
          { key: "createdAt", label: "Created Date" },
          { key: "updatedAt", label: "Updated Date" },
        ],
      },

      // =====================================================
      // EXPENSE PAYMENT REPORT
      // =====================================================

      EXPENSE_PAYMENT_REPORT: {
        name: "Expense Payment Report",
        description:
          "Expense payment tracking with paid, due and payment status information.",

        defaultSortBy: "expenseDate",
        defaultSortDirection: "DESC",

        sortFields: [
          { label: "Expense Number", value: "expenseNo" },
          { label: "Expense Date", value: "expenseDate" },
          { label: "Total Amount", value: "totalAmount" },
          { label: "Paid Amount", value: "paidAmount" },
          { label: "Due Amount", value: "dueAmount" },
          { label: "Payment Status", value: "paymentStatus" },
          { label: "Created Date", value: "createdAt" },
        ],

        filters: [
          {
            key: "expenseNo",
            label: "Expense Number",
            type: "TEXT",
            placeholder: "Enter expense number",
          },
          {
            key: "vendorId",
            label: "Vendor ID",
            type: "NUMBER",
            min: 1,
            step: 1,
          },
          {
            key: "paymentStatus",
            label: "Payment Status",
            type: "TEXT",
            placeholder: "Enter payment status",
          },
          {
            key: "minAmount",
            label: "Minimum Total Amount",
            type: "NUMBER",
            min: 0,
            step: "any",
          },
          {
            key: "maxAmount",
            label: "Maximum Total Amount",
            type: "NUMBER",
            min: 0,
            step: "any",
          },
          {
            key: "minPaidAmount",
            label: "Minimum Paid Amount",
            type: "NUMBER",
            min: 0,
            step: "any",
          },
          {
            key: "maxPaidAmount",
            label: "Maximum Paid Amount",
            type: "NUMBER",
            min: 0,
            step: "any",
          },
          {
            key: "minDueAmount",
            label: "Minimum Due Amount",
            type: "NUMBER",
            min: 0,
            step: "any",
          },
          {
            key: "maxDueAmount",
            label: "Maximum Due Amount",
            type: "NUMBER",
            min: 0,
            step: "any",
          },
          {
            key: "expenseDateFrom",
            label: "Expense Date From",
            type: "DATE",
          },
          {
            key: "expenseDateTo",
            label: "Expense Date To",
            type: "DATE",
          },
        ],

        columns: [
          { key: "id", label: "Expense ID" },
          { key: "expenseNo", label: "Expense Number" },
          { key: "expenseDate", label: "Expense Date" },
          { key: "vendorId", label: "Vendor ID" },
          { key: "vendorName", label: "Vendor Name" },
          { key: "currencyId", label: "Currency ID" },
          { key: "amount", label: "Amount" },
          { key: "totalAmount", label: "Total Amount" },
          { key: "baseTotalAmount", label: "Base Total Amount (INR)" },
          { key: "paidAmount", label: "Paid Amount" },
          { key: "dueAmount", label: "Due Amount" },
          { key: "expenseStatus", label: "Expense Status" },
          { key: "paymentStatus", label: "Payment Status" },
          { key: "active", label: "Active" },
          { key: "createdAt", label: "Created Date" },
        ],
      },
    },
  },

  SALES_ORDER: {
    displayName: "Sales Orders",

    reports: {
      // =====================================================
      // SALES ORDER REGISTER
      // =====================================================

      SALES_ORDER_REGISTER: {
        name: "Sales Order Register",
        description: "Complete sales order register.",

        defaultSortBy: "orderDate",
        defaultSortDirection: "DESC",

        sortFields: [
          { label: "Order Number", value: "orderNo" },
          { label: "Order Date", value: "orderDate" },
          { label: "Expected Delivery Date", value: "expectedDeliveryDate" },
          { label: "Grand Total", value: "grandTotal" },
          { label: "Status", value: "salesOrderStatus" },
          { label: "Created Date", value: "createdAt" },
        ],

        filters: [
          {
            key: "partyType",
            label: "Party Type",
            type: "SELECT",
            options: [
              { label: "Customer", value: "CUSTOMER" },
              { label: "Party", value: "PARTY" },
            ],
          },
          {
            key: "customerId",
            label: "Customer ID",
            type: "NUMBER",
            min: 1,
            step: 1,
          },
          {
            key: "partyId",
            label: "Party ID",
            type: "NUMBER",
            min: 1,
            step: 1,
          },
          {
            key: "warehouseId",
            label: "Warehouse ID",
            type: "NUMBER",
            min: 1,
            step: 1,
          },
          {
            key: "currencyId",
            label: "Currency ID",
            type: "NUMBER",
            min: 1,
            step: 1,
          },
          {
            key: "salesOrderStatus",
            label: "Sales Order Status",
            type: "TEXT",
            placeholder: "Enter order status",
          },
          {
            key: "minAmount",
            label: "Minimum Grand Total",
            type: "NUMBER",
            min: 0,
            step: "any",
          },
          {
            key: "maxAmount",
            label: "Maximum Grand Total",
            type: "NUMBER",
            min: 0,
            step: "any",
          },
          {
            key: "orderDateFrom",
            label: "Order Date From",
            type: "DATE",
          },
          {
            key: "orderDateTo",
            label: "Order Date To",
            type: "DATE",
          },
        ],

        columns: [
          { key: "id", label: "Sales Order ID" },
          { key: "orderNo", label: "Order Number" },
          { key: "partyType", label: "Party Type" },
          { key: "customerId", label: "Customer ID" },
          { key: "customerName", label: "Customer Name" },
          { key: "partyId", label: "Party ID" },
          { key: "partyName", label: "Party Name" },
          { key: "warehouseId", label: "Warehouse ID" },
          { key: "warehouseName", label: "Warehouse" },
          { key: "orderDate", label: "Order Date" },
          { key: "expectedDeliveryDate", label: "Expected Delivery Date" },
          { key: "salesOrderStatus", label: "Status" },
          { key: "currencyId", label: "Currency ID" },
          { key: "currencyCode", label: "Currency" },
          { key: "exchangeRate", label: "Exchange Rate" },
          { key: "subtotal", label: "Subtotal" },
          { key: "discountAmount", label: "Discount Amount" },
          { key: "taxableAmount", label: "Taxable Amount" },
          { key: "totalTaxAmount", label: "Total Tax" },
          { key: "grandTotal", label: "Grand Total" },
          { key: "active", label: "Active" },
          { key: "createdAt", label: "Created Date" },
        ],
      },

      // =====================================================
      // SALES ORDER DETAILS
      // =====================================================

      SALES_ORDER_DETAILS: {
        name: "Sales Order Details",
        description: "Detailed sales order financial and party information.",

        defaultSortBy: "orderDate",
        defaultSortDirection: "DESC",

        sortFields: [
          { label: "Order Number", value: "orderNo" },
          { label: "Order Date", value: "orderDate" },
          { label: "Grand Total", value: "grandTotal" },
          { label: "Base Grand Total", value: "baseGrandTotal" },
          { label: "Created Date", value: "createdAt" },
        ],

        filters: [
          {
            key: "partyType",
            label: "Party Type",
            type: "SELECT",
            options: [
              { label: "Customer", value: "CUSTOMER" },
              { label: "Party", value: "PARTY" },
            ],
          },
          {
            key: "customerId",
            label: "Customer ID",
            type: "NUMBER",
            min: 1,
            step: 1,
          },
          {
            key: "partyId",
            label: "Party ID",
            type: "NUMBER",
            min: 1,
            step: 1,
          },
          {
            key: "warehouseId",
            label: "Warehouse ID",
            type: "NUMBER",
            min: 1,
            step: 1,
          },
          {
            key: "currencyId",
            label: "Currency ID",
            type: "NUMBER",
            min: 1,
            step: 1,
          },
          {
            key: "salesOrderStatus",
            label: "Sales Order Status",
            type: "TEXT",
            placeholder: "Enter order status",
          },
          {
            key: "orderDateFrom",
            label: "Order Date From",
            type: "DATE",
          },
          {
            key: "orderDateTo",
            label: "Order Date To",
            type: "DATE",
          },
        ],

        columns: [
          { key: "id", label: "Sales Order ID" },
          { key: "orderNo", label: "Order Number" },
          { key: "partyType", label: "Party Type" },
          { key: "customerId", label: "Customer ID" },
          { key: "customerName", label: "Customer Name" },
          { key: "partyId", label: "Party ID" },
          { key: "partyName", label: "Party Name" },
          { key: "warehouseId", label: "Warehouse ID" },
          { key: "warehouseName", label: "Warehouse" },
          { key: "orderDate", label: "Order Date" },
          { key: "salesOrderStatus", label: "Status" },
          { key: "currencyId", label: "Currency ID" },
          { key: "currencyCode", label: "Currency" },
          { key: "exchangeRate", label: "Exchange Rate" },
          { key: "discountType", label: "Discount Type" },
          { key: "discountValue", label: "Discount Value" },
          { key: "subtotal", label: "Subtotal" },
          { key: "discountAmount", label: "Discount Amount" },
          { key: "taxableAmount", label: "Taxable Amount" },
          { key: "cgstAmount", label: "CGST Amount" },
          { key: "sgstAmount", label: "SGST Amount" },
          { key: "igstAmount", label: "IGST Amount" },
          { key: "totalTaxAmount", label: "Total Tax" },
          { key: "grandTotal", label: "Grand Total" },
          { key: "baseSubtotal", label: "Base Subtotal (INR)" },
          { key: "baseDiscountAmount", label: "Base Discount (INR)" },
          { key: "baseTaxableAmount", label: "Base Taxable Amount (INR)" },
          { key: "baseTotalTaxAmount", label: "Base Total Tax (INR)" },
          { key: "baseGrandTotal", label: "Base Grand Total (INR)" },
          { key: "notes", label: "Notes" },
          { key: "active", label: "Active" },
          { key: "createdAt", label: "Created Date" },
          { key: "updatedAt", label: "Updated Date" },
        ],
      },

      // =====================================================
      // SALES ORDER DELIVERY
      // =====================================================

      SALES_ORDER_DELIVERY: {
        name: "Sales Order Delivery Report",
        description:
          "Sales order delivery schedule and expected delivery tracking.",

        defaultSortBy: "expectedDeliveryDate",
        defaultSortDirection: "ASC",

        sortFields: [
          { label: "Order Number", value: "orderNo" },
          { label: "Order Date", value: "orderDate" },
          { label: "Expected Delivery Date", value: "expectedDeliveryDate" },
          { label: "Grand Total", value: "grandTotal" },
          { label: "Status", value: "salesOrderStatus" },
        ],

        filters: [
          {
            key: "partyType",
            label: "Party Type",
            type: "SELECT",
            options: [
              { label: "Customer", value: "CUSTOMER" },
              { label: "Party", value: "PARTY" },
            ],
          },
          {
            key: "customerId",
            label: "Customer ID",
            type: "NUMBER",
            min: 1,
            step: 1,
          },
          {
            key: "partyId",
            label: "Party ID",
            type: "NUMBER",
            min: 1,
            step: 1,
          },
          {
            key: "warehouseId",
            label: "Warehouse ID",
            type: "NUMBER",
            min: 1,
            step: 1,
          },
          {
            key: "expectedDeliveryFrom",
            label: "Expected Delivery From",
            type: "DATE",
          },
          {
            key: "expectedDeliveryTo",
            label: "Expected Delivery To",
            type: "DATE",
          },
          {
            key: "salesOrderStatus",
            label: "Sales Order Status",
            type: "TEXT",
            placeholder: "Enter order status",
          },
        ],

        columns: [
          { key: "id", label: "Sales Order ID" },
          { key: "orderNo", label: "Order Number" },
          { key: "partyType", label: "Party Type" },
          { key: "customerId", label: "Customer ID" },
          { key: "customerName", label: "Customer Name" },
          { key: "partyId", label: "Party ID" },
          { key: "partyName", label: "Party Name" },
          { key: "warehouseId", label: "Warehouse ID" },
          { key: "warehouseName", label: "Warehouse" },
          { key: "orderDate", label: "Order Date" },
          { key: "expectedDeliveryDate", label: "Expected Delivery Date" },
          { key: "salesOrderStatus", label: "Status" },
          { key: "grandTotal", label: "Grand Total" },
          { key: "baseGrandTotal", label: "Grand Total (INR)" },
          { key: "notes", label: "Notes" },
        ],
      },
    },
  },
};

/*
 * ============================================================
 * ALL BACKEND REPORT MODULES
 * ============================================================
 */

export const reportModules = [
  { code: "CUSTOMER", name: "Customers" },
  { code: "PARTY", name: "Parties" },
  { code: "CATEGORY", name: "Categories" },
  { code: "SUBCATEGORY", name: "Subcategories" },
  { code: "SIZE", name: "Sizes" },
  { code: "UNIT", name: "Units" },
  { code: "ITEM", name: "Items" },
  { code: "TAX_MASTER", name: "Tax Master" },
  { code: "BANK_ACCOUNT", name: "Bank Accounts" },
  { code: "BANK_TRANSACTION", name: "Bank Transactions" },
  { code: "CASH_ACCOUNT", name: "Cash Accounts" },
  { code: "CASH_TRANSACTION", name: "Cash Transactions" },
  { code: "EXPENSE", name: "Expenses" },
  { code: "INVOICE", name: "Invoices" },
  { code: "SALES_ORDER", name: "Sales Orders" },
  { code: "SALES_PERSON", name: "Sales Persons" },
  { code: "PURCHASE_ORDER", name: "Purchase Orders" },
  {
    code: "PURCHASE_ORDER_GOODS_RECEIPT",
    name: "Purchase Orders Goods Receipt",
  },
  { code: "CREDIT_CLEARANCE", name: "Party Clearances" },
  { code: "WAREHOUSE", name: "Warehouses" },
];

/*
 * ============================================================
 * GET REPORT CONFIGURATION
 * ============================================================
 */

export const getReportBuilderConfig = (module, reportCode) => {
  if (!module || !reportCode) return null;

  return (
    reportModuleConfig?.[module.toUpperCase()]?.reports?.[
      reportCode.toUpperCase()
    ] || null
  );
};

export const getReportFilterDefinitions = (module, reportCode) =>
  getReportBuilderConfig(module, reportCode)?.filters || [];

export const getReportDefaultSort = (module, reportCode) =>
  getReportBuilderConfig(module, reportCode)?.defaultSortBy || "createdAt";

export const getReportSortFields = (module, reportCode) =>
  getReportBuilderConfig(module, reportCode)?.sortFields || [];

export const getReportColumns = (module, reportCode) =>
  getReportBuilderConfig(module, reportCode)?.columns || [];

export const getReportsByModule = (module) =>
  Object.entries(
    reportModuleConfig?.[module?.toUpperCase()]?.reports || {},
  ).map(([code, config]) => ({
    code,
    ...config,
  }));
