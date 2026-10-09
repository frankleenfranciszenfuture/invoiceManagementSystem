
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
    fetchAllRoles,
    deleteRole,
} from "../thunks/roleThunks";

import {
    setExsistingRole,
} from "../slices/roleSlice";

import { openModal } from "../../ui/uiSlice";

import {
    ChevronDown,
    Edit,
    Trash2,
    ShieldCheck,
    Eye,
} from "lucide-react";

import toast from "react-hot-toast";

export default function RoleTable({
    roles = [],
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
        (state) => state.role || {}
    );

    const currentRoles = roles || [];

    /* =====================================================
       DELETE ROLE
    ===================================================== */

    const handleDelete = async (id) => {

        if (!window.confirm("Delete this role?")) {
            return;
        }

        try {

            await dispatch(
                deleteRole(id)
            ).unwrap();

            toast.success(
                "Role deleted successfully"
            );

            dispatch(
                fetchAllRoles()
            );

        } catch (error) {

            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    "Failed to delete role"
            );
        }
    };

    /* =====================================================
       VIEW ROLE
    ===================================================== */

    const handleView = (role) => {

        try {

            dispatch(
                setExsistingRole(
                    role
                )
            );

            navigate(
                `/roles/view/${role.id}`
            );

        } catch (error) {

            toast.error(
                "Failed to open role"
            );
        }
    };

    /* =====================================================
       EDIT ROLE
    ===================================================== */

    const handleEdit = (role) => {

        try {

            dispatch(
                openModal({
                    type: "editRole",
                    data: role,
                })
            );

        } catch (error) {

            toast.error(
                "Failed to open role"
            );
        }
    };

    /* =====================================================
       ROLE INITIALS
    ===================================================== */

    const initials = (roleName) =>
        roleName
            ?.split(" ")
            .map(
                (word) =>
                    word[0]
            )
            .join("")
            .slice(0, 2)
            .toUpperCase() || "RL";

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
       ROLE NAME COLOR
    ===================================================== */

    const getRoleNameColor = (roleName) => {

        if (!roleName) {
            return "bg-gray-100 text-gray-700";
        }

        const hasNumber =
            /\d/.test(roleName);

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
                    Loading roles...
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

    if (!currentRoles.length) {

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

                <ShieldCheck
                    className="
                        mx-auto
                        mb-3
                        h-10
                        w-10
                        text-gray-300
                    "
                />

                <p className="text-gray-500">
                    No roles found.
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

                    <thead className="bg-[#EDE8D9]/90 border-b border-gray-300">
                        <tr>

                            {[
                                "Role Name",
                                "Description",
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

                        {[...currentRoles]
                            .sort(
                                (a, b) =>
                                    (a.id || 0) -
                                    (b.id || 0)
                            )
                            .map(
                                (
                                    role,
                                    index
                                ) => (

                                    <tr
                                        key={
                                            role.id ||
                                            index
                                        }
                                        onClick={() =>
                                            handleView(
                                                role
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
                                            ROLE NAME
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
                                                        role.roleName
                                                    )}
                                                    `}
                                                >

                                                    {
                                                        initials(
                                                            role.roleName
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
                                                            role.roleName ||
                                                            ""
                                                        }
                                                    >
                                                        {
                                                            role.roleName ||
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
                                                            role.id
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
                                                    role.description ||
                                                    ""
                                                }
                                            >
                                                {
                                                    role.description ||
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
                                                        role.status ||
                                                        ""
                                                    ).toUpperCase()
                                                    ] ||
                                                    "bg-gray-100 text-gray-700"
                                                    }
                                                `}
                                            >
                                                {
                                                    role.status ||
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
                                                        dispatch(setExsistingRole(role));
                                                        navigate(`/roles/view/${role.id}`);
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
                                                        dispatch(
                                                            openModal({
                                                                type: "editRole",
                                                                data: role,
                                                            })
                                                        );

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
                                                        handleDelete(role.id);
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

                        {currentRoles.length}

                        {" "}of{" "}

                        {currentRoles.length}

                        {" "}roles

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
