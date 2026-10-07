import React from "react";

import {
    useDispatch,
    useSelector,
} from "react-redux";

import {
    useNavigate,
} from "react-router-dom";

import {
    openModal,
} from "../../ui/uiSlice";

import {
    fetchAllCompanies,
    deleteCompany,
} from "../thunks/companyThunks";

import {
    setExsistingCompany,
} from "../slices/companySlice";

import {
    ChevronDown,
    Edit,
    Trash2,
    Building2,
    Eye,
} from "lucide-react";

import toast from "react-hot-toast";


export default function CompanyTable({
    companies = [],
}) {

    const dispatch = useDispatch();

    const navigate =
        useNavigate();


    /* =====================================================
       REDUX STATE
    ===================================================== */

    const {
        loading,
        error,
        pagination,
    } = useSelector(
        (state) =>
            state.company
    );


    const {
        pageNumber,
        pageSize,
        totalPages,
        totalElements,
    } = pagination || {};


    const currentCompanies =
        companies || [];


    /* =====================================================
       AUTH STATE
    ===================================================== */

    const user = useSelector(
        (state) =>
            state.auth?.user
    );


    /* =====================================================
       PERMISSION STATE
    ===================================================== */

    const permissions = useSelector(
        (state) =>
            state.menuPermission?.userPermissions || []
    );


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


    const normalizedRole =
        String(roleName)
            .trim()
            .toUpperCase();


    const isSuperAdmin =
        normalizedRole === "SUPER_ADMIN";


    const isAdmin =
        normalizedRole === "ADMIN";


    const hasFullAccess =
        isSuperAdmin ||
        isAdmin;


    /* =====================================================
       PERMISSION CHECK

       Supports both:

       FLAT:
       {
           moduleName: "Companies",
           actionName: "EDIT",
           allowed: true
       }

       GROUPED:
       {
           moduleName: "Companies",
           actions: [
               {
                   actionName: "EDIT",
                   allowed: true
               }
           ]
       }
    ===================================================== */

    const hasPermission = (
        moduleName,
        actionName
    ) => {

        /* =================================================
           SUPER ADMIN / ADMIN
        ================================================= */

        if (hasFullAccess) {
            return true;
        }


        /* =================================================
           INVALID PERMISSION STATE
        ================================================= */

        if (!Array.isArray(permissions)) {
            return false;
        }


        const requestedModule =
            String(moduleName)
                .trim()
                .toLowerCase();


        const requestedAction =
            String(actionName)
                .trim()
                .toUpperCase();


        /* =================================================
           SEARCH PERMISSIONS
        ================================================= */

        return permissions.some(
            (permission) => {

                /* =========================================
                   MODULE
                ========================================= */

                const permissionModule =
                    String(
                        permission?.moduleName ||
                        permission?.module?.moduleName ||
                        permission?.module?.name ||
                        ""
                    )
                        .trim()
                        .toLowerCase();


                if (
                    permissionModule !==
                    requestedModule
                ) {
                    return false;
                }


                /* =========================================
                   PERMISSION STATUS
                ========================================= */

                if (
                    permission?.active === false
                ) {
                    return false;
                }


                if (
                    String(
                        permission?.status || ""
                    )
                        .trim()
                        .toUpperCase() ===
                    "INACTIVE"
                ) {
                    return false;
                }


                /* =========================================
                   GROUPED ACTIONS
                ========================================= */

                if (
                    Array.isArray(
                        permission?.actions
                    )
                ) {

                    return permission.actions.some(
                        (action) => {

                            const permissionAction =
                                String(
                                    action?.actionName ||
                                    action?.action?.actionName ||
                                    action?.action?.name ||
                                    ""
                                )
                                    .trim()
                                    .toUpperCase();


                            const allowed =
                                action?.allowed === true ||
                                action?.allowed === "true";


                            return (
                                permissionAction ===
                                requestedAction &&
                                allowed
                            );

                        }
                    );

                }


                /* =========================================
                   FLAT ACTION
                ========================================= */

                const permissionAction =
                    String(
                        permission?.actionName ||
                        permission?.action?.actionName ||
                        permission?.action?.name ||
                        ""
                    )
                        .trim()
                        .toUpperCase();


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
       COMPANY PERMISSIONS
    ===================================================== */

    const canEditCompany =
        hasPermission(
            "Company Detail",
            "EDIT"
        );


    const canDeleteCompany =
        hasPermission(
            "Company Detail",
            "DELETE"
        );

    const canViewCompany =
        hasPermission(
            "Company Detail",
            "VIEW"
        );


    /* =====================================================
       DELETE COMPANY
    ===================================================== */

    const handleDelete = async (
        id
    ) => {

        /* =================================================
           PERMISSION SAFETY CHECK
        ================================================= */

        if (!canDeleteCompany) {

            toast.error(
                "You do not have permission to delete companies."
            );

            return;
        }


        if (
            !window.confirm(
                "Delete this company?"
            )
        ) {
            return;
        }


        try {

            await dispatch(
                deleteCompany(id)
            ).unwrap();


            toast.success(
                "Company deleted successfully"
            );


            dispatch(
                fetchAllCompanies()
            );

        } catch (error) {

            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    "Failed to delete company"
            );

        }

    };


    /* =====================================================
       VIEW COMPANY
    ===================================================== */

    const handleView = (
        company
    ) => {


        try {

            if (!canViewCompany) {

                toast.error(
                    "You do not have permission to View companies."
                );

                return;
            }

            dispatch(
                setExsistingCompany(
                    company
                )
            );


            navigate(
                `/companies/view/${company.id}`
            );

        } catch (error) {

            toast.error(
                "Failed to open company"
            );

        }

    };


    /* =====================================================
       EDIT COMPANY
    ===================================================== */

    const handleEdit = (
        company
    ) => {

        /* =================================================
           PERMISSION SAFETY CHECK
        ================================================= */

        if (!canEditCompany) {

            toast.error(
                "You do not have permission to edit companies."
            );

            return;
        }


        console.log(
            "EDIT COMPANY:",
            company
        );


        try {

            dispatch(
                openModal({
                    type: "editCompany",
                    data: company,
                })
            );


            console.log(
                "COMPANY MODAL OPEN DISPATCHED"
            );

        } catch (error) {

            console.error(
                "COMPANY EDIT ERROR:",
                error
            );


            toast.error(
                error?.message ||
                "Failed to open company"
            );

        }

    };


    /* =====================================================
       COMPANY INITIALS
    ===================================================== */

    const initials = (
        companyName
    ) => {

        if (!companyName) {
            return "CO";
        }


        return companyName
            ?.split(" ")
            .filter(Boolean)
            .map(
                (word) =>
                    word[0]
            )
            .join("")
            .slice(0, 2)
            .toUpperCase() || "CO";

    };


    /* =====================================================
       STATUS COLORS
    ===================================================== */

    const statusColor = {

        ACTIVE:
            "bg-green-100 text-green-700",

        INACTIVE:
            "bg-gray-100 text-gray-700",

        DRAFT:
            "bg-yellow-100 text-yellow-700",

    };


    /* =====================================================
       COMPANY AVATAR COLORS
    ===================================================== */

    const avatarColors = [

        "bg-pink-500 text-white",
        "bg-green-500 text-white",
        "bg-blue-500 text-white",
        "bg-purple-500 text-white",
        "bg-orange-500 text-white",
        "bg-cyan-500 text-white",
        "bg-indigo-500 text-white",

    ];


    const getAvatarColor = (
        name = ""
    ) => {

        const index =
            name
                .split("")
                .reduce(
                    (
                        acc,
                        char
                    ) =>
                        acc +
                        char.charCodeAt(0),
                    0
                ) %
            avatarColors.length;


        return avatarColors[index];

    };


    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {

        return (

            <div
                className="
                    flex
                    items-center
                    justify-center
                    py-10
                "
            >

                <p className="text-gray-500">
                    Loading companies...
                </p>

            </div>

        );

    }


    /* =====================================================
       ERROR
    ===================================================== */

    if (error) {

        return (

            <div
                className="
                    bg-white
                    rounded-xl
                    border
                    border-red-200
                    p-8
                    text-center
                "
            >

                <p className="text-red-500">
                    {error}
                </p>

            </div>

        );

    }


    /* =====================================================
       EMPTY STATE
    ===================================================== */

    if (!currentCompanies.length) {

        return (

            <div
                className="
                    bg-white
                    rounded-2xl
                    border
                    border-gray-200
                    p-8
                    text-center
                "
            >

                <Building2
                    className="
                        mx-auto
                        mb-3
                        h-10
                        w-10
                        text-gray-300
                    "
                />

                <p className="text-gray-500">
                    No companies found.
                </p>

            </div>

        );

    }


    /* =====================================================
       TABLE
    ===================================================== */

    return (

        <div
            className="
                bg-white
                rounded-xl
                border
                border-gray-200
            "
        >

            <table className="w-full">

                {/* =================================================
                    TABLE HEADER
                ================================================= */}

                <thead
                    className="
                        sticky
                        top-0
                        z-20
                        bg-gray-100
                        border-b
                        border-gray-300
                    "
                >

                    <tr>

                        {[
                            "Company",
                            "Code",
                            "GST Number",
                            "PAN Number",
                            "Email",
                            "Phone",
                            "City",
                            "Status",
                            "Actions",
                        ].map(
                            (
                                header
                            ) => (

                                <th
                                    key={
                                        header
                                    }
                                    className={`
                                        px-4
                                        py-3
                                        font-medium
                                        text-sm
                                        text-gray-600
                                        uppercase
                                        ${header ===
                                            "Actions"
                                            ? "text-right"
                                            : "text-left"
                                        }
                                    `}
                                >

                                    {header}

                                </th>

                            )
                        )}

                    </tr>

                </thead>


                {/* =================================================
                    TABLE BODY
                ================================================= */}

                <tbody>

                    {[
                        ...currentCompanies,
                    ]
                        .sort(
                            (
                                a,
                                b
                            ) =>
                                (
                                    a.id || 0
                                ) -
                                (
                                    b.id || 0
                                )
                        )
                        .map(
                            (
                                company,
                                index
                            ) => (

                                <tr
                                    key={
                                        company.id ||
                                        index
                                    }
                                    onClick={() =>
                                        handleView(
                                            company
                                        )
                                    }
                                    className="
                                        border-b
                                        border-gray-100
                                        hover:bg-gray-50
                                        text-md
                                        cursor-pointer
                                        transition-colors
                                    "
                                >

                                    {/* =================================
                                        COMPANY
                                    ================================= */}

                                    <td
                                        className="
                                            px-2
                                            py-3
                                        "
                                    >

                                        <div
                                            className="
                                                flex
                                                items-center
                                                gap-3
                                            "
                                        >

                                            <div
                                                className={`
                                                    w-10
                                                    h-10
                                                    rounded-full
                                                    flex
                                                    items-center
                                                    justify-center
                                                    text-md
                                                    font-bold
                                                    ${getAvatarColor(
                                                    company.companyName
                                                )}
                                                `}
                                            >

                                                {initials(
                                                    company.companyName
                                                )}

                                            </div>


                                            <div>

                                                <p
                                                    className="
                                                        font-medium
                                                        text-gray-800
                                                    "
                                                >
                                                    {
                                                        company.companyName ||
                                                        "—"
                                                    }
                                                </p>


                                                <p
                                                    className="
                                                        text-sm
                                                        text-gray-500
                                                    "
                                                >
                                                    ID: #
                                                    {
                                                        company.id
                                                    }
                                                </p>

                                            </div>

                                        </div>

                                    </td>


                                    {/* =================================
                                        COMPANY CODE
                                    ================================= */}

                                    <td
                                        className="
                                            px-4
                                            py-3
                                        "
                                    >
                                        {
                                            company.companyCode ||
                                            "—"
                                        }
                                    </td>


                                    {/* =================================
                                        GST NUMBER
                                    ================================= */}

                                    <td
                                        className="
                                            px-4
                                            py-3
                                        "
                                    >
                                        {
                                            company.gstNumber ||
                                            "—"
                                        }
                                    </td>


                                    {/* =================================
                                        PAN NUMBER
                                    ================================= */}

                                    <td
                                        className="
                                            px-4
                                            py-3
                                        "
                                    >
                                        {
                                            company.panNumber ||
                                            "—"
                                        }
                                    </td>


                                    {/* =================================
                                        EMAIL
                                    ================================= */}

                                    <td
                                        className="
                                            px-4
                                            py-3
                                        "
                                    >
                                        {
                                            company.email ||
                                            "—"
                                        }
                                    </td>


                                    {/* =================================
                                        PHONE
                                    ================================= */}

                                    <td
                                        className="
                                            px-4
                                            py-3
                                        "
                                    >
                                        {
                                            company.phone ||
                                            "—"
                                        }
                                    </td>


                                    {/* =================================
                                        CITY
                                    ================================= */}

                                    <td
                                        className="
                                            px-4
                                            py-3
                                        "
                                    >
                                        {
                                            company.city ||
                                            "—"
                                        }
                                    </td>


                                    {/* =================================
                                        STATUS
                                    ================================= */}

                                    <td
                                        className="
                                            px-5
                                            py-3
                                            font-semibold
                                        "
                                    >

                                        <span
                                            className={`
                                                px-2
                                                py-1
                                                rounded-full
                                                text-xs
                                                font-medium
                                                ${statusColor[
                                                company.status
                                                ] ||
                                                "bg-gray-100 text-gray-700"
                                                }
                                            `}
                                        >

                                            {
                                                company.status ||
                                                "—"
                                            }

                                        </span>

                                    </td>


                                    {/* =================================
                                        ACTIONS
                                    ================================= */}

                                    <td
                                        className="
                                            relative
                                            overflow-visible
                                            px-2
                                            py-3
                                        "
                                        onClick={(e) =>
                                            e.stopPropagation()
                                        }
                                    >

                                        <div
                                            className="
                                                flex
                                                justify-end
                                            "
                                        >

                                            <div
                                                className="
                                                    relative
                                                    group
                                                    inline-block
                                                "
                                            >

                                                {/* ACTION BUTTON */}

                                                <button
                                                    type="button"
                                                    className="
                                                        p-1
                                                        rounded-full
                                                        bg-blue-500
                                                        text-white
                                                        hover:bg-blue-600
                                                        transition-colors
                                                    "
                                                >

                                                    <ChevronDown
                                                        size={16}
                                                    />

                                                </button>


                                                {/* ACTION MENU */}

                                                <div
                                                    className="
                                                        absolute
                                                        right-0
                                                        top-full
                                                        mt-1
                                                        z-[9999]
                                                        opacity-0
                                                        invisible
                                                        group-hover:opacity-100
                                                        group-hover:visible
                                                        transition-all
                                                        duration-150
                                                    "
                                                >

                                                    <div
                                                        className="
                                                            w-36
                                                            rounded-md
                                                            bg-blue-500
                                                            shadow-lg
                                                            overflow-hidden
                                                        "
                                                    >

                                                        {/* =================================
                                                            VIEW
                                                        ================================= */}

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleView(
                                                                    company
                                                                )
                                                            }
                                                            className="
                                                                flex
                                                                w-full
                                                                items-center
                                                                gap-2
                                                                px-4
                                                                py-2
                                                                text-sm
                                                                text-white
                                                                hover:bg-blue-600
                                                                transition-colors
                                                            "
                                                        >

                                                            <Eye
                                                                size={16}
                                                            />

                                                            View

                                                        </button>


                                                        {/* =================================
                                                            EDIT
                                                        ================================= */}

                                                        {canEditCompany && (

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleEdit(
                                                                        company
                                                                    )
                                                                }
                                                                className="
                                                                    flex
                                                                    w-full
                                                                    items-center
                                                                    gap-2
                                                                    px-4
                                                                    py-2
                                                                    text-sm
                                                                    text-white
                                                                    hover:bg-blue-600
                                                                    transition-colors
                                                                "
                                                            >

                                                                <Edit
                                                                    size={16}
                                                                />

                                                                Edit

                                                            </button>

                                                        )}


                                                        {/* =================================
                                                            DELETE
                                                        ================================= */}

                                                        {canDeleteCompany && (

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        company.id
                                                                    )
                                                                }
                                                                className="
                                                                    flex
                                                                    w-full
                                                                    items-center
                                                                    gap-2
                                                                    px-4
                                                                    py-2
                                                                    text-sm
                                                                    text-white
                                                                    hover:bg-red-600
                                                                    transition-colors
                                                                "
                                                            >

                                                                <Trash2
                                                                    size={16}
                                                                />

                                                                Delete

                                                            </button>

                                                        )}

                                                    </div>

                                                </div>

                                            </div>

                                        </div>

                                    </td>

                                </tr>

                            )
                        )}

                </tbody>

            </table>


            {/* =====================================================
                PAGINATION
            ===================================================== */}

            <div
                className="
                    p-5
                    border-t
                    border-gray-100
                    flex
                    items-center
                    justify-between
                "
            >

                <p
                    className="
                        text-sm
                        text-gray-500
                    "
                >

                    Showing{" "}
                    {
                        currentCompanies.length
                    }{" "}
                    of{" "}
                    {
                        totalElements || 0
                    }{" "}
                    companies

                </p>


                <div
                    className="
                        flex
                        items-center
                        gap-3
                    "
                >

                    {/* PREVIOUS */}

                    <button
                        type="button"
                        disabled={
                            Number(
                                pageNumber
                            ) <= 0
                        }
                        onClick={() => {
                            // Add server-side page support here
                        }}
                        className="
                            text-sm
                            text-gray-400
                            hover:text-gray-600
                            disabled:opacity-50
                        "
                    >

                        Previous

                    </button>


                    {/* CURRENT PAGE */}

                    <span
                        className="
                            w-8
                            h-8
                            flex
                            items-center
                            justify-center
                            rounded-lg
                            bg-blue-500
                            text-white
                            text-sm
                            font-medium
                        "
                    >

                        {
                            (
                                Number(
                                    pageNumber
                                ) || 0
                            ) + 1
                        }

                    </span>


                    {/* NEXT */}

                    <button
                        type="button"
                        disabled={
                            (
                                Number(
                                    pageNumber
                                ) || 0
                            ) >=
                            (
                                Number(
                                    totalPages
                                ) || 1
                            ) - 1
                        }
                        onClick={() => {
                            // Add server-side page support here
                        }}
                        className="
                            text-sm
                            text-gray-400
                            hover:text-gray-600
                            disabled:opacity-50
                        "
                    >

                        Next

                    </button>

                </div>

            </div>

        </div>

    );

}