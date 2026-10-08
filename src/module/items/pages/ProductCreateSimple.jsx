import React, {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import {
    useDispatch,
    useSelector,
} from "react-redux";

import {
    ChevronDown,
    Check,
    Search,
    X,
    Package,
    Image as ImageIcon,
    UserRoundArrowLeft,
} from "lucide-react";

import toast from "react-hot-toast";

import {
    openModal,
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

import {
    getUserPermission,
} from "../../menuPermission/thunks/menuPermissionThunks";


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
    addLabel = "",
    onAdd = null,
}) {

    const wrapperRef = useRef(null);

    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");


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


    /* =====================================================
       CLICK OUTSIDE
    ===================================================== */

    useEffect(() => {

        const handleClickOutside = (event) => {

            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(
                    event.target
                )
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


    /* =====================================================
       SELECTED
    ===================================================== */

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
    ]);


    /* =====================================================
       FILTER
    ===================================================== */

    const filteredOptions = useMemo(() => {

        if (!Array.isArray(options)) {
            return [];
        }


        const keyword =
            String(search ?? "")
                .trim()
                .toLowerCase();


        if (!keyword) {
            return options;
        }


        return options.filter((item) => {

            return getSafeOptionLabel(item)
                .toLowerCase()
                .includes(keyword);

        });

    }, [
        options,
        search,
    ]);


    return (

        <div
            ref={wrapperRef}
            className="relative"
        >

            {/* LABEL */}
            {required && (
                <label
                    className="
                    block
                    text-sm
                    font-medium
                    text-red-500
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
            )}

            {/* SELECT */}

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

                    <div
                        className="
                            p-2
                            border-b
                            border-gray-100
                        "
                    >

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
                                    safeLabel
                                        ? `Search ${safeLabel.toLowerCase()}...`
                                        : "Search..."
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

                            <>

                                <div
                                    className="
                                        px-4
                                        py-4
                                        text-center
                                        text-sm
                                        text-gray-400
                                    "
                                >
                                    No {safeLabel.toLowerCase()} found
                                </div>


                                {onAdd &&
                                    search.trim() && (

                                        <button
                                            type="button"
                                            onClick={() => {

                                                onAdd(
                                                    search.trim()
                                                );

                                                setOpen(false);
                                                setSearch("");

                                            }}
                                            className="
                                                w-full
                                                px-4
                                                py-2.5
                                                border-t
                                                border-gray-100
                                                flex
                                                items-center
                                                gap-2
                                                text-left
                                                text-sm
                                                text-blue-600
                                                hover:bg-blue-50
                                            "
                                        >

                                            <span className="text-lg">
                                                +
                                            </span>

                                            <span className="font-medium">
                                                {addLabel || "New"}
                                            </span>

                                        </button>

                                    )}

                            </>

                        ) : (

                            filteredOptions.map(
                                (item, index) => {

                                    const key =
                                        getSafeOptionKey(
                                            item
                                        );

                                    const label =
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

                                                setOpen(false);
                                                setSearch("");

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

                                                ${selected
                                                    ? "bg-blue-50 text-blue-700"
                                                    : "text-gray-700 hover:bg-gray-50"
                                                }
                                            `}
                                        >

                                            <span className="truncate">
                                                {label ||
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

function SearchMultiSelect({
    selected = [],
    options = [],
    onAdd,
    onRemove,
    getOptionKey = (item) =>
        item?.id,
    getOptionLabel = (item) =>
        item?.name ?? "",
    placeholder = "Select",
    error,
    addLabel = "",
    onCreate = null,
}) {

    const [search, setSearch] =
        useState("");

    const [open, setOpen] =
        useState(false);

    const wrapperRef =
        useRef(null);


    /* =====================================================
       CLICK OUTSIDE
    ===================================================== */

    useEffect(() => {

        const handleClickOutside =
            (event) => {

                if (
                    wrapperRef.current &&
                    !wrapperRef.current.contains(
                        event.target
                    )
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


    const safeSelected =
        Array.isArray(selected)
            ? selected
            : [];


    const safeOptions =
        Array.isArray(options)
            ? options
            : [];


    /* =====================================================
       FILTER
    ===================================================== */

    const filteredOptions =
        safeOptions.filter(
            (option) => {

                const label =
                    String(
                        getOptionLabel(
                            option
                        ) ?? ""
                    );

                const searchValue =
                    String(search ?? "");


                return label
                    .toLowerCase()
                    .includes(
                        searchValue.toLowerCase()
                    );

            }
        );


    /* =====================================================
       SELECTED CHECK
    ===================================================== */

    const isSelected =
        (option) => {

            const optionKey =
                getOptionKey(option);


            return safeSelected.some(
                (selectedItem) =>
                    String(
                        selectedItem
                    ) ===
                    String(
                        optionKey
                    )
            );

        };


    /* =====================================================
       SELECT
    ===================================================== */

    const handleSelect =
        (option) => {

            const key =
                getOptionKey(option);


            if (key == null) {
                return;
            }


            if (!isSelected(option)) {

                onAdd?.(key);

            }


            setSearch("");
            setOpen(true);

        };


    return (

        <div
            ref={wrapperRef}
            className="relative"
        >

            {/* SELECTED AREA */}

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
                onClick={() =>
                    setOpen(true)
                }
            >

                {/* CHIPS */}

                {safeSelected.map(
                    (
                        selectedId,
                        index
                    ) => {

                        const selectedItem =
                            safeOptions.find(
                                (item) =>
                                    String(
                                        getOptionKey(
                                            item
                                        )
                                    ) ===
                                    String(
                                        selectedId
                                    )
                            );


                        const label =
                            selectedItem
                                ? String(
                                    getOptionLabel(
                                        selectedItem
                                    ) ?? ""
                                )
                                : String(
                                    selectedId ??
                                    ""
                                );


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

                                <span>
                                    {label}
                                </span>


                                <button
                                    type="button"
                                    onClick={(e) => {

                                        e.stopPropagation();

                                        onRemove?.(
                                            selectedId
                                        );

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

                    }
                )}


                {/* SEARCH */}

                <input
                    type="text"
                    value={search}
                    onChange={(e) => {

                        setSearch(
                            e.target.value
                        );

                        setOpen(true);

                    }}
                    onFocus={() =>
                        setOpen(true)
                    }
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


            {/* ERROR */}

            {error && (

                <p className="text-xs text-red-500 mt-1">
                    {error}
                </p>

            )}


            {/* DROPDOWN */}

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

                        {filteredOptions.length >
                            0 ? (

                            filteredOptions.map(
                                (option) => {

                                    const key =
                                        getOptionKey(
                                            option
                                        );

                                    const label =
                                        String(
                                            getOptionLabel(
                                                option
                                            ) ?? ""
                                        );


                                    const selectedOption =
                                        isSelected(
                                            option
                                        );


                                    return (

                                        <button
                                            key={key}
                                            type="button"
                                            disabled={
                                                selectedOption
                                            }
                                            onClick={() =>
                                                handleSelect(
                                                    option
                                                )
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

                                                ${selectedOption
                                                    ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                                                    : "text-gray-700 hover:bg-blue-50"
                                                }
                                            `}
                                        >

                                            <span>
                                                {label}
                                            </span>


                                            {selectedOption && (

                                                <span className="text-xs text-blue-500">
                                                    Selected
                                                </span>

                                            )}

                                        </button>

                                    );

                                }
                            )

                        ) : (

                            <div className="px-3 py-3">

                                <div className="
                                    text-sm
                                    text-gray-400
                                    text-center
                                    mb-2
                                ">
                                    No options found
                                </div>


                                {onCreate &&
                                    search.trim() && (

                                        <button
                                            type="button"
                                            onClick={() => {

                                                onCreate(
                                                    search.trim()
                                                );

                                                setOpen(false);
                                                setSearch("");

                                            }}
                                            className="
                                                w-full
                                                px-3
                                                py-2.5
                                                rounded-md
                                                flex
                                                items-center
                                                gap-2
                                                text-left
                                                text-sm
                                                text-blue-600
                                                hover:bg-blue-50
                                            "
                                        >

                                            <span className="text-lg">
                                                +
                                            </span>

                                            <span className="font-medium">
                                                {addLabel ||
                                                    "New"}
                                            </span>

                                        </button>

                                    )}

                            </div>

                        )}

                    </div>

                </div>

            )}

        </div>

    );
}


/* =========================================================
   PRODUCT FORM DEFAULT
========================================================= */

const getEmptyForm = () => ({
    id: null,

    categoryId: "",

    subCategoryId: "",

    productName: "",

    brand: "",

    hsnCode: "",

    description: "",

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


/* =========================================================
   PRODUCT CREATE / EDIT
========================================================= */

export default function ProductCreateSimple() {

    const dispatch =
        useDispatch();

    const navigate =
        useNavigate();


    /* =====================================================
       PRODUCT STATE
    ===================================================== */

    const loading =
        useSelector(
            (state) =>
                state.product?.loading
        );


    const existingProduct =
        useSelector(
            (state) =>
                state.product
                    ?.exsistingProduct
        );


    /* =====================================================
       MASTER DATA
    ===================================================== */

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


    const user = useSelector(
        (state) => state.auth?.user
    );

    /* =====================================================
      Auth
   ===================================================== */

    const isAuthenticated = useSelector(
        (state) =>
            state.auth?.isAuthenticated === true
    );

    const authChecking = useSelector(
        (state) =>
            state.auth?.authChecking === true
    );


    /* =====================================================
      PermissionState
   ===================================================== */

    const permissions = useSelector(
        (state) =>
            Array.isArray(
                state.menuPermission?.userPermissions
            )
                ? state.menuPermission.userPermissions
                : []
    );

    const permissionLoading = useSelector(
        (state) =>
            state.menuPermission
                ?.userPermissionsLoading === true
    );

    const permissionsLoaded = useSelector(
        (state) =>
            state.menuPermission
                ?.userPermissionsLoaded === true
    );

    const normalizeModule = (value) =>
        String(value ?? "")
            .trim()
            .toLowerCase();

    const normalizeAction = (value) =>
        String(value ?? "")
            .trim()
            .toUpperCase();

    const roleName =
        user?.roleName ||
        user?.role?.roleName ||
        user?.role?.name ||
        user?.role ||
        user?.authority ||
        "";

    const normalizedRole =
        normalizeAction(roleName);

    const isSuperAdmin =
        normalizedRole === "SUPER_ADMIN";

    const isAdmin =
        normalizedRole === "ADMIN";

    const hasFullAccess =
        isSuperAdmin ||
        isAdmin;


    const hasPermission = (
        moduleName,
        actionName
    ) => {

        if (hasFullAccess) {
            return true;
        }

        if (!Array.isArray(permissions)) {
            return false;
        }

        const requestedModule =
            normalizeModule(moduleName);

        const requestedAction =
            normalizeAction(actionName);

        return permissions.some(
            (permission) => {

                const permissionModule =
                    normalizeModule(
                        permission?.moduleName ||
                        permission?.module?.moduleName ||
                        permission?.module?.name ||
                        ""
                    );

                if (
                    permissionModule !==
                    requestedModule
                ) {
                    return false;
                }

                if (
                    permission?.active === false
                ) {
                    return false;
                }

                if (
                    normalizeAction(
                        permission?.status
                    ) === "INACTIVE"
                ) {
                    return false;
                }

                if (
                    Array.isArray(
                        permission?.actions
                    )
                ) {

                    return permission.actions.some(
                        (action) => {

                            if (
                                typeof action ===
                                "string"
                            ) {
                                return (
                                    normalizeAction(
                                        action
                                    ) ===
                                    requestedAction
                                );
                            }

                            const permissionAction =
                                normalizeAction(
                                    action?.actionName ||
                                    action?.action?.actionName ||
                                    action?.action?.name ||
                                    action?.name ||
                                    ""
                                );

                            const allowed =
                                action?.allowed === true ||
                                action?.allowed === "true";

                            if (
                                action?.active === false
                            ) {
                                return false;
                            }

                            if (
                                normalizeAction(
                                    action?.status
                                ) === "INACTIVE"
                            ) {
                                return false;
                            }

                            return (
                                permissionAction ===
                                requestedAction &&
                                allowed
                            );
                        }
                    );
                }

                const permissionAction =
                    normalizeAction(
                        permission?.actionName ||
                        permission?.action?.actionName ||
                        permission?.action?.name ||
                        ""
                    );

                const allowed =
                    permission?.allowed === true ||
                    permission?.allowed === "true";

                return (
                    permissionAction ===
                    requestedAction &&
                    allowed
                );
            }
        );
    };
    /* =====================================================
       EDIT MODE
    ===================================================== */

    const isEdit =
        Boolean(
            existingProduct?.id
        );

    const requiredAction =
        isEdit
            ? "EDIT"
            : "CREATE";

    const hasRequiredPermission =
        hasPermission(
            "Products",
            requiredAction
        );


    useEffect(() => {

        if (authChecking) {
            return;
        }

        if (!isAuthenticated) {
            return;
        }

        if (hasFullAccess) {
            return;
        }

        if (
            !permissionsLoaded &&
            !permissionLoading
        ) {
            dispatch(
                getUserPermission()
            );
        }

    }, [
        authChecking,
        isAuthenticated,
        hasFullAccess,
        permissionsLoaded,
        permissionLoading,
        dispatch,
    ]);
    /* =====================================================
       FORM
    ===================================================== */

    const [form, setForm] =
        useState(
            getEmptyForm()
        );


    const [errors, setErrors] =
        useState({});


    const [activeTab, setActiveTab] =
        useState("product");


    const [imagePreview, setImagePreview] =
        useState("");


    const [showSaveMenu, setShowSaveMenu] =
        useState(false);


    const [savingAndNew, setSavingAndNew] =
        useState(false);


    /* =====================================================
       UI CLASSES
    ===================================================== */

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

    //     const labelClass = `
    //     block
    //     text-xs
    //     font-medium
    //     ${required ? "text-red-500" : "text-gray-600"}
    //     mb-1.5
    // `;

    const getLabelClass = (required = false) => `
    block
    text-xs
    font-medium
    ${required ? "text-red-500" : "text-gray-600"}
    mb-1.5
`;

    /* =====================================================
       TABS
    ===================================================== */

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


    /* =====================================================
       MASTER DATA
    ===================================================== */

    useEffect(() => {

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
        dispatch,
        categories.length,
        subCategories.length,
        sizes.length,
        units.length,
        taxes.length,
    ]);


    /* =====================================================
       OPTION HELPERS
    ===================================================== */

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
                item?.name ||
                item?.size ||
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
                item?.name ||
                item?.unit ||
                "";

            const code =
                item?.unitCode ||
                "";

            return code
                ? `${name} (${code})`
                : name;

        };


    const getTaxKey =
        (item) =>
            item?.id ??
            item?.taxId;


    const getTaxLabel =
        (item) =>
            item?.taxName ||
            item?.name ||
            item?.taxCode ||
            item?.code ||
            "";


    /* =====================================================
       IMAGE URL
    ===================================================== */

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


    /* =====================================================
       NORMALIZE IDS
    ===================================================== */

    const normalizeIds =
        (items, keyGetter) => {

            if (!Array.isArray(items)) {
                return [];
            }


            return items
                .map((item) => {

                    if (
                        item &&
                        typeof item ===
                        "object"
                    ) {
                        return keyGetter(
                            item
                        );
                    }

                    return item;

                })
                .filter(
                    (id) =>
                        id !==
                        null &&
                        id !==
                        undefined &&
                        id !== ""
                );

        };


    /* =====================================================
       LOAD EDIT PRODUCT
    ===================================================== */

    useEffect(() => {

        if (!isEdit) {

            setForm(
                getEmptyForm()
            );

            setImagePreview("");
            setErrors({});
            setActiveTab("product");

            return;
        }


        const data =
            existingProduct;


        if (!data) {
            return;
        }


        const imageUrl =
            data.imageUrl ??
            data.image ??
            "";


        const selectedSizes =
            normalizeIds(
                data.sizes ??
                data.sizeIds ??
                [],
                getSizeKey
            );


        const selectedUnits =
            normalizeIds(
                data.units ??
                data.unitIds ??
                [],
                getUnitKey
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

            description:
                data.description ??
                "",

            sellingPrice:
                data.sellingPrice ??
                "",

            purchasingPrice:
                data.purchasingPrice ??
                data.purchasePrice ??
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

            sizes:
                selectedSizes,

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


        setImagePreview(
            imageUrl
                ? getProductImageUrl(
                    imageUrl
                )
                : ""
        );


        setErrors({});
        setActiveTab("product");

    }, [
        isEdit,
        existingProduct,
    ]);


    /* =====================================================
       FILTER SUB CATEGORIES
    ===================================================== */

    const filteredSubCategories =
        useMemo(() => {

            if (!form.categoryId) {
                return EMPTY_ARRAY;
            }


            return subCategories.filter(
                (item) => {

                    const categoryId =
                        item?.categoryId ??
                        item?.category?.id;


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


    /* =====================================================
       FIELD CHANGE
    ===================================================== */

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


    /* =====================================================
       CATEGORY CHANGE
    ===================================================== */

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


    /* =====================================================
       SIZE ADD
    ===================================================== */

    const handleAddSize =
        (sizeId) => {

            if (
                sizeId ===
                null ||
                sizeId ===
                undefined ||
                sizeId === ""
            ) {
                return;
            }


            setForm(
                (prev) => {

                    const exists =
                        prev.sizes.some(
                            (id) =>
                                String(id) ===
                                String(sizeId)
                        );


                    if (exists) {
                        return prev;
                    }


                    return {
                        ...prev,

                        sizes: [
                            ...prev.sizes,
                            sizeId,
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


    /* =====================================================
       SIZE REMOVE
    ===================================================== */

    const handleRemoveSize =
        (sizeId) => {

            setForm(
                (prev) => ({
                    ...prev,

                    sizes:
                        prev.sizes.filter(
                            (id) =>
                                String(id) !==
                                String(sizeId)
                        ),
                })
            );

        };


    /* =====================================================
       UNIT ADD
    ===================================================== */

    const handleAddUnit =
        (unitId) => {

            if (
                unitId ===
                null ||
                unitId ===
                undefined ||
                unitId === ""
            ) {
                return;
            }


            setForm(
                (prev) => {

                    const exists =
                        prev.units.some(
                            (id) =>
                                String(id) ===
                                String(unitId)
                        );


                    if (exists) {
                        return prev;
                    }


                    return {
                        ...prev,

                        units: [
                            ...prev.units,
                            unitId,
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


    /* =====================================================
       UNIT REMOVE
    ===================================================== */

    const handleRemoveUnit =
        (unitId) => {

            setForm(
                (prev) => ({
                    ...prev,

                    units:
                        prev.units.filter(
                            (id) =>
                                String(id) !==
                                String(unitId)
                        ),
                })
            );

        };


    /* =====================================================
       IMAGE CHANGE
    ===================================================== */

    const handleImageChange =
        (event) => {

            const file =
                event.target
                    .files?.[0];


            if (!file) {
                return;
            }


            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                toast.error(
                    "Please select a valid image"
                );

                return;

            }


            if (
                file.size >
                5 * 1024 * 1024
            ) {

                toast.error(
                    "Image size must be less than 5MB"
                );

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


    /* =====================================================
       IMAGE REMOVE
    ===================================================== */

    const handleRemoveImage =
        () => {

            setForm(
                (prev) => ({
                    ...prev,

                    image:
                        null,

                    imageUrl:
                        "",
                })
            );


            setImagePreview("");

        };


    /* =====================================================
       CLOSE / BACK
    ===================================================== */

    const handleClose =
        () => {

            if (loading) {
                return;
            }


            dispatch(
                resetProductForm()
            );


            navigate(
                "/items"
            );

        };


    /* =====================================================
       ESCAPE
    ===================================================== */

    // useEffect(() => {

    //     const handleEscape =
    //         (event) => {

    //             if (
    //                 event.key ===
    //                 "Escape"
    //             ) {

    //                 if (
    //                     !loading
    //                 ) {
    //                     handleClose();
    //                 }

    //             }

    //         };


    //     document.addEventListener(
    //         "keydown",
    //         handleEscape
    //     );


    //     return () => {

    //         document.removeEventListener(
    //             "keydown",
    //             handleEscape
    //         );

    //     };

    // }, [
    //     loading,
    // ]);


    /* =====================================================
       VALIDATION
    ===================================================== */

    const validate = () => {

        const nextErrors = {};

        /* PRODUCT */

        if (!form.categoryId) {
            nextErrors.categoryId =
                "Category is required";
        }

        if (!form.subCategoryId) {
            nextErrors.subCategoryId =
                "Sub Category is required";
        }

        if (
            !String(
                form.productName ?? ""
            ).trim()
        ) {
            nextErrors.productName =
                "Product Name is required";
        }


        /* PRICING */

        if (
            form.purchasingPrice === "" ||
            form.purchasingPrice === null ||
            form.purchasingPrice === undefined
        ) {

            nextErrors.purchasingPrice =
                "Purchasing Price is required";

        } else if (
            Number.isNaN(
                Number(form.purchasingPrice)
            ) ||
            Number(form.purchasingPrice) <= 0
        ) {

            nextErrors.purchasingPrice =
                "Purchasing Price must be greater than 0";

        }


        if (
            form.sellingPrice === "" ||
            form.sellingPrice === null ||
            form.sellingPrice === undefined
        ) {

            nextErrors.sellingPrice =
                "Selling Price is required";

        } else if (
            Number.isNaN(
                Number(form.sellingPrice)
            ) ||
            Number(form.sellingPrice) <= 0
        ) {

            nextErrors.sellingPrice =
                "Selling Price must be greater than 0";

        }


        if (!form.taxId) {

            nextErrors.taxId =
                "Tax is required";

        }


        /* INVENTORY */

        if (
            form.minimumStock !== "" &&
            form.minimumStock !== null &&
            form.minimumStock !== undefined &&
            Number(form.minimumStock) < 0
        ) {

            nextErrors.minimumStock =
                "Minimum Stock cannot be negative";

        }


        if (
            form.maximumStock !== "" &&
            form.maximumStock !== null &&
            form.maximumStock !== undefined &&
            Number(form.maximumStock) < 0
        ) {

            nextErrors.maximumStock =
                "Maximum Stock cannot be negative";

        }


        if (
            form.minimumStock !== "" &&
            form.maximumStock !== "" &&
            Number(form.minimumStock) >
            Number(form.maximumStock)
        ) {

            nextErrors.maximumStock =
                "Maximum Stock must be greater than Minimum Stock";

        }


        setErrors(nextErrors);


        /* =================================================
           MOVE TO FIRST INVALID TAB
        ================================================= */

        if (
            nextErrors.categoryId ||
            nextErrors.subCategoryId ||
            nextErrors.productName
        ) {

            setActiveTab("product");

            toast.error(
                "Please complete Product Information"
            );

            return false;

        }


        if (
            nextErrors.purchasingPrice ||
            nextErrors.sellingPrice ||
            nextErrors.taxId
        ) {

            setActiveTab("pricing");

            toast.error(
                "Please complete Pricing & Tax"
            );

            return false;

        }


        if (
            nextErrors.minimumStock ||
            nextErrors.maximumStock
        ) {

            setActiveTab("inventory");

            toast.error(
                "Please correct Inventory fields"
            );

            return false;

        }


        return true;
    };


    /* =====================================================
       BUILD PAYLOAD
    ===================================================== */

    const buildPayload =
        () => {

            const sizeIds =
                Array.isArray(
                    form.sizes
                )
                    ? form.sizes
                        .map(
                            (id) =>
                                Number(id)
                        )
                        .filter(
                            (id) =>
                                !Number.isNaN(
                                    id
                                )
                        )
                    : [];


            const unitIds =
                Array.isArray(
                    form.units
                )
                    ? form.units
                        .map(
                            (id) =>
                                Number(id)
                        )
                        .filter(
                            (id) =>
                                !Number.isNaN(
                                    id
                                )
                        )
                    : [];


            return {

                productName:
                    String(
                        form.productName ??
                        ""
                    ).trim(),

                subCategoryId:
                    Number(
                        form.subCategoryId
                    ),

                brand:
                    String(
                        form.brand ??
                        ""
                    ).trim(),

                hsnCode:
                    String(
                        form.hsnCode ??
                        ""
                    ).trim(),

                description:
                    String(
                        form.description ??
                        ""
                    ).trim(),

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

                sizeIds,

                unitIds,

                status:
                    form.status ||
                    "ACTIVE",

                ...(form.image
                    ? {
                        image:
                            form.image,
                    }
                    : {}),

            };

        };


    /* =====================================================
       SAVE
    ===================================================== */

    const handleSave =
        async ({
            saveAndNew = false,
            saveAndClose = true,
        } = {}) => {

            if (loading) {
                return;
            }

            if (!isAuthenticated) {

                toast.error(
                    "You are not authenticated."
                );

                return;
            }

            if (
                !hasFullAccess &&
                (
                    permissionLoading ||
                    !permissionsLoaded
                )
            ) {

                toast.error(
                    "Permissions are still loading. Please try again."
                );

                return;
            }

            if (!hasRequiredPermission) {

                toast.error(
                    isEdit
                        ? "You do not have permission to edit products."
                        : "You do not have permission to create products."
                );

                return;
            }

            const valid =
                validate();


            if (!valid) {
                return;
            }


            setSavingAndNew(
                saveAndNew
            );


            const payload =
                buildPayload();


            try {

                let result;


                /* =================================================
                   UPDATE
                ================================================= */

                if (isEdit) {

                    if (!form.id) {

                        toast.error(
                            "Product ID is missing"
                        );

                        return;

                    }


                    result =
                        await dispatch(
                            updateProduct({
                                id:
                                    form.id,

                                data:
                                    payload,
                            })
                        ).unwrap();

                }


                /* =================================================
                   CREATE
                ================================================= */

                else {

                    result =
                        await dispatch(
                            createProduct(
                                payload
                            )
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


                /* =================================================
                   SAVE & NEW
                ================================================= */

                if (
                    saveAndNew &&
                    !isEdit
                ) {

                    dispatch(
                        resetProductForm()
                    );


                    setForm(
                        getEmptyForm()
                    );


                    setErrors({});

                    setImagePreview("");

                    setActiveTab(
                        "product"
                    );

                    setShowSaveMenu(
                        false
                    );

                    return;

                }


                /* =================================================
                   SAVE & CLOSE
                ================================================= */

                if (
                    saveAndClose
                ) {

                    dispatch(
                        resetProductForm()
                    );


                    navigate(
                        "/items"
                    );

                }

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
                        error?.response
                            ?.data
                            ?.message ||
                        "Failed to save product"
                );

            } finally {

                setSavingAndNew(
                    false
                );

            }

        };

    if (
        !hasFullAccess &&
        (
            permissionLoading ||
            !permissionsLoaded
        )
    ) {
        return (
            <div>
                <div className="text-center">
                    <div
                        className="
                        w-10
                        h-10
                        mx-auto
                        mb-3
                        border-2
                        border-blue-200
                        border-t-blue-600
                        rounded-full
                        animate-spin
                    "
                    />

                    <p className="text-sm font-medium text-gray-600">
                        Loading permissions...
                    </p>
                </div>
            </div>
        );
    }



    if (!hasRequiredPermission) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="w-full max-w-md text-center">

                    <div className="flex flex-col items-center">

                        <div
                            className="
                            w-11
                            h-11
                            rounded-lg
                            bg-red-50
                            flex
                            items-center
                            justify-center
                            mb-3
                        "
                        >
                            <UserRoundArrowLeft
                                size={21}
                                className="text-red-500"
                            />
                        </div>

                        <h2
                            className="
                            text-[17px]
                            font-semibold
                            text-gray-800
                        "
                        >
                            Access Denied
                        </h2>

                        <p
                            className="
                            mt-1.5
                            text-sm
                            text-gray-500
                            leading-5
                        "
                        >
                            {isEdit
                                ? "You do not have permission to edit products."
                                : "You do not have permission to create products."
                            }
                        </p>

                    </div>
                </div>
            </div>
        );
    }

    /* =====================================================
       PRODUCT INFORMATION
    ===================================================== */

    const renderProductTab = () => (
        <div className="w-full max-w-7xl">
            <div
                className="
                bg-white
                border
                border-gray-200
                rounded-lg
                p-6
            "
            >
                {/* HEADER */}
                <div className="mb-6">
                    <h2 className="text-base font-semibold text-[#088178]">
                        Product Information
                    </h2>

                    <p className="text-sm text-[#088178] mt-1">
                        Enter the basic information of the product.
                    </p>
                </div>

                {/* LEFT + RIGHT */}
                <div
                    className="
                    grid
                    grid-cols-1
                    lg:grid-cols-[minmax(0,1fr)_280px]
                    gap-8
                    items-start
                "
                >
                    {/* ================= LEFT ================= */}
                    <div className="space-y-5">

                        {/* CATEGORY + SUB CATEGORY */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                            {/* CATEGORY */}
                            <SearchSelect
                                label="Category"
                                value={form.categoryId}
                                options={categories || []}
                                onChange={handleCategoryChange}
                                getOptionKey={(item) => item?.id}
                                getOptionLabel={(item) =>
                                    item?.categoryName ||
                                    item?.categoreyName ||
                                    item?.name ||
                                    ""
                                }
                                placeholder="Search category..."
                                required
                                error={errors.categoryId}
                                addLabel="New Category"
                                onAdd={(searchValue) => {
                                    dispatch(
                                        openModal({
                                            type: "addCategory",
                                            data: {
                                                categoryName: searchValue,
                                            },
                                        })
                                    );
                                }}
                            />

                            {/* SUB CATEGORY */}
                            <SearchSelect
                                label="Sub Category"
                                value={form.subCategoryId}
                                options={filteredSubCategories || []}
                                onChange={(value) =>
                                    handleChange(
                                        "subCategoryId",
                                        value
                                    )
                                }
                                getOptionKey={(item) => item?.id}
                                getOptionLabel={(item) =>
                                    item?.subCategoryName ||
                                    item?.name ||
                                    ""
                                }
                                placeholder={
                                    form.categoryId
                                        ? "Search sub category..."
                                        : "Select category first"
                                }
                                disabled={!form.categoryId}
                                required
                                error={errors.subCategoryId}
                                addLabel="New Sub Category"
                                onAdd={(searchValue) => {
                                    dispatch(
                                        openModal({
                                            type: "addSubCategory",
                                            data: {
                                                subCategoryName:
                                                    searchValue,
                                                categoryId:
                                                    form.categoryId,
                                            },
                                        })
                                    );
                                }}
                            />

                        </div>

                        {/* PRODUCT NAME + BRAND */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                            {/* PRODUCT NAME */}
                            <div>

                                <label className={getLabelClass(true)}>
                                    Product Name
                                    <span className="ml-1">*</span>
                                </label>

                                <input
                                    type="text"
                                    value={form.productName}
                                    onChange={(e) =>
                                        handleChange(
                                            "productName",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter product name"
                                    className={`
                                    ${inputClass}
                                    ${errors.productName
                                            ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                                            : ""
                                        }
                                `}
                                />

                                {errors.productName && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.productName}
                                    </p>
                                )}
                            </div>

                            {/* BRAND */}
                            <div>
                                <label className={getLabelClass(false)}>
                                    Brand
                                </label>

                                <input
                                    type="text"
                                    value={form.brand}
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

                        </div>

                        {/* HSN CODE */}
                        <div>
                            <label className={getLabelClass(false)}>
                                HSN Code
                            </label>

                            <input
                                type="text"
                                value={form.hsnCode}
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

                        {/* DESCRIPTION */}
                        <div>
                            <label className={getLabelClass(false)}>
                                Description
                            </label>

                            <textarea
                                rows={6}
                                value={form.description}
                                onChange={(e) =>
                                    handleChange(
                                        "description",
                                        e.target.value
                                    )
                                }
                                placeholder="Enter product description"
                                className={`
                                ${inputClass}
                                h-auto
                                min-h-[140px]
                                resize-none
                                py-3
                            `}
                            />
                        </div>

                    </div>

                    {/* ================= RIGHT ================= */}
                    <div className="flex flex-col gap-5">

                        {/* STATUS */}
                        <div
                            className="
                            border
                            border-gray-200
                            rounded-lg
                            bg-white
                            p-4
                        "
                        >
                            <div className="flex items-center justify-between">

                                <div>
                                    <p className="text-sm font-medium text-gray-800">
                                        Status
                                    </p>

                                    <p className="text-xs text-gray-400 mt-1">
                                        Current product status
                                    </p>
                                </div>

                                <span
                                    className={`
                                    inline-flex
                                    items-center
                                    px-3
                                    py-1.5
                                    rounded-full
                                    text-xs
                                    font-semibold
                                    ${form.status === "ACTIVE"
                                            ? "bg-green-50 text-green-700 border border-green-100"
                                            : form.status === "INACTIVE"
                                                ? "bg-red-50 text-red-700 border border-red-100"
                                                : "bg-yellow-50 text-yellow-700 border border-yellow-100"
                                        }
                                `}
                                >
                                    <span
                                        className={`
                                        w-1.5
                                        h-1.5
                                        rounded-full
                                        mr-2
                                        ${form.status === "ACTIVE"
                                                ? "bg-green-500"
                                                : form.status === "INACTIVE"
                                                    ? "bg-red-500"
                                                    : "bg-yellow-500"
                                            }
                                    `}
                                    />

                                    {form.status || "ACTIVE"}
                                </span>

                            </div>
                        </div>

                        {/* PRODUCT IMAGE */}
                        <div
                            className="
                            border
                            border-gray-200
                            rounded-lg
                            bg-white
                            p-4
                        "
                        >
                            <p className="text-sm font-medium text-gray-800 mb-3">
                                Product Image
                            </p>

                            {/* IMAGE PREVIEW */}
                            <div
                                className="
                                w-full
                                h-[230px]
                                border
                                border-dashed
                                border-gray-300
                                rounded-lg
                                bg-gray-50
                                flex
                                items-center
                                justify-center
                                overflow-hidden
                            "
                            >
                                {form.image ? (
                                    <img
                                        src={URL.createObjectURL(form.image)}
                                        alt="Product preview"
                                        className="
                                        w-full
                                        h-full
                                        object-contain
                                    "
                                    />
                                ) : form.imageUrl ? (
                                    <img
                                        src={form.imageUrl}
                                        alt="Product"
                                        className="
                                        w-full
                                        h-full
                                        object-contain
                                    "
                                    />
                                ) : (
                                    <div className="text-center">
                                        <div className="text-sm text-gray-400">
                                            No image
                                        </div>

                                        <div className="text-xs text-gray-300 mt-1">
                                            Upload product image
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* UPLOAD */}
                            <label
                                className="
                                mt-3
                                flex
                                items-center
                                justify-center
                                w-full
                                h-10
                                px-4
                                border
                                border-gray-300
                                rounded-md
                                bg-white
                                text-sm
                                font-medium
                                text-gray-700
                                cursor-pointer
                                hover:bg-gray-50
                            "
                            >
                                Upload Image

                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file =
                                            e.target.files?.[0];

                                        if (file) {
                                            handleChange(
                                                "image",
                                                file
                                            );
                                        }
                                    }}
                                />
                            </label>

                            {/* REMOVE */}
                            {(form.image || form.imageUrl) && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setForm((prev) => ({
                                            ...prev,
                                            image: null,
                                            imageUrl: "",
                                        }));
                                    }}
                                    className="
                                    mt-2
                                    w-full
                                    h-9
                                    text-xs
                                    font-medium
                                    text-red-500
                                    hover:text-red-600
                                "
                                >
                                    Remove Image
                                </button>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );

    /* =====================================================
       PRICING TAB
    ===================================================== */

    const renderPricingTab =
        () => (

            <div className="w-full max-w-7xl">

                <div
                    className="
                        bg-white
                        border
                        border-gray-200
                        rounded-lg
                        p-6
                    "
                >

                    <div className="mb-6">

                        <h2 className="
                            text-base
                            font-semibold
                            text-[#088178]
                        ">
                            Pricing & Tax
                        </h2>

                        <p className="
                            text-sm
                            text-[#088178]
                            mt-1
                        ">
                            Configure purchase price,
                            selling price and tax.
                        </p>

                    </div>


                    <div
                        className="
                            grid
                            grid-cols-1
                            md:grid-cols-2
                            gap-5
                        "
                    >

                        {/* PURCHASING PRICE */}

                        <div>

                            <label
                                className={
                                    getLabelClass(true)
                                }
                            >
                                Purchasing Price
                                <span className="
                                    text-red-500
                                    ml-1
                                ">
                                    *
                                </span>
                            </label>

                            <input
                                type="number"
                                min="0"
                                step="0.01"
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
                                    ${inputClass}
                                    ${errors.purchasingPrice
                                        ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                                        : ""
                                    }
                                `}
                            />

                            {errors.purchasingPrice && (

                                <p className="
                                    mt-1
                                    text-xs
                                    text-red-500
                                ">
                                    {
                                        errors.purchasingPrice
                                    }
                                </p>

                            )}

                        </div>


                        {/* SELLING PRICE */}

                        <div>

                            <label
                                className={
                                    getLabelClass(true)
                                }
                            >
                                Selling Price
                                <span className="
                                    text-red-500
                                    ml-1
                                ">
                                    *
                                </span>
                            </label>

                            <input
                                type="number"
                                min="0"
                                step="0.01"
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
                                    ${inputClass}
                                    ${errors.sellingPrice
                                        ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                                        : ""
                                    }
                                `}
                            />

                            {errors.sellingPrice && (

                                <p className="
                                    mt-1
                                    text-xs
                                    text-red-500
                                ">
                                    {
                                        errors.sellingPrice
                                    }
                                </p>

                            )}

                        </div>


                        {/* TAX */}

                        <SearchSelect
                            label="Tax"
                            value={form.taxId}
                            options={taxes || []}
                            onChange={(value) =>
                                handleChange(
                                    "taxId",
                                    value
                                )
                            }
                            getOptionKey={(item) =>
                                item?.id ??
                                item?.taxId
                            }
                            getOptionLabel={(item) =>
                                item?.taxName ||
                                item?.name ||
                                item?.taxCode ||
                                item?.code ||
                                ""
                            }
                            placeholder="Search tax..."
                            required
                            error={errors.taxId}
                            addLabel="New Tax"
                            onAdd={(searchValue) => {
                                dispatch(
                                    openModal({
                                        type: "addTaxMaster",
                                        data: {
                                            taxName:
                                                searchValue,
                                        },
                                    })
                                );
                            }}
                        />

                    </div>

                </div>

            </div>

        );


    /* =====================================================
       INVENTORY TAB
    ===================================================== */

    const renderInventoryTab =
        () => (

            <div className="w-full max-w-7xl">

                <div
                    className="
                        bg-white
                        border
                        border-gray-200
                        rounded-lg
                        p-6
                    "
                >

                    <div className="mb-6">

                        <h2 className="
                            text-base
                            font-semibold
                            text-[#088178]
                        ">
                            Inventory Information
                        </h2>

                        <p className="
                            text-sm
                            text-[#088178]
                            mt-1
                        ">
                            Configure stock levels,
                            units and available sizes.
                        </p>

                    </div>


                    {/* STOCK */}

                    <div
                        className="
                            grid
                            grid-cols-1
                            md:grid-cols-2
                            gap-5
                        "
                    >

                        {/* MINIMUM */}

                        <div>

                            <label
                                className={
                                    getLabelClass(false)
                                }
                            >
                                Minimum Stock
                            </label>

                            <input
                                type="number"
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
                                placeholder="Enter minimum stock"
                                className={`
                                    ${inputClass}
                                    ${errors.minimumStock
                                        ? "border-red-400"
                                        : ""
                                    }
                                `}
                            />

                            {errors.minimumStock && (

                                <p className="
                                    mt-1
                                    text-xs
                                    text-red-500
                                ">
                                    {
                                        errors.minimumStock
                                    }
                                </p>

                            )}

                        </div>


                        {/* MAXIMUM */}

                        <div>

                            <label
                                className={
                                    getLabelClass(false)
                                }
                            >
                                Maximum Stock
                            </label>

                            <input
                                type="number"
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
                                placeholder="Enter maximum stock"
                                className={`
                                    ${inputClass}
                                    ${errors.maximumStock
                                        ? "border-red-400"
                                        : ""
                                    }
                                `}
                            />

                            {errors.maximumStock && (

                                <p className="
                                    mt-1
                                    text-xs
                                    text-red-500
                                ">
                                    {
                                        errors.maximumStock
                                    }
                                </p>

                            )}

                        </div>

                    </div>


                    {/* SIZES */}

                    <div className="mt-7">

                        <label
                            className={
                                getLabelClass(false)
                            }
                        >
                            Sizes
                        </label>

                        <SearchMultiSelect
                            selected={
                                form.sizes ||
                                []
                            }
                            options={
                                sizes ||
                                []
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
                            placeholder="Select sizes"
                            addLabel="New Size"
                            onCreate={(
                                searchValue
                            ) => {

                                dispatch(
                                    openModal({
                                        type: "addSize",
                                        data: {
                                            sizeName:
                                                searchValue,
                                        },
                                    })
                                );

                            }}
                        />

                        {errors.sizes && (

                            <p className="
                                mt-1
                                text-xs
                                text-red-500
                            ">
                                {errors.sizes}
                            </p>

                        )}

                    </div>


                    {/* UNITS */}

                    <div className="mt-7">

                        <label
                            className={
                                getLabelClass(false)
                            }
                        >
                            Units
                        </label>

                        <SearchMultiSelect
                            selected={
                                form.units ||
                                []
                            }
                            options={
                                units ||
                                []
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
                            placeholder="Select units"
                            addLabel="New Unit"
                            onCreate={(
                                searchValue
                            ) => {

                                dispatch(
                                    openModal({
                                        type: "addUnit",
                                        data: {
                                            unitName:
                                                searchValue,
                                        },
                                    })
                                );

                            }}
                        />

                        {errors.units && (

                            <p className="
                                mt-1
                                text-xs
                                text-red-500
                            ">
                                {errors.units}
                            </p>

                        )}

                    </div>

                </div>

            </div>

        );


    /* =====================================================
       SETTINGS TAB
    ===================================================== */

    const renderSettingsTab = () => (

        <div className="w-full max-w-7xl">

            <div
                className="
                bg-white
                border
                border-gray-200
                rounded-lg
                p-6
            "
            >

                {/* HEADER */}

                <div className="mb-6">

                    <h2
                        className="
                        text-base
                        font-semibold
                        text-[#088178]
                    "
                    >
                        Product Settings
                    </h2>

                    <p
                        className="
                        text-sm
                        text-[#088178]
                        mt-1
                    "
                    >
                        Configure the product availability and status.
                    </p>

                </div>


                {/* STATUS */}

                <div className="max-w-[460px]">

                    <label className={getLabelClass(false)}>
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
                    bg-gray-50
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

                        {/* STATUS DETAILS */}

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


                        {/* STATUS BADGE */}

                        <span
                            className={`
                            inline-flex
                            items-center
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

        </div>

    );


    /* =====================================================
       RENDER
    ===================================================== */

    return (

        <div
            className="
                flex
                flex-col
                h-full
                min-h-0
                bg-gray-50
                
                px-3.5
                py-5
            "
        >

            {/* =================================================
                HEADER
            ================================================= */}

            <div
                className="
                    shrink-0
                    px-6
                    py-4
                    bg-white
                    border-b
                    border-gray-200
                    flex
                    items-center
                    justify-between
                "
            >

                <div className="
                    flex
                    items-center
                    gap-3
                ">

                    <div
                        className="
                            w-10
                            h-10
                            rounded-lg
                            bg-blue-50
                            border
                            border-blue-100
                            flex
                            items-center
                            justify-center
                            cursor-pointer
                        "
                        onClick={() => (navigate("/items"))}
                    >

                        <Package
                            size={20}
                            className="text-[#088178]"
                        />

                    </div>


                    <div>

                        <h1 className="
                            text-lg
                            font-semibold
                            text-[#088178]
                            cursor-pointer
                        "
                            onClick={() => (navigate("/items"))}
                        >
                            {isEdit
                                ? "Edit Product"
                                : "New Product"}
                        </h1>

                        <p className="
                            text-xs
                            text-[#088178]
                            mt-0.5
                        ">
                            {isEdit
                                ? "Update product information"
                                : "Create a new product"}
                        </p>

                    </div>

                </div>


                {/* CLOSE */}

                <button
                    type="button"
                    disabled={loading}
                    onClick={
                        handleClose
                    }
                    className="
                        w-9
                        h-9
                        flex
                        items-center
                        justify-center
                        rounded-md
                        text-gray-400
                        hover:bg-gray-100
                        hover:text-gray-600
                        disabled:opacity-50
                    "
                >

                    <X
                        size={20}
                    />

                </button>

            </div>


            {/* =================================================
                TABS
            ================================================= */}

            <div
                className="
                    shrink-0
                    px-6
                    bg-white
                    border-b
                    border-gray-200
                    flex
                    items-center
                    gap-7
                    overflow-x-auto
                "
            >

                {tabs.map(
                    (tab) => (

                        <button
                            key={
                                tab.id
                            }
                            type="button"
                            onClick={() =>
                                setActiveTab(
                                    tab.id
                                )
                            }
                            className={`
                                py-3
                                text-sm
                                font-medium
                                border-b-2
                                whitespace-nowrap
                                transition

                                ${activeTab ===
                                    tab.id
                                    ? "text-[#088178] border-[#088178]"
                                    : "text-[#088178]/70 border-transparent hover:text-[#088178]"
                                }
                            `}
                        >

                            {tab.label}

                        </button>

                    )
                )}

            </div>


            {/* =================================================
                BODY
            ================================================= */}

            <div
                className="
                    flex-1
                    min-h-0
                    overflow-y-auto
                    py-6
                "
            >

                {activeTab ===
                    "product" &&
                    renderProductTab()}


                {activeTab ===
                    "pricing" &&
                    renderPricingTab()}


                {activeTab ===
                    "inventory" &&
                    renderInventoryTab()}


                {activeTab ===
                    "settings" &&
                    renderSettingsTab()}

            </div>


            {/* =================================================
                FOOTER
            ================================================= */}

            <div
                className="
                    shrink-0
                    border-t
                    border-gray-200
                    bg-white
                    px-6
                    py-2
                    flex
                    items-center
                    justify-end
                    gap-3
                    mr-13
                "
            >

                {/* CANCEL */}

                <button
                    type="button"
                    disabled={loading}
                    onClick={
                        handleClose
                    }
                    className="
                        h-10
                        px-5
                        border
                        border-gray-300
                        rounded-md
                        bg-white
                        text-sm
                        font-medium
                        text-[#088178]
                        hover:bg-gray-50
                        disabled:opacity-50
                    "
                >
                    Cancel
                </button>


                {/* SAVE SPLIT BUTTON */}

                <div className="
                    relative
                    flex
                ">

                    {/* MAIN SAVE */}

                    <button
                        type="button"
                        disabled={
                            loading
                        }
                        onClick={() =>
                            handleSave({
                                saveAndNew:
                                    false,

                                saveAndClose:
                                    true,
                            })
                        }
                        className="
                            h-10
                            px-5
                            bg-[#088178]
                            hover:bg-[#088178]/70
                            text-white
                            text-sm
                            font-medium
                            rounded-l-md
                            disabled:opacity-50
                            disabled:cursor-not-allowed
                        "
                    >

                        {loading
                            ? "Saving..."
                            : isEdit
                                ? "Update Product"
                                : "Save Product"}

                    </button>


                    {/* DROPDOWN */}

                    <button
                        type="button"
                        disabled={
                            loading
                        }
                        onClick={() =>
                            setShowSaveMenu(
                                (prev) =>
                                    !prev
                            )
                        }
                        className="
                            h-10
                            w-10
                            bg-[#088178]
                            hover:bg-[#088178]/70
                            text-white
                            rounded-r-md
                            border-l
                            border-white
                            flex
                            items-center
                            justify-center
                            disabled:opacity-50
                        "
                    >

                        <ChevronDown
                            size={16}
                            className={
                                showSaveMenu
                                    ? "rotate-180"
                                    : ""
                            }
                        />

                    </button>


                    {/* MENU */}

                    {showSaveMenu && (

                        <>

                            <div
                                className="
                                    fixed
                                    inset-0
                                    z-[80]
                                "
                                onClick={() =>
                                    setShowSaveMenu(
                                        false
                                    )
                                }
                            />


                            <div
                                className="
                                    absolute
                                    right-0
                                    bottom-full
                                    mb-2
                                    w-52
                                    bg-white
                                    border
                                    border-gray-200
                                    rounded-md
                                    shadow-xl
                                    z-[90]
                                    overflow-hidden
                                "
                            >

                                {!isEdit && (

                                    <button
                                        type="button"
                                        disabled={
                                            loading ||
                                            savingAndNew
                                        }
                                        onClick={() => {

                                            setShowSaveMenu(
                                                false
                                            );

                                            handleSave({
                                                saveAndNew:
                                                    true,

                                                saveAndClose:
                                                    false,
                                            });

                                        }}
                                        className="
                                            w-full
                                            px-4
                                            py-3
                                            text-left
                                            text-sm
                                            text-[#088178]
                                            hover:bg-gray-50
                                            disabled:opacity-50
                                        "
                                    >

                                        <div className="
                                            font-medium
                                        ">
                                            Save & New
                                        </div>

                                        <div className="
                                            text-xs
                                            text-gray-400
                                            mt-0.5
                                        ">
                                            Save and create
                                            another product
                                        </div>

                                    </button>

                                )}


                                <button
                                    type="button"
                                    disabled={
                                        loading
                                    }
                                    onClick={() => {

                                        setShowSaveMenu(
                                            false
                                        );

                                        handleSave({
                                            saveAndNew:
                                                false,

                                            saveAndClose:
                                                true,
                                        });

                                    }}
                                    className="
                                        w-full
                                        px-4
                                        py-3
                                        text-left
                                        text-sm
                                        text-[#088178]
                                        hover:bg-[gray-50]
                                        disabled:opacity-50
                                    "
                                >

                                    <div className="
                                        font-medium
                                    ">
                                        {isEdit
                                            ? "Update & Close"
                                            : "Save & Close"}
                                    </div>

                                    <div className="
                                        text-xs
                                        text-gray-400
                                        mt-0.5
                                    ">
                                        Save and return
                                        to products
                                    </div>

                                </button>

                            </div>

                        </>

                    )}

                </div>

            </div>

        </div>

    );
}