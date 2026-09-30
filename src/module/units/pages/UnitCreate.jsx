import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { UserRoundArrowLeft, X } from "lucide-react";
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

    const [errors, setErrors] =
        useState({});

    const [activeTab, setActiveTab] = useState("unit");

    const tabs = [
        {
            id: "unit",
            label: "Unit Information",
        },
        {
            id: "settings",
            label: "Settings",
        },
    ];

    const inputClass = `
    w-full
    h-11
    px-3
    border
    border-gray-300
    rounded-md
    text-sm
    text-gray-700
    bg-white
    outline-none
    transition
    focus:border-blue-500
    focus:ring-1
    focus:ring-blue-500
    disabled:bg-gray-100
    disabled:text-gray-500
    disabled:cursor-not-allowed
`;

    const labelClass = `
    block
    text-xs
    font-medium
    text-gray-600
    mb-1.5
`;

    // =========================================================
    // UI
    // =========================================================

    return (
        <div
            className="
            w-[950px]
            max-w-[95vw]
            h-[700px]
            max-h-[88vh]

            bg-white
            rounded-xl
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
                        <UserRoundArrowLeft
                            size={20}
                            className="text-blue-600"
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
                            {isEdit
                                ? "Edit Unit"
                                : "New Unit"}
                        </h2>

                        <p
                            className="
                            text-xs
                            text-gray-500
                            mt-0.5
                        "
                        >
                            {isEdit
                                ? "Update unit information"
                                : "Create a new unit"}
                        </p>

                    </div>

                </div>

            </div>


            {/* =================================================
            TABS
        ================================================= */}

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
                    gap-8
                    h-[52px]
                "
                >

                    {tabs.map((tab) => {

                        const active =
                            activeTab === tab.id;

                        const hasError =
                            tab.id === "unit" &&
                            (
                                errors?.unitName ||
                                errors?.unitShortName
                            );

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
                                        : hasError
                                            ? "text-red-500"
                                            : "text-gray-500 hover:text-gray-800"
                                    }
                            `}
                            >

                                <span
                                    className="
                                    flex
                                    items-center
                                    gap-1.5
                                "
                                >

                                    {tab.label}

                                    {hasError && (
                                        <span
                                            className="
                                            w-1.5
                                            h-1.5
                                            rounded-full
                                            bg-red-500
                                        "
                                        />
                                    )}

                                </span>

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
                overflow-hidden
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
                    overflow-x-hidden

                    px-7
                    py-6

                    bg-gray-50/50
                "
                >

                    {/* =================================================
                    UNIT INFORMATION
                ================================================= */}

                    {activeTab === "unit" && (

                        <div>

                            {/* SECTION HEADER */}

                            <div
                                className="
                                mb-6

                                flex
                                items-start
                                justify-between

                                gap-6
                            "
                            >

                                <div>

                                    <h3
                                        className="
                                        text-base
                                        font-semibold
                                        text-gray-800
                                    "
                                    >
                                        Unit Information
                                    </h3>

                                    <p
                                        className="
                                        text-xs
                                        text-gray-500
                                        mt-1
                                    "
                                    >
                                        Configure the basic unit information.
                                    </p>

                                </div>


                                {/* STATUS */}

                                <div
                                    className="
                                    flex
                                    items-center
                                    gap-3
                                    shrink-0
                                "
                                >

                                    <label
                                        className="
                                        text-md
                                        font-semibold
                                        text-gray-600
                                    "
                                    >
                                        Status :
                                    </label>

                                    <span
                                        className={`
                                        inline-flex
                                        items-center
                                        justify-center

                                        min-w-[85px]
                                        h-7
                                        px-3

                                        rounded-full

                                        text-sm
                                        font-bold

                                        ${form.status === "ACTIVE"
                                                ? "bg-green-50 text-green-700"
                                                : form.status === "INACTIVE"
                                                    ? "bg-red-50 text-red-700"
                                                    : "bg-yellow-50 text-yellow-700"
                                            }
                                    `}
                                    >
                                        {form.status || "ACTIVE"}
                                    </span>

                                </div>

                            </div>


                            {/* =================================================
                            UNIT FIELDS
                        ================================================= */}

                            <div
                                className="
                                grid
                                grid-cols-2
                                gap-x-6
                                gap-y-5
                            "
                            >

                                {/* =================================================
                                UNIT NAME
                            ================================================= */}

                                <div>

                                    <label
                                        className={labelClass}
                                    >
                                        Unit Name

                                        <span
                                            className="
                                            text-red-500
                                            ml-1
                                        "
                                        >
                                            *
                                        </span>

                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            form.unitName ?? ""
                                        }
                                        onChange={(e) =>
                                            handleChange(
                                                "unitName",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter unit name"
                                        className={inputClass}
                                    />

                                    {errors?.unitName && (
                                        <p
                                            className="
                                            text-xs
                                            text-red-500
                                            mt-1
                                        "
                                        >
                                            {errors.unitName}
                                        </p>
                                    )}

                                </div>


                                {/* =================================================
                                UNIT SHORT NAME
                            ================================================= */}

                                <div>

                                    <label
                                        className={labelClass}
                                    >
                                        Unit Short Name

                                        <span
                                            className="
                                            text-red-500
                                            ml-1
                                        "
                                        >
                                            *
                                        </span>

                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            form.unitShortName ?? ""
                                        }
                                        onChange={(e) =>
                                            handleChange(
                                                "unitShortName",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter unit short name"
                                        className={inputClass}
                                    />

                                    {errors?.unitShortName && (
                                        <p
                                            className="
                                            text-xs
                                            text-red-500
                                            mt-1
                                        "
                                        >
                                            {errors.unitShortName}
                                        </p>
                                    )}

                                </div>


                                {/* =================================================
                                DESCRIPTION
                            ================================================= */}

                                <div className="col-span-2">

                                    <label
                                        className={labelClass}
                                    >
                                        Description
                                    </label>

                                    <textarea
                                        rows={5}
                                        value={
                                            form.description ?? ""
                                        }
                                        onChange={(e) =>
                                            handleChange(
                                                "description",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter unit description"
                                        className="
                                        w-full

                                        px-3
                                        py-3

                                        border
                                        border-gray-300

                                        rounded-md

                                        text-sm
                                        text-gray-700

                                        bg-white

                                        outline-none
                                        resize-none

                                        transition

                                        focus:border-blue-500
                                        focus:ring-1
                                        focus:ring-blue-500
                                    "
                                    />

                                </div>

                            </div>

                        </div>

                    )}


                    {/* =================================================
                    SETTINGS
                ================================================= */}

                    {activeTab === "settings" && (

                        <div>

                            <div className="mb-6">

                                <h3
                                    className="
                                    text-base
                                    font-semibold
                                    text-gray-800
                                "
                                >
                                    Unit Settings
                                </h3>

                                <p
                                    className="
                                    text-xs
                                    text-gray-500
                                    mt-1
                                "
                                >
                                    Configure the unit availability and status.
                                </p>

                            </div>


                            {/* STATUS */}

                            <div className="max-w-[460px]">

                                <label
                                    className={labelClass}
                                >
                                    Status
                                </label>

                                <select
                                    value={
                                        form.status ?? "ACTIVE"
                                    }
                                    onChange={(e) =>
                                        handleChange(
                                            "status",
                                            e.target.value
                                        )
                                    }
                                    className={inputClass}
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


                            {/* =================================================
                            UNIT STATE
                        ================================================= */}

                            <div
                                className="
                                mt-7

                                border
                                border-gray-200

                                rounded-lg

                                bg-white

                                p-5
                            "
                            >

                                <div
                                    className="
                                    flex
                                    items-center
                                    justify-between
                                "
                                >

                                    <div>

                                        <p
                                            className="
                                            text-sm
                                            font-medium
                                            text-gray-800
                                        "
                                        >
                                            Unit Status
                                        </p>

                                        <p
                                            className="
                                            text-xs
                                            text-gray-500
                                            mt-1
                                        "
                                        >
                                            This unit is currently set to{" "}

                                            <span
                                                className="
                                                font-medium
                                                text-gray-700
                                            "
                                            >
                                                {form.status || "ACTIVE"}
                                            </span>

                                        </p>

                                    </div>


                                    <span
                                        className={`
                                        inline-flex
                                        items-center
                                        justify-center

                                        min-w-[85px]
                                        h-7
                                        px-3

                                        rounded-full

                                        text-xs
                                        font-medium

                                        ${form.status === "ACTIVE"
                                                ? "bg-green-50 text-green-700"
                                                : form.status === "INACTIVE"
                                                    ? "bg-red-50 text-red-700"
                                                    : "bg-yellow-50 text-yellow-700"
                                            }
                                    `}
                                    >
                                        {form.status || "ACTIVE"}
                                    </span>

                                </div>

                            </div>

                        </div>

                    )}

                </div>


                {/* =================================================
                FOOTER
            ================================================= */}

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

                        <span className="text-red-500">
                            *
                        </span>

                        {" "}Required fields

                    </div>


                    <div
                        className="
                        flex
                        items-center
                        gap-3
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
                                ? isEdit
                                    ? "Updating..."
                                    : "Saving..."
                                : isEdit
                                    ? "Update Unit"
                                    : "Save Unit"}
                        </button>

                    </div>

                </div>

            </form>

        </div>
    );
}