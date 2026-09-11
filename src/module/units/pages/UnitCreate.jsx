
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X } from "lucide-react";
import toast from "react-hot-toast";

import { closeModal } from "../../ui/uiSlice";

import {
    resetUnitForm,
    setUnitField,
} from "../slices/unitSlice";

import {
    createUnit,
    updateUnit,
} from "../thunks/unitThunks";

export default function UnitCreate() {

    const dispatch = useDispatch();

    const { modal } = useSelector(
        (state) => state.ui
    );

    const {
        unit,
        loading,
    } = useSelector(
        (state) => state.unit
    );

    // =========================================================
    // ADD / EDIT MODE
    // =========================================================

    const isEdit =
        modal.type === "editUnit";

    const isOpen =
        modal.open &&
        (
            modal.type === "addUnit" ||
            modal.type === "editUnit"
        );

    // =========================================================
    // FORM
    // =========================================================

    const form = unit || {
        id: null,
        unitName: "",
        unitShortName: "",
        description: "",
        status: "ACTIVE",
    };

    // =========================================================
    // CHANGE FIELD
    // =========================================================

    const handleChange = (field, value) => {

        dispatch(
            setUnitField({
                field,
                value,
            })
        );

    };

    // =========================================================
    // CLOSE MODAL
    // =========================================================

    const handleClose = () => {

        dispatch(closeModal());

        dispatch(
            resetUnitForm()
        );

    };

    // =========================================================
    // ESCAPE KEY
    // =========================================================

    useEffect(() => {

        if (!isOpen) {
            return;
        }

        const handleEscape = (event) => {

            if (event.key === "Escape") {
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

    }, [isOpen]);

    // =========================================================
    // LOAD EXISTING DATA FOR EDIT
    // =========================================================

    useEffect(() => {

        if (
            modal.open &&
            modal.type === "editUnit" &&
            modal.data
        ) {

            const existingUnit =
                modal.data;

            dispatch(
                setUnitField({
                    field: "id",
                    value:
                        existingUnit.id ??
                        null,
                })
            );

            dispatch(
                setUnitField({
                    field: "unitName",
                    value:
                        existingUnit.unitName ??
                        "",
                })
            );

            dispatch(
                setUnitField({
                    field: "unitShortName",
                    value:
                        existingUnit.unitShortName ??
                        "",
                })
            );

            dispatch(
                setUnitField({
                    field: "unitCode",
                    value:
                        existingUnit.unitCode ??
                        "",
                })
            );

            dispatch(
                setUnitField({
                    field: "description",
                    value:
                        existingUnit.description ??
                        "",
                })
            );

            dispatch(
                setUnitField({
                    field: "status",
                    value:
                        existingUnit.status ??
                        "ACTIVE",
                })
            );

        }

    }, [
        modal.open,
        modal.type,
        modal.data,
        dispatch,
    ]);

    // =========================================================
    // SAVE
    // CREATE / UPDATE
    // =========================================================

    const handleSave = async (e) => {

        e.preventDefault();

        // -----------------------------------------------------
        // UNIT NAME
        // -----------------------------------------------------

        if (!form.unitName?.trim()) {

            toast.error(
                "Unit name is required"
            );

            return;
        }

        // -----------------------------------------------------
        // UNIT SHORT NAME
        // -----------------------------------------------------

        if (!form.unitShortName?.trim()) {

            toast.error(
                "Unit short name is required"
            );

            return;
        }

        // -----------------------------------------------------
        // PAYLOAD
        // -----------------------------------------------------

        const payload = {

            unitName:
                form.unitName.trim(),

            unitShortName:
                form.unitShortName.trim(),

            description:
                form.description?.trim() ||
                "",

            status:
                form.status ||
                "ACTIVE",
        };

        try {

            // =================================================
            // EDIT
            // =================================================

            if (isEdit) {

                const unitId =
                    form.id ??
                    modal.data?.id;

                if (!unitId) {

                    toast.error(
                        "Unit ID is missing"
                    );

                    return;
                }

                await dispatch(
                    updateUnit({
                        id: unitId,
                        data: payload,
                    })
                ).unwrap();

                toast.success(
                    "Unit updated successfully"
                );

            }

            // =================================================
            // CREATE
            // =================================================

            else {

                await dispatch(
                    createUnit(payload)
                ).unwrap();

                toast.success(
                    "Unit created successfully"
                );

            }

            // =================================================
            // CLOSE + RESET
            // =================================================

            dispatch(
                closeModal()
            );

            dispatch(
                resetUnitForm()
            );

        } catch (error) {

            console.error(
                "Unit save error:",
                error
            );

            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    error?.response?.data?.message ||
                    (
                        isEdit
                            ? "Failed to update unit"
                            : "Failed to create unit"
                    )
            );

        }

    };

    // =========================================================
    // DO NOT RENDER
    // =========================================================

    if (!isOpen) {
        return null;
    }

    // =========================================================
    // UI
    // =========================================================

    return (

        <div
            className="
                fixed
                inset-0
                z-[100]
                flex
                items-center
                justify-start
                bg-black/25
                pl-105
            "
        >

            {/* =================================================
                MODAL
            ================================================= */}

            <div
                className="
                    w-[950px]
                    h-[650px]
                    max-w-[65vw]
                    bg-white
                    rounded-lg
                    shadow-2xl
                    overflow-hidden
                    flex
                    flex-col
                "
            >

                {/* =================================================
                    HEADER
                ================================================= */}

                <div
                    className="
                        shrink-0
                        flex
                        items-center
                        justify-between
                        px-6
                        py-4
                        border-b
                        border-gray-200
                        bg-blue-700
                    "
                >

                    <div>

                        <h2
                            className="
                                text-[24px]
                                font-semibold
                                text-gray-100
                            "
                        >
                            {isEdit
                                ? "Edit Unit"
                                : "Add New Unit"}
                        </h2>

                        <p
                            className="
                                text-sm
                                text-gray-100
                                mt-1
                            "
                        >
                            {isEdit
                                ? "Update unit details"
                                : "Create a new unit"}
                        </p>

                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        className="
                            w-9
                            h-9
                            flex
                            items-center
                            justify-center
                            rounded-md
                            text-gray-100
                            hover:bg-red-600
                            hover:text-gray-100
                            transition
                        "
                    >

                        <X size={30} />

                    </button>

                </div>

                {/* =================================================
                    FORM
                ================================================= */}

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
                            overflow-y-auto
                            px-6
                            py-6
                        "
                    >

                        {/* =================================================
                            UNIT NAME
                        ================================================= */}

                        <div className="mb-5">

                            <label
                                className="
                                    block
                                    text-sm
                                    font-medium
                                    text-gray-700
                                    mb-2
                                "
                            >

                                Unit Name

                                <span className="
                                    text-red-500
                                    ml-1
                                ">
                                    *
                                </span>

                            </label>

                            <input
                                type="text"
                                value={
                                    form.unitName ??
                                    ""
                                }
                                onChange={(e) =>
                                    handleChange(
                                        "unitName",
                                        e.target.value
                                    )
                                }
                                placeholder="Enter unit name"
                                className="
                                    w-full
                                    h-11
                                    px-3
                                    border
                                    border-gray-300
                                    rounded-md
                                    text-sm
                                    outline-none
                                    focus:border-blue-500
                                    focus:ring-1
                                    focus:ring-blue-500
                                "
                            />

                        </div>

                        {/* =================================================
                            UNIT SHORT NAME
                        ================================================= */}

                        <div className="mb-5">

                            <label
                                className="
                                    block
                                    text-sm
                                    font-medium
                                    text-gray-700
                                    mb-2
                                "
                            >

                                Unit Short Name

                                <span className="
                                    text-red-500
                                    ml-1
                                ">
                                    *
                                </span>

                            </label>

                            <input
                                type="text"
                                value={
                                    form.unitShortName ??
                                    ""
                                }
                                onChange={(e) =>
                                    handleChange(
                                        "unitShortName",
                                        e.target.value
                                    )
                                }
                                placeholder="Enter unit short name"
                                className="
                                    w-full
                                    h-11
                                    px-3
                                    border
                                    border-gray-300
                                    rounded-md
                                    text-sm
                                    outline-none
                                    focus:border-blue-500
                                    focus:ring-1
                                    focus:ring-blue-500
                                "
                            />

                        </div>


                        {/* =================================================
                            UNIT SHORT NAME
                        ================================================= */}

                        <div className="mb-5">

                            <label
                                className="
                                    block
                                    text-sm
                                    font-medium
                                    text-gray-700
                                    mb-2
                                "
                            >

                                Unit Short Name

                                <span className="
                                    text-red-500
                                    ml-1
                                ">
                                    *
                                </span>

                            </label>

                            <input
                                type="text"
                                value={
                                    form.unitShortName ??
                                    ""
                                }
                                onChange={(e) =>
                                    handleChange(
                                        "unitShortName",
                                        e.target.value
                                    )
                                }
                                placeholder="Enter unit short name"
                                className="
                                    w-full
                                    h-11
                                    px-3
                                    border
                                    border-gray-300
                                    rounded-md
                                    text-sm
                                    outline-none
                                    focus:border-blue-500
                                    focus:ring-1
                                    focus:ring-blue-500
                                "
                            />

                        </div>




                        {/* =================================================
                            DESCRIPTION
                        ================================================= */}

                        <div className="mb-5">

                            <label
                                className="
                                    block
                                    text-sm
                                    font-medium
                                    text-gray-700
                                    mb-2
                                "
                            >
                                Description
                            </label>

                            <textarea
                                rows={4}
                                value={
                                    form.description ??
                                    ""
                                }
                                onChange={(e) =>
                                    handleChange(
                                        "description",
                                        e.target.value
                                    )
                                }
                                placeholder="Enter description"
                                className="
                                    w-full
                                    px-3
                                    py-3
                                    border
                                    border-gray-300
                                    rounded-md
                                    text-sm
                                    outline-none
                                    resize-none
                                    focus:border-blue-500
                                    focus:ring-1
                                    focus:ring-blue-500
                                "
                            />

                        </div>

                        {/* =================================================
                            STATUS
                        ================================================= */}

                        <div className="mb-2">

                            <label
                                className="
                                    block
                                    text-sm
                                    font-medium
                                    text-gray-700
                                    mb-2
                                "
                            >
                                Status
                            </label>

                            <select
                                value={
                                    form.status ??
                                    "ACTIVE"
                                }
                                onChange={(e) =>
                                    handleChange(
                                        "status",
                                        e.target.value
                                    )
                                }
                                className="
                                    w-full
                                    h-11
                                    px-3
                                    border
                                    border-gray-300
                                    rounded-md
                                    text-sm
                                    bg-white
                                    outline-none
                                    focus:border-blue-500
                                    focus:ring-1
                                    focus:ring-blue-500
                                "
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

                    {/* =================================================
                        FOOTER
                    ================================================= */}

                    <div
                        className="
                            shrink-0
                            flex
                            items-center
                            justify-end
                            gap-3
                            px-6
                            py-4
                            border-t
                            border-gray-200
                            bg-white
                        "
                    >

                        {/* CANCEL */}

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

                        {/* SAVE / UPDATE */}

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
                                ? (
                                    isEdit
                                        ? "Updating..."
                                        : "Saving..."
                                )
                                : (
                                    isEdit
                                        ? "Update"
                                        : "Save"
                                )}

                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}
