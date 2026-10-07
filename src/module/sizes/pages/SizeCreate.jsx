import React, {
    useEffect,
    useState,
} from "react";

import {
    useDispatch,
    useSelector,
} from "react-redux";

import {
    Ruler,
} from "lucide-react";

import toast from "react-hot-toast";

import {
    closeModal,
} from "../../ui/uiSlice";

import {
    resetSizeForm,
    setSizeField,
} from "../slices/sizeSlice";

import {
    createSize,
    updateSize,
} from "../thunks/sizeThunks";

import {
    getUserPermission,
} from "../../menuPermission/thunks/menuPermissionThunks";

export default function SizeCreate() {

    const dispatch = useDispatch();

    // =========================================================
    // REDUX
    // =========================================================

    const {
        modal,
    } = useSelector(
        (state) => state.ui
    );

    const {
        size,
        loading,
    } = useSelector(
        (state) => state.size
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
    // ADD / EDIT MODE
    // =========================================================

    const isEdit =
        modal.type === "editSize";

    const isOpen =
        modal.open &&
        (
            modal.type === "addSize" ||
            modal.type === "editSize"
        );

    // =========================================================
    // LOCAL STATE
    // =========================================================

    const [errors, setErrors] =
        useState({});

    const [activeTab, setActiveTab] =
        useState("size");

    // =========================================================
    // FORM
    // =========================================================

    const form =
        size || {
            id: null,
            sizeName: "",
            sizeCode: "",
            description: "",
            status: "ACTIVE",
        };

    // =========================================================
    // NORMALIZE
    // =========================================================

    const normalizeModule = (
        value
    ) =>
        String(value ?? "")
            .trim()
            .toLowerCase();

    const normalizeAction = (
        value
    ) =>
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

    /*
     * SUPER_ADMIN and ADMIN have full access.
     */
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
        // FULL ACCESS
        // -----------------------------------------------------

        if (hasFullAccess) {
            return true;
        }

        const requestedModule =
            normalizeModule(
                moduleName
            );

        const requestedAction =
            normalizeAction(
                actionName
            );

        if (
            !Array.isArray(
                permissions
            )
        ) {
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
                        permission?.module?.name
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
                // GROUPED ACTIONS
                // -------------------------------------------------

                if (
                    Array.isArray(
                        permission?.actions
                    )
                ) {

                    const groupedPermission =
                        permission.actions.some(
                            (action) => {

                                // String action
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

                                // Object action
                                const actionName =
                                    normalizeAction(
                                        action?.actionName ||
                                        action?.action?.actionName ||
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

                    if (
                        groupedPermission
                    ) {
                        return true;
                    }
                }

                // -------------------------------------------------
                // DIRECT ACTION
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

    // =========================================================
    // CREATE / EDIT PERMISSION
    // =========================================================

    const requiredAction =
        isEdit
            ? "EDIT"
            : "CREATE";

    const hasRequiredPermission =
        hasPermission(
            "Sizes",
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
    // LOAD EXISTING DATA FOR EDIT
    // =========================================================

    useEffect(() => {

        if (
            modal.open &&
            modal.type === "editSize" &&
            modal.data
        ) {

            const existingSize =
                modal.data;

            dispatch(
                setSizeField({
                    field: "id",
                    value:
                        existingSize.id ??
                        null,
                })
            );

            dispatch(
                setSizeField({
                    field: "sizeName",
                    value:
                        existingSize.sizeName ??
                        "",
                })
            );

            dispatch(
                setSizeField({
                    field: "sizeCode",
                    value:
                        existingSize.sizeCode ??
                        "",
                })
            );

            dispatch(
                setSizeField({
                    field: "description",
                    value:
                        existingSize.description ??
                        "",
                })
            );

            dispatch(
                setSizeField({
                    field: "status",
                    value:
                        existingSize.status ??
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
            setSizeField({
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
            resetSizeForm()
        );

        setErrors({});
        setActiveTab("size");
    };

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
    // VALIDATION
    // =========================================================

    const validateSize = () => {

        const newErrors = {};

        if (
            !String(
                form.sizeName ?? ""
            ).trim()
        ) {

            newErrors.sizeName =
                "Size name is required";
        }

        if (
            !String(
                form.sizeCode ?? ""
            ).trim()
        ) {

            newErrors.sizeCode =
                "Size code is required";
        }

        setErrors(newErrors);

        if (
            newErrors.sizeName ||
            newErrors.sizeCode
        ) {

            setActiveTab("size");

            toast.error(
                "Please complete Size Information"
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
        // AUTH CHECK
        // -----------------------------------------------------

        if (!isAuthenticated) {

            toast.error(
                "You are not authenticated."
            );

            return;
        }

        // -----------------------------------------------------
        // PERMISSION LOADING CHECK
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
        // PERMISSION CHECK
        // -----------------------------------------------------

        if (!hasRequiredPermission) {

            toast.error(
                isEdit
                    ? "You do not have permission to edit sizes."
                    : "You do not have permission to create sizes."
            );

            return;
        }

        // -----------------------------------------------------
        // VALIDATION
        // -----------------------------------------------------

        if (!validateSize()) {
            return;
        }

        // -----------------------------------------------------
        // PAYLOAD
        // -----------------------------------------------------

        const payload = {

            sizeName:
                String(
                    form.sizeName ?? ""
                ).trim(),

            sizeCode:
                String(
                    form.sizeCode ?? ""
                ).trim(),

            description:
                String(
                    form.description ?? ""
                ).trim(),

            status:
                form.status ||
                "ACTIVE",
        };

        try {

            // =================================================
            // EDIT
            // =================================================

            if (isEdit) {

                const sizeId =
                    form.id ??
                    modal.data?.id;

                if (!sizeId) {

                    toast.error(
                        "Size ID is missing"
                    );

                    return;
                }

                await dispatch(
                    updateSize({
                        id: sizeId,
                        data: payload,
                    })
                ).unwrap();

                toast.success(
                    "Size updated successfully"
                );

            }

            // =================================================
            // CREATE
            // =================================================

            else {

                await dispatch(
                    createSize(
                        payload
                    )
                ).unwrap();

                toast.success(
                    "Size created successfully"
                );
            }

            // =================================================
            // CLOSE + RESET
            // =================================================

            dispatch(
                closeModal()
            );

            dispatch(
                resetSizeForm()
            );

            setErrors({});
            setActiveTab("size");

        } catch (error) {

            console.error(
                "Size save error:",
                error
            );

            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    error?.response?.data?.message ||
                    (
                        isEdit
                            ? "Failed to update size"
                            : "Failed to create size"
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
                            text-gray-500
                        "
                    >
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
    // Same structure as Category / SubCategory
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
    // ACCESS DENIED
    // Same open modal structure as Category / SubCategory
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

                                bg-red-50

                                flex
                                items-center
                                justify-center
                            "
                        >

                            <Ruler
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
                                Size access restricted
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
                                ? "You do not have permission to edit sizes."
                                : "You do not have permission to create sizes."
                            }
                        </p>

                    </div>

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
            id: "size",
            label: "Size Information",
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

                        <Ruler
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
                                ? "Edit Size"
                                : "New Size"}
                        </h2>

                        <p
                            className="
                                text-xs
                                text-gray-500
                                mt-0.5
                            "
                        >
                            {isEdit
                                ? "Update size information"
                                : "Create a new size"}
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
                            tab.id === "size" &&
                            (
                                errors.sizeName ||
                                errors.sizeCode
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
                        SIZE INFORMATION
                    ================================================= */}

                    {activeTab === "size" && (

                        <div>

                            <div className="mb-6">

                                <h3
                                    className="
                                        text-base
                                        font-semibold
                                        text-gray-800
                                    "
                                >
                                    Size Information
                                </h3>

                                <p
                                    className="
                                        text-xs
                                        text-gray-500
                                        mt-1
                                    "
                                >
                                    Configure the basic size information.
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

                                {/* SIZE NAME */}

                                <div>

                                    <label
                                        className={labelClass}
                                    >
                                        Size Name

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
                                            form.sizeName ??
                                            ""
                                        }
                                        onChange={(e) =>
                                            handleChange(
                                                "sizeName",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter size name"
                                        className={inputClass}
                                        disabled={loading}
                                    />

                                    {errors.sizeName && (
                                        <p
                                            className="
                                                text-xs
                                                text-red-500
                                                mt-1
                                            "
                                        >
                                            {
                                                errors.sizeName
                                            }
                                        </p>
                                    )}

                                </div>

                                {/* SIZE CODE */}

                                <div>

                                    <label
                                        className={labelClass}
                                    >
                                        Size Code

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
                                            form.sizeCode ??
                                            ""
                                        }
                                        onChange={(e) =>
                                            handleChange(
                                                "sizeCode",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter size code"
                                        className={inputClass}
                                        disabled={loading}
                                    />

                                    {errors.sizeCode && (
                                        <p
                                            className="
                                                text-xs
                                                text-red-500
                                                mt-1
                                            "
                                        >
                                            {
                                                errors.sizeCode
                                            }
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
                                            form.description ??
                                            ""
                                        }
                                        onChange={(e) =>
                                            handleChange(
                                                "description",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter size description"
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
                                    Size Settings
                                </h3>

                                <p
                                    className="
                                        text-xs
                                        text-gray-500
                                        mt-1
                                    "
                                >
                                    Configure the size availability
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
                                    ? "Update Size"
                                    : "Save Size"}

                        </button>

                    </div>

                </div>

            </form>

        </div>
    );
}