import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { createPortal } from "react-dom";

import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { closeModal } from "../../ui/uiSlice";

import DatePicker from "react-datepicker";
import toast from "react-hot-toast";

import {
  Search,
  Settings,
  ScanLine,
  Trash2,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  UploadCloud,
  Mail,
  FileSpreadsheet,
} from "lucide-react";

import {
  setInvoiceField,
  setInvoiceItemField,
  addInvoiceItem,
  removeInvoiceItem,
  resetInvoiceForm,
} from "../slices/invoiceSlice";

import {
  createInvoice,
} from "../thunks/invoiceThunks";

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


/* =========================================================
   EMPTY ITEM
========================================================= */

const createEmptyItem = () => ({
  productId: "",
  description: "",
  unitId: "",
  sizeId: "",
  quantity: 1,
  unitPrice: 0,
  discountAmount: 0,
  taxMasterId: "",
});


/* =========================================================
   COMPONENT
========================================================= */

export default function InvoiceCreate() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const customerDropdownRef = useRef(null);
  const itemDropdownRef = useRef(null);
  const saveMenuRef = useRef(null);

  const [itemDropdownPosition, setItemDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 520,
  });

  const openItemDropdown = (index, element) => {
    const rect = element.getBoundingClientRect();

    setActiveItemId(index);
    setOpenRowItemDropdown(true);

    setItemDropdownPosition({
      top: rect.bottom + 4,
      left: rect.left,
      width: Math.max(rect.width, 520),
    });
  };

  /* =======================================================
     REDUX
  ======================================================= */

  const invoice = useSelector(
    (state) => state.invoice?.invoice || {}
  );

  const invoiceLoading = useSelector(
    (state) => state.invoice?.loading || false
  );

  const modal = useSelector(
    (state) => state.ui?.modal
  );

  const isModal =
    modal?.open &&
    modal?.type === "addInvoice";

  const customers = useSelector(
    (state) => state.customer?.customers || []
  );

  const products = useSelector(
    (state) =>
      state.product?.products ||
      state.product?.content ||
      []
  );

  const units = useSelector(
    (state) =>
      state.unit?.units ||
      state.unit?.content ||
      []
  );

  const sizes = useSelector(
    (state) =>
      state.size?.sizes ||
      state.size?.content ||
      []
  );

  const taxMasters = useSelector(
    (state) =>
      state.taxMaster?.taxMasters ||
      state.taxMaster?.content ||
      []
  );

  /* =======================================================
     LOCAL UI STATE
  ======================================================= */

  const [customerSearch, setCustomerSearch] = useState("");
  const [itemSearch, setItemSearch] = useState("");

  const [openCustomer, setOpenCustomer] = useState(false);
  const [activeItemId, setActiveItemId] = useState(null);
  const [openRowItemDropdown, setOpenRowItemDropdown] =
    useState(false);

  const [showSummary, setShowSummary] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showGateway, setShowGateway] = useState(false);
  const [showSaveMenu, setShowSaveMenu] = useState(false);

  /* =======================================================
     SAFE INVOICE ITEMS
  ======================================================= */

  const invoiceItems = invoice?.invoiceItems || [];

  /* =======================================================
     LOAD MASTER DATA
  ======================================================= */

  useEffect(() => {
    dispatch(
      loadCustomers({
        page: 0,
        size: 100,
        search: "",
        sortBy: "displayName",
        direction: "asc",
      })
    );

    dispatch(fetchAllProducts());
    dispatch(fetchAllUnits());
    dispatch(fetchAllSizes());
    dispatch(fetchAllTaxMasters());

    if (!invoice.invoiceItems?.length) {
      dispatch(setInvoiceField({ field: "invoiceType", value: "SALE_INVOICE" }));
      dispatch(setInvoiceField({ field: "status", value: "DRAFT" }));
      dispatch(setInvoiceField({ field: "shippingAmount", value: 0 }));
      dispatch(setInvoiceField({ field: "invoiceItems", value: [createEmptyItem()] }));
    }
  }, [dispatch]);

  /* =======================================================
     RESET LOCAL UI STATE
  ======================================================= */

  const resetLocalState = () => {
    setCustomerSearch("");
    setItemSearch("");
    setOpenCustomer(false);
    setOpenRowItemDropdown(false);
    setActiveItemId(null);
    setShowSummary(false);
    setShowTerms(false);
    setShowGateway(false);
    setShowSaveMenu(false);
  };

  /* =======================================================
     ESCAPE
  ======================================================= */

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  /* =======================================================
     CLICK OUTSIDE
  ======================================================= */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        customerDropdownRef.current &&
        !customerDropdownRef.current.contains(event.target)
      ) {
        setOpenCustomer(false);
      }

      if (
        itemDropdownRef.current &&
        !itemDropdownRef.current.contains(event.target)
      ) {
        setOpenRowItemDropdown(false);
        setActiveItemId(null);
      }

      if (
        saveMenuRef.current &&
        !saveMenuRef.current.contains(event.target)
      ) {
        setShowSaveMenu(false);
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

  /* =======================================================
     CLOSE
  ======================================================= */

  const handleClose = () => {
    dispatch(resetInvoiceForm());
    resetLocalState();

    if (isModal) {
      dispatch(closeModal());
      return;
    }

    navigate("/invoices");
  };

  /* =======================================================
     CUSTOMER SEARCH
  ======================================================= */

  const filteredCustomers = useMemo(() => {
    const search = (
      customerSearch ||
      ""
    ).toLowerCase();

    return (customers || []).filter((customer) => {
      const name =
        customer.customerName ||
        customer.displayName ||
        customer.name ||
        "";

      const email =
        customer.email ||
        "";

      const phone =
        customer.phoneNumber ||
        customer.mobileNumber ||
        customer.phone ||
        "";

      return (
        name.toLowerCase().includes(search) ||
        email.toLowerCase().includes(search) ||
        phone.toLowerCase().includes(search)
      );
    });
  }, [
    customers,
    customerSearch,
  ]);

  /* =======================================================
     PRODUCT SEARCH
  ======================================================= */

  const filteredProducts = useMemo(() => {
    const search = (
      itemSearch ||
      ""
    ).toLowerCase();

    return (products || []).filter((product) => {
      const name =
        product.productName ||
        product.itemName ||
        product.name ||
        "";

      const sku =
        product.sku ||
        "";

      return (
        name.toLowerCase().includes(search) ||
        sku.toLowerCase().includes(search)
      );
    });
  }, [
    products,
    itemSearch,
  ]);

  /* =======================================================
     FORMAT
  ======================================================= */

  const fmt = (value) =>
    Number(value || 0).toFixed(2);

  /* =======================================================
     TAX RATE
  ======================================================= */

  const getTaxRate = (taxMasterId) => {
    if (!taxMasterId) {
      return 0;
    }

    const tax = taxMasters.find(
      (item) =>
        String(item.id) ===
        String(taxMasterId)
    );

    if (!tax) {
      return 0;
    }

    return Number(
      tax.taxPercentage ??
      tax.taxRate ??
      tax.rate ??
      tax.percentage ??
      0
    );
  };

  /* =======================================================
     ITEM CALCULATION
  ======================================================= */

  const getItemAmount = (item) => {
    const quantity =
      Number(item.quantity || 0);

    const unitPrice =
      Number(item.unitPrice || 0);

    const discount =
      Number(item.discountAmount || 0);

    return Math.max(
      quantity * unitPrice - discount,
      0
    );
  };

  const getItemTax = (item) => {
    const amount =
      getItemAmount(item);

    const taxRate =
      getTaxRate(item.taxMasterId);

    return (
      amount *
      taxRate /
      100
    );
  };

  /* =======================================================
     TOTALS
  ======================================================= */

  const totals = useMemo(() => {
    let subtotal = 0;
    let discount = 0;
    let tax = 0;

    invoiceItems.forEach((item) => {
      subtotal +=
        Number(item.quantity || 0) *
        Number(item.unitPrice || 0);

      discount +=
        Number(item.discountAmount || 0);

      tax += getItemTax(item);
    });

    const shipping =
      Number(
        invoice.shippingAmount || 0
      );

    const grandTotal =
      subtotal -
      discount +
      tax +
      shipping;

    return {
      subtotal,
      discount,
      tax,
      shipping,
      grandTotal,
    };
  }, [
    invoiceItems,
    invoice.shippingAmount,
    taxMasters,
  ]);

  /* =======================================================
     CUSTOMER SELECT
  ======================================================= */

  const handleCustomerSelect = (customer) => {
    const customerName =
      customer.customerName ||
      customer.displayName ||
      customer.name ||
      "";

    dispatch(
      setInvoiceField({
        field: "customerId",
        value: customer.id,
      })
    );

    dispatch(
      setInvoiceField({
        field: "customerName",
        value: customerName,
      })
    );

    setCustomerSearch(customerName);
    setOpenCustomer(false);
  };

  /* =======================================================
     INVOICE FIELD
  ======================================================= */

  const handleInvoiceFieldChange =
    (field) => (event) => {
      dispatch(
        setInvoiceField({
          field,
          value: event.target.value,
        })
      );
    };

  /* =======================================================
     DATE
  ======================================================= */

  const handleInvoiceDateChange = (date) => {
    if (!date) {
      dispatch(
        setInvoiceField({
          field: "invoiceDate",
          value: "",
        })
      );
      return;
    }

    const value =
      date.toISOString().split("T")[0];

    dispatch(
      setInvoiceField({
        field: "invoiceDate",
        value,
      })
    );
  };

  const handleDueDateChange = (date) => {
    if (!date) {
      dispatch(
        setInvoiceField({
          field: "dueDate",
          value: "",
        })
      );
      return;
    }

    const value =
      date.toISOString().split("T")[0];

    dispatch(
      setInvoiceField({
        field: "dueDate",
        value,
      })
    );
  };

  /* =======================================================
     TERMS
  ======================================================= */

  const handleTermsChange = (value) => {
    dispatch(
      setInvoiceField({
        field: "termsAndConditions",
        value,
      })
    );

    if (!invoice.invoiceDate) {
      return;
    }

    const invoiceDate =
      new Date(invoice.invoiceDate);

    if (value === "Net 15") {
      invoiceDate.setDate(
        invoiceDate.getDate() + 15
      );
    }

    if (value === "Net 30") {
      invoiceDate.setDate(
        invoiceDate.getDate() + 30
      );
    }

    if (
      value === "Due on Receipt"
    ) {
      dispatch(
        setInvoiceField({
          field: "dueDate",
          value: invoice.invoiceDate,
        })
      );

      return;
    }

    dispatch(
      setInvoiceField({
        field: "dueDate",
        value:
          invoiceDate
            .toISOString()
            .split("T")[0],
      })
    );
  };

  /* =======================================================
     ITEM FIELD
  ======================================================= */

  const updateItem = (
    index,
    field,
    value
  ) => {
    dispatch(
      setInvoiceItemField({
        index,
        field,
        value,
      })
    );
  };

  /* =======================================================
     ADD ITEM
  ======================================================= */

  const handleAddItem = () => {
    dispatch(
      addInvoiceItem(
        createEmptyItem()
      )
    );
  };

  /* =======================================================
     REMOVE ITEM
  ======================================================= */

  const handleRemoveItem = (index) => {
    if (invoiceItems.length <= 1) {
      return;
    }

    dispatch(
      removeInvoiceItem(index)
    );
  };

  /* =======================================================
     PRODUCT SELECT
  ======================================================= */

  const handleProductSelect = (
    index,
    product
  ) => {
    const productName =
      product.productName ||
      product.itemName ||
      product.name ||
      "";

    const sellingPrice =
      product.sellingPrice ??
      product.rate ??
      product.price ??
      0;

    updateItem(
      index,
      "productId",
      product.id
    );

    updateItem(
      index,
      "description",
      productName
    );

    updateItem(
      index,
      "unitPrice",
      Number(sellingPrice)
    );

    /*
     * Auto-fill defaults when product
     * contains these values.
     */
    if (product.unitId) {
      updateItem(
        index,
        "unitId",
        product.unitId
      );
    }

    if (product.sizeId) {
      updateItem(
        index,
        "sizeId",
        product.sizeId
      );
    }

    if (product.taxId) {
      updateItem(
        index,
        "taxMasterId",
        product.taxId
      );
    }

    setItemSearch("");
    setOpenRowItemDropdown(false);
    setActiveItemId(null);

    /*
     * Automatically create next row
     * when selecting the last row.
     */
    if (
      index ===
      invoiceItems.length - 1
    ) {
      dispatch(
        addInvoiceItem(
          createEmptyItem()
        )
      );
    }
  };

  /* =======================================================
     VALIDATION
  ======================================================= */

  const validateInvoice = () => {
    if (!invoice.customerId) {
      toast.error(
        "Please select a customer"
      );
      return false;
    }

    if (!invoice.invoiceDate) {
      toast.error(
        "Please select invoice date"
      );
      return false;
    }

    if (
      !invoice.invoiceType
    ) {
      toast.error(
        "Please select invoice type"
      );
      return false;
    }

    const validItems =
      invoiceItems.filter(
        (item) =>
          item.productId ||
          item.description
      );

    if (!validItems.length) {
      toast.error(
        "Please add at least one item"
      );
      return false;
    }

    for (
      let index = 0;
      index < validItems.length;
      index++
    ) {
      const item =
        validItems[index];

      if (!item.productId) {
        toast.error(
          `Please select product for item ${index + 1}`
        );
        return false;
      }

      if (
        !item.description?.trim()
      ) {
        toast.error(
          `Please enter description for item ${index + 1}`
        );
        return false;
      }

      if (
        Number(item.quantity) <= 0
      ) {
        toast.error(
          `Quantity must be greater than zero for item ${index + 1}`
        );
        return false;
      }

      if (
        Number(item.unitPrice) < 0
      ) {
        toast.error(
          `Unit price cannot be negative for item ${index + 1}`
        );
        return false;
      }

      if (!item.unitId) {
        toast.error(
          `Please select unit for item ${index + 1}`
        );
        return false;
      }

      if (!item.sizeId) {
        toast.error(
          `Please select size for item ${index + 1}`
        );
        return false;
      }

      if (!item.taxMasterId) {
        toast.error(
          `Please select tax for item ${index + 1}`
        );
        return false;
      }
    }

    return true;
  };

  /* =======================================================
     SAVE
  ======================================================= */

  const buildInvoicePayload = (status = "DRAFT") => {
    const validItems = invoiceItems.filter(
      (item) => item.productId || item.description
    );

    return {
      invoiceNumber: invoice.invoiceNumber || null,
      invoiceType: invoice.invoiceType || "SALE_INVOICE",
      status,
      customerId: Number(invoice.customerId),
      invoiceDate: invoice.invoiceDate,
      dueDate: invoice.dueDate || null,
      shippingAmount: Number(invoice.shippingAmount || 0),
      notes: invoice.notes?.trim() || "",
      termsAndConditions: invoice.termsAndConditions?.trim() || "",
      invoiceItems: validItems.map((item) => ({
        productId: Number(item.productId),
        description: item.description?.trim() || "",
        unitId: Number(item.unitId),
        sizeId: Number(item.sizeId),
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice || 0),
        discountAmount: Number(item.discountAmount || 0),
        taxMasterId: Number(item.taxMasterId),
      })),
    };
  };

  const saveInvoice = async (status, successMessage) => {
    if (!validateInvoice()) return;

    try {
      await dispatch(
        createInvoice(buildInvoicePayload(status))
      ).unwrap();

      toast.success(successMessage);
      dispatch(resetInvoiceForm());
      resetLocalState();
      navigate(`/invoices?status=${status}`);
    } catch (error) {
      toast.error(
        error?.message ||
        error?.payload?.message ||
        error ||
        "Failed to create invoice"
      );
    }
  };

  const handleSave = async () => {
    await saveInvoice("SENT", "Invoice created successfully");
  };

  const handleSaveDraft = async () => {
    await saveInvoice("DRAFT", "Invoice draft saved successfully");
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div

    >
      <div
        className={
          isModal
            ? "flex w-full max-w-7xl max-h-[92vh] flex-col overflow-hidden rounded-lg bg-gray-50 shadow-2xl"
            : "flex-1 flex flex-col min-h-0 overflow-hidden"
        }
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="px-6 py-4 bg-white border-b border-gray-200 shrink-0">
          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div className="w-7 h-7 border-2 border-gray-400 rounded-sm flex items-center justify-center">
                <div className="w-3 h-3 border border-gray-400 rounded-sm" />
              </div>

              <h1 className="text-lg font-semibold text-gray-800">
                New Invoice
              </h1>

            </div>

            <div className="flex items-center gap-4">

              <button
                type="button"
                className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700"
              >
                <Settings size={15} />
                Customize invoice
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>

            </div>
          </div>
        </div>

        {/* =================================================
            BODY
        ================================================= */}

        <div className="flex-1 overflow-y-auto px-5 py-4">

          {/* =================================================
              CUSTOMER
          ================================================= */}

          <div className="mb-6">

            <div className="flex items-center">

              <label className="w-44 text-sm font-medium text-red-500 shrink-0">
                Customer Name*
              </label>

              <div
                ref={customerDropdownRef}
                className="relative w-[550px]"
              >

                <input
                  type="text"
                  value={
                    customerSearch ||
                    invoice.customerName ||
                    ""
                  }
                  placeholder="Select or add a customer"
                  onClick={() =>
                    setOpenCustomer(
                      !openCustomer
                    )
                  }
                  onChange={(event) => {
                    setCustomerSearch(
                      event.target.value
                    );
                    setOpenCustomer(true);
                  }}
                  className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white focus:outline-none"
                />

                <ChevronDown
                  size={14}
                  className="absolute right-3 top-3 text-gray-400"
                />

                {openCustomer && (
                  <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-xl z-[100]">

                    <div className="p-2 border-b border-gray-200">

                      <div className="relative">

                        <Search
                          size={16}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                          type="text"
                          autoFocus
                          placeholder="Search customer"
                          value={customerSearch}
                          onChange={(event) =>
                            setCustomerSearch(
                              event.target.value
                            )
                          }
                          className="w-full border border-blue-300 rounded pl-10 pr-3 py-2 text-sm focus:outline-none"
                        />

                      </div>

                    </div>

                    <div className="max-h-60 overflow-y-auto">

                      {filteredCustomers.length === 0 ? (
                        <div className="px-4 py-5 text-center text-gray-400">
                          No customers found
                        </div>
                      ) : (
                        filteredCustomers.map(
                          (customer) => {

                            const name =
                              customer.customerName ||
                              customer.displayName ||
                              customer.name ||
                              "";

                            return (
                              <button
                                type="button"
                                key={customer.id}
                                onClick={() =>
                                  handleCustomerSelect(
                                    customer
                                  )
                                }
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-500 hover:text-white text-left"
                              >

                                <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center font-medium shrink-0">
                                  {name
                                    ?.charAt(0)
                                    ?.toUpperCase()}
                                </div>

                                <div className="min-w-0">

                                  <p className="font-medium truncate">
                                    {name}
                                  </p>

                                  <p className="text-xs opacity-70 truncate">
                                    {customer.email ||
                                      customer.phoneNumber ||
                                      customer.mobileNumber ||
                                      ""}
                                  </p>

                                </div>

                              </button>
                            );
                          }
                        )
                      )}

                    </div>

                    <button
                      type="button"
                      className="w-full flex items-center gap-3 px-4 py-3 border-t border-gray-200 text-blue-600 hover:bg-blue-50"
                    >

                      <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center">
                        <Plus size={14} />
                      </div>

                      <span className="font-medium">
                        New Customer
                      </span>

                    </button>

                  </div>
                )}

              </div>

            </div>

          </div>

          {/* =================================================
              INVOICE NUMBER
          ================================================= */}

          <div className="flex items-center mb-4">

            <label className="w-44 text-sm font-medium text-gray-700 shrink-0">
              Invoice Number
            </label>

            <div className="relative w-[330px]">

              <input
                value={
                  invoice.invoiceNumber ||
                  ""
                }
                onChange={handleInvoiceFieldChange(
                  "invoiceNumber"
                )}
                placeholder="Invoice number"
                className="w-full border border-gray-300 rounded px-3 py-2 pr-8 focus:outline-none focus:border-blue-400"
              />

              <Settings
                size={14}
                className="absolute right-3 top-3 text-blue-500"
              />

            </div>

          </div>

          {/* =================================================
              INVOICE TYPE
          ================================================= */}

          <div className="flex items-center mb-4">

            <label className="w-44 text-sm font-medium text-gray-700 shrink-0">
              Invoice Type
            </label>

            <select
              value={
                invoice.invoiceType ||
                "SALE_INVOICE"
              }
              onChange={handleInvoiceFieldChange(
                "invoiceType"
              )}
              className="w-[330px] border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:border-blue-400"
            >
              <option value="SALE_INVOICE">
                Sale Invoice
              </option>

              <option value="SALE">
                Sale
              </option>
            </select>

          </div>

          {/* =================================================
              DATE / TERMS / DUE DATE
          ================================================= */}

          <div className="flex items-center mb-6">

            <label className="w-44 text-sm font-medium text-gray-700 shrink-0">
              Invoice Date*
            </label>

            <DatePicker
              selected={
                invoice.invoiceDate
                  ? new Date(
                    invoice.invoiceDate
                  )
                  : null
              }
              onChange={
                handleInvoiceDateChange
              }
              dateFormat="dd/MM/yyyy"
              placeholderText="Select date"
              className="w-[220px] border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400"
            />

            <div className="flex items-center ml-8 gap-3">

              <label className="text-sm text-gray-700">
                Terms
              </label>

              <select
                value={
                  invoice.termsAndConditions ||
                  "Due on Receipt"
                }
                onChange={(event) =>
                  handleTermsChange(
                    event.target.value
                  )
                }
                className="w-[150px] border border-gray-300 rounded px-3 py-2 bg-white"
              >
                <option value="Due on Receipt">
                  Due on Receipt
                </option>

                <option value="Net 15">
                  Net 15
                </option>

                <option value="Net 30">
                  Net 30
                </option>
              </select>

            </div>

            <div className="flex items-center ml-8 gap-3">

              <label className="text-sm text-gray-700">
                Due Date
              </label>

              <DatePicker
                selected={
                  invoice.dueDate
                    ? new Date(
                      invoice.dueDate
                    )
                    : null
                }
                onChange={
                  handleDueDateChange
                }
                dateFormat="dd/MM/yyyy"
                placeholderText="Due date"
                className="w-[150px] border border-gray-300 rounded px-3 py-2"
              />

            </div>

          </div>

          {/* =================================================
            ITEM TABLE
        ================================================= */}

          <div className="border border-gray-200 rounded-lg mb-4 bg-white overflow-visible">

            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">

              <h3 className="text-sm font-semibold text-gray-700">
                Item Table
              </h3>

              <button
                type="button"
                className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700"
              >
                <ScanLine size={15} />
                Scan Item
              </button>

            </div>

            <div className="overflow-x-auto overflow-y-visible">

              <table className="w-full min-w-[1250px]">

                <thead>

                  <tr className="bg-gray-50 border-b border-gray-200">

                    <th className="w-8 px-2 py-2" />

                    <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                      Item Details
                    </th>

                    <th className="text-center px-3 py-2 text-xs font-semibold text-gray-500 uppercase w-28">
                      Unit
                    </th>

                    <th className="text-center px-3 py-2 text-xs font-semibold text-gray-500 uppercase w-28">
                      Size
                    </th>

                    <th className="text-center px-3 py-2 text-xs font-semibold text-gray-500 uppercase w-32">
                      Tax
                    </th>

                    <th className="text-right px-3 py-2 text-xs font-semibold text-gray-500 uppercase w-24">
                      Quantity
                    </th>

                    <th className="text-right px-3 py-2 text-xs font-semibold text-gray-500 uppercase w-32">
                      Rate
                    </th>

                    <th className="text-right px-3 py-2 text-xs font-semibold text-gray-500 uppercase w-28">
                      Amount
                    </th>

                    <th className="w-8" />

                  </tr>

                </thead>

                <tbody>

                  {invoiceItems.map((item, index) => {

                    const amount = getItemAmount(item);

                    return (
                      <tr
                        key={`invoice-item-${index}`}
                        className="border-b border-gray-100 hover:bg-gray-50 group"
                      >

                        {/* DRAG */}

                        <td className="px-2 py-3 text-gray-300">
                          <div className="text-lg">
                            ⋮⋮
                          </div>
                        </td>


                        {/* =================================================
                  ITEM DETAILS
              ================================================= */}

                        <td className="px-3 py-3 relative overflow-visible">
                          <div className="relative">

                            <input
                              value={item.description || ""}
                              placeholder="Type or click to select an item"
                              onClick={(event) => {
                                openItemDropdown(
                                  index,
                                  event.currentTarget
                                );
                              }}
                              onChange={(event) => {
                                updateItem(
                                  index,
                                  "description",
                                  event.target.value
                                );

                                setItemSearch(event.target.value);

                                openItemDropdown(
                                  index,
                                  event.currentTarget
                                );
                              }}
                              className="w-full text-sm text-gray-700 border border-gray-200 rounded px-3 py-2 focus:outline-none focus:border-blue-400"
                            />



                          </div>
                        </td>


                        {/* =================================================
                  UNIT
              ================================================= */}

                        <td className="px-3 py-3">

                          <select
                            value={item.unitId || ""}
                            onChange={(event) =>
                              updateItem(
                                index,
                                "unitId",
                                event.target.value
                              )
                            }
                            className="w-full border border-gray-200 rounded px-2 py-2 text-sm bg-white focus:outline-none focus:border-blue-400"
                          >

                            <option value="">
                              Select
                            </option>

                            {units.map((unit) => (
                              <option
                                key={unit.id}
                                value={unit.id}
                              >
                                {unit.unitName ||
                                  unit.name ||
                                  unit.unitCode}
                              </option>
                            ))}

                          </select>

                        </td>


                        {/* =================================================
                  SIZE
              ================================================= */}

                        <td className="px-3 py-3">

                          <select
                            value={item.sizeId || ""}
                            onChange={(event) =>
                              updateItem(
                                index,
                                "sizeId",
                                event.target.value
                              )
                            }
                            className="w-full border border-gray-200 rounded px-2 py-2 text-sm bg-white focus:outline-none focus:border-blue-400"
                          >

                            <option value="">
                              Select
                            </option>

                            {sizes.map((size) => (
                              <option
                                key={size.id}
                                value={size.id}
                              >
                                {size.sizeName ||
                                  size.name ||
                                  size.sizeCode}
                              </option>
                            ))}

                          </select>

                        </td>


                        {/* =================================================
                  TAX
              ================================================= */}

                        <td className="px-3 py-3">

                          <select
                            value={item.taxMasterId || ""}
                            onChange={(event) =>
                              updateItem(
                                index,
                                "taxMasterId",
                                event.target.value
                              )
                            }
                            className="w-full border border-gray-200 rounded px-2 py-2 text-sm bg-white focus:outline-none focus:border-blue-400"
                          >

                            <option value="">
                              Select
                            </option>

                            {taxMasters.map((tax) => {

                              const rate =
                                tax.taxPercentage ??
                                tax.taxRate ??
                                tax.rate ??
                                tax.percentage ??
                                0;

                              return (
                                <option
                                  key={tax.id}
                                  value={tax.id}
                                >
                                  {tax.taxName ||
                                    tax.name ||
                                    tax.taxType ||
                                    "Tax"}{" "}
                                  ({rate}%)
                                </option>
                              );

                            })}

                          </select>

                        </td>


                        {/* =================================================
                  QUANTITY
              ================================================= */}

                        <td className="px-3 py-3">

                          <input
                            type="number"
                            min="0"
                            step="0.001"
                            value={item.quantity ?? 0}
                            onChange={(event) =>
                              updateItem(
                                index,
                                "quantity",
                                Number(event.target.value)
                              )
                            }
                            className="w-full text-right text-sm border-b border-transparent focus:border-blue-400 focus:outline-none bg-transparent"
                          />

                        </td>


                        {/* =================================================
                  RATE
              ================================================= */}

                        <td className="px-3 py-3">

                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice ?? 0}
                            onChange={(event) =>
                              updateItem(
                                index,
                                "unitPrice",
                                Number(event.target.value)
                              )
                            }
                            className="w-full text-right text-sm border-b border-transparent focus:border-blue-400 focus:outline-none bg-transparent"
                          />

                        </td>


                        {/* =================================================
                  AMOUNT
              ================================================= */}

                        <td className="px-3 py-3 text-right text-sm font-semibold text-gray-800">

                          ₹{fmt(amount)}

                        </td>


                        {/* =================================================
                  DELETE
              ================================================= */}

                        <td className="px-2 py-3">

                          {invoiceItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveItem(index)
                              }
                              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}

                        </td>

                      </tr>
                    );

                  })}

                </tbody>

              </table>
              {openRowItemDropdown &&
                activeItemId !== null &&
                createPortal(
                  <div
                    ref={itemDropdownRef}
                    style={{
                      position: "fixed",
                      top: itemDropdownPosition.top,
                      left: itemDropdownPosition.left,
                      width: itemDropdownPosition.width,
                      zIndex: 999999,
                    }}
                    className="bg-white border border-gray-200 rounded-lg shadow-2xl overflow-hidden"
                  >

                    {/* SEARCH */}

                    <div className="p-2 border-b border-gray-200">

                      <div className="relative">

                        <Search
                          size={15}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                          autoFocus
                          value={itemSearch}
                          onChange={(event) =>
                            setItemSearch(event.target.value)
                          }
                          placeholder="Search product"
                          className="
              w-full
              border
              border-blue-300
              rounded
              pl-9
              pr-3
              py-2
              text-sm
              focus:outline-none
            "
                        />

                      </div>

                    </div>


                    {/* PRODUCTS */}

                    <div className="max-h-60 overflow-y-auto p-1">

                      {filteredProducts.length === 0 ? (

                        <div className="px-4 py-5 text-center text-gray-400">
                          No products found
                        </div>

                      ) : (

                        filteredProducts.map((product) => {

                          const name =
                            product.productName ||
                            product.itemName ||
                            product.name ||
                            "";

                          const price =
                            product.sellingPrice ??
                            product.rate ??
                            product.price ??
                            0;

                          return (
                            <button
                              type="button"
                              key={product.id}
                              onClick={() => {

                                handleProductSelect(
                                  activeItemId,
                                  product
                                );

                                setOpenRowItemDropdown(false);
                              }}
                              className="
                  w-full
                  text-left
                  rounded-md
                  px-3
                  py-3
                  hover:bg-blue-500
                  hover:text-white
                "
                            >

                              <div className="font-semibold">
                                {name}
                              </div>

                              <div className="text-xs opacity-70">

                                {product.sku || ""}

                                {product.sku && " • "}

                                Rate: ₹{fmt(price)}

                              </div>

                            </button>
                          );

                        })

                      )}

                    </div>


                    {/* ADD PRODUCT */}

                    <button
                      type="button"
                      className="
          w-full
          border-t
          border-gray-200
          px-4
          py-3
          flex
          items-center
          gap-2
          text-blue-600
          hover:bg-blue-50
        "
                    >
                      <Plus size={15} />
                      Add New Product
                    </button>

                  </div>,
                  document.body
                )}
            </div>

          </div>

          {/* =================================================
              ADD ROW
          ================================================= */}

          <div className="flex items-center gap-3 mb-6">

            <button
              type="button"
              onClick={handleAddItem}
              className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-400 px-3 py-1.5 rounded"
            >
              <Plus size={14} />
              Add New Row
            </button>

            <button
              type="button"
              className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-400 px-3 py-1.5 rounded"
            >
              <Plus size={14} />
              Add Items in Bulk
            </button>

          </div>

          {/* =================================================
              NOTES + TOTAL
          ================================================= */}

          <div className="flex gap-12 mb-6">

            {/* NOTES */}

            <div className="flex-1 max-w-sm">

              <label className="text-sm font-medium text-gray-700 block mb-2">
                Customer Notes
              </label>

              <textarea
                value={
                  invoice.notes || ""
                }
                onChange={(event) =>
                  dispatch(
                    setInvoiceField({
                      field: "notes",
                      value:
                        event.target.value,
                    })
                  )
                }
                rows={3}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400 resize-none"
              />

              <p className="text-xs text-gray-400 mt-1">
                Will be displayed on the invoice
              </p>

            </div>

            {/* TOTAL */}

            <div className="flex-1 max-w-sm ml-auto">

              <div className="flex justify-between items-center py-3">

                <span className="text-sm font-semibold text-gray-700">
                  Total (₹)
                </span>

                <span className="text-sm font-semibold text-gray-700">
                  ₹{fmt(
                    totals.grandTotal
                  )}
                </span>

              </div>

              <button
                type="button"
                onClick={() =>
                  setShowSummary(
                    !showSummary
                  )
                }
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 w-full justify-end"
              >
                Total Summary

                <ChevronDown
                  size={14}
                  className={`transition - transform ${showSummary
                    ? "rotate-180"
                    : ""
                    } `}
                />
              </button>

              {showSummary && (
                <div className="mt-2 text-sm text-gray-600 space-y-2 border-t pt-2">

                  <div className="flex justify-between">
                    <span>
                      Sub Total
                    </span>

                    <span>
                      ₹{fmt(
                        totals.subtotal
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>
                      Discount
                    </span>

                    <span>
                      ₹{fmt(
                        totals.discount
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>
                      Tax
                    </span>

                    <span>
                      ₹{fmt(
                        totals.tax
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>
                      Shipping
                    </span>

                    <span>
                      ₹{fmt(
                        totals.shipping
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span>
                      Grand Total
                    </span>

                    <span>
                      ₹{fmt(
                        totals.grandTotal
                      )}
                    </span>
                  </div>

                </div>
              )}

            </div>

          </div>

          {/* =================================================
              TERMS
          ================================================= */}

          <div className="space-y-3 mb-8">

            {!showTerms ? (
              <button
                type="button"
                onClick={() =>
                  setShowTerms(true)
                }
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
              >
                <div className="w-5 h-5 rounded-full border-2 border-blue-500 flex items-center justify-center">
                  <Plus size={12} />
                </div>

                Add Terms and conditions
              </button>
            ) : (
              <div>

                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Terms and Conditions
                </label>

                <textarea
                  rows={3}
                  value={
                    invoice.termsAndConditions ||
                    ""
                  }
                  onChange={(event) =>
                    dispatch(
                      setInvoiceField({
                        field:
                          "termsAndConditions",
                        value:
                          event.target.value,
                      })
                    )
                  }
                  className="w-full max-w-sm border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400 resize-none"
                />

              </div>
            )}

            <button
              type="button"
              onClick={() =>
                setShowGateway(
                  !showGateway
                )
              }
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
            >
              <div className="w-5 h-5 rounded-full border-2 border-blue-500 flex items-center justify-center">
                <Plus size={12} />
              </div>

              Add Payment Gateway
            </button>

            {showGateway && (
              <div className="text-sm text-gray-500 pl-7">
                Payment gateway configuration
                can be added here.
              </div>
            )}

          </div>

        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="border-t border-gray-200 bg-white px-6 py-4 flex items-center gap-3 z-30 shrink-0">

          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={invoiceLoading}
            className="border border-gray-300 text-gray-700 text-sm px-5 py-2 rounded hover:bg-gray-100 font-medium disabled:opacity-50"
          >
            Save as Draft
          </button>

          <div
            ref={saveMenuRef}
            className="relative flex items-center"
          >

            <button
              type="button"
              onClick={handleSave}
              disabled={invoiceLoading}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 h-10 rounded-l font-medium"
            >
              {invoiceLoading
                ? "Saving..."
                : "Save and Send"}
            </button>

            <button
              type="button"
              onClick={() =>
                setShowSaveMenu(
                  !showSaveMenu
                )
              }
              className="bg-blue-500 hover:bg-blue-600 text-white w-9 h-10 rounded-r border-l border-blue-400 flex items-center justify-center"
            >
              <ChevronUp
                size={12}
              />
            </button>

            {showSaveMenu && (
              <div className="absolute bottom-full mb-2 right-0 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-[9999] overflow-hidden">

                <button
                  type="button"
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-500 hover:text-white text-left"
                >
                  <FileSpreadsheet
                    size={16}
                  />
                  Save and Print
                </button>

                <button
                  type="button"
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-500 hover:text-white text-left"
                >
                  <UploadCloud
                    size={16}
                  />
                  Save and Share
                </button>

                <button
                  type="button"
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-500 hover:text-white text-left"
                >
                  <Mail size={16} />
                  Save and Send Later
                </button>

              </div>
            )}

          </div>

          <button
            type="button"
            onClick={handleClose}
            className="border border-gray-300 text-gray-700 text-sm px-5 py-2 rounded hover:bg-gray-100 font-medium"
          >
            Cancel
          </button>

        </div>

      </div>
    </div>
  );
}





