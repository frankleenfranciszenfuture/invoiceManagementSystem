import React from "react";

import {
    CreativeCommons,
    FolderClock,
    Paperclip,
    SquarePenIcon,
    SquareX,
} from "lucide-react";

import {
    useDispatch,
    useSelector,
} from "react-redux";

import {
    setExsistingRole,
} from "../slices/roleSlice";

import { openModal } from "../../ui/uiSlice";

export default function RoleOverviewTabTopbar() {

    const dispatch = useDispatch();

    // =========================================================
    // ROLE STATE
    // =========================================================

    const role = useSelector(
        (state) =>
            state.role?.role
    );

    const existingRole = useSelector(
        (state) =>
            state.role?.setExsistingRole
    );

    const selectedRoleId = useSelector(
        (state) =>
            state.roleView?.selectedRoleId
    );

    // API-fetched role is the main source.
    // Existing role is used as fallback.
    const currentRole =
        role || existingRole;

    // =========================================================
    // LOADING
    // =========================================================

    if (!currentRole) {

        return (

            <div
                className="
                    flex
                    items-center
                    justify-between
                    border
                    border-gray-100
                    bg-white
                    px-5
                    py-5
                "
            >

                <h1
                    className="
                        text-2xl
                        font-medium
                        text-gray-400
                    "
                >
                    Loading...
                </h1>

            </div>

        );
    }

    // =========================================================
    // EDIT ROLE
    // =========================================================

    const handleEdit = () => {

        if (!currentRole) {
            return;
        }

        // Keep role available in Redux
        dispatch(
            setExsistingRole(
                currentRole
            )
        );

        // Open edit role modal
        dispatch(
            openModal({
                type: "editRolePer",
                data: {
                    ...currentRole,
                },
            })
        );

    };


    const handleNew = () => {

        if (!currentRole) {
            return;
        }

        // Keep role available in Redux
        dispatch(
            setExsistingRole(
                null
            )
        );

        // Open edit role modal
        dispatch(
            openModal({
                type: "addRolePermission",
                data: {
                    ...null,
                },
            })
        );

    };

    // =========================================================
    // ROLE PERMISSIONS
    // =========================================================

    const handlePermissions = () => {

        dispatch(
            openModal({
                type: "editRolePermission",
                data: {
                    roleId:
                        currentRole.id ||
                        selectedRoleId,

                    roleName:
                        currentRole.roleName ||
                        currentRole.name,
                },
            })
        );

    };

    // =========================================================
    // RENDER
    // =========================================================

    return (

        <div
            className="
                flex
                items-center
                justify-between
                border
                border-gray-100
                bg-white
                px-5
                py-5
            "
        >

            {/* =================================================
                LEFT - ROLE NAME
            ================================================= */}

            <div
                className="
                    flex
                    cursor-pointer
                    items-center
                    gap-1
                "
            >

                <div>

                    <h1
                        className="
                            text-4xl
                            font-medium
                            leading-none
                            text-gray-900
                        "
                    >
                        {
                            currentRole.roleName ||
                            currentRole.name ||
                            "Role"
                        }
                    </h1>

                </div>

            </div>

            {/* =================================================
                RIGHT - ACTION BUTTONS
            ================================================= */}

            <div
                className="
                    flex
                    items-center
                    gap-2
                "
            >

                {/* =================================================
                    New
                ================================================= */}

                <div
                    className="
                        flex
                        cursor-pointer
                        overflow-hidden
                        rounded-sm
                        border
                        border-blue-600
                        bg-blue-500
                        shadow-sm
                    "
                >

                    <button
                        type="button"
                        onClick={
                            handleNew
                        }
                        className="
                            flex
                            items-center
                            gap-1
                            rounded
                            px-2.5
                            py-1
                            text-xs
                            font-medium
                            text-white
                            hover:bg-blue-400
                        "
                    >

                        <CreativeCommons
                            size={16}
                        />

                        <span>
                            New
                        </span>

                    </button>

                </div>



                {/* =================================================
                    EDIT
                ================================================= */}

                <div
                    className="
                        flex
                        cursor-pointer
                        overflow-hidden
                        rounded-sm
                        border
                        border-blue-600
                        bg-blue-500
                        shadow-sm
                    "
                >

                    <button
                        type="button"
                        onClick={
                            handleEdit
                        }
                        className="
                            flex
                            items-center
                            gap-1
                            rounded
                            px-2.5
                            py-1
                            text-xs
                            font-medium
                            text-white
                            hover:bg-blue-400
                        "
                    >

                        <SquarePenIcon
                            size={16}
                        />

                        <span>
                            Edit
                        </span>

                    </button>

                </div>

                {/* =================================================
                    PERMISSIONS
                ================================================= */}

                <div
                    className="
                        flex
                        cursor-pointer
                        overflow-hidden
                        rounded-sm
                        border
                        border-blue-600
                        bg-blue-500
                        shadow-sm
                    "
                >

                    <button
                        type="button"
                        onClick={
                            handlePermissions
                        }
                        className="
                            flex
                            items-center
                            gap-1
                            px-2.5
                            py-1
                            text-xs
                            font-medium
                            text-white
                            hover:bg-blue-400
                        "
                    >

                        <Paperclip
                            size={16}
                        />

                        <span>
                            Permissions
                        </span>

                    </button>

                </div>

                {/* =================================================
                    HISTORY
                ================================================= */}

                <div
                    className="
                        flex
                        cursor-pointer
                        overflow-hidden
                        rounded-sm
                        border
                        border-blue-600
                        bg-blue-500
                        shadow-sm
                    "
                >

                    <button
                        type="button"
                        className="
                            flex
                            items-center
                            px-2.5
                            py-1
                            text-xs
                            font-medium
                            text-white
                            hover:bg-blue-400
                        "
                    >

                        <FolderClock
                            size={16}
                        />

                    </button>

                </div>

                {/* =================================================
                    CLOSE
                ================================================= */}

                <div
                    className="
                        flex
                        cursor-pointer
                        overflow-hidden
                        rounded-sm
                        border
                        border-blue-600
                        bg-blue-500
                        shadow-sm
                    "
                >

                    <button
                        type="button"
                        className="
                            flex
                            items-center
                            px-2.5
                            py-1
                            text-xs
                            font-medium
                            text-white
                            hover:bg-red-800
                        "
                    >

                        <SquareX
                            size={16}
                        />

                    </button>

                </div>

            </div>

        </div>

    );

}