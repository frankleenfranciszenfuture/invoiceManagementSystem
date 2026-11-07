
import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import {
    ArrowLeft,
    Package,
    Save,
    ChevronDown,
    Loader2,
    RotateCcw,
    Tags,
    ImagePlus,
    Boxes,
} from "lucide-react";

import toast from "react-hot-toast";

import {
    createProduct,
    fetchProductById,
    updateProduct,
} from "../thunks/productThunks";

import {
    resetProductForm,
    clearCreatedCategorySelection,
    clearCreatedSubCategorySelection,
    clearCreatedTaxMasterSelection,
} from "../slices/productSlice";

import {
    getUserPermission,
} from "../../menuPermission/thunks/menuPermissionThunks";

import {
    fetchAllCategories,
} from "../../category/thunks/categoryThunks";

import {
    fetchAllSubCategories,
} from "../../subCategory/thunks/subCategoryThunks";

import {
    fetchAllSizes,
} from "../../../module/sizes/thunks/sizeThunks";

import {
    fetchAllUnits,
} from "../../../module/units/thunks/unitThunks";

import {
    fetchAllTaxMasters,
} from "../../../module/taxMaster/thunks/taxMasterThunks";

import CustomSelect from "../../../common/custom/CustomSelect";
import SearchMultiSelect from "../../../common/custom/SerachMultiSelect";
import SearchableCreateSelect from "../../../common/custom/SearchableCreateSelect";

import { openModal } from "../../../module/ui/uiSlice";
import useLeaveConfirmation from "../../../common/confirmation/useLeaveConfirmation";
import LeaveConfirmationModal from "../../../common/confirmation/LeaveConfirmationModal";

/* =========================================================
   INITIAL FORM DATA
========================================================= */

const initialFormData = {
    productName: "",
    categoryId: "",
    subCategoryId: "",
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
    description: "",
    image: null,
};

/* =========================================================
   RESPONSE NORMALIZER
========================================================= */

const getList = (value) => {
    if (Array.isArray(value)) return value;

    if (Array.isArray(value?.content)) {
        return value.content;
    }

    if (Array.isArray(value?.data)) {
        return value.data;
    }

    if (Array.isArray(value?.data?.content)) {
        return value.data.content;
    }

    return [];
};

/* =========================================================
   REUSABLE FORM COMPONENTS
========================================================= */

const FormField = ({
    label,
    required = false,
    children,
    className = "",
}) => (
    <div className={`flex flex-col gap-1.5 ${className}`}>
        <label className="text-sm font-medium text-gray-700">
            {label}

            {required && (
                <span className="ml-1 text-red-500">*</span>
            )}
        </label>

        {children}
    </div>
);

const TextInput = ({
    value,
    onChange,
    placeholder,
    type = "text",
    disabled = false,
    maxLength,
    min,
    step,
}) => (
    <input
        type={type}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        min={min}
        step={step}
        className="
            h-10 w-full rounded-lg border border-gray-200
            bg-white px-3 text-sm text-gray-700
            outline-none transition
            placeholder:text-gray-400
            focus:border-[#408DFB] focus:ring-2
            focus:ring-[#408DFB]/10
            disabled:cursor-not-allowed disabled:bg-gray-100
        "
    />
);

const SectionHeading = ({
    icon: Icon,
    title,
    description,
}) => (
    <div className="mb-5 flex items-center gap-3">
        <div className="
            flex h-10 w-10 items-center justify-center
            rounded-xl bg-blue-50 text-[#408DFB]
        ">
            <Icon size={19} />
        </div>

        <div>
            <h3 className="text-sm font-semibold text-gray-800">
                {title}
            </h3>

            {description && (
                <p className="mt-0.5 text-xs text-gray-400">
                    {description}
                </p>
            )}
        </div>
    </div>
);

const getProductData = (response) => {
    let data = response;

    // Unwrap common ApiResponse structures.
    for (let i = 0; i < 3; i++) {
        if (data?.data && typeof data.data === "object") {
            data = data.data;
        } else {
            break;
        }
    }

    return data?.product ?? data;
};

const getRelationList = (value) => {
    let current = value;

    for (let i = 0; i < 5; i++) {
        if (Array.isArray(current)) {
            return current;
        }

        if (!current || typeof current !== "object") {
            return [];
        }

        if (Array.isArray(current.content)) {
            return current.content;
        }

        if (Array.isArray(current.items)) {
            return current.items;
        }

        if (Array.isArray(current.data)) {
            return current.data;
        }

        if (current.data && typeof current.data === "object") {
            current = current.data;
            continue;
        }

        return [];
    }

    return [];
};

const getRelationId = (item, type) => {
    if (typeof item === "number" || typeof item === "string") {
        const id = Number(item);

        return Number.isFinite(id) && id > 0 ? id : null;
    }

    if (!item || typeof item !== "object") {
        return null;
    }

    const id = type === "size"
        ? (
            item.id ??
            item.sizeId ??
            item.size?.id ??
            item.size?.sizeId
        )
        : (
            item.id ??
            item.unitId ??
            item.unit?.id ??
            item.unit?.unitId
        );

    const numericId = Number(id);

    return Number.isFinite(numericId) && numericId > 0
        ? numericId
        : null;
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const ProductCreateNew = ({ onClose }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { id } = useParams();

    const isEditMode = Boolean(id);

    const [isProductLoading, setIsProductLoading] = useState(false);
    const [existingImageUrl, setExistingImageUrl] = useState("");
    /* =====================================================
       PRODUCT REDUX STATE
    ===================================================== */

    const productState = useSelector(
        (state) => state.product ?? {}
    );

    const {
        loading = false,
        createdCategorySelection,
        createdSubCategorySelection,
        createdTaxMasterSelection,
    } = productState;

    /* =====================================================
       MASTER REDUX STATE
    ===================================================== */

    const categoryState = useSelector(
        (state) => state.category ?? {}
    );

    const subCategoryState = useSelector(
        (state) => state.subCategory ?? {}
    );

    const sizeState = useSelector(
        (state) => state.size ?? {}
    );

    const unitState = useSelector(
        (state) => state.unit ?? {}
    );

    const taxMasterState = useSelector(
        (state) => state.taxMaster ?? {}
    );

    const categories = useMemo(
        () => getList(categoryState.categories),
        [categoryState.categories]
    );

    const subCategories = useMemo(
        () => getList(subCategoryState.subCategories),
        [subCategoryState.subCategories]
    );

    const sizes = useMemo(
        () => getList(sizeState.sizes),
        [sizeState.sizes]
    );

    const units = useMemo(
        () => getList(unitState.units),
        [unitState.units]
    );

    const taxMasters = useMemo(
        () => getList(taxMasterState.taxMasters),
        [taxMasterState.taxMasters]
    );

    const {
        showLeaveConfirmation,
        confirmLeave,
        handleStay,
        handleLeave,
    } = useLeaveConfirmation();


    /* =====================================================
       AUTH STATE
    ===================================================== */

    const user = useSelector(
        (state) => state.auth?.user
    );

    const isAuthenticated = useSelector(
        (state) => state.auth?.isAuthenticated === true
    );

    const authChecking = useSelector(
        (state) => state.auth?.authChecking === true
    );

    /* =====================================================
       PERMISSION STATE
    ===================================================== */

    const permissions = useSelector(
        (state) => state.menuPermission?.userPermissions ?? []
    );

    const permissionLoading = useSelector(
        (state) => state.menuPermission?.loading === true
    );

    const permissionsLoaded = useSelector(
        (state) =>
            state.menuPermission?.userPermissionsLoaded === true
    );

    /* =====================================================
       LOCAL STATE
    ===================================================== */

    const [formData, setFormData] = useState({
        ...initialFormData,
    });

    const [saveMode, setSaveMode] = useState("close");

    const [showSaveOptions, setShowSaveOptions] = useState(false);

    /* =====================================================
       NORMALIZATION
    ===================================================== */

    const normalizeModule = (value) =>
        String(value ?? "").trim().toLowerCase();

    const normalizeAction = (value) =>
        String(value ?? "").trim().toUpperCase();

    /* =====================================================
       ROLE
    ===================================================== */

    const roleName =
        user?.roleName ||
        user?.role?.roleName ||
        user?.role?.name ||
        user?.role ||
        user?.authority ||
        "";

    const normalizedRole = normalizeAction(roleName);

    const hasFullAccess = [
        "SUPER_ADMIN",
        "ADMIN",
    ].includes(normalizedRole);

    /* =====================================================
       PERMISSION CHECK
    ===================================================== */

    const hasPermission = (moduleName, actionName) => {
        if (hasFullAccess) return true;

        const requestedModule = normalizeModule(moduleName);
        const requestedAction = normalizeAction(actionName);

        if (!Array.isArray(permissions)) return false;

        return permissions.some((permission) => {
            const permissionModule = normalizeModule(
                permission?.moduleName ||
                permission?.module?.moduleName ||
                permission?.module?.name
            );

            if (permissionModule !== requestedModule) {
                return false;
            }

            if (
                permission?.active === false ||
                normalizeAction(permission?.status) === "INACTIVE"
            ) {
                return false;
            }

            if (Array.isArray(permission?.actions)) {
                const groupedPermission = permission.actions.some(
                    (action) => {
                        if (typeof action === "string") {
                            return normalizeAction(action) === requestedAction;
                        }

                        const actionName = normalizeAction(
                            action?.actionName ||
                            action?.action?.actionName ||
                            action?.name
                        );

                        return (
                            actionName === requestedAction &&
                            (
                                action?.allowed === true ||
                                action?.allowed === "true"
                            ) &&
                            action?.active !== false &&
                            normalizeAction(action?.status) !== "INACTIVE"
                        );
                    }
                );

                if (groupedPermission) return true;
            }

            const permissionAction = normalizeAction(
                permission?.actionName ||
                permission?.action?.actionName ||
                permission?.action?.name
            );

            return (
                permissionAction === requestedAction &&
                (
                    permission?.allowed === true ||
                    permission?.allowed === "true"
                )
            );
        });
    };

    const hasRequiredPermission = hasPermission(
        "Products",
        isEditMode ? "EDIT" : "CREATE"
    );

    /* =====================================================
       LOAD PERMISSIONS
    ===================================================== */

    useEffect(() => {
        if (authChecking || !isAuthenticated || hasFullAccess) {
            return;
        }

        if (!permissionsLoaded && !permissionLoading) {
            dispatch(getUserPermission());
        }
    }, [
        authChecking,
        isAuthenticated,
        hasFullAccess,
        permissionsLoaded,
        permissionLoading,
        dispatch,
    ]);

    /* =========================================================
   LOAD PRODUCT FOR EDIT
========================================================= */

    useEffect(() => {
        if (!id || authChecking || !isAuthenticated) {
            return;
        }

        let cancelled = false;

        const loadProduct = async () => {
            try {
                setIsProductLoading(true);

                const response = await dispatch(
                    fetchProductById(id)
                ).unwrap();

                if (cancelled) return;

                const product = getProductData(response);

                console.log("EDIT PRODUCT FULL RESPONSE:", response);
                console.log("EDIT PRODUCT DATA:", product);

                console.log("PRODUCT SIZES:", {
                    sizes: product?.sizes,
                    productSizes: product?.productSizes,
                    sizeIds: product?.sizeIds,
                });

                console.log("PRODUCT UNITS:", {
                    units: product?.units,
                    productUnits: product?.productUnits,
                    unitIds: product?.unitIds,
                });
                if (!product || typeof product !== "object") {
                    throw new Error("Product details not found");
                }

                const categoryId =
                    product.categoryId ??
                    product.category?.id ??
                    product.category?.categoryId ??
                    product.subCategory?.categoryId ??
                    product.subCategory?.category?.id ??
                    "";

                const subCategoryId =
                    product.subCategoryId ??
                    product.subCategory?.id ??
                    product.subCategory?.subCategoryId ??
                    "";

                const taxId =
                    product.taxId ??
                    product.taxMaster?.id ??
                    product.taxMaster?.taxId ??
                    "";

                const sizeItems = getRelationList(
                    product.sizes ??
                    product.productSizes ??
                    product.sizeIds
                );

                const unitItems = getRelationList(
                    product.units ??
                    product.productUnits ??
                    product.unitIds
                );

                const selectedSizeIds = [
                    ...new Set(
                        sizeItems
                            .map((item) => getRelationId(item, "size"))
                            .filter(Boolean)
                    ),
                ];

                const selectedUnitIds = [
                    ...new Set(
                        unitItems
                            .map((item) => getRelationId(item, "unit"))
                            .filter(Boolean)
                    ),
                ];

                // Resolve IDs to complete master objects.
                // Store only numeric IDs.
                // SearchMultiSelect expects selected IDs, not objects.
                const selectedSizes = selectedSizeIds;
                const selectedUnits = selectedUnitIds;

                setFormData({
                    productName: product.productName ?? "",
                    categoryId: categoryId != null
                        ? String(categoryId)
                        : "",
                    subCategoryId: subCategoryId != null
                        ? String(subCategoryId)
                        : "",
                    brand: product.brand ?? "",
                    hsnCode: product.hsnCode ?? "",
                    sellingPrice: product.sellingPrice ?? "",
                    purchasingPrice: product.purchasingPrice ?? "",
                    taxId: taxId != null ? String(taxId) : "",
                    minimumStock: product.minimumStock ?? "",
                    maximumStock: product.maximumStock ?? "",
                    sizes: selectedSizes,
                    units: selectedUnits,
                    status: product.status ?? "ACTIVE",
                    description: product.description ?? "",
                    image: null,
                });

                setExistingImageUrl(
                    product.imageUrl ??
                    product.imageURL ??
                    product.image ??
                    ""
                );
            } catch (error) {
                if (!cancelled) {
                    console.error("Load product error:", error);

                    toast.error(
                        typeof error === "string"
                            ? error
                            : error?.message || "Failed to load product"
                    );
                }
            } finally {
                if (!cancelled) {
                    setIsProductLoading(false);
                }
            }
        };

        loadProduct();

        return () => {
            cancelled = true;
        };
    }, [
        id,
        dispatch,
        authChecking,
        isAuthenticated,
    ]);

    /* =====================================================
       LOAD MASTER DATA
    ===================================================== */

    useEffect(() => {
        if (authChecking || !isAuthenticated) {
            return;
        }

        const requests = [
            categories.length === 0
                ? dispatch(fetchAllCategories())
                : null,

            subCategories.length === 0
                ? dispatch(fetchAllSubCategories())
                : null,

            sizes.length === 0
                ? dispatch(fetchAllSizes())
                : null,

            units.length === 0
                ? dispatch(fetchAllUnits())
                : null,

            taxMasters.length === 0
                ? dispatch(fetchAllTaxMasters())
                : null,
        ].filter(Boolean);

        Promise.allSettled(
            requests.map((request) => request.unwrap())
        ).then((results) => {
            results.forEach((result) => {
                if (result.status === "rejected") {
                    console.error(
                        "Product master data loading failed:",
                        result.reason
                    );
                }
            });
        });
    }, [
        dispatch,
        authChecking,
        isAuthenticated,
        categories.length,
        subCategories.length,
        sizes.length,
        units.length,
        taxMasters.length,
    ]);

    /* =====================================================
       CATEGORY OPTIONS
    ===================================================== */

    const categoryOptions = useMemo(() => {
        return categories
            .map((category) => {
                const id = category.id ?? category.categoryId;

                if (id == null) return null;

                return {
                    label:
                        category.categoryName ||
                        category.name ||
                        category.categoryCode ||
                        `Category ${id}`,
                    value: String(id),
                };
            })
            .filter(Boolean);
    }, [categories]);

    /* =====================================================
       FILTER SUBCATEGORIES BY CATEGORY
    ===================================================== */

    const filteredSubCategories = useMemo(() => {
        if (!formData.categoryId) return [];

        return subCategories.filter((item) => {
            const categoryId =
                item.categoryId ??
                item.category?.id ??
                item.category?.categoryId;

            return String(categoryId) === String(formData.categoryId);
        });
    }, [
        subCategories,
        formData.categoryId,
    ]);

    const subCategoryOptions = useMemo(() => {
        return filteredSubCategories
            .map((item) => {
                const id = item.id ?? item.subCategoryId;

                if (id == null) return null;

                return {
                    label:
                        item.subCategoryName ||
                        item.name ||
                        item.subCategoryCode ||
                        `Subcategory ${id}`,
                    value: String(id),
                };
            })
            .filter(Boolean);
    }, [filteredSubCategories]);

    /* =====================================================
       TAX OPTIONS
    ===================================================== */

    const taxOptions = useMemo(() => {
        return taxMasters
            .filter(
                (tax) =>
                    String(tax.status ?? "ACTIVE").toUpperCase() !== "INACTIVE"
            )
            .map((tax) => {
                const id = tax.id ?? tax.taxId;

                if (id == null) return null;

                return {
                    label: `${tax.taxName || tax.name || "Tax"}${tax.taxRate != null
                        ? ` (${tax.taxRate}%)`
                        : ""
                        }`,
                    value: String(id),
                };
            })
            .filter(Boolean);
    }, [taxMasters]);

    /* =====================================================
       STATUS OPTIONS
    ===================================================== */

    const statusOptions = useMemo(() => [
        { label: "Active", value: "ACTIVE" },
        { label: "Inactive", value: "INACTIVE" },
    ], []);

    /* =====================================================
       HANDLE FIELD CHANGE
    ===================================================== */

    const handleChange = (field, value) => {
        setFormData((previous) => {
            const updated = {
                ...previous,
                [field]: value,
            };

            if (field === "categoryId") {
                updated.subCategoryId = "";
            }

            return updated;
        });
    };

    /* =====================================================
       CATEGORY MODAL
    ===================================================== */

    const openCategoryModal = (categoryName = "") => {
        dispatch(openModal({
            type: "addCategory",
            data: {
                categoryName,
                targetField: "categoryId",
                selectAfterCreate: true,
            },
        }));
    };


    /* =====================================================
       SUBCATEGORY MODAL
    ===================================================== */

    const openSubCategoryModal = (subCategoryName = "") => {
        if (!formData.categoryId) {
            toast.error("Select a category first");
            return;
        }

        const selectedCategory = categories.find((item) => {
            const id = item.id ?? item.categoryId;

            return String(id) === String(formData.categoryId);
        });

        dispatch(openModal({
            type: "addSubCategory",
            data: {
                subCategoryName,
                categoryId: Number(formData.categoryId),
                category: selectedCategory,
                targetField: "subCategoryId",
                selectAfterCreate: true,
            },
        }));
    };

    /* =====================================================
       TAX MODAL
    ===================================================== */

    const openTaxModal = (taxName = "") => {
        dispatch(openModal({
            type: "addTaxMaster",
            data: {
                taxName,
                targetField: "taxId",
                selectAfterCreate: true,
            },
        }));
    };



    const handleClose = () => {
        confirmLeave(() => {
            if (onClose) {
                onClose();
            } else {
                navigate("/invoice/items")
            }
        });
    };

    /* =====================================================
       CONSUME CREATED CATEGORY
    ===================================================== */

    useEffect(() => {
        if (!createdCategorySelection) return;

        const createdId =
            createdCategorySelection.id ??
            createdCategorySelection.categoryId;

        if (createdId == null) return;

        setFormData((previous) => ({
            ...previous,
            categoryId: String(createdId),
            subCategoryId: "",
        }));

        dispatch(clearCreatedCategorySelection());
    }, [
        createdCategorySelection,
        dispatch,
    ]);

    /* =====================================================
       CONSUME CREATED SUBCATEGORY
    ===================================================== */

    useEffect(() => {
        if (!createdSubCategorySelection) return;

        const createdId =
            createdSubCategorySelection.id ??
            createdSubCategorySelection.subCategoryId;

        if (createdId == null) return;

        const createdCategoryId =
            createdSubCategorySelection.categoryId ??
            createdSubCategorySelection.category?.id ??
            createdSubCategorySelection.category?.categoryId;

        setFormData((previous) => ({
            ...previous,
            categoryId: createdCategoryId != null
                ? String(createdCategoryId)
                : previous.categoryId,
            subCategoryId: String(createdId),
        }));

        dispatch(clearCreatedSubCategorySelection());
    }, [
        createdSubCategorySelection,
        dispatch,
    ]);

    /* =====================================================
       CONSUME CREATED TAX
    ===================================================== */

    useEffect(() => {
        if (!createdTaxMasterSelection) return;

        const createdId =
            createdTaxMasterSelection.id ??
            createdTaxMasterSelection.taxId;

        if (createdId == null) return;

        setFormData((previous) => ({
            ...previous,
            taxId: String(createdId),
        }));

        dispatch(clearCreatedTaxMasterSelection());
    }, [
        createdTaxMasterSelection,
        dispatch,
    ]);

    /* =====================================================
       SIZE OPTIONS
    ===================================================== */

    const sizeOptions = useMemo(() => {
        return sizes
            .map((item) => ({
                ...item,
                id: Number(item.id ?? item.sizeId),
            }))
            .filter((item) => Number.isFinite(item.id) && item.id > 0);
    }, [sizes]);

    /* =====================================================
     UNITS OPTIONS
  ===================================================== */

    const unitOptions = useMemo(() => {
        return units
            .map((item) => ({
                ...item,
                id: Number(item.id ?? item.unitId),
            }))
            .filter((item) => Number.isFinite(item.id) && item.id > 0);
    }, [units]);

    /* =====================================================
       IMAGE CHANGE
    ===================================================== */

    const handleImageChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Select a valid image file");
            event.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size must not exceed 5 MB");
            event.target.value = "";
            return;
        }

        setFormData((previous) => ({
            ...previous,
            image: file,
        }));
    };

    /* =====================================================
       RESET FORM
    ===================================================== */

    const handleReset = () => {
        setFormData({
            ...initialFormData,
        });

        setSaveMode("close");
        setShowSaveOptions(false);

        dispatch(resetProductForm());

        dispatch(clearCreatedCategorySelection());
        dispatch(clearCreatedSubCategorySelection());
        dispatch(clearCreatedTaxMasterSelection());
    };

    /* =====================================================
       VALIDATION
    ===================================================== */

    const validateForm = () => {
        if (!formData.productName.trim()) {
            toast.error("Product name is required");
            return false;
        }

        if (!formData.categoryId) {
            toast.error("Select a category");
            return false;
        }

        if (!formData.subCategoryId) {
            toast.error("Select a subcategory");
            return false;
        }

        if (formData.sellingPrice !== "") {
            const sellingPrice = Number(formData.sellingPrice);

            if (!Number.isFinite(sellingPrice) || sellingPrice < 0) {
                toast.error("Enter a valid selling price");
                return false;
            }
        }

        if (formData.purchasingPrice !== "") {
            const purchasingPrice = Number(formData.purchasingPrice);

            if (!Number.isFinite(purchasingPrice) || purchasingPrice < 0) {
                toast.error("Enter a valid purchasing price");
                return false;
            }
        }

        const minimumStock =
            formData.minimumStock === ""
                ? null
                : Number(formData.minimumStock);

        if (
            minimumStock !== null &&
            (!Number.isFinite(minimumStock) || minimumStock < 0)
        ) {
            toast.error("Enter a valid minimum stock");
            return false;
        }

        const maximumStock =
            formData.maximumStock === ""
                ? null
                : Number(formData.maximumStock);

        if (
            maximumStock !== null &&
            (!Number.isFinite(maximumStock) || maximumStock < 0)
        ) {
            toast.error("Enter a valid maximum stock");
            return false;
        }

        if (
            minimumStock !== null &&
            maximumStock !== null &&
            maximumStock < minimumStock
        ) {
            toast.error(
                "Maximum stock must be greater than or equal to minimum stock"
            );
            return false;
        }

        if (
            formData.taxId &&
            (
                !Number.isInteger(Number(formData.taxId)) ||
                Number(formData.taxId) <= 0
            )
        ) {
            toast.error("Select a valid tax");
            return false;
        }

        if (!Array.isArray(formData.sizes)) {
            toast.error("Invalid size selection");
            return false;
        }

        if (!Array.isArray(formData.units)) {
            toast.error("Invalid unit selection");
            return false;
        }

        return true;
    };

    /* =========================================================
   SAVE / UPDATE PRODUCT
========================================================= */

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (loading || isProductLoading) return;

        if (!isAuthenticated) {
            toast.error("You are not authenticated");
            return;
        }

        if (!hasFullAccess && !permissionsLoaded) {
            toast.error("Permissions are still loading");
            return;
        }

        const requiredAction = isEditMode ? "EDIT" : "CREATE";

        if (!hasPermission("Products", requiredAction)) {
            toast.error(
                `You do not have permission to ${isEditMode ? "edit" : "create"} products`
            );
            return;
        }

        if (!validateForm()) return;

        try {
            const payload = {
                productName: formData.productName.trim(),

                categoryId: Number(formData.categoryId),
                subCategoryId: Number(formData.subCategoryId),

                brand: formData.brand.trim(),
                hsnCode: formData.hsnCode.trim(),

                sellingPrice:
                    formData.sellingPrice === ""
                        ? null
                        : Number(formData.sellingPrice),

                purchasingPrice:
                    formData.purchasingPrice === ""
                        ? null
                        : Number(formData.purchasingPrice),

                taxId: formData.taxId
                    ? Number(formData.taxId)
                    : null,

                minimumStock:
                    formData.minimumStock === ""
                        ? null
                        : Number(formData.minimumStock),

                maximumStock:
                    formData.maximumStock === ""
                        ? null
                        : Number(formData.maximumStock),

                sizeIds: formData.sizes.map(Number),

                unitIds: formData.units.map(Number),

                status: formData.status,
                description: formData.description.trim(),

                // null means no new image was selected.
                // buildProductFormData appends only an actual File.
                image: formData.image,
            };

            const response = isEditMode
                ? await dispatch(
                    updateProduct({
                        id,
                        data: payload,
                    })
                ).unwrap()
                : await dispatch(
                    createProduct(payload)
                ).unwrap();

            toast.success(
                response?.message ||
                (isEditMode
                    ? "Product updated successfully"
                    : "Product created successfully")
            );

            if (!isEditMode && saveMode === "new") {
                setFormData({ ...initialFormData });
                setExistingImageUrl("");

                dispatch(resetProductForm());
                dispatch(clearCreatedCategorySelection());
                dispatch(clearCreatedSubCategorySelection());
                dispatch(clearCreatedTaxMasterSelection());

                setSaveMode("close");
                return;
            }

            dispatch(resetProductForm());

            dispatch(clearCreatedCategorySelection());
            dispatch(clearCreatedSubCategorySelection());
            dispatch(clearCreatedTaxMasterSelection());

            navigate("/items");

        } catch (error) {
            console.error(
                isEditMode ? "Product update error:" : "Product creation error:",
                error
            );

            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    `Failed to ${isEditMode ? "update" : "create"} product`
            );
        }
    };

    /* =====================================================
       ESCAPE KEY
    ===================================================== */

    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === "Escape") {
                setShowSaveOptions(false);
            }
        };

        window.addEventListener("keydown", handleEscape);

        return () => {
            window.removeEventListener("keydown", handleEscape);
        };
    }, []);

    /* =====================================================
       LOADING
    ===================================================== */

    if (authChecking) {
        return (
            <div className="flex h-full items-center justify-center bg-gray-50">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 size={20} className="animate-spin" />
                    Checking authentication...
                </div>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    if (
        !hasFullAccess &&
        (permissionLoading || !permissionsLoaded)
    ) {
        return (
            <div className="flex h-full items-center justify-center bg-gray-50">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 size={20} className="animate-spin" />
                    Loading permissions...
                </div>
            </div>
        );
    }

    /* =====================================================
       ACCESS DENIED
    ===================================================== */

    if (!hasRequiredPermission) {
        return (
            <div className="
                flex h-full items-center justify-center
                rounded-xl bg-white p-8
            ">
                <div className="text-center">
                    <div className="
                        mx-auto mb-3 flex h-12 w-12
                        items-center justify-center rounded-full
                        bg-red-50 text-lg font-semibold text-red-500
                    ">
                        !
                    </div>

                    <h2 className="text-lg font-semibold text-gray-800">
                        Access Denied
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        You do not have permission to {isEditMode ? "edit" : "create"} products.
                    </p>

                    <button
                        type="button"
                        onClick={handleClose}
                        className="
                            mt-5 rounded-lg bg-blue-600
                            px-5 py-2 text-sm font-medium
                            text-white hover:bg-blue-700
                        "
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    if (isEditMode && isProductLoading) {
        return (
            <div className="flex h-full items-center justify-center bg-gray-50">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 size={20} className="animate-spin" />
                    Loading product details...
                </div>
            </div>
        );
    }

    /* =====================================================
       RENDER
    ===================================================== */

    return (
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
                            {isEditMode ? "Edit Product" : "Create Product"}
                        </h2>

                        <p className="mt-0.5 text-xs text-gray-400">
                            {isEditMode
                                ? "Update and manage your product information"
                                : "Create and configure your product information"}
                        </p>
                    </div>
                </div>

                <div className="
                    hidden items-center gap-2 rounded-lg
                    bg-blue-50 px-3 py-2 sm:flex
                ">
                    <Package size={16} className="text-[#408DFB]" />

                    <span className="text-xs font-medium text-[#408DFB]">
                        Product
                    </span>
                </div>
            </div>

            {/* FORM */}

            <form
                onSubmit={handleSubmit}
                className="
                    flex min-h-0 flex-1 flex-col
                    overflow-hidden rounded-xl
                    bg-white shadow-sm
                "
            >
                <div className="flex-1 overflow-y-auto p-5">

                    {/* PRODUCT INFORMATION */}

                    <section className="mb-7">
                        <SectionHeading
                            icon={Package}
                            title="Product Information"
                            description="Enter the product name and classification details"
                        />

                        <div className="
                            grid grid-cols-1 gap-5
                            md:grid-cols-2 lg:grid-cols-3
                        ">
                            <FormField label="Product Name" required>
                                <TextInput
                                    value={formData.productName}
                                    onChange={(event) =>
                                        handleChange("productName", event.target.value)
                                    }
                                    placeholder="Enter product name"
                                    maxLength={150}
                                />
                            </FormField>

                            <FormField label="Brand">
                                <TextInput
                                    value={formData.brand}
                                    onChange={(event) =>
                                        handleChange("brand", event.target.value)
                                    }
                                    placeholder="Enter brand"
                                    maxLength={100}
                                />
                            </FormField>

                            <FormField label="HSN Code">
                                <TextInput
                                    value={formData.hsnCode}
                                    onChange={(event) =>
                                        handleChange("hsnCode", event.target.value)
                                    }
                                    placeholder="Enter HSN code"
                                    maxLength={20}
                                />
                            </FormField>

                            <FormField label="Category" required>
                                <SearchableCreateSelect
                                    value={formData.categoryId}
                                    onChange={(value) =>
                                        handleChange("categoryId", value)
                                    }
                                    options={categoryOptions}
                                    placeholder="Select category"
                                    searchPlaceholder="Search category..."
                                    addLabel="Add Category"
                                    onAdd={openCategoryModal}
                                />
                            </FormField>

                            <FormField label="Subcategory" required>
                                <SearchableCreateSelect
                                    value={formData.subCategoryId}
                                    onChange={(value) =>
                                        handleChange("subCategoryId", value)
                                    }
                                    options={subCategoryOptions}
                                    placeholder={
                                        formData.categoryId
                                            ? "Select subcategory"
                                            : "Select category first"
                                    }
                                    searchPlaceholder="Search subcategory..."
                                    addLabel="Add Subcategory"
                                    disabled={!formData.categoryId}
                                    onAdd={openSubCategoryModal}
                                />
                            </FormField>

                            <FormField label="Tax">
                                <SearchableCreateSelect
                                    value={formData.taxId}
                                    onChange={(value) =>
                                        handleChange("taxId", value)
                                    }
                                    options={taxOptions}
                                    placeholder="Select tax"
                                    searchPlaceholder="Search tax..."
                                    addLabel="Add Tax"
                                    onAdd={openTaxModal}
                                />
                            </FormField>
                        </div>
                    </section>

                    <div className="my-6 border-t border-gray-100" />

                    {/* PRICING AND STOCK */}

                    <section className="mb-7">
                        <SectionHeading
                            icon={Tags}
                            title="Pricing and Stock"
                            description="Configure purchasing price, selling price and stock limits"
                        />

                        <div className="
                            grid grid-cols-1 gap-5
                            md:grid-cols-2 lg:grid-cols-3
                        ">
                            <FormField label="Selling Price">
                                <TextInput
                                    type="number"
                                    value={formData.sellingPrice}
                                    onChange={(event) =>
                                        handleChange("sellingPrice", event.target.value)
                                    }
                                    placeholder="Enter selling price"
                                    min="0"
                                    step="0.01"
                                />
                            </FormField>

                            <FormField label="Purchasing Price">
                                <TextInput
                                    type="number"
                                    value={formData.purchasingPrice}
                                    onChange={(event) =>
                                        handleChange("purchasingPrice", event.target.value)
                                    }
                                    placeholder="Enter purchasing price"
                                    min="0"
                                    step="0.01"
                                />
                            </FormField>

                            <FormField label="Minimum Stock">
                                <TextInput
                                    type="number"
                                    value={formData.minimumStock}
                                    onChange={(event) =>
                                        handleChange("minimumStock", event.target.value)
                                    }
                                    placeholder="Enter minimum stock"
                                    min="0"
                                    step="1"
                                />
                            </FormField>

                            <FormField label="Maximum Stock">
                                <TextInput
                                    type="number"
                                    value={formData.maximumStock}
                                    onChange={(event) =>
                                        handleChange("maximumStock", event.target.value)
                                    }
                                    placeholder="Enter maximum stock"
                                    min="0"
                                    step="1"
                                />
                            </FormField>

                            <FormField label="Product Status">
                                <CustomSelect
                                    value={formData.status}
                                    onChange={(value) =>
                                        handleChange("status", value)
                                    }
                                    options={statusOptions}
                                    placeholder="Select status"
                                />
                            </FormField>
                        </div>
                    </section>

                    <div className="my-6 border-t border-gray-100" />

                    {/* SIZE AND UNIT */}

                    <section className="mb-7">
                        <SectionHeading
                            icon={Boxes}
                            title="Sizes and Units"
                            description="Select the sizes and units available for this product"
                        />

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                            {/* SIZES */}

                            <FormField label="Sizes">
                                <SearchMultiSelect
                                    label="Sizes"
                                    selected={formData.sizes}
                                    options={sizeOptions}
                                    getOptionKey={(item) => item.id}
                                    getOptionLabel={(item) =>
                                        `${item.sizeName || item.name || "Size"}${item.sizeCode ? ` (${item.sizeCode})` : ""
                                        }`
                                    }
                                    onAdd={(sizeId) => {
                                        setFormData((previous) => {
                                            if (
                                                previous.sizes.some(
                                                    (id) => Number(id) === Number(sizeId)
                                                )
                                            ) {
                                                return previous;
                                            }

                                            return {
                                                ...previous,
                                                sizes: [...previous.sizes, Number(sizeId)],
                                            };
                                        });
                                    }}
                                    onRemove={(sizeId) => {
                                        setFormData((previous) => ({
                                            ...previous,
                                            sizes: previous.sizes.filter(
                                                (id) => Number(id) !== Number(sizeId)
                                            ),
                                        }));
                                    }}
                                    placeholder="Search and select sizes"
                                    addLabel="Add Size"
                                    onCreate={(sizeName) => {
                                        dispatch(
                                            openModal({
                                                type: "addSize",
                                                data: {
                                                    sizeName,
                                                    selectAfterCreate: true,
                                                },
                                            })
                                        );
                                    }}
                                />
                            </FormField>

                            {/* UNITS */}

                            <FormField label="Units">
                                <SearchMultiSelect
                                    label="Units"
                                    selected={formData.units}
                                    options={unitOptions}
                                    getOptionKey={(item) => item.id}
                                    getOptionLabel={(item) =>
                                        `${item.unitName || item.name || "Unit"}${item.unitCode ? ` (${item.unitCode})` : ""
                                        }`
                                    }
                                    onAdd={(unitId) => {
                                        setFormData((previous) => {
                                            if (
                                                previous.units.some(
                                                    (id) => Number(id) === Number(unitId)
                                                )
                                            ) {
                                                return previous;
                                            }

                                            return {
                                                ...previous,
                                                units: [...previous.units, Number(unitId)],
                                            };
                                        });
                                    }}
                                    onRemove={(unitId) => {
                                        setFormData((previous) => ({
                                            ...previous,
                                            units: previous.units.filter(
                                                (id) => Number(id) !== Number(unitId)
                                            ),
                                        }));
                                    }}
                                    placeholder="Search and select units"
                                    addLabel="Add Unit"
                                    onCreate={(unitName) => {
                                        dispatch(
                                            openModal({
                                                type: "addUnit",
                                                data: {
                                                    unitName,
                                                    selectAfterCreate: true,
                                                },
                                            })
                                        );
                                    }}
                                />
                            </FormField>

                        </div>
                    </section>


                    <div className="my-6 border-t border-gray-100" />

                    {/* PRODUCT IMAGE */}

                    <section>
                        <SectionHeading
                            icon={ImagePlus}
                            title="Product Image"
                            description="Upload an image for this product"
                        />

                        <FormField label="Upload Image">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="
                                    block w-full rounded-lg border
                                    border-gray-200 bg-white text-sm
                                    text-gray-600 file:mr-4
                                    file:border-0 file:bg-blue-50
                                    file:px-4 file:py-2.5
                                    file:text-sm file:font-medium
                                    file:text-[#408DFB]
                                    hover:file:bg-blue-100
                                "
                            />

                            {existingImageUrl && !formData.image && (
                                <div className="mt-3">
                                    <p className="mb-2 text-xs font-medium text-gray-500">
                                        Current Product Image
                                    </p>

                                    <img
                                        src={existingImageUrl}
                                        alt="Current product"
                                        className="
                h-24 w-24 rounded-lg border
                border-gray-200 object-cover
            "
                                    />
                                </div>
                            )}


                            {formData.image && (
                                <p className="mt-2 text-xs text-gray-500">
                                    New image selected: {formData.image.name}
                                </p>
                            )}
                        </FormField>
                    </section>
                </div>

                {/* FOOTER */}

                <div className="
                    flex shrink-0 flex-wrap items-center
                    justify-between gap-3 border-t
                    border-gray-100 bg-white px-5 py-3
                ">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={loading}
                        className="
                            rounded-lg border border-gray-200
                            px-4 py-2 text-sm font-medium
                            text-gray-600 transition hover:bg-gray-50
                            disabled:opacity-50
                        "
                    >
                        Cancel
                    </button>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleReset}
                            disabled={loading}
                            className="
                                flex items-center gap-2 rounded-lg
                                border border-gray-200 px-4 py-2
                                text-sm font-medium text-gray-600
                                transition hover:bg-gray-50
                                disabled:opacity-50
                            "
                        >
                            <RotateCcw size={15} />
                            Reset
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            onClick={() => setSaveMode("close")}
                            className="
                                flex items-center gap-2 rounded-lg
                                bg-[#408DFB] px-5 py-2 text-sm
                                font-medium text-white transition
                                hover:bg-blue-600 disabled:cursor-not-allowed
                                disabled:opacity-60
                            "
                        >
                            {loading ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Save size={16} />
                            )}

                            {loading
                                ? (isEditMode ? "Updating..." : "Saving...")
                                : (isEditMode ? "Update" : "Save")}
                        </button>
                        {!isEditMode && (

                            <div className="relative">
                                <button
                                    type="button"
                                    disabled={loading}
                                    onClick={() =>
                                        setShowSaveOptions((previous) => !previous)
                                    }
                                    className="
                                    flex h-9 items-center justify-center
                                    rounded-lg border border-gray-200
                                    px-2 text-gray-600 transition
                                    hover:bg-gray-50 disabled:opacity-50
                                "
                                >
                                    <ChevronDown size={17} />
                                </button>

                                {showSaveOptions && (
                                    <div className="
                                    absolute bottom-11 right-0 z-20
                                    w-44 overflow-hidden rounded-lg
                                    border border-gray-100 bg-white
                                    py-1 shadow-lg
                                ">
                                        <button
                                            type="submit"
                                            onClick={() => {
                                                setSaveMode("new");
                                                setShowSaveOptions(false);
                                            }}
                                            className="
                                            w-full px-4 py-2.5 text-left
                                            text-sm text-gray-600
                                            transition hover:bg-blue-50
                                            hover:text-[#408DFB]
                                        "
                                        >
                                            Save & New
                                        </button>

                                        <button
                                            type="submit"
                                            onClick={() => {
                                                setSaveMode("close");
                                                setShowSaveOptions(false);
                                            }}
                                            className="
                                            w-full px-4 py-2.5 text-left
                                            text-sm text-gray-600
                                            transition hover:bg-blue-50
                                            hover:text-[#408DFB]
                                        "
                                        >
                                            Save & Close
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </form>

            <LeaveConfirmationModal
                show={showLeaveConfirmation}
                title="Leave products?"
                message="Are you sure you want to leave this products page?"
                stayText="Stay Here"
                leaveText="Leave"
                onStay={handleStay}
                onLeave={handleLeave}
            />
        </div>
    );
};

export default ProductCreateNew;
