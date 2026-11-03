
import React, { useEffect, useMemo, useState } from "react";

import { useDispatch, useSelector } from "react-redux";

import { useNavigate, useParams } from "react-router-dom";

import {
    ArrowLeft,
    Users,
    UserRound,
    Mail,
    Phone,
    Save,
    ChevronDown,
    Loader2,
    RotateCcw,
    Hash,
} from "lucide-react";

import toast from "react-hot-toast";

import {
    createSalesPerson,
    fetchSalesPersonById,
    updateSalesPerson,
} from "../thunks/salesPersonThunks";

import {
    setSalesPersonField,
    resetSalesPersonForm,
    clearError,
} from "../slices/salesPersonSlice";

import {
    getUserPermission,
} from "../../menuPermission/thunks/menuPermissionThunks";

import CustomSelect from "../../../common/custom/CustomSelect";

/* =========================================================
   FORM FIELD
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

/* =========================================================
   TEXT INPUT
========================================================= */

const TextInput = ({
    value,
    onChange,
    placeholder,
    type = "text",
    disabled = false,
    maxLength,
}) => (
    <input
        type={type}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
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

/* =========================================================
   SECTION HEADING
========================================================= */

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

/* =========================================================
   MAIN COMPONENT
========================================================= */

const SalesPersonCreateNew = () => {

    const dispatch = useDispatch();

    const navigate = useNavigate();

    const { id } = useParams();

    const isEditMode = Boolean(id);

    /* =====================================================
       SALES PERSON REDUX STATE
    ===================================================== */

    const salesPersonState = useSelector(
        (state) => state.salesPerson ?? {}
    );

    const {
        salesPerson = {},
        loading = false,
    } = salesPersonState;

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

    const isSuperAdmin = normalizedRole === "SUPER_ADMIN";

    const isAdmin = normalizedRole === "ADMIN";

    const hasFullAccess = isSuperAdmin || isAdmin;

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

                if (groupedPermission) return true;
            }

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

    const hasRequiredPermission = hasPermission(
        "Sales Persons",
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

    /* =====================================================
       FETCH SALES PERSON DETAILS FOR EDIT
    ===================================================== */

    useEffect(() => {

        if (id) {
            dispatch(fetchSalesPersonById(id));
        } else {
            dispatch(resetSalesPersonForm());
            dispatch(clearError());
        }

    }, [dispatch, id]);

    /* =====================================================
       DROPDOWN OPTIONS
    ===================================================== */

    const salesPersonTypeOptions = useMemo(() => [
        {
            label: "Employee",
            value: "EMPLOYEE",
        },
    ], []);

    const statusOptions = useMemo(() => [
        {
            label: "Active",
            value: "ACTIVE",
        },
        {
            label: "Inactive",
            value: "INACTIVE",
        },
    ], []);

    /* =====================================================
       HANDLE SALES PERSON FIELD CHANGE
    ===================================================== */

    const handleChange = (field, value) => {

        dispatch(
            setSalesPersonField({
                field,
                value,
            })
        );
    };

    /* =====================================================
       RESET FORM
    ===================================================== */

    const handleReset = () => {

        dispatch(resetSalesPersonForm());

        dispatch(clearError());

        setSaveMode("close");

        setShowSaveOptions(false);
    };

    /* =====================================================
       VALIDATION
    ===================================================== */

    const validateForm = () => {

        if (!salesPerson.salesPersonType) {
            toast.error("Sales person type is required");
            return false;
        }

        if (!salesPerson.salesPersonName?.trim()) {
            toast.error("Sales person name is required");
            return false;
        }

        if (
            salesPerson.mobile &&
            !/^[0-9]{10}$/.test(salesPerson.mobile)
        ) {
            toast.error("Enter a valid 10-digit mobile number");
            return false;
        }

        if (
            salesPerson.email &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(salesPerson.email)
        ) {
            toast.error("Enter a valid email address");
            return false;
        }

        return true;
    };

    /* =====================================================
       CREATE / UPDATE SALES PERSON
    ===================================================== */

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (loading) return;

        if (!isAuthenticated) {
            toast.error("You are not authenticated");
            return;
        }

        if (!hasFullAccess && !permissionsLoaded) {
            toast.error("Permissions are still loading");
            return;
        }

        if (!hasRequiredPermission) {
            toast.error(
                `You do not have permission to ${isEditMode ? "edit" : "create"} sales persons`
            );
            return;
        }

        if (!validateForm()) return;

        const payload = {
            salesPersonCode:
                salesPerson.salesPersonCode?.trim() || null,

            salesPersonType:
                salesPerson.salesPersonType,

            salesPersonName:
                salesPerson.salesPersonName.trim(),

            email:
                salesPerson.email?.trim() || null,

            mobile:
                salesPerson.mobile?.trim() || null,

            status:
                salesPerson.status || "ACTIVE",
        };

        try {

            const response = isEditMode
                ? await dispatch(
                    updateSalesPerson({
                        id,
                        data: payload,
                    })
                ).unwrap()
                : await dispatch(
                    createSalesPerson(payload)
                ).unwrap();

            toast.success(
                response?.message ||
                (isEditMode
                    ? "Sales Person updated successfully"
                    : "Sales Person created successfully")
            );

            if (!isEditMode && saveMode === "new") {

                dispatch(resetSalesPersonForm());

                setSaveMode("close");

                return;
            }

            dispatch(resetSalesPersonForm());

            navigate("/salesPersons");

        } catch (error) {

            console.error(
                isEditMode
                    ? "Sales Person update error:"
                    : "Sales Person creation error:",
                error
            );

            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    (isEditMode
                        ? "Failed to update sales person"
                        : "Failed to create sales person")
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
            <div className="flex h-full items-center justify-center rounded-xl bg-white p-8">

                <div className="text-center">

                    <div className="
                        mx-auto mb-3 flex h-12 w-12 items-center
                        justify-center rounded-full bg-red-50
                        text-lg font-semibold text-red-500
                    ">
                        !
                    </div>

                    <h2 className="text-lg font-semibold text-gray-800">
                        Access Denied
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        You do not have permission to{" "}
                        {isEditMode ? "edit" : "create"} sales persons.
                    </p>

                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="
                            mt-5 rounded-lg bg-blue-600 px-5 py-2
                            text-sm font-medium text-white hover:bg-blue-700
                        "
                    >
                        Go Back
                    </button>

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
                mb-3 flex shrink-0 items-center justify-between
                rounded-xl border-b-[3px] border-[#B7E34A]
                bg-white px-5 py-4 shadow-sm
            ">

                <div className="flex items-center gap-3">

                    <button
                        type="button"
                        onClick={() => navigate(-1)}
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
                            {isEditMode
                                ? "Edit Sales Person"
                                : "Create Sales Person"}
                        </h2>

                        <p className="mt-0.5 text-xs text-gray-400">
                            {isEditMode
                                ? "Update sales person details"
                                : "Add a new sales person to your business"}
                        </p>

                    </div>

                </div>

                <div className="
                    hidden items-center gap-2 rounded-lg
                    bg-blue-50 px-3 py-2 sm:flex
                ">

                    <Users size={16} className="text-[#408DFB]" />

                    <span className="text-xs font-medium text-[#408DFB]">
                        Sales Person
                    </span>

                </div>

            </div>

            {/* FORM */}

            <form
                onSubmit={handleSubmit}
                className="
                    flex min-h-0 flex-1 flex-col
                    overflow-hidden rounded-xl bg-white shadow-sm
                "
            >

                {/* SCROLL BODY */}

                <div className="flex-1 overflow-y-auto p-5">

                    {/* SALES PERSON DETAILS */}

                    <section className="mb-7">

                        <SectionHeading
                            icon={UserRound}
                            title="Sales Person Information"
                            description="Enter the sales person type and contact information"
                        />

                        <div className="
                            grid grid-cols-1 gap-5
                            md:grid-cols-2 lg:grid-cols-3
                        ">

                            {/* SALES PERSON CODE */}

                            <FormField label="Sales Person Code">

                                <TextInput
                                    value={salesPerson.salesPersonCode}
                                    onChange={(e) =>
                                        handleChange(
                                            "salesPersonCode",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Auto generated"
                                    disabled={!isEditMode}
                                    maxLength={50}
                                />

                            </FormField>

                            {/* SALES PERSON TYPE */}

                            <FormField
                                label="Sales Person Type"
                                required
                            >

                                <CustomSelect
                                    value={
                                        salesPerson.salesPersonType || "EMPLOYEE"
                                    }
                                    onChange={(value) =>
                                        handleChange(
                                            "salesPersonType",
                                            value
                                        )
                                    }
                                    options={salesPersonTypeOptions}
                                    placeholder="Select sales person type"
                                />

                            </FormField>

                            {/* SALES PERSON NAME */}

                            <FormField
                                label="Sales Person Name"
                                required
                            >

                                <TextInput
                                    value={salesPerson.salesPersonName}
                                    onChange={(e) =>
                                        handleChange(
                                            "salesPersonName",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter sales person name"
                                    maxLength={150}
                                />

                            </FormField>

                            {/* EMAIL */}

                            <FormField label="Email">

                                <TextInput
                                    type="email"
                                    value={salesPerson.email}
                                    onChange={(e) =>
                                        handleChange(
                                            "email",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter email address"
                                    maxLength={150}
                                />

                            </FormField>

                            {/* MOBILE */}

                            <FormField label="Mobile">

                                <TextInput
                                    value={salesPerson.mobile}
                                    onChange={(e) =>
                                        handleChange(
                                            "mobile",
                                            e.target.value
                                                .replace(/\D/g, "")
                                                .slice(0, 10)
                                        )
                                    }
                                    placeholder="Enter 10-digit mobile"
                                    maxLength={10}
                                />

                            </FormField>

                            {/* STATUS */}

                            <FormField label="Status">

                                <CustomSelect
                                    value={salesPerson.status || "ACTIVE"}
                                    onChange={(value) =>
                                        handleChange(
                                            "status",
                                            value
                                        )
                                    }
                                    options={statusOptions}
                                    placeholder="Select status"
                                />

                            </FormField>

                        </div>

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
                        onClick={() => navigate(-1)}
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

                        {/* RESET */}

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

                        {/* SAVE / UPDATE */}

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
                                <Loader2
                                    size={16}
                                    className="animate-spin"
                                />
                            ) : (
                                <Save size={16} />
                            )}

                            {loading
                                ? isEditMode
                                    ? "Updating..."
                                    : "Saving..."
                                : isEditMode
                                    ? "Update"
                                    : "Save"
                            }

                        </button>

                        {/* SAVE OPTIONS */}

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

                                    {!isEditMode && (

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

                                    )}

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
                                        {isEditMode
                                            ? "Update & Close"
                                            : "Save & Close"}
                                    </button>

                                </div>

                            )}

                        </div>

                    </div>

                </div>

            </form>

        </div>
    );
};

export default SalesPersonCreateNew;