
import React, {
    useEffect,
    useState,
} from "react";

import {
    useDispatch,
    useSelector,
} from "react-redux";

import {
    Building2,
    Upload,
    UserRoundArrowLeft,
} from "lucide-react";

import toast from "react-hot-toast";

import {
    closeModal,
} from "../../ui/uiSlice";

import {
    resetCompanyForm,
} from "../slices/companySlice";

import {
    createCompany,
    updateCompany,
} from "../thunks/companyThunks";

import {
    getUserPermission,
} from "../../menuPermission/thunks/menuPermissionThunks";


/* =========================================================
   COMPANY IMAGE URL
========================================================= */

const getCompanyImageUrl = (imageUrl) => {
    if (!imageUrl) {
        return "";
    }

    if (
        imageUrl.startsWith("http://") ||
        imageUrl.startsWith("https://")
    ) {
        return imageUrl.replace(
            "http://localhost:8080",
            "http://localhost:8081"
        );
    }

    return `http://localhost:8081/api/v1.0/uploads/companies/${imageUrl}`;
};


/* =========================================================
   INITIAL FORM
========================================================= */

const INITIAL_FORM = {
    id: null,
    companyName: "",
    displayName: "",
    legalName: "",
    companyCode: "",
    gstNumber: "",
    panNumber: "",
    tanNumber: "",
    email: "",
    phone: "",
    alternatePhone: "",
    website: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    invoicePrefix: "NT",
    invoiceStartNumber: 1,
    currency: "INR",
    financialYearStart: "",
    status: "ACTIVE",
    logo: null,
    signature: null,
    logoUrl: "",
    signatureUrl: "",
};


/* =========================================================
   COMPANY CREATE
========================================================= */

export default function CompanyCreate() {

    const dispatch = useDispatch();



    /* =======================================================
       MODAL
    ======================================================= */

    const modal = useSelector(
        (state) => state.ui?.modal
    );


    /* =======================================================
       COMPANY STATE
    ======================================================= */

    const {
        loading,
    } = useSelector(
        (state) => state.company
    );


    /* =======================================================
       AUTH
    ======================================================= */

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


    /* =======================================================
       PERMISSIONS
    ======================================================= */

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


    /* =======================================================
       MODAL MODE
    ======================================================= */

    const isEdit =
        modal?.type === "editCompany";

    const isAdd =
        modal?.type === "addCompany";

    const isOpen =
        modal?.open &&
        (
            isAdd ||
            isEdit
        );


    /* =======================================================
       ROLE / ACCESS
    ======================================================= */

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


    /* =======================================================
       HAS PERMISSION
    ======================================================= */

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


    /* =======================================================
       REQUIRED PERMISSION
    ======================================================= */

    const requiredAction =
        isEdit
            ? "EDIT"
            : "CREATE";

    const hasRequiredPermission =
        hasPermission(
            "Company Detail",
            requiredAction
        );


    /* =======================================================
       FORM
    ======================================================= */

    const [form, setForm] =
        useState(
            INITIAL_FORM
        );

    const [errors, setErrors] =
        useState({});

    const [activeTab, setActiveTab] =
        useState("basic");


    /* =======================================================
       IMAGE PREVIEWS
    ======================================================= */

    const [logoPreview, setLogoPreview] =
        useState("");

    const [signaturePreview, setSignaturePreview] =
        useState("");


    /* =======================================================
       PERMISSION LOADING
    ======================================================= */

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


    /* =======================================================
       RESET FORM
    ======================================================= */

    const resetLocalForm = () => {

        setForm({
            ...INITIAL_FORM,
        });

        setErrors({});

        setLogoPreview("");

        setSignaturePreview("");

        setActiveTab("basic");
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

        const logoUrl =
            data.logoUrl ??
            data.logo ??
            "";

        const signatureUrl =
            data.signatureUrl ??
            data.signature ??
            "";

        setForm({

            id:
                data.id ??
                null,

            companyName:
                data.companyName ??
                "",

            displayName:
                data.displayName ??
                "",

            legalName:
                data.legalName ??
                "",

            companyCode:
                data.companyCode ??
                "",

            gstNumber:
                data.gstNumber ??
                "",

            panNumber:
                data.panNumber ??
                "",

            tanNumber:
                data.tanNumber ??
                "",

            email:
                data.email ??
                "",

            phone:
                data.phone ??
                "",

            alternatePhone:
                data.alternatePhone ??
                "",

            website:
                data.website ??
                "",

            addressLine1:
                data.addressLine1 ??
                "",

            addressLine2:
                data.addressLine2 ??
                "",

            city:
                data.city ??
                "",

            state:
                data.state ??
                "",

            country:
                data.country ??
                "India",

            pincode:
                data.pincode ??
                "",

            invoicePrefix:
                data.invoicePrefix ??
                "NT",

            invoiceStartNumber:
                data.invoiceStartNumber ??
                1,

            currency:
                data.currency ??
                "INR",

            financialYearStart:
                data.financialYearStart ??
                "",

            status:
                data.status ??
                "ACTIVE",

            logo: null,

            signature: null,

            logoUrl:
                logoUrl,

            signatureUrl:
                signatureUrl,
        });

        setLogoPreview(
            logoUrl
                ? getCompanyImageUrl(
                    logoUrl
                )
                : ""
        );

        setSignaturePreview(
            signatureUrl
                ? getCompanyImageUrl(
                    signatureUrl
                )
                : ""
        );

        setErrors({});

    }, [
        isOpen,
        isEdit,
        modal?.data,
    ]);


    /* =======================================================
       RESET ADD MODAL
    ======================================================= */

    useEffect(() => {

        if (
            !isOpen ||
            isEdit
        ) {
            return;
        }

        resetLocalForm();

    }, [
        isOpen,
        isEdit,
    ]);


    /* =======================================================
       FIELD CHANGE
    ======================================================= */

    const handleChange = (
        field,
        value
    ) => {

        setForm(
            (prev) => ({
                ...prev,
                [field]: value,
            })
        );

        setErrors(
            (prev) => ({
                ...prev,
                [field]: "",
            })
        );
    };


    /* =======================================================
       LOGO CHANGE
    ======================================================= */

    const handleLogoChange =
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
                    "Please select a valid logo image"
                );

                return;
            }

            setForm(
                (prev) => ({
                    ...prev,
                    logo: file,
                })
            );

            const preview =
                URL.createObjectURL(
                    file
                );

            setLogoPreview(
                preview
            );

            setErrors(
                (prev) => ({
                    ...prev,
                    logo: "",
                })
            );
        };


    /* =======================================================
       SIGNATURE CHANGE
    ======================================================= */

    const handleSignatureChange =
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
                    "Please select a valid signature image"
                );

                return;
            }

            setForm(
                (prev) => ({
                    ...prev,
                    signature: file,
                })
            );

            const preview =
                URL.createObjectURL(
                    file
                );

            setSignaturePreview(
                preview
            );

            setErrors(
                (prev) => ({
                    ...prev,
                    signature: "",
                })
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

            resetLocalForm();
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

    const validateCompanyTabs = () => {

        const newErrors = {};


        /* =====================================================
           BASIC DETAILS
        ===================================================== */

        if (!form.companyName?.trim()) {
            newErrors.companyName =
                "Company name is required";
        }

        if (!form.companyCode?.trim()) {
            newErrors.companyCode =
                "Company code is required";
        }

        if (form.email?.trim()) {

            const emailRegex =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (
                !emailRegex.test(
                    form.email.trim()
                )
            ) {
                newErrors.email =
                    "Enter a valid email address";
            }
        }

        if (!form.phone?.trim()) {

            newErrors.phone =
                "Phone number is required";

        } else if (
            !/^\d{10}$/.test(
                form.phone.trim()
            )
        ) {

            newErrors.phone =
                "Phone number must contain 10 digits";
        }

        if (
            form.alternatePhone?.trim() &&
            !/^\d{10}$/.test(
                form.alternatePhone.trim()
            )
        ) {

            newErrors.alternatePhone =
                "Alternate phone must contain 10 digits";
        }


        /* =====================================================
           TAX & COMPLIANCE
        ===================================================== */

        if (form.gstNumber?.trim()) {

            const gstRegex =
                /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

            if (
                !gstRegex.test(
                    form.gstNumber
                        .trim()
                        .toUpperCase()
                )
            ) {

                newErrors.gstNumber =
                    "Enter a valid GST number";
            }
        }

        if (form.panNumber?.trim()) {

            const panRegex =
                /^[A-Z]{5}[0-9]{4}[A-Z]$/;

            if (
                !panRegex.test(
                    form.panNumber
                        .trim()
                        .toUpperCase()
                )
            ) {

                newErrors.panNumber =
                    "Enter a valid PAN number";
            }
        }

        if (form.tanNumber?.trim()) {

            const tanRegex =
                /^[A-Z]{4}[0-9]{5}[A-Z]$/;

            if (
                !tanRegex.test(
                    form.tanNumber
                        .trim()
                        .toUpperCase()
                )
            ) {

                newErrors.tanNumber =
                    "Enter a valid TAN number";
            }
        }


        /* =====================================================
           ADDRESS
        ===================================================== */

        if (!form.addressLine1?.trim()) {
            newErrors.addressLine1 =
                "Address is required";
        }

        if (!form.city?.trim()) {
            newErrors.city =
                "City is required";
        }

        if (!form.state?.trim()) {
            newErrors.state =
                "State is required";
        }

        if (!form.country?.trim()) {
            newErrors.country =
                "Country is required";
        }

        if (!form.pincode?.trim()) {

            newErrors.pincode =
                "Pincode is required";

        } else if (
            !/^\d{6}$/.test(
                form.pincode.trim()
            )
        ) {

            newErrors.pincode =
                "Pincode must contain 6 digits";
        }


        /* =====================================================
           INVOICE SETTINGS
        ===================================================== */

        if (!form.invoicePrefix?.trim()) {

            newErrors.invoicePrefix =
                "Invoice prefix is required";
        }

        if (
            form.invoiceStartNumber === "" ||
            form.invoiceStartNumber === null ||
            Number(form.invoiceStartNumber) < 1
        ) {

            newErrors.invoiceStartNumber =
                "Enter a valid invoice start number";
        }

        if (!form.currency?.trim()) {

            newErrors.currency =
                "Currency is required";
        }

        if (!form.financialYearStart) {

            newErrors.financialYearStart =
                "Financial year start is required";
        }


        /* =====================================================
           SET ERRORS
        ===================================================== */

        setErrors(
            newErrors
        );


        /* =====================================================
           BASIC TAB
        ===================================================== */

        if (
            newErrors.companyName ||
            newErrors.companyCode ||
            newErrors.email ||
            newErrors.phone ||
            newErrors.alternatePhone
        ) {

            setActiveTab(
                "basic"
            );

            toast.error(
                "Please complete Basic Details"
            );

            return false;
        }


        /* =====================================================
           ADDRESS TAB
        ===================================================== */

        if (
            newErrors.addressLine1 ||
            newErrors.city ||
            newErrors.state ||
            newErrors.country ||
            newErrors.pincode
        ) {

            setActiveTab(
                "address"
            );

            toast.error(
                "Please complete Address Details"
            );

            return false;
        }


        /* =====================================================
           TAX TAB
        ===================================================== */

        if (
            newErrors.gstNumber ||
            newErrors.panNumber ||
            newErrors.tanNumber
        ) {

            setActiveTab(
                "tax"
            );

            toast.error(
                "Please correct Tax & Compliance fields"
            );

            return false;
        }


        /* =====================================================
           INVOICE TAB
        ===================================================== */

        if (
            newErrors.invoicePrefix ||
            newErrors.invoiceStartNumber ||
            newErrors.currency ||
            newErrors.financialYearStart
        ) {

            setActiveTab(
                "invoice"
            );

            toast.error(
                "Please complete Invoice Settings"
            );

            return false;
        }

        return true;
    };


    /* =======================================================
       SAVE
    ======================================================= */

    const handleSave =
        async (event) => {

            event.preventDefault();


            /* =================================================
               AUTH CHECK
            ================================================= */

            if (!isAuthenticated) {

                toast.error(
                    "You are not authenticated."
                );

                return;
            }


            /* =================================================
               PERMISSION CHECK
            ================================================= */

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
                        ? "You do not have permission to edit companies."
                        : "You do not have permission to create companies."
                );

                return;
            }


            /* =================================================
               VALIDATION
            ================================================= */

            if (
                !validateCompanyTabs()
            ) {
                return;
            }


            /* =================================================
               PAYLOAD
            ================================================= */

            const payload = {

                companyName:
                    form.companyName
                        ?.trim() ||
                    "",

                displayName:
                    form.displayName
                        ?.trim() ||
                    "",

                legalName:
                    form.legalName
                        ?.trim() ||
                    "",

                companyCode:
                    form.companyCode
                        ?.trim() ||
                    "",

                gstNumber:
                    form.gstNumber
                        ?.trim()
                        .toUpperCase() ||
                    "",

                panNumber:
                    form.panNumber
                        ?.trim()
                        .toUpperCase() ||
                    "",

                tanNumber:
                    form.tanNumber
                        ?.trim()
                        .toUpperCase() ||
                    "",

                email:
                    form.email
                        ?.trim() ||
                    "",

                phone:
                    form.phone
                        ?.trim() ||
                    "",

                alternatePhone:
                    form.alternatePhone
                        ?.trim() ||
                    "",

                website:
                    form.website
                        ?.trim() ||
                    "",

                addressLine1:
                    form.addressLine1
                        ?.trim() ||
                    "",

                addressLine2:
                    form.addressLine2
                        ?.trim() ||
                    "",

                city:
                    form.city
                        ?.trim() ||
                    "",

                state:
                    form.state
                        ?.trim() ||
                    "",

                country:
                    form.country
                        ?.trim() ||
                    "",

                pincode:
                    form.pincode
                        ?.trim() ||
                    "",

                invoicePrefix:
                    form.invoicePrefix
                        ?.trim()
                        .toUpperCase() ||
                    "",

                invoiceStartNumber:
                    Number(
                        form.invoiceStartNumber
                    ),

                currency:
                    form.currency
                        ?.trim()
                        .toUpperCase() ||
                    "INR",

                financialYearStart:
                    form.financialYearStart ||
                    null,

                status:
                    form.status ||
                    "ACTIVE",

                logo:
                    form.logo ||
                    null,

                signature:
                    form.signature ||
                    null,
            };


            console.log(
                "COMPANY SAVE PAYLOAD:",
                payload
            );


            try {

                /* =================================================
                   UPDATE
                ================================================= */

                if (isEdit) {

                    const companyId =
                        form.id ??
                        modal?.data?.id;


                    if (!companyId) {

                        toast.error(
                            "Company ID is missing"
                        );

                        return;
                    }


                    await dispatch(
                        updateCompany({
                            id:
                                companyId,

                            data:
                                payload,
                        })
                    ).unwrap();


                    toast.success(
                        "Company updated successfully"
                    );

                }


                /* =================================================
                   CREATE
                ================================================= */

                else {

                    await dispatch(
                        createCompany(
                            payload
                        )
                    ).unwrap();


                    toast.success(
                        "Company created successfully"
                    );
                }


                /* =================================================
                   CLOSE
                ================================================= */

                dispatch(
                    closeModal()
                );

                dispatch(
                    resetCompanyForm()
                );

                resetLocalForm();


            } catch (error) {

                console.error(
                    "Company save error:",
                    error
                );


                toast.error(
                    typeof error ===
                        "string"
                        ? error
                        : error?.message ||
                        "Failed to save company"
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
       AUTH CHECKING
    ======================================================= */

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
                            font-medium
                            text-gray-600
                        "
                    >
                        Checking authentication...
                    </p>

                </div>
            </div>
        );
    }


    /* =======================================================
       UNAUTHENTICATED
    ======================================================= */

    if (!isAuthenticated) {
        return null;
    }


    /* =======================================================
       PERMISSION LOADING
    ======================================================= */

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


    /* =======================================================
       ACCESS DENIED
    ======================================================= */

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
                            <UserRoundArrowLeft
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
                                Company access restricted
                            </p>

                        </div>

                    </div>

                </div>


                {/* MESSAGE */}

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
                                ? "You do not have permission to edit companies."
                                : "You do not have permission to create companies."
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


    /* =======================================================
       TABS
    ======================================================= */

    const tabs = [

        {
            id: "basic",
            label: "Basic Details",
        },

        {
            id: "address",
            label: "Address",
        },

        {
            id: "tax",
            label: "Tax & Compliance",
        },

        {
            id: "invoice",
            label: "Invoice Settings",
        },

        {
            id: "branding",
            label: "Branding",
        },

    ];


    const inputClass = (field) => `
        w-full
        h-11
        px-3
        border
        rounded-md
        text-sm
        bg-white
        outline-none
        transition
        focus:border-blue-500
        focus:ring-1
        focus:ring-blue-500
        ${errors[field]
            ? "border-red-400"
            : "border-gray-300"
        }
    `;


    const labelClass = `
        block
        text-[13px]
        font-medium
        text-gray-700
        mb-1.5
    `;


    const sectionTitleClass = `
        text-base
        font-semibold
        text-gray-800
    `;


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

            {/* =====================================================
                HEADER
            ===================================================== */}

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
                        <Building2
                            size={20}
                            className="text-blue-600"
                        />
                    </div>

                    <div>

                        <h2
                            className="
                                text-[20px]
                                font-semibold
                                text-gray-800
                            "
                        >
                            {isEdit
                                ? "Edit Company"
                                : "New Company"}
                        </h2>

                        <p
                            className="
                                text-xs
                                text-gray-500
                                mt-0.5
                            "
                        >
                            {isEdit
                                ? "Update company information"
                                : "Create your company profile"}
                        </p>

                    </div>

                </div>

            </div>


            {/* =====================================================
                TABS
            ===================================================== */}

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
                        gap-7
                        h-[52px]
                    "
                >

                    {tabs.map((tab) => {

                        const active =
                            activeTab === tab.id;

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
                                        : "text-gray-500 hover:text-gray-800"
                                    }
                                `}
                            >

                                {tab.label}

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


            {/* =====================================================
                FORM
            ===================================================== */}

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
                        overflow-y-scroll
                        overflow-x-visible
                        px-7
                        py-6
                        bg-gray-50/50
                    "
                >

                    {/* =================================================
                        BRANDING
                    ================================================= */}

                    {activeTab === "branding" && (

                        <div>

                            <div className="mb-6">

                                <h3 className={sectionTitleClass}>
                                    Branding
                                </h3>

                                <p
                                    className="
                                        text-xs
                                        text-gray-500
                                        mt-1
                                    "
                                >
                                    Upload the company logo and authorized
                                    signature used in invoice documents.
                                </p>

                            </div>

                            <div
                                className="
                                    grid
                                    grid-cols-2
                                    gap-6
                                "
                            >

                                {/* LOGO */}

                                <div>

                                    <label className={labelClass}>
                                        Company Logo
                                    </label>

                                    <label
                                        className="
                                            w-full
                                            h-[230px]
                                            border-2
                                            border-dashed
                                            border-gray-300
                                            rounded-lg
                                            flex
                                            items-center
                                            justify-center
                                            overflow-hidden
                                            cursor-pointer
                                            hover:border-blue-500
                                            hover:bg-blue-50/30
                                            transition
                                            bg-white
                                        "
                                    >

                                        {logoPreview ? (

                                            <img
                                                src={logoPreview}
                                                alt="Company Logo"
                                                className="
                                                    w-full
                                                    h-full
                                                    object-contain
                                                    p-5
                                                "
                                            />

                                        ) : (

                                            <div
                                                className="
                                                    text-center
                                                    text-gray-400
                                                "
                                            >

                                                <Upload
                                                    size={30}
                                                    className="
                                                        mx-auto
                                                        mb-3
                                                    "
                                                />

                                                <p
                                                    className="
                                                        text-sm
                                                        font-medium
                                                        text-gray-600
                                                    "
                                                >
                                                    Choose company logo
                                                </p>

                                                <p
                                                    className="
                                                        text-xs
                                                        mt-1
                                                    "
                                                >
                                                    JPG / PNG / WEBP
                                                </p>

                                            </div>

                                        )}

                                        <input
                                            type="file"
                                            accept="
                                                image/jpeg,
                                                image/png,
                                                image/webp
                                            "
                                            className="hidden"
                                            onChange={handleLogoChange}
                                        />

                                    </label>

                                    {form.logo && (

                                        <p
                                            className="
                                                text-xs
                                                text-gray-500
                                                mt-2
                                                truncate
                                            "
                                            title={form.logo.name}
                                        >
                                            {form.logo.name}
                                        </p>

                                    )}

                                </div>


                                {/* SIGNATURE */}

                                <div>

                                    <label className={labelClass}>
                                        Authorized Signature
                                    </label>

                                    <label
                                        className="
                                            w-full
                                            h-[230px]
                                            border-2
                                            border-dashed
                                            border-gray-300
                                            rounded-lg
                                            flex
                                            items-center
                                            justify-center
                                            overflow-hidden
                                            cursor-pointer
                                            hover:border-blue-500
                                            hover:bg-blue-50/30
                                            transition
                                            bg-white
                                        "
                                    >

                                        {signaturePreview ? (

                                            <img
                                                src={signaturePreview}
                                                alt="Authorized Signature"
                                                className="
                                                    w-full
                                                    h-full
                                                    object-contain
                                                    p-6
                                                "
                                            />

                                        ) : (

                                            <div
                                                className="
                                                    text-center
                                                    text-gray-400
                                                "
                                            >

                                                <Upload
                                                    size={30}
                                                    className="
                                                        mx-auto
                                                        mb-3
                                                    "
                                                />

                                                <p
                                                    className="
                                                        text-sm
                                                        font-medium
                                                        text-gray-600
                                                    "
                                                >
                                                    Choose signature
                                                </p>

                                                <p
                                                    className="
                                                        text-xs
                                                        mt-1
                                                    "
                                                >
                                                    JPG / PNG / WEBP
                                                </p>

                                            </div>

                                        )}

                                        <input
                                            type="file"
                                            accept="
                                                image/jpeg,
                                                image/png,
                                                image/webp
                                            "
                                            className="hidden"
                                            onChange={
                                                handleSignatureChange
                                            }
                                        />

                                    </label>

                                    {form.signature && (

                                        <p
                                            className="
                                                text-xs
                                                text-gray-500
                                                mt-2
                                                truncate
                                            "
                                            title={form.signature.name}
                                        >
                                            {form.signature.name}
                                        </p>

                                    )}

                                </div>

                            </div>

                        </div>

                    )}


                    {/* =================================================
                        BASIC DETAILS
                    ================================================= */}

                    {activeTab === "basic" && (

                        <div>

                            <div className="mb-6">

                                <h3 className={sectionTitleClass}>
                                    Company Information
                                </h3>

                                <p
                                    className="
                                        text-xs
                                        text-gray-500
                                        mt-1
                                    "
                                >
                                    Enter the basic identity and contact
                                    information of your company.
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

                                <div>

                                    <label className={labelClass}>
                                        Company Name
                                        <span className="text-red-500 ml-1">
                                            *
                                        </span>
                                    </label>

                                    <input
                                        type="text"
                                        value={form.companyName}
                                        onChange={(e) =>
                                            handleChange(
                                                "companyName",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter company name"
                                        className={inputClass("companyName")}
                                    />

                                    {errors.companyName && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.companyName}
                                        </p>
                                    )}

                                </div>


                                <div>

                                    <label className={labelClass}>
                                        Display Name
                                    </label>

                                    <input
                                        type="text"
                                        value={form.displayName}
                                        onChange={(e) =>
                                            handleChange(
                                                "displayName",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter display name"
                                        className={inputClass("displayName")}
                                    />

                                </div>


                                <div>

                                    <label className={labelClass}>
                                        Legal Name
                                    </label>

                                    <input
                                        type="text"
                                        value={form.legalName}
                                        onChange={(e) =>
                                            handleChange(
                                                "legalName",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter legal company name"
                                        className={inputClass("legalName")}
                                    />

                                </div>


                                <div>

                                    <label className={labelClass}>
                                        Company Code
                                        <span className="text-red-500 ml-1">
                                            *
                                        </span>
                                    </label>

                                    <input
                                        type="text"
                                        value={form.companyCode}
                                        onChange={(e) =>
                                            handleChange(
                                                "companyCode",
                                                e.target.value.toUpperCase()
                                            )
                                        }
                                        placeholder="JJTECH"
                                        className={inputClass("companyCode")}
                                    />

                                    {errors.companyCode && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.companyCode}
                                        </p>
                                    )}

                                </div>


                                <div>

                                    <label className={labelClass}>
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={(e) =>
                                            handleChange(
                                                "email",
                                                e.target.value
                                            )
                                        }
                                        placeholder="info@company.com"
                                        className={inputClass("email")}
                                    />

                                    {errors.email && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.email}
                                        </p>
                                    )}

                                </div>


                                <div>

                                    <label className={labelClass}>
                                        Phone
                                        <span className="text-red-500 ml-1">
                                            *
                                        </span>
                                    </label>

                                    <input
                                        type="text"
                                        maxLength={10}
                                        inputMode="numeric"
                                        value={form.phone}
                                        onChange={(e) =>
                                            handleChange(
                                                "phone",
                                                e.target.value.replace(
                                                    /\D/g,
                                                    ""
                                                )
                                            )
                                        }
                                        placeholder="9876543210"
                                        className={inputClass("phone")}
                                    />

                                    {errors.phone && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.phone}
                                        </p>
                                    )}

                                </div>


                                <div>

                                    <label className={labelClass}>
                                        Alternate Phone
                                    </label>

                                    <input
                                        type="text"
                                        maxLength={10}
                                        inputMode="numeric"
                                        value={form.alternatePhone}
                                        onChange={(e) =>
                                            handleChange(
                                                "alternatePhone",
                                                e.target.value.replace(
                                                    /\D/g,
                                                    ""
                                                )
                                            )
                                        }
                                        placeholder="9876501234"
                                        className={inputClass(
                                            "alternatePhone"
                                        )}
                                    />

                                    {errors.alternatePhone && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.alternatePhone}
                                        </p>
                                    )}

                                </div>


                                <div>

                                    <label className={labelClass}>
                                        Website
                                    </label>

                                    <input
                                        type="text"
                                        value={form.website}
                                        onChange={(e) =>
                                            handleChange(
                                                "website",
                                                e.target.value
                                            )
                                        }
                                        placeholder="https://company.com"
                                        className={inputClass("website")}
                                    />

                                </div>

                            </div>

                        </div>

                    )}


                    {/* =================================================
                        ADDRESS
                    ================================================= */}

                    {activeTab === "address" && (

                        <div>

                            <div className="mb-6">

                                <h3 className={sectionTitleClass}>
                                    Company Address
                                </h3>

                                <p
                                    className="
                                        text-xs
                                        text-gray-500
                                        mt-1
                                    "
                                >
                                    Add the registered or business address
                                    of the company.
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

                                <div className="col-span-2">

                                    <label className={labelClass}>
                                        Address Line 1
                                        <span className="text-red-500 ml-1">
                                            *
                                        </span>
                                    </label>

                                    <input
                                        type="text"
                                        value={form.addressLine1}
                                        onChange={(e) =>
                                            handleChange(
                                                "addressLine1",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter address"
                                        className={inputClass(
                                            "addressLine1"
                                        )}
                                    />

                                    {errors.addressLine1 && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.addressLine1}
                                        </p>
                                    )}

                                </div>


                                <div className="col-span-2">

                                    <label className={labelClass}>
                                        Address Line 2
                                    </label>

                                    <input
                                        type="text"
                                        value={form.addressLine2}
                                        onChange={(e) =>
                                            handleChange(
                                                "addressLine2",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Industrial Estate, Street, Area"
                                        className={inputClass(
                                            "addressLine2"
                                        )}
                                    />

                                </div>


                                <div>

                                    <label className={labelClass}>
                                        City
                                        <span className="text-red-500 ml-1">
                                            *
                                        </span>
                                    </label>

                                    <input
                                        type="text"
                                        value={form.city}
                                        onChange={(e) =>
                                            handleChange(
                                                "city",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Coimbatore"
                                        className={inputClass("city")}
                                    />

                                    {errors.city && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.city}
                                        </p>
                                    )}

                                </div>


                                <div>

                                    <label className={labelClass}>
                                        State
                                        <span className="text-red-500 ml-1">
                                            *
                                        </span>
                                    </label>

                                    <input
                                        type="text"
                                        value={form.state}
                                        onChange={(e) =>
                                            handleChange(
                                                "state",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Tamil Nadu"
                                        className={inputClass("state")}
                                    />

                                    {errors.state && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.state}
                                        </p>
                                    )}

                                </div>


                                <div>

                                    <label className={labelClass}>
                                        Country
                                        <span className="text-red-500 ml-1">
                                            *
                                        </span>
                                    </label>

                                    <input
                                        type="text"
                                        value={form.country}
                                        onChange={(e) =>
                                            handleChange(
                                                "country",
                                                e.target.value
                                            )
                                        }
                                        placeholder="India"
                                        className={inputClass("country")}
                                    />

                                    {errors.country && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.country}
                                        </p>
                                    )}

                                </div>


                                <div>

                                    <label className={labelClass}>
                                        Pincode
                                        <span className="text-red-500 ml-1">
                                            *
                                        </span>
                                    </label>

                                    <input
                                        type="text"
                                        maxLength={6}
                                        inputMode="numeric"
                                        value={form.pincode}
                                        onChange={(e) =>
                                            handleChange(
                                                "pincode",
                                                e.target.value.replace(
                                                    /\D/g,
                                                    ""
                                                )
                                            )
                                        }
                                        placeholder="641001"
                                        className={inputClass("pincode")}
                                    />

                                    {errors.pincode && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.pincode}
                                        </p>
                                    )}

                                </div>

                            </div>

                        </div>

                    )}


                    {/* =================================================
                        TAX & COMPLIANCE
                    ================================================= */}

                    {activeTab === "tax" && (

                        <div>

                            <div className="mb-6">

                                <h3 className={sectionTitleClass}>
                                    Tax & Compliance
                                </h3>

                                <p
                                    className="
                                        text-xs
                                        text-gray-500
                                        mt-1
                                    "
                                >
                                    Maintain GST and statutory registration
                                    information used on invoices.
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

                                <div>

                                    <label className={labelClass}>
                                        GST Number
                                    </label>

                                    <input
                                        type="text"
                                        maxLength={15}
                                        value={form.gstNumber}
                                        onChange={(e) =>
                                            handleChange(
                                                "gstNumber",
                                                e.target.value.toUpperCase()
                                            )
                                        }
                                        placeholder="33ABCDE1234F1Z5"
                                        className={inputClass(
                                            "gstNumber"
                                        )}
                                    />

                                    {errors.gstNumber && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.gstNumber}
                                        </p>
                                    )}

                                </div>


                                <div>

                                    <label className={labelClass}>
                                        PAN Number
                                    </label>

                                    <input
                                        type="text"
                                        maxLength={10}
                                        value={form.panNumber}
                                        onChange={(e) =>
                                            handleChange(
                                                "panNumber",
                                                e.target.value.toUpperCase()
                                            )
                                        }
                                        placeholder="ABCDE1234F"
                                        className={inputClass(
                                            "panNumber"
                                        )}
                                    />

                                    {errors.panNumber && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.panNumber}
                                        </p>
                                    )}

                                </div>


                                <div>

                                    <label className={labelClass}>
                                        TAN Number
                                    </label>

                                    <input
                                        type="text"
                                        maxLength={10}
                                        value={form.tanNumber}
                                        onChange={(e) =>
                                            handleChange(
                                                "tanNumber",
                                                e.target.value.toUpperCase()
                                            )
                                        }
                                        placeholder="CHEX12345A"
                                        className={inputClass(
                                            "tanNumber"
                                        )}
                                    />

                                    {errors.tanNumber && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.tanNumber}
                                        </p>
                                    )}

                                </div>

                            </div>


                            <div
                                className="
                                    mt-8
                                    rounded-lg
                                    border
                                    border-blue-100
                                    bg-blue-50/60
                                    px-5
                                    py-4
                                "
                            >

                                <div
                                    className="
                                        text-sm
                                        font-medium
                                        text-blue-800
                                    "
                                >
                                    Tax Information
                                </div>

                                <p
                                    className="
                                        text-xs
                                        text-blue-700
                                        mt-1
                                        leading-5
                                    "
                                >
                                    GST, PAN and TAN details can be displayed
                                    on invoices and used for statutory
                                    reporting.
                                </p>

                            </div>

                        </div>

                    )}


                    {/* =================================================
                        INVOICE SETTINGS
                    ================================================= */}

                    {activeTab === "invoice" && (

                        <div>

                            <div className="mb-6">

                                <h3 className={sectionTitleClass}>
                                    Invoice Settings
                                </h3>

                                <p
                                    className="
                                        text-xs
                                        text-gray-500
                                        mt-1
                                    "
                                >
                                    Configure invoice numbering, currency
                                    and financial year settings.
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

                                <div>

                                    <label className={labelClass}>
                                        Invoice Prefix
                                        <span className="text-red-500 ml-1">
                                            *
                                        </span>
                                    </label>

                                    <input
                                        type="text"
                                        value={form.invoicePrefix}
                                        onChange={(e) =>
                                            handleChange(
                                                "invoicePrefix",
                                                e.target.value.toUpperCase()
                                            )
                                        }
                                        placeholder="NT"
                                        className={inputClass(
                                            "invoicePrefix"
                                        )}
                                    />

                                    {errors.invoicePrefix && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.invoicePrefix}
                                        </p>
                                    )}

                                </div>


                                <div>

                                    <label className={labelClass}>
                                        Invoice Start Number
                                        <span className="text-red-500 ml-1">
                                            *
                                        </span>
                                    </label>

                                    <input
                                        type="number"
                                        min="1"
                                        value={form.invoiceStartNumber}
                                        onChange={(e) =>
                                            handleChange(
                                                "invoiceStartNumber",
                                                e.target.value
                                            )
                                        }
                                        placeholder="1"
                                        className={inputClass(
                                            "invoiceStartNumber"
                                        )}
                                    />

                                    {errors.invoiceStartNumber && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.invoiceStartNumber}
                                        </p>
                                    )}

                                </div>


                                <div>

                                    <label className={labelClass}>
                                        Currency
                                        <span className="text-red-500 ml-1">
                                            *
                                        </span>
                                    </label>

                                    <input
                                        type="text"
                                        maxLength={3}
                                        value={form.currency}
                                        onChange={(e) =>
                                            handleChange(
                                                "currency",
                                                e.target.value.toUpperCase()
                                            )
                                        }
                                        placeholder="INR"
                                        className={inputClass("currency")}
                                    />

                                    {errors.currency && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.currency}
                                        </p>
                                    )}

                                </div>


                                <div>

                                    <label className={labelClass}>
                                        Financial Year Start
                                        <span className="text-red-500 ml-1">
                                            *
                                        </span>
                                    </label>

                                    <input
                                        type="date"
                                        value={form.financialYearStart}
                                        onChange={(e) =>
                                            handleChange(
                                                "financialYearStart",
                                                e.target.value
                                            )
                                        }
                                        className={inputClass(
                                            "financialYearStart"
                                        )}
                                    />

                                    {errors.financialYearStart && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.financialYearStart}
                                        </p>
                                    )}

                                </div>


                                <div>

                                    <label className={labelClass}>
                                        Status
                                    </label>

                                    <select
                                        value={form.status}
                                        onChange={(e) =>
                                            handleChange(
                                                "status",
                                                e.target.value
                                            )
                                        }
                                        className={inputClass("status")}
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

                                <p
                                    className="
                                        text-xs
                                        font-medium
                                        text-gray-500
                                        uppercase
                                        tracking-wide
                                    "
                                >
                                    Invoice Number Preview
                                </p>

                                <p
                                    className="
                                        mt-2
                                        text-xl
                                        font-semibold
                                        text-gray-800
                                    "
                                >
                                    {form.invoicePrefix || "NT"}
                                    {new Date().getFullYear()}
                                    -
                                    {String(
                                        form.invoiceStartNumber || 1
                                    ).padStart(4, "0")}
                                </p>

                            </div>

                        </div>

                    )}

                </div>


                {/* =====================================================
                    FOOTER
                ===================================================== */}

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
                        <span className="text-red-500">*</span>
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
                                    ? "Update Company"
                                    : "Save Company"}

                        </button>

                    </div>

                </div>

            </form>

        </div>
    );
}