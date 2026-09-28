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
    label,
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

    const selectedOption = useMemo(() => {
        if (
            value === "" ||
            value === null ||
            value === undefined
        ) {
            return null;
        }

        return options.find(
            (item) =>
                String(
                    getOptionKey(item)
                ) === String(value)
        );
    }, [
        options,
        value,
        getOptionKey,
    ]);

    const filteredOptions = useMemo(() => {
        const keyword =
            search.trim().toLowerCase();

        if (!keyword) {
            return options;
        }

        return options.filter((item) =>
            String(
                getOptionLabel(item)
            )
                .toLowerCase()
                .includes(keyword)
        );
    }, [
        options,
        search,
        getOptionLabel,
    ]);

    return (
        <div
            ref={wrapperRef}
            className="relative"
        >
            <label
                className="
                    block
                    text-sm
                    font-medium
                    text-gray-700
                    mb-2
                "
            >
                {label}

                {required && (
                    <span className="text-red-500 ml-1">
                        *
                    </span>
                )}
            </label>

            <button
                type="button"
                disabled={disabled}
                onClick={() => {
                    if (!disabled) {
                        setOpen(
                            (prev) => !prev
                        );
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
                        ? getOptionLabel(
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
                                placeholder={`Search ${label.toLowerCase()}...`}
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
                                No {label.toLowerCase()} found
                            </div>
                        ) : (
                            filteredOptions.map(
                                (item) => {
                                    const key =
                                        getOptionKey(
                                            item
                                        );

                                    const selected =
                                        String(key) ===
                                        String(value);

                                    return (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => {
                                                onChange(
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
                                                {getOptionLabel(
                                                    item
                                                )}
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

function SearchMultiSelect({
    label,
    selected = EMPTY_ARRAY,
    options = EMPTY_ARRAY,
    onAdd,
    onRemove,
    getOptionKey,
    getOptionLabel,
    placeholder = "Search...",
    required = false,
    error = "",
}) {
    const wrapperRef = useRef(null);

    const [open, setOpen] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target)
            ) {
                setOpen(false);
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

    const isSelected = (item) => {
        const key =
            getOptionKey(item);

        return selected.some(
            (selectedItem) =>
                String(
                    getOptionKey(
                        selectedItem
                    )
                ) === String(key)
        );
    };

    const handleSelect = (item) => {
        if (isSelected(item)) {
            return;
        }

        onAdd(item);

        setOpen(false);
    };

    const handleToggle = () => {
        setOpen(
            (prev) => !prev
        );
    };

    return (
        <div
            ref={wrapperRef}
            className="relative"
        >
            <label
                className="
                    block
                    text-sm
                    font-medium
                    text-gray-700
                    mb-2
                "
            >
                {label}

                {required && (
                    <span className="text-red-500 ml-1">
                        *
                    </span>
                )}
            </label>

            <button
                type="button"
                onClick={handleToggle}
                className={`
                    w-full
                    min-h-11
                    px-3
                    py-2
                    border
                    rounded-md
                    bg-white
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
                            : "border-gray-300 hover:border-gray-400"
                    }
                `}
            >
                <div
                    className="
                        flex
                        items-center
                        gap-2
                        min-w-0
                    "
                >
                    <Search
                        size={15}
                        className="
                            text-gray-400
                            shrink-0
                        "
                    />

                    <span
                        className="
                            text-sm
                            text-gray-400
                            truncate
                        "
                    >
                        {placeholder}
                    </span>

                    {selected.length > 0 && (
                        <span
                            className="
                                shrink-0
                                px-2
                                py-0.5
                                rounded-full
                                bg-blue-50
                                text-blue-700
                                text-xs
                                font-medium
                            "
                        >
                            {selected.length} selected
                        </span>
                    )}
                </div>

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

            {open && (
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
                    <div
                        className="
                            max-h-52
                            overflow-y-auto
                        "
                    >
                        {options.length === 0 ? (
                            <div
                                className="
                                    px-4
                                    py-6
                                    text-center
                                    text-sm
                                    text-gray-400
                                "
                            >
                                No{" "}
                                {label.toLowerCase()}{" "}
                                found
                            </div>
                        ) : (
                            options.map(
                                (item) => {
                                    const selectedItem =
                                        isSelected(
                                            item
                                        );

                                    return (
                                        <button
                                            key={getOptionKey(
                                                item
                                            )}
                                            type="button"
                                            onClick={() =>
                                                handleSelect(
                                                    item
                                                )
                                            }
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
                                                ${selectedItem
                                                    ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                                                    : "text-gray-700 hover:bg-gray-50"
                                                }
                                            `}
                                        >
                                            <span className="truncate">
                                                {getOptionLabel(
                                                    item
                                                )}
                                            </span>

                                            {selectedItem && (
                                                <Check
                                                    size={16}
                                                    className="
                                                        text-blue-600
                                                        shrink-0
                                                    "
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

            {selected.length > 0 && (
                <div
                    className="
                        flex
                        flex-wrap
                        gap-2
                        mt-2
                    "
                >
                    {selected.map(
                        (item) => (
                            <span
                                key={getOptionKey(
                                    item
                                )}
                                className="
                                    inline-flex
                                    items-center
                                    gap-1.5
                                    px-2.5
                                    py-1
                                    bg-blue-50
                                    border
                                    border-blue-100
                                    text-blue-700
                                    rounded-md
                                    text-xs
                                    font-medium
                                "
                            >
                                <span>
                                    {getOptionLabel(
                                        item
                                    )}
                                </span>

                                <button
                                    type="button"
                                    onClick={(
                                        event
                                    ) => {
                                        event.stopPropagation();

                                        onRemove(
                                            item
                                        );
                                    }}
                                    className="
                                        p-0.5
                                        rounded-full
                                        hover:bg-blue-100
                                    "
                                >
                                    <X size={12} />
                                </button>
                            </span>
                        )
                    )}
                </div>
            )}

            {error && (
                <p className="mt-1 text-xs text-red-500">
                    {error}
                </p>
            )}
        </div>
    );
}


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

    const {
        loading,
    } = useSelector(
        (state) =>
            state.product
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

            if (
                !Array.isArray(
                    form.sizes
                ) ||
                form.sizes.length === 0
            ) {
                nextErrors.sizes =
                    "At least one size is required";
            }


            /* =================================================
               UNIT VALIDATION
               ================================================= */

            if (
                !Array.isArray(
                    form.units
                ) ||
                form.units.length === 0
            ) {
                nextErrors.units =
                    "At least one unit is required";
            }


            setErrors(
                nextErrors
            );


            return (
                Object.keys(
                    nextErrors
                ).length === 0
            );
        };


    /* =======================================================
       SAVE
       ======================================================= */

    const handleSave =
        async (event) => {

            event.preventDefault();


            if (!validate()) {
                return;
            }


            /* =================================================
               FINAL SIZE IDS
               ================================================= */

            const sizeIds =
                form.sizes
                    .map(
                        (size) =>
                            getSizeKey(
                                size
                            )
                    )
                    .filter(
                        (id) =>
                            id !==
                            undefined &&
                            id !== null &&
                            id !== ""
                    )
                    .map(
                        (id) =>
                            Number(id)
                    );


            /* =================================================
               FINAL UNIT IDS
               ================================================= */

            const unitIds =
                form.units
                    .map(
                        (unit) =>
                            getUnitKey(
                                unit
                            )
                    )
                    .filter(
                        (id) =>
                            id !==
                            undefined &&
                            id !== null &&
                            id !== ""
                    )
                    .map(
                        (id) =>
                            Number(id)
                    );


            const payload = {

                productName:
                    form.productName
                        ?.trim() ||
                    "",

                subCategoryId:
                    Number(
                        form.subCategoryId
                    ),

                brand:
                    form.brand
                        ?.trim() ||
                    "",

                hsnCode:
                    form.hsnCode
                        ?.trim() ||
                    "",

                sellingPrice:
                    Number(
                        form.sellingPrice
                    ),

                purchasingPrice:
                    Number(
                        form.purchasingPrice
                    ),

                taxId:
                    Number(
                        form.taxId
                    ),

                minimumStock:
                    Number(
                        form.minimumStock ||
                        0
                    ),

                maximumStock:
                    Number(
                        form.maximumStock ||
                        0
                    ),


                /* =============================================
                   IMPORTANT
                   Send ALL selected IDs
                   ============================================= */

                sizeIds:
                    sizeIds,

                unitIds:
                    unitIds,


                status:
                    form.status ||
                    "ACTIVE",

                image:
                    form.image ||
                    null,
            };


            console.log(
                "PRODUCT SAVE PAYLOAD:",
                payload
            );


            try {

                if (isEdit) {

                    const productId =
                        form.id ??
                        modal?.data?.id;


                    if (!productId) {

                        toast.error(
                            "Product ID is missing"
                        );

                        return;
                    }


                    await dispatch(
                        updateProduct({
                            id:
                                productId,

                            data:
                                payload,
                        })
                    ).unwrap();


                    toast.success(
                        "Product updated successfully"
                    );

                } else {

                    await dispatch(
                        createProduct(
                            payload
                        )
                    ).unwrap();


                    toast.success(
                        "Product created successfully"
                    );
                }


                dispatch(
                    closeModal()
                );

                dispatch(
                    resetProductForm()
                );

            } catch (error) {

                console.error(
                    "Product save error:",
                    error
                );

                toast.error(
                    typeof error ===
                        "string"
                        ? error
                        : error?.message ||
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

    return (

        <div
            className="
                w-[950px]
                h-[650px]
                max-w-[65vw]
                bg-white
                rounded-lg
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
                    flex
                    items-center
                    justify-between
                    px-6
                    py-4
                    border-b
                    border-gray-200
                    bg-blue-700
                "
            >

                <div>

                    <h2
                        className="
                            text-[24px]
                            font-semibold
                            text-gray-100
                        "
                    >
                        {isEdit
                            ? "Edit Product"
                            : "Add New Product"}
                    </h2>

                    <p
                        className="
                            text-sm
                            text-gray-100
                            mt-1
                        "
                    >
                        {isEdit
                            ? "Update product details"
                            : "Create a new product"}
                    </p>

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
                        px-6
                        py-6
                    "
                >

                    {/* =================================================
                        IMAGE + CATEGORY / SUBCATEGORY
                    ================================================= */}

                    <div className="grid grid-cols-[280px_1fr] gap-6 mb-5">

                        {/* ================= IMAGE ================= */}

                        <div>

                            <label
                                className="
                                    block
                                    text-sm
                                    font-medium
                                    text-gray-700
                                    mb-2
                                "
                            >
                                Product Image
                            </label>

                            <label
                                className="
                                    w-[280px]
                                    h-[150px]
                                    border-2
                                    border-dashed
                                    border-gray-300
                                    rounded-md
                                    flex
                                    items-center
                                    justify-center
                                    overflow-hidden
                                    cursor-pointer
                                    hover:border-blue-500
                                    transition
                                "
                            >
                                {imagePreview ? (
                                    <img
                                        src={
                                            imagePreview
                                        }
                                        alt="Product"
                                        className="
                                            w-full
                                            h-full
                                            object-cover
                                        "
                                    />
                                ) : (
                                    <div className="text-center text-gray-400">

                                        <p className="text-sm">
                                            Choose image
                                        </p>

                                        <p className="text-xs mt-1">
                                            JPG / PNG
                                        </p>

                                    </div>
                                )}

                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={
                                        handleImageChange
                                    }
                                />

                            </label>

                            {form.image && (
                                <div
                                    className="
                                        text-xs
                                        text-gray-500
                                        mt-2
                                        truncate
                                        w-[150px]
                                    "
                                    title={
                                        form.image.name
                                    }
                                >
                                    {
                                        form.image.name
                                    }
                                </div>
                            )}

                        </div>


                        {/* ================= CATEGORY / SUBCATEGORY ================= */}

                        <div className="flex flex-col gap-5">

                            <SearchSelect
                                label="Category"
                                value={
                                    form.categoryId
                                }
                                options={
                                    categories
                                }
                                onChange={
                                    handleCategoryChange
                                }
                                getOptionKey={
                                    getCategoryKey
                                }
                                getOptionLabel={
                                    getCategoryLabel
                                }
                                placeholder="Choose category"
                                required
                                error={
                                    errors.categoryId
                                }
                            />

                            <SearchSelect
                                label="Subcategory"
                                value={
                                    form.subCategoryId
                                }
                                options={
                                    filteredSubCategories
                                }
                                onChange={(
                                    value
                                ) =>
                                    handleChange(
                                        "subCategoryId",
                                        value
                                    )
                                }
                                getOptionKey={
                                    getSubCategoryKey
                                }
                                getOptionLabel={
                                    getSubCategoryLabel
                                }
                                placeholder={
                                    form.categoryId
                                        ? "Choose subcategory"
                                        : "Choose category first"
                                }
                                required
                                disabled={
                                    !form.categoryId
                                }
                                error={
                                    errors.subCategoryId
                                }
                            />

                        </div>

                    </div>


                    {/* =================================================
                        PRODUCT NAME / BRAND / HSN
                    ================================================= */}

                    <div
                        className="
                            grid
                            grid-cols-3
                            gap-5
                            mb-5
                        "
                    >

                        <div>

                            <label
                                className="
                                    block
                                    text-sm
                                    font-medium
                                    text-gray-700
                                    mb-2
                                "
                            >
                                Product Name

                                <span className="text-red-500 ml-1">
                                    *
                                </span>

                            </label>

                            <input
                                type="text"
                                value={
                                    form.productName
                                }
                                onChange={(e) =>
                                    handleChange(
                                        "productName",
                                        e.target.value
                                    )
                                }
                                placeholder="Enter product name"
                                className={`
                                    w-full
                                    h-11
                                    px-3
                                    border
                                    rounded-md
                                    text-sm
                                    outline-none
                                    focus:border-blue-500
                                    focus:ring-1
                                    focus:ring-blue-500
                                    ${errors.productName
                                        ? "border-red-400"
                                        : "border-gray-300"
                                    }
                                `}
                            />

                            {errors.productName && (
                                <p className="mt-1 text-xs text-red-500">
                                    {
                                        errors.productName
                                    }
                                </p>
                            )}

                        </div>


                        <div>

                            <label
                                className="
                                    block
                                    text-sm
                                    font-medium
                                    text-gray-700
                                    mb-2
                                "
                            >
                                Brand
                            </label>

                            <input
                                type="text"
                                value={
                                    form.brand
                                }
                                onChange={(e) =>
                                    handleChange(
                                        "brand",
                                        e.target.value
                                    )
                                }
                                placeholder="Enter brand"
                                className="
                                    w-full
                                    h-11
                                    px-3
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


                        <div>

                            <label
                                className="
                                    block
                                    text-sm
                                    font-medium
                                    text-gray-700
                                    mb-2
                                "
                            >
                                HSN Code
                            </label>

                            <input
                                type="text"
                                value={
                                    form.hsnCode
                                }
                                onChange={(e) =>
                                    handleChange(
                                        "hsnCode",
                                        e.target.value
                                    )
                                }
                                placeholder="Enter HSN code"
                                className="
                                    w-full
                                    h-11
                                    px-3
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


                    {/* =================================================
                        PRICES / TAX
                    ================================================= */}

                    <div
                        className="
                            grid
                            grid-cols-3
                            gap-5
                            mb-5
                        "
                    >

                        <div>

                            <label
                                className="
                                    block
                                    text-sm
                                    font-medium
                                    text-gray-700
                                    mb-2
                                "
                            >
                                Purchasing Price

                                <span className="text-red-500 ml-1">
                                    *
                                </span>

                            </label>

                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={
                                    form.purchasingPrice
                                }
                                onChange={(e) =>
                                    handleChange(
                                        "purchasingPrice",
                                        e.target.value
                                    )
                                }
                                placeholder="0.00"
                                className={`
                                    w-full
                                    h-11
                                    px-3
                                    border
                                    rounded-md
                                    text-sm
                                    outline-none
                                    focus:border-blue-500
                                    focus:ring-1
                                    focus:ring-blue-500
                                    ${errors.purchasingPrice
                                        ? "border-red-400"
                                        : "border-gray-300"
                                    }
                                `}
                            />

                            {errors.purchasingPrice && (
                                <p className="mt-1 text-xs text-red-500">
                                    {
                                        errors.purchasingPrice
                                    }
                                </p>
                            )}

                        </div>


                        <div>

                            <label
                                className="
                                    block
                                    text-sm
                                    font-medium
                                    text-gray-700
                                    mb-2
                                "
                            >
                                Selling Price

                                <span className="text-red-500 ml-1">
                                    *
                                </span>

                            </label>

                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={
                                    form.sellingPrice
                                }
                                onChange={(e) =>
                                    handleChange(
                                        "sellingPrice",
                                        e.target.value
                                    )
                                }
                                placeholder="0.00"
                                className={`
                                    w-full
                                    h-11
                                    px-3
                                    border
                                    rounded-md
                                    text-sm
                                    outline-none
                                    focus:border-blue-500
                                    focus:ring-1
                                    focus:ring-blue-500
                                    ${errors.sellingPrice
                                        ? "border-red-400"
                                        : "border-gray-300"
                                    }
                                `}
                            />

                            {errors.sellingPrice && (
                                <p className="mt-1 text-xs text-red-500">
                                    {
                                        errors.sellingPrice
                                    }
                                </p>
                            )}

                        </div>


                        <div>

                            <SearchSelect
                                label="Tax"
                                value={
                                    form.taxId
                                }
                                options={
                                    taxes
                                }
                                onChange={(
                                    value
                                ) =>
                                    handleChange(
                                        "taxId",
                                        value
                                    )
                                }
                                getOptionKey={(
                                    tax
                                ) =>
                                    tax.id
                                }
                                getOptionLabel={(
                                    tax
                                ) =>
                                    `${tax.taxName} (${tax.taxRate}%)`
                                }
                                placeholder="Choose tax"
                                required
                                error={
                                    errors.taxId
                                }
                            />

                        </div>

                    </div>


                    {/* =================================================
                        STOCK / STATUS
                    ================================================= */}

                    <div
                        className="
                            grid
                            grid-cols-3
                            gap-5
                            mb-5
                        "
                    >

                        <div>

                            <label
                                className="
                                    block
                                    text-sm
                                    font-medium
                                    text-gray-700
                                    mb-2
                                "
                            >
                                Minimum Stock
                            </label>

                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={
                                    form.minimumStock
                                }
                                onChange={(e) =>
                                    handleChange(
                                        "minimumStock",
                                        e.target.value
                                    )
                                }
                                placeholder="0"
                                className={`
                                    w-full
                                    h-11
                                    px-3
                                    border
                                    rounded-md
                                    text-sm
                                    outline-none
                                    focus:border-blue-500
                                    focus:ring-1
                                    focus:ring-blue-500
                                    ${errors.minimumStock
                                        ? "border-red-400"
                                        : "border-gray-300"
                                    }
                                `}
                            />

                            {errors.minimumStock && (
                                <p className="mt-1 text-xs text-red-500">
                                    {
                                        errors.minimumStock
                                    }
                                </p>
                            )}

                        </div>


                        <div>

                            <label
                                className="
                                    block
                                    text-sm
                                    font-medium
                                    text-gray-700
                                    mb-2
                                "
                            >
                                Maximum Stock
                            </label>

                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={
                                    form.maximumStock
                                }
                                onChange={(e) =>
                                    handleChange(
                                        "maximumStock",
                                        e.target.value
                                    )
                                }
                                placeholder="0"
                                className={`
                                    w-full
                                    h-11
                                    px-3
                                    border
                                    rounded-md
                                    text-sm
                                    outline-none
                                    focus:border-blue-500
                                    focus:ring-1
                                    focus:ring-blue-500
                                    ${errors.maximumStock
                                        ? "border-red-400"
                                        : "border-gray-300"
                                    }
                                `}
                            />

                            {errors.maximumStock && (
                                <p className="mt-1 text-xs text-red-500">
                                    {
                                        errors.maximumStock
                                    }
                                </p>
                            )}

                        </div>


                        <div>

                            <label
                                className="
                                    block
                                    text-sm
                                    font-medium
                                    text-gray-700
                                    mb-2
                                "
                            >
                                Status
                            </label>

                            <select
                                value={
                                    form.status
                                }
                                onChange={(e) =>
                                    handleChange(
                                        "status",
                                        e.target.value
                                    )
                                }
                                className="
                                    w-full
                                    h-11
                                    px-3
                                    border
                                    border-gray-300
                                    rounded-md
                                    text-sm
                                    bg-white
                                    outline-none
                                    focus:border-blue-500
                                    focus:ring-1
                                    focus:ring-blue-500
                                "
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

                    </div>


                    {/* =================================================
                        SIZE / UNIT
                    ================================================= */}

                    <div
                        className="
                            grid
                            grid-cols-1
                            gap-5
                            mb-5
                        "
                    >

                        <SearchMultiSelect
                            label="Sizes"
                            selected={
                                form.sizes
                            }
                            options={
                                sizes
                            }
                            onAdd={
                                handleAddSize
                            }
                            onRemove={
                                handleRemoveSize
                            }
                            getOptionKey={
                                getSizeKey
                            }
                            getOptionLabel={
                                getSizeLabel
                            }
                            placeholder="Search and select sizes"
                            required
                            error={
                                errors.sizes
                            }
                        />


                        <SearchMultiSelect
                            label="Units"
                            selected={
                                form.units
                            }
                            options={
                                units
                            }
                            onAdd={
                                handleAddUnit
                            }
                            onRemove={
                                handleRemoveUnit
                            }
                            getOptionKey={
                                getUnitKey
                            }
                            getOptionLabel={
                                getUnitLabel
                            }
                            placeholder="Search and select units"
                            required
                            error={
                                errors.units
                            }
                        />

                    </div>

                </div>


                {/* =================================================
                    FOOTER
                ================================================= */}

                <div
                    className="
                        shrink-0
                        flex
                        items-center
                        justify-end
                        gap-3
                        px-6
                        py-4
                        border-t
                        border-gray-200
                        bg-white
                    "
                >

                    <button
                        type="button"
                        onClick={
                            handleClose
                        }
                        disabled={
                            loading
                        }
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
                        disabled={
                            loading
                        }
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
                                ? "Update"
                                : "Save"}
                    </button>

                </div>

            </form>

        </div>
    );
}