
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
    fetchAllParties,
    deleteParty,
} from "../thunks/partyThunks";

import {
    setExistingParty,
} from "../slices/partySlice";

import { openModal } from "../../ui/uiSlice";

import {
    ChevronDown,
    Edit,
    Trash2,
    Building2,
    Eye,
} from "lucide-react";

import toast from "react-hot-toast";

export default function PartyTable({
    parties = [],
}) {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [showEdit, setShowEdit] = useState(false);
    const [showView, setShowView] = useState(false);
    /* =====================================================
       REDUX STATE
    ===================================================== */

    const {
        loading,
        error,
    } = useSelector(
        (state) => state.party || {}
    );

    const currentParties = parties || [];

    /* =====================================================
       DELETE PARTY
    ===================================================== */

    const handleDelete = async (id) => {

        if (!window.confirm("Delete this party?")) {
            return;
        }

        try {

            await dispatch(
                deleteParty(id)
            ).unwrap();

            toast.success(
                "Party deleted successfully"
            );

            dispatch(
                fetchAllParties()
            );

        } catch (error) {

            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    "Failed to delete party"
            );
        }
    };

    /* =====================================================
       VIEW PARTY
    ===================================================== */

    const handleView = (party) => {

        try {

            dispatch(
                setExistingParty(
                    party
                )
            );

            navigate(
                `/parties/view/${party.id}`
            );

        } catch (error) {

            toast.error(
                "Failed to open party"
            );
        }
    };

    /* =====================================================
       EDIT PARTY
    ===================================================== */

    const handleEdit = (party) => {

        try {

            dispatch(
                openModal({
                    type: "editParty",
                    data: party,
                })
            );

        } catch (error) {

            toast.error(
                "Failed to open party"
            );
        }
    };

    /* =====================================================
       PARTY INITIALS
    ===================================================== */

    const initials = (companyName) =>
        companyName
            ?.split(" ")
            .map(
                (word) =>
                    word[0]
            )
            .join("")
            .slice(0, 2)
            .toUpperCase() || "PT";

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
       PARTY NAME COLOR
    ===================================================== */

    const getPartyNameColor = (companyName) => {

        if (!companyName) {
            return "bg-gray-100 text-gray-700";
        }

        const hasNumber =
            /\d/.test(companyName);

        if (hasNumber) {
            return "bg-blue-100 text-blue-700";
        }

        return "bg-purple-100 text-purple-700";
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
                    Loading parties...
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

    if (!currentParties.length) {

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
                    No parties found.
                </p>

            </div>
        );
    }

    /* =====================================================
       TABLE
    ===================================================== */

    return (

        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto overflow-y-visible">

            {/* =================================================
                TABLE CONTAINER
            ================================================= */}

            <div className="w-full overflow-visible">

                <table className="w-full table-fixed border-collapse">

                    {/* =================================================
                        TABLE HEADER
                    ================================================= */}

                    <thead className="bg-[#F3F4F6] border-b border-gray-300">
                        <tr>

                            {[
                                "Party Name",
                                "Party Code",
                                "Status",
                                "Actions",
                            ].map((header) => (

                                <th
                                    key={header}
                                    className={`
                                    px-5
                                    py-3
                                    font-medium
                                    text-sm
                                    text-[#0F4659]/90
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

                        {[...currentParties]
                            .sort(
                                (a, b) =>
                                    (a.id || 0) -
                                    (b.id || 0)
                            )
                            .map(
                                (
                                    party,
                                    index
                                ) => (

                                    <tr
                                        key={
                                            party.id ||
                                            index
                                        }
                                        onClick={() =>
                                            handleView(
                                                party
                                            )
                                        }
                                        className="
                                        cursor-pointer
                                        border-b
                                        border-gray-100
                                        text-sm
                                        transition-colors
                                        cursor-pointer
                                        hover:bg-gray-50
                                    "
                                    >

                                        {/* =================================
                                            PARTY NAME
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
                                                        party.companyName
                                                    )}
                                                    `}
                                                >

                                                    {
                                                        initials(
                                                            party.companyName
                                                        )
                                                    }

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
                                                            party.companyName ||
                                                            ""
                                                        }
                                                    >
                                                        {
                                                            party.companyName ||
                                                            "—"
                                                        }
                                                    </p>

                                                    <p
                                                        className="
                                                            text-xs
                                                            text-gray-500
                                                        "
                                                    >
                                                        ID: #
                                                        {
                                                            party.id
                                                        }
                                                    </p>

                                                </div>

                                            </div>

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
                                                    text-gray-700
                                                "
                                                title={
                                                    party.partyCode ||
                                                    ""
                                                }
                                            >
                                                {
                                                    party.partyCode ||
                                                    "—"
                                                }
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
                                                    String(
                                                        party.status ||
                                                        ""
                                                    ).toUpperCase()
                                                    ] ||
                                                    "bg-gray-100 text-gray-700"
                                                    }
                                                `}
                                            >
                                                {
                                                    party.status ||
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
                                                        dispatch(setExistingParty(party));
                                                        navigate(`/parties/view/${party.id}`);
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
                                                        dispatch(setExistingParty(party));
                                                        navigate(`/parties/editSimple/${party.id}`)

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
                                                        handleDelete(party.id);
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

                        {currentParties.length}

                        {" "}of{" "}

                        {currentParties.length}

                        {" "}parties

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
                            disabled={true}
                            className="
                                text-sm
                               text-[#0F4659] 
                                hover:text-[#0F4659]/90
                                disabled:cursor-not-allowed
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
                                bg-[#0F4659]
                                text-sm
                                font-medium
                                text-white
                            "
                        >
                            1
                        </span>

                        {/* NEXT */}

                        <button
                            type="button"
                            disabled={true}
                            className="
                               text-sm
                                text-gray-500
                                transition-colors
                                 text-[#0F4659]
                            hover:text-[#0F4659]/90
                                disabled:cursor-not-allowed
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
