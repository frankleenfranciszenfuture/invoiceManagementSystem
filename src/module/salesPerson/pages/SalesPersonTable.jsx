import React, { useState } from "react";

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
    fetchAllSalesPersons,
    deleteSalesPerson,
} from "../thunks/salesPersonThunks";

import {
    setExistingSalesPerson,
} from "../slices/salesPersonSlice";

import {
    ChevronDown,
    Edit,
    Trash2,
    Building2,
    Eye,
} from "lucide-react";

import toast from "react-hot-toast";
import Pagination from "../../../common/pagination/table/Pagination";


export default function SalesPersonTable({
    salesPersons = [],
}) {

    const dispatch = useDispatch();

    const navigate =
        useNavigate();

    const [showEdit, setShowEdit] = useState(false);
    const [showView, setShowView] = useState(false);
    /* =====================================================
       REDUX STATE
    ===================================================== */

    const {
        loading,
        error,
        pagination,
    } = useSelector(
        (state) =>
            state.salesPerson
    );


    const {
        pageNumber,
        pageSize,
        totalPages,
        totalElements,
    } = pagination || {};


    const currentSalesPersons =
        salesPersons || [];


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
       SALES PERSON PERMISSIONS
    ===================================================== */

    const canEditSalesPerson =
        hasPermission(
            "Sales Person Detail",
            "EDIT"
        );


    const canDeleteSalesPerson =
        hasPermission(
            "Sales Person Detail",
            "DELETE"
        );

    const canViewSalesPerson =
        hasPermission(
            "Sales Person Detail",
            "VIEW"
        );


    /* =====================================================
       DELETE SALES PERSON
    ===================================================== */

    const handleDelete = async (
        id
    ) => {

        /* =================================================
           PERMISSION SAFETY CHECK
        ================================================= */

        if (!canDeleteSalesPerson) {

            toast.error(
                "You do not have permission to delete sales persons."
            );

            return;
        }


        if (
            !window.confirm(
                "Delete this sales person?"
            )
        ) {
            return;
        }


        try {

            await dispatch(
                deleteSalesPerson(id)
            ).unwrap();


            toast.success(
                "Sales person deleted successfully"
            );


            dispatch(
                fetchAllSalesPersons()
            );

        } catch (error) {

            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    "Failed to delete sales person"
            );

        }

    };


    /* =====================================================
       VIEW SALES PERSON
    ===================================================== */

    const handleView = (
        salesPerson
    ) => {


        try {

            if (!canViewSalesPerson) {

                toast.error(
                    "You do not have permission to View sales persons."
                );

                return;
            }

            dispatch(
                setExistingSalesPerson(
                    salesPerson
                )
            );


            navigate(
                `/salesPersons/view/${salesPerson.id}`
            );

        } catch (error) {

            toast.error(
                "Failed to open sales person"
            );

        }

    };


    /* =====================================================
       EDIT SALES PERSON
    ===================================================== */

    const handleEdit = (
        salesPerson
    ) => {

        /* =================================================
           PERMISSION SAFETY CHECK
        ================================================= */

        if (!canEditSalesPerson) {

            toast.error(
                "You do not have permission to edit sales persons."
            );

            return;
        }


        console.log(
            "EDIT SALES PERSON:",
            salesPerson
        );


        try {

            dispatch(
                openModal({
                    type: "editSalesPerson",
                    data: salesPerson,
                })
            );


            console.log(
                "SALES PERSON MODAL OPEN DISPATCHED"
            );

        } catch (error) {

            console.error(
                "SALES PERSON EDIT ERROR:",
                error
            );


            toast.error(
                error?.message ||
                "Failed to open sales person"
            );

        }

    };


    /* =====================================================
       SALES PERSON INITIALS
    ===================================================== */

    const initials = (
        salesPersonName
    ) => {

        if (!salesPersonName) {
            return "SP";
        }


        return salesPersonName
            ?.split(" ")
            .filter(Boolean)
            .map(
                (word) =>
                    word[0]
            )
            .join("")
            .slice(0, 2)
            .toUpperCase() || "SP";

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
       SALES PERSON AVATAR COLORS
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

    if (!currentSalesPersons.length) {

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
                    No sales persons found.
                </p>

            </div>

        );

    }


    /* =====================================================
       TABLE
    ===================================================== */

    return (

        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto overflow-y-visible">
            <div className="overflow-x-auto overflow-y-visible">
                <table className="w-full">
                    <thead className="bg-[#FEFEFD] border-b border-gray-300">

                        <tr>

                            {[
                                "SalesPersonName",
                                "SalesPersonType",
                                "Code",
                                "Email",
                                "Phone",
                                "Status",
                                "Actions",
                            ].map((header) => (

                                <th
                                    key={header}
                                    className={`
                                    px-5
                                    py-3
                                    font-medium
                                    text-md
                                    text-gray-400
                                    uppercase
                                    ${header === "Actions"
                                            ? "text-right"
                                            : "text-left"
                                        }
                                `}
                                >
                                    {header}
                                </th>

                            ))}

                        </tr>

                    </thead>



                    {/* =================================================
                    TABLE BODY
                ================================================= */}

                    <tbody>

                        {[
                            ...currentSalesPersons,
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
                                    salesPerson,
                                    index
                                ) => (

                                    <tr
                                        key={
                                            salesPerson.id ||
                                            index
                                        }
                                        onClick={() =>
                                            handleView(
                                                salesPerson
                                            )
                                        }
                                        className="
                                        border-b
                                        border-gray-100
                                        hover:bg-gray-50
                                        text-xs
                                        cursor-pointer
                                        transition-colors
                                    "
                                    >

                                        {/* =================================
                                        SALES PERSON
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
                                                        salesPerson.salesPersonName
                                                    )}
                                                `}
                                                >

                                                    {initials(
                                                        salesPerson.salesPersonName
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
                                                            salesPerson.salesPersonName ||
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
                                                            salesPerson.id
                                                        }
                                                    </p>

                                                </div>

                                            </div>

                                        </td>


                                        {/* =================================
                                        SALES PERSON TYPE
                                    ================================= */}

                                        <td
                                            className="
                                            px-4
                                            py-3
                                        "
                                        >
                                            {
                                                salesPerson.salesPersonType ||
                                                "—"
                                            }
                                        </td>


                                        {/* =================================
                                        SALES PERSON CODE
                                    ================================= */}

                                        <td
                                            className="
                                            px-4
                                            py-3
                                        "
                                        >
                                            {
                                                salesPerson.salesPersonCode ||
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
                                                salesPerson.email ||
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
                                                salesPerson.mobile ||
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
                                                    salesPerson.status
                                                    ] ||
                                                    "bg-gray-100 text-gray-700"
                                                    }
                                            `}
                                            >

                                                {
                                                    salesPerson.status ||
                                                    "—"
                                                }

                                            </span>

                                        </td>


                                        {/* =================================
                                        ACTIONS
                                    ================================= */}

                                        {/* Actions */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">

                                                {/* View */}
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowView(true);
                                                        dispatch(setExistingSalesPerson(salesPerson));
                                                        navigate(`/salesPersons/view/${salesPerson.id}`);
                                                    }}
                                                    title="View"
                                                    className="
                                                            flex h-8 w-8 items-center justify-center
                                                            rounded-lg
                                                            bg-blue-50
                                                            text-blue-600
                                                            transition
                                                            hover:bg-blue-100
                                                            hover:text-blue-700
                                                        "
                                                >
                                                    <Eye size={16} />
                                                </button>

                                                {/* Edit */}
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowEdit(true);
                                                        dispatch(setExistingSalesPerson(salesPerson));
                                                        navigate(`/salesPersons/edit/${salesPerson.id}`);
                                                    }}
                                                    title="Edit"
                                                    className="
                                                        flex h-8 w-8 items-center justify-center
                                                        rounded-lg
                                                        bg-amber-50
                                                        text-amber-600
                                                        transition
                                                        hover:bg-amber-100
                                                        hover:text-amber-700
                                                    "
                                                >
                                                    <Edit size={16} />
                                                </button>

                                                {/* Delete */}
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();

                                                        // Your delete confirmation logic
                                                        handleDelete(salesPerson.id);
                                                    }}
                                                    title="Delete"
                                                    className="
                                                        flex h-8 w-8 items-center justify-center
                                                        rounded-lg
                                                        bg-red-50
                                                        text-red-600
                                                        transition
                                                        hover:bg-red-100
                                                        hover:text-red-700
                                                    "
                                                >
                                                    <Trash2 size={16} />
                                                </button>

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


                <Pagination
                    page={Number(pageNumber) || 0}
                    size={Number(pageSize) || 10}
                    totalElements={Number(totalElements) || 0}
                    totalPages={Number(totalPages) || 0}
                    loading={loading}
                    label="salesPersons"
                    onPageChange={(nextPage) => {
                        dispatch(
                            fetchAllSalesPersons({
                                page: nextPage,
                                size: Number(pageSize) || 10,
                            })
                        );
                    }}
                    onPageSizeChange={(nextSize) => {
                        dispatch(
                            fetchAllSalesPersons({
                                page: 0,
                                size: nextSize,
                            })
                        );
                    }}
                />

            </div>

        </div >
    );

}