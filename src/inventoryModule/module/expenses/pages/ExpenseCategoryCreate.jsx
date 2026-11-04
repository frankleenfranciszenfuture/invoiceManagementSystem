
import React, { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";

import { Tags } from "lucide-react";

import toast from "react-hot-toast";

import { closeModal } from "../../../../module/ui/uiSlice";

import {
    resetExpenseCategoryForm,
} from "../slices/expenseCategorySlice";

import {
    createExpenseCategory,
    updateExpenseCategory,
    fetchAllExpenseCategories
} from "../thunks/expenseCategoryThunks";

import {
    setCreatedExpenseCategorySelection,
} from "../../expenses/slices/expenseSlice";

import {
    getUserPermission,
} from "../../../../module/menuPermission/thunks/menuPermissionThunks";

import CustomSelect from "../../../../common/custom/CustomSelect";

import LeaveConfirmationModal from "../../../../common/confirmation/LeaveConfirmationModal";
import useLeaveConfirmation from "../.../../../../../common/confirmation/useLeaveConfirmation";

export default function ExpenseCategoryCreate() {

    const dispatch = useDispatch();

    // =========================================================
    // REDUX
    // =========================================================

    const { modal } = useSelector((state) => state.ui);

    const {
        loading,
        actionLoading,
        existingExpenseCategory,
    } = useSelector((state) => state.expenseCategory);

    // =========================================================
    // AUTH
    // =========================================================

    const user = useSelector((state) => state.auth?.user);

    const isAuthenticated = useSelector(
        (state) => state.auth?.isAuthenticated === true
    );

    const authChecking = useSelector(
        (state) => state.auth?.authChecking === true
    );

    // =========================================================
    // USER PERMISSIONS
    // =========================================================

    const permissions = useSelector(
        (state) => state.menuPermission?.userPermissions || []
    );

    const permissionLoading = useSelector(
        (state) => state.menuPermission?.loading === true
    );

    const permissionsLoaded = useSelector(
        (state) =>
            state.menuPermission?.userPermissionsLoaded === true
    );

    // =========================================================
    // ADD / EDIT MODE
    // =========================================================

    const isEdit = modal.type === "editExpenseCategory";

    const isOpen =
        modal.open &&
        (
            modal.type === "addExpenseCategory" ||
            modal.type === "editExpenseCategory"
        );

    const isSaving = loading || actionLoading;

    // =========================================================
    // LOCAL STATE
    // =========================================================

    const emptyForm = {
        id: null,
        categoryName: "",
        expenseType: "INTERNAL",
        description: "",
        status: "ACTIVE",
    };

    const [form, setForm] = useState(emptyForm);

    const [errors, setErrors] = useState({});

    const [activeTab, setActiveTab] = useState("category");

    // =========================================================
    // NORMALIZE
    // =========================================================

    const normalizeModule = (value) =>
        String(value ?? "").trim().toLowerCase();

    const normalizeAction = (value) =>
        String(value ?? "").trim().toUpperCase();

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

    const normalizedRole = normalizeAction(roleName);

    const isSuperAdmin = normalizedRole === "SUPER_ADMIN";

    const isAdmin = normalizedRole === "ADMIN";

    const hasFullAccess = isSuperAdmin || isAdmin;

    const {
        showLeaveConfirmation,
        confirmLeave,
        handleStay,
        handleLeave,
    } = useLeaveConfirmation();

    // =========================================================
    // PERMISSION CHECK
    // =========================================================

    const hasPermission = (moduleName, actionName) => {

        if (hasFullAccess) {
            return true;
        }

        const requestedModule = normalizeModule(moduleName);

        const requestedAction = normalizeAction(actionName);

        if (!Array.isArray(permissions)) {
            return false;
        }

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

            // GROUPED ACTIONS
            if (Array.isArray(permission?.actions)) {

                const groupedPermission = permission.actions.some(
                    (action) => {

                        if (typeof action === "string") {
                            return (
                                normalizeAction(action) === requestedAction
                            );
                        }

                        const actionName = normalizeAction(
                            action?.actionName ||
                            action?.action?.actionName ||
                            action?.name
                        );

                        const allowed =
                            action?.allowed === true ||
                            action?.allowed === "true";

                        return (
                            actionName === requestedAction &&
                            allowed &&
                            action?.active !== false &&
                            normalizeAction(action?.status) !== "INACTIVE"
                        );
                    }
                );

                if (groupedPermission) {
                    return true;
                }
            }

            // DIRECT ACTION
            const permissionAction = normalizeAction(
                permission?.actionName ||
                permission?.action?.actionName ||
                permission?.action?.name
            );

            const allowed =
                permission?.allowed === true ||
                permission?.allowed === "true";

            return (
                permissionAction === requestedAction &&
                allowed
            );
        });
    };



    // =========================================================
    // CREATE / EDIT PERMISSION
    // =========================================================

    const requiredAction = isEdit ? "EDIT" : "CREATE";

    const hasRequiredPermission = hasPermission(
        "Expense Categories",
        requiredAction
    );

    // =========================================================
    // LOAD PERMISSIONS
    // =========================================================

    useEffect(() => {

        if (!isOpen || authChecking || !isAuthenticated) {
            return;
        }

        if (hasFullAccess) {
            return;
        }

        if (!permissionsLoaded && !permissionLoading) {
            dispatch(getUserPermission());
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
    // INITIALIZE CREATE FORM
    // =========================================================

    useEffect(() => {

        if (
            modal.open &&
            modal.type === "addExpenseCategory"
        ) {

            dispatch(resetExpenseCategoryForm());

            setForm({
                ...emptyForm,
                categoryName:
                    modal.data?.initialValue ??
                    modal.data?.categoryName ??
                    "",
                expenseType:
                    modal.data?.expenseType ??
                    "INTERNAL",
            });

            setErrors({});
            setActiveTab("category");
        }

    }, [
        modal.open,
        modal.type,
        modal.data,
        dispatch,
    ]);

    // =========================================================
    // INITIALIZE EDIT FORM
    // =========================================================

    useEffect(() => {

        if (
            modal.open &&
            modal.type === "editExpenseCategory" &&
            modal.data
        ) {

            const existing =
                modal.data ||
                existingExpenseCategory ||
                {};

            setForm({
                id: existing.id ?? null,
                categoryName: existing.categoryName ?? "",
                expenseType: existing.expenseType ?? "INTERNAL",
                description: existing.description ?? "",
                status: existing.status ?? "ACTIVE",
            });

            setErrors({});
            setActiveTab("category");
        }

    }, [
        modal.open,
        modal.type,
        modal.data,
        existingExpenseCategory,
    ]);

    // =========================================================
    // CHANGE FIELD
    // =========================================================

    const handleChange = (field, value) => {

        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));

        setErrors((previous) => {

            if (!previous[field]) {
                return previous;
            }

            const updated = { ...previous };

            delete updated[field];

            return updated;
        });
    };

    // =========================================================
    // CLOSE MODAL
    // =========================================================

    const handleClose = () => {
        confirmLeave(() => {
            dispatch(closeModal());

            dispatch(resetExpenseCategoryForm());

            setForm(emptyForm);
            setErrors({});
            setActiveTab("category");
        })
    };

    // =========================================================
    // ESCAPE KEY
    // =========================================================

    useEffect(() => {

        if (!isOpen) {
            return;
        }

        const handleEscape = (event) => {

            if (event.key === "Escape" && !isSaving) {
                handleClose();
            }
        };

        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("keydown", handleEscape);
        };

    }, [isOpen, isSaving]);

    // =========================================================
    // VALIDATION
    // =========================================================

    const validateExpenseCategory = () => {

        const newErrors = {};

        if (!String(form.categoryName ?? "").trim()) {
            newErrors.categoryName =
                "Expense category name is required";
        }

        if (!form.expenseType) {
            newErrors.expenseType =
                "Expense type is required";
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {

            setActiveTab("category");

            toast.error(
                "Please complete Expense Category Information"
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

        // AUTH CHECK
        if (!isAuthenticated) {
            toast.error("You are not authenticated.");
            return;
        }

        // PERMISSION LOADING CHECK
        if (!hasFullAccess && !permissionsLoaded) {
            toast.error(
                "Permissions are still loading. Please try again."
            );
            return;
        }

        // PERMISSION CHECK
        if (!hasRequiredPermission) {
            toast.error(
                isEdit
                    ? "You do not have permission to edit expense categories."
                    : "You do not have permission to create expense categories."
            );
            return;
        }

        // VALIDATION
        if (!validateExpenseCategory()) {
            return;
        }

        // PAYLOAD
        const payload = {
            categoryName: String(
                form.categoryName ?? ""
            ).trim(),

            expenseType: form.expenseType,

            description: String(
                form.description ?? ""
            ).trim(),

            status: form.status || "ACTIVE",
        };

        try {
            if (isEdit) {
                const categoryId = form.id ?? modal.data?.id;

                if (!categoryId) {
                    toast.error("Expense category ID is missing.");
                    return;
                }

                await dispatch(
                    updateExpenseCategory({
                        id: categoryId,
                        data: payload,
                    })
                ).unwrap();

                // Refresh category list after update
                await dispatch(
                    fetchAllExpenseCategories({
                        page: 0,
                        size: 10,
                    })
                ).unwrap();

                toast.success("Expense category updated successfully");
            } else {
                // CREATE CATEGORY
                const response = await dispatch(
                    createExpenseCategory(payload)
                ).unwrap();

                // Extract newly created category
                const createdCategory =
                    response?.data?.data ??
                    response?.data ??
                    response;

                if (!createdCategory?.id) {
                    throw new Error(
                        "Category created, but category ID was not returned."
                    );
                }

                // Refresh category list
                await dispatch(
                    fetchAllExpenseCategories({
                        page: 0,
                        size: 10,
                    })
                ).unwrap();

                // Send newly created category to ExpenseCreate
                if (modal.data?.selectAfterCreate) {
                    dispatch(
                        setCreatedExpenseCategorySelection({
                            id: createdCategory.id,
                            categoryName: createdCategory.categoryName,
                        })
                    );
                }

                toast.success("Expense category created successfully");
            }

            // CLOSE + RESET
            dispatch(closeModal());

            dispatch(resetExpenseCategoryForm());

            setForm(emptyForm);
            setErrors({});
            setActiveTab("category");

        } catch (error) {
            console.error("Expense category save error:", error);

            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    (isEdit
                        ? "Failed to update expense category"
                        : "Failed to create expense category")
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
    // AUTH CHECKING
    // =========================================================

    if (authChecking) {

        return (
            <div className="
                w-[950px] max-w-[95vw] min-h-[300px]
                bg-white rounded-xl shadow-2xl
                flex items-center justify-center p-8
            ">
                <div className="text-center">

                    <div className="
                        w-10 h-10 mx-auto mb-3
                        border-2 border-blue-200 border-t-blue-600
                        rounded-full animate-spin
                    " />

                    <p className="text-sm text-gray-500">
                        Checking authentication...
                    </p>

                </div>
            </div>
        );
    }

    // =========================================================
    // NOT AUTHENTICATED
    // =========================================================

    if (!isAuthenticated) {
        return null;
    }

    // =========================================================
    // PERMISSION LOADING
    // =========================================================

    if (
        !hasFullAccess &&
        (permissionLoading || !permissionsLoaded)
    ) {

        return (
            <div className="
                w-[950px] max-w-[95vw] min-h-[300px]
                bg-white rounded-xl shadow-2xl
                flex items-center justify-center p-8
            ">
                <div className="text-center">

                    <div className="
                        w-10 h-10 mx-auto mb-3
                        border-2 border-blue-200 border-t-blue-600
                        rounded-full animate-spin
                    " />

                    <p className="
                        text-sm font-medium text-gray-600
                    ">
                        Loading permissions...
                    </p>

                </div>
            </div>
        );
    }

    // =========================================================
    // ACCESS DENIED
    // =========================================================

    if (!hasRequiredPermission) {

        return (
            <div className="
                w-[950px] max-w-[95vw] min-h-[300px]
                bg-white rounded-xl shadow-2xl
                overflow-hidden flex flex-col
            ">

                {/* HEADER */}

                <div className="
                    shrink-0 h-[68px]
                    flex items-center justify-between
                    px-6 border-b border-gray-200 bg-white
                ">

                    <div className="flex items-center gap-3">

                        <div className="
                            w-9 h-9 rounded-lg bg-red-50
                            flex items-center justify-center
                        ">
                            <Tags size={20} className="text-red-500" />
                        </div>

                        <div>
                            <h2 className="
                                text-[17px] font-semibold text-gray-800
                            ">
                                Access Denied
                            </h2>

                            <p className="
                                text-xs text-gray-500 mt-0.5
                            ">
                                Expense category access restricted
                            </p>
                        </div>

                    </div>

                </div>

                {/* BODY */}

                <div className="
                    flex-1 flex items-center justify-center
                    px-6 py-10
                ">

                    <div className="text-center">

                        <div className="
                            w-12 h-12 mx-auto mb-3
                            rounded-full bg-red-50
                            flex items-center justify-center
                        ">
                            <span className="
                                text-red-500 text-lg font-semibold
                            ">
                                !
                            </span>
                        </div>

                        <h2 className="
                            text-lg font-semibold text-gray-800
                        ">
                            Access Denied
                        </h2>

                        <p className="
                            mt-1 text-sm text-gray-500
                        ">
                            {isEdit
                                ? "You do not have permission to edit expense categories."
                                : "You do not have permission to create expense categories."
                            }
                        </p>

                    </div>

                </div>

                {/* FOOTER */}

                <div className="
                    shrink-0 h-[68px]
                    flex items-center justify-end
                    px-6 border-t border-gray-200 bg-white
                ">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="
                            h-10 px-5 rounded-md
                            border border-gray-300
                            text-sm font-medium text-gray-700
                            bg-white hover:bg-gray-50 transition
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
            id: "category",
            label: "Category Information",
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
        w-full h-11 px-3
        border border-gray-300 rounded-md
        text-sm text-gray-700 bg-white
        outline-none transition
        focus:border-blue-500
        focus:ring-1 focus:ring-blue-500
        disabled:bg-gray-100
        disabled:text-gray-500
        disabled:cursor-not-allowed
    `;

    const labelClass = `
        block text-xs font-medium text-gray-500 mb-1.5
    `;

    const getLabelClass = (required = false) => `
        block text-xs font-medium
        ${required ? "text-red-500" : "text-gray-500"}
        mb-1.5
    `;

    // =========================================================
    // UI
    // =========================================================

    return (
        <div className="
            w-full min-w-0 max-h-[80vh]
            bg-white rounded-lg overflow-hidden
            flex flex-col
        ">

            {/* HEADER */}

            <div className="
                shrink-0 h-[68px]
                flex items-center justify-between
                px-6 border-b border-lime-500 bg-white
            ">

                <div className="flex items-center gap-3">

                    <div className="
                        w-9 h-9 rounded-lg bg-blue-50
                        flex items-center justify-center
                    ">
                        <Tags size={20} className="text-blue-600" />
                    </div>

                    <div>

                        <h2 className="
                            text-[16px] font-semibold text-gray-500
                        ">
                            {isEdit
                                ? "Edit Expense Category"
                                : "New Expense Category"
                            }
                        </h2>

                        <p className="
                            text-xs text-gray-400 mt-0.5
                        ">
                            {isEdit
                                ? "Update expense category information"
                                : "Create a new expense category"
                            }
                        </p>

                    </div>

                </div>

            </div>

            {/* TABS */}

            <div className="
                shrink-0 px-6
                border-b border-gray-200 bg-white
            ">

                <div className="
                    flex items-center gap-8 h-[52px]
                ">

                    {tabs.map((tab) => {

                        const active = activeTab === tab.id;

                        const hasError =
                            tab.id === "category" &&
                            (
                                errors.categoryName ||
                                errors.expenseType
                            );

                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    relative h-full text-sm font-medium
                                    transition
                                    ${active
                                        ? "text-gray-500"
                                        : hasError
                                            ? "text-red-500"
                                            : "text-gray-400 hover:text-gray-600"
                                    }
                                `}
                            >

                                <span className="
                                    flex items-center gap-1.5
                                ">
                                    {tab.label}

                                    {hasError && (
                                        <span className="
                                            w-1.5 h-1.5 rounded-full
                                            bg-red-500
                                        " />
                                    )}
                                </span>

                                {active && (
                                    <span className="
                                        absolute left-0 right-0 bottom-0
                                        h-[2px] bg-lime-500 rounded-t
                                    " />
                                )}

                            </button>
                        );
                    })}

                </div>

            </div>

            {/* FORM */}

            <form
                onSubmit={handleSave}
                className="
                    flex flex-col flex-1
                    min-h-0 overflow-hidden
                "
            >

                {/* SCROLL BODY */}

                <div className="
                    flex-1 min-h-0
                    overflow-y-auto overflow-x-hidden
                    px-7 py-6 bg-gray-50/50
                ">

                    {/* CATEGORY INFORMATION */}

                    {activeTab === "category" && (

                        <div>

                            <div className="mb-6">

                                <h3 className="
                                    text-base font-semibold text-gray-500
                                ">
                                    Expense Category Information
                                </h3>

                                <p className="
                                    text-xs text-gray-400 mt-1
                                ">
                                    Configure the basic expense category details.
                                </p>

                            </div>

                            <div className="
                                grid grid-cols-2
                                gap-x-6 gap-y-5
                            ">

                                {/* CATEGORY NAME */}

                                <div>

                                    <label className={getLabelClass(true)}>
                                        Category Name
                                        <span className="text-red-500 ml-1">
                                            *
                                        </span>
                                    </label>

                                    <input
                                        type="text"
                                        value={form.categoryName}
                                        onChange={(e) =>
                                            handleChange(
                                                "categoryName",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter category name"
                                        className={inputClass}
                                        disabled={isSaving}
                                    />

                                    {errors.categoryName && (
                                        <p className="
                                            text-xs text-red-500 mt-1
                                        ">
                                            {errors.categoryName}
                                        </p>
                                    )}

                                </div>

                                {/* EXPENSE TYPE */}

                                <div>

                                    <label className={getLabelClass(true)}>
                                        Expense Type
                                        <span className="text-red-500 ml-1">
                                            *
                                        </span>
                                    </label>

                                    <CustomSelect
                                        value={form.expenseType}
                                        onChange={(value) =>
                                            handleChange(
                                                "expenseType",
                                                value
                                            )
                                        }
                                        disabled={isSaving}
                                        options={[
                                            {
                                                value: "INTERNAL",
                                                label: "INTERNAL",
                                            },
                                            {
                                                value: "EXTERNAL",
                                                label: "EXTERNAL",
                                            },
                                        ]}
                                    />

                                    {errors.expenseType && (
                                        <p className="
                                            text-xs text-red-500 mt-1
                                        ">
                                            {errors.expenseType}
                                        </p>
                                    )}

                                </div>

                                {/* DESCRIPTION */}

                                <div className="col-span-2">

                                    <label className={labelClass}>
                                        Description
                                    </label>

                                    <textarea
                                        rows={5}
                                        value={form.description}
                                        onChange={(e) =>
                                            handleChange(
                                                "description",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter category description"
                                        className="
                                            w-full h-[90px] px-3 py-3
                                            border border-gray-300 rounded-md
                                            text-sm text-gray-700 bg-white
                                            outline-none resize-none transition
                                            focus:border-blue-500
                                            focus:ring-1 focus:ring-blue-500
                                            disabled:bg-gray-100
                                            disabled:text-gray-500
                                        "
                                        disabled={isSaving}
                                    />

                                </div>

                            </div>

                        </div>
                    )}

                    {/* SETTINGS */}

                    {activeTab === "settings" && (

                        <div>

                            <div className="mb-6">

                                <h3 className="
                                    text-base font-semibold text-gray-500
                                ">
                                    Expense Category Settings
                                </h3>

                                <p className="
                                    text-xs text-gray-400 mt-1
                                ">
                                    Configure category availability and status.
                                </p>

                            </div>

                            <div className="max-w-[460px]">

                                <label className={labelClass}>
                                    Status
                                </label>

                                <CustomSelect
                                    value={form.status || "ACTIVE"}
                                    onChange={(value) =>
                                        handleChange("status", value)
                                    }
                                    disabled={isSaving}
                                    options={[
                                        {
                                            value: "ACTIVE",
                                            label: "ACTIVE",
                                        },
                                        {
                                            value: "INACTIVE",
                                            label: "INACTIVE",
                                        },
                                        {
                                            value: "DRAFT",
                                            label: "DRAFT",
                                        },
                                    ]}
                                />

                            </div>

                        </div>
                    )}

                </div>

                {/* FOOTER */}

                <div className="
                    shrink-0 h-[68px]
                    flex items-center justify-between
                    px-6 border-t border-gray-200 bg-white
                ">

                    <div className="text-xs text-gray-500">
                        <span className="text-red-500">*</span>
                        {" "}Required fields
                    </div>

                    <div className="
                        flex items-center gap-3
                    ">

                        {/* CANCEL */}

                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isSaving}
                            className="
                                h-10 px-5 rounded-md
                                border border-gray-300
                                text-sm font-medium text-gray-700
                                bg-white hover:bg-gray-50
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
                                isSaving ||
                                !hasRequiredPermission
                            }
                            className="
                                h-10 px-6 rounded-md
                                bg-blue-600 text-white
                                text-sm font-medium
                                hover:bg-blue-700 transition
                                disabled:opacity-50
                                disabled:cursor-not-allowed
                            "
                        >

                            {isSaving
                                ? isEdit
                                    ? "Updating..."
                                    : "Saving..."
                                : isEdit
                                    ? "Update Category"
                                    : "Save Category"
                            }

                        </button>

                    </div>

                </div>

            </form>
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
    );
}
