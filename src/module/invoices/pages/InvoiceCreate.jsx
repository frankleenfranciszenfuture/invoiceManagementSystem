import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { createPortal } from "react-dom";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  openModal,
  closeModal,
} from "../../ui/uiSlice";

import DatePicker from "react-datepicker";
import toast from "react-hot-toast";

import {
  Search,
  Settings,
  ScanLine,
  Trash2,
  ChevronDown,
  ChevronUp,
  ChevronRight,
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
  editInvoice,
  fetchInvoiceById,
  fetchGeneratedInvoiceNumber,
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
   SAFE ARRAY HELPER
========================================================= */

const getArray = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (Array.isArray(value?.content)) {
    return value.content;
  }

  if (Array.isArray(value?.data?.content)) {
    return value.data.content;
  }

  if (Array.isArray(value?.data)) {
    return value.data;
  }

  return [];
};


/* =========================================================
   COMPONENT
========================================================= */

export default function InvoiceCreate() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { id } = useParams();


  /* =======================================================
     REFS
  ======================================================= */

  const customerDropdownRef = useRef(null);
  const itemDropdownRef = useRef(null);
  const saveMenuRef = useRef(null);


  /* =======================================================
     MODAL / ADD / EDIT MODE
  ======================================================= */

  const modal = useSelector(
    (state) => state.ui?.modal
  );

  const isAddModal =
    modal?.open === true &&
    modal?.type === "addInvoice";

  const isEditModal =
    modal?.open === true &&
    modal?.type === "editInvoice";

  const isModal =
    isAddModal ||
    isEditModal;


  /* =======================================================
     EDIT ID
  ======================================================= */

  const editInvoiceId = isEditModal
    ? modal?.data?.id ?? null
    : !isModal
      ? id ?? null
      : null;


  /* =======================================================
     MODES
  ======================================================= */

  const isEdit =
    isEditModal ||
    (!isModal && Boolean(id));

  const isAdd =
    isAddModal ||
    (!isModal && !id);
  // /* =======================================================
  //    MODAL MODE
  // ======================================================= */

  // const isModal =
  //   isAddModal ||
  //   isEditModal;


  /* =======================================================
     ITEM DROPDOWN POSITION
  ======================================================= */

  const [
    itemDropdownPosition,
    setItemDropdownPosition,
  ] = useState({
    top: 0,
    left: 0,
    width: 520,
  });


  /* =======================================================
     LOCAL STATE
  ======================================================= */

  const [
    showCustomerDetails,
    setShowCustomerDetails,
  ] = useState(false);

  const [
    customerSearch,
    setCustomerSearch,
  ] = useState("");

  const [
    itemSearch,
    setItemSearch,
  ] = useState("");

  const [
    openCustomer,
    setOpenCustomer,
  ] = useState(false);

  const [
    activeItemId,
    setActiveItemId,
  ] = useState(null);

  const [
    openRowItemDropdown,
    setOpenRowItemDropdown,
  ] = useState(false);

  const [
    showSummary,
    setShowSummary,
  ] = useState(true);

  const [
    showTerms,
    setShowTerms,
  ] = useState(false);

  const [
    showGateway,
    setShowGateway,
  ] = useState(false);

  const [
    showSaveMenu,
    setShowSaveMenu,
  ] = useState(false);

  const [
    discountMode,
    setDiscountMode,
  ] = useState("COMMON");


  /* =======================================================
     INVOICE REDUX
  ======================================================= */

  const invoice = useSelector(
    (state) =>
      state.invoice?.invoice || {}
  );

  const invoiceLoading = useSelector(
    (state) =>
      state.invoice?.loading || false
  );


  /* =======================================================
     CUSTOMER REDUX
  ======================================================= */

  const customerState = useSelector(
    (state) =>
      state.customers
  );

  const customers =
    Array.isArray(
      customerState?.customers
    )
      ? customerState.customers
      : [];

  const customerLoading =
    customerState?.loading ?? false;

  const customerError =
    customerState?.error ?? null;


  /* =======================================================
     SELECTED CUSTOMER
  ======================================================= */

  const selectedCustomer = useMemo(() => {
    if (!invoice?.customerId) {
      return null;
    }

    return (
      customers.find(
        (customer) =>
          String(customer?.id) ===
          String(invoice.customerId)
      ) || null
    );
  }, [
    customers,
    invoice?.customerId,
  ]);


  /* =======================================================
     FORMAT ADDRESS
  ======================================================= */

  const formatAddress = (addr) =>
    !addr
      ? ""
      : typeof addr === "string"
        ? addr
        : [
          addr.addressLine1,
          addr.addressLine2,
          addr.city,
          addr.state,
          addr.pincode,
        ]
          .filter(Boolean)
          .join(", ");


  /* =======================================================
     PRODUCTS
  ======================================================= */

  const products = useSelector(
    (state) =>
      getArray(
        state.product?.products ||
        state.product?.content ||
        state.product
      )
  );


  /* =======================================================
     UNITS
  ======================================================= */

  const units = useSelector(
    (state) =>
      getArray(
        state.unit?.units ||
        state.unit?.content ||
        state.unit
      )
  );


  /* =======================================================
     SIZES
  ======================================================= */

  const sizes = useSelector(
    (state) =>
      getArray(
        state.size?.sizes ||
        state.size?.content ||
        state.size
      )
  );


  /* =======================================================
     TAX MASTERS
  ======================================================= */

  const taxMasters = useSelector(
    (state) =>
      getArray(
        state.taxMaster?.taxMasters ||
        state.taxMaster?.content ||
        state.taxMaster
      )
  );


  /* =======================================================
     SAFE INVOICE ITEMS
  ======================================================= */

  const invoiceItems =
    Array.isArray(
      invoice?.invoiceItems
    )
      ? invoice.invoiceItems
      : [];


  /* =========================================================
     OPEN ITEM DROPDOWN
  ========================================================= */

  const openItemDropdown = (
    index,
    element
  ) => {
    const rect =
      element.getBoundingClientRect();

    setActiveItemId(index);

    setOpenRowItemDropdown(true);

    setItemDropdownPosition({
      top: rect.bottom + 4,
      left: rect.left,
      width: Math.max(
        rect.width,
        520
      ),
    });
  };


  /* =========================================================
     LOAD MASTER DATA
  ========================================================= */

  useEffect(() => {
    dispatch(loadCustomers());
    dispatch(fetchAllProducts());
    dispatch(fetchAllUnits());
    dispatch(fetchAllSizes());
    dispatch(fetchAllTaxMasters());
  }, [dispatch]);


  /* =========================================================
     RESET LOCAL STATE
  ========================================================= */

  const resetLocalState = () => {
    setCustomerSearch("");
    setItemSearch("");
    setOpenCustomer(false);
    setOpenRowItemDropdown(false);
    setActiveItemId(null);
    setShowSummary(true);
    setShowTerms(false);
    setShowGateway(false);
    setShowSaveMenu(false);
    setShowCustomerDetails(false);
    setDiscountMode("COMMON");
  };


  /* =========================================================
     INITIALIZE NEW INVOICE
     
     IMPORTANT:
     ONLY ONE CREATE INITIALIZATION EFFECT.
     
     This completely clears the previous invoice.
  ========================================================= */

  useEffect(() => {
    if (!isAdd) {
      return;
    }

    /*
     * Completely clear previous invoice.
     */
    dispatch(resetInvoiceForm());

    /*
     * Clear local UI state.
     */
    setCustomerSearch("");
    setItemSearch("");
    setOpenCustomer(false);
    setOpenRowItemDropdown(false);
    setActiveItemId(null);
    setShowSummary(true);
    setShowTerms(false);
    setShowGateway(false);
    setShowSaveMenu(false);
    setShowCustomerDetails(false);
    setDiscountMode("COMMON");


    /* ==========================================
       DEFAULT INVOICE TYPE
    ========================================== */

    dispatch(
      setInvoiceField({
        field: "invoiceType",
        value: "SALE_INVOICE",
      })
    );


    /* ==========================================
       DEFAULT STATUS
    ========================================== */

    dispatch(setInvoiceField({
      field: "invoiceStatus",
      value: "DRAFT",
    }));


    /* ==========================================
       CLEAR INVOICE NUMBER
       
       Generated number will be loaded
       by separate effect.
    ========================================== */

    dispatch(
      setInvoiceField({
        field: "invoiceNumber",
        value: "",
      })
    );


    /* ==========================================
       CLEAR CUSTOMER
    ========================================== */

    dispatch(
      setInvoiceField({
        field: "customerId",
        value: "",
      })
    );

    dispatch(
      setInvoiceField({
        field: "customerName",
        value: "",
      })
    );


    /* ==========================================
       IMPORTANT:
       CLEAR PREVIOUS DATE
    ========================================== */

    dispatch(
      setInvoiceField({
        field: "invoiceDate",
        value: "",
      })
    );


    /* ==========================================
       IMPORTANT:
       CLEAR PREVIOUS DUE DATE
    ========================================== */

    dispatch(
      setInvoiceField({
        field: "dueDate",
        value: "",
      })
    );


    /* ==========================================
       CLEAR NOTES
    ========================================== */

    dispatch(
      setInvoiceField({
        field: "notes",
        value: "",
      })
    );


    /* ==========================================
       CLEAR TERMS
    ========================================== */

    dispatch(
      setInvoiceField({
        field: "termsAndConditions",
        value: "",
      })
    );


    /* ==========================================
       SHIPPING
    ========================================== */

    dispatch(
      setInvoiceField({
        field: "shippingAmount",
        value: 0,
      })
    );


    /* ==========================================
       DISCOUNT
    ========================================== */

    dispatch(
      setInvoiceField({
        field: "discountAmount",
        value: 0,
      })
    );


    /* ==========================================
       ONE EMPTY ITEM
    ========================================== */

    dispatch(
      setInvoiceField({
        field: "invoiceItems",
        value: [
          createEmptyItem(),
        ],
      })
    );

  }, [
    dispatch,
    isAdd,
  ]);


  /* =========================================================
     LOAD GENERATED INVOICE NUMBER
     ONLY FOR CREATE
  ========================================================= */

  useEffect(() => {
    if (!isAdd) {
      return;
    }

    /*
     * Don't generate another number
     * if one already exists.
     */
    if (invoice?.invoiceNumber) {
      return;
    }


    const loadInvoiceNumber =
      async () => {
        try {
          const result =
            await dispatch(
              fetchGeneratedInvoiceNumber()
            ).unwrap();


          console.log(
            "GENERATED INVOICE NUMBER RESPONSE:",
            result
          );


          const invoiceNumber =
            result?.data?.invoiceNumber ||
            result?.data ||
            result?.invoiceNumber ||
            result;


          if (invoiceNumber) {
            dispatch(
              setInvoiceField({
                field:
                  "invoiceNumber",
                value:
                  invoiceNumber,
              })
            );
          }

        } catch (error) {
          console.error(
            "FAILED TO GENERATE INVOICE NUMBER:",
            error
          );

          toast.error(
            "Failed to generate invoice number"
          );
        }
      };


    loadInvoiceNumber();

  }, [
    dispatch,
    isAdd,
    invoice?.invoiceNumber,
  ]);


  /* =========================================================
     LOAD EXISTING INVOICE
     
     WORKS FOR:
     1. /invoices/edit/:id
     2. editInvoice modal
  ========================================================= */

  // useEffect(() => {
  //   if (
  //     !isEdit ||
  //     !editInvoiceId
  //   ) {
  //     return;
  //   }


  //   const loadInvoice =
  //     async () => {
  //       try {

  //         /*
  //          * Clear previous invoice state
  //          * before loading edit data.
  //          */
  //         dispatch(
  //           resetInvoiceForm()
  //         );


  //         /*
  //          * Clear local state.
  //          */
  //         setCustomerSearch("");
  //         setItemSearch("");
  //         setOpenCustomer(false);
  //         setOpenRowItemDropdown(false);
  //         setActiveItemId(null);
  //         setShowSummary(true);
  //         setShowGateway(false);
  //         setShowSaveMenu(false);
  //         setShowCustomerDetails(false);


  //         const result =
  //           await dispatch(
  //             fetchInvoiceById(
  //               editInvoiceId
  //             )
  //           ).unwrap();


  //         console.log(
  //           "EDIT INVOICE RESPONSE:",
  //           result
  //         );


  //         /* ==========================================
  //            RESPONSE EXTRACTION
  //         ========================================== */

  //         const existingInvoice =
  //           result?.data?.data ||
  //           result?.data?.invoice ||
  //           result?.data ||
  //           result?.invoice ||
  //           result;


  //         console.log(
  //           "EXTRACTED EXISTING INVOICE:",
  //           existingInvoice
  //         );


  //         if (
  //           !existingInvoice ||
  //           typeof existingInvoice !==
  //           "object"
  //         ) {
  //           toast.error(
  //             "Invoice data not found"
  //           );

  //           return;
  //         }


  //         /* ==========================================
  //            INVOICE NUMBER
  //         ========================================== */

  //         dispatch(
  //           setInvoiceField({
  //             field:
  //               "invoiceNumber",
  //             value:
  //               existingInvoice
  //                 .invoiceNumber ||
  //               "",
  //           })
  //         );


  //         /* ==========================================
  //            INVOICE TYPE
  //         ========================================== */

  //         dispatch(
  //           setInvoiceField({
  //             field:
  //               "invoiceType",
  //             value:
  //               existingInvoice
  //                 .invoiceType ||
  //               "SALE_INVOICE",
  //           })
  //         );


  //         /* ==========================================
  //            STATUS
  //         ========================================== */

  //         dispatch(
  //           setInvoiceField({
  //             field:
  //               "invoiceStatus",
  //             value:
  //               existingInvoice.invoiceStatus ||
  //               existingInvoice.status ||
  //               "DRAFT",
  //           })
  //         );


  //         /* ==========================================
  //            CUSTOMER ID
  //         ========================================== */

  //         dispatch(
  //           setInvoiceField({
  //             field:
  //               "customerId",
  //             value:
  //               existingInvoice
  //                 .customerId ||
  //               existingInvoice
  //                 .customer?.id ||
  //               "",
  //           })
  //         );


  //         /* ==========================================
  //            CUSTOMER NAME
  //         ========================================== */

  //         dispatch(
  //           setInvoiceField({
  //             field:
  //               "customerName",
  //             value:
  //               existingInvoice
  //                 .customerName ||
  //               existingInvoice
  //                 .customer?.customerName ||
  //               existingInvoice
  //                 .customer?.displayName ||
  //               existingInvoice
  //                 .customer?.companyName ||
  //               "",
  //           })
  //         );


  //         /* ==========================================
  //            INVOICE DATE
  //         ========================================== */

  //         dispatch(
  //           setInvoiceField({
  //             field:
  //               "invoiceDate",
  //             value:
  //               existingInvoice
  //                 .invoiceDate ||
  //               "",
  //           })
  //         );


  //         /* ==========================================
  //            DUE DATE
  //         ========================================== */

  //         dispatch(
  //           setInvoiceField({
  //             field:
  //               "dueDate",
  //             value:
  //               existingInvoice
  //                 .dueDate ||
  //               "",
  //           })
  //         );


  //         /* ==========================================
  //            SHIPPING
  //         ========================================== */

  //         dispatch(
  //           setInvoiceField({
  //             field:
  //               "shippingAmount",
  //             value:
  //               Number(
  //                 existingInvoice
  //                   .shippingAmount ||
  //                 0
  //               ),
  //           })
  //         );


  //         /* ==========================================
  //            DISCOUNT
  //         ========================================== */

  //         dispatch(
  //           setInvoiceField({
  //             field:
  //               "discountAmount",
  //             value:
  //               Number(
  //                 existingInvoice
  //                   .discountAmount ||
  //                 0
  //               ),
  //           })
  //         );


  //         /* ==========================================
  //            NOTES
  //         ========================================== */

  //         dispatch(
  //           setInvoiceField({
  //             field:
  //               "notes",
  //             value:
  //               existingInvoice
  //                 .notes ||
  //               "",
  //           })
  //         );


  //         /* ==========================================
  //            TERMS
  //         ========================================== */

  //         dispatch(
  //           setInvoiceField({
  //             field:
  //               "termsAndConditions",
  //             value:
  //               existingInvoice
  //                 .termsAndConditions ||
  //               "",
  //           })
  //         );


  //         /* ==========================================
  //            INVOICE ITEMS
  //         ========================================== */

  //         const existingItems =
  //           Array.isArray(
  //             existingInvoice
  //               .invoiceItems
  //           )
  //             ? existingInvoice
  //               .invoiceItems
  //             : [];


  //         const mappedItems =
  //           existingItems.length
  //             ? existingItems.map(
  //               (item) => ({
  //                 id:
  //                   item.id ||
  //                   null,

  //                 productId:
  //                   item.productId ||
  //                   item.product?.id ||
  //                   "",

  //                 description:
  //                   item.description ||
  //                   item.product
  //                     ?.productName ||
  //                   item.product
  //                     ?.itemName ||
  //                   item.product
  //                     ?.name ||
  //                   "",

  //                 unitId:
  //                   item.unitId ||
  //                   item.unit?.id ||
  //                   "",

  //                 sizeId:
  //                   item.sizeId ||
  //                   item.size?.id ||
  //                   "",

  //                 quantity:
  //                   Number(
  //                     item.quantity ||
  //                     0
  //                   ),

  //                 unitPrice:
  //                   Number(
  //                     item.unitPrice ||
  //                     0
  //                   ),

  //                 discountAmount:
  //                   Number(
  //                     item.discountAmount ||
  //                     0
  //                   ),

  //                 taxMasterId:
  //                   item.taxMasterId ||
  //                   item.taxMaster?.id ||
  //                   "",
  //               })
  //             )
  //             : [
  //               createEmptyItem(),
  //             ];


  //         dispatch(
  //           setInvoiceField({
  //             field:
  //               "invoiceItems",
  //             value:
  //               mappedItems,
  //           })
  //         );


  //         /* ==========================================
  //            DISCOUNT MODE
  //         ========================================== */

  //         if (
  //           existingInvoice
  //             .discountMode
  //         ) {

  //           setDiscountMode(
  //             existingInvoice
  //               .discountMode
  //           );

  //         } else if (
  //           Number(
  //             existingInvoice
  //               .discountAmount ||
  //             0
  //           ) > 0
  //         ) {

  //           setDiscountMode(
  //             "COMMON"
  //           );

  //         } else {

  //           const hasProductDiscount =
  //             existingItems.some(
  //               (item) =>
  //                 Number(
  //                   item?.discountAmount ||
  //                   0
  //                 ) > 0
  //             );


  //           setDiscountMode(
  //             hasProductDiscount
  //               ? "PRODUCT"
  //               : "COMMON"
  //           );
  //         }


  //         /* ==========================================
  //            TERMS VISIBILITY
  //         ========================================== */

  //         setShowTerms(
  //           Boolean(
  //             existingInvoice
  //               .termsAndConditions
  //           )
  //         );

  //       } catch (error) {

  //         console.error(
  //           "LOAD INVOICE ERROR:",
  //           error
  //         );


  //         toast.error(
  //           error?.message ||
  //           error?.payload?.message ||
  //           error?.response?.data
  //             ?.message ||
  //           "Failed to load invoice"
  //         );
  //       }
  //     };


  //   loadInvoice();

  // }, [
  //   dispatch,
  //   isEdit,
  //   editInvoiceId,
  // ]);

  useEffect(() => {
    // ADD MODAL MUST NEVER LOAD AN INVOICE
    if (isAddModal) {
      return;
    }

    // EDIT MODAL WITHOUT ID
    if (isEditModal && !modal?.data?.id) {
      console.error(
        "Edit invoice opened without invoice ID:",
        modal
      );

      toast.error("Invoice ID is missing");
      return;
    }

    // Nothing to load
    if (!isEdit || !editInvoiceId) {
      return;
    }

    let cancelled = false;

    const loadInvoice = async () => {
      try {
        console.log(
          "Loading invoice ID:",
          editInvoiceId
        );

        dispatch(resetInvoiceForm());

        const result = await dispatch(
          fetchInvoiceById(editInvoiceId)
        ).unwrap();

        if (cancelled) {
          return;
        }

        const existingInvoice =
          result?.data?.data ||
          result?.data?.invoice ||
          result?.data ||
          result?.invoice ||
          result;

        if (!existingInvoice) {
          toast.error("Invoice not found");
          return;
        }

        // KEEP YOUR EXISTING FIELD MAPPING HERE

      } catch (error) {
        if (!cancelled) {
          console.error(
            "Failed to load invoice:",
            error
          );

          toast.error(
            "Failed to load invoice"
          );
        }
      }
    };

    loadInvoice();

    return () => {
      cancelled = true;
    };

  }, [
    isAddModal,
    isEditModal,
    isEdit,
    editInvoiceId,
    modal?.data?.id,
    dispatch,
  ]);

  /* =========================================================
     CLICK OUTSIDE
  ========================================================= */

  useEffect(() => {
    const handleClickOutside = (
      event
    ) => {

      if (
        customerDropdownRef.current &&
        !customerDropdownRef.current.contains(
          event.target
        )
      ) {
        setOpenCustomer(false);
      }


      if (
        itemDropdownRef.current &&
        !itemDropdownRef.current.contains(
          event.target
        )
      ) {

        setOpenRowItemDropdown(
          false
        );

        setActiveItemId(null);
      }


      if (
        saveMenuRef.current &&
        !saveMenuRef.current.contains(
          event.target
        )
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


  /* =========================================================
     CLOSE
  ========================================================= */

  const handleClose = () => {

    dispatch(
      resetInvoiceForm()
    );

    resetLocalState();


    if (isModal) {

      dispatch(
        closeModal()
      );

      return;
    }


    navigate(
      "/invoices"
    );
  };


  /* =========================================================
     CUSTOMER NAME
  ========================================================= */

  const getCustomerName = (
    customer
  ) => {
    return (
      customer?.customerName ||
      customer?.displayName ||
      customer?.companyName ||
      [
        customer?.firstName,
        customer?.lastName,
      ]
        .filter(Boolean)
        .join(" ") ||
      ""
    );
  };


  /* =========================================================
     CUSTOMER SEARCH
  ========================================================= */

  const filteredCustomers =
    useMemo(() => {

      const search =
        customerSearch
          .trim()
          .toLowerCase();


      if (!search) {
        return customers;
      }


      return customers.filter(
        (customer) => {

          const name =
            getCustomerName(
              customer
            ).toLowerCase();


          const email =
            String(
              customer?.email ||
              ""
            ).toLowerCase();


          const phone =
            String(
              customer?.mobile ||
              customer?.phone ||
              customer?.phoneNumber ||
              customer?.mobileNumber ||
              ""
            ).toLowerCase();


          return (
            name.includes(
              search
            ) ||
            email.includes(
              search
            ) ||
            phone.includes(
              search
            )
          );
        }
      );

    }, [
      customers,
      customerSearch,
    ]);


  /* =========================================================
     PRODUCT SEARCH
  ========================================================= */

  const filteredProducts =
    useMemo(() => {

      const search =
        (
          itemSearch || ""
        ).toLowerCase();


      if (
        !Array.isArray(
          products
        )
      ) {
        return [];
      }


      return products.filter(
        (product) => {

          const name =
            product?.productName ||
            product?.itemName ||
            product?.name ||
            "";


          const sku =
            product?.sku ||
            "";


          return (
            name
              .toLowerCase()
              .includes(search) ||
            sku
              .toLowerCase()
              .includes(search)
          );
        }
      );

    }, [
      products,
      itemSearch,
    ]);


  /* =========================================================
     FORMAT
  ========================================================= */

  const fmt = (
    value
  ) =>
    Number(
      value || 0
    ).toFixed(2);


  /* =========================================================
     TAX RATE
  ========================================================= */

  const getTaxRate = (
    taxMasterId
  ) => {

    if (!taxMasterId) {
      return 0;
    }


    const tax =
      taxMasters.find(
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


  /* =========================================================
     ITEM CALCULATION
  ========================================================= */

  const getItemAmount = (
    item
  ) => {

    const quantity =
      Number(
        item?.quantity || 0
      );


    const unitPrice =
      Number(
        item?.unitPrice || 0
      );


    const discount =
      discountMode ===
        "PRODUCT"
        ? Number(
          item?.discountAmount ||
          0
        )
        : 0;


    return Math.max(
      quantity *
      unitPrice -
      discount,
      0
    );
  };


  const getItemTax = (
    item
  ) => {

    const amount =
      getItemAmount(
        item
      );


    const taxRate =
      getTaxRate(
        item?.taxMasterId
      );


    return (
      amount *
      taxRate
    ) / 100;
  };


  /* =========================================================
     TOTALS
  ========================================================= */

  const totals = useMemo(() => {

    let subtotal = 0;
    let productDiscount = 0;
    let tax = 0;


    invoiceItems.forEach(
      (item) => {

        const quantity =
          Number(
            item?.quantity ||
            0
          );


        const unitPrice =
          Number(
            item?.unitPrice ||
            0
          );


        subtotal +=
          quantity *
          unitPrice;


        if (
          discountMode ===
          "PRODUCT"
        ) {

          productDiscount +=
            Number(
              item?.discountAmount ||
              0
            );
        }


        tax +=
          getItemTax(
            item
          );
      }
    );


    const commonDiscount =
      discountMode ===
        "COMMON"
        ? Number(
          invoice?.discountAmount ||
          0
        )
        : 0;


    const discount =
      commonDiscount +
      productDiscount;


    const shipping =
      Number(
        invoice?.shippingAmount ||
        0
      );


    const grandTotal =
      subtotal -
      discount +
      tax +
      shipping;


    return {
      subtotal,
      discount,
      commonDiscount,
      productDiscount,
      tax,
      shipping,
      grandTotal,
    };

  }, [
    invoiceItems,
    invoice?.discountAmount,
    invoice?.shippingAmount,
    discountMode,
    taxMasters,
  ]);


  /* =========================================================
     CUSTOMER SELECT
  ========================================================= */

  const handleCustomerSelect = (
    customer
  ) => {

    if (!customer) {
      return;
    }


    const name =
      getCustomerName(
        customer
      );


    dispatch(
      setInvoiceField({
        field:
          "customerId",
        value:
          customer.id,
      })
    );


    dispatch(
      setInvoiceField({
        field:
          "customerName",
        value:
          name,
      })
    );


    setCustomerSearch("");

    setOpenCustomer(false);
  };


  /* =========================================================
     INVOICE FIELD
  ========================================================= */

  const handleInvoiceFieldChange =
    (field) =>
      (event) => {

        dispatch(
          setInvoiceField({
            field,
            value:
              event.target.value,
          })
        );
      };


  /* =========================================================
     DATE
  ========================================================= */

  const handleInvoiceDateChange = (
    date
  ) => {

    if (!date) {

      dispatch(
        setInvoiceField({
          field:
            "invoiceDate",
          value: "",
        })
      );

      return;
    }


    const value =
      date
        .toISOString()
        .split("T")[0];


    dispatch(
      setInvoiceField({
        field:
          "invoiceDate",
        value,
      })
    );
  };


  const handleDueDateChange = (
    date
  ) => {

    if (!date) {

      dispatch(
        setInvoiceField({
          field:
            "dueDate",
          value: "",
        })
      );

      return;
    }


    const value =
      date
        .toISOString()
        .split("T")[0];


    dispatch(
      setInvoiceField({
        field:
          "dueDate",
        value,
      })
    );
  };


  /* =========================================================
     TERMS
  ========================================================= */

  const handleTermsChange = (
    value
  ) => {

    dispatch(
      setInvoiceField({
        field:
          "termsAndConditions",
        value,
      })
    );


    if (
      !invoice.invoiceDate
    ) {
      return;
    }


    const invoiceDate =
      new Date(
        invoice.invoiceDate
      );


    if (
      value ===
      "Net 15"
    ) {

      invoiceDate.setDate(
        invoiceDate.getDate() +
        15
      );
    }


    if (
      value ===
      "Net 30"
    ) {

      invoiceDate.setDate(
        invoiceDate.getDate() +
        30
      );
    }


    if (
      value ===
      "Due on Receipt"
    ) {

      dispatch(
        setInvoiceField({
          field:
            "dueDate",
          value:
            invoice.invoiceDate,
        })
      );

      return;
    }


    dispatch(
      setInvoiceField({
        field:
          "dueDate",
        value:
          invoiceDate
            .toISOString()
            .split("T")[0],
      })
    );
  };


  /* =========================================================
     ITEM FIELD
  ========================================================= */

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


  /* =========================================================
     ADD ITEM
  ========================================================= */

  const handleAddItem = () => {

    dispatch(
      addInvoiceItem(
        createEmptyItem()
      )
    );
  };


  /* =========================================================
     REMOVE ITEM
  ========================================================= */

  const handleRemoveItem = (
    index
  ) => {

    if (
      invoiceItems.length <= 1
    ) {
      return;
    }


    dispatch(
      removeInvoiceItem(
        index
      )
    );
  };


  /* =========================================================
     PRODUCT SELECT
  ========================================================= */

  const handleProductSelect = (
    index,
    product
  ) => {

    const productName =
      product?.productName ||
      product?.itemName ||
      product?.name ||
      "";


    const sellingPrice =
      product?.sellingPrice ??
      product?.rate ??
      product?.price ??
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
      Number(
        sellingPrice
      )
    );


    if (
      product?.unitId
    ) {

      updateItem(
        index,
        "unitId",
        product.unitId
      );
    }


    if (
      product?.sizeId
    ) {

      updateItem(
        index,
        "sizeId",
        product.sizeId
      );
    }


    if (
      product?.taxId
    ) {

      updateItem(
        index,
        "taxMasterId",
        product.taxId
      );
    }


    setItemSearch("");

    setOpenRowItemDropdown(
      false
    );

    setActiveItemId(null);


    /*
     * Add next empty row only
     * when selecting product in
     * the last row.
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


  /* =========================================================
     VALIDATION
  ========================================================= */

  const validateInvoice = () => {

    if (
      !invoice.customerId
    ) {

      toast.error(
        "Please select a customer"
      );

      return false;
    }


    if (
      !invoice.invoiceDate
    ) {

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


    if (
      !validItems.length
    ) {

      toast.error(
        "Please add at least one item"
      );

      return false;
    }


    for (
      let index = 0;
      index <
      validItems.length;
      index++
    ) {

      const item =
        validItems[index];


      if (
        !item.productId
      ) {

        toast.error(
          `Please select product for item ${index + 1
          }`
        );

        return false;
      }


      if (
        !item.description?.trim()
      ) {

        toast.error(
          `Please enter description for item ${index + 1
          }`
        );

        return false;
      }


      if (
        Number(
          item.quantity
        ) <= 0
      ) {

        toast.error(
          `Quantity must be greater than zero for item ${index + 1
          }`
        );

        return false;
      }


      if (
        Number(
          item.unitPrice
        ) < 0
      ) {

        toast.error(
          `Unit price cannot be negative for item ${index + 1
          }`
        );

        return false;
      }


      if (
        !item.taxMasterId
      ) {

        toast.error(
          `Please select tax for item ${index + 1
          }`
        );

        return false;
      }
    }


    return true;
  };


  /* =========================================================
     BUILD INVOICE PAYLOAD
  ========================================================= */

  const buildInvoicePayload = () => {

    const validItems =
      invoiceItems.filter(
        (item) =>
          item.productId ||
          item.description
      );


    const commonDiscount =
      discountMode ===
        "COMMON"
        ? Number(
          invoice.discountAmount ||
          0
        )
        : 0;


    const totalGrossAmount =
      validItems.reduce(
        (
          total,
          item
        ) => {

          const quantity =
            Number(
              item?.quantity ||
              0
            );


          const unitPrice =
            Number(
              item?.unitPrice ||
              0
            );


          return (
            total +
            quantity *
            unitPrice
          );
        },
        0
      );


    return {

      invoiceNumber:
        invoice.invoiceNumber ||
        null,

      invoiceType:
        invoice.invoiceType ||
        "SALE_INVOICE",

      invoiceStatus: invoice.invoiceStatus || "DRAFT",

      customerId:
        Number(
          invoice.customerId
        ),

      invoiceDate:
        invoice.invoiceDate,

      dueDate:
        invoice.dueDate ||
        null,

      shippingAmount:
        Number(
          invoice.shippingAmount ||
          0
        ),

      notes:
        invoice.notes?.trim() ||
        "",

      termsAndConditions:
        invoice
          .termsAndConditions
          ?.trim() ||
        "",

      discountMode,

      discountAmount:
        discountMode ===
          "COMMON"
          ? commonDiscount
          : 0,

      invoiceItems:
        validItems.map(
          (item) => {

            const quantity =
              Number(
                item?.quantity ||
                0
              );


            const unitPrice =
              Number(
                item?.unitPrice ||
                0
              );


            const grossAmount =
              quantity *
              unitPrice;


            let discountAmount =
              0;


            /*
             * PRODUCT DISCOUNT
             */
            if (
              discountMode ===
              "PRODUCT"
            ) {

              discountAmount =
                Number(
                  item?.discountAmount ||
                  0
                );
            }


            /*
             * COMMON DISCOUNT
             *
             * Distributed proportionally
             * across invoice items.
             */
            if (
              discountMode ===
              "COMMON" &&
              totalGrossAmount >
              0
            ) {

              discountAmount =
                commonDiscount *
                (
                  grossAmount /
                  totalGrossAmount
                );
            }


            return {

              /*
               * Keep item ID during update.
               */
              ...(item.id
                ? {
                  id:
                    item.id,
                }
                : {}),

              productId:
                Number(
                  item.productId
                ),

              description:
                item.description
                  ?.trim() ||
                "",

              unitId:
                item.unitId
                  ? Number(
                    item.unitId
                  )
                  : null,

              sizeId:
                item.sizeId
                  ? Number(
                    item.sizeId
                  )
                  : null,

              quantity,

              unitPrice,

              discountAmount:
                Number(
                  discountAmount.toFixed(
                    2
                  )
                ),

              taxMasterId:
                Number(
                  item.taxMasterId
                ),
            };
          }
        ),
    };
  };


  /* =========================================================
     SAVE / UPDATE
  ========================================================= */

  const saveInvoice = async (
    successMessage,
    status = null
  ) => {
    if (!validateInvoice()) {
      return;
    }

    try {
      const payload = buildInvoicePayload();

      if (status) {
        payload.invoiceStatus = status;
      }

      console.log(
        isEdit
          ? "UPDATE INVOICE PAYLOAD:"
          : "CREATE INVOICE PAYLOAD:",
        JSON.stringify(payload, null, 2)
      );

      if (isEdit) {
        if (!editInvoiceId) {
          toast.error("Invoice ID is missing");
          return;
        }

        await dispatch(
          editInvoice({
            id: editInvoiceId,
            data: payload,
          })
        ).unwrap();
      } else {
        await dispatch(
          createInvoice(payload)
        ).unwrap();
      }

      toast.success(successMessage);

      dispatch(resetInvoiceForm());
      resetLocalState();

      if (isModal) {
        dispatch(closeModal());
        return;
      }

      navigate("/invoices");

    } catch (error) {
      console.error(
        isEdit
          ? "UPDATE INVOICE ERROR:"
          : "CREATE INVOICE ERROR:",
        error
      );

      toast.error(
        error?.message ||
        error?.payload?.message ||
        error?.response?.data?.message ||
        String(error) ||
        "Failed to save invoice"
      );
    }
  };


  /* =========================================================
     SAVE
  ========================================================= */

  const handleSave = async () => {
    await saveInvoice(
      isEdit
        ? "Invoice updated successfully"
        : "Invoice created successfully",
      invoice.invoiceStatus || "SENT"
    );
  };

  /* =========================================================
     SAVE DRAFT
  ========================================================= */
  const handleSaveDraft = async () => {
    await saveInvoice(
      isEdit
        ? "Invoice draft updated successfully"
        : "Invoice draft saved successfully",
      "DRAFT"
    );
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div>

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

                {isEdit
                  ? "Edit Invoice"
                  : "New Invoice"}

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
                onClick={
                  handleClose
                }
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

          <div className="mb-6 flex items-start">

            <label className="w-44 pt-2 text-sm font-medium text-red-500 shrink-0">
              Customer Name*
            </label>


            <div className="flex-1">

              {/* ROW 1 */}

              <div className="flex items-center gap-3">

                <div
                  ref={
                    customerDropdownRef
                  }
                  className="relative w-[550px]"
                >

                  <div className="flex">

                    <div className="relative flex-1">

                      <input
                        type="text"
                        value={
                          customerSearch ||
                          invoice.customerName ||
                          ""
                        }
                        placeholder={
                          customerLoading
                            ? "Loading customers..."
                            : "Select or add a customer"
                        }
                        onClick={() =>
                          setOpenCustomer(
                            true
                          )
                        }
                        onChange={(
                          e
                        ) => {

                          setCustomerSearch(
                            e.target.value
                          );

                          setOpenCustomer(
                            true
                          );
                        }}
                        className="w-full h-10 border border-blue-500 rounded-l-md px-3 pr-8 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                      />


                      <ChevronDown
                        size={14}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      />

                    </div>


                    <button
                      type="button"
                      onClick={() =>
                        setOpenCustomer(
                          true
                        )
                      }
                      className="h-10 w-10 flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white rounded-r-md"
                    >

                      <Search
                        size={16}
                      />

                    </button>

                  </div>


                  {/* CUSTOMER DROPDOWN */}

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
                            value={
                              customerSearch
                            }
                            onChange={(
                              e
                            ) =>
                              setCustomerSearch(
                                e.target.value
                              )
                            }
                            className="w-full border border-blue-300 rounded pl-10 pr-3 py-2 text-sm focus:outline-none"
                          />

                        </div>

                      </div>


                      <div className="max-h-60 overflow-y-auto">

                        {customerLoading ? (

                          <div className="px-4 py-5 text-center text-gray-500 text-sm">
                            Loading customers...
                          </div>

                        ) : customerError ? (

                          <div className="px-4 py-5 text-center text-red-500 text-sm">
                            Failed to load customers
                          </div>

                        ) : filteredCustomers.length ===
                          0 ? (

                          <div className="px-4 py-5 text-center text-gray-400 text-sm">

                            {customerSearch
                              ? "No customers found"
                              : "No customers available"}

                          </div>

                        ) : (

                          filteredCustomers.map(
                            (
                              customer
                            ) => {

                              const name =
                                getCustomerName(
                                  customer
                                );

                              return (

                                <button
                                  type="button"
                                  key={
                                    customer.id
                                  }
                                  onClick={() =>
                                    handleCustomerSelect(
                                      customer
                                    )
                                  }
                                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-blue-500 hover:text-white"
                                >

                                  <div className="w-9 h-9 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-medium shrink-0">

                                    {name
                                      .charAt(
                                        0
                                      )
                                      .toUpperCase()}

                                  </div>


                                  <div className="min-w-0">

                                    <p className="font-medium truncate">
                                      {name}
                                    </p>

                                    <p className="text-xs opacity-70 truncate">

                                      {customer.email ||
                                        customer.mobile ||
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

                          <Plus
                            size={14}
                          />

                        </div>

                        <span className="font-medium">
                          New Customer
                        </span>

                      </button>

                    </div>
                  )}

                </div>


                {/* CURRENCY */}

                <div className="h-10 px-3 flex items-center gap-2 bg-white border border-gray-200 rounded-md text-sm text-gray-800">

                  <span className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">

                    <span className="w-2 h-2 rounded-full border-2 border-white" />

                  </span>

                  {selectedCustomer?.currency || "INR"}

                </div>

              </div>


              {/* ROW 2: ADDRESSES */}

              {invoice.customerId && (

                <div className="flex gap-16 mt-5">

                  {/* BILLING */}

                  <div className="w-[240px]">

                    <p className="text-sm uppercase text-gray-600 mb-3">
                      Billing Address
                    </p>


                    {formatAddress(
                      selectedCustomer?.billingAddress
                    ) ? (

                      <p className="text-sm text-gray-700">

                        {formatAddress(
                          selectedCustomer.billingAddress
                        )}

                      </p>

                    ) : (

                      <button
                        type="button"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        New Address
                      </button>

                    )}

                  </div>


                  {/* SHIPPING */}

                  <div>

                    <p className="text-sm uppercase text-gray-600 mb-3">
                      Shipping Address
                    </p>


                    <div className="flex items-center gap-3">

                      {formatAddress(
                        selectedCustomer?.shippingAddress
                      ) ? (

                        <p className="text-sm text-gray-700">

                          {formatAddress(
                            selectedCustomer.shippingAddress
                          )}

                        </p>

                      ) : (

                        <button
                          type="button"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          New Address
                        </button>

                      )}


                      <span className="h-4 w-px bg-gray-300" />


                      <button
                        type="button"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        + Dropshipping Address
                      </button>

                    </div>

                  </div>

                </div>
              )}

            </div>


            {/* DETAILS */}

            {invoice.customerId && (

              <div className="ml-auto w-64 shrink-0">

                <button
                  type="button"
                  onClick={() =>
                    setShowCustomerDetails(
                      (v) => !v
                    )
                  }
                  className="w-full h-11 px-4 flex items-center justify-between bg-slate-600 hover:bg-slate-700 text-white rounded-l-md font-semibold text-sm"
                >

                  <span className="truncate">
                    {invoice.customerName}'s Details
                  </span>


                  <ChevronRight
                    size={16}
                    className={`transition-transform ${showCustomerDetails
                      ? "rotate-90"
                      : ""
                      }`}
                  />

                </button>


                {showCustomerDetails && (

                  <div className="bg-white border border-gray-200 rounded-b-md p-3 text-sm text-gray-600 space-y-1">

                    <p>
                      {selectedCustomer?.email ||
                        "No email"}
                    </p>

                    <p>
                      {selectedCustomer?.mobile ||
                        selectedCustomer?.phoneNumber ||
                        selectedCustomer?.mobileNumber ||
                        "No phone"}
                    </p>

                  </div>

                )}

              </div>
            )}

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
                className="w-full border border-gray-300 rounded px-3 py-2 pr-10 focus:outline-none focus:border-blue-400"
              />


              <button
                type="button"
                onClick={() =>
                  dispatch(
                    openModal({
                      type:
                        "invoiceNumberSetting",
                      data: {
                        invoiceNumber:
                          invoice.invoiceNumber,
                      },
                    })
                  )
                }
                className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded text-blue-500 hover:bg-blue-50 hover:text-blue-600 transition"
                title="Invoice number settings"
              >

                <Settings
                  size={14}
                />

              </button>

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

          <div className="flex items-center mb-4">
            <label className="w-44 text-sm font-medium text-gray-700 shrink-0">
              Invoice Status
            </label>

            <select
              value={invoice.invoiceStatus || "DRAFT"}
              onChange={(e) =>
                dispatch(
                  setInvoiceField({
                    field: "invoiceStatus",
                    value: e.target.value,
                  })
                )
              }
              className="h-10 w-[330px] px-3 bg-white border border-gray-200 rounded-md text-sm text-gray-800 outline-none focus:border-blue-500"
            >
              <option value="DRAFT">Draft</option>
              <option value="SENT">Sent</option>
              <option value="PAID">Paid</option>
              {/* <option value="PARTIALLY_PAID">Partially Paid</option> */}
              <option value="OVERDUE">Overdue</option>
              <option value="CANCELLED">Cancelled</option>
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
                onChange={(
                  event
                ) =>
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

                <ScanLine
                  size={15}
                />

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

                    <th className="text-right px-3 py-2 text-xs font-semibold text-gray-500 uppercase w-28">
                      Discount
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

                  {invoiceItems.map(
                    (
                      item,
                      index
                    ) => {

                      const amount =
                        getItemAmount(
                          item
                        );


                      return (

                        <tr
                          key={
                            `invoice-item-${item.id ||
                            index
                            }`
                          }
                          className="border-b border-gray-100 hover:bg-gray-50 group"
                        >

                          {/* DRAG */}

                          <td className="px-2 py-3 text-gray-300">

                            <div className="text-lg">
                              ⋮⋮
                            </div>

                          </td>


                          {/* ITEM */}

                          <td className="px-3 py-3 relative overflow-visible">

                            <div className="relative">

                              <input
                                value={
                                  item.description ||
                                  ""
                                }
                                placeholder="Type or click to select an item"
                                onClick={(
                                  event
                                ) =>
                                  openItemDropdown(
                                    index,
                                    event.currentTarget
                                  )
                                }
                                onChange={(
                                  event
                                ) => {

                                  updateItem(
                                    index,
                                    "description",
                                    event.target.value
                                  );

                                  setItemSearch(
                                    event.target.value
                                  );

                                  openItemDropdown(
                                    index,
                                    event.currentTarget
                                  );
                                }}
                                className="w-full text-sm text-gray-700 border border-gray-200 rounded px-3 py-2 focus:outline-none focus:border-blue-400"
                              />

                            </div>

                          </td>


                          {/* UNIT */}

                          <td className="px-3 py-3">

                            <select
                              value={
                                item.unitId ||
                                ""
                              }
                              onChange={(
                                event
                              ) =>
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


                              {units.map(
                                (
                                  unit
                                ) => (

                                  <option
                                    key={
                                      unit.id
                                    }
                                    value={
                                      unit.id
                                    }
                                  >
                                    {
                                      unit.unitName ||
                                      unit.name ||
                                      unit.unitCode
                                    }
                                  </option>

                                )
                              )}

                            </select>

                          </td>


                          {/* SIZE */}

                          <td className="px-3 py-3">

                            <select
                              value={
                                item.sizeId ||
                                ""
                              }
                              onChange={(
                                event
                              ) =>
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


                              {sizes.map(
                                (
                                  size
                                ) => (

                                  <option
                                    key={
                                      size.id
                                    }
                                    value={
                                      size.id
                                    }
                                  >
                                    {
                                      size.sizeName ||
                                      size.name ||
                                      size.sizeCode
                                    }
                                  </option>

                                )
                              )}

                            </select>

                          </td>


                          {/* DISCOUNT */}

                          <td className="px-3 py-3">

                            {discountMode ===
                              "PRODUCT" ? (

                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={
                                  item.discountAmount ??
                                  ""
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateItem(
                                    index,
                                    "discountAmount",
                                    Number(
                                      event.target.value ||
                                      0
                                    )
                                  )
                                }
                                className="w-full text-right text-sm border-b border-transparent focus:border-blue-400 focus:outline-none bg-transparent"
                              />

                            ) : (

                              <span className="block text-right text-sm text-gray-400">
                                —
                              </span>

                            )}

                          </td>


                          {/* TAX */}

                          <td className="px-3 py-3">

                            <select
                              value={
                                item.taxMasterId ||
                                ""
                              }
                              onChange={(
                                event
                              ) =>
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


                              {taxMasters.map(
                                (
                                  tax
                                ) => {

                                  const rate =
                                    tax.taxPercentage ??
                                    tax.taxRate ??
                                    tax.rate ??
                                    tax.percentage ??
                                    0;


                                  return (

                                    <option
                                      key={
                                        tax.id
                                      }
                                      value={
                                        tax.id
                                      }
                                    >

                                      {
                                        tax.taxName ||
                                        tax.name ||
                                        tax.taxType ||
                                        "Tax"
                                      }{" "}

                                      ({rate}%)

                                    </option>

                                  );
                                }
                              )}

                            </select>

                          </td>


                          {/* QUANTITY */}

                          <td className="px-3 py-3">

                            <input
                              type="number"
                              min="0"
                              step="0.001"
                              value={
                                item.quantity ??
                                0
                              }
                              onChange={(
                                event
                              ) =>
                                updateItem(
                                  index,
                                  "quantity",
                                  Number(
                                    event.target.value
                                  )
                                )
                              }
                              className="w-full text-right text-sm border-b border-transparent focus:border-blue-400 focus:outline-none bg-transparent"
                            />

                          </td>


                          {/* RATE */}

                          <td className="px-3 py-3">

                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={
                                item.unitPrice ??
                                0
                              }
                              onChange={(
                                event
                              ) =>
                                updateItem(
                                  index,
                                  "unitPrice",
                                  Number(
                                    event.target.value
                                  )
                                )
                              }
                              className="w-full text-right text-sm border-b border-transparent focus:border-blue-400 focus:outline-none bg-transparent"
                            />

                          </td>


                          {/* AMOUNT */}

                          <td className="px-3 py-3 text-right text-sm font-semibold text-gray-800">

                            ₹
                            {fmt(
                              amount
                            )}

                          </td>


                          {/* DELETE */}

                          <td className="px-2 py-3">

                            {invoiceItems.length >
                              1 && (

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveItem(
                                      index
                                    )
                                  }
                                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
                                >

                                  <Trash2
                                    size={14}
                                  />

                                </button>

                              )}

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>


              {/* =================================================
                  PRODUCT DROPDOWN
              ================================================= */}

              {openRowItemDropdown &&
                activeItemId !==
                null &&
                createPortal(

                  <div
                    ref={
                      itemDropdownRef
                    }
                    style={{
                      position:
                        "fixed",

                      top:
                        itemDropdownPosition.top,

                      left:
                        itemDropdownPosition.left,

                      width:
                        itemDropdownPosition.width,

                      zIndex:
                        999999,
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
                          value={
                            itemSearch
                          }
                          onChange={(
                            event
                          ) =>
                            setItemSearch(
                              event.target.value
                            )
                          }
                          placeholder="Search product"
                          className="w-full border border-blue-300 rounded pl-9 pr-3 py-2 text-sm focus:outline-none"
                        />

                      </div>

                    </div>


                    {/* PRODUCTS */}

                    <div className="max-h-60 overflow-y-auto p-1">

                      {filteredProducts.length ===
                        0 ? (

                        <div className="px-4 py-5 text-center text-gray-400">
                          No products found
                        </div>

                      ) : (

                        filteredProducts.map(
                          (
                            product
                          ) => {

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
                                key={
                                  product.id
                                }
                                onClick={() =>
                                  handleProductSelect(
                                    activeItemId,
                                    product
                                  )
                                }
                                className="w-full text-left rounded-md px-3 py-3 hover:bg-blue-500 hover:text-white"
                              >

                                <div className="font-semibold">
                                  {name}
                                </div>


                                <div className="text-xs opacity-70">

                                  {
                                    product.sku ||
                                    ""
                                  }

                                  {product.sku &&
                                    " • "}

                                  Rate: ₹
                                  {fmt(
                                    price
                                  )}

                                </div>

                              </button>

                            );
                          }
                        )
                      )}

                    </div>


                    {/* ADD PRODUCT */}

                    <button
                      type="button"
                      className="w-full border-t border-gray-200 px-4 py-3 flex items-center gap-2 text-blue-600 hover:bg-blue-50"
                    >

                      <Plus
                        size={15}
                      />

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
              onClick={
                handleAddItem
              }
              className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-400 px-3 py-1.5 rounded"
            >

              <Plus
                size={14}
              />

              Add New Row

            </button>


            <button
              type="button"
              className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-400 px-3 py-1.5 rounded"
            >

              <Plus
                size={14}
              />

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
                  invoice.notes ||
                  ""
                }
                onChange={(
                  event
                ) =>
                  dispatch(
                    setInvoiceField({
                      field:
                        "notes",
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

                  ₹
                  {fmt(
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
                  className={`transition-transform ${showSummary
                    ? "rotate-180"
                    : ""
                    }`}
                />

              </button>


              {showSummary && (

                <div className="mt-2 text-sm text-gray-600 space-y-2 border-t pt-2">

                  {/* SUBTOTAL */}

                  <div className="flex justify-between">

                    <span>
                      Sub Total
                    </span>


                    <span>
                      ₹
                      {fmt(
                        totals.subtotal
                      )}
                    </span>

                  </div>


                  {/* DISCOUNT */}

                  <div className="flex justify-between items-center">

                    <div className="flex items-center gap-2">

                      <span>
                        Discount
                      </span>


                      <select
                        value={
                          discountMode
                        }
                        onChange={(
                          event
                        ) => {

                          const mode =
                            event.target
                              .value;


                          setDiscountMode(
                            mode
                          );


                          if (
                            mode ===
                            "PRODUCT"
                          ) {

                            dispatch(
                              setInvoiceField({
                                field:
                                  "discountAmount",
                                value:
                                  0,
                              })
                            );
                          }


                          if (
                            mode ===
                            "COMMON"
                          ) {

                            invoiceItems.forEach(
                              (
                                item,
                                index
                              ) => {

                                if (
                                  Number(
                                    item?.discountAmount ||
                                    0
                                  ) > 0
                                ) {

                                  dispatch(
                                    setInvoiceItemField({
                                      index,
                                      field:
                                        "discountAmount",
                                      value:
                                        0,
                                    })
                                  );
                                }
                              }
                            );
                          }

                        }}
                        className="px-2 py-1 text-xs border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >

                        <option value="COMMON">
                          Common
                        </option>

                        <option value="PRODUCT">
                          Product
                        </option>

                      </select>

                    </div>


                    <div className="flex items-center gap-1">

                      <span>
                        ₹
                      </span>


                      {discountMode ===
                        "COMMON" ? (

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={
                            invoice.discountAmount ??
                            ""
                          }
                          onChange={(
                            event
                          ) =>
                            dispatch(
                              setInvoiceField({
                                field:
                                  "discountAmount",
                                value:
                                  event.target
                                    .value,
                              })
                            )
                          }
                          placeholder="0.00"
                          className="w-24 px-2 py-1 text-right border border-gray-300 rounded-md"
                        />

                      ) : (

                        <span className="w-24 text-right">

                          {fmt(
                            totals.productDiscount
                          )}

                        </span>

                      )}

                    </div>

                  </div>


                  {/* TAX */}

                  <div className="flex justify-between">

                    <span>
                      Tax
                    </span>


                    <span>
                      ₹
                      {fmt(
                        totals.tax
                      )}
                    </span>

                  </div>


                  {/* SHIPPING */}

                  <div className="flex justify-between items-center">

                    <span>
                      Shipping
                    </span>


                    <div className="flex items-center gap-1">

                      <span>
                        ₹
                      </span>


                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={
                          invoice.shippingAmount ??
                          ""
                        }
                        onChange={(
                          event
                        ) =>
                          dispatch(
                            setInvoiceField({
                              field:
                                "shippingAmount",
                              value:
                                event.target
                                  .value,
                            })
                          )
                        }
                        placeholder="0.00"
                        className="w-24 px-2 py-1 text-right border border-gray-300 rounded-md"
                      />

                    </div>

                  </div>


                  {/* GRAND TOTAL */}

                  <div className="flex justify-between font-semibold border-t pt-2">

                    <span>
                      Grand Total
                    </span>


                    <span>
                      ₹
                      {fmt(
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
                  setShowTerms(
                    true
                  )
                }
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
              >

                <div className="w-5 h-5 rounded-full border-2 border-blue-500 flex items-center justify-center">

                  <Plus
                    size={12}
                  />

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
                  onChange={(
                    event
                  ) =>
                    dispatch(
                      setInvoiceField({
                        field:
                          "termsAndConditions",
                        value:
                          event.target
                            .value,
                      })
                    )
                  }
                  className="w-full max-w-sm border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400 resize-none"
                />

              </div>

            )}


            {/* PAYMENT GATEWAY */}

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

                <Plus
                  size={12}
                />

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

          {/* SAVE DRAFT */}

          <button
            type="button"
            onClick={
              handleSaveDraft
            }
            disabled={
              invoiceLoading
            }
            className="border border-gray-300 text-gray-700 text-sm px-5 py-2 rounded hover:bg-gray-100 font-medium disabled:opacity-50"
          >

            {invoiceLoading
              ? isEdit
                ? "Updating..."
                : "Saving..."
              : isEdit
                ? "Update as Draft"
                : "Save as Draft"}

          </button>


          {/* SAVE */}

          <div
            ref={
              saveMenuRef
            }
            className="relative flex items-center"
          >

            <button
              type="button"
              onClick={
                handleSave
              }
              disabled={
                invoiceLoading
              }
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 h-10 rounded-l font-medium"
            >

              {invoiceLoading
                ? isEdit
                  ? "Updating..."
                  : "Saving..."
                : isEdit
                  ? "Update and Send"
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

                  {isEdit
                    ? "Update and Print"
                    : "Save and Print"}

                </button>


                <button
                  type="button"
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-500 hover:text-white text-left"
                >

                  <UploadCloud
                    size={16}
                  />

                  {isEdit
                    ? "Update and Share"
                    : "Save and Share"}

                </button>


                <button
                  type="button"
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-500 hover:text-white text-left"
                >

                  <Mail
                    size={16}
                  />

                  {isEdit
                    ? "Update and Send Later"
                    : "Save and Send Later"}

                </button>

              </div>
            )}

          </div>


          {/* CANCEL */}

          <button
            type="button"
            onClick={
              handleClose
            }
            className="border border-gray-300 text-gray-700 text-sm px-5 py-2 rounded hover:bg-gray-100 font-medium"
          >

            Cancel

          </button>

        </div>

      </div>

    </div>
  );
}