
import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    useDispatch,
    useSelector,
} from "react-redux";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    ChevronDown,
    Landmark,
    UserRoundArrowLeft,
    X,
} from "lucide-react";

import toast from "react-hot-toast";

import {
    resetClearanceForm,
    setClearanceField,
} from "../slices/clearanceSlice";

import {
    createClearance,
    updateClearance,
    fetchClearanceById,
} from "../thunks/clearanceThunks";

import {
    getUserPermission,
} from "../../menuPermission/thunks/menuPermissionThunks";

import CustomSelect from "../../../common/custom/CustomSelect";

const INITIAL_FORM = {
    id: null,
    partyId: "",
    clearanceAmount: "",
    paymentMethod: "CASH",
    bankAccountId: "",
    paymentReferenceNumber: "",
    clearanceDate: new Date().toISOString().slice(0, 10),
    remarks: "",
};

export default function ClearanceCreateSimple() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();

    const isEdit = Boolean(id);

    /* =========================================================
       REDUX
    ========================================================= */

    const clearanceState = useSelector(
        (state) => state.clearance || {}
    );

    const {
        clearance,
        loading,
    } = clearanceState;

    const authState = useSelector(
        (state) => state.auth || {}
    );

    const { user } = authState;

    const permissionState = useSelector(
        (state) => state.menuPermission || {}
    );

    const form = clearance || INITIAL_FORM;

    /* =========================================================
       AUTH
    ========================================================= */

    const isAuthenticated =
        authState.isAuthenticated !== false;

    const authChecking = Boolean(
        authState.authChecking ?? authState.loading
    );

    /* =========================================================
       EDIT LOADING
    ========================================================= */

    const [editLoading, setEditLoading] = useState(isEdit);

    const [editLoadError, setEditLoadError] = useState(false);

    /* =========================================================
       PERMISSIONS
    ========================================================= */

    const userPermissions = Array.isArray(
        permissionState.userPermissions
    )
        ? permissionState.userPermissions
        : [];

    const permissionLoading = Boolean(
        permissionState.userPermissionsLoading ??
        permissionState.loading
    );

    const permissionsLoaded =
        permissionState.userPermissionsLoaded === true ||
        permissionState.permissionsLoaded === true ||
        permissionState.loaded === true ||
        (
            permissionState.userPermissions !== undefined &&
            permissionState.userPermissions !== null
        );

    /* =========================================================
       LOCAL STATE
    ========================================================= */

    const [activeTab, setActiveTab] = useState("clearance");

    const [showSaveMenu, setShowSaveMenu] = useState(false);

    /* =========================================================
       ROLE
    ========================================================= */

    const normalizeModule = (value) =>
        String(value ?? "")
            .trim()
            .toLowerCase()
            .replace(/\s+/g, " ");

    const normalizeAction = (value) =>
        String(value ?? "")
            .trim()
            .toUpperCase()
            .replace(/[\s-]+/g, "_");

    const role = useMemo(() => {
        return (
            user?.roleName ||
            user?.role?.roleName ||
            user?.role?.name ||
            user?.role ||
            user?.authority ||
            ""
        );
    }, [user]);

    const normalizedRole = normalizeAction(role);

    const isSuperAdmin =
        normalizedRole === "SUPER_ADMIN";

    const isAdmin =
        normalizedRole === "ADMIN";

    const hasFullAccess =
        isSuperAdmin || isAdmin;

    /* =========================================================
       PERMISSION CHECK
    ========================================================= */

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

        return userPermissions.some((permission) => {
            const permissionModule = normalizeModule(
                permission?.moduleName ||
                permission?.module?.moduleName ||
                permission?.module?.name ||
                ""
            );

            if (permissionModule !== requestedModule) {
                return false;
            }

            if (permission?.active === false) {
                return false;
            }

            if (
                normalizeAction(permission?.status) ===
                "INACTIVE"
            ) {
                return false;
            }

            if (Array.isArray(permission?.actions)) {
                const nestedAllowed =
                    permission.actions.some((action) => {
                        if (typeof action === "string") {
                            return (
                                normalizeAction(action) ===
                                requestedAction
                            );
                        }

                        const actionName = normalizeAction(
                            action?.actionName ||
                            action?.action?.actionName ||
                            action?.action?.name ||
                            action?.name ||
                            ""
                        );

                        const allowed =
                            action?.allowed === true ||
                            action?.allowed === "true" ||
                            action?.isAllowed === true ||
                            action?.isAllowed === "true";

                        if (action?.active === false) {
                            return false;
                        }

                        if (
                            normalizeAction(action?.status) ===
                            "INACTIVE"
                        ) {
                            return false;
                        }

                        return (
                            actionName === requestedAction &&
                            allowed
                        );
                    });

                if (nestedAllowed) {
                    return true;
                }
            }

            const actionName = normalizeAction(
                permission?.actionName ||
                permission?.action?.actionName ||
                permission?.action?.name ||
                ""
            );

            const allowed =
                permission?.allowed === true ||
                permission?.allowed === "true" ||
                permission?.isAllowed === true ||
                permission?.isAllowed === "true";

            return (
                actionName === requestedAction &&
                allowed
            );
        });
    };

    /* =========================================================
       CREATE / EDIT PERMISSION
    ========================================================= */

    const hasCreatePermission = hasPermission(
        "Clearances",
        "CREATE"
    );

    const hasEditPermission = hasPermission(
        "Clearances",
        "EDIT"
    );

    const hasSavePermission = isEdit
        ? hasEditPermission
        : hasCreatePermission;

    /* =========================================================
       LOAD PERMISSIONS
    ========================================================= */

    useEffect(() => {
        if (
            authChecking ||
            !isAuthenticated ||
            hasFullAccess
        ) {
            return;
        }

        if (
            !permissionsLoaded &&
            !permissionLoading
        ) {
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
       LOAD EXISTING CLEARANCE
    ========================================================= */

    useEffect(() => {
        let cancelled = false;

        const loadClearance = async () => {
            if (!isEdit) {
                setEditLoading(false);
                setEditLoadError(false);
                return;
            }

            setEditLoading(true);
            setEditLoadError(false);

            dispatch(resetClearanceForm());

            try {
                const response = await dispatch(
                    fetchClearanceById(id)
                ).unwrap();

                if (cancelled) {
                    return;
                }

                const record =
                    response?.data?.data ??
                    response?.data ??
                    response?.clearance ??
                    response?.creditClearance ??
                    response;

                if (
                    !record ||
                    typeof record !== "object" ||
                    Array.isArray(record) ||
                    record.id == null
                ) {
                    throw new Error(
                        "Clearance details were not found."
                    );
                }

                const populatedForm = {
                    ...INITIAL_FORM,
                    ...record,

                    id: record.id,

                    partyId:
                        record.partyId ??
                        record.party?.id ??
                        "",

                    clearanceAmount:
                        record.clearanceAmount ?? "",

                    paymentMethod:
                        record.paymentMethod ?? "CASH",

                    bankAccountId:
                        record.bankAccountId ??
                        record.bankAccount?.id ??
                        "",

                    paymentReferenceNumber:
                        record.paymentReferenceNumber ?? "",

                    clearanceDate:
                        record.clearanceDate ??
                        INITIAL_FORM.clearanceDate,

                    remarks:
                        record.remarks ?? "",
                };

                Object.entries(populatedForm).forEach(
                    ([field, value]) => {
                        dispatch(
                            setClearanceField({
                                field,
                                value,
                            })
                        );
                    }
                );
            } catch (error) {
                if (cancelled) {
                    return;
                }

                console.error(
                    "Failed to load clearance:",
                    error
                );

                setEditLoadError(true);

                toast.error(
                    typeof error === "string"
                        ? error
                        : error?.message ||
                        "Failed to load clearance details."
                );
            } finally {
                if (!cancelled) {
                    setEditLoading(false);
                }
            }
        };

        loadClearance();

        return () => {
            cancelled = true;
        };
    }, [dispatch, id, isEdit]);

    /* =========================================================
       TABS
    ========================================================= */

    const tabs = [
        {
            id: "clearance",
            label: "Clearance Details",
        },
        {
            id: "payment",
            label: "Payment Details",
        },
        {
            id: "remarks",
            label: "Remarks",
        },
        {
            id: "settings",
            label: "Settings",
        },
    ];

    /* =========================================================
       FIELD HANDLER
    ========================================================= */

    const handleChange = (field, value) => {
        dispatch(
            setClearanceField({
                field,
                value,
            })
        );
    };

    /* =========================================================
       CLOSE
    ========================================================= */

    const handleClose = () => {
        if (loading || editLoading) {
            return;
        }

        setShowSaveMenu(false);

        dispatch(resetClearanceForm());

        setActiveTab("clearance");

        navigate("/clearances");
    };

    /* =========================================================
       ESCAPE
    ========================================================= */

    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key !== "Escape") {
                return;
            }

            handleClose();
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
    }, [loading, editLoading]);

    /* =========================================================
       SAVE
    ========================================================= */

    const handleSave = async ({
        saveAndNew = false,
        saveAndClose = true,
    } = {}) => {
        if (!isAuthenticated) {
            toast.error(
                "You are not authenticated."
            );
            return;
        }

        if (loading || editLoading) {
            return;
        }

        if (isEdit && editLoadError) {
            toast.error(
                "Cannot update because clearance details failed to load."
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

        if (!hasSavePermission) {
            toast.error(
                isEdit
                    ? "You do not have permission to edit clearances."
                    : "You do not have permission to create clearances."
            );
            return;
        }

        /* PARTY ID */

        if (
            !form.partyId ||
            !Number.isInteger(Number(form.partyId)) ||
            Number(form.partyId) <= 0
        ) {
            setActiveTab("clearance");
            toast.error("A valid party ID is required.");
            return;
        }

        /* AMOUNT */

        if (
            form.clearanceAmount === "" ||
            !Number.isFinite(Number(form.clearanceAmount)) ||
            Number(form.clearanceAmount) <= 0
        ) {
            setActiveTab("clearance");
            toast.error(
                "Clearance amount must be greater than zero."
            );
            return;
        }

        /* PAYMENT METHOD */

        const allowedMethods = [
            "CASH",
            "BANK_TRANSFER",
            "CHEQUE",
            "UPI",
            "CARD",
        ];

        if (!allowedMethods.includes(form.paymentMethod)) {
            setActiveTab("payment");
            toast.error("Please select a valid payment method.");
            return;
        }

        /* BANK ACCOUNT */

        if (
            ["BANK_TRANSFER", "CHEQUE"].includes(
                form.paymentMethod
            ) &&
            (
                !form.bankAccountId ||
                Number(form.bankAccountId) <= 0
            )
        ) {
            setActiveTab("payment");
            toast.error(
                "Bank account ID is required for this payment method."
            );
            return;
        }

        /* DATE */

        if (!form.clearanceDate) {
            setActiveTab("payment");
            toast.error("Clearance date is required.");
            return;
        }

        /* PAYLOAD */

        const payload = {
            partyId: Number(form.partyId),

            clearanceAmount: Number(
                form.clearanceAmount
            ),

            paymentMethod: form.paymentMethod,

            bankAccountId: form.bankAccountId
                ? Number(form.bankAccountId)
                : null,

            paymentReferenceNumber:
                form.paymentReferenceNumber?.trim() || "",

            clearanceDate: form.clearanceDate,

            remarks: form.remarks?.trim() || "",
        };

        /* CREATE / UPDATE */

        try {
            if (isEdit) {
                await dispatch(
                    updateClearance({
                        id: Number(id),
                        data: payload,
                    })
                ).unwrap();

                toast.success(
                    "Clearance updated successfully."
                );
            } else {
                await dispatch(
                    createClearance(payload)
                ).unwrap();

                toast.success(
                    "Clearance created successfully."
                );
            }

            setShowSaveMenu(false);

            if (saveAndNew && !isEdit) {
                dispatch(resetClearanceForm());
                setActiveTab("clearance");
                return;
            }

            dispatch(resetClearanceForm());
            setActiveTab("clearance");

            if (saveAndClose) {
                navigate("/clearances");
            }
        } catch (error) {
            console.error(
                isEdit
                    ? "Clearance update error:"
                    : "Clearance create error:",
                error
            );

            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    error?.response?.data?.message ||
                    (
                        isEdit
                            ? "Failed to update clearance."
                            : "Failed to create clearance."
                    )
            );
        }
    };

    /* =========================================================
       AUTH CHECK
    ========================================================= */

    if (authChecking) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-sm text-gray-500">
                    Checking authentication...
                </div>
            </div>
        );
    }

    /* =========================================================
       NOT AUTHENTICATED
    ========================================================= */

    if (!isAuthenticated) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50 px-6">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-10 text-center max-w-md w-full">
                    <UserRoundArrowLeft
                        className="mx-auto text-red-500 mb-4"
                        size={42}
                    />

                    <h2 className="text-lg font-semibold text-gray-800">
                        Authentication Required
                    </h2>

                    <p className="text-sm text-gray-500 mt-2">
                        Please sign in to manage clearances.
                    </p>

                    <button
                        type="button"
                        onClick={() => navigate("/clearances")}
                        className="mt-6 px-5 py-2.5 rounded-md bg-[#0F4659] hover:bg-[#0F4659]/90 text-white text-sm font-medium"
                    >
                        Back to Clearances
                    </button>
                </div>
            </div>
        );
    }

    /* =========================================================
       PERMISSION LOADING
    ========================================================= */

    if (
        !hasFullAccess &&
        (
            permissionLoading ||
            !permissionsLoaded
        )
    ) {
        return (
            <div className="flex items-center justify-center min-h-40">
                <div className="text-center">
                    <div className="w-10 h-10 mx-auto mb-3 border-2 border-[#0F4659]/20 border-t-[#0F4659] rounded-full animate-spin" />

                    <p className="text-sm font-medium text-gray-600">
                        Loading permissions...
                    </p>
                </div>
            </div>
        );
    }

    /* =========================================================
       ACCESS DENIED
    ========================================================= */

    if (!hasSavePermission) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="w-full max-w-md text-center">
                    <div className="flex flex-col items-center">
                        <div className="w-11 h-11 rounded-lg bg-red-50 flex items-center justify-center mb-3">
                            <UserRoundArrowLeft
                                size={21}
                                className="text-red-500"
                            />
                        </div>

                        <h2 className="text-[17px] font-semibold text-gray-800">
                            Access Denied
                        </h2>

                        <p className="mt-1.5 text-sm text-gray-500 leading-5">
                            {isEdit
                                ? "You do not have permission to edit clearances."
                                : "You do not have permission to create clearances."}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    /* =========================================================
       EDIT LOADING
    ========================================================= */

    if (editLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-64 bg-gray-50">
                <div className="w-10 h-10 mb-3 border-2 border-[#0F4659]/20 border-t-[#0F4659] rounded-full animate-spin" />

                <p className="text-sm font-medium text-[#0F4659]">
                    Loading clearance details...
                </p>
            </div>
        );
    }

    /* =========================================================
       EDIT LOAD ERROR
    ========================================================= */

    if (isEdit && editLoadError) {
        return (
            <div className="flex items-center justify-center min-h-64 px-4">
                <div className="w-full max-w-md p-8 bg-white border border-gray-200 rounded-xl text-center">
                    <Landmark
                        size={32}
                        className="mx-auto mb-3 text-red-500"
                    />

                    <h2 className="text-lg font-semibold text-[#0F4659]">
                        Unable to Load Clearance
                    </h2>

                    <p className="text-sm text-gray-500 mt-2">
                        The clearance could not be loaded. Please return to the clearance list and try again.
                    </p>

                    <button
                        type="button"
                        onClick={() => navigate("/clearances")}
                        className="mt-5 h-10 px-5 rounded-md bg-[#0F4659] text-white text-sm font-medium hover:bg-[#0F4659]/90"
                    >
                        Back to Clearances
                    </button>
                </div>
            </div>
        );
    }

    /* =========================================================
       INPUT STYLES
    ========================================================= */

    const inputClass =
        "w-full h-10 border border-gray-300 rounded-md px-3 text-sm bg-white focus:outline-none focus:border-[#408DFB] focus:ring-2 focus:ring-[#408DFB]/20 transition";

    const getLabelClass = (required = false) => `
        block
        text-xs
        font-medium
        ${required ? "text-red-500" : "text-gray-400"}
        mb-1.5
    `;

    /* =========================================================
       CLEARANCE TAB
    ========================================================= */

    const renderClearanceTab = () => (
        <div className="w-full max-w-7xl">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="mb-6">
                    <h2 className="text-base font-semibold text-gray-500">
                        Clearance Information
                    </h2>

                    <p className="text-sm text-gray-400 mt-1">
                        Enter the party and amount for this clearance.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-8 items-start">
                    <div className="space-y-5">
                        <div>
                            <label className={getLabelClass(true)}>
                                Party ID
                                <span className="text-red-500 ml-1">*</span>
                            </label>

                            <input
                                type="number"
                                min="1"
                                value={form.partyId ?? ""}
                                onChange={(e) =>
                                    handleChange(
                                        "partyId",
                                        e.target.value
                                    )
                                }
                                placeholder="Enter party ID"
                                className={inputClass}
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label className={getLabelClass(true)}>
                                Clearance Amount
                                <span className="text-red-500 ml-1">*</span>
                            </label>

                            <input
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={form.clearanceAmount ?? ""}
                                onChange={(e) =>
                                    handleChange(
                                        "clearanceAmount",
                                        e.target.value
                                    )
                                }
                                placeholder="Enter clearance amount"
                                className={inputClass}
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label className={getLabelClass(true)}>
                                Clearance Date
                                <span className="text-red-500 ml-1">*</span>
                            </label>

                            <input
                                type="date"
                                value={form.clearanceDate ?? ""}
                                onChange={(e) =>
                                    handleChange(
                                        "clearanceDate",
                                        e.target.value
                                    )
                                }
                                className={inputClass}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-4">
                            <Landmark
                                size={18}
                                className="text-gray-500"
                            />

                            <h3 className="text-sm font-semibold text-gray-500">
                                Clearance Summary
                            </h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-gray-500">
                                    Party ID
                                </p>

                                <p className="text-sm font-medium text-gray-400 mt-1">
                                    {form.partyId || "Not selected"}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-500">
                                    Clearance Amount
                                </p>

                                <p className="text-lg font-semibold text-gray-400 mt-1">
                                    {Number(
                                        form.clearanceAmount || 0
                                    ).toLocaleString("en-IN", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-500">
                                    Payment Method
                                </p>

                                <p className="text-sm font-medium text-gray-400 mt-1">
                                    {form.paymentMethod || "CASH"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    /* =========================================================
       PAYMENT TAB
    ========================================================= */

    const renderPaymentTab = () => (
        <div className="w-full max-w-7xl">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="mb-6">
                    <h2 className="text-base font-semibold text-gray-500">
                        Payment Information
                    </h2>

                    <p className="text-sm text-gray-400 mt-1">
                        Select the payment method and enter transaction details.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl">
                    <div>
                        <label className={getLabelClass(true)}>
                            Payment Method
                            <span className="text-red-500 ml-1">*</span>
                        </label>

                        <CustomSelect
                            value={form.paymentMethod || "CASH"}
                            onChange={(value) => {
                                handleChange("paymentMethod", value);

                                if (
                                    !["BANK_TRANSFER", "CHEQUE"].includes(value)
                                ) {
                                    handleChange("bankAccountId", "");
                                }
                            }}
                            options={[
                                { value: "CASH", label: "CASH" },
                                { value: "BANK_TRANSFER", label: "BANK TRANSFER" },
                                { value: "CHEQUE", label: "CHEQUE" },
                                { value: "UPI", label: "UPI" },
                                { value: "CARD", label: "CARD" },
                            ]}
                        />
                    </div>

                    {["BANK_TRANSFER", "CHEQUE"].includes(
                        form.paymentMethod
                    ) && (
                            <div>
                                <label className={getLabelClass(true)}>
                                    Bank Account ID
                                    <span className="text-red-500 ml-1">*</span>
                                </label>

                                <input
                                    type="number"
                                    min="1"
                                    value={form.bankAccountId ?? ""}
                                    onChange={(e) =>
                                        handleChange(
                                            "bankAccountId",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter bank account ID"
                                    className={inputClass}
                                    disabled={loading}
                                />
                            </div>
                        )}

                    <div className="md:col-span-2">
                        <label className={getLabelClass()}>
                            Payment Reference Number
                        </label>

                        <input
                            type="text"
                            value={form.paymentReferenceNumber || ""}
                            onChange={(e) =>
                                handleChange(
                                    "paymentReferenceNumber",
                                    e.target.value
                                )
                            }
                            placeholder="Enter transaction or cheque reference"
                            className={inputClass}
                            disabled={loading}
                        />
                    </div>
                </div>

                <div className="mt-7 p-4 rounded-lg bg-[#0F4659]/5 border border-[#0F4659]/20 max-w-5xl">
                    <p className="text-sm font-medium text-gray-500">
                        Payment Method
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                        {form.paymentMethod || "CASH"}
                    </p>
                </div>
            </div>
        </div>
    );

    /* =========================================================
       REMARKS TAB
    ========================================================= */

    const renderRemarksTab = () => (
        <div className="w-full max-w-7xl">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="mb-6">
                    <h2 className="text-base font-semibold text-gray-500">
                        Remarks
                    </h2>

                    <p className="text-sm text-gray-400 mt-1">
                        Add any additional information about this clearance.
                    </p>
                </div>

                <div className="max-w-5xl">
                    <label className={getLabelClass()}>
                        Remarks / Description
                    </label>

                    <textarea
                        rows={6}
                        value={form.remarks || ""}
                        onChange={(e) =>
                            handleChange(
                                "remarks",
                                e.target.value
                            )
                        }
                        placeholder="Enter clearance remarks..."
                        className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm bg-white resize-none focus:outline-none focus:border-[#0F4659] focus:ring-2 focus:ring-[#0F4659]/20"
                        disabled={loading}
                    />
                </div>
            </div>
        </div>
    );

    /* =========================================================
       SETTINGS TAB
    ========================================================= */

    const renderSettingsTab = () => (
        <div className="w-full max-w-7xl">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="mb-6">
                    <h2 className="text-base font-semibold text-gray-500">
                        Clearance Settings
                    </h2>

                    <p className="text-sm text-gray-400 mt-1">
                        Review the clearance record before saving.
                    </p>
                </div>

                <div className="max-w-md border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Landmark
                            size={18}
                            className="text-gray-500"
                        />

                        <h3 className="text-sm font-semibold text-gray-500">
                            Record Information
                        </h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <p className="text-xs text-gray-500">
                                Record Type
                            </p>

                            <p className="text-sm font-medium text-gray-400 mt-1">
                                Credit Clearance
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500">
                                Operation
                            </p>

                            <p className="text-sm font-medium text-gray-400 mt-1">
                                {isEdit ? "Update existing clearance" : "Create new clearance"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500">
                                Clearance Date
                            </p>

                            <p className="text-sm font-medium text-gray-400 mt-1">
                                {form.clearanceDate || "Not selected"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    /* =========================================================
       MAIN UI
    ========================================================= */

    return (
        <div className="flex flex-col h-full min-h-0 bg-gray-50 px-3.5 py-5">
            {/* HEADER */}

            <div className="shrink-0 px-6 py-4 bg-white border border-lime-500 rounded flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-lg bg-[#408DFB] border border-blue-100 flex items-center justify-center cursor-pointer"
                        onClick={() => navigate("/clearances")}
                    >
                        <Landmark
                            size={20}
                            className="text-gray-100"
                        />
                    </div>

                    <div>
                        <h1
                            className="text-lg font-semibold text-gray-500 cursor-pointer"
                            onClick={() => navigate("/clearances")}
                        >
                            {isEdit
                                ? "Edit Clearance"
                                : "New Clearance"}
                        </h1>

                        <p className="text-xs text-gray-400 mt-0.5">
                            {isEdit
                                ? `Update clearance details${form.id ? ` — #${form.id}` : ""}`
                                : "Create a new credit clearance"}
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    disabled={loading || editLoading}
                    onClick={handleClose}
                    className="px-2 py-1 text-gray-100 bg-red-500 hover:text-gray-100 hover:bg-red-400  rounded disabled:opacity-50"
                >
                    <X size={20} />
                </button>
            </div>

            {/* TABS */}

            <div className="shrink-0 px-6 bg-white border-b border-gray-200 flex items-center gap-7 overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-3 text-sm font-medium border-b-2 whitespace-nowrap transition ${activeTab === tab.id
                            ? "text-gray-500 border-lime-500"
                            : "text-gray-400 border-transparent hover:text-gray-500"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* BODY */}

            <div className="flex-1 min-h-0 overflow-y-auto py-6">
                {activeTab === "clearance" && renderClearanceTab()}

                {activeTab === "payment" && renderPaymentTab()}

                {activeTab === "remarks" && renderRemarksTab()}

                {activeTab === "settings" && renderSettingsTab()}
            </div>

            {/* FOOTER */}

            <div className="shrink-0 border-t border-gray-200 bg-white px-6 py-2 flex items-center justify-end gap-3 mr-13">
                <div className="text-xs text-gray-500">
                    <span className="text-red-500">*</span>
                    {" "}Required fields
                </div>

                <div className="flex items-center justify-end gap-3">
                    <button
                        type="button"
                        disabled={loading || editLoading}
                        onClick={handleClose}
                        className="h-10 px-5 border border-gray-300 rounded-md 
                        bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>

                    <div className="relative flex">
                        <button
                            type="button"
                            disabled={loading || editLoading}
                            onClick={() =>
                                handleSave({
                                    saveAndNew: false,
                                    saveAndClose: true,
                                })
                            }
                            className="h-10 px-5 bg-[#408DFB] hover:bg-[#408DFB]/90 text-white text-sm font-medium rounded-l-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading
                                ? isEdit ? "Updating..." : "Saving..."
                                : isEdit ? "Update Clearance" : "Save Clearance"}
                        </button>

                        <button
                            type="button"
                            disabled={loading || editLoading}
                            onClick={() =>
                                setShowSaveMenu((previous) => !previous)
                            }
                            className="h-10 w-10 bg-[#408DFB] hover:bg-[#408DFB]/90 text-white rounded-r-md border-l border-white flex items-center justify-center disabled:opacity-50"
                        >
                            <ChevronDown
                                size={16}
                                className={
                                    showSaveMenu
                                        ? "rotate-180 transition-transform"
                                        : "transition-transform"
                                }
                            />
                        </button>

                        {showSaveMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-[80]"
                                    onClick={() => setShowSaveMenu(false)}
                                />

                                <div className="absolute right-0 bottom-full mb-2 w-56 bg-white border border-gray-200 rounded-md shadow-xl z-[90] overflow-hidden">
                                    {!isEdit && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowSaveMenu(false);

                                                handleSave({
                                                    saveAndNew: true,
                                                    saveAndClose: false,
                                                });
                                            }}
                                            className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100"
                                        >
                                            <div className="font-medium text-sm text-gray-700">
                                                Save & New
                                            </div>

                                            <div className="text-xs text-gray-400 mt-0.5">
                                                Save and create another clearance
                                            </div>
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowSaveMenu(false);

                                            handleSave({
                                                saveAndNew: false,
                                                saveAndClose: true,
                                            });
                                        }}
                                        className="w-full text-left px-4 py-3 hover:bg-gray-50"
                                    >
                                        <div className="font-medium text-sm text-gray-700">
                                            {isEdit
                                                ? "Update & Close"
                                                : "Save & Close"}
                                        </div>

                                        <div className="text-xs text-gray-400 mt-0.5">
                                            {isEdit
                                                ? "Update and return to clearances"
                                                : "Save and return to clearances"}
                                        </div>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
