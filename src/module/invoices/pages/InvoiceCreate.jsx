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
  useLocation
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
  Package,
  Wrench,
  ShieldCheck,
  Landmark,
  Inbox,
  BoxIcon,
  Pencil,
  UserKeyIcon,
  BanknoteIcon,
  CreditCard,
  LucideCreditCard,
  CreditCardIcon,
  SignatureIcon,
  ClipboardPenIcon
} from "lucide-react";

import {
  setInvoiceField,
  setInvoiceItemField,
  addInvoiceItem,
  removeInvoiceItem,
  resetInvoiceForm,
  setInvoiceItems,
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

import {
  fetchAllEmailSignatures,
} from "../../emailSignature/thunks/emailSignatureThunks";


import {
  fetchAllBankAccounts,
} from "../../bankAccount/thunks/bankAccountThunks";


import { fetchAllSalesPersons } from "../../salesPerson/thunks/salesPersonThunks";
import { fetchAllCurrencies, fetchExchangeRate } from "../../currency/thunks/currencyThunks"

import CustomSelect from "../../../common/custom/CustomSelect";
import CustomStatusSelect from "../../../common/custom/CustomStatusSelect";
import CustomSUSelect from "../../../common/custom/CustomSUSelect";

import {
  formatDateForInput,
  calculateDueDate,
} from "../utils/dateUtils";
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
  baseUnitPrice: 0,
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
  const isEditMode = Boolean(id);
  const location = useLocation();

  const [showInvoiceTypeOptions, setShowInvoiceTypeOptions] =
    useState(true);

  // =========================================================
  // SELECT PRODUCT INVOICE
  // =========================================================

  // CREATE PRODUCT INVOICE
  const handleProductInvoice = () => {
    setShowInvoiceTypeOptions(false);
    dispatch(closeModal());

    navigate("/invoices/product/new", {
      state: {
        invoiceType: "PRODUCT_INVOICE",
      },
    });
  };


  // =========================================================
  // SELECT SERVICE INVOICE
  // =========================================================

  const handleServiceInvoice = () => {
    setShowInvoiceTypeOptions(false);
    dispatch(closeModal());

    navigate("/invoices/service/new", {
      state: {
        invoiceType: "SERVICE_INVOICE",
      },
    });
  };



  const handleSaleInvoice = () => {
    setShowInvoiceTypeOptions(false);
    dispatch(closeModal());

    navigate("/invoices/sale/new", {
      state: {
        invoiceType: "SALE_INVOICE",
      },
    });
  };
  // =========================================================
  // GO TO MENU PERMISSION
  // =========================================================

  const handleInvoiceMenuPermission = () => {
    setShowInvoiceTypeOptions(false);

    dispatch(closeModal());

    navigate("/menuPermission");
  };

  // =========================================================
  // CANCEL
  // =========================================================

  const handleCancelInvoiceType = () => {
    setShowInvoiceTypeOptions(false);
    dispatch(closeModal());
  };


  const [showLeaveConfirmation, setShowLeaveConfirmation] =
    useState(false);

  const [showDateTermsModal, setShowDateTermsModal] = useState(false);

  const [dateTermsForm, setDateTermsForm] = useState({
    invoiceDate: "",
    termsAndConditions: "Due on Receipt",
    dueDate: "",
  });

  const [signatures, setSignatures] = useState({
    signatureName: "",
  })
  // =========================================================
  // CLICK OUTSIDE - ASK BEFORE LEAVING
  // =========================================================

  const handleInvoiceTypeBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      setShowLeaveConfirmation(true);
    }
  };

  const handleCancel = () => {
    setShowLeaveConfirmation(true);
  };


  // =========================================================
  // STAY ON INVOICE TYPE SELECTION
  // =========================================================

  const handleStayOnInvoiceType = () => {
    setShowLeaveConfirmation(false);
    dispatch(
      setInvoiceField({
        field: "invoiceType",
        value: location.state?.invoiceType || "PRODUCT_INVOICE",
      })
    );

  };

  // =========================================================
  // LEAVE INVOICE TYPE SELECTION
  // =========================================================

  const handleLeaveInvoiceType = () => {
    setShowLeaveConfirmation(false);

    navigate("/invoices");
  };


  /* =======================================================
     REFS
  ======================================================= */

  const customerDropdownRef = useRef(null);
  const salesPersonDropdownRef = useRef(null);
  const currencyDropdownRef = useRef(null);
  const itemDropdownRef = useRef(null);
  const emailSignatureDropdownRef = useRef(null);
  const bankAccountDropdownRef = useRef(null);
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
    showSalesPersonDetails,
    setShowSalesPersonDetails,
  ] = useState(false);

  const [
    customerSearch,
    setCustomerSearch,
  ] = useState("");

  const [
    salesPersonSearch,
    setSalesPersonSearch,
  ] = useState("");

  const [
    currencySearch,
    setCurrencySearch,
  ] = useState("");


  const [
    itemSearch,
    setItemSearch,
  ] = useState("");

  const [
    emailSignatureSearch,
    setEmailSignatureSearch,
  ] = useState("");


  const [
    bankAccountSearch,
    setBankAccountSearch,
  ] = useState("");

  const [
    openCustomer,
    setOpenCustomer,
  ] = useState(false);

  const [
    openSalesPerson,
    setOpenSalesPerson,
  ] = useState(false);

  const [
    openCurrency,
    setOpenCurrency,
  ] = useState(false);

  const [
    openEmailSignature,
    setOpenEmailSignature,
  ] = useState(false);

  const [
    openbankAccount,
    setOpenBankAccount,
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
    showSignature,
    setShowSignature,
  ] = useState(false);

  const [
    showbankAccount,
    setShowBankAccount,
  ] = useState(false);


  const [
    showSaveMenu,
    setShowSaveMenu,
  ] = useState(false);

  const [
    discountMode,
    setDiscountMode,
  ] = useState("COMMON");

  const [dropdownOpen, setDropdownOpen] =
    useState(false);

  const handleRequestLeave = () => {
    setShowLeaveConfirmation(true);
  };

  const user = useSelector((state) => state.auth?.user);

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
    SALESPERSON REDUX
 ======================================================= */

  const salesPersonState = useSelector(
    (state) => state.salesPerson
  );

  const salesPersons = Array.isArray(
    salesPersonState?.salesPersons
  )
    ? salesPersonState.salesPersons
    : [];

  const salesPersonLoading =
    salesPersonState?.loading ?? false;

  const salesPersonError =
    salesPersonState?.error ?? null;

  /* =======================================================
     SELECTED SALESPERSON
  ======================================================= */

  const selectedSalesPerson = useMemo(() => {
    if (!invoice?.salesPersonId) {
      return null;
    }

    return (
      salesPersons.find(
        (salesPerson) =>
          String(salesPerson?.id) ===
          String(invoice.salesPersonId)
      ) || null
    );
  }, [
    salesPersons,
    invoice?.salesPersonId,
  ]);


  /* =======================================================
     Currency REDUX
  ======================================================= */

  const currencyState = useSelector(
    (state) => state.currency
  );

  const currencies = Array.isArray(
    currencyState?.currencies
  )
    ? currencyState.currencies
    : [];

  const currencyLoading =
    currencyState?.loading ?? false;

  const currencyError =
    currencyState?.error ?? null;

  /* =======================================================
     SELECTED CURRENCY
  ======================================================= */

  const selectedcurrency = useMemo(() => {
    if (!invoice?.currencyId) {
      return null;
    }

    return (
      currencies.find(
        (currency) =>
          String(currency?.id) ===
          String(invoice.currencyId)
      ) || null
    );
  }, [
    currencies,
    invoice?.currencyId,
  ]);




  /* =======================================================
     EMAIL SIGNATURE REDUX
  ======================================================= */

  const emailSignatureState = useSelector(
    (state) => state.emailSignatures
  );

  const emailSignatures = getArray(
    emailSignatureState?.emailSignatures ??
    emailSignatureState?.emailSignature ??
    emailSignatureState?.signatures ??
    emailSignatureState?.content ??
    []
  );

  const emailSignaturesLoading =
    emailSignatureState?.loading ?? false;

  const emailSignatureError =
    emailSignatureState?.error ?? null;

  /* =======================================================
     SELECTED EMAIL SIGNATURE
  ======================================================= */

  const selectedSignature = useMemo(() => {
    if (!invoice?.emailSignatureId) {
      return null;
    }

    return (
      emailSignatures.find(
        (emailSignature) =>
          String(emailSignature?.id) ===
          String(invoice.emailSignatureId)
      ) || null
    );
  }, [
    emailSignatures,
    invoice?.emailSignatureId,
  ]);


  /* =======================================================
    BANKACCOUNT REDUX
  ======================================================= */

  const bankAccountState = useSelector(
    (state) => state.bankAccount
  );

  const bankAccounts = getArray(
    bankAccountState?.bankAccounts ??
    emailSignatureState?.bankAccount ??

    []
  );

  const bankAccountLoading =
    bankAccountState?.loading ?? false;

  const bankAccountError =
    bankAccountState?.error ?? null;

  /* =======================================================
     SELECTED EMAIL SIGNATURE
  ======================================================= */

  const selectedBankAccount = useMemo(() => {
    if (!invoice?.bankAccountId) {
      return null;
    }

    return (
      bankAccounts.find(
        (bankAccount) =>
          String(bankAccount?.id) ===
          String(invoice.bankAccountId)
      ) || null
    );
  }, [
    bankAccounts,
    invoice?.bankAccountId,
  ]);


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
    dispatch(fetchAllSalesPersons());
    dispatch(fetchAllCurrencies());
    if (user?.id != null) {
      dispatch(fetchAllEmailSignatures(user.id));
    }
    dispatch(fetchAllBankAccounts());
  }, [dispatch, user?.id]);


  /* =========================================================
     RESET LOCAL STATE
  ========================================================= */

  const resetLocalState = () => {
    setCustomerSearch("");
    setSalesPersonSearch("");
    setItemSearch("");
    setCurrencySearch("");
    setEmailSignatureSearch("");
    setBankAccountSearch("");

    setOpenCustomer(false);
    setOpenSalesPerson(false);
    setOpenCurrency(false);
    setOpenEmailSignature(false);
    setOpenBankAccount(false);
    setOpenRowItemDropdown(false);

    setActiveItemId(null);
    setShowSummary(true);
    setShowTerms(false);
    setShowGateway(false);
    setShowSignature(false);
    setShowBankAccount(false);
    setShowSaveMenu(false);
    setShowCustomerDetails(false);
    setShowSalesPersonDetails(false);
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
    setSalesPersonSearch("");
    setItemSearch("");
    setCurrencySearch("");
    setEmailSignatureSearch("");
    setBankAccountSearch("");

    setOpenCustomer(false);
    setOpenCurrency(false);
    setOpenSalesPerson(false);
    setOpenEmailSignature(false);
    setOpenBankAccount(false);
    setOpenRowItemDropdown(false);

    setActiveItemId(null);
    setShowSummary(true);
    setShowTerms(false);
    setShowGateway(false);
    setShowSignature(false);
    setShowBankAccount(false);
    setShowSaveMenu(false);
    setShowCustomerDetails(false);
    setShowSalesPersonDetails(false);
    setDiscountMode("COMMON");


    /* ==========================================
       DEFAULT INVOICE TYPE
    ========================================== */

    dispatch(
      setInvoiceField({
        field: "invoiceType",
        value: location.state?.invoiceType || "PRODUCT_INVOICE",
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

    dispatch(setInvoiceField({
      field: "invoiceDate",
      value: "",
    }));
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
      CLEAR SALESPERSON
   ========================================== */

    dispatch(
      setInvoiceField({
        field: "salesPersonId",
        value: "",
      })
    );

    dispatch(
      setInvoiceField({
        field: "salesPersonName",
        value: "",
      })
    );


    /* ==========================================
     CLEAR CURRENCY
  ========================================== */

    dispatch(
      setInvoiceField({
        field: "currencyId",
        value: "",
      })

    );

    dispatch(
      setInvoiceField({
        field: "currencyName",
        value: "",
      })
    );



    /* ==========================================
   CLEAR EMAILSIGNATURE
========================================== */

    dispatch(
      setInvoiceField({
        field: "emailSignatureId",
        value: "",
      })

    );

    dispatch(
      setInvoiceField({
        field: "emailSignatureName",
        value: "",
      })
    );



    /* ==========================================
  CLEAR BankAccount
========================================== */

    dispatch(
      setInvoiceField({
        field: "bankAccountId",
        value: "",
      })

    );

    dispatch(
      setInvoiceField({
        field: "bankName",
        value: "",
      })
    );

    dispatch(
      setInvoiceField({
        field: "ifsc",
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
      LOAD INVOICE DATE
   ========================================================= */

  useEffect(() => {
    if (!invoice.invoiceDate) {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");

      dispatch(
        setInvoiceField({
          field: "invoiceDate",
          value: `${year}-${month}-${day}`,
        })
      );
    }
  }, [invoice.invoiceDate, dispatch]);


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
        salesPersonDropdownRef.current &&
        !salesPersonDropdownRef.current.contains(
          event.target
        )
      ) {
        setOpenSalesPerson(false);
      }

      if (
        currencyDropdownRef.current &&
        !currencyDropdownRef.current.contains(
          event.target
        )
      ) {
        setOpenCurrency(false);
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


      // Email Signature dropdown
      if (
        emailSignatureDropdownRef.current &&
        !emailSignatureDropdownRef.current.contains(event.target)
      ) {
        setOpenEmailSignature(false);
        setEmailSignatureSearch("");
      }

      // Bank Account dropdown
      if (
        bankAccountDropdownRef.current &&
        !bankAccountDropdownRef.current.contains(event.target)
      ) {
        setOpenBankAccount(false);
        setBankAccountSearch("");
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

    handleRequestLeave();

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
  SALES PERSON NAME
  ========================================================= */

  const getSalesPersonName = (salesPerson) =>
    salesPerson?.salesPersonName ||
    salesPerson?.name ||
    [
      salesPerson?.firstName,
      salesPerson?.lastName,
    ].filter(Boolean).join(" ") ||
    "";


  /* =========================================================
     SALES PERSON SEARCH
  ========================================================= */

  const filteredSalesPersons =
    useMemo(() => {

      const search =
        salesPersonSearch
          .trim()
          .toLowerCase();


      if (!search) {
        return salesPersons;
      }


      return salesPersons.filter(
        (salesPerson) => {

          const name =
            getSalesPersonName(
              salesPerson
            ).toLowerCase();


          const email =
            String(
              salesPerson?.email ||
              ""
            ).toLowerCase();


          const phone =
            String(
              salesPerson?.mobile ||
              salesPerson?.phoneNumber ||
              salesPerson?.mobileNumber ||
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
      salesPersons,
      salesPersonSearch,
    ]);


  /* =========================================================
  CURRENCY NAME
  ========================================================= */

  const getCurrencyName = (currency) => {
    return (
      currency?.currencyName ||
      currency?.name ||
      currency?.currencyCode ||
      currency?.code ||
      ""
    );
  };


  /* =========================================================
   CURRENCY SEARCH
========================================================= */

  const filteredcurrencies = useMemo(() => {
    const search = currencySearch.trim().toLowerCase();

    if (!search) return currencies;

    return currencies.filter((currency) => {
      const name = getCurrencyName(currency).toLowerCase();

      const symbol = String(currency?.symbol || "").toLowerCase();

      const code = String(
        currency?.currencyCode || currency?.code || ""
      ).toLowerCase();

      return (
        name.includes(search) ||
        symbol.includes(search) ||
        code.includes(search)
      );
    });
  }, [currencies, currencySearch]);



  /* =========================================================
 EMAILSIGNATURE NAME
 ========================================================= */

  const getEmailSignatureName = (emailSignature) => {
    return (
      emailSignature?.signatureName ||
      emailSignature?.name ||
      emailSignature?.userId ||
      emailSignature?.id ||
      ""
    );
  };



  /* =========================================================
     EMAIL SIGNATURE SEARCH
  ========================================================= */

  const filteredEmailSignatures = useMemo(() => {
    const search = emailSignatureSearch.trim().toLowerCase();

    if (!search) {
      return emailSignatures;
    }

    return emailSignatures.filter((emailSignature) => {
      const name = String(
        getEmailSignatureName(emailSignature)
      ).toLowerCase();

      const userId = String(
        emailSignature?.userId ?? ""
      ).toLowerCase();

      return (
        name.includes(search) ||
        userId.includes(search)
      );
    });
  }, [emailSignatures, emailSignatureSearch]);




  /* =========================================================
BANKACCOUNT NAME
========================================================= */

  const getBankAccountName = (bankAccount) => {
    return (
      bankAccount?.bankName ||
      bankAccount?.name ||
      bankAccount?.bankAccountId ||
      bankAccount?.id ||
      ""
    );
  };



  /* =========================================================
     EMAIL SIGNATURE SEARCH
  ========================================================= */

  const filteredBankAccounts = useMemo(() => {
    const search = bankAccountSearch.trim().toLowerCase();

    if (!search) {
      return bankAccounts;
    }

    return bankAccounts.filter((bankAccount) => {
      const name = String(
        getBankAccountName(bankAccount)
      ).toLowerCase();

      return (
        name.includes(search) ||
        ""
      );
    });
  }, [bankAccounts, bankAccountSearch]);


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
     SALES PERSON SELECT
  ========================================================= */

  const handleSalesPersonSelect = (
    salesPerson
  ) => {

    if (!salesPerson) {
      return;
    }


    const name =
      getSalesPersonName(
        salesPerson
      );


    dispatch(
      setInvoiceField({
        field:
          "salesPersonId",
        value:
          salesPerson.id,
      })
    );


    dispatch(
      setInvoiceField({
        field:
          "salesPersonName",
        value:
          name,
      })
    );


    setSalesPersonSearch("");

    setOpenSalesPerson(false);
  };


  /* =========================================================
     CURRENCY SELECT
  ========================================================= */



  const handleCurrencySelect = async (currencyInput) => {
    const selectedCurrency =
      currencyInput && typeof currencyInput === "object"
        ? currencies.find(
          (currency) =>
            String(currency.id) === String(currencyInput.id)
        ) || currencyInput
        : currencies.find(
          (currency) =>
            String(currency.id) === String(currencyInput)
        );

    if (!selectedCurrency?.id) {
      toast.error("Please select a valid currency");
      return false;
    }

    const inrCurrency = getINRCurrency();

    if (!inrCurrency?.id) {
      toast.error("INR currency was not found. Please check currency settings.");
      return false;
    }

    const targetCode = getCurrencyCode(selectedCurrency);
    const isINR = targetCode === "INR";

    if (!isINR && String(selectedCurrency.id) === String(inrCurrency.id)) {
      toast.error("Currency configuration is inconsistent");
      return false;
    }

    try {
      let nextRate = 1;

      if (!isINR) {
        // Rate convention: 1 selected currency unit = X INR.
        const rateResponse = await dispatch(
          fetchExchangeRate({
            fromCurrencyId: selectedCurrency.id,
            toCurrencyId: inrCurrency.id,
          })
        ).unwrap();

        const parsedRate = Number(
          rateResponse?.data?.rate ??
          rateResponse?.rate
        );

        if (!Number.isFinite(parsedRate) || parsedRate <= 0) {
          throw new Error("The exchange-rate API returned an invalid rate");
        }

        nextRate = parsedRate;
      }

      const updatedItems = (invoice.invoiceItems || []).map((item) => {
        const baseUnitPrice = getBasePrice(
          item,
          invoice.exchangeRate
        );

        return {
          ...item,
          baseUnitPrice: Number(baseUnitPrice.toFixed(4)),
          unitPrice: roundMoney(baseUnitPrice / nextRate),
        };
      });

      dispatch(
        setInvoiceField({
          field: "currencyId",
          value: selectedCurrency.id,
        })
      );

      dispatch(
        setInvoiceField({
          field: "currencyName",
          value: selectedCurrency.currencyName || targetCode,
        })
      );

      dispatch(
        setInvoiceField({
          field: "currencyCode",
          value: targetCode,
        })
      );

      dispatch(
        setInvoiceField({
          field: "exchangeRate",
          value: nextRate,
        })
      );

      dispatch(setInvoiceItems(updatedItems));

      setCurrencySearch("");
      setOpenCurrency(false);

      return true;
    } catch (error) {
      console.error("Currency exchange rate error:", error);

      toast.error(
        typeof error === "string"
          ? error
          : error?.message || "Unable to load the exchange rate"
      );

      return false;
    }
  };



  /* =========================================================
     EMAIL SIGNATURE SELECT
  ========================================================= */


  const handleEmailSignatureSelect = (emailSignature) => {
    if (!emailSignature?.id) return;

    const name = getEmailSignatureName(emailSignature);

    dispatch(
      setInvoiceField({
        field: "emailSignatureId",
        value: emailSignature.id,
      })
    );

    dispatch(
      setInvoiceField({
        field: "signatureName",
        value: name,
      })
    );

    setEmailSignatureSearch("");
    setOpenEmailSignature(false);
  };


  /* =========================================================
     BankAccount SELECT
  ========================================================= */


  const handleBankAccountSelect = (bankAccount) => {
    if (!bankAccount) return;

    const name = getBankAccountName(bankAccount);

    dispatch(
      setInvoiceField({
        field: "bankAccountId",
        value: bankAccount.id,
      })
    );

    dispatch(
      setInvoiceField({
        field: "bankAccountName",
        value: name,
      })
    );

    // Clear bank account search and close its dropdown
    setBankAccountSearch("");
    setOpenBankAccount(false);
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

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    dispatch(
      setInvoiceField({
        field: "dueDate",
        value: `${year}-${month}-${day}`,
      })
    );
  };

  /* =========================================================
     TERMS
  ========================================================= */

  const handleTermsChange = (field, value) => {
    // Update the selected payment terms
    dispatch(
      setInvoiceField({
        field,
        value,
      })
    );

    if (field === "termsAndConditions") {
      const invoiceDate = invoice.invoiceDate;

      if (!invoiceDate) return;

      const daysMap = {
        "Due on Receipt": 0,
        "Net 15": 15,
        "Net 30": 30,
      };

      const dueDate = new Date(
        `${invoiceDate.slice(0, 10)}T00:00:00`
      );

      dueDate.setDate(
        dueDate.getDate() + (daysMap[value] ?? 0)
      );

      const year = dueDate.getFullYear();
      const month = String(dueDate.getMonth() + 1).padStart(2, "0");
      const day = String(dueDate.getDate()).padStart(2, "0");

      dispatch(
        setInvoiceField({
          field: "dueDate",
          value: `${year}-${month}-${day}`,
        })
      );
    }
  };

  // const invoiceDate = formatDateForInput(date);


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



  const handleProductSelect = (index, product) => {
    if (!product?.id) {
      toast.error("Please select a valid product");
      return;
    }

    const baseUnitPrice = Number(
      product.sellingPrice ??
      product.rate ??
      product.price ??
      0
    );

    if (!Number.isFinite(baseUnitPrice) || baseUnitPrice < 0) {
      toast.error("Product price is invalid");
      return;
    }

    const exchangeRate = getValidRate(invoice.exchangeRate);
    const unitPrice = roundMoney(baseUnitPrice / exchangeRate);

    const productName =
      product.productName ||
      product.itemName ||
      product.name ||
      "";

    updateItem(index, "productId", product.id);
    updateItem(index, "description", productName);
    updateItem(index, "baseUnitPrice", Number(baseUnitPrice.toFixed(4)));
    updateItem(index, "unitPrice", unitPrice);

    if (product.unitId) {
      updateItem(index, "unitId", product.unitId);
    }

    if (product.sizeId) {
      updateItem(index, "sizeId", product.sizeId);
    }

    setItemSearch("");
    setOpenRowItemDropdown(false);
    setActiveItemId(null);

    if (index === invoiceItems.length - 1) {
      dispatch(addInvoiceItem(createEmptyItem()));
    }
  };



  const handleUnitPriceChange = (index, value) => {
    const unitPrice = Number(value || 0);
    const exchangeRate = getValidRate(invoice.exchangeRate);

    updateItem(index, "unitPrice", value);
    updateItem(
      index,
      "baseUnitPrice",
      Number((unitPrice * exchangeRate).toFixed(4))
    );
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
      !invoice.salesPersonId
    ) {

      toast.error(
        "Please select a sales person"
      );

      return false;
    }

    if (
      !invoice.currencyId
    ) {

      toast.error(
        "Please select a Currency"
      );

      return false;
    }


    if (
      !invoice.emailSignatureId
    ) {

      toast.error(
        "Please select a EmailSignature"
      );

      return false;
    }


    if (
      !invoice.bankAccountId
    ) {

      toast.error(
        "Please select a bankAcoount"
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
        currencyCode === "INR" &&
        !item.taxMasterId
      ) {
        toast.error(
          `Please select tax for item ${index + 1}`
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
    const validItems = invoiceItems.filter(
      (item) => item.productId || item.description,
    );

    const exchangeRate = getValidRate(invoice.exchangeRate);

    const commonDiscount =
      discountMode === "COMMON"
        ? Number(invoice.discountAmount || 0)
        : 0;

    const totalGrossAmount = validItems.reduce(
      (total, item) => {
        const quantity = Number(item?.quantity || 0);
        const unitPrice = Number(item?.unitPrice || 0);

        return total + quantity * unitPrice;
      },
      0,
    );

    return {
      invoiceNumber: invoice.invoiceNumber || null,

      invoiceType: invoice.invoiceType || "PRODUCT_INVOICE",
      invoiceStatus: invoice.invoiceStatus || "DRAFT",

      customerId: Number(invoice.customerId),
      salesPersonId: invoice.salesPersonId
        ? Number(invoice.salesPersonId)
        : null,

      emailSignatureId: Number(invoice.emailSignatureId),

      bankAccountId: Number(invoice.bankAccountId),

      currencyId: Number(invoice.currencyId),
      exchangeRate,

      invoiceDate: invoice.invoiceDate,
      dueDate: invoice.dueDate || null,

      shippingAmount: Number(invoice.shippingAmount || 0),

      notes: invoice.notes?.trim() || "",
      termsAndConditions:
        invoice.termsAndConditions?.trim() || "",

      discountMode,

      discountAmount:
        discountMode === "COMMON" ? commonDiscount : 0,

      invoiceItems: validItems.map((item) => {
        const quantity = Number(item?.quantity || 0);
        const unitPrice = Number(item?.unitPrice || 0);

        const grossAmount = quantity * unitPrice;

        let discountAmount = 0;

        // PRODUCT DISCOUNT
        if (discountMode === "PRODUCT") {
          discountAmount = Number(item?.discountAmount || 0);
        }

        // COMMON DISCOUNT — distribute proportionally
        if (discountMode === "COMMON" && totalGrossAmount > 0) {
          discountAmount =
            commonDiscount * (grossAmount / totalGrossAmount);
        }

        // Preserve original base-currency price.
        // Fall back for existing items without baseUnitPrice.
        const baseUnitPrice =
          item.baseUnitPrice !== null &&
            item.baseUnitPrice !== undefined &&
            item.baseUnitPrice !== ""
            ? Number(item.baseUnitPrice)
            : unitPrice * exchangeRate;

        return {
          ...(item.id ? { id: item.id } : {}),

          productId: Number(item.productId),
          description: item.description?.trim() || "",

          unitId: item.unitId ? Number(item.unitId) : null,
          sizeId: item.sizeId ? Number(item.sizeId) : null,

          quantity,
          unitPrice,
          baseUnitPrice: Number(baseUnitPrice.toFixed(4)),

          discountAmount: Number(discountAmount.toFixed(2)),

          taxMasterId: item.taxMasterId
            ? Number(item.taxMasterId)
            : null,
        };
      }),
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




  const getCurrencyCode = (currency) =>
    String(
      currency?.currencyCode ||
      currency?.code ||
      ""
    ).trim().toUpperCase();

  const getINRCurrency = () =>
    currencies.find(
      (currency) => getCurrencyCode(currency) === "INR"
    ) || null;

  const getValidRate = (rate) => {
    const parsedRate = Number(rate);

    return Number.isFinite(parsedRate) && parsedRate > 0
      ? parsedRate
      : 1;
  };

  const roundMoney = (value) =>
    Number((Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100).toFixed(2));

  const getBasePrice = (item, exchangeRate = invoice.exchangeRate) => {
    if (
      item?.baseUnitPrice !== undefined &&
      item?.baseUnitPrice !== null &&
      item?.baseUnitPrice !== ""
    ) {
      return Number(item.baseUnitPrice);
    }

    // Exchange rate = INR per selected currency unit.
    return Number(item?.unitPrice || 0) * getValidRate(exchangeRate);
  };


  const selectedCurrency = currencies.find(
    (currency) =>
      String(currency.id) === String(invoice.currencyId),
  );

  const currencyCode =
    selectedCurrency?.currencyCode ||
    invoice.currencyCode ||
    invoice.currencyName ||
    "INR";

  const currencySymbol =
    selectedCurrency?.symbol ||
    (currencyCode === "INR" ? "₹" : currencyCode);

  const formatCurrency = (amount) =>
    `${currencySymbol} ${fmt(Number(amount || 0))}`;

  /* =========================================================
     RENDER
  ========================================================= */

  return (

    <>
      <div className="flex flex-col h-full min-h-0 bg-gray-50 px-3.5 py-5">

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

          <div className="mr-2 px-6 py-4 bg-white border-b border-gray-200 shrink-0">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3">

                {/* <div className="w-7 h-7 border-2 border-[#12203F] rounded-sm flex items-center justify-center">

                  <div className="w-3 h-3 border border-[#12203F] rounded-sm" />

                </div> */}
                <div
                  className="w-10 h-10 rounded-lg bg-[#0095FD] border border-blue-100 flex items-center justify-center cursor-pointer"
                  onClick={() => navigate("/bankAccount")}
                >
                  <BoxIcon
                    size={20}
                    className="text-[#FCF7F8]"
                  />
                </div>

                <h1 className="text-lg font-semibold text-[#0095FD]">
                  {isEdit ? "Edit " : ""}
                  {{
                    PRODUCT_INVOICE: "Product Invoice",
                    SERVICE_INVOICE: "Service Invoice",
                    SALE_INVOICE: "Sales Invoice",
                    PURCHASE_INVOICE: "Purchase Invoice",
                    TAX_INVOICE: "Tax Invoice",
                  }[invoice.invoiceType] || ""}
                </h1>

              </div>


              <div className="flex items-center gap-4">

                <div
                  type="button"
                  className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700"
                >

                  {invoice.invoiceType || ""}

                </div>


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

          <div className="flex-1 overflow-y-auto px-5 py-6">

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
                    className="relative w-[350px]"
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
                          // onClick={() => {
                          //   setDropdownOpen(
                          //     false
                          //   );
                          //   dispatch(
                          //     openModal({
                          //       type: "addCustomer",
                          //     })
                          //   );

                          // }}

                          onClick={() => (navigate("/customers/new"))}
                        >

                          <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center"
                          >

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

                    {invoice?.currencyName || "INR"}

                  </div>

                </div>



              </div>


              {/* DETAILS */}

              {invoice.customerId && (

                <div className="ml-auto w-60 shrink-0">

                  <button
                    type="button"
                    onClick={() =>
                      setShowCustomerDetails(
                        (v) => !v
                      )
                    }
                    className="w-full h-11 px-4 flex items-center justify-between bg-slate-600 hover:bg-slate-700 text-white rounded-md font-semibold text-sm"
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
              CURRENCY
          ================================================= */}

            <div className="mb-6 flex items-start">

              <label className="w-44 pt-2 text-sm font-medium text-red-500 shrink-0">
                Currency
              </label>


              <div className="flex-1">

                {/* ROW 1 */}

                <div className="flex items-center gap-3">

                  <div
                    ref={
                      currencyDropdownRef
                    }
                    className="relative w-[350px]"
                  >

                    <div className="flex">

                      <div className="relative flex-1">

                        <input
                          type="text"
                          value={currencySearch || invoice.currencyName || ""}
                          placeholder={
                            currencyLoading
                              ? "Loading currencies..."
                              : "Select or add a currency"
                          }
                          onClick={() =>
                            setOpenCurrency(
                              true
                            )
                          }
                          onChange={(
                            e
                          ) => {

                            setCurrencySearch(
                              e.target.value
                            );

                            setOpenCurrency(
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
                          setOpenCurrency(
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


                    {/* CURRENCY DROPDOWN */}

                    {openCurrency && (

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
                              placeholder="Search currency"
                              value={
                                currencySearch
                              }
                              onChange={(
                                e
                              ) =>
                                setCurrencySearch(
                                  e.target.value
                                )
                              }
                              className="w-full border border-blue-300 rounded pl-10 pr-3 py-2 text-sm focus:outline-none"
                            />

                          </div>

                        </div>


                        <div className="max-h-60 overflow-y-auto">

                          {currencyLoading ? (

                            <div className="px-4 py-5 text-center text-gray-500 text-sm">
                              Loading currencies...
                            </div>

                          ) : currencyError ? (

                            <div className="px-4 py-5 text-center text-red-500 text-sm">
                              Failed to load currencies
                            </div>

                          ) : filteredcurrencies.length ===
                            0 ? (

                            <div className="px-4 py-5 text-center text-gray-400 text-sm">

                              {currencySearch
                                ? "No currencies found"
                                : "No currencies available"}

                            </div>

                          ) : (

                            filteredcurrencies.map(
                              (
                                currency
                              ) => {

                                const name =
                                  getCurrencyName(
                                    currency
                                  );

                                return (

                                  <button
                                    type="button"
                                    key={
                                      currency.id
                                    }
                                    onClick={async () => {
                                      await handleCurrencySelect(currency.id);
                                      setOpenCurrency(false);
                                      setCurrencySearch("");
                                    }}
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

                                        {currency.symbol ||
                                          ""}

                                      </p>

                                      <p className="text-xs opacity-70 truncate">

                                        {currency.currencyCode ||
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
                          // onClick={() => {
                          //   setDropdownOpen(
                          //     false
                          //   );
                          //   dispatch(
                          //     openModal({
                          //       type: "addCustomer",
                          //     })
                          //   );

                          // }}

                          onClick={() => (navigate("/currencies/new"))}
                        >

                          <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center"
                          >

                            <Plus
                              size={14}
                            />

                          </div>

                          <span className="font-medium">
                            New Currency
                          </span>

                        </button>

                      </div>
                    )}

                  </div>



                </div>
              </div>

            </div>




            {/* =================================================
              SALES PERSON
          ================================================= */}

            <div className="mb-6 flex items-start">

              <label className="w-44 pt-2 text-sm font-medium text-red-500 shrink-0">
                Sales Person Name
              </label>


              <div className="flex-1">

                {/* ROW 1 */}

                <div className="flex items-center gap-3">

                  <div
                    ref={
                      salesPersonDropdownRef
                    }
                    className="relative w-[350px]"
                  >

                    <div className="flex">

                      <div className="relative flex-1">

                        <input
                          type="text"
                          value={
                            salesPersonSearch ||
                            invoice.salesPersonName ||
                            ""
                          }
                          placeholder={
                            salesPersonLoading
                              ? "Loading sales persons..."
                              : "Select or add a sales person"
                          }
                          onClick={() =>
                            setOpenSalesPerson(
                              true
                            )
                          }
                          onChange={(
                            e
                          ) => {

                            setSalesPersonSearch(
                              e.target.value
                            );

                            setOpenSalesPerson(
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
                          setOpenSalesPerson(
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


                    {/* SALES PERSON DROPDOWN */}

                    {openSalesPerson && (

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
                              placeholder="Search sales person"
                              value={
                                salesPersonSearch
                              }
                              onChange={(
                                e
                              ) =>
                                setSalesPersonSearch(
                                  e.target.value
                                )
                              }
                              className="w-full border border-blue-300 rounded pl-10 pr-3 py-2 text-sm focus:outline-none"
                            />

                          </div>

                        </div>


                        <div className="max-h-60 overflow-y-auto">

                          {salesPersonLoading ? (

                            <div className="px-4 py-5 text-center text-gray-500 text-sm">
                              Loading sales persons...
                            </div>

                          ) : salesPersonError ? (

                            <div className="px-4 py-5 text-center text-red-500 text-sm">
                              Failed to load sales persons
                            </div>

                          ) : filteredSalesPersons.length ===
                            0 ? (

                            <div className="px-4 py-5 text-center text-gray-400 text-sm">

                              {salesPersonSearch
                                ? "No sales persons found"
                                : "No sales persons available"}

                            </div>

                          ) : (

                            filteredSalesPersons.map(
                              (
                                salesPerson
                              ) => {

                                const name =
                                  getSalesPersonName(
                                    salesPerson
                                  );

                                return (

                                  <button
                                    type="button"
                                    key={
                                      salesPerson.id
                                    }
                                    onClick={() =>
                                      handleSalesPersonSelect(
                                        salesPerson
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

                                        {salesPerson.email ||
                                          salesPerson.mobile ||
                                          salesPerson.phoneNumber ||
                                          salesPerson.mobileNumber ||
                                          ""}

                                      </p>

                                      <p className="text-xs opacity-70 truncate">

                                        {salesPerson.salesPersonType ||
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
                          // onClick={() => {
                          //   setDropdownOpen(
                          //     false
                          //   );
                          //   dispatch(
                          //     openModal({
                          //       type: "addCustomer",
                          //     })
                          //   );

                          // }}

                          onClick={() => (navigate("/salespersons/new"))}
                        >

                          <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center"
                          >

                            <Plus
                              size={14}
                            />

                          </div>

                          <span className="font-medium">
                            New Sales Person
                          </span>

                        </button>

                      </div>
                    )}

                  </div>



                </div>
              </div>

            </div>


            {/* =================================================
              INVOICE NUMBER
          ================================================= */}

            <div className="flex items-center mb-4">
              <label className="w-44 shrink-0 text-sm font-medium text-gray-700">
                Invoice Date
              </label>

              <div className="relative w-[360px]">
                <div className="flex h-10 items-center gap-2 rounded-md border border-gray-200 bg-white px-3 pr-10 text-sm text-gray-800">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500">
                    <span className="h-2 w-2 rounded-full border-2 border-white" />
                  </span>

                  <span className="truncate">
                    {invoice?.invoiceDate
                      ? new Date(
                        `${invoice.invoiceDate.slice(0, 10)}T00:00:00`
                      ).toLocaleDateString("en-IN")
                      : "--"}
                  </span>

                  <span className="shrink-0 text-gray-400">|</span>

                  <span className="truncate">
                    {invoice?.termsAndConditions || "Due on Receipt"}
                  </span>

                  <span className="shrink-0 text-gray-400">|</span>

                  <span className="shrink-0">
                    {formatDateForInput(invoice?.dueDate) ||
                      calculateDueDate(
                        invoice?.invoiceDate,
                        invoice?.termsAndConditions || "Due on Receipt"
                      )
                      ? new Date(
                        `${(
                          formatDateForInput(invoice?.dueDate) ||
                          calculateDueDate(
                            invoice?.invoiceDate,
                            invoice?.termsAndConditions || "Due on Receipt"
                          )
                        )}T00:00:00`
                      ).toLocaleDateString("en-IN")
                      : "--"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setDateTermsForm({
                      invoiceDate: formatDateForInput(invoice?.invoiceDate),
                      termsAndConditions:
                        invoice?.termsAndConditions || "Due on Receipt",
                      dueDate:
                        formatDateForInput(invoice?.dueDate) ||
                        calculateDueDate(
                          invoice?.invoiceDate,
                          invoice?.termsAndConditions || "Due on Receipt"
                        ),
                    });

                    setShowDateTermsModal(true);
                  }}
                  className="absolute right-1 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded text-blue-500 transition hover:bg-blue-50 hover:text-blue-600"
                  title="Invoice Dates & Terms Settings"
                  aria-label="Edit invoice dates and terms"
                >
                  <Settings size={14} />
                </button>
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


              <div className="w-full max-w-full overflow-x-auto overflow-y-visible">
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
                              <CustomSUSelect
                                value={item.unitId || ""}
                                onChange={(value) => updateItem(index, "unitId", value)}
                                placeholder="Select Unit"
                                searchPlaceholder="Search units..."
                                searchable
                                addNewLabel="Unit"
                                addNewModalType="addUnit"
                                width="w-[130px]"
                                size="sm"
                                options={[
                                  { value: "", label: "Select" },
                                  ...units.map((unit) => ({
                                    value: String(unit.id),
                                    label: unit.unitName || unit.name || unit.unitCode,
                                  })),
                                ]}
                              />
                            </td>


                            {/* SIZE */}

                            <td className="px-3 py-3">
                              <CustomSUSelect
                                value={item.sizeId || ""}
                                onChange={(value) => updateItem(index, "sizeId", value)}
                                placeholder="Select Size"
                                searchPlaceholder="Search sizes..."
                                searchable
                                addNewLabel="Size"
                                addNewModalType="addSize"
                                width="w-[130px]"
                                size="sm"
                                options={[
                                  { value: "", label: "Select" },
                                  ...sizes.map((size) => ({
                                    value: String(size.id),
                                    label: size.sizeName || size.name || size.sizeCode,
                                  })),
                                ]}
                              />
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

                                <span className="block text-center text-sm text-gray-400">
                                  —
                                </span>

                              )}

                            </td>


                            {/* TAX */}

                            <td className="px-3 py-3">

                              <CustomSUSelect
                                value={String(item.taxMasterId ?? "")}
                                onChange={(value) =>
                                  updateItem(index, "taxMasterId", value)
                                }
                                placeholder="Select Tax"
                                searchPlaceholder="Search taxes..."
                                searchable
                                addNewLabel="Tax"
                                addNewModalType="addTaxMaster"
                                width="w-[130px]"
                                size="sm"
                                options={[
                                  {
                                    value: "",
                                    label: "Select Tax",
                                  },
                                  ...taxMasters.map((tax) => {
                                    const rate =
                                      tax.taxPercentage ??
                                      tax.taxRate ??
                                      tax.rate ??
                                      tax.percentage ??
                                      0;

                                    return {
                                      value: String(tax.id),
                                      label: `${tax.taxName || tax.name || tax.taxType || "Tax"} (${rate}%)`,
                                    };
                                  }),
                                ]}
                              />

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
                              <div className="flex items-center justify-start ">
                                <span className="text-xs text-gray-500 whitespace-nowrap">
                                  ({currencyCode})
                                </span>

                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={item.unitPrice ?? 0}
                                  onChange={(event) =>
                                    handleUnitPriceChange(index, event.target.value)
                                  }
                                  className="w-full min-w-0 text-right text-sm border-b border-transparent focus:border-blue-400 focus:outline-none bg-transparent"
                                />
                              </div>

                            </td>


                            {/* AMOUNT */}

                            <td className="px-3 py-3 text-right text-sm font-semibold text-gray-800">

                              ({currencyCode})
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
                        onClick={() => (navigate("/items/newSimple"))}
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
                    Total ({currencyCode})
                  </span>


                  <span className="text-sm font-semibold text-gray-700">

                    {formatCurrency(totals.grandTotal)}

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
                        Sub Total ({currencyCode})
                      </span>


                      <span>
                        {formatCurrency(totals.subtotal)}
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

                        <span>{currencySymbol}</span>


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
                        Tax ({currencyCode})
                      </span>


                      <span>
                        {formatCurrency(totals.tax)}
                      </span>

                    </div>


                    {/* SHIPPING */}

                    <div className="flex justify-between items-center">

                      <span>
                        Shipping
                      </span>


                      <div className="flex items-center gap-1">

                        <span>{currencySymbol}</span>


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
                        Grand Total ({currencyCode})
                      </span>


                      <span>
                        {formatCurrency(totals.grandTotal)}
                      </span>

                    </div>

                  </div>
                )}

              </div>


            </div>

            {/* Add BankAccount */}

            <div className="flex-1 max-w-sm ml-auto">

              <div className="flex justify-between items-center py-3 border-b border-gray-300 mb-4">

                {/* <span className="px-1 w-full text-xl font-semibold text-[#2B7FFF]  rounded ">
                  Add BankAccount

                </span> */}
              </div>

              {/* =================================================
              BankAccount 
          ================================================= */}
              {!showbankAccount ? (

                <button
                  type="button"
                  onClick={() =>
                    setShowBankAccount(
                      true
                    )
                  }
                  className="flex items-center gap-2 text-xl text-blue-500 hover:text-blue-500"
                >

                  <div className="w-8 h-8 px-1 text-blue-400 rounded-full border-2 border-blue-400 flex items-center justify-center">

                    <Landmark
                      size={40}
                    />

                  </div>


                  Select BankAccount

                </button>

              ) : (

                <div>

                  <label className="text-xl font-medium text-blue-500 block mb-1">
                    Bank Account
                  </label>


                  <div className="flex-1">

                    {/* ROW 1 */}

                    <div className="flex items-center gap-3">

                      <div
                        ref={
                          bankAccountDropdownRef
                        }
                        className="relative w-[650px]"
                      >

                        <div className="flex">

                          <div className="relative flex-1">

                            <input
                              type="text"
                              value={
                                bankAccountSearch ||
                                invoice.bankAccountName ||
                                selectedBankAccount?.bankName ||
                                ""
                              }
                              placeholder={
                                bankAccountLoading
                                  ? "Loading bankAccounts..."
                                  : "Select an bankAccount"
                              }
                              onClick={() => {
                                setOpenBankAccount(true);
                                setBankAccountSearch("");
                              }}
                              onChange={(e) => {
                                setBankAccountSearch(e.target.value);
                                setOpenBankAccount(true);
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
                              setOpenBankAccount(
                                true
                              )
                            }
                            className="h-10 w-10 flex items-center justify-center bg-blue-500 hover:bg-emerald-600 text-white rounded-r-md"
                          >

                            <Search
                              size={16}
                            />

                          </button>

                        </div>


                        {/* BANKACCOUNT DROPDOWN */}

                        {openbankAccount && (

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
                                  placeholder="Search sales person"
                                  value={
                                    bankAccountSearch
                                  }
                                  onChange={(
                                    e
                                  ) =>
                                    setBankAccountSearch(
                                      e.target.value
                                    )
                                  }
                                  className="w-full border border-blue-300 rounded pl-10 pr-3 py-2 text-sm focus:outline-none"
                                />

                              </div>

                            </div>


                            <div className="max-h-60 overflow-y-auto">

                              {bankAccountLoading ? (

                                <div className="px-4 py-5 text-center text-gray-500 text-sm">
                                  Loading bankAccounts...
                                </div>

                              ) : bankAccountError ? (

                                <div className="px-4 py-5 text-center text-red-500 text-sm">
                                  Failed to load bankAccounts
                                </div>

                              ) : filteredBankAccounts.length ===
                                0 ? (

                                <div className="px-4 py-5 text-center text-gray-400 text-sm">

                                  {bankAccountSearch
                                    ? "No bankAccounts found"
                                    : "No bankAccounts available"}

                                </div>

                              ) : (

                                filteredBankAccounts.map(
                                  (
                                    bankAccount
                                  ) => {

                                    const name =
                                      getBankAccountName(
                                        bankAccount
                                      );

                                    return (

                                      <button
                                        type="button"
                                        key={
                                          bankAccount.id
                                        }
                                        onClick={() =>
                                          handleBankAccountSelect(
                                            bankAccount
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

                                            {bankAccount.bankName ||
                                              bankAccount.id ||

                                              ""}

                                          </p>

                                          <p className="text-xs opacity-70 truncate">

                                            {bankAccount.accountNumber ||
                                              ""}

                                          </p>
                                          <p className="text-xs opacity-70 truncate">

                                            {bankAccount.ifsc ||

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

                              onClick={() =>
                                (navigate("/bankAccount/newSimple"))}
                            >

                              <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center"
                              >

                                <Plus
                                  size={14}
                                />

                              </div>

                              <span className="font-medium">
                                New BankAccount
                              </span>

                            </button>

                          </div>
                        )}

                      </div>



                    </div>
                  </div>

                </div>

              )}
            </div>


            {/* Add Signature */}

            <div className="flex-1 max-w-sm ml-auto">

              <div className="flex justify-between items-center py-3 border-b border-gray-300 mb-4">

                <div >

                  {/* <span className="px-1 w-full text-xl font-semibold text-[#2B7FFF] rounded ">
                    Add Signature
                  </span> */}

                </div>
              </div>


              {/* =================================================
              Signatures
          ================================================= */}
              {!showSignature ? (

                <button
                  type="button"
                  onClick={() =>
                    setShowSignature(
                      true
                    )
                  }
                  className="flex items-center gap-2 text-xl text-blue-500 hover:text-blue-500"
                >

                  <div className="w-8 h-8 px-1 text-blue-400 rounded-full border-2 border-blue-400 flex items-center justify-center">
                    <ClipboardPenIcon
                      size={40}
                    />


                  </div>


                  Select Signature

                </button>

              ) : (

                <div>

                  <label className="text-xl font-medium text-blue-500 block mb-1">
                    Signature
                  </label>


                  <div className="flex-1">

                    {/* ROW 1 */}

                    <div className="flex items-center gap-3">

                      <div
                        ref={
                          emailSignatureDropdownRef
                        }
                        className="relative w-[650px]"
                      >

                        <div className="flex">

                          <div className="relative flex-1">


                            <input
                              type="text"
                              value={
                                emailSignatureSearch ||
                                invoice.signatureName ||
                                getEmailSignatureName(selectedSignature) ||
                                ""
                              }
                              placeholder="Select an email signature"
                              onClick={() => {
                                setEmailSignatureSearch("");
                                setOpenEmailSignature(true);
                              }}
                              onChange={(e) => {
                                setEmailSignatureSearch(e.target.value);
                                setOpenEmailSignature(true);
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
                              setOpenEmailSignature(
                                true
                              )
                            }
                            className="h-10 w-10 flex items-center justify-center bg-blue-500 hover:bg-emerald-600 text-white rounded-r-md"
                          >

                            <Search
                              size={16}
                            />

                          </button>

                        </div>


                        {/* SALES PERSON DROPDOWN */}

                        {openEmailSignature && (

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
                                  placeholder="Search sales person"
                                  value={
                                    emailSignatureSearch
                                  }
                                  onChange={(
                                    e
                                  ) =>
                                    setEmailSignatureSearch(
                                      e.target.value
                                    )
                                  }
                                  className="w-full border border-blue-300 rounded pl-10 pr-3 py-2 text-sm focus:outline-none"
                                />

                              </div>

                            </div>


                            <div className="max-h-60 overflow-y-auto">

                              {emailSignaturesLoading ? (

                                <div className="px-4 py-5 text-center text-gray-500 text-sm">
                                  Loading emailSignatures...
                                </div>

                              ) : emailSignatureError ? (

                                <div className="px-4 py-5 text-center text-red-500 text-sm">
                                  Failed to load emailSignatures
                                </div>

                              ) : filteredEmailSignatures.length ===
                                0 ? (

                                <div className="px-4 py-5 text-center text-gray-400 text-sm">

                                  {emailSignatureSearch
                                    ? "No emailSignatures found"
                                    : "No emailSignatures available"}

                                </div>

                              ) : (

                                filteredEmailSignatures.map(
                                  (
                                    emailSignature
                                  ) => {

                                    const name =
                                      getEmailSignatureName(
                                        emailSignature
                                      );

                                    return (

                                      <button
                                        type="button"
                                        key={emailSignature.id}
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEmailSignatureSelect(emailSignature);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-blue-500 hover:text-white"
                                      >
                                        <div className="w-9 h-9 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-medium shrink-0">
                                          {name.charAt(0).toUpperCase()}
                                        </div>

                                        <div className="min-w-0">
                                          <p className="font-medium truncate">{name}</p>
                                          <p className="text-xs opacity-70 truncate">
                                            {emailSignature.userId ?? ""}
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
                              onClick={() =>
                                dispatch(
                                  openModal({
                                    type: "addEmailSignature",
                                    data: null,
                                  })
                                )
                              }
                            >
                              <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center">
                                <Plus size={14} />
                              </div>

                              <span className="font-medium">
                                New Email Signature
                              </span>
                            </button>

                          </div>
                        )}

                      </div>



                    </div>
                  </div>

                </div>

              )}
            </div>




            {/* Add Other Details */}
            <div className="space-y-3 mb-8 ">

              {/* =================================================
              TERMS
          ================================================= */}

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

          <div className="border-t border-gray-200 bg-white px-3 py-2 flex items-center gap-3 z-30 shrink-0">

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

      </div >


      {/* INVOICE TYPE SELECTION */}

      {
        showInvoiceTypeOptions && !isEditMode && (
          <div
            onClick={handleInvoiceTypeBackdropClick}
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="invoice-type-title"
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
                <Package className="text-[#0F4659]" size={26} />
              </div>

              <h2
                id="invoice-type-title"
                className="text-xl font-semibold text-gray-900"
              >
                Create Invoice
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Choose the type of invoice you want to create.
              </p>

              <div className="mt-6 flex flex-col gap-3">
                {/* PRODUCT INVOICE */}
                <button
                  type="button"
                  onClick={handleProductInvoice}
                  className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 text-left transition hover:border-blue-400 hover:bg-blue-50"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <Package className="text-blue-600" size={21} />
                  </div>

                  <div>
                    <p className="font-semibold text-gray-800">
                      Product Invoice
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Create invoices for products and inventory.
                    </p>
                  </div>
                </button>

                {/* SERVICE INVOICE */}
                <button
                  type="button"
                  onClick={handleServiceInvoice}
                  className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 text-left transition hover:border-emerald-400 hover:bg-emerald-50"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                    <Wrench className="text-emerald-600" size={21} />
                  </div>

                  <div>
                    <p className="font-semibold text-gray-800">
                      Service Invoice
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Create invoices for services.
                    </p>
                  </div>
                </button>

                {/* SALE INVOICE */}
                <button
                  type="button"
                  onClick={handleSaleInvoice}
                  className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 text-left transition hover:border-blue-400 hover:bg-blue-50"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <Package className="text-blue-600" size={21} />
                  </div>

                  <div>
                    <p className="font-semibold text-gray-800">
                      Sale Invoice
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Create invoices for products and inventory.
                    </p>
                  </div>
                </button>

              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )
      }

      {
        showLeaveConfirmation && (
          <div
            className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/50 p-4"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                handleStayOnInvoiceType();
              }
            }}
          >
            <div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="leave-invoice-title"
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
            >
              <h2
                id="leave-invoice-title"
                className="text-lg font-semibold text-gray-900"
              >
                Leave Invoice Creation?
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Do you want to leave this page or stay and choose an invoice type?
              </p>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleStayOnInvoiceType}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Stay Here
                </button>

                <button
                  type="button"
                  onClick={handleLeaveInvoiceType}
                  className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
                >
                  Leave
                </button>
              </div>
            </div>
          </div>
        )
      }



      {/* Invoice Dates & Terms Modal */}
      {
        showDateTermsModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-xl rounded-xl bg-white shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                <div className="flex items-center gap-3">
                  <UserKeyIcon
                    size={22}
                    strokeWidth={2}
                    className="text-blue-500"
                  />

                  <h2 className="text-lg font-semibold text-blue-500">
                    Invoice Dates & Terms
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setShowDateTermsModal(false)}
                  className="text-2xl text-gray-500 transition hover:text-red-500"
                  aria-label="Close modal"
                >
                  &times;
                </button>
              </div>

              {/* Form */}
              <div className="space-y-5 p-6">
                {/* Invoice Date */}
                <div className="grid grid-cols-[130px_minmax(0,1fr)] items-center gap-4">
                  <label className="text-sm font-medium text-red-500">
                    Invoice Date*
                  </label>

                  <DatePicker
                    selected={
                      dateTermsForm.invoiceDate
                        ? new Date(`${dateTermsForm.invoiceDate.slice(0, 10)}T00:00:00`)
                        : null
                    }
                    onChange={(date) => {
                      const invoiceDate = date ? formatDateForInput(date) : "";

                      setDateTermsForm((prev) => {
                        const termsAndConditions =
                          prev.termsAndConditions || "Due on Receipt";

                        return {
                          ...prev,
                          invoiceDate,
                          dueDate: invoiceDate
                            ? calculateDueDate(invoiceDate, termsAndConditions)
                            : "",
                        };
                      });
                    }}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Select invoice date"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
                    isClearable
                    showPopperArrow={false}
                  />
                </div>

                {/* Terms */}
                <div className="grid grid-cols-[130px_minmax(0,1fr)] items-center gap-4">
                  <label className="text-sm font-medium text-red-500">
                    Terms*
                  </label>

                  <CustomSelect
                    value={dateTermsForm.termsAndConditions || "Due on Receipt"}
                    onChange={(value) => {
                      setDateTermsForm((prev) => ({
                        ...prev,
                        termsAndConditions: value,
                        dueDate: calculateDueDate(prev.invoiceDate, value),
                      }));
                    }}
                    width="w-full"
                    size="lg"
                    options={[
                      { value: "Due on Receipt", label: "Due on Receipt" },
                      { value: "Net 15", label: "Net 15" },
                      { value: "Net 30", label: "Net 30" },
                    ]}
                  />
                </div>

                {/* Due Date */}
                <div className="grid grid-cols-[130px_minmax(0,1fr)] items-center gap-4">
                  <label className="text-sm font-medium text-gray-700">
                    Due Date
                  </label>

                  <DatePicker
                    selected={
                      dateTermsForm.dueDate
                        ? new Date(`${dateTermsForm.dueDate.slice(0, 10)}T00:00:00`)
                        : null
                    }
                    onChange={(date) => {
                      const dueDate = date ? formatDateForInput(date) : "";

                      setDateTermsForm((prev) => ({
                        ...prev,
                        dueDate,
                      }));
                    }}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Select due date"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
                    isClearable
                    showPopperArrow={false}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
                <button
                  type="button"
                  onClick={() => setShowDateTermsModal(false)}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!dateTermsForm.invoiceDate) {
                      toast.error("Please select an invoice date");
                      return;
                    }

                    const terms =
                      dateTermsForm.termsAndConditions || "Due on Receipt";

                    const values = {
                      invoiceDate: dateTermsForm.invoiceDate,
                      termsAndConditions: terms,
                      dueDate:
                        dateTermsForm.dueDate ||
                        calculateDueDate(dateTermsForm.invoiceDate, terms),
                    };

                    dispatch(
                      setInvoiceField({
                        field: "invoiceDate",
                        value: values.invoiceDate,
                      })
                    );

                    dispatch(
                      setInvoiceField({
                        field: "termsAndConditions",
                        value: values.termsAndConditions,
                      })
                    );

                    dispatch(
                      setInvoiceField({
                        field: "dueDate",
                        value: values.dueDate,
                      })
                    );

                    setDateTermsForm(values);
                    setShowDateTermsModal(false);

                    toast.success("Invoice dates and terms updated");
                  }}
                  className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )
      }

    </>
  );
}