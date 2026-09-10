
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
    fetchAllTaxMasters,
    fetchTaxMasterById,
    deleteTaxMaster,
} from "../thunks/taxMasterThunks";

import {
    setExsistingTaxMaster,
} from "../slices/taxMasterSlice";

import {
    ChevronDown,
    Edit,
    Trash2,
    Receipt,
    Eye,
} from "lucide-react";

import toast from "react-hot-toast";

export default function TaxMasterTable({
    taxMasters = [],
}) {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    /* =====================================================
       REDUX STATE
    ===================================================== */

    const {
        loading,
        error,
        pagination,
    } = useSelector(
        (state) => state.taxMaster || {}
    );

    const {
        pageNumber,
        pageSize,
        totalPages,
        totalElements,
    } = pagination || {};

    const currentTaxMasters =
        taxMasters || [];

    /* =====================================================
       DELETE TAX MASTER
    ===================================================== */

    const handleDelete = async (id) => {

        if (!window.confirm("Delete this tax master?")) {
            return;
        }

        try {

            await dispatch(
                deleteTaxMaster(id)
            ).unwrap();

            toast.success(
                "Tax master deleted successfully"
            );

            /*
             * Reload list after delete.
             */
            dispatch(
                fetchAllTaxMasters()
            );

        } catch (error) {

            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    "Failed to delete tax master"
            );
        }
    };

    /* =====================================================
       VIEW TAX MASTER
    ===================================================== */

    const handleView = async (taxMaster) => {

        try {

            /*
             * Store selected tax master immediately.
             */
            dispatch(
                setExsistingTaxMaster(
                    taxMaster
                )
            );

            /*
             * Navigate to view page.
             */
            navigate(
                `/tax-masters/view/${taxMaster.id}`
            );

        } catch (error) {

            toast.error(
                "Failed to open tax master"
            );
        }
    };

    /* =====================================================
       EDIT TAX MASTER
    ===================================================== */

    const handleEdit = async (taxMaster) => {

        try {

            /*
             * Store selected tax master.
             */
            dispatch(
                setExsistingTaxMaster(
                    taxMaster
                )
            );

            /*
             * Navigate to edit page.
             */
            navigate(
                `/tax-masters/edit/${taxMaster.id}`
            );

        } catch (error) {

            toast.error(
                "Failed to open tax master"
            );
        }
    };

    /* =====================================================
       TAX MASTER INITIALS
    ===================================================== */

    const initials = (taxName) =>
        taxName
            ?.split(" ")
            .map(
                (word) =>
                    word[0]
            )
            .join("")
            .slice(0, 2)
            .toUpperCase() || "TX";

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
       TAX TYPE COLORS
    ===================================================== */

    const taxTypeColor = {

        CGST_SGST:
            "bg-blue-100 text-blue-700",

        IGST:
            "bg-purple-100 text-purple-700",

    };

    /* =====================================================
       AVATAR COLORS
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
       FORMAT RATE
    ===================================================== */

    const formatRate = (
        value
    ) => {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return "0.00";
        }

        return Number(value)
            .toFixed(2);
    };

    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {

        return (

            <div className="
                flex
                items-center
                justify-center
                py-10
            ">

                <p className="text-gray-500">
                    Loading tax masters...
                </p>

            </div>
        );
    }

    /* =====================================================
       ERROR
    ===================================================== */

    if (error) {

        return (

            <div className="
                bg-white
                rounded-xl
                border
                border-red-200
                p-8
                text-center
            ">

                <p className="text-red-500">
                    {error}
                </p>

            </div>
        );
    }

    /* =====================================================
       EMPTY STATE
    ===================================================== */

    if (!currentTaxMasters.length) {

        return (

            <div className="
                bg-white
                rounded-2xl
                border
                border-gray-200
                p-8
                text-center
            ">

                <Receipt
                    className="
                        mx-auto
                        mb-3
                        h-10
                        w-10
                        text-gray-300
                    "
                />

                <p className="text-gray-500">
                    No tax masters found.
                </p>

            </div>
        );
    }

    /* =====================================================
       TABLE
    ===================================================== */

    return (

        <div className="
            bg-white
            rounded-xl
            border
            border-gray-200
            overflow-x-auto
            overflow-y-visible
        ">

            <div className="
                overflow-x-auto
                overflow-y-visible
            ">

                <table className="w-full">

                    {/* =================================================
                        TABLE HEADER
                    ================================================= */}

                    <thead className="
                        bg-gray-100
                        border-b
                        border-gray-300
                    ">

                        <tr>

                            {[
                                "Tax Name",
                                "Tax Type",
                                "Tax Rate",
                                "CGST",
                                "SGST",
                                "IGST",
                                "Description",
                                "Status",
                                "Actions",
                            ].map(
                                (header) => (

                                    <th
                                        key={header}
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

                        {[...currentTaxMasters]
                            .sort(
                                (a, b) =>
                                    a.id - b.id
                            )
                            .map(
                                (
                                    taxMaster,
                                    index
                                ) => (

                                    <tr
                                        key={
                                            taxMaster.id ||
                                            index
                                        }
                                        onClick={() =>
                                            handleView(
                                                taxMaster
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
                                            TAX NAME
                                        ================================= */}

                                        <td className="px-2 py-3">

                                            <div className="
                                                flex
                                                items-center
                                                gap-3
                                            ">

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
                                                        taxMaster.taxName
                                                    )}
                                                    `}
                                                >

                                                    {initials(
                                                        taxMaster.taxName
                                                    )}

                                                </div>

                                                <div>

                                                    <p className="
                                                        font-medium
                                                        text-gray-800
                                                    ">
                                                        {
                                                            taxMaster.taxName ||
                                                            "—"
                                                        }
                                                    </p>

                                                    <p className="
                                                        text-sm
                                                        text-gray-500
                                                    ">
                                                        ID: #
                                                        {
                                                            taxMaster.id
                                                        }
                                                    </p>

                                                </div>

                                            </div>

                                        </td>

                                        {/* =================================
                                            TAX TYPE
                                        ================================= */}

                                        <td className="px-4 py-3">

                                            <span
                                                className={`
                                                    px-2
                                                    py-1
                                                    rounded-full
                                                    text-xs
                                                    font-medium
                                                    ${taxTypeColor[
                                                    taxMaster.taxType
                                                    ] ||
                                                    "bg-gray-100 text-gray-700"
                                                    }
                                                `}
                                            >

                                                {taxMaster.taxType ||
                                                    "—"}

                                            </span>

                                        </td>

                                        {/* =================================
                                            TAX RATE
                                        ================================= */}

                                        <td className="
                                            px-4
                                            py-3
                                            font-medium
                                        ">

                                            {formatRate(
                                                taxMaster.taxRate
                                            )}
                                            %

                                        </td>

                                        {/* =================================
                                            CGST
                                        ================================= */}

                                        <td className="px-4 py-3">

                                            {formatRate(
                                                taxMaster.cgstRate
                                            )}
                                            %

                                        </td>

                                        {/* =================================
                                            SGST
                                        ================================= */}

                                        <td className="px-4 py-3">

                                            {formatRate(
                                                taxMaster.sgstRate
                                            )}
                                            %

                                        </td>

                                        {/* =================================
                                            IGST
                                        ================================= */}

                                        <td className="px-4 py-3">

                                            {formatRate(
                                                taxMaster.igstRate
                                            )}
                                            %

                                        </td>

                                        {/* =================================
                                            DESCRIPTION
                                        ================================= */}

                                        <td className="
                                            px-4
                                            py-3
                                            max-w-xs
                                        ">

                                            <p
                                                className="
                                                    truncate
                                                    text-gray-600
                                                "
                                                title={
                                                    taxMaster.description ||
                                                    ""
                                                }
                                            >

                                                {
                                                    taxMaster.description ||
                                                    "—"
                                                }

                                            </p>

                                        </td>

                                        {/* =================================
                                            STATUS
                                        ================================= */}

                                        <td className="
                                            px-5
                                            py-3
                                            font-semibold
                                        ">

                                            <span
                                                className={`
                                                    px-2
                                                    py-1
                                                    rounded-full
                                                    text-xs
                                                    font-medium
                                                    ${statusColor[
                                                    taxMaster.status
                                                    ] ||
                                                    "bg-gray-100 text-gray-700"
                                                    }
                                                `}
                                            >

                                                {
                                                    taxMaster.status ||
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
                                                px-4
                                                py-3
                                            "
                                            onClick={(e) =>
                                                e.stopPropagation()
                                            }
                                        >

                                            <div className="
                                                flex
                                                justify-end
                                            ">

                                                <div className="
                                                    relative
                                                    group
                                                    inline-block
                                                ">

                                                    <button
                                                        type="button"
                                                        className="
                                                            p-1
                                                            rounded-full
                                                            bg-blue-500
                                                            text-white
                                                        "
                                                    >

                                                        <ChevronDown
                                                            size={16}
                                                        />

                                                    </button>

                                                    {/* =========================
                                                        ACTION MENU
                                                    ========================= */}

                                                    <div className="
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
                                                    ">

                                                        <div className="
                                                            w-36
                                                            rounded-md
                                                            bg-blue-500
                                                            shadow-lg
                                                        ">

                                                            {/* =================
                                                                VIEW
                                                            ================= */}

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleView(
                                                                        taxMaster
                                                                    )
                                                                }
                                                                className="
                                                                    flex
                                                                    w-full
                                                                    items-center
                                                                    gap-2
                                                                    px-4
                                                                    py-2
                                                                    text-white
                                                                    hover:bg-blue-600
                                                                    rounded-md
                                                                "
                                                            >

                                                                <Eye
                                                                    size={16}
                                                                />

                                                                View

                                                            </button>

                                                            {/* =================
                                                                EDIT
                                                            ================= */}

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleEdit(
                                                                        taxMaster
                                                                    )
                                                                }
                                                                className="
                                                                    flex
                                                                    w-full
                                                                    items-center
                                                                    gap-2
                                                                    px-4
                                                                    py-2
                                                                    text-white
                                                                    hover:bg-blue-600
                                                                    rounded-md
                                                                "
                                                            >

                                                                <Edit
                                                                    size={16}
                                                                />

                                                                Edit

                                                            </button>

                                                            {/* =================
                                                                DELETE
                                                            ================= */}

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        taxMaster.id
                                                                    )
                                                                }
                                                                className="
                                                                    flex
                                                                    w-full
                                                                    items-center
                                                                    gap-2
                                                                    px-4
                                                                    py-2
                                                                    text-white
                                                                    hover:bg-red-600
                                                                    rounded-md
                                                                "
                                                            >

                                                                <Trash2
                                                                    size={16}
                                                                />

                                                                Delete

                                                            </button>

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

                <div className="
                    p-5
                    border-t
                    border-gray-100
                    flex
                    items-center
                    justify-between
                ">

                    <p className="
                        text-sm
                        text-gray-500
                    ">

                        Showing{" "}
                        {currentTaxMasters.length}{" "}
                        of{" "}
                        {totalElements || 0}{" "}
                        tax masters

                    </p>

                    <div className="
                        flex
                        items-center
                        gap-3
                    ">

                        {/* =========================
                            PREVIOUS
                        ========================= */}

                        <button
                            type="button"
                            disabled={
                                Number(pageNumber) <= 0
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

                        {/* =========================
                            CURRENT PAGE
                        ========================= */}

                        <span className="
                            w-8
                            h-8
                            flex
                            items-center
                            justify-center
                            rounded-lg
                            bg-indigo-600
                            text-white
                            text-sm
                            font-medium
                        ">

                            {(Number(pageNumber) || 0) + 1}

                        </span>

                        {/* =========================
                            NEXT
                        ========================= */}

                        <button
                            type="button"
                            disabled={
                                (Number(pageNumber) || 0) >=
                                (Number(totalPages) || 1) - 1
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

        </div>
    );
}

