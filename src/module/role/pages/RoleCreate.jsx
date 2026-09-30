
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import { closeModal } from "../../ui/uiSlice";

import {
    resetRoleForm,
    setRoleField,
} from "../slices/roleSlice";

import {
    createRole,
    updateRole,
} from "../thunks/roleThunks";

export default function RoleCreate() {

    const dispatch = useDispatch();

    const { modal } = useSelector(
        (state) => state.ui
    );

    const {
        role,
        loading,
    } = useSelector(
        (state) => state.role
    );

    // =========================================================
    // ADD / EDIT MODE
    // =========================================================

    const isEdit =
        modal.type === "editRole";

    const isOpen =
        modal.open &&
        (
            modal.type === "addRole" ||
            modal.type === "editRole"
        );

    // =========================================================
    // FORM
    // =========================================================

    const form = role || {
        id: null,
        roleName: "",
        description: "",
        status: "ACTIVE",
    };

    // =========================================================
    // CHANGE FIELD
    // =========================================================

    const handleChange = (field, value) => {

        dispatch(
            setRoleField({
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
            resetRoleForm()
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
            modal.type === "editRole" &&
            modal.data
        ) {

            const existingRole =
                modal.data;

            dispatch(
                setRoleField({
                    field: "id",
                    value:
                        existingRole.id ??
                        null,
                })
            );

            dispatch(
                setRoleField({
                    field: "roleName",
                    value:
                        existingRole.roleName ??
                        "",
                })
            );

            dispatch(
                setRoleField({
                    field: "description",
                    value:
                        existingRole.description ??
                        "",
                })
            );

            dispatch(
                setRoleField({
                    field: "status",
                    value:
                        existingRole.status ??
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
        // ROLE NAME
        // -----------------------------------------------------

        if (!form.roleName?.trim()) {

            toast.error(
                "Role name is required"
            );

            return;
        }

        // -----------------------------------------------------
        // PAYLOAD
        // -----------------------------------------------------

        const payload = {

            roleName:
                form.roleName.trim(),

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

                const roleId =
                    form.id ??
                    modal.data?.id;

                if (!roleId) {

                    toast.error(
                        "Role ID is missing"
                    );

                    return;
                }

                await dispatch(
                    updateRole({
                        id: roleId,
                        data: payload,
                    })
                ).unwrap();

                toast.success(
                    "Role updated successfully"
                );

            }

            // =================================================
            // CREATE
            // =================================================

            else {

                await dispatch(
                    createRole(payload)
                ).unwrap();

                toast.success(
                    "Role created successfully"
                );

            }

            // =================================================
            // CLOSE + RESET
            // =================================================

            dispatch(
                closeModal()
            );

            dispatch(
                resetRoleForm()
            );

        } catch (error) {

            console.error(
                "Role save error:",
                error
            );

            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    error?.response?.data?.message ||
                    (
                        isEdit
                            ? "Failed to update role"
                            : "Failed to create role"
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
                            ? "Edit Role"
                            : "Add New Role"}
                    </h2>

                    <p
                        className="
                            text-sm
                            text-gray-100
                            mt-1
                        "
                    >
                        {isEdit
                            ? "Update role details"
                            : "Create a new role"}
                    </p>

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
                        ROLE NAME
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

                            Role Name

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
                                form.roleName ??
                                ""
                            }
                            onChange={(e) =>
                                handleChange(
                                    "roleName",
                                    e.target.value
                                )
                            }
                            placeholder="Enter role name"
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
                            rows={5}
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
                            placeholder="Enter role description"
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
    );
}
