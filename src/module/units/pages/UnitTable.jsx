import React from "react";
import { useDispatch, useSelector } from "react-redux";

import {
    fetchAllUnits,
    deleteUnit,
} from "../thunks/unitThunks";

import { openModal } from "../../ui/uiSlice";

import {
    ChevronDown,
    Edit,
    Trash2,
    Scale,
} from "lucide-react";

import toast from "react-hot-toast";

export default function UnitTable({
    units = [],
}) {
    const dispatch = useDispatch();

    /* =====================================================
       REDUX STATE
    ===================================================== */

    const {
        loading,
        error,
        pagination,
    } = useSelector(
        (state) => state.unit || {}
    );

    const {
        pageNumber = 0,
        pageSize = 20,
        totalPages = 0,
        totalElements = 0,
    } = pagination || {};

    const currentUnits = units || [];

    /* =====================================================
       DELETE UNIT
    ===================================================== */

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this unit?")) {
            return;
        }

        try {
            await dispatch(
                deleteUnit(id)
            ).unwrap();

            toast.success(
                "Unit deleted successfully"
            );

            dispatch(
                fetchAllUnits()
            );
        } catch (error) {
            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    "Failed to delete unit"
            );
        }
    };

    /* =====================================================
       EDIT UNIT
    ===================================================== */

    const handleEdit = (unit) => {
        try {
            dispatch(
                openModal({
                    type: "editUnit",
                    data: unit,
                })
            );
        } catch (error) {
            toast.error(
                "Failed to open unit"
            );
        }
    };

    /* =====================================================
       UNIT INITIALS
    ===================================================== */

    const initials = (unitName = "") =>
        unitName
            .split(" ")
            .filter(Boolean)
            .map((word) => word[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "UN";

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
       SHORT NAME COLORS
    ===================================================== */

    const getShortNameColor = (unitShortName) => {
        if (!unitShortName) {
            return "bg-gray-100 text-gray-700";
        }

        const value = unitShortName
            .trim()
            .toUpperCase();

        if (/\d/.test(value)) {
            return "bg-blue-100 text-blue-700";
        }

        return "bg-purple-100 text-purple-700";
    };


    const getUniCode = (unitCode) => {
        if (!unitCode) {
            return "bg-gray-100 text-gray-700";
        }

        const value = unitCode.trim().toUpperCase();

        // Get the last part after "-"
        const lastPart = value.split("-").pop();

        // Last part is only numbers → number color
        if (/^\d+$/.test(lastPart)) {
            return "bg-gray-100 text-orange-400";
        }

        // Last part contains letters → letter color
        if (/^[A-Z]+$/.test(lastPart)) {
            return "bg-gray-100 text-pink-400";
        }

        return "bg-gray-100 text-gray-700";
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

    const getAvatarColor = (name = "") => {
        const index =
            name
                .split("")
                .reduce(
                    (acc, char) =>
                        acc + char.charCodeAt(0),
                    0
                ) % avatarColors.length;

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
                    Loading units...
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

    if (!currentUnits.length) {
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
                <Scale
                    className="
                        mx-auto
                        mb-3
                        h-10
                        w-10
                        text-gray-300
                    "
                />

                <p className="text-gray-500">
                    No units found.
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
                overflow-visible
                w-full
            "
        >
            <div
                className="
                    w-full
                    overflow-visible
                "
            >
                <table
                    className="
                        w-full
                        table-fixed
                        border-collapse
                    "
                >
                    {/* =================================================
                        TABLE HEADER
                    ================================================= */}

                    <thead
                        className="
                            bg-gray-100
                            border-b
                            border-gray-300
                        "
                    >
                        <tr>
                            {/* UNIT NAME */}

                            <th
                                className="
                                    w-[25%]
                                    px-2
                                    py-3
                                    font-medium
                                    text-sm
                                    text-gray-600
                                    uppercase
                                    text-left
                                "
                            >
                                Unit Name
                            </th>

                            {/* UNIT SHORT NAME */}

                            <th
                                className="
                                    w-[20%]
                                    px-2
                                    py-3
                                    font-medium
                                    text-sm
                                    text-gray-600
                                    uppercase
                                    text-left
                                "
                            >
                                Unit Short Name
                            </th>

                            {/* UNIT CODE */}

                            <th
                                className="
                                    w-[20%]
                                    px-2
                                    py-3
                                    font-medium
                                    text-sm
                                    text-gray-600
                                    uppercase
                                    text-left
                                "
                            >
                                Unit Code
                            </th>


                            {/* DESCRIPTION */}

                            <th
                                className="
                                    w-[35%]
                                    px-2
                                    py-3
                                    font-medium
                                    text-sm
                                    text-gray-600
                                    uppercase
                                    text-left
                                "
                            >
                                Description
                            </th>

                            {/* STATUS */}

                            <th
                                className="
                                    w-[10%]
                                    px-2
                                    py-3
                                    font-medium
                                    text-sm
                                    text-gray-600
                                    uppercase
                                    text-left
                                "
                            >
                                Status
                            </th>

                            {/* ACTIONS */}

                            <th
                                className="
                                    w-[10%]
                                    px-2
                                    py-3
                                    font-medium
                                    text-sm
                                    text-gray-600
                                    uppercase
                                    text-right
                                "
                            >
                                Actions
                            </th>
                        </tr>
                    </thead>

                    {/* =================================================
                        TABLE BODY
                    ================================================= */}

                    <tbody>
                        {[...currentUnits]
                            .sort(
                                (a, b) =>
                                    (a.id || 0) -
                                    (b.id || 0)
                            )
                            .map(
                                (
                                    unit,
                                    index
                                ) => (
                                    <tr
                                        key={
                                            unit.id ||
                                            index
                                        }
                                        className="
                                            border-b
                                            border-gray-100
                                            hover:bg-gray-50
                                            text-sm
                                            cursor-pointer
                                            transition-colors
                                        "
                                    >
                                        {/* =================================
                                            UNIT NAME
                                        ================================= */}

                                        <td
                                            className="
                                                px-2
                                                py-3
                                                overflow-hidden
                                            "
                                        >
                                            <div
                                                className="
                                                    flex
                                                    items-center
                                                    gap-2
                                                    min-w-0
                                                "
                                            >
                                                {/* AVATAR */}

                                                <div
                                                    className={`
                                                        w-9
                                                        h-9
                                                        min-w-[36px]
                                                        rounded-full
                                                        flex
                                                        items-center
                                                        justify-center
                                                        text-sm
                                                        font-bold
                                                        ${getAvatarColor(
                                                        unit.unitName
                                                    )}
                                                    `}
                                                >
                                                    {initials(
                                                        unit.unitName
                                                    )}
                                                </div>

                                                {/* NAME */}

                                                <div
                                                    className="
                                                        min-w-0
                                                    "
                                                >
                                                    <p
                                                        className="
                                                            font-medium
                                                            text-gray-800
                                                            truncate
                                                        "
                                                        title={
                                                            unit.unitName ||
                                                            ""
                                                        }
                                                    >
                                                        {unit.unitName ||
                                                            "—"}
                                                    </p>

                                                    <p
                                                        className="
                                                            text-xs
                                                            text-gray-500
                                                        "
                                                    >
                                                        ID: #{unit.id}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* =================================
                                            UNIT SHORT NAME
                                        ================================= */}

                                        <td
                                            className="
                                                px-2
                                                py-3
                                                overflow-hidden
                                            "
                                        >
                                            <p
                                                className={`
                                                    truncate
                                                    inline-block
                                                    max-w-full
                                                    px-2
                                                    py-1
                                                    rounded-md
                                                    text-xs
                                                    font-medium
                                                    ${getShortNameColor(
                                                    unit.unitShortName
                                                )}
                                                `}
                                                title={
                                                    unit.unitShortName ||
                                                    ""
                                                }
                                            >
                                                {unit.unitShortName ||
                                                    "—"}
                                            </p>
                                        </td>



                                        {/* =================================
                                            UNIT CODE
                                        ================================= */}

                                        <td
                                            className="
                                                px-2
                                                py-3
                                                overflow-hidden
                                            "
                                        >
                                            <p
                                                className={`
                                                    truncate
                                                    inline-block
                                                    max-w-full
                                                    px-2
                                                    py-1
                                                    rounded-md
                                                    text-xs
                                                    font-medium
                                                    ${getUniCode(
                                                    unit.unitCode
                                                )}
                                                `}
                                                title={
                                                    unit.unitCode ||
                                                    ""
                                                }
                                            >
                                                {unit.unitCode ||
                                                    "—"}
                                            </p>
                                        </td>



                                        {/* =================================
                                            DESCRIPTION
                                        ================================= */}

                                        <td
                                            className="
                                                px-2
                                                py-3
                                                overflow-hidden
                                            "
                                        >
                                            <p
                                                className="
                                                    truncate
                                                "
                                                title={
                                                    unit.description ||
                                                    ""
                                                }
                                            >
                                                {unit.description ||
                                                    "—"}
                                            </p>
                                        </td>

                                        {/* =================================
                                            STATUS
                                        ================================= */}

                                        <td
                                            className="
                                                px-2
                                                py-3
                                                overflow-hidden
                                            "
                                        >
                                            <span
                                                className={`
                                                    inline-block
                                                    px-2
                                                    py-1
                                                    rounded-full
                                                    text-xs
                                                    font-medium
                                                    ${statusColor[
                                                    unit.status
                                                    ] ||
                                                    "bg-gray-100 text-gray-700"
                                                    }
                                                `}
                                            >
                                                {unit.status || "—"}
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
                                                            {/* EDIT */}

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleEdit(
                                                                        unit
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

                                                            {/* DELETE */}

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        unit.id
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
                        p-4
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
                        {currentUnits.length}{" "}
                        of{" "}
                        {totalElements || 0}{" "}
                        units
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
                                disabled:cursor-not-allowed
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
                                bg-indigo-600
                                text-white
                                text-sm
                                font-medium
                            "
                        >
                            {(Number(pageNumber) || 0) + 1}
                        </span>

                        {/* NEXT */}

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
                                disabled:cursor-not-allowed
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