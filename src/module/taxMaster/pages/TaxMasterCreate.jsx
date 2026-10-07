import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { BadgePercent } from "lucide-react";
import toast from "react-hot-toast";

import { closeModal } from "../../ui/uiSlice";

import {
    resetTaxMasterForm,
    setTaxMasterField,
} from "../slices/taxMasterSlice";

import {
    createTaxMaster,
    updateTaxMaster,
} from "../thunks/taxMasterThunks";

import { getUserPermission } from "../../menuPermission/thunks/menuPermissionThunks";

export default function TaxMasterCreate() {

    const dispatch = useDispatch();

    // =========================================================
    // UI MODAL
    // =========================================================

    const { modal } = useSelector(
        (state) => state.ui
    );

    // =========================================================
    // TAX MASTER
    // =========================================================

    const {
        taxMaster,
        loading,
    } = useSelector(
        (state) => state.taxMaster
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
            state.menuPermission
                ?.userPermissionsLoaded === true
    );

    // =========================================================
    // NORMALIZE HELPERS
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
    // ADD / EDIT MODE
    // =========================================================

    const isEdit =
        modal.type === "editTaxMaster";

    const isOpen =
        modal.open &&
        (
            modal.type === "addTaxMaster" ||
            modal.type === "editTaxMaster"
        );

    const requiredAction =
        isEdit
            ? "EDIT"
            : "CREATE";

    // =========================================================
    // PERMISSION CHECKER
    // =========================================================

    const hasPermission = (
        moduleName,
        actionName
    ) => {

        if (hasFullAccess) {
            return true;
        }

        const requestedModule =
            normalizeModule(moduleName);

        const requestedAction =
            normalizeAction(actionName);

        if (!Array.isArray(permissions)) {
            return false;
        }

        return permissions.some(
            (permission) => {

                const permissionModule =
                    normalizeModule(
                        permission?.moduleName ||
                        permission?.module?.moduleName ||
                        permission?.module?.name
                    );

                if (
                    permissionModule !==
                    requestedModule
                ) {
                    return false;
                }

                // -------------------------------------------------
                // PERMISSION STATUS
                // -------------------------------------------------

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

                            const actionName =
                                normalizeAction(
                                    action?.actionName ||
                                    action?.action?.actionName ||
                                    action?.action?.name ||
                                    action?.name
                                );

                            const allowed =
                                action?.allowed === true ||
                                action?.allowed === "true";

                            return (
                                actionName ===
                                requestedAction &&
                                allowed &&
                                action?.active !== false &&
                                normalizeAction(
                                    action?.status
                                ) !== "INACTIVE"
                            );
                        }
                    );
                }

                // -------------------------------------------------
                // FLAT ACTION
                // -------------------------------------------------

                const permissionAction =
                    normalizeAction(
                        permission?.actionName ||
                        permission?.action?.actionName ||
                        permission?.action?.name
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

    const hasRequiredPermission =
        hasPermission(
            "TaxMasters",
            requiredAction
        );

    // =========================================================
    // FORM
    // =========================================================

    const form = taxMaster || {
        id: null,
        taxName: "",
        taxType: "",
        taxRate: "",
        cgstRate: "",
        sgstRate: "",
        igstRate: "",
        description: "",
        status: "ACTIVE",
    };

    // =========================================================
    // FIELD CHANGE
    // =========================================================

    const handleChange = (
        field,
        value
    ) => {

        dispatch(
            setTaxMasterField({
                field,
                value,
            })
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
            resetTaxMasterForm()
        );
    };

    // =========================================================
    // LOAD PERMISSIONS
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
    // ESCAPE KEY
    // =========================================================

    useEffect(() => {

        if (!isOpen) {
            return;
        }

        const handleEscape = (
            event
        ) => {

            if (
                event.key === "Escape"
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

    }, [isOpen]);

    // =========================================================
    // LOAD EXISTING DATA FOR EDIT
    // =========================================================

    useEffect(() => {

        if (
            modal.open &&
            modal.type === "editTaxMaster" &&
            modal.data
        ) {

            const tax =
                modal.data;

            dispatch(
                setTaxMasterField({
                    field: "id",
                    value:
                        tax.id ??
                        null,
                })
            );

            dispatch(
                setTaxMasterField({
                    field: "taxName",
                    value:
                        tax.taxName ??
                        "",
                })
            );

            dispatch(
                setTaxMasterField({
                    field: "taxType",
                    value:
                        tax.taxType ??
                        "",
                })
            );

            dispatch(
                setTaxMasterField({
                    field: "taxRate",
                    value:
                        tax.taxRate ??
                        "",
                })
            );

            dispatch(
                setTaxMasterField({
                    field: "cgstRate",
                    value:
                        tax.cgstRate ??
                        "",
                })
            );

            dispatch(
                setTaxMasterField({
                    field: "sgstRate",
                    value:
                        tax.sgstRate ??
                        "",
                })
            );

            dispatch(
                setTaxMasterField({
                    field: "igstRate",
                    value:
                        tax.igstRate ??
                        "",
                })
            );

            dispatch(
                setTaxMasterField({
                    field: "description",
                    value:
                        tax.description ??
                        "",
                })
            );

            dispatch(
                setTaxMasterField({
                    field: "status",
                    value:
                        tax.status ??
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
    // LOCAL UI STATE
    // =========================================================

    const [
        errors,
        setErrors
    ] = useState({});

    const [
        activeTab,
        setActiveTab
    ] = useState("tax");

    // =========================================================
    // TABS
    // =========================================================

    const tabs = [
        {
            id: "tax",
            label: "Tax Information",
        },
        {
            id: "settings",
            label: "Settings",
        },
    ];

    // =========================================================
    // INPUT CLASS
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

    // =========================================================
    // LABEL CLASS
    // =========================================================

    const labelClass = `
        block
        text-xs
        font-medium
        text-gray-600
        mb-1.5
    `;

    // =========================================================
    // SAVE
    // CREATE / UPDATE
    // =========================================================

    const handleSave = async (
        e
    ) => {

        e.preventDefault();

        // =====================================================
        // AUTH CHECK
        // =====================================================

        if (!isAuthenticated) {

            toast.error(
                "You are not authenticated."
            );

            return;
        }

        // =====================================================
        // PERMISSION LOADING CHECK
        // =====================================================

        if (
            !hasFullAccess &&
            !permissionsLoaded
        ) {

            toast.error(
                "Permissions are still loading. Please try again."
            );

            return;
        }

        // =====================================================
        // PERMISSION CHECK
        // =====================================================

        if (!hasRequiredPermission) {

            toast.error(
                isEdit
                    ? "You do not have permission to edit tax masters."
                    : "You do not have permission to create tax masters."
            );

            return;
        }

        // =====================================================
        // TAX NAME
        // =====================================================

        if (
            !form.taxName?.trim()
        ) {

            toast.error(
                "Tax name is required"
            );

            return;
        }

        // =====================================================
        // TAX TYPE
        // =====================================================

        if (!form.taxType) {

            toast.error(
                "Tax type is required"
            );

            return;
        }

        // =====================================================
        // TAX RATE
        // =====================================================

        if (
            form.taxRate === "" ||
            Number(form.taxRate) <= 0
        ) {

            toast.error(
                "Tax rate is required"
            );

            return;
        }

        // =====================================================
        // CGST + SGST
        // =====================================================

        if (
            form.taxType === "CGST_SGST"
        ) {

            if (
                form.cgstRate === "" ||
                Number(form.cgstRate) <= 0
            ) {

                toast.error(
                    "CGST rate is required"
                );

                return;
            }

            if (
                form.sgstRate === "" ||
                Number(form.sgstRate) <= 0
            ) {

                toast.error(
                    "SGST rate is required"
                );

                return;
            }

            const combinedRate =
                Number(form.cgstRate || 0) +
                Number(form.sgstRate || 0);

            if (
                combinedRate !==
                Number(form.taxRate)
            ) {

                toast.error(
                    "CGST + SGST rate must equal Tax Rate"
                );

                return;
            }
        }

        // =====================================================
        // IGST
        // =====================================================

        if (
            form.taxType === "IGST"
        ) {

            if (
                form.igstRate === "" ||
                Number(form.igstRate) <= 0
            ) {

                toast.error(
                    "IGST rate is required"
                );

                return;
            }

            if (
                Number(form.igstRate) !==
                Number(form.taxRate)
            ) {

                toast.error(
                    "IGST rate must equal Tax Rate"
                );

                return;
            }
        }

        // =====================================================
        // PAYLOAD
        // =====================================================

        const payload = {

            taxName:
                form.taxName.trim(),

            taxType:
                form.taxType,

            taxRate:
                Number(form.taxRate),

            cgstRate:
                form.taxType === "CGST_SGST"
                    ? Number(
                        form.cgstRate || 0
                    )
                    : 0,

            sgstRate:
                form.taxType === "CGST_SGST"
                    ? Number(
                        form.sgstRate || 0
                    )
                    : 0,

            igstRate:
                form.taxType === "IGST"
                    ? Number(
                        form.igstRate || 0
                    )
                    : 0,

            description:
                form.description?.trim() ||
                "",

            status:
                form.status ||
                "ACTIVE",
        };

        try {

            // =================================================
            // EDIT
            // =================================================

            if (isEdit) {

                const taxId =
                    form.id ??
                    modal.data?.id;

                if (!taxId) {

                    toast.error(
                        "Tax master ID is missing"
                    );

                    return;
                }

                await dispatch(
                    updateTaxMaster({
                        id: taxId,
                        data: payload,
                    })
                ).unwrap();

                toast.success(
                    "Tax master updated successfully"
                );

            }

            // =================================================
            // CREATE
            // =================================================

            else {

                await dispatch(
                    createTaxMaster(
                        payload
                    )
                ).unwrap();

                toast.success(
                    "Tax master created successfully"
                );
            }

            // =================================================
            // CLOSE + RESET
            // =================================================

            dispatch(
                closeModal()
            );

            dispatch(
                resetTaxMasterForm()
            );

        } catch (error) {

            console.error(
                "Tax master save error:",
                error
            );

            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    error?.response?.data?.message ||
                    (
                        isEdit
                            ? "Failed to update tax master"
                            : "Failed to create tax master"
                    )
            );
        }
    };

    // =========================================================
    // MODAL CLOSED
    // =========================================================

    if (!isOpen) {
        return null;
    }

    // =========================================================
    // AUTH CHECKING
    // =========================================================

    if (authChecking) {

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

                <div
                    className="
                        shrink-0
                        h-[68px]
                        flex
                        items-center
                        px-6
                        border-b
                        border-gray-200
                        bg-white
                    "
                >

                    <div
                        className="
                            w-10
                            h-10
                            rounded-lg
                            bg-blue-50
                            text-blue-600
                            flex
                            items-center
                            justify-center
                        "
                    >
                        <BadgePercent
                            size={22}
                            strokeWidth={2}
                        />
                    </div>

                    <div className="ml-3">

                        <h2
                            className="
                                text-lg
                                font-semibold
                                text-gray-800
                            "
                        >
                            Tax Master
                        </h2>

                        <p
                            className="
                                text-xs
                                text-gray-500
                                mt-0.5
                            "
                        >
                            Checking authentication
                        </p>

                    </div>

                </div>

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
                            Checking authentication...
                        </p>

                    </div>

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
        (
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
                                w-10
                                h-10
                                rounded-lg
                                bg-blue-50
                                text-blue-600
                                flex
                                items-center
                                justify-center
                            "
                        >
                            <BadgePercent
                                size={22}
                                strokeWidth={2}
                            />
                        </div>

                        <div>

                            <h2
                                className="
                                    text-lg
                                    font-semibold
                                    text-gray-800
                                "
                            >
                                {isEdit
                                    ? "Edit Tax"
                                    : "Add New Tax"
                                }
                            </h2>

                            <p
                                className="
                                    text-xs
                                    text-gray-500
                                    mt-0.5
                                "
                            >
                                Loading permissions
                            </p>

                        </div>

                    </div>

                </div>

                {/* BODY */}

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
    // ACCESS DENIED
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

                {/* =================================================
                    ACCESS DENIED HEADER
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
                                bg-red-50
                                flex
                                items-center
                                justify-center
                            "
                        >

                            <BadgePercent
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
                                Tax master access restricted
                            </p>

                        </div>

                    </div>

                </div>

                {/* =================================================
                    ACCESS DENIED BODY
                ================================================= */}

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
                                ? "You do not have permission to edit tax masters."
                                : "You do not have permission to create tax masters."
                            }
                        </p>

                    </div>

                </div>

                {/* =================================================
                    ACCESS DENIED FOOTER
                ================================================= */}

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
    // NORMAL UI
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
                            w-10
                            h-10
                            rounded-lg
                            bg-blue-50
                            text-blue-600
                            flex
                            items-center
                            justify-center
                        "
                    >

                        <BadgePercent
                            size={22}
                            strokeWidth={2}
                        />

                    </div>

                    <div>

                        <h2
                            className="
                                text-lg
                                font-semibold
                                text-gray-800
                            "
                        >
                            {isEdit
                                ? "Edit Tax"
                                : "Add New Tax"
                            }
                        </h2>

                        <p
                            className="
                                text-xs
                                text-gray-500
                                mt-0.5
                            "
                        >
                            {isEdit
                                ? "Update tax details"
                                : "Create a new tax"
                            }
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
                    h-[52px]
                    flex
                    items-center
                    gap-8
                    px-6
                    border-b
                    border-gray-200
                    bg-white
                "
            >

                {tabs.map((tab) => {

                    const hasError =
                        tab.id === "tax" &&
                        (
                            errors?.taxName ||
                            errors?.taxType ||
                            errors?.taxRate ||
                            errors?.cgstRate ||
                            errors?.sgstRate ||
                            errors?.igstRate
                        );

                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() =>
                                setActiveTab(
                                    tab.id
                                )
                            }
                            className={`
                                relative
                                h-full
                                px-1
                                text-sm
                                font-medium
                                transition

                                ${activeTab === tab.id
                                    ? hasError
                                        ? "text-red-600"
                                        : "text-blue-600"
                                    : hasError
                                        ? "text-red-600"
                                        : "text-gray-500 hover:text-gray-700"
                                }
                            `}
                        >

                            <span className="flex items-center gap-2">

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

                            {activeTab === tab.id && (
                                <span
                                    className={`
                                        absolute
                                        bottom-0
                                        left-0
                                        right-0
                                        h-0.5

                                        ${hasError
                                            ? "bg-red-500"
                                            : "bg-blue-500"
                                        }
                                    `}
                                />
                            )}

                        </button>
                    );
                })}

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
                        TAX INFORMATION TAB
                    ================================================= */}

                    {activeTab === "tax" && (

                        <div className="space-y-6">

                            {/* SECTION HEADER */}

                            <div
                                className="
                                    flex
                                    items-center
                                    justify-between
                                    pb-3
                                    border-b
                                    border-gray-200
                                "
                            >

                                <div>

                                    <h3
                                        className="
                                            text-sm
                                            font-semibold
                                            text-gray-800
                                        "
                                    >
                                        Tax Information
                                    </h3>

                                    <p
                                        className="
                                            text-xs
                                            text-gray-500
                                            mt-1
                                        "
                                    >
                                        Enter the basic tax details.
                                    </p>

                                </div>

                                {/* STATUS */}

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
                                                    : "bg-green-50 text-green-700"
                                            }
                                        `}
                                    >
                                        {form.status ||
                                            "ACTIVE"}
                                    </span>

                                </div>

                            </div>

                            {/* TAX NAME / TAX TYPE */}

                            <div
                                className="
                                    grid
                                    grid-cols-2
                                    gap-5
                                "
                            >

                                {/* TAX NAME */}

                                <div>

                                    <label
                                        className={labelClass}
                                    >
                                        Tax Name

                                        <span className="text-red-500 ml-1">
                                            *
                                        </span>
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            form.taxName ??
                                            ""
                                        }
                                        onChange={(e) =>
                                            handleChange(
                                                "taxName",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter tax name"
                                        className={inputClass}
                                    />

                                    {errors?.taxName && (
                                        <p
                                            className="
                                                mt-1
                                                text-xs
                                                text-red-500
                                            "
                                        >
                                            {errors.taxName}
                                        </p>
                                    )}

                                </div>

                                {/* TAX TYPE */}

                                <div>

                                    <label
                                        className={labelClass}
                                    >
                                        Tax Type

                                        <span className="text-red-500 ml-1">
                                            *
                                        </span>
                                    </label>

                                    <select
                                        value={
                                            form.taxType ??
                                            ""
                                        }
                                        onChange={(e) =>
                                            handleChange(
                                                "taxType",
                                                e.target.value
                                            )
                                        }
                                        className={inputClass}
                                    >

                                        <option value="">
                                            Select Tax Type
                                        </option>

                                        <option value="CGST_SGST">
                                            CGST + SGST
                                        </option>

                                        <option value="IGST">
                                            IGST
                                        </option>

                                    </select>

                                    {errors?.taxType && (
                                        <p
                                            className="
                                                mt-1
                                                text-xs
                                                text-red-500
                                            "
                                        >
                                            {errors.taxType}
                                        </p>
                                    )}

                                </div>

                                {/* TAX RATE */}

                                <div>

                                    <label
                                        className={labelClass}
                                    >
                                        Tax Rate (%)

                                        <span className="text-red-500 ml-1">
                                            *
                                        </span>
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={
                                            form.taxRate ??
                                            ""
                                        }
                                        onChange={(e) =>
                                            handleChange(
                                                "taxRate",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter tax rate"
                                        className={inputClass}
                                    />

                                    {errors?.taxRate && (
                                        <p
                                            className="
                                                mt-1
                                                text-xs
                                                text-red-500
                                            "
                                        >
                                            {errors.taxRate}
                                        </p>
                                    )}

                                </div>

                            </div>

                            {/* CGST + SGST */}

                            {form.taxType ===
                                "CGST_SGST" && (

                                    <div
                                        className="
                                        grid
                                        grid-cols-2
                                        gap-5
                                    "
                                    >

                                        {/* CGST */}

                                        <div>

                                            <label
                                                className={labelClass}
                                            >
                                                CGST Rate (%)

                                                <span className="text-red-500 ml-1">
                                                    *
                                                </span>
                                            </label>

                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={
                                                    form.cgstRate ??
                                                    ""
                                                }
                                                onChange={(e) =>
                                                    handleChange(
                                                        "cgstRate",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Enter CGST rate"
                                                className={inputClass}
                                            />

                                            {errors?.cgstRate && (
                                                <p className="mt-1 text-xs text-red-500">
                                                    {errors.cgstRate}
                                                </p>
                                            )}

                                        </div>

                                        {/* SGST */}

                                        <div>

                                            <label
                                                className={labelClass}
                                            >
                                                SGST Rate (%)

                                                <span className="text-red-500 ml-1">
                                                    *
                                                </span>
                                            </label>

                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={
                                                    form.sgstRate ??
                                                    ""
                                                }
                                                onChange={(e) =>
                                                    handleChange(
                                                        "sgstRate",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Enter SGST rate"
                                                className={inputClass}
                                            />

                                            {errors?.sgstRate && (
                                                <p className="mt-1 text-xs text-red-500">
                                                    {errors.sgstRate}
                                                </p>
                                            )}

                                        </div>

                                    </div>
                                )}

                            {/* IGST */}

                            {form.taxType ===
                                "IGST" && (

                                    <div>

                                        <label
                                            className={labelClass}
                                        >
                                            IGST Rate (%)

                                            <span className="text-red-500 ml-1">
                                                *
                                            </span>
                                        </label>

                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={
                                                form.igstRate ??
                                                ""
                                            }
                                            onChange={(e) =>
                                                handleChange(
                                                    "igstRate",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Enter IGST rate"
                                            className={inputClass}
                                        />

                                        {errors?.igstRate && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.igstRate}
                                            </p>
                                        )}

                                    </div>
                                )}

                            {/* DESCRIPTION */}

                            <div>

                                <label
                                    className={labelClass}
                                >
                                    Description
                                </label>

                                <textarea
                                    rows={5}
                                    value={
                                        form.description ??
                                        ""
                                    }
                                    onChange={(e) =>
                                        handleChange(
                                            "description",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter description"
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
                                    "
                                />

                            </div>

                        </div>
                    )}

                    {/* =================================================
                        SETTINGS TAB
                    ================================================= */}

                    {activeTab === "settings" && (

                        <div className="space-y-6">

                            {/* SECTION HEADER */}

                            <div
                                className="
                                    pb-3
                                    border-b
                                    border-gray-200
                                "
                            >

                                <h3
                                    className="
                                        text-sm
                                        font-semibold
                                        text-gray-800
                                    "
                                >
                                    Settings
                                </h3>

                                <p
                                    className="
                                        text-xs
                                        text-gray-500
                                        mt-1
                                    "
                                >
                                    Configure tax status.
                                </p>

                            </div>

                            {/* STATUS */}

                            <div className="max-w-md">

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

                            {/* STATUS SUMMARY */}

                            <div
                                className="
                                    max-w-md
                                    p-4
                                    bg-white
                                    border
                                    border-gray-200
                                    rounded-lg
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
                                                font-semibold
                                                text-gray-700
                                            "
                                        >
                                            Tax Status
                                        </p>

                                        <p
                                            className="
                                                text-xs
                                                text-gray-500
                                                mt-1
                                            "
                                        >
                                            Current status of this tax.
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
                                        {form.status ||
                                            "ACTIVE"}
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

                    <div />

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
                            disabled={
                                loading ||
                                permissionLoading ||
                                !hasRequiredPermission
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

                        {/* SAVE / UPDATE */}

                        <button
                            type="submit"
                            disabled={
                                loading
                            }
                            className="
                                h-10
                                px-6
                                rounded-md
                                bg-blue-500
                                text-white
                                text-sm
                                font-medium
                                hover:bg-blue-600
                                transition
                                disabled:opacity-50
                                disabled:cursor-not-allowed
                            "
                        >

                            {loading
                                ? (
                                    isEdit
                                        ? "Updating..."
                                        : "Saving..."
                                )
                                : (
                                    isEdit
                                        ? "Update"
                                        : "Save"
                                )
                            }

                        </button>

                    </div>

                </div>

            </form>

        </div>
    );
}