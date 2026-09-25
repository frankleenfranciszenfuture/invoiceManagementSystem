import React from "react";
import { useDispatch, useSelector } from "react-redux";

import {
    fetchAllSubCategories,
    deleteSubCategory,
} from "../thunks/subCategoryThunks";

import {
    setExsistingSubCategory,
} from "../slices/subCategorySlice";

import { openModal } from "../../ui/uiSlice";

import {
    ChevronDown,
    Edit,
    Trash2,
    ListTree,
} from "lucide-react";

import toast from "react-hot-toast";

export default function SubCategoryTable({
    subCategories = [],
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
        (state) => state.subCategory || {}
    );

    const {
        pageNumber,
        pageSize,
        totalPages,
        totalElements,
    } = pagination || {};

    const currentSubCategories =
        subCategories || [];

    /* =====================================================
       DELETE SUB CATEGORY
    ===================================================== */

    const handleDelete = async (id) => {

        if (!window.confirm("Delete this sub category?")) {
            return;
        }

        try {

            await dispatch(
                deleteSubCategory(id)
            ).unwrap();

            toast.success(
                "Sub category deleted successfully"
            );

            dispatch(
                fetchAllSubCategories()
            );

        } catch (error) {

            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    "Failed to delete sub category"
            );
        }
    };

    /* =====================================================
       VIEW SUB CATEGORY
       Currently kept same pattern as SizeTable.
       View button is disabled/commented in UI.
    ===================================================== */

    const handleView = (subCategory) => {

        try {

            dispatch(
                setExsistingSubCategory(
                    subCategory
                )
            );

            // Add navigation here later if needed.
            // navigate(`/sub-categories/view/${subCategory.id}`);

        } catch (error) {

            toast.error(
                "Failed to open sub category"
            );
        }
    };

    /* =====================================================
       EDIT SUB CATEGORY
    ===================================================== */

    const handleEdit = (subCategory) => {

        try {

            dispatch(
                openModal({
                    type: "editSubCategory",
                    data: subCategory,
                })
            );

        } catch (error) {

            toast.error(
                "Failed to open sub category"
            );
        }
    };

    /* =====================================================
       SUB CATEGORY INITIALS
    ===================================================== */

    const initials = (name) =>
        name
            ?.split(" ")
            .map(
                (word) =>
                    word[0]
            )
            .join("")
            .slice(0, 2)
            .toUpperCase() || "SC";

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
       SUB CATEGORY NAME COLOR
    ===================================================== */

    const getSubCategoryNameColor = (name) => {

        if (!name) {
            return "bg-gray-100 text-gray-700";
        }

        const hasNumber =
            /\d/.test(name);

        if (hasNumber) {
            return "bg-blue-100 text-blue-700";
        }

        return "bg-purple-100 text-purple-700";
    };

    /* =====================================================
       SUB CATEGORY CODE COLOR
    ===================================================== */

    const getSubCategoryCodeColor = (
        subCategoryCode
    ) => {

        if (!subCategoryCode) {
            return "bg-gray-100 text-gray-700";
        }

        const value =
            subCategoryCode
                .trim()
                .toUpperCase();

        const lastPart =
            value.split("-").pop();

        // Last part is only numbers
        if (/^\d+$/.test(lastPart)) {
            return "bg-gray-100 text-orange-400";
        }

        // Last part contains letters
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
                    Loading sub categories...
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

    if (!currentSubCategories.length) {

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

                <ListTree
                    className="
                        mx-auto
                        mb-3
                        h-10
                        w-10
                        text-gray-300
                    "
                />

                <p className="text-gray-500">
                    No sub categories found.
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

            {/* =================================================
                TABLE CONTAINER
            ================================================= */}

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

                            {/* SUB CATEGORY NAME */}

                            <th
                                className="
                                    w-[22%]
                                    px-2
                                    py-3
                                    font-medium
                                    text-sm
                                    text-gray-600
                                    uppercase
                                    text-left
                                "
                            >
                                Sub Category
                            </th>

                            {/* CATEGORY */}

                            <th
                                className="
                                    w-[18%]
                                    px-2
                                    py-3
                                    font-medium
                                    text-sm
                                    text-gray-600
                                    uppercase
                                    text-left
                                "
                            >
                                Category
                            </th>

                            {/* SUB CATEGORY CODE */}

                            <th
                                className="
                                    w-[18%]
                                    px-2
                                    py-3
                                    font-medium
                                    text-sm
                                    text-gray-600
                                    uppercase
                                    text-left
                                "
                            >
                                Sub Category Code
                            </th>

                            {/* DESCRIPTION */}

                            <th
                                className="
                                    w-[22%]
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
                                    w-[12%]
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

                        {[...currentSubCategories]
                            .sort(
                                (a, b) =>
                                    (a.id || 0) -
                                    (b.id || 0)
                            )
                            .map(
                                (
                                    subCategory,
                                    index
                                ) => (

                                    <tr
                                        key={
                                            subCategory.id ||
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
                                            SUB CATEGORY NAME
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
                                                            subCategory.name
                                                        )}
                                                    `}
                                                >

                                                    {
                                                        initials(
                                                            subCategory.name
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
                                                            subCategory.name ||
                                                            ""
                                                        }
                                                    >
                                                        {
                                                            subCategory.name ||
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
                                                            subCategory.id
                                                        }
                                                    </p>

                                                </div>

                                            </div>

                                        </td>

                                        {/* =================================
                                            CATEGORY
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
                                                    min-w-0
                                                "
                                            >

                                                <p
                                                    className="
                                                        font-medium
                                                        text-gray-700
                                                        truncate
                                                    "
                                                    title={
                                                        subCategory.categoryName ||
                                                        ""
                                                    }
                                                >
                                                    {
                                                        subCategory.categoryName ||
                                                        "—"
                                                    }
                                                </p>

                                                <p
                                                    className="
                                                        text-xs
                                                        text-gray-500
                                                        truncate
                                                    "
                                                    title={
                                                        subCategory.categoryCode ||
                                                        ""
                                                    }
                                                >
                                                    {
                                                        subCategory.categoryCode ||
                                                        "—"
                                                    }
                                                </p>

                                            </div>

                                        </td>

                                        {/* =================================
                                            SUB CATEGORY CODE
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
                                                    inline-flex
                                                    items-center
                                                    w-fit
                                                    max-w-full
                                                    px-2.5
                                                    py-1
                                                    rounded-md
                                                    text-xs
                                                    font-medium
                                                    truncate
                                                    ${getSubCategoryCodeColor(
                                                        subCategory.subCategoryCode
                                                    )}
                                                `}
                                                title={
                                                    subCategory.subCategoryCode ||
                                                    ""
                                                }
                                            >
                                                {
                                                    subCategory.subCategoryCode ||
                                                    "—"
                                                }
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
                                                    text-gray-700
                                                "
                                                title={
                                                    subCategory.description ||
                                                    ""
                                                }
                                            >
                                                {
                                                    subCategory.description ||
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
                                                    ${
                                                        statusColor[
                                                            subCategory.status
                                                        ] ||
                                                        "bg-gray-100 text-gray-700"
                                                    }
                                                `}
                                            >
                                                {
                                                    subCategory.status ||
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

                                                    {/* =========================
                                                        ACTION MENU
                                                    ========================= */}

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
                                                                        subCategory
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
                                                                        subCategory.id
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

                        {currentSubCategories.length}

                        {" "}of{" "}

                        {totalElements || 0}

                        {" "}sub categories

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