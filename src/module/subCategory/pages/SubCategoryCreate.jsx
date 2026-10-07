import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ChartColumnStackedIcon } from "lucide-react";
import toast from "react-hot-toast";

import { closeModal } from "../../ui/uiSlice";

import {
    fetchAllCategories,
} from "../../category/thunks/categoryThunks";

import {
    resetSubCategoryForm,
    setSubCategoryField,
} from "../slices/subCategorySlice";

import {
    createSubCategory,
    updateSubCategory,
} from "../thunks/subCategoryThunks";

import {
    getUserPermission,
} from "../../menuPermission/thunks/menuPermissionThunks";

export default function SubCategoryCreate() {

    const dispatch = useDispatch();

    // =========================================================
    // REDUX
    // =========================================================

    const { modal } = useSelector(
        (state) => state.ui
    );

    const {
        subCategory,
        loading,
    } = useSelector(
        (state) => state.subCategory
    );

    const {
        categories = [],
    } = useSelector(
        (state) => state.category
    );

    // =========================================================
    // AUTH
    // =========================================================

    const user = useSelector(
        (state) => state.auth?.user
    );

    const isAuthenticated = useSelector(
        (state) =>
            state.auth?.isAuthenticated === true
    );

    const authChecking = useSelector(
        (state) =>
            state.auth?.authChecking === true
    );

    // =========================================================
    // USER PERMISSIONS
    // =========================================================

    const permissions = useSelector(
        (state) =>
            state.menuPermission?.userPermissions || []
    );

    const permissionLoading = useSelector(
        (state) =>
            state.menuPermission?.loading === true
    );

    const permissionsLoaded = useSelector(
        (state) =>
            state.menuPermission?.userPermissionsLoaded === true
    );

    // =========================================================
    // ADD / EDIT MODE
    // =========================================================

    const isEdit =
        modal.type === "editSubCategory";

    const isOpen =
        modal.open &&
        (
            modal.type === "addSubCategory" ||
            modal.type === "editSubCategory"
        );

    // =========================================================
    // LOCAL STATE
    // =========================================================

    const [errors, setErrors] =
        useState({});

    const [activeTab, setActiveTab] =
        useState("subcategory");

    // =========================================================
    // FORM
    // =========================================================

    const form = subCategory || {
        id: null,
        categoryId: null,
        name: "",
        description: "",
        displayOrder: 1,
        status: "ACTIVE",
    };

    // =========================================================
    // NORMALIZE
    // =========================================================

    const normalizeModule = (value) =>
        String(value ?? "")
            .trim()
            .toLowerCase();

    const normalizeAction = (value) =>
        String(value ?? "")
            .trim()
            .toUpperCase();

    // =========================================================
    // ROLE
    // =========================================================

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
        isSuperAdmin || isAdmin;

    // =========================================================
    // PERMISSION CHECK
    // =========================================================

    const hasPermission = (
        moduleName,
        actionName
    ) => {

        // -----------------------------------------------------
        // ADMIN / SUPER ADMIN
        // -----------------------------------------------------

        if (hasFullAccess) {
            return true;
        }

        // -----------------------------------------------------
        // NORMALIZE REQUEST
        // -----------------------------------------------------

        const requestedModule =
            normalizeModule(moduleName);

        const requestedAction =
            normalizeAction(actionName);

        // -----------------------------------------------------
        // PERMISSION LIST
        // -----------------------------------------------------

        if (!Array.isArray(permissions)) {
            return false;
        }

        // -----------------------------------------------------
        // FIND PERMISSION
        // -----------------------------------------------------

        return permissions.some(
            (permission) => {

                const permissionModule =
                    normalizeModule(
                        permission?.moduleName ||
                        permission?.module?.moduleName ||
                        permission?.module?.name ||
                        ""
                    );

                // -------------------------------------------------
                // MODULE MUST MATCH
                // -------------------------------------------------

                if (
                    permissionModule !==
                    requestedModule
                ) {
                    return false;
                }

                // -------------------------------------------------
                // INACTIVE PERMISSION
                // -------------------------------------------------

                if (
                    permission?.active === false ||
                    normalizeAction(
                        permission?.status
                    ) === "INACTIVE"
                ) {
                    return false;
                }

                // -------------------------------------------------
                // DIRECT ACTION
                // -------------------------------------------------

                const permissionAction =
                    normalizeAction(
                        permission?.actionName ||
                        permission?.action?.actionName ||
                        permission?.action?.name ||
                        ""
                    );

                if (
                    permissionAction ===
                    requestedAction
                ) {

                    return (
                        permission?.allowed === true ||
                        permission?.allowed === "true"
                    );
                }

                // -------------------------------------------------
                // GROUPED ACTIONS
                // -------------------------------------------------

                if (
                    Array.isArray(
                        permission?.actions
                    )
                ) {

                    return permission.actions.some(
                        (action) => {

                            // -------------------------------------
                            // STRING ACTION
                            // -------------------------------------

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

                            // -------------------------------------
                            // OBJECT ACTION
                            // -------------------------------------

                            const actionName =
                                normalizeAction(
                                    action?.actionName ||
                                    action?.action?.actionName ||
                                    action?.name ||
                                    ""
                                );

                            return (
                                actionName ===
                                requestedAction &&
                                (
                                    action?.allowed ===
                                    true ||
                                    action?.allowed ===
                                    "true"
                                ) &&
                                action?.active !== false &&
                                normalizeAction(
                                    action?.status
                                ) !==
                                "INACTIVE"
                            );
                        }
                    );
                }

                return false;
            }
        );
    };

    // =========================================================
    // CREATE / EDIT PERMISSION
    // =========================================================

    const requiredAction =
        isEdit
            ? "EDIT"
            : "CREATE";

    const hasRequiredPermission =
        hasPermission(
            "SubCategories",
            requiredAction
        );

    // =========================================================
    // LOAD PERMISSIONS IF NECESSARY
    // =========================================================

    useEffect(() => {

        if (!isOpen) {
            return;
        }

        if (authChecking) {
            return;
        }

        if (!isAuthenticated) {
            return;
        }

        if (hasFullAccess) {
            return;
        }

        // -----------------------------------------------------
        // Load permissions when they are not loaded.
        // -----------------------------------------------------

        if (
            !permissionsLoaded &&
            !permissionLoading
        ) {

            dispatch(
                getUserPermission()
            );
        }

    }, [
        isOpen,
        authChecking,
        isAuthenticated,
        hasFullAccess,
        permissionsLoaded,
        permissionLoading,
        dispatch,
    ]);

    // =========================================================
    // LOAD CATEGORIES
    // =========================================================

    useEffect(() => {

        if (!isOpen) {
            return;
        }

        if (authChecking) {
            return;
        }

        if (!isAuthenticated) {
            return;
        }

        dispatch(
            fetchAllCategories()
        );

    }, [
        isOpen,
        authChecking,
        isAuthenticated,
        dispatch,
    ]);

    // =========================================================
    // ESCAPE KEY
    // =========================================================

    useEffect(() => {

        if (!isOpen) {
            return;
        }

        const handleEscape = (event) => {

            if (
                event.key === "Escape" &&
                !loading
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

    // =========================================================
    // LOAD EXISTING DATA FOR EDIT
    // =========================================================

    useEffect(() => {

        if (
            modal.open &&
            modal.type === "editSubCategory" &&
            modal.data
        ) {

            const existingSubCategory =
                modal.data;

            dispatch(
                setSubCategoryField({
                    field: "id",
                    value:
                        existingSubCategory.id ??
                        null,
                })
            );

            dispatch(
                setSubCategoryField({
                    field: "categoryId",
                    value:
                        existingSubCategory.categoryId ??
                        null,
                })
            );

            dispatch(
                setSubCategoryField({
                    field: "name",
                    value:
                        existingSubCategory.name ??
                        "",
                })
            );

            dispatch(
                setSubCategoryField({
                    field: "description",
                    value:
                        existingSubCategory.description ??
                        "",
                })
            );

            dispatch(
                setSubCategoryField({
                    field: "displayOrder",
                    value:
                        existingSubCategory.displayOrder ??
                        1,
                })
            );

            dispatch(
                setSubCategoryField({
                    field: "status",
                    value:
                        existingSubCategory.status ??
                        "ACTIVE",
                })
            );
        }

    }, [
        modal.open,
        modal.type,
        modal.data,
        dispatch,
    ]);

    // =========================================================
    // CHANGE FIELD
    // =========================================================

    const handleChange = (
        field,
        value
    ) => {

        dispatch(
            setSubCategoryField({
                field,
                value,
            })
        );

        setErrors(
            (previous) => {

                if (!previous[field]) {
                    return previous;
                }

                const updated = {
                    ...previous,
                };

                delete updated[field];

                return updated;
            }
        );
    };

    // =========================================================
    // CLOSE MODAL
    // =========================================================

    const handleClose = () => {

        dispatch(
            closeModal()
        );

        dispatch(
            resetSubCategoryForm()
        );

        setErrors({});
        setActiveTab("subcategory");
    };

    // =========================================================
    // VALIDATION
    // =========================================================

    const validateSubCategory = () => {

        const newErrors = {};

        if (!form.categoryId) {

            newErrors.categoryId =
                "Category is required";
        }

        if (
            !String(
                form.name ?? ""
            ).trim()
        ) {

            newErrors.name =
                "Sub Category Name is required";
        }

        if (
            form.displayOrder === "" ||
            form.displayOrder === null ||
            form.displayOrder === undefined
        ) {

            newErrors.displayOrder =
                "Display Order is required";

        } else if (
            Number(form.displayOrder) < 1
        ) {

            newErrors.displayOrder =
                "Display Order must be at least 1";
        }

        setErrors(newErrors);

        if (
            newErrors.categoryId ||
            newErrors.name ||
            newErrors.displayOrder
        ) {

            setActiveTab(
                "subcategory"
            );

            toast.error(
                "Please complete Sub Category Information"
            );

            return false;
        }

        return true;
    };

    // =========================================================
    // SAVE
    // CREATE / UPDATE
    // =========================================================

    const handleSave = async (e) => {

        e.preventDefault();

        // -----------------------------------------------------
        // Prevent saving before permissions finish loading.
        // -----------------------------------------------------

        if (
            !hasFullAccess &&
            !permissionsLoaded
        ) {

            toast.error(
                "Permissions are still loading. Please try again."
            );

            return;
        }

        // -----------------------------------------------------
        // Permission check AGAIN before API call
        // -----------------------------------------------------

        if (!hasRequiredPermission) {

            toast.error(
                isEdit
                    ? "You do not have permission to edit sub categories."
                    : "You do not have permission to create sub categories."
            );

            return;
        }

        // -----------------------------------------------------
        // VALIDATION
        // -----------------------------------------------------

        if (!validateSubCategory()) {
            return;
        }

        // -----------------------------------------------------
        // DISPLAY ORDER
        // -----------------------------------------------------

        const displayOrder =
            Number(
                form.displayOrder
            );

        if (
            !Number.isInteger(
                displayOrder
            ) ||
            displayOrder < 1
        ) {

            toast.error(
                "Display order must be a valid number greater than 0"
            );

            return;
        }

        // -----------------------------------------------------
        // PAYLOAD
        // -----------------------------------------------------

        const payload = {

            categoryId:
                Number(
                    form.categoryId
                ),

            name:
                form.name.trim(),

            description:
                form.description?.trim() ||
                "",

            displayOrder,

            status:
                form.status ||
                "ACTIVE",
        };

        try {

            // =================================================
            // EDIT
            // =================================================

            if (isEdit) {

                const subCategoryId =
                    form.id ??
                    modal.data?.id;

                if (!subCategoryId) {

                    toast.error(
                        "Sub category ID is missing"
                    );

                    return;
                }

                await dispatch(
                    updateSubCategory({
                        id: subCategoryId,
                        data: payload,
                    })
                ).unwrap();

                toast.success(
                    "Sub category updated successfully"
                );

            }

            // =================================================
            // CREATE
            // =================================================

            else {

                await dispatch(
                    createSubCategory(
                        payload
                    )
                ).unwrap();

                toast.success(
                    "Sub category created successfully"
                );
            }

            // =================================================
            // CLOSE + RESET
            // =================================================

            dispatch(
                closeModal()
            );

            dispatch(
                resetSubCategoryForm()
            );

            setErrors({});
            setActiveTab("subcategory");

        } catch (error) {

            console.error(
                "Sub category save error:",
                error
            );

            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    error?.response?.data?.message ||
                    (
                        isEdit
                            ? "Failed to update sub category"
                            : "Failed to create sub category"
                    )
            );
        }
    };

    // =========================================================
    // DO NOT RENDER
    // =========================================================

    if (!isOpen) {
        return null;
    }

    // =========================================================
    // PERMISSION LOADING
    // Same structure as CategoryCreate
    // =========================================================

    if (
        !hasFullAccess &&
        (
            authChecking ||
            permissionLoading ||
            !permissionsLoaded
        )
    ) {

        return (
            <div
                className="
                    w-[950px]
                    max-w-[95vw]
                    min-h-[300px]

                    bg-white
                    rounded-xl
                    shadow-2xl

                    flex
                    items-center
                    justify-center

                    p-8
                "
            >

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

                    <p
                        className="
                            text-sm
                            font-medium
                            text-gray-600
                        "
                    >
                        Loading permissions...
                    </p>

                </div>

            </div>
        );
    }

    // =========================================================
    // UNAUTHORIZED
    // Same structure as CategoryCreate
    // =========================================================

    if (!hasRequiredPermission) {

        return (
            <div
                className="
                    w-[950px]
                    max-w-[95vw]
                    min-h-[300px]

                    bg-white
                    rounded-xl
                    shadow-2xl

                    overflow-hidden

                    flex
                    flex-col
                "
            >

                {/* HEADER */}

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

                                bg-red-50

                                flex
                                items-center
                                justify-center
                            "
                        >

                            <ChartColumnStackedIcon
                                size={20}
                                className="text-red-500"
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
                                Access Denied
                            </h2>

                            <p
                                className="
                                    text-xs
                                    text-gray-500
                                    mt-0.5
                                "
                            >
                                Sub category access restricted
                            </p>

                        </div>

                    </div>

                </div>

                {/* ACCESS DENIED BODY */}

                <div
                    className="
                        flex-1

                        flex
                        items-center
                        justify-center

                        px-6
                        py-10
                    "
                >

                    <div className="text-center">

                        <div
                            className="
                                w-12
                                h-12

                                mx-auto
                                mb-3

                                rounded-full

                                bg-red-50

                                flex
                                items-center
                                justify-center
                            "
                        >

                            <span
                                className="
                                    text-red-500
                                    text-lg
                                    font-semibold
                                "
                            >
                                !
                            </span>

                        </div>

                        <h2
                            className="
                                text-lg
                                font-semibold
                                text-gray-800
                            "
                        >
                            Access Denied
                        </h2>

                        <p
                            className="
                                mt-1
                                text-sm
                                text-gray-500
                            "
                        >
                            {isEdit
                                ? "You do not have permission to edit sub categories."
                                : "You do not have permission to create sub categories."
                            }
                        </p>

                    </div>

                </div>

                {/* FOOTER */}

                <div
                    className="
                        shrink-0
                        h-[68px]

                        flex
                        items-center
                        justify-end

                        px-6

                        border-t
                        border-gray-200

                        bg-white
                    "
                >

                    <button
                        type="button"
                        onClick={handleClose}
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
                        "
                    >
                        Close
                    </button>

                </div>

            </div>
        );
    }

    // =========================================================
    // TABS
    // =========================================================

    const tabs = [
        {
            id: "subcategory",
            label: "Sub Category Information",
        },
        {
            id: "settings",
            label: "Settings",
        },
    ];

    // =========================================================
    // CLASSES
    // =========================================================

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

    // =========================================================
    // UI
    // =========================================================

    return (
        <div
            className="
                w-[950px]
                max-w-[95vw]

                h-[700px]
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

                        <ChartColumnStackedIcon
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
                                ? "Edit Sub Category"
                                : "New Sub Category"}
                        </h2>

                        <p
                            className="
                                text-xs
                                text-gray-500
                                mt-0.5
                            "
                        >
                            {isEdit
                                ? "Update sub category information"
                                : "Create a new sub category"}
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

                        const active =
                            activeTab === tab.id;

                        const hasError =
                            tab.id === "subcategory" &&
                            (
                                errors.categoryId ||
                                errors.name ||
                                errors.displayOrder
                            );

                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() =>
                                    setActiveTab(tab.id)
                                }
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

                                <span
                                    className="
                                        flex
                                        items-center
                                        gap-1.5
                                    "
                                >

                                    {tab.label}

                                    {hasError && (
                                        <span
                                            className="
                                                w-1.5
                                                h-1.5

                                                rounded-full

                                                bg-red-500
                                            "
                                        />
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
                        SUB CATEGORY INFORMATION
                    ================================================= */}

                    {activeTab === "subcategory" && (

                        <div>

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
                                        Sub Category Information
                                    </h3>

                                    <p
                                        className="
                                            text-xs
                                            text-gray-500
                                            mt-1
                                        "
                                    >
                                        Configure the basic sub category
                                        information.
                                    </p>

                                </div>

                                <div
                                    className="
                                        flex
                                        items-center
                                        gap-3
                                        shrink-0
                                    "
                                >

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

                                    <label
                                        className={labelClass}
                                    >
                                        Category

                                        <span
                                            className="
                                                text-red-500
                                                ml-1
                                            "
                                        >
                                            *
                                        </span>

                                    </label>

                                    <select
                                        value={
                                            form.categoryId ?? ""
                                        }
                                        onChange={(e) =>
                                            handleChange(
                                                "categoryId",
                                                e.target.value
                                                    ? Number(
                                                        e.target.value
                                                    )
                                                    : null
                                            )
                                        }
                                        className={inputClass}
                                        disabled={loading}
                                    >

                                        <option value="">
                                            Select Category
                                        </option>

                                        {categories
                                            .filter(
                                                (category) =>
                                                    category.status ===
                                                    "ACTIVE"
                                            )
                                            .sort(
                                                (a, b) =>
                                                    (a.displayOrder ?? 0) -
                                                    (b.displayOrder ?? 0)
                                            )
                                            .map(
                                                (category) => (
                                                    <option
                                                        key={
                                                            category.id
                                                        }
                                                        value={
                                                            category.id
                                                        }
                                                    >
                                                        {
                                                            category.categoryName ||
                                                            category.name
                                                        }
                                                    </option>
                                                )
                                            )}

                                    </select>

                                    {errors.categoryId && (
                                        <p
                                            className="
                                                text-xs
                                                text-red-500
                                                mt-1
                                            "
                                        >
                                            {
                                                errors.categoryId
                                            }
                                        </p>
                                    )}

                                </div>

                                {/* SUB CATEGORY NAME */}

                                <div>

                                    <label
                                        className={labelClass}
                                    >
                                        Sub Category Name

                                        <span
                                            className="
                                                text-red-500
                                                ml-1
                                            "
                                        >
                                            *
                                        </span>

                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            form.name ?? ""
                                        }
                                        onChange={(e) =>
                                            handleChange(
                                                "name",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter sub category name"
                                        className={inputClass}
                                        disabled={loading}
                                    />

                                    {errors.name && (
                                        <p
                                            className="
                                                text-xs
                                                text-red-500
                                                mt-1
                                            "
                                        >
                                            {errors.name}
                                        </p>
                                    )}

                                </div>

                                {/* DESCRIPTION */}

                                <div className="col-span-2">

                                    <label
                                        className={labelClass}
                                    >
                                        Description
                                    </label>

                                    <textarea
                                        rows={5}
                                        value={
                                            form.description ?? ""
                                        }
                                        onChange={(e) =>
                                            handleChange(
                                                "description",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter sub category description"
                                        className="
                                            w-full
                                            px-3
                                            py-3

                                            border
                                            border-gray-300
                                            rounded-md

                                            text-sm
                                            text-gray-700

                                            bg-white

                                            outline-none
                                            resize-none
                                            transition

                                            focus:border-blue-500
                                            focus:ring-1
                                            focus:ring-blue-500

                                            disabled:bg-gray-100
                                            disabled:text-gray-500
                                        "
                                        disabled={loading}
                                    />

                                </div>

                                {/* DISPLAY ORDER */}

                                <div>

                                    <label
                                        className={labelClass}
                                    >
                                        Display Order

                                        <span
                                            className="
                                                text-red-500
                                                ml-1
                                            "
                                        >
                                            *
                                        </span>

                                    </label>

                                    <input
                                        type="number"
                                        min="1"
                                        value={
                                            form.displayOrder ?? 1
                                        }
                                        onChange={(e) =>
                                            handleChange(
                                                "displayOrder",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter display order"
                                        className={inputClass}
                                        disabled={loading}
                                    />

                                    {errors.displayOrder && (
                                        <p
                                            className="
                                                text-xs
                                                text-red-500
                                                mt-1
                                            "
                                        >
                                            {
                                                errors.displayOrder
                                            }
                                        </p>
                                    )}

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
                                    Sub Category Settings
                                </h3>

                                <p
                                    className="
                                        text-xs
                                        text-gray-500
                                        mt-1
                                    "
                                >
                                    Configure the sub category availability
                                    and status.
                                </p>

                            </div>

                            <div className="max-w-[460px]">

                                <label
                                    className={labelClass}
                                >
                                    Status
                                </label>

                                <select
                                    value={
                                        form.status ??
                                        "ACTIVE"
                                    }
                                    onChange={(e) =>
                                        handleChange(
                                            "status",
                                            e.target.value
                                        )
                                    }
                                    className={inputClass}
                                    disabled={loading}
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
                                            Sub Category Status
                                        </p>

                                        <p
                                            className="
                                                text-xs
                                                text-gray-500
                                                mt-1
                                            "
                                        >
                                            This sub category is currently
                                            set to{" "}

                                            <span
                                                className="
                                                    font-medium
                                                    text-gray-700
                                                "
                                            >
                                                {
                                                    form.status ||
                                                    "ACTIVE"
                                                }
                                            </span>

                                        </p>

                                    </div>

                                    <span
                                        className={`
                                            inline-flex
                                            items-center
                                            justify-center

                                            min-w-[85px]
                                            h-7
                                            px-3

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
                                        {
                                            form.status ||
                                            "ACTIVE"
                                        }
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

                        {/* CANCEL */}

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

                        {/* SAVE */}

                        <button
                            type="submit"
                            disabled={
                                loading ||
                                !hasRequiredPermission
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
                                    ? "Update Sub Category"
                                    : "Save Sub Category"}

                        </button>

                    </div>

                </div>

            </form>

        </div>
    );
}