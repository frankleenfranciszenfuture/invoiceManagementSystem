import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import toast from "react-hot-toast";

import {
    useDispatch,
    useSelector,
} from "react-redux";

import {
    Check,
    CheckSquare,
    ChevronDown,
    LockKeyhole,
    Search,
    ShieldCheck,
    UserRound,
} from "lucide-react";

import {
    createRolePermission,
    getAllModuleActions,
    getRolePermission,
    updateRolePermission,

    createUserPermission,
    getUserPermission,
    getUserPermissionById,
    updateUserPermission,
} from "../thunks/menuPermissionThunks";

import {
    clearSelectedUserPermissions,
} from "../slices/menuPermissionSlice";

import { fetchAllRoles } from "../../role/thunks/roleThunks";

import { fetchAllUsers } from "../../users/thunks/userThunks";


export default function MenuPermissions() {

    const dispatch = useDispatch();


    /* =========================================================
       TAB
    ========================================================= */

    const [tab, setTab] = useState("role");

    const isRole = tab === "role";


    /* =========================================================
       LOCAL STATE
    ========================================================= */

    const [allSelected, setAllSelected] =
        useState(false);

    const [selectedEntity, setSelectedEntity] =
        useState("");

    const [searchTerm, setSearchTerm] =
        useState("");

    const [permissions, setPermissions] =
        useState([]);


    /* =========================================================
       AUTH
    ========================================================= */

    const user = useSelector(
        (state) => state.auth?.user,
    );


    /* =========================================================
       ROLES
    ========================================================= */

    const roles = useSelector(
        (state) =>
            Array.isArray(state.role?.roles)
                ? state.role.roles
                : [],
    );


    /* =========================================================
       USERS
    ========================================================= */

    const users = useSelector(
        (state) =>
            Array.isArray(state.user?.users)
                ? state.user.users
                : [],
    );


    /* =========================================================
       ENTITY LIST
    ========================================================= */

    const entityList = isRole
        ? roles
        : users;


    /* =========================================================
       ROLE PERMISSIONS
    ========================================================= */

    const rolePermissions = useSelector(
        (state) =>
            Array.isArray(
                state.menuPermission
                    ?.rolePermissions,
            )
                ? state.menuPermission
                    .rolePermissions
                : [],
    );


    /* =========================================================
       SELECTED USER PERMISSIONS

       IMPORTANT:
       This was previously reading:

       userPermissions1

       But Redux slice actually stores:

       selectedUserPermissions
    ========================================================= */

    const userPermissions = useSelector(
        (state) =>
            Array.isArray(
                state.menuPermission
                    ?.selectedUserPermissions,
            )
                ? state.menuPermission
                    .selectedUserPermissions
                : [],
    );


    /* =========================================================
       MODULE ACTIONS
    ========================================================= */

    const moduleActions = useSelector(
        (state) =>
            Array.isArray(
                state.menuPermission
                    ?.moduleActions,
            )
                ? state.menuPermission
                    .moduleActions
                : [],
    );


    /* =========================================================
       CURRENT LOGGED-IN USER PERMISSIONS
    ========================================================= */

    const currentUserPermissions =
        useSelector(
            (state) =>
                Array.isArray(
                    state.menuPermission
                        ?.userPermissions,
                )
                    ? state.menuPermission
                        .userPermissions
                    : [],
        );


    /* =========================================================
       ROLE
    ========================================================= */

    const roleName =
        user?.roleName ||
        user?.role?.roleName ||
        user?.role?.name ||
        user?.role ||
        user?.authority ||
        "";

    const normalizedRole =
        String(roleName)
            .trim()
            .toUpperCase();

    const isSuperAdmin =
        normalizedRole === "SUPER_ADMIN";

    const isAdmin =
        normalizedRole === "ADMIN";


    /* =========================================================
       NORMALIZE USER PERMISSIONS
       
       Supports both:

       1. Flat:
       {
           userId,
           moduleId,
           actionId,
           allowed
       }

       2. Grouped:
       {
           userId,
           moduleId,
           actions: [
               {
                   actionId,
                   allowed
               }
           ]
       }
    ========================================================= */

    const normalizedUserPermissions =
        useMemo(() => {

            if (
                !Array.isArray(
                    userPermissions,
                )
            ) {
                return [];
            }

            return userPermissions.flatMap(
                (item) => {

                    /* =========================================
                       FLAT RESPONSE
                    ========================================= */

                    if (
                        item?.moduleId != null &&
                        item?.actionId != null &&
                        !Array.isArray(
                            item?.actions,
                        )
                    ) {

                        return [
                            {
                                userId:
                                    item?.userId,

                                moduleId:
                                    item?.moduleId,

                                actionId:
                                    item?.actionId,

                                allowed:
                                    item?.allowed === true ||
                                    item?.allowed === "true",
                            },
                        ];
                    }


                    /* =========================================
                       GROUPED RESPONSE
                    ========================================= */

                    if (
                        Array.isArray(
                            item?.actions,
                        )
                    ) {

                        return item.actions.map(
                            (action) => ({

                                userId:
                                    item?.userId,

                                moduleId:
                                    item?.moduleId,

                                actionId:
                                    action?.actionId,

                                allowed:
                                    action?.allowed === true ||
                                    action?.allowed === "true",

                            }),
                        );
                    }


                    return [];
                },
            );

        }, [
            userPermissions,
        ]);


    /* =========================================================
       SAVED PERMISSIONS
    ========================================================= */

    const savedPermissions = isRole
        ? rolePermissions
        : normalizedUserPermissions;


    /* =========================================================
       RESET WHEN SWITCHING TAB
    ========================================================= */

    useEffect(() => {

        setSelectedEntity("");

        setAllSelected(false);

        setPermissions([]);

        setSearchTerm("");

        if (!isRole) {
            dispatch(
                clearSelectedUserPermissions(),
            );
        }

    }, [
        tab,
        dispatch,
        isRole,
    ]);


    /* =========================================================
       LOAD MODULE ACTIONS
    ========================================================= */

    useEffect(() => {

        if (!user?.id) {
            return;
        }

        dispatch(
            getAllModuleActions(),
        );

    }, [
        dispatch,
        user?.id,
    ]);


    /* =========================================================
       LOAD ROLES AND USERS
    ========================================================= */

    useEffect(() => {

        if (!user?.id) {
            return;
        }

        dispatch(
            fetchAllRoles(),
        );

        dispatch(
            fetchAllUsers({
                page: 0,
                size: 100,
                search: "",
                sortBy: "id",
                sortDirection: "desc",
            }),
        );

    }, [
        dispatch,
        user?.id,
    ]);


    /* =========================================================
       LOAD CURRENT LOGGED-IN USER PERMISSION
    ========================================================= */

    useEffect(() => {

        if (!user?.id) {
            return;
        }

        dispatch(
            getUserPermission(),
        );

    }, [
        dispatch,
        user?.id,
    ]);


    /* =========================================================
       LOAD SELECTED ENTITY PERMISSION
    ========================================================= */

    useEffect(() => {

        if (!selectedEntity) {

            setPermissions([]);

            setAllSelected(false);

            if (!isRole) {
                dispatch(
                    clearSelectedUserPermissions(),
                );
            }

            return;
        }


        /* =====================================================
           ROLE
        ===================================================== */

        if (isRole) {

            dispatch(
                getRolePermission({
                    roleId:
                        Number(
                            selectedEntity,
                        ),
                }),
            );

            return;
        }


        /* =====================================================
           USER
        ===================================================== */

        dispatch(
            clearSelectedUserPermissions(),
        );

        dispatch(
            getUserPermissionById({
                userId:
                    Number(
                        selectedEntity,
                    ),
            }),
        );

    }, [
        selectedEntity,
        isRole,
        dispatch,
    ]);


    /* =========================================================
       ACTION NAME
    ========================================================= */

    const getActionName = (
        actionName = "",
    ) => {

        if (!actionName) {
            return "";
        }

        return (
            actionName.charAt(0) +
            actionName
                .slice(1)
                .toLowerCase()
        );
    };


    /* =========================================================
       ACTION HEADERS
    ========================================================= */

    const actionHeaders = useMemo(() => {

        if (
            !Array.isArray(
                moduleActions,
            )
        ) {
            return [];
        }

        return [
            ...new Set(
                moduleActions
                    .map(
                        (item) =>
                            getActionName(
                                item?.actionName,
                            ),
                    )
                    .filter(Boolean),
            ),
        ];

    }, [
        moduleActions,
    ]);


    /* =========================================================
       CHECK EXISTING PERMISSION
       
       ROLE:
       Check role permission records.

       USER:
       If selected-user API returned permissions,
       treat them as existing.
    ========================================================= */

    const hasExistingPermission =
        useMemo(() => {

            if (!selectedEntity) {
                return false;
            }


            /* =================================================
               ROLE
            ================================================= */

            if (isRole) {

                return rolePermissions.some(
                    (permission) =>
                        Number(
                            permission?.roleId,
                        ) ===
                        Number(
                            selectedEntity,
                        ),
                );

            }


            /* =================================================
               USER
            ================================================= */

            return (
                normalizedUserPermissions
                    .length > 0
            );

        }, [
            selectedEntity,
            isRole,
            rolePermissions,
            normalizedUserPermissions,
        ]);


    /* =========================================================
       BUILD PERMISSION MATRIX
    ========================================================= */

    useEffect(() => {

        if (
            !moduleActions.length ||
            !selectedEntity
        ) {

            setPermissions([]);

            return;
        }


        const grouped =
            Object.values(
                moduleActions.reduce(
                    (acc, item) => {

                        /* =====================================
                           CREATE MODULE
                        ===================================== */

                        if (
                            !acc[
                            item.moduleId
                            ]
                        ) {

                            acc[
                                item.moduleId
                            ] = {

                                moduleId:
                                    item.moduleId,

                                moduleName:
                                    item.moduleName,

                                permissions: {},
                            };
                        }


                        /* =====================================
                           FIND SAVED PERMISSION
                        ===================================== */

                        const saved =
                            savedPermissions.find(
                                (
                                    permission,
                                ) => {

                                    /*
                                     * ROLE
                                     */
                                    const entityMatch =
                                        isRole
                                            ? (
                                                Number(
                                                    permission?.roleId,
                                                ) ===
                                                Number(
                                                    selectedEntity,
                                                )
                                            )

                                            /*
                                             * USER
                                             *
                                             * Some APIs don't return
                                             * userId because userId
                                             * is already part of the
                                             * request.
                                             */
                                            : (
                                                permission?.userId == null ||
                                                Number(
                                                    permission?.userId,
                                                ) ===
                                                Number(
                                                    selectedEntity,
                                                )
                                            );


                                    const moduleMatch =
                                        Number(
                                            permission?.moduleId,
                                        ) ===
                                        Number(
                                            item.moduleId,
                                        );


                                    const actionMatch =
                                        Number(
                                            permission?.actionId,
                                        ) ===
                                        Number(
                                            item.actionId,
                                        );


                                    return (
                                        entityMatch &&
                                        moduleMatch &&
                                        actionMatch
                                    );
                                },
                            );


                        /* =====================================
                           ADD ACTION PERMISSION
                        ===================================== */

                        acc[
                            item.moduleId
                        ].permissions[
                            getActionName(
                                item.actionName,
                            )
                        ] = {

                            moduleActionId:
                                item.id,

                            allowed:
                                saved
                                    ? (
                                        saved.allowed === true ||
                                        saved.allowed === "true"
                                    )
                                    : false,
                        };


                        return acc;

                    },
                    {},
                ),
            );


        /* =====================================================
           SAVE MATRIX
        ===================================================== */

        setPermissions(
            grouped,
        );


        /* =====================================================
           CALCULATE SELECT ALL
        ===================================================== */

        const allPermissions =
            grouped.flatMap(
                (module) =>
                    Object.values(
                        module.permissions,
                    ),
            );


        setAllSelected(
            allPermissions.length > 0 &&
            allPermissions.every(
                (permission) =>
                    permission.allowed === true,
            ),
        );

    }, [
        moduleActions,
        savedPermissions,
        selectedEntity,
        isRole,
    ]);


    /* =========================================================
       SEARCH
    ========================================================= */

    const filteredData = useMemo(() => {

        const term =
            searchTerm
                .trim()
                .toLowerCase();


        if (!term) {
            return permissions;
        }


        return permissions.filter(
            (item) =>
                item.moduleName
                    ?.toLowerCase()
                    .includes(term),
        );

    }, [
        permissions,
        searchTerm,
    ]);


    /* =========================================================
       TOGGLE PERMISSION
    ========================================================= */

    const togglePermission = (
        moduleId,
        action,
    ) => {

        setPermissions(
            (prev) =>
                prev.map(
                    (module) => {

                        if (
                            module.moduleId !==
                            moduleId
                        ) {

                            return module;
                        }


                        const currentPermission =
                            module
                                .permissions?.[
                            action
                            ];


                        if (
                            !currentPermission
                        ) {
                            return module;
                        }


                        return {

                            ...module,

                            permissions: {

                                ...module.permissions,

                                [action]: {

                                    ...currentPermission,

                                    allowed:
                                        !currentPermission
                                            .allowed,
                                },
                            },
                        };

                    },
                ),
        );

    };


    /* =========================================================
       SELECT ALL
    ========================================================= */

    const handleSelectAll = () => {

        if (!selectedEntity) {

            toast.error(
                isRole
                    ? "Please select a role"
                    : "Please select a user",
            );

            return;
        }


        const newValue =
            !allSelected;


        setPermissions(
            (prev) =>
                prev.map(
                    (module) => ({

                        ...module,

                        permissions:
                            Object.keys(
                                module.permissions,
                            ).reduce(
                                (
                                    acc,
                                    key,
                                ) => {

                                    acc[key] = {

                                        ...module
                                            .permissions[
                                        key
                                        ],

                                        allowed:
                                            newValue,
                                    };

                                    return acc;

                                },
                                {},
                            ),
                    }),
                ),
        );


        setAllSelected(
            newValue,
        );


        toast.success(
            newValue
                ? "All permissions selected"
                : "All permissions unselected",
        );

    };


    /* =========================================================
       SAVE PERMISSIONS
    ========================================================= */

    const handleSave = async () => {

        if (!selectedEntity) {

            toast.error(
                isRole
                    ? "Please select a role"
                    : "Please select a user",
            );

            return;
        }


        /* =====================================================
           CREATE PAYLOAD
        ===================================================== */

        const payload = {

            permissions:
                permissions.flatMap(
                    (module) =>
                        Object.values(
                            module.permissions || {},
                        ).map(
                            (permission) => ({

                                moduleActionId:
                                    Number(
                                        permission.moduleActionId,
                                    ),

                                allowed:
                                    Boolean(
                                        permission.allowed,
                                    ),
                            }),
                        ),
                ),
        };


        if (
            !payload.permissions.length
        ) {

            toast.error(
                "No permissions available to save",
            );

            return;
        }


        try {

            /* =================================================
               ROLE
            ================================================= */

            if (isRole) {

                if (
                    hasExistingPermission
                ) {

                    await dispatch(
                        updateRolePermission({

                            roleId:
                                Number(
                                    selectedEntity,
                                ),

                            data:
                                payload,
                        }),
                    ).unwrap();


                    toast.success(
                        "Role permissions updated successfully",
                    );

                } else {

                    await dispatch(
                        createRolePermission({

                            roleId:
                                Number(
                                    selectedEntity,
                                ),

                            data:
                                payload,
                        }),
                    ).unwrap();


                    toast.success(
                        "Role permissions created successfully",
                    );
                }


                /* =============================================
                   REFRESH ROLE PERMISSION
                ============================================= */

                await dispatch(
                    getRolePermission({

                        roleId:
                            Number(
                                selectedEntity,
                            ),
                    }),
                ).unwrap();

            }


            /* =================================================
               USER
            ================================================= */

            else {

                if (
                    hasExistingPermission
                ) {

                    await dispatch(
                        updateUserPermission({

                            userId:
                                Number(
                                    selectedEntity,
                                ),

                            data:
                                payload,
                        }),
                    ).unwrap();


                    toast.success(
                        "User permissions updated successfully",
                    );

                } else {

                    await dispatch(
                        createUserPermission({

                            userId:
                                Number(
                                    selectedEntity,
                                ),

                            data:
                                payload,
                        }),
                    ).unwrap();


                    toast.success(
                        "User permissions created successfully",
                    );
                }


                /* =============================================
                   REFRESH SELECTED USER PERMISSION
                ============================================= */

                await dispatch(
                    getUserPermissionById({

                        userId:
                            Number(
                                selectedEntity,
                            ),
                    }),
                ).unwrap();

            }

        } catch (err) {

            console.error(
                "Permission save failed:",
                err,
            );

            toast.error(
                typeof err === "string"
                    ? err
                    : err?.message ||
                    err?.error ||
                    "Failed to save permissions",
            );
        }

    };


    /* =========================================================
       CURRENT USER HAS CREATE PERMISSION

       SUPER_ADMIN / ADMIN:
       Full access.

       Other users:
       Check permission assigned to current user.
    ========================================================= */

    const hasPermission = (
        action,
    ) => {

        if (
            isSuperAdmin ||
            isAdmin
        ) {
            return true;
        }


        if (
            !Array.isArray(
                currentUserPermissions,
            )
        ) {
            return false;
        }


        const requestedAction =
            String(action)
                .trim()
                .toUpperCase();


        return currentUserPermissions.some(
            (module) => {

                const moduleName =
                    String(
                        module?.moduleName ||
                        module?.module?.moduleName ||
                        module?.module?.name ||
                        "",
                    )
                        .trim()
                        .toLowerCase();


                /*
                 * Permission management module.
                 *
                 * Supports common backend naming.
                 */
                const isPermissionModule =
                    moduleName ===
                    "permissions" ||

                    moduleName ===
                    "role permissions" ||

                    moduleName ===
                    "user permissions" ||

                    moduleName ===
                    "role permission" ||

                    moduleName ===
                    "user permission";


                if (
                    !isPermissionModule
                ) {
                    return false;
                }


                if (
                    !Array.isArray(
                        module?.actions,
                    )
                ) {
                    return false;
                }


                return module.actions.some(
                    (item) => {

                        const actionName =
                            String(
                                item?.actionName ||
                                item?.action?.actionName ||
                                item?.action?.name ||
                                "",
                            )
                                .trim()
                                .toUpperCase();


                        return (
                            actionName ===
                            requestedAction &&

                            (
                                item?.allowed === true ||
                                item?.allowed === "true"
                            )
                        );
                    },
                );
            },
        );
    };


    /* =========================================================
       CAN MANAGE PERMISSIONS
    ========================================================= */

    const canManagePermissions =
        hasPermission("CREATE");


    /* =========================================================
       RENDER
    ========================================================= */

    return (

        <div className="w-full min-h-screen bg-gray-50 p-4 md:p-6">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                <div>

                    <h5 className="text-lg font-semibold text-gray-800">
                        Team & Permissions
                    </h5>

                    <p className="mt-1 text-sm text-gray-500">

                        Control access levels and assign{" "}

                        {isRole
                            ? "roles"
                            : "users"}

                        {" "}to your team.

                    </p>

                </div>


                {/* SEARCH */}

                <div className="relative w-full sm:w-72">

                    <Search
                        size={17}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                        type="text"
                        placeholder="Search modules..."
                        value={searchTerm}
                        onChange={(e) =>
                            setSearchTerm(
                                e.target.value,
                            )
                        }
                        className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-3 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                </div>

            </div>


            {/* =================================================
                TABS
            ================================================= */}

            <div className="mb-5 flex gap-2">

                <button
                    type="button"
                    onClick={() =>
                        setTab("role")
                    }
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition ${isRole
                        ? "bg-blue-600 text-white shadow-sm hover:bg-blue-700"
                        : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                        }`}
                >
                    Role Permission
                </button>


                <button
                    type="button"
                    onClick={() =>
                        setTab("user")
                    }
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition ${!isRole
                        ? "bg-blue-600 text-white shadow-sm hover:bg-blue-700"
                        : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                        }`}
                >
                    User Permission
                </button>

            </div>


            {/* =================================================
                FILTER BAR
            ================================================= */}

            <div className="mb-5 flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-center">


                {/* LABEL */}

                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">

                    {isRole ? (

                        <ShieldCheck
                            size={18}
                            className="text-blue-600"
                        />

                    ) : (

                        <UserRound
                            size={18}
                            className="text-blue-600"
                        />

                    )}

                    <span>
                        Select{" "}
                        {isRole
                            ? "Role"
                            : "User"}
                    </span>

                </div>


                {/* ENTITY SELECT */}

                <div className="relative w-full sm:w-64">

                    <select
                        value={selectedEntity}
                        onChange={(e) =>
                            setSelectedEntity(
                                e.target.value,
                            )
                        }
                        className="h-10 w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 pr-9 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >

                        <option value="">
                            Select{" "}
                            {isRole
                                ? "Role"
                                : "User"}
                        </option>


                        {entityList.map(
                            (item) => (

                                <option
                                    key={item.id}
                                    value={item.id}
                                >

                                    {isRole
                                        ? item.roleName
                                        : item.name ||
                                        item.userName}

                                </option>

                            ),
                        )}

                    </select>


                    <ChevronDown
                        size={16}
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                </div>


                {/* ACTIONS */}

                <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:ml-auto">

                    <button
                        type="button"
                        onClick={
                            handleSelectAll
                        }
                        disabled={
                            !selectedEntity
                        }
                        className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >

                        <CheckSquare
                            size={16}
                        />

                        {allSelected
                            ? "Unselect All"
                            : "Select All"}

                    </button>


                    {canManagePermissions && (

                        <button
                            type="button"
                            onClick={
                                handleSave
                            }
                            disabled={
                                !selectedEntity
                            }
                            className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >

                            <Check
                                size={16}
                            />

                            Save Permissions

                        </button>

                    )}

                </div>

            </div>


            {/* =================================================
                TABLE
            ================================================= */}

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

                <div className="overflow-x-auto">

                    <table className="w-full min-w-[700px] text-sm">

                        <thead>

                            <tr className="border-b border-gray-200 bg-gray-50">

                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">

                                    Module

                                </th>


                                {actionHeaders.map(
                                    (action) => (

                                        <th
                                            key={
                                                action
                                            }
                                            className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-600"
                                        >

                                            {action}

                                        </th>

                                    ),
                                )}

                            </tr>

                        </thead>


                        <tbody className="divide-y divide-gray-100">

                            {filteredData.length >
                                0 ? (

                                filteredData.map(
                                    (
                                        module,
                                    ) => (

                                        <tr
                                            key={
                                                module.moduleId
                                            }
                                            className="transition hover:bg-gray-50"
                                        >

                                            <td className="px-5 py-3 font-medium text-gray-800">

                                                {
                                                    module.moduleName
                                                }

                                            </td>


                                            {actionHeaders.map(
                                                (
                                                    action,
                                                ) => {

                                                    const permission =
                                                        module
                                                            .permissions
                                                        ?.[action];

                                                    return (

                                                        <td
                                                            key={
                                                                action
                                                            }
                                                            className="px-4 py-3 text-center"
                                                        >

                                                            {permission ? (

                                                                <input
                                                                    type="checkbox"
                                                                    checked={
                                                                        permission.allowed ===
                                                                        true
                                                                    }
                                                                    onChange={() =>
                                                                        togglePermission(
                                                                            module.moduleId,
                                                                            action,
                                                                        )
                                                                    }
                                                                    className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                                                />

                                                            ) : (

                                                                <span className="text-gray-300">
                                                                    -
                                                                </span>

                                                            )}

                                                        </td>

                                                    );

                                                },
                                            )}

                                        </tr>

                                    ),
                                )

                            ) : (

                                <tr>

                                    <td
                                        colSpan={
                                            actionHeaders.length +
                                            1
                                        }
                                        className="px-5 py-12 text-center"
                                    >

                                        <div className="flex flex-col items-center justify-center">

                                            <LockKeyhole
                                                size={30}
                                                className="mb-3 text-gray-300"
                                            />


                                            <p className="text-sm font-medium text-gray-500">

                                                {!selectedEntity

                                                    ? `Select ${isRole
                                                        ? "a role"
                                                        : "a user"
                                                    } to manage permissions`

                                                    : "No modules found"}

                                            </p>


                                            {searchTerm &&
                                                selectedEntity && (

                                                    <p className="mt-1 text-xs text-gray-400">

                                                        Try a
                                                        different
                                                        search
                                                        term.

                                                    </p>

                                                )}

                                        </div>

                                    </td>

                                </tr>

                            )}

                        </tbody>

                    </table>

                </div>

            </div>

        </div>
    );
}