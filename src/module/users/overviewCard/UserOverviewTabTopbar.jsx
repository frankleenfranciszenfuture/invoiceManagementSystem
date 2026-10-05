
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
    setExsistingUser,
} from "../slices/userSlice";

import {
    openModal,
} from "../../ui/uiSlice";

export default function UserOverviewTabTopbar() {

    const dispatch = useDispatch();

    // =========================================================
    // USER STATE
    // =========================================================

    const user = useSelector(
        (state) =>
            state.user?.user
    );

    /*
     * IMPORTANT:
     *
     * This must be the Redux STATE property,
     * not the action creator.
     *
     * Change this according to your userSlice state name.
     */
    const existingUser = useSelector(
        (state) =>
            state.user?.existingUser
    );

    const selectedUserId = useSelector(
        (state) =>
            state.userView?.selectedUserId
    );

    // =========================================================
    // CURRENT USER
    // =========================================================

    const currentUser =
        user ||
        existingUser;

    // =========================================================
    // LOADING
    // =========================================================

    if (!currentUser) {

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
    // RESOLVE USER INFORMATION
    // =========================================================

    const resolvedUserId =
        currentUser?.id ??
        currentUser?.userId ??
        selectedUserId ??
        null;

    const resolvedUserName =
        currentUser?.userName ||
        currentUser?.username ||
        currentUser?.name ||
        currentUser?.firstName ||
        "User";

    const resolvedRoleId =
        currentUser?.roleId ??
        currentUser?.role?.id ??
        null;

    const resolvedRoleName =
        currentUser?.roleName ||
        currentUser?.role?.roleName ||
        currentUser?.role?.name ||
        "";

    // =========================================================
    // EDIT USER
    // =========================================================

    const handleEdit = () => {

        dispatch(
            setExsistingUser(
                currentUser
            )
        );

        dispatch(
            openModal({
                type: "editUser",

                data: {
                    ...currentUser,
                },
            })
        );
    };

    // =========================================================
    // NEW USER
    // =========================================================

    const handleNew = () => {

        dispatch(
            setExsistingUser(
                null
            )
        );

        dispatch(
            openModal({
                type: "addUserPermission",

                data: {
                    userId: null,
                    userName: "",
                    roleId: null,
                    roleName: "",
                },
            })
        );
    };

    // =========================================================
    // USER PERMISSIONS
    // =========================================================

    const handlePermissions = () => {

        if (!resolvedUserId) {

            console.error(
                "Cannot open permissions: user ID is missing.",
                {
                    currentUser,
                    selectedUserId,
                }
            );

            return;
        }

        /*
         * IMPORTANT:
         *
         * User permissions are DIRECT USER permissions.
         *
         * Do not use roleId to decide whether
         * a permission already exists.
         *
         * Unique identity:
         *
         * userId + moduleId + actionId
         */
        dispatch(
            openModal({
                type: "editUserPermission",

                data: {
                    userId: Number(resolvedUserId),

                    userName:
                        resolvedUserName,

                    roleId:
                        resolvedRoleId,

                    roleName:
                        resolvedRoleName,
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
                LEFT - USER NAME
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
                        {resolvedUserName}
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
                    NEW
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
                        onClick={handleNew}
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
                        onClick={handleEdit}
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
                        onClick={handlePermissions}
                        disabled={!resolvedUserId}
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
                            disabled:cursor-not-allowed
                            disabled:opacity-50
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
