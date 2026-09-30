import React, {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    useDispatch,
    useSelector,
} from "react-redux";

import {
    ChevronDown,
    Check,
    Search,
    X,
    ListCheckIcon,
    ShoppingBasket,
    MonitorCheck,
    Package,
    Image as ImageIcon,
} from "lucide-react";

import toast from "react-hot-toast";

import {
    closeModal,
} from "../../ui/uiSlice";

import {
    resetProductForm,
} from "../slices/productSlice";

import {
    createProduct,
    updateProduct,
} from "../thunks/productThunks";

import {
    fetchAllCategories,
} from "../../category/thunks/categoryThunks";

import {
    fetchAllSubCategories,
} from "../../subCategory/thunks/subCategoryThunks";

import {
    fetchAllSizes,
} from "../../sizes/thunks/sizeThunks";

import {
    fetchAllUnits,
} from "../../units/thunks/unitThunks";

import {
    fetchAllTaxMasters,
} from "../../taxMaster/thunks/taxMasterThunks";


const EMPTY_ARRAY = [];


/* =========================================================
   SEARCHABLE SINGLE SELECT
   ========================================================= */

function SearchSelect({
    label = "",
    value,
    options = EMPTY_ARRAY,
    onChange,
    getOptionKey,
    getOptionLabel,
    placeholder = "Select...",
    disabled = false,
    required = false,
    error = "",
}) {
    const wrapperRef = useRef(null);

    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");

    /* =========================================================
       SAFE HELPERS
    ========================================================= */

    const safeLabel = String(label ?? "");

    const getSafeOptionLabel = (item) => {
        try {
            return String(
                getOptionLabel?.(item) ?? ""
            );
        } catch {
            return "";
        }
    };

    const getSafeOptionKey = (item) => {
        try {
            return getOptionKey?.(item);
        } catch {
            return undefined;
        }
    };

    /* =========================================================
       CLICK OUTSIDE
    ========================================================= */

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target)
            ) {
                setOpen(false);
                setSearch("");
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
       SELECTED OPTION
    ========================================================= */

    const selectedOption = useMemo(() => {
        if (
            value === "" ||
            value === null ||
            value === undefined
        ) {
            return null;
        }

        if (!Array.isArray(options)) {
            return null;
        }

        return options.find(
            (item) =>
                String(
                    getSafeOptionKey(item)
                ) === String(value)
        ) || null;
    }, [
        options,
        value,
        getOptionKey,
    ]);

    /* =========================================================
       FILTER OPTIONS
    ========================================================= */

    const filteredOptions = useMemo(() => {
        if (!Array.isArray(options)) {
            return [];
        }

        const keyword = String(search ?? "")
            .trim()
            .toLowerCase();

        if (!keyword) {
            return options;
        }

        return options.filter((item) => {
            const optionLabel =
                getSafeOptionLabel(item);

            return optionLabel
                .toLowerCase()
                .includes(keyword);
        });
    }, [
        options,
        search,
        getOptionLabel,
    ]);

    /* =========================================================
       SAFE PLACEHOLDER TEXT
    ========================================================= */

    const searchPlaceholder = safeLabel
        ? `Search ${safeLabel.toLowerCase()}...`
        : "Search...";

    const emptyMessage = safeLabel
        ? `No ${safeLabel.toLowerCase()} found`
        : "No options found";

    /* =========================================================
       RENDER
    ========================================================= */

    return (
        <div
            ref={wrapperRef}
            className="relative"
        >
            {/* LABEL */}
            <label
                className="
                    block
                    text-sm
                    font-medium
                    text-gray-700
                    mb-2
                "
            >
                {safeLabel}

                {required && (
                    <span className="text-red-500 ml-1">
                        *
                    </span>
                )}
            </label>

            {/* SELECT BUTTON */}
            <button
                type="button"
                disabled={disabled}
                onClick={() => {
                    if (!disabled) {
                        setOpen((prev) => !prev);
                    }
                }}
                className={`
                    w-full
                    h-11
                    px-3
                    border
                    rounded-md
                    bg-white
                    text-sm
                    flex
                    items-center
                    justify-between
                    text-left
                    outline-none
                    transition

                    ${error
                        ? "border-red-400"
                        : open
                            ? "border-blue-500 ring-1 ring-blue-500"
                            : "border-gray-300"
                    }

                    ${disabled
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "hover:border-gray-400"
                    }
                `}
            >
                <span
                    className={
                        selectedOption
                            ? "truncate text-gray-700"
                            : "truncate text-gray-400"
                    }
                >
                    {selectedOption
                        ? getSafeOptionLabel(
                            selectedOption
                        )
                        : placeholder}
                </span>

                <ChevronDown
                    size={17}
                    className={`
                        shrink-0
                        text-gray-500
                        transition-transform
                        ${open
                            ? "rotate-180"
                            : ""
                        }
                    `}
                />
            </button>

            {/* DROPDOWN */}
            {open && !disabled && (
                <div
                    className="
                        absolute
                        left-0
                        right-0
                        top-full
                        mt-1
                        z-[150]
                        bg-white
                        border
                        border-gray-200
                        rounded-md
                        shadow-xl
                        overflow-hidden
                    "
                >
                    {/* SEARCH */}
                    <div className="p-2 border-b border-gray-100">
                        <div className="relative">
                            <Search
                                size={15}
                                className="
                                    absolute
                                    left-3
                                    top-1/2
                                    -translate-y-1/2
                                    text-gray-400
                                "
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                                autoFocus
                                placeholder={
                                    searchPlaceholder
                                }
                                className="
                                    w-full
                                    h-9
                                    pl-9
                                    pr-3
                                    border
                                    border-gray-300
                                    rounded-md
                                    text-sm
                                    outline-none
                                    focus:border-blue-500
                                    focus:ring-1
                                    focus:ring-blue-500
                                "
                            />
                        </div>
                    </div>

                    {/* OPTIONS */}
                    <div className="max-h-52 overflow-y-auto">
                        {filteredOptions.length === 0 ? (
                            <div
                                className="
                                    px-4
                                    py-6
                                    text-center
                                    text-sm
                                    text-gray-400
                                "
                            >
                                {emptyMessage}
                            </div>
                        ) : (
                            filteredOptions.map(
                                (item, index) => {
                                    const key =
                                        getSafeOptionKey(
                                            item
                                        );

                                    const optionLabel =
                                        getSafeOptionLabel(
                                            item
                                        );

                                    const selected =
                                        String(key) ===
                                        String(value);

                                    return (
                                        <button
                                            key={
                                                key ??
                                                `option-${index}`
                                            }
                                            type="button"
                                            onClick={() => {
                                                if (
                                                    key ===
                                                    null ||
                                                    key ===
                                                    undefined
                                                ) {
                                                    return;
                                                }

                                                onChange?.(
                                                    key
                                                );

                                                setOpen(
                                                    false
                                                );

                                                setSearch(
                                                    ""
                                                );
                                            }}
                                            className={`
                                                w-full
                                                px-4
                                                py-2.5
                                                flex
                                                items-center
                                                justify-between
                                                text-left
                                                text-sm
                                                transition

                                                ${selected
                                                    ? "bg-blue-50 text-blue-700"
                                                    : "text-gray-700 hover:bg-gray-50"
                                                }
                                            `}
                                        >
                                            <span className="truncate">
                                                {optionLabel ||
                                                    "Unnamed option"}
                                            </span>

                                            {selected && (
                                                <Check
                                                    size={16}
                                                    className="text-blue-600"
                                                />
                                            )}
                                        </button>
                                    );
                                }
                            )
                        )}
                    </div>
                </div>
            )}

            {/* ERROR */}
            {error && (
                <p
                    className="
                        mt-1
                        text-xs
                        text-red-500
                    "
                >
                    {error}
                </p>
            )}
        </div>
    );
}


/* =========================================================
   SEARCHABLE MULTI SELECT
   ========================================================= */

const SearchMultiSelect = ({
    selected = [],
    options = [],
    onAdd,
    onRemove,
    getOptionKey = (item) => item?.id,
    getOptionLabel = (item) => item?.name ?? "",
    placeholder = "Select",
    required = false,
    error,
}) => {
    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const safeSelected = Array.isArray(selected) ? selected : [];
    const safeOptions = Array.isArray(options) ? options : [];

    const filteredOptions = safeOptions.filter((option) => {
        const label = String(getOptionLabel(option) ?? "");
        const searchValue = String(search ?? "");

        return label
            .toLowerCase()
            .includes(searchValue.toLowerCase());
    });

    const isSelected = (option) => {
        const optionKey = getOptionKey(option);

        return safeSelected.some(
            (selectedItem) =>
                String(selectedItem) === String(optionKey)
        );
    };

    const handleSelect = (option) => {
        const key = getOptionKey(option);

        if (key == null) return;

        if (!isSelected(option)) {
            onAdd?.(key);
        }

        setSearch("");
        setOpen(true);
    };

    return (
        <div ref={wrapperRef} className="relative">
            <div
                className={`
                    min-h-[44px]
                    w-full
                    px-3
                    py-1.5
                    border
                    rounded-md
                    bg-white
                    cursor-text
                    flex
                    flex-wrap
                    items-center
                    gap-2
                    ${error
                        ? "border-red-400"
                        : "border-gray-300"
                    }
                    focus-within:border-blue-500
                    focus-within:ring-1
                    focus-within:ring-blue-500
                `}
                onClick={() => setOpen(true)}
            >
                {safeSelected.map((selectedId, index) => {
                    const selectedItem = safeOptions.find(
                        (item) =>
                            String(getOptionKey(item)) ===
                            String(selectedId)
                    );

                    const label = selectedItem
                        ? String(
                            getOptionLabel(selectedItem) ?? ""
                        )
                        : String(selectedId ?? "");

                    return (
                        <div
                            key={`${selectedId}-${index}`}
                            className="
                                inline-flex
                                items-center
                                gap-1.5
                                px-2.5
                                py-1
                                rounded-full
                                bg-blue-50
                                border
                                border-blue-100
                                text-xs
                                text-blue-700
                            "
                        >
                            <span>{label}</span>

                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemove?.(selectedId);
                                }}
                                className="
                                    w-4
                                    h-4
                                    flex
                                    items-center
                                    justify-center
                                    rounded-full
                                    text-blue-400
                                    hover:bg-blue-100
                                    hover:text-blue-700
                                "
                            >
                                ×
                            </button>
                        </div>
                    );
                })}

                <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                    placeholder={
                        safeSelected.length === 0
                            ? placeholder
                            : ""
                    }
                    className="
                        flex-1
                        min-w-[120px]
                        h-8
                        border-0
                        outline-none
                        text-sm
                        text-gray-700
                        placeholder:text-gray-400
                        bg-transparent
                    "
                />
            </div>

            {error && (
                <p className="text-xs text-red-500 mt-1">
                    {error}
                </p>
            )}

            {open && (
                <div
                    className="
                        absolute
                        z-[9999]
                        left-0
                        right-0
                        mt-1
                        bg-white
                        border
                        border-gray-200
                        rounded-md
                        shadow-lg
                        overflow-hidden
                    "
                >
                    <div className="max-h-52 overflow-y-auto">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => {
                                const key = getOptionKey(option);
                                const label = String(
                                    getOptionLabel(option) ?? ""
                                );

                                const selectedOption =
                                    isSelected(option);

                                return (
                                    <button
                                        key={key}
                                        type="button"
                                        disabled={selectedOption}
                                        onClick={() =>
                                            handleSelect(option)
                                        }
                                        className={`
                                            w-full
                                            px-3
                                            py-2.5
                                            text-left
                                            text-sm
                                            flex
                                            items-center
                                            justify-between
                                            transition
                                            ${selectedOption
                                                ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                                                : "text-gray-700 hover:bg-blue-50"
                                            }
                                        `}
                                    >
                                        <span>{label}</span>

                                        {selectedOption && (
                                            <span className="text-xs text-blue-500">
                                                Selected
                                            </span>
                                        )}
                                    </button>
                                );
                            })
                        ) : (
                            <div className="px-3 py-3 text-sm text-gray-400">
                                No options found
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};


/* =========================================================
   PRODUCT CREATE
   ========================================================= */

export default function ProductCreate() {

    const dispatch =
        useDispatch();


    /* =======================================================
       MODAL
       ======================================================= */

    const modal =
        useSelector(
            (state) =>
                state.ui?.modal
        );


    /* =======================================================
       PRODUCT STATE
       ======================================================= */

    const loading = useSelector(
        (state) => state.product.loading
    );


    /* =======================================================
       MASTER DATA
       ======================================================= */

    const categories =
        useSelector(
            (state) =>
                state.category
                    ?.categories ??
                EMPTY_ARRAY
        );

    const subCategories =
        useSelector(
            (state) =>
                state.subCategory
                    ?.subCategories ??
                EMPTY_ARRAY
        );

    const sizes =
        useSelector(
            (state) =>
                state.size
                    ?.sizes ??
                EMPTY_ARRAY
        );

    const units =
        useSelector(
            (state) =>
                state.unit
                    ?.units ??
                EMPTY_ARRAY
        );

    const taxes =
        useSelector(
            (state) =>
                state.taxMaster
                    ?.taxMasters ??
                EMPTY_ARRAY
        );


    /* =======================================================
       MODAL MODE
       ======================================================= */

    const isEdit =
        modal?.type ===
        "editProduct";

    const isOpen =
        modal?.open &&
        (
            modal?.type ===
            "addProduct" ||
            modal?.type ===
            "editProduct"
        );


    /* =======================================================
       LOAD MASTER DATA
       ======================================================= */

    useEffect(() => {

        if (!isOpen) {
            return;
        }

        if (categories.length === 0) {
            dispatch(
                fetchAllCategories()
            );
        }

        if (subCategories.length === 0) {
            dispatch(
                fetchAllSubCategories()
            );
        }

        if (sizes.length === 0) {
            dispatch(
                fetchAllSizes()
            );
        }

        if (units.length === 0) {
            dispatch(
                fetchAllUnits()
            );
        }

        if (taxes.length === 0) {
            dispatch(
                fetchAllTaxMasters()
            );
        }

    }, [
        isOpen,
        dispatch,
        categories.length,
        subCategories.length,
        sizes.length,
        units.length,
        taxes.length,
    ]);


    /* =======================================================
       LABEL / KEY HELPERS
       ======================================================= */

    const getCategoryKey =
        (item) =>
            item?.id;

    const getCategoryLabel =
        (item) =>
            item?.categoryName ||
            item?.categoreyName ||
            item?.name ||
            "";

    const getSubCategoryKey =
        (item) =>
            item?.id;

    const getSubCategoryLabel =
        (item) =>
            item?.subCategoryName ||
            item?.name ||
            "";

    const getSizeKey =
        (item) =>
            item?.id ??
            item?.sizeId;

    const getSizeLabel =
        (item) => {

            const name =
                item?.sizeName ||
                "";

            const code =
                item?.sizeCode ||
                "";

            return code
                ? `${name} (${code})`
                : name;
        };

    const getUnitKey =
        (item) =>
            item?.id ??
            item?.unitId;

    const getUnitLabel =
        (item) => {

            const name =
                item?.unitName ||
                "";

            const code =
                item?.unitCode ||
                "";

            return code
                ? `${name} (${code})`
                : name;
        };


    /* =======================================================
       FORM
       ======================================================= */

    const [form, setForm] =
        useState({
            id: null,

            categoryId: "",

            subCategoryId: "",

            productName: "",

            brand: "",

            hsnCode: "",

            sellingPrice: "",

            purchasingPrice: "",

            taxId: "",

            minimumStock: "",

            maximumStock: "",

            sizes: [],

            units: [],

            status: "ACTIVE",

            image: null,

            imageUrl: "",
        });


    const [errors, setErrors] =
        useState({});

    const [imagePreview, setImagePreview] =
        useState("");


    /* =======================================================
       PRODUCT IMAGE URL
       ======================================================= */

    const getProductImageUrl =
        (imageUrl) => {

            if (!imageUrl) {
                return "";
            }

            if (
                imageUrl.startsWith(
                    "http://"
                ) ||
                imageUrl.startsWith(
                    "https://"
                )
            ) {
                return imageUrl.replace(
                    "http://localhost:8080",
                    "http://localhost:8081"
                );
            }

            return `http://localhost:8081/api/v1.0/uploads/products/${imageUrl}`;
        };


    /* =======================================================
       NORMALIZE EDIT SIZES
       ======================================================= */

    const normalizeSelectedSizes = (
        data
    ) => {

        /*
         * First try sizeIds because they are
         * the actual IDs that should be saved.
         */

        if (
            Array.isArray(
                data?.sizeIds
            ) &&
            data.sizeIds.length > 0
        ) {
            const mapped =
                data.sizeIds
                    .map(
                        (id) =>
                            sizes.find(
                                (size) =>
                                    String(
                                        getSizeKey(
                                            size
                                        )
                                    ) ===
                                    String(id)
                            )
                    )
                    .filter(Boolean);

            if (mapped.length > 0) {
                return mapped;
            }
        }


        /*
         * Fallback for APIs returning full
         * sizes instead of sizeIds.
         */

        if (
            Array.isArray(
                data?.sizes
            )
        ) {
            return data.sizes
                .map(
                    (item) => {

                        if (
                            item &&
                            typeof item ===
                            "object"
                        ) {
                            const id =
                                getSizeKey(
                                    item
                                );

                            const master =
                                sizes.find(
                                    (
                                        size
                                    ) =>
                                        String(
                                            getSizeKey(
                                                size
                                            )
                                        ) ===
                                        String(
                                            id
                                        )
                                );

                            return (
                                master ||
                                item
                            );
                        }

                        return sizes.find(
                            (size) =>
                                String(
                                    getSizeKey(
                                        size
                                    )
                                ) ===
                                String(item)
                        );
                    }
                )
                .filter(Boolean);
        }

        /*
         * Backward compatibility with
         * a single sizeId.
         */

        if (
            data?.sizeId !==
            undefined &&
            data?.sizeId !==
            null &&
            data?.sizeId !== ""
        ) {
            return sizes
                .filter(
                    (size) =>
                        String(
                            getSizeKey(
                                size
                            )
                        ) ===
                        String(
                            data.sizeId
                        )
                );
        }

        return [];
    };


    /* =======================================================
       NORMALIZE EDIT UNITS
       ======================================================= */

    const normalizeSelectedUnits = (
        data
    ) => {

        /*
         * First try unitIds.
         */

        if (
            Array.isArray(
                data?.unitIds
            ) &&
            data.unitIds.length > 0
        ) {
            const mapped =
                data.unitIds
                    .map(
                        (id) =>
                            units.find(
                                (unit) =>
                                    String(
                                        getUnitKey(
                                            unit
                                        )
                                    ) ===
                                    String(id)
                            )
                    )
                    .filter(Boolean);

            if (mapped.length > 0) {
                return mapped;
            }
        }


        /*
         * Fallback for APIs returning
         * complete unit objects.
         */

        if (
            Array.isArray(
                data?.units
            )
        ) {
            return data.units
                .map(
                    (item) => {

                        if (
                            item &&
                            typeof item ===
                            "object"
                        ) {
                            const id =
                                getUnitKey(
                                    item
                                );

                            const master =
                                units.find(
                                    (
                                        unit
                                    ) =>
                                        String(
                                            getUnitKey(
                                                unit
                                            )
                                        ) ===
                                        String(
                                            id
                                        )
                                );

                            return (
                                master ||
                                item
                            );
                        }

                        return units.find(
                            (unit) =>
                                String(
                                    getUnitKey(
                                        unit
                                    )
                                ) ===
                                String(item)
                        );
                    }
                )
                .filter(Boolean);
        }


        /*
         * Backward compatibility with
         * a single unitId.
         */

        if (
            data?.unitId !==
            undefined &&
            data?.unitId !==
            null &&
            data?.unitId !== ""
        ) {
            return units
                .filter(
                    (unit) =>
                        String(
                            getUnitKey(
                                unit
                            )
                        ) ===
                        String(
                            data.unitId
                        )
                );
        }

        return [];
    };


    /* =======================================================
       EDIT DATA
       ======================================================= */

    useEffect(() => {

        if (!isOpen || !isEdit) {
            return;
        }

        const data =
            modal?.data;

        if (!data) {
            return;
        }


        const imageUrl =
            data.imageUrl ??
            "";


        setImagePreview(
            imageUrl
                ? getProductImageUrl(
                    imageUrl
                )
                : ""
        );


        /*
         * IMPORTANT:
         *
         * This effect depends on sizes and units.
         * If edit data contains IDs before master
         * data has loaded, it will run again after
         * sizes/units are available.
         */

        const selectedSizes =
            normalizeSelectedSizes(
                data
            );

        const selectedUnits =
            normalizeSelectedUnits(
                data
            );


        console.log(
            "========== EDIT PRODUCT =========="
        );

        console.log(
            "EDIT DATA:",
            data
        );

        console.log(
            "EDIT SIZE IDS:",
            data.sizeIds
        );

        console.log(
            "EDIT UNIT IDS:",
            data.unitIds
        );

        console.log(
            "SELECTED SIZES:",
            selectedSizes
        );

        console.log(
            "SELECTED UNITS:",
            selectedUnits
        );


        setForm({
            id:
                data.id ??
                null,

            categoryId:
                data.categoryId ??
                data.category?.id ??
                "",

            subCategoryId:
                data.subCategoryId ??
                data.subCategory?.id ??
                "",

            productName:
                data.productName ??
                "",

            brand:
                data.brand ??
                "",

            hsnCode:
                data.hsnCode ??
                "",

            sellingPrice:
                data.sellingPrice ??
                "",

            purchasingPrice:
                data.purchasingPrice ??
                "",

            taxId:
                data.taxId ??
                data.tax?.id ??
                "",

            minimumStock:
                data.minimumStock ??
                "",

            maximumStock:
                data.maximumStock ??
                "",

            /*
             * ALL existing sizes.
             */
            sizes:
                selectedSizes,

            /*
             * ALL existing units.
             */
            units:
                selectedUnits,

            status:
                data.status ??
                "ACTIVE",

            image:
                null,

            imageUrl:
                imageUrl,
        });

        setErrors({});

    }, [
        isOpen,
        isEdit,
        modal?.data,
        sizes,
        units,
    ]);


    /* =======================================================
       RESET FORM WHEN ADD MODAL OPENS
       ======================================================= */

    useEffect(() => {

        if (
            !isOpen ||
            isEdit
        ) {
            return;
        }

        setForm({
            id: null,

            categoryId: "",

            subCategoryId: "",

            productName: "",

            brand: "",

            hsnCode: "",

            sellingPrice: "",

            purchasingPrice: "",

            taxId: "",

            minimumStock: "",

            maximumStock: "",

            sizes: [],

            units: [],

            status: "ACTIVE",

            image: null,

            imageUrl: "",
        });

        setErrors({});

        setImagePreview("");

    }, [
        isOpen,
        isEdit,
    ]);


    /* =======================================================
       FILTER SUBCATEGORIES
       ======================================================= */

    const filteredSubCategories =
        useMemo(() => {

            if (!form.categoryId) {
                return EMPTY_ARRAY;
            }

            return subCategories.filter(
                (item) => {

                    const categoryId =
                        item?.categoryId ??
                        item?.category
                            ?.id;

                    return (
                        String(
                            categoryId
                        ) ===
                        String(
                            form.categoryId
                        )
                    );
                }
            );

        }, [
            subCategories,
            form.categoryId,
        ]);


    /* =======================================================
       FIELD CHANGE
       ======================================================= */

    const handleChange =
        (
            field,
            value
        ) => {

            setForm(
                (prev) => ({
                    ...prev,

                    [field]:
                        value,
                })
            );

            setErrors(
                (prev) => ({
                    ...prev,

                    [field]:
                        "",
                })
            );
        };


    /* =======================================================
       CATEGORY CHANGE
       ======================================================= */

    const handleCategoryChange =
        (value) => {

            setForm(
                (prev) => ({
                    ...prev,

                    categoryId:
                        value,

                    subCategoryId:
                        "",
                })
            );

            setErrors(
                (prev) => ({
                    ...prev,

                    categoryId:
                        "",

                    subCategoryId:
                        "",
                })
            );
        };


    /* =======================================================
       ADD SIZE
       ======================================================= */

    const handleAddSize =
        (size) => {

            setForm(
                (prev) => {

                    const exists =
                        prev.sizes.some(
                            (item) =>
                                String(
                                    getSizeKey(
                                        item
                                    )
                                ) ===
                                String(
                                    getSizeKey(
                                        size
                                    )
                                )
                        );

                    if (exists) {
                        return prev;
                    }

                    return {
                        ...prev,

                        sizes: [
                            ...prev.sizes,
                            size,
                        ],
                    };
                }
            );

            setErrors(
                (prev) => ({
                    ...prev,
                    sizes: "",
                })
            );
        };


    /* =======================================================
       REMOVE SIZE
       ======================================================= */

    const handleRemoveSize =
        (size) => {

            const id =
                getSizeKey(size);

            setForm(
                (prev) => ({
                    ...prev,

                    sizes:
                        prev.sizes.filter(
                            (item) =>
                                String(
                                    getSizeKey(
                                        item
                                    )
                                ) !==
                                String(id)
                        ),
                })
            );
        };


    /* =======================================================
       ADD UNIT
       ======================================================= */

    const handleAddUnit =
        (unit) => {

            setForm(
                (prev) => {

                    const exists =
                        prev.units.some(
                            (item) =>
                                String(
                                    getUnitKey(
                                        item
                                    )
                                ) ===
                                String(
                                    getUnitKey(
                                        unit
                                    )
                                )
                        );

                    if (exists) {
                        return prev;
                    }

                    return {
                        ...prev,

                        units: [
                            ...prev.units,
                            unit,
                        ],
                    };
                }
            );

            setErrors(
                (prev) => ({
                    ...prev,
                    units: "",
                })
            );
        };


    /* =======================================================
       REMOVE UNIT
       ======================================================= */

    const handleRemoveUnit =
        (unit) => {

            const id =
                getUnitKey(unit);

            setForm(
                (prev) => ({
                    ...prev,

                    units:
                        prev.units.filter(
                            (item) =>
                                String(
                                    getUnitKey(
                                        item
                                    )
                                ) !==
                                String(id)
                        ),
                })
            );
        };


    /* =======================================================
       IMAGE
       ======================================================= */

    const handleImageChange =
        (event) => {

            const file =
                event.target
                    .files?.[0];

            if (!file) {
                return;
            }

            setForm(
                (prev) => ({
                    ...prev,

                    image:
                        file,
                })
            );

            setImagePreview(
                URL.createObjectURL(
                    file
                )
            );
        };


    /* =======================================================
       CLOSE
       ======================================================= */

    const handleClose =
        () => {

            if (loading) {
                return;
            }

            dispatch(
                closeModal()
            );

            dispatch(
                resetProductForm()
            );
        };


    /* =======================================================
       ESCAPE
       ======================================================= */

    useEffect(() => {

        if (!isOpen) {
            return;
        }

        const handleEscape =
            (event) => {

                if (
                    event.key ===
                    "Escape"
                ) {
                    handleClose();
                }
            };

        document.addEventListener(
            "keydown",
            handleEscape
        );

        return () => {
            document.removeEventListener(
                "keydown",
                handleEscape
            );
        };

    }, [
        isOpen,
        loading,
    ]);


    /* =======================================================
       VALIDATION
       ======================================================= */

    const validate =
        () => {

            const nextErrors =
                {};


            if (!form.categoryId) {
                nextErrors.categoryId =
                    "Category is required";
            }


            if (!form.subCategoryId) {
                nextErrors.subCategoryId =
                    "Subcategory is required";
            }


            if (
                !form.productName?.trim()
            ) {
                nextErrors.productName =
                    "Product name is required";
            }


            if (
                form.purchasingPrice ===
                "" ||
                Number(
                    form.purchasingPrice
                ) < 0
            ) {
                nextErrors.purchasingPrice =
                    "Enter a valid purchasing price";
            }


            if (
                form.sellingPrice ===
                "" ||
                Number(
                    form.sellingPrice
                ) < 0
            ) {
                nextErrors.sellingPrice =
                    "Enter a valid selling price";
            }


            if (!form.taxId) {
                nextErrors.taxId =
                    "Tax is required";
            }


            if (
                form.minimumStock !==
                "" &&
                Number(
                    form.minimumStock
                ) < 0
            ) {
                nextErrors.minimumStock =
                    "Enter a valid minimum stock";
            }


            if (
                form.maximumStock !==
                "" &&
                Number(
                    form.maximumStock
                ) < 0
            ) {
                nextErrors.maximumStock =
                    "Enter a valid maximum stock";
            }


            if (
                form.minimumStock !==
                "" &&
                form.maximumStock !==
                "" &&
                Number(
                    form.minimumStock
                ) >
                Number(
                    form.maximumStock
                )
            ) {
                nextErrors.maximumStock =
                    "Maximum stock must be greater than minimum stock";
            }


            /* =================================================
               SIZE VALIDATION
               ================================================= */

            // if (
            //     !Array.isArray(
            //         form.sizes
            //     ) ||
            //     form.sizes.length === 0
            // ) {
            //     nextErrors.sizes =
            //         "At least one size is required";
            // }


            /* =================================================
               UNIT VALIDATION
               ================================================= */

            // if (
            //     !Array.isArray(
            //         form.units
            //     ) ||
            //     form.units.length === 0
            // ) {
            //     nextErrors.units =
            //         "At least one unit is required";
            // }


            setErrors(
                nextErrors
            );


            return (
                Object.keys(
                    nextErrors
                ).length === 0
            );
        };

    const validateProductTabs = () => {
        const newErrors = {};

        // Product Information
        if (!form.categoryId) {
            newErrors.categoryId = "Category is required";
        }

        if (!form.subCategoryId) {
            newErrors.subCategoryId = "Sub Category is required";
        }

        if (!String(form.productName ?? "").trim()) {
            newErrors.productName = "Product Name is required";
        }

        // Pricing
        if (
            form.purchasingPrice === "" ||
            form.purchasingPrice === null ||
            form.purchasingPrice === undefined
        ) {
            newErrors.purchasingPrice =
                "Purchasing Price is required";
        } else if (Number(form.purchasingPrice) < 0) {
            newErrors.purchasingPrice =
                "Purchasing Price cannot be negative";
        }

        if (
            form.sellingPrice === "" ||
            form.sellingPrice === null ||
            form.sellingPrice === undefined
        ) {
            newErrors.sellingPrice =
                "Selling Price is required";
        } else if (Number(form.sellingPrice) < 0) {
            newErrors.sellingPrice =
                "Selling Price cannot be negative";
        }

        if (!form.taxId) {
            newErrors.taxId = "Tax is required";
        }

        // Inventory
        if (
            form.minimumStock !== "" &&
            form.minimumStock !== null &&
            form.minimumStock !== undefined &&
            Number(form.minimumStock) < 0
        ) {
            newErrors.minimumStock =
                "Minimum Stock cannot be negative";
        }

        if (
            form.maximumStock !== "" &&
            form.maximumStock !== null &&
            form.maximumStock !== undefined &&
            Number(form.maximumStock) < 0
        ) {
            newErrors.maximumStock =
                "Maximum Stock cannot be negative";
        }

        if (
            form.minimumStock !== "" &&
            form.maximumStock !== "" &&
            Number(form.minimumStock) >
            Number(form.maximumStock)
        ) {
            newErrors.maximumStock =
                "Maximum Stock must be greater than Minimum Stock";
        }

        setErrors(newErrors);

        // Product tab
        if (
            newErrors.categoryId ||
            newErrors.subCategoryId ||
            newErrors.productName
        ) {
            setActiveTab("product");

            toast.error(
                "Please complete Product Information"
            );

            return false;
        }

        // Pricing tab
        if (
            newErrors.purchasingPrice ||
            newErrors.sellingPrice ||
            newErrors.taxId
        ) {
            setActiveTab("pricing");

            toast.error(
                "Please complete Pricing & Tax"
            );

            return false;
        }

        // Inventory tab
        if (
            newErrors.minimumStock ||
            newErrors.maximumStock
        ) {
            setActiveTab("inventory");

            toast.error(
                "Please correct Inventory fields"
            );

            return false;
        }

        return true;
    };


    /* =======================================================
       SAVE
       ======================================================= */


    const handleSave = async (e) => {
        e.preventDefault();

        // ============================================
        // VALIDATE ALL TABS
        // ============================================

        const isValid = validateProductTabs();

        if (!isValid) {
            return;
        }

        // ============================================
        // SIZE IDS
        // ============================================

        const sizeIds = Array.isArray(form.sizes)
            ? form.sizes
                .map((id) => Number(id))
                .filter((id) => !Number.isNaN(id))
            : [];

        // ============================================
        // UNIT IDS
        // ============================================

        const unitIds = Array.isArray(form.units)
            ? form.units
                .map((id) => Number(id))
                .filter((id) => !Number.isNaN(id))
            : [];

        // ============================================
        // PAYLOAD
        // ============================================

        const payload = {
            productName: String(
                form.productName ?? ""
            ).trim(),

            subCategoryId: Number(
                form.subCategoryId
            ),

            brand: String(
                form.brand ?? ""
            ).trim(),

            hsnCode: String(
                form.hsnCode ?? ""
            ).trim(),

            sellingPrice: Number(
                form.sellingPrice
            ),

            purchasingPrice: Number(
                form.purchasingPrice
            ),

            taxId: Number(
                form.taxId
            ),

            minimumStock: Number(
                form.minimumStock || 0
            ),

            maximumStock: Number(
                form.maximumStock || 0
            ),

            sizeIds,

            unitIds,

            status: form.status || "ACTIVE",

            image: form.image || null,
        };

        console.log(
            "PRODUCT SAVE PAYLOAD:",
            payload
        );

        // ============================================
        // API
        // ============================================

        try {
            let result;

            if (isEdit) {
                result = await dispatch(
                    updateProduct({
                        id: productId,
                        data: payload,
                    })
                ).unwrap();
            } else {
                result = await dispatch(
                    createProduct(payload)
                ).unwrap();
            }

            console.log(
                "PRODUCT SAVE RESPONSE:",
                result
            );

            toast.success(
                isEdit
                    ? "Product updated successfully"
                    : "Product created successfully"
            );

            // Close modal
            handleClose();

            // Reset form
            dispatch(resetProductForm());

        } catch (error) {
            console.error(
                "Product save error:",
                error
            );

            toast.error(
                error?.message ||
                error?.response?.data?.message ||
                "Failed to save product"
            );
        }
    };

    /* =======================================================
       DO NOT RENDER
       ======================================================= */

    if (!isOpen) {
        return null;
    }


    /* =======================================================
     UI
  ======================================================= */

    const [activeTab, setActiveTab] = useState("product");

    // =================================================
    // COMMON UI CLASSES
    // =================================================

    const inputClass = `
        w-full
        h-11
        px-3
        border
        border-gray-300
        rounded-md
        text-sm
        text-gray-700
        bg-white
        outline-none
        transition
        focus:border-blue-500
        focus:ring-1
        focus:ring-blue-500
        disabled:bg-gray-100
        disabled:text-gray-500
        disabled:cursor-not-allowed
    `;

    const labelClass = `
        block
        text-xs
        font-medium
        text-gray-600
        mb-1.5
    `;

    // =================================================
    // TABS
    // =================================================

    const tabs = [
        {
            id: "product",
            label: "Product Information",
        },
        {
            id: "pricing",
            label: "Pricing & Tax",
        },
        {
            id: "inventory",
            label: "Inventory",
        },

        {
            id: "settings",
            label: "Settings",
        },
    ];


    return (
        <div
            className="
        w-[950px]
        max-w-[95vw]
        h-[960px]
        max-h-[88vh]
        bg-white
        rounded-xl
        shadow-2xl
        overflow-hidden
        flex
        flex-col
        "
        >

            {/* =================================================
            HEADER
        ================================================= */}

            <div
                className="
            shrink-0
            h-[68px]
            flex
            items-center
            justify-between
            px-6
            border-b
            border-gray-200
            bg-white
            "
            >

                <div className="flex items-center gap-3">

                    <div
                        className="
                    w-9
                    h-9
                    rounded-lg
                    bg-blue-50
                    flex
                    items-center
                    justify-center
                    "
                    >
                        <Package
                            size={20}
                            className="text-blue-600"
                        />
                    </div>

                    <div>

                        <h2
                            className="
                        text-[17px]
                        font-semibold
                        text-gray-800
                        "
                        >
                            {isEdit
                                ? "Edit Product"
                                : "New Product"}
                        </h2>

                        <p
                            className="
                        text-xs
                        text-gray-500
                        mt-0.5
                        "
                        >
                            {isEdit
                                ? "Update product information"
                                : "Create a new product"}
                        </p>

                    </div>

                </div>




            </div>


            {/* =================================================
            TABS
        ================================================= */}

            <div
                className="
            shrink-0
            px-6
            border-b
            border-gray-200
            bg-white
            "
            >

                <div
                    className="
                flex
                items-center
                gap-8
                h-[52px]
                "
                >

                    {tabs.map((tab) => {
                        const active = activeTab === tab.id;

                        const hasError =
                            (tab.id === "product" &&
                                (
                                    errors.categoryId ||
                                    errors.subCategoryId ||
                                    errors.productName
                                )) ||
                            (tab.id === "pricing" &&
                                (
                                    errors.purchasingPrice ||
                                    errors.sellingPrice ||
                                    errors.taxId
                                )) ||
                            (tab.id === "inventory" &&
                                (
                                    errors.minimumStock ||
                                    errors.maximumStock
                                ));

                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                relative
                h-full
                text-sm
                font-medium
                transition
                ${active
                                        ? "text-blue-600"
                                        : hasError
                                            ? "text-red-500"
                                            : "text-gray-500 hover:text-gray-800"
                                    }
            `}
                            >
                                <span className="flex items-center gap-1.5">
                                    {tab.label}

                                    {hasError && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                    )}
                                </span>

                                {active && (
                                    <span
                                        className="
                        absolute
                        left-0
                        right-0
                        bottom-0
                        h-[2px]
                        bg-blue-600
                        rounded-t
                    "
                                    />
                                )}
                            </button>
                        );
                    })}

                </div>

            </div>


            {/* =================================================
            FORM
        ================================================= */}

            <form
                onSubmit={handleSave}
                className="
            flex
            flex-col
            flex-1
            min-h-0
            overflow-hidden
            "
            >

                {/* =================================================
                SCROLL BODY
            ================================================= */}

                <div
                    className="
                flex-1
                min-h-0
                overflow-y-auto
                overflow-x-hidden
                px-7
                py-6
                bg-gray-50/50
                "
                >

                    {/* =================================================
                    PRODUCT INFORMATION
                ================================================= */}

                    {activeTab === "product" && (

                        <div>

                            {/* SECTION HEADER */}

                            <div
                                className="
                            mb-6
                            flex
                            items-start
                            justify-between
                            gap-6
                            "
                            >

                                <div>

                                    <h3
                                        className="
                                    text-base
                                    font-semibold
                                    text-gray-800
                                    "
                                    >
                                        Product Information
                                    </h3>

                                    <p
                                        className="
                                    text-xs
                                    text-gray-500
                                    mt-1
                                    "
                                    >
                                        Configure the basic product
                                        information.
                                    </p>

                                </div>


                                {/* STATUS */}

                                <div className="flex items-center gap-3 shrink-0">
                                    <label
                                        className="
            text-md
            font-semibold
            text-gray-600
        "
                                    >
                                        Status :
                                    </label>

                                    <span
                                        className={`
            inline-flex
            items-center
            justify-center
            min-w-[85px]
            h-7
            px-3
            rounded-full
            text-sm
            font-bold
            ${form.status === "ACTIVE"
                                                ? "bg-green-50 text-green-700"
                                                : form.status === "INACTIVE"
                                                    ? "bg-red-50 text-red-700"
                                                    : "bg-yellow-50 text-yellow-700"
                                            }
        `}
                                    >
                                        {form.status || "ACTIVE"}
                                    </span>
                                </div>
                            </div>


                            {/* =================================================
                            IMAGE
                        ================================================= */}

                            <div
                                className="
                            mb-7
                            p-5
                            border
                            border-gray-200
                            rounded-lg
                            bg-white
                            "
                            >

                                <div className="flex items-start gap-5">

                                    {/* IMAGE PREVIEW */}

                                    <div
                                        className="
                                    w-[110px]
                                    h-[110px]
                                    shrink-0
                                    rounded-lg
                                    border
                                    border-gray-200
                                    bg-gray-50
                                    overflow-hidden
                                    flex
                                    items-center
                                    justify-center
                                    "
                                    >

                                        {imagePreview ? (

                                            <img
                                                src={imagePreview}
                                                alt="Product"
                                                className="
                                            w-full
                                            h-full
                                            object-cover
                                            "
                                            />

                                        ) : (

                                            <div
                                                className="
                                            flex
                                            flex-col
                                            items-center
                                            justify-center
                                            text-gray-400
                                            "
                                            >

                                                <ImageIcon
                                                    size={28}
                                                />

                                                <span
                                                    className="
                                                text-[11px]
                                                mt-1
                                                "
                                                >
                                                    No Image
                                                </span>

                                            </div>

                                        )}

                                    </div>


                                    {/* IMAGE INPUT */}

                                    <div className="flex-1">

                                        <label className={labelClass}>
                                            Product Image
                                        </label>

                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={
                                                handleImageChange
                                            }
                                            className="
                                        block
                                        w-full
                                        text-sm
                                        text-gray-600
                                        file:mr-4
                                        file:py-2
                                        file:px-4
                                        file:rounded-md
                                        file:border-0
                                        file:text-sm
                                        file:font-medium
                                        file:bg-blue-50
                                        file:text-blue-700
                                        hover:file:bg-blue-100
                                        cursor-pointer
                                        "
                                        />

                                        <p
                                            className="
                                        text-[11px]
                                        text-gray-400
                                        mt-2
                                        "
                                        >
                                            Upload a product image.
                                        </p>

                                    </div>

                                </div>

                            </div>


                            {/* =================================================
                            PRODUCT FIELDS
                        ================================================= */}

                            <div
                                className="
                            grid
                            grid-cols-2
                            gap-x-6
                            gap-y-5
                            "
                            >

                                {/* CATEGORY */}

                                <div>

                                    <label className={labelClass}>
                                        Category
                                        <span className="text-red-500 ml-1">
                                            *
                                        </span>
                                    </label>

                                    <SearchSelect
                                        value={form.categoryId}
                                        options={categories || []}
                                        onChange={
                                            handleCategoryChange
                                        }
                                        getOptionKey={(item) =>
                                            item.id
                                        }
                                        getOptionLabel={(item) =>
                                            item.categoryName ||
                                            item.name ||
                                            ""
                                        }
                                        placeholder="Select category"
                                        required
                                        error={
                                            errors.categoryId
                                        }
                                    />

                                </div>


                                {/* SUB CATEGORY */}

                                <div>

                                    <label className={labelClass}>
                                        Sub Category
                                        <span className="text-red-500 ml-1">
                                            *
                                        </span>
                                    </label>

                                    <SearchSelect
                                        value={
                                            form.subCategoryId
                                        }
                                        options={
                                            filteredSubCategories ||
                                            []
                                        }
                                        onChange={(value) =>
                                            handleChange(
                                                "subCategoryId",
                                                value
                                            )
                                        }
                                        getOptionKey={(item) =>
                                            item.id
                                        }
                                        getOptionLabel={(item) =>
                                            item.subCategoryName ||
                                            item.name ||
                                            ""
                                        }
                                        placeholder={
                                            form.categoryId
                                                ? "Select sub category"
                                                : "Select category first"
                                        }
                                        disabled={
                                            !form.categoryId
                                        }
                                        required
                                        error={
                                            errors.subCategoryId
                                        }
                                    />

                                </div>


                                {/* PRODUCT NAME */}

                                <div>

                                    <label className={labelClass}>
                                        Product Name
                                        <span className="text-red-500 ml-1">
                                            *
                                        </span>
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            form.productName ??
                                            ""
                                        }
                                        onChange={(e) =>
                                            handleChange(
                                                "productName",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter product name"
                                        className={inputClass}
                                    />

                                    {errors.productName && (

                                        <p
                                            className="
                                        text-xs
                                        text-red-500
                                        mt-1
                                        "
                                        >
                                            {errors.productName}
                                        </p>

                                    )}

                                </div>


                                {/* BRAND */}

                                <div>

                                    <label className={labelClass}>
                                        Brand
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            form.brand ??
                                            ""
                                        }
                                        onChange={(e) =>
                                            handleChange(
                                                "brand",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter brand"
                                        className={inputClass}
                                    />

                                </div>


                                {/* HSN */}

                                <div>

                                    <label className={labelClass}>
                                        HSN Code
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            form.hsnCode ??
                                            ""
                                        }
                                        onChange={(e) =>
                                            handleChange(
                                                "hsnCode",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter HSN code"
                                        className={inputClass}
                                    />

                                </div>

                            </div>


                        </div>


                    )}


                    {/* =================================================
                    PRICING & TAX
                ================================================= */}

                    {activeTab === "pricing" && (

                        <div>

                            <div className="mb-6">

                                <h3
                                    className="
                                text-base
                                font-semibold
                                text-gray-800
                                "
                                >
                                    Pricing & Tax
                                </h3>

                                <p
                                    className="
                                text-xs
                                text-gray-500
                                mt-1
                                "
                                >
                                    Configure product pricing and
                                    applicable tax.
                                </p>

                            </div>


                            <div
                                className="
                            grid
                            grid-cols-2
                            gap-x-6
                            gap-y-5
                            "
                            >

                                {/* PURCHASING PRICE */}

                                <div>

                                    <label className={labelClass}>
                                        Purchasing Price
                                        <span className="text-red-500 ml-1">
                                            *
                                        </span>
                                    </label>

                                    <div className="relative">

                                        <span
                                            className="
                                        absolute
                                        left-3
                                        top-1/2
                                        -translate-y-1/2
                                        text-sm
                                        text-gray-400
                                        "
                                        >
                                            ₹
                                        </span>

                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={
                                                form.purchasingPrice ??
                                                ""
                                            }
                                            onChange={(e) =>
                                                handleChange(
                                                    "purchasingPrice",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="0.00"
                                            className={`
                                            ${inputClass}
                                            pl-8
                                        `}
                                        />

                                    </div>

                                    {errors.purchasingPrice && (

                                        <p
                                            className="
                                        text-xs
                                        text-red-500
                                        mt-1
                                        "
                                        >
                                            {
                                                errors.purchasingPrice
                                            }
                                        </p>

                                    )}

                                </div>


                                {/* SELLING PRICE */}

                                <div>

                                    <label className={labelClass}>
                                        Selling Price
                                        <span className="text-red-500 ml-1">
                                            *
                                        </span>
                                    </label>

                                    <div className="relative">

                                        <span
                                            className="
                                        absolute
                                        left-3
                                        top-1/2
                                        -translate-y-1/2
                                        text-sm
                                        text-gray-400
                                        "
                                        >
                                            ₹
                                        </span>

                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={
                                                form.sellingPrice ??
                                                ""
                                            }
                                            onChange={(e) =>
                                                handleChange(
                                                    "sellingPrice",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="0.00"
                                            className={`
                                            ${inputClass}
                                            pl-8
                                        `}
                                        />

                                    </div>

                                    {errors.sellingPrice && (

                                        <p
                                            className="
                                        text-xs
                                        text-red-500
                                        mt-1
                                        "
                                        >
                                            {errors.sellingPrice}
                                        </p>

                                    )}

                                </div>


                                {/* TAX */}

                                <div>

                                    <label className={labelClass}>
                                        Tax
                                        <span className="text-red-500 ml-1">
                                            *
                                        </span>
                                    </label>

                                    <SearchSelect
                                        value={form.taxId}
                                        options={taxes || []}
                                        onChange={(value) =>
                                            handleChange(
                                                "taxId",
                                                value
                                            )
                                        }
                                        getOptionKey={(item) =>
                                            item.id
                                        }
                                        getOptionLabel={(item) =>
                                            item.taxName ||
                                            item.name ||
                                            item.taxCode ||
                                            ""
                                        }
                                        placeholder="Select tax"
                                        required
                                        error={errors.taxId}
                                    />

                                </div>

                            </div>


                            {/* PRICE SUMMARY */}

                            <div
                                className="
                            mt-7
                            p-5
                            border
                            border-blue-100
                            rounded-lg
                            bg-blue-50/50
                            "
                            >

                                <p
                                    className="
                                text-sm
                                font-medium
                                text-blue-800
                                "
                                >
                                    Product Pricing
                                </p>

                                <div
                                    className="
                                grid
                                grid-cols-2
                                gap-6
                                mt-3
                                "
                                >

                                    <div>

                                        <p
                                            className="
                                        text-[11px]
                                        text-blue-600
                                        "
                                        >
                                            Purchasing Price
                                        </p>

                                        <p
                                            className="
                                        text-sm
                                        font-semibold
                                        text-blue-900
                                        mt-1
                                        "
                                        >
                                            ₹{" "}
                                            {Number(
                                                form.purchasingPrice ||
                                                0
                                            ).toFixed(2)}
                                        </p>

                                    </div>


                                    <div>

                                        <p
                                            className="
                                        text-[11px]
                                        text-blue-600
                                        "
                                        >
                                            Selling Price
                                        </p>

                                        <p
                                            className="
                                        text-sm
                                        font-semibold
                                        text-blue-900
                                        mt-1
                                        "
                                        >
                                            ₹{" "}
                                            {Number(
                                                form.sellingPrice ||
                                                0
                                            ).toFixed(2)}
                                        </p>

                                    </div>

                                </div>

                            </div>

                        </div>

                    )}


                    {/* =================================================
                    INVENTORY
                ================================================= */}

                    {activeTab === "inventory" && (

                        <div>

                            <div className="mb-6">

                                <h3
                                    className="
                                text-base
                                font-semibold
                                text-gray-800
                                "
                                >
                                    Inventory
                                </h3>

                                <p
                                    className="
                                text-xs
                                text-gray-500
                                mt-1
                                "
                                >
                                    Configure stock limits, sizes and
                                    units for this product.
                                </p>

                            </div>


                            {/* =================================================
                            STOCK LIMITS
                        ================================================= */}

                            <div
                                className="
                            grid
                            grid-cols-2
                            gap-x-6
                            gap-y-5
                            "
                            >

                                {/* MINIMUM STOCK */}

                                <div>

                                    <label className={labelClass}>
                                        Minimum Stock
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        value={
                                            form.minimumStock ??
                                            ""
                                        }
                                        onChange={(e) =>
                                            handleChange(
                                                "minimumStock",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter minimum stock"
                                        className={inputClass}
                                    />

                                    {errors.minimumStock && (

                                        <p
                                            className="
                                        text-xs
                                        text-red-500
                                        mt-1
                                        "
                                        >
                                            {errors.minimumStock}
                                        </p>

                                    )}

                                </div>


                                {/* MAXIMUM STOCK */}

                                <div>

                                    <label className={labelClass}>
                                        Maximum Stock
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        value={
                                            form.maximumStock ??
                                            ""
                                        }
                                        onChange={(e) =>
                                            handleChange(
                                                "maximumStock",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter maximum stock"
                                        className={inputClass}
                                    />

                                    {errors.maximumStock && (

                                        <p
                                            className="
                                        text-xs
                                        text-red-500
                                        mt-1
                                        "
                                        >
                                            {errors.maximumStock}
                                        </p>

                                    )}

                                </div>

                            </div>


                            {/* =================================================
                            SIZES
                        ================================================= */}

                            <div className="mt-7">

                                <label className={labelClass}>
                                    Sizes
                                </label>

                                <SearchMultiSelect
                                    selected={
                                        form.sizes || []
                                    }
                                    options={sizes || []}
                                    onAdd={handleAddSize}
                                    onRemove={handleRemoveSize}
                                    getOptionKey={(item) =>
                                        item.id
                                    }
                                    getOptionLabel={(item) =>
                                        item.sizeName ||
                                        item.name ||
                                        item.size ||
                                        ""
                                    }
                                    placeholder="Select sizes"
                                />

                                {Array.isArray(form.sizes) &&
                                    form.sizes.length > 0 && (

                                        <div
                                            className="
                                    flex
                                    flex-wrap
                                    gap-2
                                    mt-3
                                    "
                                        >

                                            {form.sizes.map(
                                                (sizeId, index) => {

                                                    const sizeItem =
                                                        (sizes || []).find(
                                                            (item) =>
                                                                String(
                                                                    item.id
                                                                ) ===
                                                                String(
                                                                    sizeId
                                                                )
                                                        );

                                                    return (

                                                        <div
                                                            key={`${sizeId}-${index}`}
                                                            className="
                                                    inline-flex
                                                    items-center
                                                    gap-2
                                                    px-3
                                                    py-1.5
                                                    rounded-full
                                                    bg-blue-50
                                                    border
                                                    border-blue-100
                                                    text-xs
                                                    text-blue-700
                                                    "
                                                        >

                                                            <span>
                                                                {sizeItem
                                                                    ? (
                                                                        sizeItem.sizeName ||
                                                                        sizeItem.name ||
                                                                        sizeItem.size
                                                                    )
                                                                    : sizeId}
                                                            </span>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleRemoveSize(
                                                                        sizeId
                                                                    )
                                                                }
                                                                className="
                                                        w-4
                                                        h-4
                                                        flex
                                                        items-center
                                                        justify-center
                                                        rounded-full
                                                        text-blue-400
                                                        hover:bg-blue-100
                                                        hover:text-blue-700
                                                        transition
                                                        "
                                                            >
                                                                ×
                                                            </button>

                                                        </div>

                                                    );

                                                }
                                            )}

                                        </div>

                                    )}

                            </div>


                            {/* =================================================
                            UNITS
                        ================================================= */}

                            <div className="mt-7">

                                <label className={labelClass}>
                                    Units
                                </label>

                                <SearchMultiSelect
                                    selected={
                                        form.units || []
                                    }
                                    options={units || []}
                                    onAdd={handleAddUnit}
                                    onRemove={handleRemoveUnit}
                                    getOptionKey={(item) =>
                                        item.id
                                    }
                                    getOptionLabel={(item) =>
                                        item.unitName ||
                                        item.name ||
                                        item.unit ||
                                        ""
                                    }
                                    placeholder="Select units"
                                />

                                {Array.isArray(form.units) &&
                                    form.units.length > 0 && (

                                        <div
                                            className="
                                    flex
                                    flex-wrap
                                    gap-2
                                    mt-3
                                    "
                                        >

                                            {form.units.map(
                                                (unitId, index) => {

                                                    const unitItem =
                                                        (units || []).find(
                                                            (item) =>
                                                                String(
                                                                    item.id
                                                                ) ===
                                                                String(
                                                                    unitId
                                                                )
                                                        );

                                                    return (

                                                        <div
                                                            key={`${unitId}-${index}`}
                                                            className="
                                                    inline-flex
                                                    items-center
                                                    gap-2
                                                    px-3
                                                    py-1.5
                                                    rounded-full
                                                    bg-blue-50
                                                    border
                                                    border-blue-100
                                                    text-xs
                                                    text-blue-700
                                                    "
                                                        >

                                                            <span>
                                                                {unitItem
                                                                    ? (
                                                                        unitItem.unitName ||
                                                                        unitItem.name ||
                                                                        unitItem.unit
                                                                    )
                                                                    : unitId}
                                                            </span>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleRemoveUnit(
                                                                        unitId
                                                                    )
                                                                }
                                                                className="
                                                        w-4
                                                        h-4
                                                        flex
                                                        items-center
                                                        justify-center
                                                        rounded-full
                                                        text-blue-400
                                                        hover:bg-blue-100
                                                        hover:text-blue-700
                                                        transition
                                                        "
                                                            >
                                                                ×
                                                            </button>

                                                        </div>

                                                    );

                                                }
                                            )}

                                        </div>

                                    )}

                            </div>


                            {/* =================================================
                            INVENTORY SUMMARY
                        ================================================= */}

                            <div
                                className="
                            mt-8
                            border
                            border-gray-200
                            rounded-lg
                            bg-white
                            p-5
                            "
                            >

                                <div
                                    className="
                                flex
                                items-center
                                justify-between
                                "
                                >

                                    <div>

                                        <p
                                            className="
                                        text-sm
                                        font-medium
                                        text-gray-800
                                        "
                                        >
                                            Inventory Configuration
                                        </p>

                                        <p
                                            className="
                                        text-xs
                                        text-gray-500
                                        mt-1
                                        "
                                        >
                                            Stock and product measurement
                                            settings.
                                        </p>

                                    </div>


                                    <div
                                        className="
                                    flex
                                    items-center
                                    gap-6
                                    text-xs
                                    text-gray-500
                                    "
                                    >

                                        <div className="text-right">

                                            <p>
                                                Sizes
                                            </p>

                                            <p
                                                className="
                                            mt-1
                                            font-semibold
                                            text-gray-700
                                            "
                                            >
                                                {Array.isArray(
                                                    form.sizes
                                                )
                                                    ? form.sizes.length
                                                    : 0}
                                            </p>

                                        </div>


                                        <div className="text-right">

                                            <p>
                                                Units
                                            </p>

                                            <p
                                                className="
                                            mt-1
                                            font-semibold
                                            text-gray-700
                                            "
                                            >
                                                {Array.isArray(
                                                    form.units
                                                )
                                                    ? form.units.length
                                                    : 0}
                                            </p>

                                        </div>


                                        <div className="text-right">

                                            <p>
                                                Stock Range
                                            </p>

                                            <p
                                                className="
                                            mt-1
                                            font-semibold
                                            text-gray-700
                                            "
                                            >
                                                {form.minimumStock ||
                                                    0}
                                                {" - "}
                                                {form.maximumStock ||
                                                    0}
                                            </p>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>

                    )}

                    {/* =================================================
    SETTINGS
================================================= */}

                    {activeTab === "settings" && (

                        <div>

                            <div className="mb-6">

                                <h3
                                    className="
                    text-base
                    font-semibold
                    text-gray-800
                "
                                >
                                    Product Settings
                                </h3>

                                <p
                                    className="
                    text-xs
                    text-gray-500
                    mt-1
                "
                                >
                                    Configure the product availability and status.
                                </p>

                            </div>


                            {/* STATUS */}

                            <div className="max-w-[460px]">

                                <label className={labelClass}>
                                    Status
                                </label>

                                <select
                                    value={form.status ?? "ACTIVE"}
                                    onChange={(e) =>
                                        handleChange(
                                            "status",
                                            e.target.value
                                        )
                                    }
                                    className={inputClass}
                                >

                                    <option value="ACTIVE">
                                        ACTIVE
                                    </option>

                                    <option value="INACTIVE">
                                        INACTIVE
                                    </option>

                                    <option value="DRAFT">
                                        DRAFT
                                    </option>

                                </select>

                            </div>


                            {/* PRODUCT STATE */}

                            <div
                                className="
                mt-7
                border
                border-gray-200
                rounded-lg
                bg-white
                p-5
            "
                            >

                                <div
                                    className="
                    flex
                    items-center
                    justify-between
                "
                                >

                                    <div>

                                        <p
                                            className="
                            text-sm
                            font-medium
                            text-gray-800
                        "
                                        >
                                            Product Status
                                        </p>

                                        <p
                                            className="
                            text-xs
                            text-gray-500
                            mt-1
                        "
                                        >
                                            This product is currently set to{" "}

                                            <span
                                                className="
                                font-medium
                                text-gray-700
                            "
                                            >
                                                {form.status || "ACTIVE"}
                                            </span>

                                        </p>

                                    </div>


                                    <span
                                        className={`
                        px-3
                        py-1
                        rounded-full
                        text-xs
                        font-medium

                        ${form.status === "ACTIVE"
                                                ? "bg-green-50 text-green-700"
                                                : form.status === "INACTIVE"
                                                    ? "bg-red-50 text-red-700"
                                                    : "bg-yellow-50 text-yellow-700"
                                            }
                    `}
                                    >
                                        {form.status || "ACTIVE"}
                                    </span>

                                </div>

                            </div>

                        </div>

                    )}

                </div>


                {/* =================================================
                FOOTER
            ================================================= */}

                <div
                    className="
                shrink-0
                h-[68px]
                flex
                items-center
                justify-between
                px-6
                border-t
                border-gray-200
                bg-white
                "
                >

                    <div
                        className="
                    text-xs
                    text-gray-500
                    "
                    >

                        <span className="text-red-500">
                            *
                        </span>

                        {" "}Required fields

                    </div>


                    <div
                        className="
                    flex
                    items-center
                    gap-3
                    "
                    >

                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className="
                        h-10
                        px-5
                        rounded-md
                        border
                        border-gray-300
                        text-sm
                        font-medium
                        text-gray-700
                        bg-white
                        hover:bg-gray-50
                        transition
                        disabled:opacity-50
                        disabled:cursor-not-allowed
                        "
                        >
                            Cancel
                        </button>


                        <button
                            type="submit"
                            disabled={loading}
                            className="
        h-10
        px-6
        rounded-md
        bg-blue-600
        text-white
        text-sm
        font-medium
        hover:bg-blue-700
        transition
        disabled:opacity-50
        disabled:cursor-not-allowed
    "
                        >
                            {loading
                                ? isEdit
                                    ? "Updating..."
                                    : "Saving..."
                                : isEdit
                                    ? "Update Product"
                                    : "Save Product"}
                        </button>

                    </div>

                </div>

            </form>

        </div>
    );
}