import React, {
    useState,
    useEffect,
    useCallback,
} from "react";

import {
    useDispatch,
    useSelector,
} from "react-redux";

import {
    useNavigate,
    useSearchParams,
} from "react-router-dom";

import {
    Plus,
    ChevronDown,
    Home,
    Settings,
    Filter,
    Search,
    RotateCcw,
    X,
} from "lucide-react";

import {
    setProductsStatus,
    setSelectedProductsView,
} from "../../../slices/productViewSlice";

import {
    fetchAllProducts,
} from "../../../thunks/productThunks";

import CustomSelect from "../../../../../common/custom/CustomSelect";
import ToolTipText from "../../../../../common/toolTip/ToolTipText";

/* =========================================================
   CONSTANTS
========================================================= */

const INITIAL_FILTERS = {
    productName: "",
    productCode: "",
    brand: "",
    categoryId: "",
    subCategoryId: "",
    hsnCode: "",
    taxId: "",
    status: "",
    fromDate: "",
    toDate: "",
};

const VALID_STATUSES = [
    "ALL",
    "ACTIVE",
    "INACTIVE",
    "DRAFT",
];

const STATUS_LABELS = {
    ALL: "All Products",
    ACTIVE: "Active Products",
    INACTIVE: "Inactive Products",
    DRAFT: "Draft Products",
};

/* =========================================================
   COMPONENT
========================================================= */

export default function NavbarProduct() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [searchParams] = useSearchParams();

    /* =====================================================
       LOCAL STATE
    ===================================================== */

    const [filterOpen, setFilterOpen] = useState(false);

    const [filters, setFilters] = useState(
        INITIAL_FILTERS
    );

    const [appliedFilters, setAppliedFilters] = useState(
        INITIAL_FILTERS
    );

    /* =====================================================
       REDUX STATE
    ===================================================== */

    const selectedProductView = useSelector(
        (state) =>
            state.productsView?.selectedProductsView
    );

    const productStatus = useSelector(
        (state) =>
            state.productsView?.productsStatus || "ALL"
    );

    const loading = useSelector(
        (state) =>
            state.product?.loading === true
    );

    const categories = useSelector(
        (state) =>
            state.category?.categories || []
    );

    const subCategories = useSelector(
        (state) =>
            state.subCategory?.subCategories || []
    );

    const taxMasters = useSelector(
        (state) =>
            state.taxMaster?.taxMasters || []
    );

    /* =====================================================
       URL STATUS
    ===================================================== */

    const urlStatus = searchParams.get("productStatus");

    const normalizedUrlStatus = String(
        urlStatus || ""
    )
        .trim()
        .toUpperCase();

    const effectiveProductStatus =
        VALID_STATUSES.includes(normalizedUrlStatus)
            ? normalizedUrlStatus
            : productStatus;

    /* =====================================================
       URL STATUS SYNCHRONIZATION
    ===================================================== */

    useEffect(() => {
        const selectedStatus = VALID_STATUSES.includes(
            normalizedUrlStatus
        )
            ? normalizedUrlStatus
            : productStatus;

        const selectedLabel =
            STATUS_LABELS[selectedStatus] ||
            "All Products";

        if (productStatus !== selectedStatus) {
            dispatch(
                setProductsStatus(selectedStatus)
            );
        }

        if (selectedProductView !== selectedLabel) {
            dispatch(
                setSelectedProductsView(selectedLabel)
            );
        }
    }, [
        normalizedUrlStatus,
        productStatus,
        selectedProductView,
        dispatch,
    ]);

    /* =====================================================
       FETCH PRODUCTS
    ===================================================== */

    const loadProducts = useCallback(
        (filterValues, selectedViewStatus) => {
            dispatch(
                fetchAllProducts({
                    ...filterValues,

                    status:
                        filterValues.status ||
                        (
                            selectedViewStatus === "ALL"
                                ? undefined
                                : selectedViewStatus
                        ),

                    page: 0,
                    size: 10,
                })
            );
        },
        [dispatch]
    );

    /* =====================================================
       FETCH WHEN FILTERS OR STATUS CHANGE
    ===================================================== */

    useEffect(() => {
        loadProducts(
            appliedFilters,
            effectiveProductStatus
        );
    }, [
        loadProducts,
        appliedFilters,
        effectiveProductStatus,
    ]);

    /* =====================================================
       FILTER INPUT CHANGE
    ===================================================== */

    const handleFilterChange = useCallback(
        (eOrName, selectedValue) => {
            const name =
                typeof eOrName === "string"
                    ? eOrName
                    : eOrName.target.name;

            const value =
                typeof eOrName === "string"
                    ? selectedValue
                    : eOrName.target.value;

            setFilters((previous) => ({
                ...previous,
                [name]: value,
            }));
        },
        []
    );

    /* =====================================================
       APPLY FILTERS
    ===================================================== */

    const handleApplyFilters = () => {
        setAppliedFilters({
            ...filters,
        });

        setFilterOpen(false);
    };

    /* =====================================================
       RESET FILTERS
    ===================================================== */

    const handleResetFilters = () => {
        setFilters({
            ...INITIAL_FILTERS,
        });

        setAppliedFilters({
            ...INITIAL_FILTERS,
        });
    };

    /* =====================================================
       REFRESH
    ===================================================== */

    const handleRefresh = () => {
        loadProducts(
            appliedFilters,
            effectiveProductStatus
        );
    };

    /* =====================================================
       STATUS VIEW CHANGE
    ===================================================== */

    const handleViewChange = (view) => {
        if (!view) return;

        dispatch(
            setSelectedProductsView(view.label)
        );

        dispatch(
            setProductsStatus(view.value)
        );

        navigate(
            `/invoice/products?productStatus=${view.value}`
        );
    };

    /* =====================================================
       CREATE PRODUCT
    ===================================================== */

    const handleCreateProduct = () => {
        navigate("/invoice/items/create");
    };

    /* =====================================================
       INPUT STYLES
    ===================================================== */

    const inputClass = `
        w-full
        rounded-md
        border
        border-gray-200
        bg-white
        px-3
        py-2
        text-sm
        text-gray-700
        outline-none
        transition
        focus:border-[#0095FD]
        focus:ring-2
        focus:ring-[#0095FD]/10
    `;

    const labelClass = `
        mb-1.5
        block
        text-xs
        font-medium
        text-gray-600
    `;

    /* =====================================================
       FILTER OPTIONS
    ===================================================== */

    const statusOptions = [
        { label: "All Statuses", value: "" },
        { label: "Active", value: "ACTIVE" },
        { label: "Inactive", value: "INACTIVE" },
        { label: "Draft", value: "DRAFT" },
    ];

    const categoryOptions = [
        { label: "All Categories", value: "" },
        ...categories.map((category) => ({
            label: category.categoryName,
            value: String(category.id),
        })),
    ];

    const subCategoryOptions = [
        { label: "All Subcategories", value: "" },
        ...subCategories
            .filter((subCategory) =>
                !filters.categoryId ||
                String(
                    subCategory.categoryId ??
                    subCategory.category?.id
                ) === String(filters.categoryId)
            )
            .map((subCategory) => ({
                label: subCategory.subCategoryName,
                value: String(subCategory.id),
            })),
    ];

    const taxOptions = [
        { label: "All Taxes", value: "" },
        ...taxMasters.map((tax) => ({
            label: tax.taxName,
            value: String(tax.id),
        })),
    ];

    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <div className="relative">

            {/* ==================================================
                NAVBAR
            ================================================== */}

            <div
                className="
                    flex min-h-[60px] items-center
                    justify-between gap-2 rounded-md
                    border border-gray-100 bg-white
                    px-2 py-2
                "
            >

                {/* LEFT */}

                <div className="relative flex items-center gap-2">

                    {/* HOME */}

                    <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="
                            group relative flex items-center justify-center
                            rounded-md border border-blue-300
                            bg-white p-2 text-[#0095FD]
                            transition hover:bg-[#0095FD]/20
                        "

                    >
                        <Home size={18} />
                        <ToolTipText text="Home" position="bottom" />


                    </button>

                    {/* TITLE */}

                    <div>
                        <h2 className="
                            text-xl font-semibold text-gray-800
                        ">
                            Product Overview
                        </h2>

                        <p className="
                            mt-1 text-xs text-gray-500
                        ">
                            Monitor and manage your business products.
                        </p>
                    </div>

                </div>

                {/* RIGHT */}

                <div className="flex items-center gap-2">

                    {/* REFRESH */}

                    <button
                        type="button"
                        onClick={handleRefresh}
                        disabled={loading}
                        className="
                            flex items-center gap-2 rounded-md
                            border border-gray-200 bg-white
                            px-3 py-2 text-sm text-gray-600
                            transition hover:bg-gray-50
                            disabled:opacity-50
                        "
                    >
                        <RotateCcw
                            size={15}
                            className={
                                loading ? "animate-spin" : ""
                            }
                        />

                        Refresh
                    </button>

                    {/* FILTER BUTTON */}

                    <button
                        type="button"
                        onClick={() =>
                            setFilterOpen((previous) => !previous)
                        }
                        className={`
                            flex items-center gap-2 rounded-md
                            border px-3 py-2 text-sm font-medium
                            transition
                            ${filterOpen
                                ? "border-[#0095FD] bg-[#0095FD] text-white"
                                : "border-gray-200 bg-white text-gray-600 hover:bg-blue-50 hover:text-[#0095FD]"
                            }
                        `}
                    >
                        <Filter size={16} />

                        <span>Filters</span>

                        <ChevronDown
                            size={14}
                            className={`
                                transition
                                ${filterOpen
                                    ? "rotate-180"
                                    : ""
                                }
                            `}
                        />
                    </button>

                    {/* NEW PRODUCT */}

                    <button
                        type="button"
                        onClick={handleCreateProduct}
                        className="
                            group relative flex items-center gap-1 rounded-md
                            bg-[#0095FD] px-3 py-2
                            text-sm font-medium text-white
                            hover:bg-[#0095FD]/90
                        "
                        title="Create New Product"
                    >
                        <Plus size={14} />

                        <span>New</span>
                        <ToolTipText text="New Product" position="bottom" />

                    </button>

                    {/* SETTINGS */}

                    <button
                        type="button"
                        onClick={() => navigate("/settings")}
                        className="
                            group relative rounded-md border border-gray-300
                            p-2 text-[#0095FD]
                            hover:bg-[#0095FD]/20
                        "

                    >
                        <Settings size={18} />
                        <ToolTipText text="Settings" position="bottom" />
                    </button>

                </div>
            </div>

            {/* ==================================================
                FILTER PANEL
            ================================================== */}

            {filterOpen && (
                <div
                    className="
                        absolute left-0 right-0 top-full
                        z-40 mt-2 rounded-lg border
                        border-gray-200 bg-white p-4 shadow-xl
                    "
                >

                    {/* FILTER HEADER */}

                    <div className="
                        mb-4 flex items-center justify-between
                    ">

                        <div className="flex items-center gap-2">
                            <Filter
                                size={17}
                                className="text-[#0095FD]"
                            />

                            <h3 className="
                                text-sm font-semibold text-gray-800
                            ">
                                Filter Products
                            </h3>
                        </div>

                        <button
                            type="button"
                            onClick={() => setFilterOpen(false)}
                            className="
                                rounded-md p-1 text-gray-400
                                hover:bg-gray-100 hover:text-gray-700
                            "
                            title="Close filters"
                        >
                            <X size={17} />
                        </button>

                    </div>

                    {/* FILTER INPUTS */}

                    <div className="
                        grid grid-cols-1 gap-4
                        sm:grid-cols-2 lg:grid-cols-3
                    ">

                        {/* PRODUCT NAME */}

                        <div>
                            <label className={labelClass}>
                                Product Name
                            </label>

                            <input
                                type="text"
                                name="productName"
                                value={filters.productName}
                                onChange={handleFilterChange}
                                placeholder="Enter product name"
                                className={inputClass}
                            />
                        </div>

                        {/* PRODUCT CODE */}

                        <div>
                            <label className={labelClass}>
                                Product Code
                            </label>

                            <input
                                type="text"
                                name="productCode"
                                value={filters.productCode}
                                onChange={handleFilterChange}
                                placeholder="Enter product code"
                                className={inputClass}
                            />
                        </div>

                        {/* BRAND */}

                        <div>
                            <label className={labelClass}>
                                Brand
                            </label>

                            <input
                                type="text"
                                name="brand"
                                value={filters.brand}
                                onChange={handleFilterChange}
                                placeholder="Enter brand"
                                className={inputClass}
                            />
                        </div>

                        {/* CATEGORY */}

                        <div>
                            <label className={labelClass}>
                                Category
                            </label>

                            <CustomSelect
                                name="categoryId"
                                value={filters.categoryId}
                                onChange={(value) => {
                                    const categoryId =
                                        typeof value === "object"
                                            ? value.value
                                            : value;

                                    setFilters((previous) => ({
                                        ...previous,
                                        categoryId,
                                        subCategoryId: "",
                                    }));
                                }}
                                options={categoryOptions}
                            />
                        </div>

                        {/* SUBCATEGORY */}

                        <div>
                            <label className={labelClass}>
                                Subcategory
                            </label>

                            <CustomSelect
                                name="subCategoryId"
                                value={filters.subCategoryId}
                                onChange={(value) => {
                                    handleFilterChange(
                                        "subCategoryId",
                                        typeof value === "object"
                                            ? value.value
                                            : value
                                    );
                                }}
                                options={subCategoryOptions}
                            />
                        </div>

                        {/* HSN CODE */}

                        <div>
                            <label className={labelClass}>
                                HSN Code
                            </label>

                            <input
                                type="text"
                                name="hsnCode"
                                value={filters.hsnCode}
                                onChange={handleFilterChange}
                                placeholder="Enter HSN code"
                                className={inputClass}
                            />
                        </div>

                        {/* TAX */}

                        <div>
                            <label className={labelClass}>
                                Tax
                            </label>

                            <CustomSelect
                                name="taxId"
                                value={filters.taxId}
                                onChange={(value) => {
                                    handleFilterChange(
                                        "taxId",
                                        typeof value === "object"
                                            ? value.value
                                            : value
                                    );
                                }}
                                options={taxOptions}
                            />
                        </div>

                        {/* STATUS */}

                        <div>
                            <label className={labelClass}>
                                Product Status
                            </label>

                            <CustomSelect
                                name="status"
                                value={filters.status}
                                onChange={(value) => {
                                    handleFilterChange(
                                        "status",
                                        typeof value === "object"
                                            ? value.value
                                            : value
                                    );
                                }}
                                options={statusOptions}
                            />
                        </div>

                        {/* FROM DATE */}

                        <div>
                            <label className={labelClass}>
                                From Date
                            </label>

                            <input
                                type="date"
                                name="fromDate"
                                value={filters.fromDate}
                                onChange={handleFilterChange}
                                className={inputClass}
                            />
                        </div>

                        {/* TO DATE */}

                        <div>
                            <label className={labelClass}>
                                To Date
                            </label>

                            <input
                                type="date"
                                name="toDate"
                                value={filters.toDate}
                                min={filters.fromDate || undefined}
                                onChange={handleFilterChange}
                                className={inputClass}
                            />
                        </div>

                    </div>

                    {/* ACTION BUTTONS */}

                    <div className="
                        mt-5 flex flex-wrap items-center
                        justify-between gap-3 border-t
                        border-gray-100 pt-4
                    ">

                        {/* RESET */}

                        <button
                            type="button"
                            onClick={handleResetFilters}
                            className="
                                flex items-center gap-2 rounded-md
                                border border-gray-200 px-3 py-2
                                text-sm text-gray-600 transition
                                hover:bg-gray-50
                            "
                        >
                            <RotateCcw size={14} />
                            Reset
                        </button>

                        <div className="flex items-center gap-2">

                            {/* CANCEL */}

                            <button
                                type="button"
                                onClick={() => setFilterOpen(false)}
                                className="
                                    rounded-md border border-gray-200
                                    px-4 py-2 text-sm text-gray-600
                                    hover:bg-gray-50
                                "
                            >
                                Cancel
                            </button>

                            {/* APPLY */}

                            <button
                                type="button"
                                onClick={handleApplyFilters}
                                className="
                                    flex items-center gap-2 rounded-md
                                    bg-[#0095FD] px-4 py-2
                                    text-sm font-medium text-white
                                    hover:bg-[#0095FD]/90
                                "
                            >
                                <Search size={14} />
                                Apply Filters
                            </button>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}