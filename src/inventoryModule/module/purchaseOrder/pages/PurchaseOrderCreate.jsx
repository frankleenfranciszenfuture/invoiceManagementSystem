import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import { toast } from "react-hot-toast";

import {
    Box,
    ChevronDown,
    ChevronRight,
    Search,
    Trash2,
    X,
    ScanLine,
    Plus,
    ArrowLeft,
    Landmark,
    ShoppingBag,
    Mail,
    Phone,
    Coins
} from "lucide-react";

import "react-datepicker/dist/react-datepicker.css";

import CustomSUSelect from "../../../../common/custom/CustomSUSelect";

import {
    confirmPurchaseOrder,
    createPurchaseOrder,
    fetchAllPurchaseOrders,
    fetchPurchaseOrderById,
    updatePurchaseOrder,
} from "../thunks/purchaseOrderThunks";

import {
    clearPurchaseOrder,
} from "../slices/purchaseOrderSlice";

import { fetchAllCustomers } from "../../../../module/customer/thunks/customerThunks";
import { fetchAllParties } from "../../../../module/parties/thunks/partyThunks";
import { fetchAllWarehouse } from "../../../../inventoryModule/module/warehouse/thunks/warehouseThunks";

import { fetchAllProducts } from "../../../../module/items/thunks/productThunks";
import { fetchAllUnits } from "../../../../module/units/thunks/unitThunks";
import { fetchAllSizes } from "../../../../module/sizes/thunks/sizeThunks";
import { fetchAllTaxMasters } from "../../../../module/taxMaster/thunks/taxMasterThunks";
import { fetchAllCurrencies, fetchExchangeRate } from "../../../../module/currency/thunks/currencyThunks";
import LeaveConfirmationModal from "../../../../common/confirmation/LeaveConfirmationModal";
import useLeaveConfirmation from "../.../../../../../common/confirmation/useLeaveConfirmation";

const getArray = (value) => {
    if (!value) return [];

    if (Array.isArray(value)) {
        return value;
    }

    if (typeof value !== "object") {
        return [];
    }

    // Common API response structures
    const possibleArrays = [
        value.content,
        value.data,
        value.parties,
        value.party,
        value.partyList,
        value.partyData,
        value.records,
        value.results,
    ];

    for (const candidate of possibleArrays) {
        if (Array.isArray(candidate)) {
            return candidate;
        }
    }

    // Nested response structures
    if (value.data && typeof value.data === "object") {
        const nested = getArray(value.data);

        if (nested.length) {
            return nested;
        }
    }

    // Single party response
    if (
        value.id != null &&
        (
            value.partyCode ||
            value.companyName ||
            value.partyType
        )
    ) {
        return [value];
    }

    return [];
};

const today = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const formatDateForInput = (date) => {
    if (!date) return "";

    // API date string: YYYY-MM-DD or ISO date-time
    if (typeof date === "string") {
        const value = date.trim();

        if (!value) return "";

        // Preserve the date portion without timezone conversion
        const match = value.match(/^(\d{4}-\d{2}-\d{2})/);

        if (match) return match[1];

        const parsedDate = new Date(value);

        if (isNaN(parsedDate.getTime())) return "";

        const year = parsedDate.getFullYear();
        const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
        const day = String(parsedDate.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    // JavaScript Date object
    if (date instanceof Date) {
        if (isNaN(date.getTime())) return "";

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    return "";
};

const roundMoney = (value) =>
    Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;

const fmt = (value) =>
    Number(value || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

const createEmptyItem = () => ({
    productId: "",
    description: "",
    unitId: "",
    sizeId: "",
    quantity: 1,
    unitPrice: 0,
    baseUnitPrice: 0,
    discountType: "AMOUNT",
    discountValue: 0,
    taxMasterId: "",
});

const createInitialForm = () => ({

    partyType: "PARTY",
    partyId: "",
    partyName: "",
    customerId: "",
    customerName: "",
    warehouseId: "",
    warehouseName: "",
    orderDate: new Date().toISOString().split("T")[0],
    expectedDeliveryDate: "",
    currencyId: "",
    currencyName: "",
    currencyCode: "",
    discountType: "AMOUNT",
    discountValue: 0,
    shippingAmount: 0,
    notes: "",
    items: [createEmptyItem()],
});

const getName = (item) =>
    item?.customerName ||
    item?.partyName ||
    item?.warehouseName ||
    item?.productName ||
    item?.itemName ||
    item?.businessName ||
    item?.companyName ||
    [
        item?.salutation,
        item?.firstName,
        item?.lastName,
    ]
        .filter(Boolean)
        .join(" ") ||
    item?.name ||
    "";

const getCurrencyName = (item) =>
    item?.currencyName ||

    [
        item?.salutation,
        item?.firstName,
        item?.lastName,
    ]
        .filter(Boolean)
        .join(" ") ||
    item?.name ||
    "";

const getTaxRate = (tax) =>
    Number(
        tax?.taxPercentage ??
        tax?.taxRate ??
        tax?.rate ??
        tax?.percentage ??
        0
    );

export default function PurchaseOrderCreate({ onClose }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();

    const isEdit = Boolean(id);

    // ---------------------------------------------------------
    // REDUX SELECTORS
    // ---------------------------------------------------------
    const customers = getArray(
        useSelector((state) => state.customer?.customers)
    );

    const purchaseOrderState = useSelector((state) => state.purchaseOrder || {});
    const purchaseOrderLoading =
        purchaseOrderState.loading || purchaseOrderState.actionLoading;

    const partiesState = useSelector(
        (state) => state.party || state.parties || {}
    );

    const parties = useMemo(() => {
        const possiblePartySources = [
            partiesState.parties,
            partiesState.partyList,
            partiesState.partyData,
            partiesState.party,
            partiesState.data,
            partiesState,
        ];

        for (const source of possiblePartySources) {
            const result = getArray(source);

            if (result.length > 0) {
                return result;
            }
        }

        return [];
    }, [partiesState]);



    const warehouses = getArray(
        useSelector((state) => state.warehouse?.warehouses)
    );

    const products = getArray(
        useSelector((state) => state.product?.products)
    );

    const units = getArray(
        useSelector((state) => state.unit?.units)
    );

    const sizes = getArray(
        useSelector((state) => state.size?.sizes)
    );

    const taxMasters = getArray(
        useSelector((state) => state.taxMaster?.taxMasters)
    );

    const currencies = getArray(
        useSelector((state) => state.currency?.currencies)
    );


    // ---------------------------------------------------------
    // LOCAL FORM STATE
    // ---------------------------------------------------------

    const [formData, setFormData] = useState(createInitialForm);
    const [loadingRecord, setLoadingRecord] = useState(false);

    const [partySearch, setPartySearch] = useState("");
    const [warehouseSearch, setWarehouseSearch] = useState("");
    const [currencySearch, setCurrencySearch] = useState("");
    const [itemSearch, setItemSearch] = useState("");

    const [openParty, setOpenParty] = useState(false);
    const [openWarehouse, setOpenWarehouse] = useState(false);
    const [openCurrency, setOpenCurrency] = useState(false);

    const [openRowItemDropdown, setOpenRowItemDropdown] = useState(false);
    const [activeItemIndex, setActiveItemIndex] = useState(null);
    const [itemDropdownPosition, setItemDropdownPosition] = useState({
        top: 0,
        left: 0,
        width: 0,
    });

    const [showPartyDetails, setShowPartyDetails] = useState(false);
    const [showSummary, setShowSummary] = useState(true);
    const [discountMode, setDiscountMode] = useState("COMMON");
    const [showExpectedDate, setShowExpectedDate] = useState(true);

    const partyDropdownRef = useRef(null);
    const warehouseDropdownRef = useRef(null);
    const currencyDropdownRef = useRef(null);
    const itemDropdownRef = useRef(null);

    const {
        showLeaveConfirmation,
        confirmLeave,
        handleStay,
        handleLeave,
    } = useLeaveConfirmation();

    // ---------------------------------------------------------
    // FORM HELPERS
    // ---------------------------------------------------------


    const handleChange = useCallback((field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    }, []);

    const handleItemChange = useCallback((index, field, value) => {
        setFormData((prev) => ({
            ...prev,
            items: prev.items.map((item, itemIndex) =>
                itemIndex === index
                    ? { ...item, [field]: value }
                    : item
            ),
        }));
    }, []);

    const handleAddItem = () => {
        setFormData((prev) => ({
            ...prev,
            items: [...prev.items, createEmptyItem()],
        }));
    };

    const handleRemoveItem = (index) => {
        setFormData((prev) => ({
            ...prev,
            items:
                prev.items.length > 1
                    ? prev.items.filter((_, itemIndex) => itemIndex !== index)
                    : [createEmptyItem()],
        }));
    };

    const handleReset = () => {
        setFormData(createInitialForm());
        setDiscountMode("COMMON");
        setPartySearch("");
        setWarehouseSearch("");
        setCurrencySearch("");
        dispatch(clearPurchaseOrder());
    };

    // ---------------------------------------------------------
    // LOAD MASTER DATA
    // ---------------------------------------------------------

    useEffect(() => {
        dispatch(fetchAllCustomers());
        dispatch(fetchAllParties());
        dispatch(fetchAllWarehouse());
        dispatch(fetchAllProducts());
        dispatch(fetchAllUnits());
        dispatch(fetchAllSizes());
        dispatch(fetchAllTaxMasters());
        dispatch(fetchAllCurrencies());
    }, [dispatch]);

    // ---------------------------------------------------------
    // LOAD PURCHASE ORDER FOR EDIT
    // ---------------------------------------------------------

    useEffect(() => {
        if (!id) {
            setFormData(createInitialForm());
            return;
        }

        let active = true;

        const loadPurchaseOrder = async () => {
            setLoadingRecord(true);

            try {
                const result = await dispatch(fetchPurchaseOrderById(id)).unwrap();

                if (!active) return;

                const order = result?.data || result;

                const rawPartyType = String(order?.partyType || "PARTY").toUpperCase();

                const partyType =
                    rawPartyType === "PARTY" || rawPartyType === "BOTH"
                        ? "CUSTOMER"
                        : "PARTY";
                const selectedCustomer = order?.customer;
                const selectedParty = order?.party;
                const selectedWarehouse = order?.warehouse;
                const selectedCurrency = order?.currency;

                const orderItems = Array.isArray(order?.items)
                    ? order.items
                    : Array.isArray(order?.purchaseOrderItems)
                        ? order.purchaseOrderItems
                        : [];

                setFormData({
                    ...createInitialForm(),
                    partyType,

                    partyId:
                        partyType === "PARTY"
                            ? order?.partyId ??
                            selectedParty?.id ??
                            ""
                            : "",

                    partyName:
                        partyType === "PARTY"
                            ? selectedParty?.partyName ||
                            selectedParty?.companyName ||
                            selectedParty?.name ||
                            order?.partyName ||
                            ""
                            : "",

                    customerId:
                        partyType === "CUSTOMER"
                            ? order?.customerId ??
                            selectedCustomer?.id ??
                            ""
                            : "",

                    customerName:
                        partyType === "CUSTOMER"
                            ? selectedCustomer?.customerName ||
                            selectedCustomer?.name ||
                            order?.customerName ||
                            ""
                            : "",


                    warehouseId:
                        order?.warehouseId ??
                        selectedWarehouse?.id ??
                        "",
                    warehouseName:
                        selectedWarehouse?.warehouseName ||
                        selectedWarehouse?.name ||
                        order?.warehouseName ||
                        "",
                    orderDate: formatDateForInput(order?.orderDate) || today(),
                    expectedDeliveryDate: formatDateForInput(
                        order?.expectedDeliveryDate
                    ),
                    currencyId:
                        order?.currencyId ??
                        selectedCurrency?.id ??
                        "",
                    currencyName:
                        selectedCurrency?.currencyName ||
                        order?.currencyName ||
                        "INR",
                    currencyCode:
                        selectedCurrency?.currencyCode ||
                        order?.currencyCode ||
                        "INR",
                    discountType: order?.discountType || "AMOUNT",
                    discountValue: Number(order?.discountValue || 0),
                    shippingAmount: Number(order?.shippingAmount || 0),
                    notes: order?.notes || "",
                    items: orderItems.length
                        ? orderItems.map((item) => ({
                            productId: item?.productId ?? item?.product?.id ?? "",
                            description:
                                item?.description ||
                                item?.product?.productName ||
                                item?.product?.name ||
                                "",
                            unitId: item?.unitId ?? item?.unit?.id ?? "",
                            sizeId: item?.sizeId ?? item?.size?.id ?? "",
                            quantity: Number(item?.quantity || 1),
                            unitPrice: Number(item?.unitPrice || 0),
                            baseUnitPrice: Number(
                                item?.baseUnitPrice ??
                                item?.unitPrice ??
                                0
                            ),
                            discountType: item?.discountType || "AMOUNT",
                            discountValue: Number(item?.discountValue || 0),
                            taxMasterId:
                                item?.taxMasterId ??
                                item?.taxMaster?.id ??
                                "",
                        }))
                        : [createEmptyItem()],
                });

                setDiscountMode(
                    order?.discountType === "PERCENTAGE" ? "COMMON" : "COMMON"
                );
            } catch (error) {
                toast.error(error?.message || "Failed to load purchase order");
            } finally {
                if (active) setLoadingRecord(false);
            }
        };

        loadPurchaseOrder();

        return () => {
            active = false;
        };
    }, [dispatch, id]);

    // ---------------------------------------------------------
    // SELECTED CUSTOMER / PARTY
    // ---------------------------------------------------------

    const selectedParty = useMemo(() => {
        if (formData.partyType === "CUSTOMER") {
            return customers.find(
                (item) => String(item.id) === String(formData.customerId)
            );
        }

        return parties.find(
            (item) => String(item.id) === String(formData.partyId)
        );
    }, [
        formData.partyType,
        formData.customerId,
        formData.partyId,
        customers,
        parties,
    ]);

    // ---------------------------------------------------------
    // FILTERED CUSTOMER / PARTY LIST
    // ---------------------------------------------------------

    const filteredParties = useMemo(() => {
        let source = [];

        if (formData.partyType === "CUSTOMER") {
            // Customer master list
            source = customers;
        } else {
            // Include PARTY and BOTH from the Party master list
            source = parties.filter((item) => {
                const type = String(item?.partyType || "").toUpperCase();

                return type === "PARTY" || type === "BOTH";
            });
        }

        // Only show active records when status is available
        source = source.filter((item) => {
            if (!item?.status) return true;

            return String(item.status).toUpperCase() === "ACTIVE";
        });

        const search = partySearch.trim().toLowerCase();

        if (!search) return source;

        return source.filter((item) => {
            const name = getName(item).toLowerCase();
            const email = String(item?.email || "").toLowerCase();

            const phone = String(
                item?.mobile ||
                item?.phoneNumber ||
                item?.mobileNumber ||
                ""
            ).toLowerCase();

            return (
                name.includes(search) ||
                email.includes(search) ||
                phone.includes(search)
            );
        });
    }, [customers, parties, formData.partyType, partySearch]);



    const filteredWarehouses = useMemo(() => {
        const search = warehouseSearch.trim().toLowerCase();

        if (!search) return warehouses;

        return warehouses.filter((warehouse) =>
            getName(warehouse).toLowerCase().includes(search)
        );
    }, [warehouses, warehouseSearch]);

    const filteredCurrencies = useMemo(() => {
        const search = currencySearch.trim().toLowerCase();

        if (!search) return currencies;

        return currencies.filter((currency) =>
            `${currency.currencyName || ""} ${currency.currencyCode || ""}`
                .toLowerCase()
                .includes(search)
        );
    }, [currencies, currencySearch]);

    const filteredProducts = useMemo(() => {
        const search = itemSearch.trim().toLowerCase();

        if (!search) return products;

        return products.filter((product) =>
            `${product.productName || ""} ${product.itemName || ""} ${product.name || ""} ${product.sku || ""}`
                .toLowerCase()
                .includes(search)
        );
    }, [products, itemSearch]);

    // ---------------------------------------------------------
    // PARTY TYPE / PARTY SELECTION
    // ---------------------------------------------------------

    const handlePartyTypeChange = (partyType) => {
        setFormData((prev) => ({
            ...prev,
            partyType,
            customerId: "",
            customerName: "",
            partyId: "",
            partyName: "",
        }));

        setPartySearch("");
        setOpenParty(false);
        setShowPartyDetails(false);
    };

    const handlePartySelect = (party) => {
        console.log("Selected customer/party:", party);

        const selectedId =
            party?.id ??
            party?.customerId ??
            party?.partyId;

        if (!selectedId) {
            console.error("Selected customer/party has no ID:", party);
            return;
        }

        const name = getName(party);

        setFormData((prev) => ({
            ...prev,

            customerId:
                prev.partyType === "CUSTOMER"
                    ? Number(selectedId)
                    : "",

            customerName:
                prev.partyType === "CUSTOMER"
                    ? name
                    : "",

            partyId:
                prev.partyType === "PARTY"
                    ? Number(selectedId)
                    : "",

            partyName:
                prev.partyType === "PARTY"
                    ? name
                    : "",
        }));

        setPartySearch("");
        setOpenParty(false);
        setShowPartyDetails(false);
    };
    // ---------------------------------------------------------
    // WAREHOUSE SELECTION
    // ---------------------------------------------------------

    // ---------------------------------------------------------

    const handleWarehouseSelect = (warehouse) => {
        setFormData((prev) => ({
            ...prev,
            warehouseId: warehouse.id,
            warehouseName: getName(warehouse),
        }));

        setWarehouseSearch("");
        setOpenWarehouse(false);
    };

    // ---------------------------------------------------------
    // CURRENCY / EXCHANGE RATE
    // Rate convention: 1 selected currency = exchangeRate INR
    // ---------------------------------------------------------

    const selectedCurrency = currencies.find(
        (currency) =>
            String(currency.id) === String(formData.currencyId)
    );

    const inrCurrency = currencies.find(
        (currency) =>
            String(currency.currencyCode || "").toUpperCase() === "INR"
    );

    const handleCurrencySelect = async (selectedCurrency) => {
        const currency =
            typeof selectedCurrency === "object"
                ? selectedCurrency
                : currencies.find(
                    (item) => String(item.id) === String(selectedCurrency)
                );

        if (!currency?.id) {
            toast.error("Please select a valid currency");
            return;
        }

        const currencyCode = String(currency.currencyCode || "").toUpperCase();

        if (!currencyCode) {
            toast.error("Currency code is missing");
            return;
        }

        // INR does not require exchange-rate lookup.
        if (currencyCode === "INR") {
            setFormData((prev) => ({
                ...prev,
                currencyId: Number(currency.id),
                currencyName: currency.currencyName || "Indian Rupee",
                currencyCode,
                exchangeRate: 1,
                items: prev.items.map((item) => ({
                    ...item,
                    unitPrice: Number(item.baseUnitPrice || 0),
                })),
            }));

            setCurrencySearch("");
            setOpenCurrency(false);
            return;
        }

        if (!inrCurrency?.id) {
            toast.error("INR currency is not configured");
            return;
        }

        try {
            const response = await dispatch(
                fetchExchangeRate({
                    fromCurrencyId: currency.id,
                    toCurrencyId: inrCurrency.id,
                })
            ).unwrap();

            const rate = Number(
                response?.exchangeRate ??
                response?.rate ??
                response?.data?.exchangeRate ??
                response?.data?.rate ??
                0
            );

            if (!Number.isFinite(rate) || rate <= 0) {
                toast.error("Exchange rate is not available");
                return;
            }

            setFormData((prev) => ({
                ...prev,
                currencyId: Number(currency.id),
                currencyName: currency.currencyName || currencyCode,
                currencyCode,
                exchangeRate: rate,
                items: prev.items.map((item) => ({
                    ...item,
                    unitPrice: roundMoney(
                        Number(item.baseUnitPrice || 0) / rate
                    ),
                })),
            }));

            setCurrencySearch("");
            setOpenCurrency(false);
        } catch (error) {
            toast.error(
                error?.message || "Unable to fetch exchange rate"
            );
        }
    };

    // ---------------------------------------------------------
    // PRODUCT DROPDOWN POSITION
    // ---------------------------------------------------------

    const openItemDropdown = (index, element) => {
        const rect = element.getBoundingClientRect();

        setActiveItemIndex(index);
        setItemDropdownPosition({
            top: rect.bottom + 4,
            left: rect.left,
            width: rect.width,
        });

        setItemSearch(
            formData.items[index]?.description || ""
        );

        setOpenRowItemDropdown(true);
    };

    useEffect(() => {
        const closeDropdown = (event) => {
            if (
                itemDropdownRef.current &&
                !itemDropdownRef.current.contains(event.target)
            ) {
                setOpenRowItemDropdown(false);
            }

            if (
                partyDropdownRef.current &&
                !partyDropdownRef.current.contains(event.target)
            ) {
                setOpenParty(false);
            }

            if (
                warehouseDropdownRef.current &&
                !warehouseDropdownRef.current.contains(event.target)
            ) {
                setOpenWarehouse(false);
            }

            if (
                currencyDropdownRef.current &&
                !currencyDropdownRef.current.contains(event.target)
            ) {
                setOpenCurrency(false);
            }
        };

        document.addEventListener("mousedown", closeDropdown);

        return () => {
            document.removeEventListener("mousedown", closeDropdown);
        };
    }, []);

    // ---------------------------------------------------------
    // PRODUCT SELECTION
    // ---------------------------------------------------------

    const handleProductSelect = (product, index) => {
        // No product selected
        if (!product?.id) {
            setOpenRowItemDropdown(null);
            return;
        }

        const baseUnitPrice = Number(
            product.purchasePrice ??
            product.buyingPrice ??
            product.costPrice ??
            product.rate ??
            product.price ??
            0
        );

        setFormData((prev) => {
            const updatedItems = [...(prev.items || [])];

            // Invalid row index
            if (!updatedItems[index]) return prev;

            const exchangeRate = Number(prev.exchangeRate || 1);

            const unitPrice = roundMoney(
                baseUnitPrice / exchangeRate
            );

            updatedItems[index] = {
                ...updatedItems[index],
                productId: product.id,
                description: product.productName || product.name || "",
                unitId: product.unitId || "",
                sizeId: product.sizeId || "",
                baseUnitPrice,
                unitPrice,
            };

            return {
                ...prev,
                items: updatedItems,
            };
        });

        setOpenRowItemDropdown(null);
    };

    const handleUnitPriceChange = (index, value) => {
        const unitPrice = Number(value || 0);
        const exchangeRate = Number(formData.exchangeRate || 1);

        setFormData((prev) => ({
            ...prev,
            items: prev.items.map((item, itemIndex) =>
                itemIndex === index
                    ? {
                        ...item,
                        unitPrice,
                        baseUnitPrice: roundMoney(unitPrice * exchangeRate),
                    }
                    : item
            ),
        }));
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                itemDropdownRef.current &&
                !itemDropdownRef.current.contains(event.target)
            ) {
                setOpenRowItemDropdown(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    // ---------------------------------------------------------
    // ITEM / DISCOUNT / TAX CALCULATIONS
    // ---------------------------------------------------------

    const getItemAmount = (item) => {
        const quantity = Number(item.quantity || 0);
        const unitPrice = Number(item.unitPrice || 0);

        const gross = quantity * unitPrice;

        const discount =
            discountMode === "PRODUCT"
                ? Math.min(Number(item.discountValue || 0), gross)
                : 0;

        return Math.max(0, gross - discount);
    };

    const getItemTax = (item) => {
        const tax = taxMasters.find(
            (entry) =>
                String(entry.id) === String(item.taxMasterId)
        );

        return roundMoney(
            getItemAmount(item) * (getTaxRate(tax) / 100)
        );
    };

    const totals = useMemo(() => {
        const subtotal = formData.items.reduce(
            (sum, item) =>
                sum +
                Number(item.quantity || 0) *
                Number(item.unitPrice || 0),
            0
        );

        const productDiscount = formData.items.reduce(
            (sum, item) =>
                sum +
                (discountMode === "PRODUCT"
                    ? Math.min(
                        Number(item.discountValue || 0),
                        Number(item.quantity || 0) *
                        Number(item.unitPrice || 0)
                    )
                    : 0),
            0
        );

        const commonDiscount =
            discountMode === "COMMON"
                ? Number(formData.discountValue || 0)
                : 0;

        const discount = Math.min(
            subtotal,
            productDiscount + commonDiscount
        );

        const shippingAmount = Math.max(
            0,
            Number(formData.shippingAmount || 0)
        );

        const taxableAmount = Math.max(0, subtotal - discount);

        const tax = formData.items.reduce(
            (sum, item) => sum + getItemTax(item),
            0
        );

        return {
            subtotal: roundMoney(subtotal),
            productDiscount: roundMoney(productDiscount),
            commonDiscount: roundMoney(commonDiscount),
            discount: roundMoney(discount),
            shippingAmount: roundMoney(shippingAmount),
            taxableAmount: roundMoney(taxableAmount),
            tax: roundMoney(tax),
            grandTotal: roundMoney(taxableAmount + tax),
        };
    }, [formData.items, formData.discountValue, discountMode, taxMasters]);

    // ---------------------------------------------------------
    // CURRENCY DISPLAY
    // ---------------------------------------------------------

    const currencyCode =
        selectedCurrency?.currencyCode ||
        formData.currencyCode ||
        "INR";

    const currencySymbol =
        selectedCurrency?.symbol ||
        (currencyCode === "INR" ? "₹" : currencyCode);

    const formatCurrency = (amount) =>
        `${currencySymbol} ${fmt(Number(amount || 0))}`;

    // ---------------------------------------------------------
    // VALIDATION
    // ---------------------------------------------------------

    const validateForm = () => {
        if (formData.partyType === "CUSTOMER" && !formData.customerId) {
            toast.error("Please select a customer");
            return false;
        }

        if (formData.partyType === "PARTY" && !formData.partyId) {
            toast.error("Please select a party");
            return false;
        }
        if (!formData.warehouseId) {
            toast.error("Please select a warehouse");
            return false;
        }
        if (!formData.orderDate) {
            toast.error("Please select an order date");
            return false;
        }
        const validCurrency = currencies.find(
            (currency) =>
                String(currency.id) === String(formData.currencyId)
        );

        if (!validCurrency) {
            toast.error("Please select a valid currency");
            return false;
        }

        const exchangeRate = Number(formData.exchangeRate);

        if (!Number.isFinite(exchangeRate) || exchangeRate <= 0) {
            toast.error("Please select a currency with a valid exchange rate");
            return false;
        }
        if (formData.expectedDeliveryDate && formData.expectedDeliveryDate < formData.orderDate) {
            toast.error("Expected delivery date cannot be before order date");
            return false;
        }

        const validItems = formData.items.filter(
            (item) => item.productId && Number(item.quantity) > 0
        );
        if (!validItems.length) {
            toast.error("Please add at least one product with quantity");
            return false;
        }
        for (const item of validItems) {
            if (Number(item.baseUnitPrice) < 0) {
                toast.error("Product price cannot be negative");
                return false;
            }
        }
        return true;
    };

    // ---------------------------------------------------------
    // PURCHASE ORDER PAYLOADOAD
    // ---------------------------------------------------------

    const buildPayload = () => {
        const items = formData.items
            .filter((item) => item.productId && Number(item.quantity) > 0)
            .map((item) => ({
                productId: Number(item.productId),
                description: item.description || "",
                unitId: item.unitId ? Number(item.unitId) : null,
                sizeId: item.sizeId ? Number(item.sizeId) : null,
                quantity: Number(item.quantity || 0),
                // Purchase API stores base price in INR.
                baseUnitPrice: roundMoney(item.baseUnitPrice),
                discountType: "AMOUNT",
                discountValue:
                    discountMode === "PRODUCT"
                        ? Number(item.discountValue || 0)
                        : 0,
                taxMasterId: item.taxMasterId ? Number(item.taxMasterId) : null,
            }));

        return {
            partyType: formData.partyType,

            partyId:
                formData.partyType === "PARTY"
                    ? Number(formData.partyId)
                    : null,
            customerId:
                formData.partyType === "CUSTOMER"
                    ? Number(formData.customerId)
                    : null,
            warehouseId: Number(formData.warehouseId),
            orderDate: formData.orderDate,
            expectedDeliveryDate: formData.expectedDeliveryDate || null,
            currencyId: formData.currencyId ? Number(formData.currencyId) : null,
            discountType: formData.discountType || "AMOUNT",
            discountValue: Number(formData.discountValue || 0),
            notes: formData.notes || "",
            items,
        };
    };

    // SAVE / UPDATE
    // ---------------------------------------------------------

    const handleSubmit = async (saveMode = "SAVE") => {
        if (!validateForm()) return;

        const payload = buildPayload();

        try {
            if (isEdit) {
                await dispatch(
                    updatePurchaseOrder({
                        id,
                        data: payload,
                    })
                ).unwrap();

                toast.success("Purchase order updated successfully");
            } else {
                await dispatch(
                    createPurchaseOrder(payload)
                ).unwrap();

                toast.success(
                    saveMode === "DRAFT"
                        ? "Purchase order saved successfully"
                        : "Purchase order created successfully"
                );
            }

            dispatch(clearPurchaseOrder());

            if (onClose) {
                onClose();
            } else {
                navigate("/inventory/purchaseOrder");
            }
        } catch (error) {
            console.log("Backend error:", error);

            const message =
                typeof error === "string"
                    ? error
                    : error?.message ||
                    error?.data?.message ||
                    "Unable to save purchase order";

            toast.error(message);
        }
    };


    const handleSaveDraft = () => handleSubmit("DRAFT");
    const handleSave = () => handleSubmit("SAVE");

    const handleClose = () => {
        confirmLeave(() => {
            if (onClose) {
                onClose();
            } else {
                navigate("/inventory/purchaseOrder");
            }
        })
    };

    // ---------------------------------------------------------
    // DISPLAY VALUES
    // ---------------------------------------------------------

    const selectedPartyName =
        formData.partyType === "CUSTOMER"
            ? formData.customerName
            : formData.partyName;

    console.log("Selected customer/party:", selectedPartyName);

    const selectedWarehouse = warehouses.find(
        (item) => String(item.id) === String(formData.warehouseId)
    );

    const selectedWarehouseName =
        selectedWarehouse?.warehouseName ||
        selectedWarehouse?.name ||
        formData.warehouseName;

    const selectedPartyEmail =
        selectedParty?.email || "";

    const selectedPartyPhone =
        selectedParty?.mobile ||
        selectedParty?.phoneNumber ||
        selectedParty?.mobileNumber ||
        "";


    /* =========================================================
   RENDER
========================================================= */

    return (
        <>


            <div className="
            flex h-full min-h-0 flex-col
            bg-gray-50 px-3.5 py-3
        ">

                {/* HEADER */}

                <div className="
                mb-3 flex shrink-0 items-center
                justify-between rounded-xl
                border-b-[3px] border-[#B7E34A]
                bg-white px-5 py-4 shadow-sm
            ">

                    <div className="flex items-center gap-3">

                        <button
                            type="button"
                            onClick={handleClose}
                            className="
                    flex h-9 w-9 items-center justify-center
                    rounded-lg border border-gray-200
                    text-gray-500 transition hover:bg-gray-100
                    "
                            title="Go Back"
                        >
                            <ArrowLeft size={18} />
                        </button>

                        <div>
                            <h2 className="text-base font-semibold text-gray-800">
                                {isEdit
                                    ? "Edit Purchase Order"
                                    : "Create Purchase Order"
                                }
                            </h2>

                            <p className="mt-0.5 text-xs text-gray-400">
                                {isEdit
                                    ? "Update the existing purchase Order information"
                                    : "Create and configure a Purchase Order for your business"
                                }
                            </p>
                        </div>

                    </div>

                    <div className="
                    hidden items-center gap-2 rounded-lg
                    bg-blue-50 px-3 py-2 sm:flex
                ">
                        <ShoppingBag size={16} className="text-[#408DFB]" />

                        <span className="text-xs font-medium text-[#408DFB]">
                            Purchase Order
                        </span>
                    </div>

                </div>





                {/* BODY */}
                <div className="flex-1 overflow-y-auto py-1 ">
                    <div className="px-3 py-4 border border-gray-100  rounded-lg shadow-xl ">
                        {/* PARTY TYPE */}
                        <div className="mb-5 flex items-start">
                            <label className="w-44 shrink-0 pt-2 text-sm font-medium text-red-500">
                                Party Type*
                            </label>

                            <div className="flex gap-2">
                                {["PARTY", "CUSTOMER"].map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => handlePartyTypeChange(type)}
                                        className={`rounded-md border px-5 py-2 text-sm font-medium transition ${formData.partyType === type
                                            ? "border-blue-500 bg-blue-500 text-white"
                                            : "border-gray-300 bg-white text-gray-600 hover:border-blue-400"
                                            }`}
                                    >
                                        {type === "PARTY" ? "Party" : "Customer"}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {/* CUSTOMER / PARTY */}
                        <div className="mb-6 flex items-start">
                            <label className="w-44 shrink-0 pt-2 text-sm font-medium text-red-500">
                                {formData.partyType === "CUSTOMER"
                                    ? "Customer Name*"
                                    : "Party Name*"}
                            </label>

                            <div className="flex-1">
                                <div
                                    ref={partyDropdownRef}
                                    className="relative w-full max-w-[350px]"
                                >
                                    <div className="flex">
                                        <div className="relative flex-1">
                                            <input
                                                type="text"
                                                value={openParty ? partySearch : selectedPartyName || ""}
                                                placeholder={`Select ${formData.partyType === "CUSTOMER" ? "customer" : "party"
                                                    }`}
                                                onClick={() => {
                                                    setPartySearch("");
                                                    setOpenParty(true);
                                                }}
                                                onChange={(event) => {
                                                    setPartySearch(event.target.value);
                                                    setOpenParty(true);
                                                }}
                                                className="h-10 w-full rounded-l-md border border-blue-500 bg-white px-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                                            />

                                            <ChevronDown
                                                size={14}
                                                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                            />
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPartySearch("");
                                                setOpenParty((prev) => !prev);
                                            }}
                                            className="flex h-10 w-10 items-center justify-center rounded-r-md bg-emerald-500 text-white hover:bg-emerald-600"
                                        >
                                            <Search size={16} />
                                        </button>
                                    </div>

                                    {openParty && (
                                        <div className="absolute left-0 top-full z-[100] mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-xl">
                                            <div className="border-b border-gray-200 p-2">
                                                <div className="relative">
                                                    <Search
                                                        size={16}
                                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                                    />

                                                    <input
                                                        autoFocus
                                                        value={partySearch}
                                                        onChange={(event) =>
                                                            setPartySearch(event.target.value)
                                                        }
                                                        placeholder={`Search ${formData.partyType.toLowerCase()}`}
                                                        className="w-full rounded border border-blue-300 py-2 pl-10 pr-3 text-sm focus:outline-none"
                                                    />
                                                </div>
                                            </div>

                                            <div className="max-h-60 overflow-y-auto">
                                                {filteredParties.length === 0 ? (
                                                    <div className="px-4 py-5 text-center text-sm text-gray-400">
                                                        No {formData.partyType.toLowerCase()} found
                                                    </div>
                                                ) : (
                                                    filteredParties.map((party, index) => {
                                                        const name = getName(party);

                                                        return (
                                                            <button
                                                                type="button"
                                                                key={party.id}
                                                                onClick={() => handlePartySelect(party)}
                                                                className={`flex w-full items-center gap-3 rounded border-b border-gray-100 px-4 py-3 text-left transition-colors
                                                                                               ${index === 0
                                                                        ? "bg-blue-500 text-white"
                                                                        : "bg-white text-gray-500 hover:bg-blue-50 hover:text-gray-500"
                                                                    }`}
                                                            >
                                                                <div
                                                                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-medium
                                                                                                   ${index === 0
                                                                            ? "bg-gray-100 text-blue-500"
                                                                            : "bg-gray-200 text-gray-700"
                                                                        }`}
                                                                >
                                                                    {name.charAt(0).toUpperCase()}
                                                                </div>

                                                                <div className="min-w-0">
                                                                    <p className="truncate font-medium">{name}</p>

                                                                    <p className="flex min-w-0 items-center gap-2 truncate text-xs opacity-80">
                                                                        {party.email ? (
                                                                            <Mail size={13} className="shrink-0" />
                                                                        ) : (
                                                                            <Phone size={13} className="shrink-0" />
                                                                        )}

                                                                        <span className="truncate">
                                                                            {party.email || party.mobile || party.phoneNumber || ""}
                                                                        </span>
                                                                    </p>
                                                                </div>
                                                            </button>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {selectedPartyName && (
                                <div className="ml-auto w-60 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPartyDetails((prev) => !prev)
                                        }
                                        className="flex h-11 w-full items-center justify-between rounded-lg 
                                                               bg-gray-600 px-4 text-sm font-semibold text-white hover:bg-slate-700"
                                    >
                                        <span className="truncate">
                                            {selectedPartyName}'s Details
                                        </span>

                                        <ChevronRight
                                            size={16}
                                            className={`transition-transform ${showPartyDetails ? "rotate-90" : ""
                                                }`}
                                        />
                                    </button>

                                    {showPartyDetails && (
                                        <div className="space-y-1 rounded-b-md border border-gray-200 bg-white p-3 text-sm text-gray-600">
                                            <p>{selectedPartyEmail || "No email"}</p>
                                            <p>{selectedPartyPhone || "No phone"}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>


                        {/* WAREHOUSE */}
                        <div className="mb-6 flex items-start">
                            <label className="w-44 shrink-0 pt-2 text-sm font-medium text-red-500">
                                Warehouse*
                            </label>

                            <div
                                ref={warehouseDropdownRef}
                                className="relative w-full max-w-[350px]"
                            >
                                <div className="flex">
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            value={
                                                warehouseSearch ||
                                                selectedWarehouseName ||
                                                ""
                                            }
                                            placeholder="Select warehouse"
                                            onClick={() => setOpenWarehouse(true)}
                                            onChange={(event) => {
                                                setWarehouseSearch(event.target.value);
                                                setOpenWarehouse(true);
                                            }}
                                            className="h-10 w-full rounded-l-md border border-blue-500 bg-white px-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                                        />

                                        <ChevronDown
                                            size={14}
                                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setOpenWarehouse(true)}
                                        className="flex h-10 w-10 items-center justify-center rounded-r-md bg-emerald-500 text-white hover:bg-emerald-600"
                                    >
                                        <Search size={16} />
                                    </button>
                                </div>

                                {openWarehouse && (
                                    <div className="absolute left-0 top-full z-[100] mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-xl">
                                        <div className="border-b border-gray-200 p-2">
                                            <input
                                                autoFocus
                                                value={warehouseSearch}
                                                onChange={(event) =>
                                                    setWarehouseSearch(event.target.value)
                                                }
                                                placeholder="Search warehouse"
                                                className="w-full rounded border border-blue-300 px-3 py-2 text-sm focus:outline-none"
                                            />
                                        </div>

                                        <div className="max-h-60 overflow-y-auto">
                                            {filteredWarehouses.length === 0 ? (
                                                <p className="px-4 py-5 text-center text-sm text-gray-400">
                                                    No warehouses found
                                                </p>
                                            ) : (
                                                filteredWarehouses.map((warehouse, index) => {
                                                    const name = getName(warehouse);

                                                    return (
                                                        <button
                                                            type="button"
                                                            key={warehouse.id}
                                                            onClick={() => handleWarehouseSelect(warehouse)}
                                                            className={`flex w-full items-center gap-3 rounded border-b border-gray-100 px-4 py-3 text-left transition-colors
                                                                        ${index === 0
                                                                    ? "bg-blue-500 text-white"
                                                                    : "bg-white text-gray-500 hover:bg-blue-50 hover:text-gray-500"
                                                                }`}
                                                        >
                                                            <div
                                                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-medium
                                                                            ${index === 0
                                                                        ? "bg-gray-100 text-blue-500"
                                                                        : "bg-gray-200 text-gray-700"
                                                                    }`}
                                                            >
                                                                {name.charAt(0).toUpperCase()}
                                                            </div>

                                                            <div className="min-w-0">
                                                                <p className="truncate font-medium">{name}</p>

                                                                <p className="flex min-w-0 items-center gap-2 truncate text-xs opacity-80">
                                                                    {warehouse.email ? (
                                                                        <Mail size={13} className="shrink-0" />
                                                                    ) : (
                                                                        <Phone size={13} className="shrink-0" />
                                                                    )}

                                                                    <span className="truncate">
                                                                        {warehouse.email || warehouse.mobile || warehouse.phoneNumber || ""}
                                                                    </span>
                                                                </p>
                                                            </div>
                                                        </button>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* CURRENCY */}
                        <div className="mb-6 flex items-start">
                            <label className="w-44 shrink-0 pt-2 text-sm font-medium text-red-500">
                                Currency*
                            </label>

                            <div
                                ref={currencyDropdownRef}
                                className="relative w-full max-w-[350px]"
                            >
                                <div className="flex">
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            value={
                                                currencySearch ||
                                                formData.currencyName ||
                                                ""
                                            }
                                            placeholder="Select currency"
                                            onClick={() => {
                                                setCurrencySearch("");
                                                setOpenCurrency(true);
                                            }}
                                            onChange={(event) => {
                                                setCurrencySearch(event.target.value);
                                                setOpenCurrency(true);
                                            }}
                                            className="h-10 w-full rounded-l-md border border-blue-500 bg-white px-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                                        />

                                        <ChevronDown
                                            size={14}
                                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setOpenCurrency(true)}
                                        className="flex h-10 w-10 items-center justify-center rounded-r-md bg-emerald-500 text-white hover:bg-emerald-600"
                                    >
                                        <Search size={16} />
                                    </button>
                                </div>

                                {openCurrency && (
                                    <div className="absolute left-0 top-full z-[100] mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-xl">
                                        <div className="border-b border-gray-200 p-2">
                                            <input
                                                autoFocus
                                                value={openCurrency ? currencySearch : formData.currencyName || ""}
                                                onChange={(event) =>
                                                    setCurrencySearch(event.target.value)
                                                }
                                                placeholder="Search currency"
                                                className="w-full rounded border border-blue-300 px-3 py-2 text-sm focus:outline-none"
                                            />
                                        </div>

                                        <div className="max-h-60 overflow-y-auto">
                                            {filteredCurrencies.length === 0 ? (
                                                <p className="px-4 py-5 text-center text-sm text-gray-400">
                                                    No currencies found
                                                </p>
                                            ) : (
                                                filteredCurrencies.map((currency, index) => {
                                                    const name = getCurrencyName(currency);

                                                    return (
                                                        <button
                                                            type="button"
                                                            key={currency.id}
                                                            onClick={() => handleCurrencySelect(currency)}
                                                            className={`flex w-full items-center gap-3 rounded border-b border-gray-100 px-4 py-3 text-left transition-colors
                                                                        ${index === 0
                                                                    ? "bg-blue-500 text-white"
                                                                    : "bg-white text-gray-500 hover:bg-blue-50 hover:text-gray-500"
                                                                }`}
                                                        >
                                                            <div
                                                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-medium
                                                                            ${index === 0
                                                                        ? "bg-gray-100 text-blue-500"
                                                                        : "bg-gray-200 text-gray-700"
                                                                    }`}
                                                            >
                                                                {name.charAt(0).toUpperCase()}
                                                            </div>

                                                            <div className="min-w-0">
                                                                <p className="truncate font-medium">{name}</p>

                                                                <p className="flex min-w-0 items-center gap-2 truncate text-xs opacity-80">
                                                                    {currency.symbol ? (
                                                                        <Coins size={13} className="shrink-0" />
                                                                    ) : (
                                                                        <Phone size={13} className="shrink-0" />
                                                                    )}
                                                                    {currency.symbol}

                                                                    <span className="truncate">
                                                                        {currency.currencyName || currency.mobile || currency.phoneNumber || ""}
                                                                    </span>
                                                                </p>
                                                            </div>
                                                        </button>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {formData.currencyId && Number(formData.exchangeRate) > 0 && (
                                <div className="ml-4 flex h-10 items-center rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-600">
                                    1 {currencyCode} = {fmt(formData.exchangeRate)} INR
                                </div>
                            )}
                        </div>

                        {/* ORDER DATE */}
                        <div className="mb-4 flex items-center">
                            <label className="w-44 shrink-0 text-sm font-medium text-red-500">
                                Order Date*
                            </label>

                            <div className="w-full max-w-[350px]">
                                <DatePicker
                                    selected={
                                        formData.orderDate
                                            ? (
                                                formData.orderDate instanceof Date
                                                    ? formData.orderDate
                                                    : new Date(`${formData.orderDate}T00:00:00`)
                                            )
                                            : null
                                    }
                                    onChange={(date) =>
                                        handleChange(
                                            "orderDate",
                                            date ? formatDateForInput(date) : ""
                                        )
                                    }
                                    dateFormat="dd/MM/yyyy"
                                    placeholderText="Select order date"
                                    className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm focus:border-blue-400 focus:outline-none"
                                    isClearable
                                    showPopperArrow={false}
                                />
                            </div>
                        </div>

                        {/* EXPECTED DELIVERY DATE */}
                        <div className="mb-6 flex items-center">
                            <label className="w-44 shrink-0 text-sm font-medium text-gray-700">
                                Expected Delivery Date
                            </label>

                            <div className="w-full max-w-[350px]">
                                <DatePicker
                                    selected={
                                        formData.expectedDeliveryDate
                                            ? new Date(
                                                `${formData.expectedDeliveryDate}T00:00:00`
                                            )
                                            : null
                                    }
                                    onChange={(date) =>
                                        handleChange(
                                            "expectedDeliveryDate",
                                            date
                                                ? formatDateForInput(date)
                                                : ""
                                        )
                                    }
                                    dateFormat="dd/MM/yyyy"
                                    placeholderText="Select expected delivery date"
                                    minDate={
                                        formData.orderDate
                                            ? new Date(`${formData.orderDate}T00:00:00`)
                                            : undefined
                                    }
                                    className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm focus:border-blue-400 focus:outline-none"
                                    isClearable
                                    showPopperArrow={false}
                                />
                            </div>
                        </div>

                        {/* ITEM TABLE */}
                        <div className="mb-4 overflow-visible rounded-lg border border-gray-200 bg-white">
                            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
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

                            <div className="w-full max-w-full overflow-x-auto overflow-y-visible">
                                <table className="w-full min-w-[1250px]">
                                    <thead>
                                        <tr className="border-b border-gray-200 bg-gray-50">
                                            <th className="w-8 px-2 py-2" />
                                            <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">
                                                Item Details
                                            </th>
                                            <th className="w-28 px-3 py-2 text-center text-xs font-semibold uppercase text-gray-500">
                                                Unit
                                            </th>
                                            <th className="w-28 px-3 py-2 text-center text-xs font-semibold uppercase text-gray-500">
                                                Size
                                            </th>
                                            <th className="w-28 px-3 py-2 text-right text-xs font-semibold uppercase text-gray-500">
                                                Discount
                                            </th>
                                            <th className="w-32 px-3 py-2 text-center text-xs font-semibold uppercase text-gray-500">
                                                Tax
                                            </th>
                                            <th className="w-24 px-3 py-2 text-right text-xs font-semibold uppercase text-gray-500">
                                                Quantity
                                            </th>
                                            <th className="w-32 px-3 py-2 text-right text-xs font-semibold uppercase text-gray-500">
                                                Rate
                                            </th>
                                            <th className="w-28 px-3 py-2 text-right text-xs font-semibold uppercase text-gray-500">
                                                Amount
                                            </th>
                                            <th className="w-8" />
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {formData.items.map((item, index) => {
                                            const amount = getItemAmount(item);

                                            return (
                                                <tr
                                                    key={`purchase-order-item-${index}`}
                                                    className="group border-b border-gray-100 hover:bg-gray-50"
                                                >
                                                    <td className="px-2 py-3 text-gray-300">
                                                        <div className="text-lg">⋮⋮</div>
                                                    </td>

                                                    {/* PRODUCT */}
                                                    <td className="relative overflow-visible px-3 py-3">
                                                        <input
                                                            value={item.description || ""}
                                                            placeholder="Type or click to select an item"
                                                            onClick={(event) =>
                                                                openItemDropdown(
                                                                    index,
                                                                    event.currentTarget
                                                                )
                                                            }
                                                            onChange={(event) => {
                                                                handleItemChange(
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
                                                            className="w-full rounded border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-blue-400 focus:outline-none"
                                                        />
                                                    </td>

                                                    {/* UNIT */}
                                                    <td className="px-3 py-3">
                                                        <CustomSUSelect
                                                            value={item.unitId || ""}
                                                            onChange={(value) =>
                                                                handleItemChange(
                                                                    index,
                                                                    "unitId",
                                                                    value
                                                                )
                                                            }
                                                            placeholder="Select Unit"
                                                            searchPlaceholder="Search units..."
                                                            searchable
                                                            addNewLabel="Unit"
                                                            addNewModalType="addUnit"
                                                            addNewData={{
                                                                targetField: "unitId",
                                                                rowIndex: index,
                                                                selectAfterCreate: true,
                                                            }}
                                                            width="w-[130px]"
                                                            size="sm"
                                                            options={[
                                                                {
                                                                    value: "",
                                                                    label: "Select",
                                                                },
                                                                ...units.map((unit) => ({
                                                                    value: String(unit.id),
                                                                    label:
                                                                        unit.unitName ||
                                                                        unit.unitShortName,
                                                                })),
                                                            ]}
                                                        />
                                                    </td>

                                                    {/* SIZE */}
                                                    <td className="px-3 py-3">
                                                        <CustomSUSelect
                                                            value={item.sizeId || ""}
                                                            onChange={(value) =>
                                                                handleItemChange(
                                                                    index,
                                                                    "sizeId",
                                                                    value
                                                                )
                                                            }
                                                            placeholder="Select Size"
                                                            searchPlaceholder="Search sizes..."
                                                            searchable
                                                            addNewLabel="Size"
                                                            addNewModalType="addSize"
                                                            addNewData={{
                                                                targetField: "sizeId",
                                                                rowIndex: index,
                                                                selectAfterCreate: true,
                                                            }}
                                                            width="w-[130px]"
                                                            size="sm"
                                                            options={[
                                                                {
                                                                    value: "",
                                                                    label: "Select",
                                                                },
                                                                ...sizes.map((size) => ({
                                                                    value: String(size.id),
                                                                    label:
                                                                        size.sizeName ||
                                                                        size.name ||
                                                                        size.sizeCode,
                                                                })),
                                                            ]}
                                                        />
                                                    </td>

                                                    {/* ITEM DISCOUNT */}
                                                    <td className="px-3 py-3">
                                                        {discountMode === "PRODUCT" ? (
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={
                                                                    item.discountValue ?? ""
                                                                }
                                                                onChange={(event) =>
                                                                    handleItemChange(
                                                                        index,
                                                                        "discountValue",
                                                                        Number(
                                                                            event.target.value || 0
                                                                        )
                                                                    )
                                                                }
                                                                className="w-full border-b border-transparent bg-transparent text-right text-sm focus:border-blue-400 focus:outline-none"
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
                                                            value={String(
                                                                item.taxMasterId ?? ""
                                                            )}
                                                            onChange={(value) =>
                                                                handleItemChange(
                                                                    index,
                                                                    "taxMasterId",
                                                                    value
                                                                )
                                                            }
                                                            placeholder="Select Tax"
                                                            searchPlaceholder="Search taxes..."
                                                            searchable
                                                            addNewLabel="Tax"
                                                            addNewModalType="addTaxMaster"
                                                            addNewData={{
                                                                targetField: "taxMasterId",
                                                                rowIndex: index,
                                                                selectAfterCreate: true,
                                                            }}
                                                            width="w-[130px]"
                                                            size="sm"
                                                            options={[
                                                                {
                                                                    value: "",
                                                                    label: "Select Tax",
                                                                },
                                                                ...taxMasters.map((tax) => ({
                                                                    value: String(tax.id),
                                                                    label: `${tax.taxName ||
                                                                        tax.name ||
                                                                        tax.taxType ||
                                                                        "Tax"
                                                                        } (${getTaxRate(tax)}%)`,
                                                                })),
                                                            ]}
                                                        />
                                                    </td>

                                                    {/* QUANTITY */}
                                                    <td className="px-3 py-3">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.001"
                                                            value={item.quantity ?? 0}
                                                            onChange={(event) =>
                                                                handleItemChange(
                                                                    index,
                                                                    "quantity",
                                                                    Number(event.target.value || 0)
                                                                )
                                                            }
                                                            className="w-full border-b border-transparent bg-transparent text-right text-sm focus:border-blue-400 focus:outline-none"
                                                        />
                                                    </td>

                                                    {/* RATE */}
                                                    <td className="px-3 py-3">
                                                        <div className="flex items-center">
                                                            <span className="whitespace-nowrap text-xs text-gray-500">
                                                                ({currencyCode})
                                                            </span>

                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={item.unitPrice ?? 0}
                                                                onChange={(event) =>
                                                                    handleUnitPriceChange(
                                                                        index,
                                                                        event.target.value
                                                                    )
                                                                }
                                                                className="w-full min-w-0 border-b border-transparent bg-transparent text-right text-sm focus:border-blue-400 focus:outline-none"
                                                            />
                                                        </div>
                                                    </td>

                                                    {/* AMOUNT */}
                                                    <td className="px-3 py-3 text-right text-sm font-semibold text-gray-800">
                                                        {currencySymbol}
                                                        {fmt(amount)}
                                                    </td>

                                                    {/* DELETE */}
                                                    <td className="px-2 py-3">
                                                        {formData.items.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleRemoveItem(index)
                                                                }
                                                                className="text-gray-400 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
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

                                {/* PRODUCT DROPDOWN */}
                                {openRowItemDropdown &&
                                    activeItemIndex !== null &&
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
                                            className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-2xl"
                                        >
                                            <div className="border-b border-gray-200 p-2">
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
                                                        className="w-full rounded border border-blue-300 py-2 pl-9 pr-3 text-sm focus:outline-none"
                                                    />
                                                </div>
                                            </div>

                                            <div className="max-h-60 overflow-y-auto p-1">
                                                {filteredProducts.length === 0 ? (
                                                    <div className="px-4 py-5 text-center text-sm text-gray-400">
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
                                                            product.purchasePrice ??
                                                            product.buyingPrice ??
                                                            product.costPrice ??
                                                            product.rate ??
                                                            product.price ??
                                                            0;

                                                        return (
                                                            <button
                                                                key={product.id}
                                                                type="button"
                                                                onClick={() =>
                                                                    handleProductSelect(
                                                                        product,
                                                                        activeItemIndex
                                                                    )
                                                                }
                                                                className="w-full rounded-md px-3 py-3 text-left hover:bg-blue-500 hover:text-white"
                                                            >
                                                                <div className="font-semibold">
                                                                    {name}
                                                                </div>

                                                                <div className="text-xs opacity-70">
                                                                    {product.sku || ""}
                                                                    {product.sku && " • "}
                                                                    Rate: {currencySymbol}
                                                                    {fmt(price)}
                                                                </div>
                                                            </button>
                                                        );
                                                    })
                                                )}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    navigate("/items/newSimple")
                                                }
                                                className="flex w-full items-center gap-2 border-t border-gray-200 px-4 py-3 text-blue-600 hover:bg-blue-50"
                                            >
                                                <Plus size={15} />
                                                Add New Product
                                            </button>
                                        </div>,
                                        document.body
                                    )}
                            </div>
                        </div>

                        {/* ADD ROW */}
                        <div className="mb-6 flex items-center gap-3">
                            <button
                                type="button"
                                onClick={handleAddItem}
                                className="flex items-center gap-1.5 rounded border border-blue-200 px-3 py-1.5 text-sm text-blue-600 hover:border-blue-400 hover:text-blue-700"
                            >
                                <Plus size={14} />
                                Add New Row
                            </button>
                        </div>

                        {/* NOTES + TOTALS */}
                        <div className="mb-6 flex gap-12">
                            <div className="max-w-sm flex-1">
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Notes
                                </label>

                                <textarea
                                    value={formData.notes}
                                    onChange={(event) =>
                                        handleChange("notes", event.target.value)
                                    }
                                    rows={3}
                                    placeholder="Enter purchase order notes"
                                    className="w-full resize-none rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
                                />

                                <p className="mt-1 text-xs text-gray-400">
                                    Notes for this purchase order
                                </p>
                            </div>

                            <div className="ml-auto max-w-sm flex-1">
                                <div className="flex items-center justify-between py-3">
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
                                        setShowSummary((prev) => !prev)
                                    }
                                    className="flex w-full items-center justify-end gap-1 text-sm text-blue-600 hover:text-blue-700"
                                >
                                    Total Summary

                                    <ChevronDown
                                        size={14}
                                        className={`transition-transform ${showSummary ? "rotate-180" : ""
                                            }`}
                                    />
                                </button>

                                {showSummary && (
                                    <div className="mt-2 space-y-2 border-t pt-2 text-sm text-gray-600">
                                        <div className="flex justify-between">
                                            <span>Sub Total ({currencyCode})</span>
                                            <span>
                                                {formatCurrency(totals.subtotal)}
                                            </span>
                                        </div>

                                        {/* DISCOUNT */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span>Discount</span>

                                                <select
                                                    value={discountMode}
                                                    onChange={(event) => {
                                                        const mode = event.target.value;

                                                        setDiscountMode(mode);

                                                        if (mode === "PRODUCT") {
                                                            handleChange(
                                                                "discountValue",
                                                                0
                                                            );
                                                        } else {
                                                            setFormData((prev) => ({
                                                                ...prev,
                                                                items: prev.items.map(
                                                                    (item) => ({
                                                                        ...item,
                                                                        discountValue: 0,
                                                                    })
                                                                ),
                                                            }));
                                                        }
                                                    }}
                                                    className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
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

                                                {discountMode === "COMMON" ? (
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={
                                                            formData.discountValue ?? ""
                                                        }
                                                        onChange={(event) =>
                                                            handleChange(
                                                                "discountValue",
                                                                event.target.value
                                                            )
                                                        }
                                                        placeholder="0.00"
                                                        className="w-24 rounded-md border border-gray-300 px-2 py-1 text-right"
                                                    />
                                                ) : (
                                                    <span className="w-24 text-right">
                                                        {fmt(totals.productDiscount)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* TAX */}
                                        <div className="flex justify-between">
                                            <span>Tax ({currencyCode})</span>
                                            <span>
                                                {formatCurrency(totals.tax)}
                                            </span>
                                        </div>

                                        {/* SHIPPING AMOUNT */}
                                        <div className="flex items-center justify-between">
                                            <span>Shipping Amount ({currencyCode})</span>

                                            <div className="flex items-center gap-1">
                                                <span>{currencySymbol}</span>

                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={formData.shippingAmount ?? ""}
                                                    onChange={(event) =>
                                                        handleChange(
                                                            "shippingAmount",
                                                            event.target.value
                                                        )
                                                    }
                                                    placeholder="0.00"
                                                    className="w-24 rounded-md border border-gray-300 px-2 py-1 text-right focus:border-blue-400 focus:outline-none"
                                                />
                                            </div>
                                        </div>

                                        {/* GRAND TOTAL */}
                                        <div className="flex justify-between border-t pt-2 font-semibold text-gray-800">
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
                    </div>

                    {/* FOOTER */}
                    <div className="z-30 flex shrink-0 items-center gap-3 border-t border-gray-200 bg-white px-3 py-2">
                        {/* LEFT: ACTION BUTTONS */}

                        <button
                            type="button"
                            onClick={handleSaveDraft}
                            disabled={purchaseOrderLoading || loadingRecord}
                            className="rounded border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                        >
                            {purchaseOrderLoading
                                ? isEdit
                                    ? "Updating..."
                                    : "Saving..."
                                : isEdit
                                    ? "Update as Draft"
                                    : "Save as Draft"}
                        </button>

                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={purchaseOrderLoading || loadingRecord}
                            className="h-10 rounded bg-blue-500 px-5 font-medium text-white hover:bg-blue-600 disabled:bg-blue-300"
                        >
                            {purchaseOrderLoading
                                ? isEdit
                                    ? "Updating..."
                                    : "Saving..."
                                : isEdit
                                    ? "Update Purchase Order"
                                    : "Save Purchase Order"}
                        </button>

                        <button
                            type="button"
                            onClick={handleClose}
                            className="rounded border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                        >
                            Cancel
                        </button>


                        {/* RIGHT: GRAND TOTAL */}
                        <div className="ml-auto flex shrink-0 items-center gap-4 border-l border-gray-200 pl-5 font-semibold text-gray-800">
                            <span className="text-sm">
                                Grand Total ({currencyCode})
                            </span>

                            <span className="text-lg text-blue-600">
                                {formatCurrency(totals.grandTotal)}
                            </span>
                        </div>

                    </div>
                    {/* LOADING OVERLAY */}
                    {
                        loadingRecord && (
                            <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/30">
                                <div className="rounded-lg bg-white px-6 py-4 text-sm font-medium text-gray-700 shadow-xl">
                                    Loading purchase order...
                                </div>
                            </div>
                        )
                    }

                    <LeaveConfirmationModal
                        show={showLeaveConfirmation}
                        title="Leave Purchase Order?"
                        message="You have unsaved changes. Do you want to leave this page?"
                        stayText="Stay Here"
                        leaveText="Leave"
                        onStay={handleStay}
                        onLeave={handleLeave}
                    />
                </div>
            </div >
        </>
    );
}