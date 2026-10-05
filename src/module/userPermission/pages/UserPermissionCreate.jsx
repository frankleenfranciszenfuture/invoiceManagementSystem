import React, {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    useDispatch,
    useSelector,
} from "react-redux";

import {
    ShieldCheck,
    Search,
    Check,
    Minus,
} from "lucide-react";

import toast from "react-hot-toast";

import {
    closeModal,
} from "../../ui/uiSlice";

import {
    resetUserPermissionForm,
} from "../slices/userPermissionSlice";

import {
    fetchUserPermissionsByUserId,
    updateUserPermission,
    createUserPermission,
} from "../thunks/userPermissionThunks";

import {
    fetchAllModuleActions,
} from "../../permission/thunks/permissionThunks";


/* =========================================================
   ACTION ORDER
========================================================= */

const ACTION_ORDER = [
    "VIEW",
    "CREATE",
    "EDIT",
    "DELETE",
    "APPROVE",
    "EXPORT",
    "IMPORT",
];


/* =========================================================
   HELPERS
========================================================= */

const titleCase = (value = "") =>
    value
        ? value.charAt(0) +
        value.slice(1).toLowerCase()
        : "";


const permissionKey = (
    moduleId,
    actionId
) =>
    `${moduleId}-${actionId}`;


/* =========================================================
   PERMISSION FIELD HELPERS
========================================================= */

const getPermissionUserId = (
    permission
) =>
    permission?.userId ??
    permission?.user?.id ??
    permission?.user?.userId ??
    null;


const getPermissionModuleId = (
    permission
) =>
    permission?.moduleId ??
    permission?.module?.id ??
    permission?.module?.moduleId ??
    null;


const getPermissionActionId = (
    permission
) =>
    permission?.actionId ??
    permission?.action?.id ??
    permission?.action?.actionId ??
    null;


/* =========================================================
   CHECKBOX
========================================================= */

function Box({
    checked = false,
    indeterminate = false,
    onChange,
    disabled = false,
    title,
    variant = "solid",
    size = 30,
}) {
    const active =
        checked || indeterminate;

    const activeClass =
        variant === "soft"
            ? "border-[#767d90] bg-[#767d90]"
            : "border-[#1e2a4a] bg-[#1e2a4a]";

    return (
        <label
            className={`
                inline-flex
                ${disabled
                    ? "cursor-not-allowed"
                    : "cursor-pointer"
                }
            `}
            title={title}
        >
            <input
                type="checkbox"
                className="sr-only peer"
                checked={Boolean(checked)}
                disabled={disabled}
                onChange={(event) => {
                    if (onChange) {
                        onChange(
                            event.target.checked
                        );
                    }
                }}
            />

            <span
                style={{
                    width: size,
                    height: size,
                }}
                className={`
                    flex
                    items-center
                    justify-center
                    rounded-lg
                    border
                    transition
                    peer-focus-visible:ring-2
                    peer-focus-visible:ring-blue-400

                    ${active
                        ? activeClass
                        : "border-gray-200 bg-white hover:border-gray-400"
                    }

                    ${disabled
                        ? "cursor-not-allowed opacity-50"
                        : ""
                    }
                `}
            >
                {checked && (
                    <Check
                        size={Math.round(
                            size * 0.55
                        )}
                        strokeWidth={2.5}
                        className="text-white"
                    />
                )}

                {!checked &&
                    indeterminate && (
                        <Minus
                            size={Math.round(
                                size * 0.55
                            )}
                            strokeWidth={2.5}
                            className="text-white"
                        />
                    )}
            </span>
        </label>
    );
}


/* =========================================================
   COMPONENT
========================================================= */

export default function UserPermissionCreate() {

    const dispatch = useDispatch();


    /* =========================================================
       MODAL
    ========================================================= */

    const modal = useSelector(
        (state) =>
            state.ui?.modal
    );

    const isOpen =
        Boolean(modal?.open) &&
        (
            modal?.type ===
            "addUserPermission" ||
            modal?.type ===
            "editUserPermission"
        );


    /* =========================================================
       DIRECT USER PERMISSIONS ONLY
    ========================================================= */

    const userPermissions =
        useSelector(
            (state) =>
                state.userPermission
                    ?.userPermissions
        ) || [];

    const userPermissionsLoading =
        useSelector(
            (state) =>
                state.userPermission
                    ?.userPermissionsLoading
        ) || false;


    /* =========================================================
       MODULE ACTIONS
    ========================================================= */

    const moduleActions =
        useSelector(
            (state) =>
                state.permission
                    ?.moduleActions
        ) || [];

    const moduleActionsLoading =
        useSelector(
            (state) =>
                state.permission
                    ?.moduleActionsLoading
        ) || false;


    /* =========================================================
       SELECTED USER VIEW
    ========================================================= */

    const selectedUserId =
        useSelector(
            (state) =>
                state.userPermissionView
                    ?.selectedUserId
        );

    const selectedUserName =
        useSelector(
            (state) =>
                state.userPermissionView
                    ?.selectedUserName
        );

    const selectedRoleId =
        useSelector(
            (state) =>
                state.userPermissionView
                    ?.selectedRoleId
        );

    const selectedRoleName =
        useSelector(
            (state) =>
                state.userPermissionView
                    ?.selectedRoleName
        );


    /* =========================================================
       USER DATA
    ========================================================= */

    const users =
        useSelector(
            (state) =>
                state.user?.users
        ) || [];

    const currentUser =
        useSelector(
            (state) =>
                state.user?.user
        );

    const existingUser =
        useSelector(
            (state) =>
                state.user?.existingUser
        );


    /* =========================================================
       USER ID
    ========================================================= */

    const userId =
        modal?.data?.userId ??
        modal?.data?.id ??
        selectedUserId ??
        currentUser?.id ??
        existingUser?.id ??
        null;

    const validUserId =
        userId !== null &&
        userId !== undefined &&
        Number(userId) > 0;


    /* =========================================================
       USER NAME
    ========================================================= */

    const userFromList =
        users.find(
            (user) =>
                Number(user?.id) ===
                Number(userId)
        );

    const userName =
        modal?.data?.userName ||
        modal?.data?.username ||
        modal?.data?.name ||
        selectedUserName ||
        currentUser?.userName ||
        currentUser?.username ||
        existingUser?.userName ||
        existingUser?.username ||
        userFromList?.userName ||
        userFromList?.username ||
        "";


    /* =========================================================
       ROLE
       
       INFORMATION ONLY.
       NOT USED FOR PERMISSION IDENTITY.
    ========================================================= */

    const roleId =
        modal?.data?.roleId ??
        selectedRoleId ??
        currentUser?.roleId ??
        currentUser?.role?.id ??
        existingUser?.roleId ??
        existingUser?.role?.id ??
        null;

    const roleName =
        modal?.data?.roleName ||
        selectedRoleName ||
        currentUser?.roleName ||
        currentUser?.role?.roleName ||
        currentUser?.role?.name ||
        existingUser?.roleName ||
        existingUser?.role?.roleName ||
        existingUser?.role?.name ||
        "";


    /* =========================================================
       LOCAL STATE
    ========================================================= */

    const [search, setSearch] =
        useState("");

    const [original, setOriginal] =
        useState({});

    const [matrix, setMatrix] =
        useState({});

    const [saving, setSaving] =
        useState(false);

    const originalRef =
        useRef({});

    const savingRef =
        useRef(false);

    /*
     * Prevent duplicate module-action requests.
     */
    const moduleActionsRequestRef =
        useRef(false);

    /*
     * Prevent duplicate user-permission requests.
     */
    const userPermissionsRequestRef =
        useRef(null);


    /* =========================================================
       KEEP SAVING REF IN SYNC
    ========================================================= */

    useEffect(() => {

        savingRef.current =
            saving;

    }, [
        saving,
    ]);


    /* =========================================================
       NORMALIZE MODULE ACTION RESPONSE
    ========================================================= */

    const normalizedModuleActions =
        useMemo(() => {

            if (
                Array.isArray(
                    moduleActions
                )
            ) {
                return moduleActions;
            }

            if (
                Array.isArray(
                    moduleActions?.data
                )
            ) {
                return moduleActions.data;
            }

            if (
                Array.isArray(
                    moduleActions?.data?.content
                )
            ) {
                return moduleActions
                    .data
                    .content;
            }

            if (
                Array.isArray(
                    moduleActions?.content
                )
            ) {
                return moduleActions.content;
            }

            return [];

        }, [
            moduleActions,
        ]);


    /* =========================================================
       LOAD MODULE ACTIONS
    ========================================================= */

    useEffect(() => {

        if (!isOpen) {

            moduleActionsRequestRef.current =
                false;

            return;
        }

        /*
         * Already loaded.
         */
        if (
            normalizedModuleActions.length > 0
        ) {

            moduleActionsRequestRef.current =
                false;

            return;
        }

        /*
         * Already requested.
         */
        if (
            moduleActionsRequestRef.current
        ) {
            return;
        }

        moduleActionsRequestRef.current =
            true;

        console.log(
            "USER PERMISSION: Loading module actions..."
        );

        dispatch(
            fetchAllModuleActions()
        )
            .unwrap()
            .then((response) => {

                console.log(
                    "USER PERMISSION: Module actions loaded:",
                    response
                );

            })
            .catch((error) => {

                console.error(
                    "USER PERMISSION: Failed to load module actions:",
                    error
                );

                moduleActionsRequestRef.current =
                    false;

                toast.error(
                    typeof error === "string"
                        ? error
                        : error?.message ||
                        "Failed to load module permissions."
                );

            });

    }, [
        isOpen,
        normalizedModuleActions.length,
        dispatch,
    ]);


    /* =========================================================
       LOAD DIRECT USER PERMISSIONS
    ========================================================= */

    useEffect(() => {

        if (
            !isOpen ||
            !validUserId
        ) {

            userPermissionsRequestRef.current =
                null;

            return;
        }

        const numericUserId =
            Number(userId);

        /*
         * Don't request same user repeatedly.
         */
        if (
            userPermissionsRequestRef.current ===
            numericUserId
        ) {
            return;
        }

        userPermissionsRequestRef.current =
            numericUserId;

        console.log(
            "FETCHING DIRECT USER PERMISSIONS:",
            numericUserId
        );

        dispatch(
            fetchUserPermissionsByUserId(
                numericUserId
            )
        )
            .unwrap()
            .then((response) => {

                console.log(
                    "DIRECT USER PERMISSIONS LOADED:",
                    response
                );

            })
            .catch((error) => {

                console.error(
                    "FAILED TO LOAD USER PERMISSIONS:",
                    error
                );

                userPermissionsRequestRef.current =
                    null;

                toast.error(
                    typeof error === "string"
                        ? error
                        : error?.message ||
                        "Failed to load user permissions."
                );

            });

    }, [
        isOpen,
        validUserId,
        userId,
        dispatch,
    ]);


    /* =========================================================
       BUILD MODULES
    ========================================================= */

    const modules =
        useMemo(() => {

            const map =
                new Map();

            const addAction = ({
                moduleId,
                moduleName,
                actionId,
                actionName,
                active = true,
            }) => {

                if (
                    moduleId == null ||
                    actionId == null
                ) {
                    return;
                }

                if (
                    active === false
                ) {
                    return;
                }

                const mid =
                    Number(moduleId);

                const aid =
                    Number(actionId);

                if (
                    !Number.isInteger(mid) ||
                    !Number.isInteger(aid)
                ) {
                    return;
                }

                const normalizedActionName =
                    String(
                        actionName || ""
                    )
                        .trim()
                        .toUpperCase();

                if (
                    !normalizedActionName
                ) {
                    return;
                }

                if (
                    !map.has(mid)
                ) {

                    map.set(
                        mid,
                        {
                            id: mid,

                            name:
                                moduleName ||
                                `Module ${mid}`,

                            actions:
                                new Map(),
                        }
                    );

                }

                const module =
                    map.get(mid);

                module.actions.set(
                    normalizedActionName,
                    aid
                );

            };


            normalizedModuleActions.forEach(
                (item) => {

                    const moduleId =
                        item?.moduleId ??
                        item?.module?.id ??
                        item?.module?.moduleId;

                    const moduleName =
                        item?.moduleName ??
                        item?.module?.moduleName ??
                        item?.module?.name ??
                        `Module ${moduleId}`;


                    /*
                     * GROUPED RESPONSE
                     */
                    if (
                        Array.isArray(
                            item?.actions
                        )
                    ) {

                        item.actions.forEach(
                            (action) => {

                                addAction({
                                    moduleId,
                                    moduleName,

                                    actionId:
                                        action?.actionId ??
                                        action?.id ??
                                        action?.action?.id ??
                                        action?.action?.actionId,

                                    actionName:
                                        action?.actionName ??
                                        action?.name ??
                                        action?.action?.actionName ??
                                        action?.action?.name,

                                    active:
                                        action?.active ??
                                        action?.action?.active ??
                                        true,
                                });

                            }
                        );

                        return;
                    }


                    /*
                     * FLAT RESPONSE
                     */
                    addAction({
                        moduleId,
                        moduleName,

                        actionId:
                            item?.actionId ??
                            item?.action?.id ??
                            item?.action?.actionId,

                        actionName:
                            item?.actionName ??
                            item?.action?.actionName ??
                            item?.action?.name,

                        active:
                            item?.active ??
                            item?.action?.active ??
                            true,
                    });

                }
            );


            return Array
                .from(
                    map.values()
                )
                .sort(
                    (a, b) =>
                        a.id - b.id
                );

        }, [
            normalizedModuleActions,
        ]);


    /* =========================================================
       ACTION COLUMNS
    ========================================================= */

    const columns =
        useMemo(() => {

            const present =
                new Set();

            modules.forEach(
                (module) => {

                    module.actions.forEach(
                        (_, actionName) => {

                            present.add(
                                actionName
                            );

                        }
                    );

                }
            );

            const ordered =
                ACTION_ORDER.filter(
                    (action) =>
                        present.has(
                            action
                        )
                );

            const remaining =
                [
                    ...present,
                ]
                    .filter(
                        (action) =>
                            !ACTION_ORDER.includes(
                                action
                            )
                    )
                    .sort();

            return [
                ...ordered,
                ...remaining,
            ];

        }, [
            modules,
        ]);


    /* =========================================================
       SEARCH
    ========================================================= */

    const visibleModules =
        useMemo(() => {

            const query =
                search
                    .trim()
                    .toLowerCase();

            if (!query) {
                return modules;
            }

            return modules.filter(
                (module) =>
                    String(
                        module.name || ""
                    )
                        .toLowerCase()
                        .includes(query)
            );

        }, [
            modules,
            search,
        ]);


    /* =========================================================
       BUILD MATRIX
       
       DIRECT USER PERMISSIONS ONLY.
    ========================================================= */

    useEffect(() => {

        if (
            !isOpen ||
            !validUserId ||
            modules.length === 0 ||
            userPermissionsLoading ||
            savingRef.current
        ) {
            return;
        }


        /*
         * IMPORTANT:
         *
         * Do NOT wait for permissionsLoadedForUserId.
         *
         * The direct user permission thunk already controls
         * userPermissionsLoading.
         */

        const base = {};


        /* =====================================================
           INITIALIZE ALL AVAILABLE PERMISSIONS
        ===================================================== */

        modules.forEach(
            (module) => {

                module.actions.forEach(
                    (actionId) => {

                        base[
                            permissionKey(
                                module.id,
                                actionId
                            )
                        ] = false;

                    }
                );

            }
        );


        /* =====================================================
           APPLY DIRECT USER PERMISSIONS
        ===================================================== */

        userPermissions.forEach(
            (permission) => {

                const permissionUserId =
                    getPermissionUserId(
                        permission
                    );

                const moduleId =
                    getPermissionModuleId(
                        permission
                    );

                const actionId =
                    getPermissionActionId(
                        permission
                    );

                if (
                    permissionUserId == null ||
                    moduleId == null ||
                    actionId == null
                ) {
                    return;
                }

                /*
                 * Only this user's permissions.
                 */
                if (
                    Number(
                        permissionUserId
                    ) !==
                    Number(userId)
                ) {
                    return;
                }

                const key =
                    permissionKey(
                        Number(moduleId),
                        Number(actionId)
                    );

                if (
                    Object.prototype.hasOwnProperty.call(
                        base,
                        key
                    )
                ) {

                    base[key] =
                        permission?.active !== false &&
                        permission?.status !== "INACTIVE" &&
                        permission?.allowed === true;

                }

            }
        );


        /* =====================================================
           VIEW DEPENDENCY
           
           Any non-VIEW permission means VIEW is enabled.
        ===================================================== */

        modules.forEach(
            (module) => {

                const viewId =
                    module.actions.get(
                        "VIEW"
                    );

                if (
                    viewId == null
                ) {
                    return;
                }

                let hasNonView =
                    false;

                module.actions.forEach(
                    (
                        actionId,
                        actionName
                    ) => {

                        if (
                            actionName !==
                            "VIEW" &&
                            base[
                            permissionKey(
                                module.id,
                                actionId
                            )
                            ]
                        ) {

                            hasNonView =
                                true;

                        }

                    }
                );

                if (
                    hasNonView
                ) {

                    base[
                        permissionKey(
                            module.id,
                            viewId
                        )
                    ] = true;

                }

            }
        );


        originalRef.current = {
            ...base,
        };

        setOriginal({
            ...base,
        });

        setMatrix({
            ...base,
        });

        console.log(
            "USER PERMISSION MATRIX CREATED:",
            base
        );

    }, [
        isOpen,
        validUserId,
        userId,
        modules,
        userPermissions,
        userPermissionsLoading,
    ]);


    /* =========================================================
       RESET WHEN MODAL CLOSES
    ========================================================= */

    useEffect(() => {

        if (isOpen) {

            setSearch("");

            return;
        }

        originalRef.current = {};

        setOriginal({});

        setMatrix({});

    }, [
        isOpen,
    ]);


    /* =========================================================
       CHANGES
    ========================================================= */

    const changes =
        useMemo(() => {

            if (!validUserId) {
                return [];
            }

            return Object.keys(matrix)
                .filter(
                    (key) =>
                        matrix[key] !==
                        original[key]
                )
                .map(
                    (key) => {

                        const [
                            moduleId,
                            actionId,
                        ] =
                            key
                                .split("-")
                                .map(Number);

                        return {
                            moduleId,
                            actionId,
                            allowed:
                                Boolean(
                                    matrix[key]
                                ),
                        };

                    }
                );

        }, [
            matrix,
            original,
            validUserId,
        ]);


    /* =========================================================
       SET MANY
    ========================================================= */

    const setMany = (
        keys,
        value
    ) => {

        setMatrix(
            (previous) => {

                const next = {
                    ...previous,
                };

                [
                    ...new Set(keys),
                ].forEach(
                    (key) => {

                        next[key] =
                            value;

                    }
                );

                return next;

            }
        );

    };


    /* =========================================================
       ROW KEYS
    ========================================================= */

    const rowKeys = (
        module
    ) =>
        [
            ...module.actions.values(),
        ].map(
            (actionId) =>
                permissionKey(
                    module.id,
                    actionId
                )
        );


    /* =========================================================
       ACTION KEYS
    ========================================================= */

    const keysFor = (
        moduleList,
        actionName
    ) =>
        moduleList
            .filter(
                (module) =>
                    module.actions.has(
                        actionName
                    )
            )
            .map(
                (module) =>
                    permissionKey(
                        module.id,
                        module.actions.get(
                            actionName
                        )
                    )
            );


    /* =========================================================
       STATUS
    ========================================================= */

    const stat = (
        keys
    ) => {

        const uniqueKeys = [
            ...new Set(keys),
        ];

        const checkedCount =
            uniqueKeys.filter(
                (key) =>
                    Boolean(
                        matrix[key]
                    )
            ).length;

        return {
            checked:
                uniqueKeys.length > 0 &&
                checkedCount ===
                uniqueKeys.length,

            some:
                checkedCount > 0 &&
                checkedCount <
                uniqueKeys.length,
        };

    };


    /* =========================================================
       TOGGLE CELL
    ========================================================= */

    const toggleCell = (
        module,
        actionName,
        checked
    ) => {

        const actionId =
            module.actions.get(
                actionName
            );

        if (
            actionId == null
        ) {
            return;
        }

        const keys = [
            permissionKey(
                module.id,
                actionId
            ),
        ];

        const viewId =
            module.actions.get(
                "VIEW"
            );


        /*
         * NON-VIEW ON → VIEW ON
         */
        if (
            checked &&
            actionName !== "VIEW" &&
            viewId != null
        ) {

            keys.push(
                permissionKey(
                    module.id,
                    viewId
                )
            );

        }


        /*
         * VIEW OFF → ENTIRE MODULE OFF
         */
        if (
            !checked &&
            actionName === "VIEW"
        ) {

            module.actions.forEach(
                (id) => {

                    keys.push(
                        permissionKey(
                            module.id,
                            id
                        )
                    );

                }
            );

        }

        setMany(
            keys,
            checked
        );

    };


    /* =========================================================
       TOGGLE MODULE
    ========================================================= */

    const toggleRow = (
        module,
        checked
    ) => {

        setMany(
            rowKeys(module),
            checked
        );

    };


    /* =========================================================
       TOGGLE ALL
    ========================================================= */

    const toggleAllVisible = (
        checked
    ) => {

        setMany(
            visibleModules.flatMap(
                rowKeys
            ),
            checked
        );

    };


    /* =========================================================
       TOGGLE COLUMN
    ========================================================= */

    const toggleColumn = (
        actionName,
        checked
    ) => {

        const keys =
            keysFor(
                visibleModules,
                actionName
            );


        /*
         * NON-VIEW ON → VIEW ON
         */
        if (
            checked &&
            actionName !== "VIEW"
        ) {

            keys.push(
                ...keysFor(
                    visibleModules,
                    "VIEW"
                )
            );

        }


        /*
         * VIEW OFF → CLEAR MODULES
         */
        if (
            !checked &&
            actionName === "VIEW"
        ) {

            keys.push(
                ...visibleModules.flatMap(
                    rowKeys
                )
            );

        }

        setMany(
            keys,
            checked
        );

    };


    /* =========================================================
       CLOSE
    ========================================================= */

    const handleClose = () => {

        if (saving) {
            return;
        }

        dispatch(
            closeModal()
        );

        dispatch(
            resetUserPermissionForm()
        );

    };


    /* =========================================================
       FIND EXISTING PERMISSION
       
       IDENTITY:
       userId + moduleId + actionId
       
       roleId IS NOT USED.
    ========================================================= */

    const findExistingPermission = (
        change
    ) => {

        return userPermissions.find(
            (permission) => {

                const permissionUserId =
                    getPermissionUserId(
                        permission
                    );

                const permissionModuleId =
                    getPermissionModuleId(
                        permission
                    );

                const permissionActionId =
                    getPermissionActionId(
                        permission
                    );

                if (
                    permissionUserId == null ||
                    permissionModuleId == null ||
                    permissionActionId == null
                ) {
                    return false;
                }

                return (
                    Number(
                        permissionUserId
                    ) ===
                    Number(userId) &&

                    Number(
                        permissionModuleId
                    ) ===
                    Number(change.moduleId) &&

                    Number(
                        permissionActionId
                    ) ===
                    Number(change.actionId)
                );

            }
        );

    };


    /* =========================================================
       SAVE
    ========================================================= */

    const handleSave = async (
        event
    ) => {

        event.preventDefault();

        if (
            !validUserId
        ) {

            toast.error(
                "Valid user is required."
            );

            console.error(
                "Invalid user ID:",
                userId,
                modal?.data
            );

            return;
        }


        if (
            changes.length === 0
        ) {

            toast.error(
                "No changes to save."
            );

            return;
        }


        setSaving(true);
        savingRef.current = true;


        try {

            let createdCount = 0;
            let updatedCount = 0;

            const pendingChanges = [
                ...changes,
            ];


            for (
                const change of pendingChanges
            ) {

                const existingPermission =
                    findExistingPermission(
                        change
                    );


                /*
                 * EXISTING DIRECT PERMISSION
                 */
                if (
                    existingPermission
                ) {

                    if (
                        existingPermission.id ==
                        null
                    ) {

                        throw new Error(
                            `Existing permission found for module ${change.moduleId}, action ${change.actionId}, but permission ID is missing.`
                        );

                    }


                    await dispatch(
                        updateUserPermission({
                            id:
                                Number(
                                    existingPermission.id
                                ),

                            data: {
                                allowed:
                                    Boolean(
                                        change.allowed
                                    ),
                            },
                        })
                    ).unwrap();


                    updatedCount++;

                    continue;
                }


                /*
                 * NEW DIRECT PERMISSION
                 *
                 * Only create GRANTS.
                 *
                 * No record is created for false.
                 */
                if (
                    change.allowed
                ) {

                    await dispatch(
                        createUserPermission({
                            userId:
                                Number(
                                    userId
                                ),

                            moduleId:
                                Number(
                                    change.moduleId
                                ),

                            actionId:
                                Number(
                                    change.actionId
                                ),

                            allowed: true,
                        })
                    ).unwrap();


                    createdCount++;

                }

            }


            /* =================================================
               REFRESH
            ================================================= */

            await dispatch(
                fetchUserPermissionsByUserId(
                    Number(userId)
                )
            ).unwrap();


            /* =================================================
               SUCCESS
            ================================================= */

            const total =
                createdCount +
                updatedCount;

            toast.success(
                `${userName || "User"} permissions saved successfully. ${total} permission${total !== 1 ? "s" : ""} updated.`
            );


            dispatch(
                closeModal()
            );

            dispatch(
                resetUserPermissionForm()
            );


        } catch (error) {

            console.error(
                "User permission save error:",
                error
            );

            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    "Failed to save user permissions."
            );

        } finally {

            savingRef.current =
                false;

            setSaving(false);

        }

    };


    /* =========================================================
       CLOSED
    ========================================================= */

    if (!isOpen) {
        return null;
    }


    /* =========================================================
       BUSY
    ========================================================= */

    const busy =
        saving ||
        moduleActionsLoading ||
        userPermissionsLoading;


    /* =========================================================
       RENDER
    ========================================================= */

    return (
        <div
            className="
                flex
                h-[760px]
                max-h-[88vh]
                w-full
                max-w-full
                flex-col
                overflow-hidden
                rounded-xl
                bg-white
                shadow-2xl
            "
        >

            {/* =================================================
                HEADER
            ================================================= */}

            <div
                className="
                    flex
                    h-[70px]
                    shrink-0
                    items-center
                    justify-between
                    border-b
                    border-gray-200
                    pl-6
                    pr-16
                "
            >

                <div
                    className="
                        flex
                        items-center
                        gap-3
                    "
                >

                    <div
                        className="
                            flex
                            h-10
                            w-10
                            items-center
                            justify-center
                            rounded-lg
                            bg-blue-50
                        "
                    >
                        <ShieldCheck
                            size={21}
                            className="text-blue-600"
                        />
                    </div>

                    <div>

                        <h2
                            className="
                                text-[19px]
                                font-semibold
                                text-gray-800
                            "
                        >
                            User Permissions
                        </h2>

                        <p
                            className="
                                mt-0.5
                                text-xs
                                text-gray-500
                            "
                        >
                            Choose what this user
                            can do in each module
                        </p>

                    </div>

                </div>


                {/* =================================================
                    USER + ROLE
                ================================================= */}

                <div
                    className="
                        flex
                        items-center
                        gap-2
                    "
                >

                    <span
                        className="
                            rounded-md
                            border
                            border-blue-100
                            bg-blue-50
                            px-3
                            py-1.5
                            text-sm
                            font-semibold
                            text-blue-700
                        "
                    >
                        {
                            userName ||
                            "Select user"
                        }
                    </span>

                    {roleName && (
                        <span
                            className="
                                rounded-md
                                border
                                border-gray-200
                                bg-gray-50
                                px-3
                                py-1.5
                                text-xs
                                font-medium
                                text-gray-600
                            "
                        >
                            {roleName}
                        </span>
                    )}

                </div>

            </div>


            {/* =================================================
                TOOLBAR
            ================================================= */}

            <div
                className="
                    flex
                    shrink-0
                    items-center
                    justify-between
                    gap-4
                    border-b
                    border-gray-100
                    px-6
                    py-3
                "
            >

                <div
                    className="
                        relative
                        w-[280px]
                    "
                >

                    <Search
                        size={16}
                        className="
                            absolute
                            left-3
                            top-1/2
                            -translate-y-1/2
                            text-gray-400
                        "
                    />

                    <input
                        type="text"
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                        placeholder="Search modules"
                        className="
                            h-9
                            w-full
                            rounded-md
                            border
                            border-gray-300
                            pl-9
                            pr-3
                            text-sm
                            outline-none
                            focus:border-blue-500
                            focus:ring-1
                            focus:ring-blue-500
                        "
                    />

                </div>

                <span
                    className="
                        text-xs
                        text-gray-500
                    "
                >
                    {visibleModules.length}{" "}
                    modules
                </span>

            </div>


            {/* =================================================
                FORM
            ================================================= */}

            <form
                onSubmit={handleSave}
                className="
                    flex
                    min-h-0
                    flex-1
                    flex-col
                "
            >

                {/* =================================================
                    MATRIX
                ================================================= */}

                <div
                    className="
                        min-h-0
                        flex-1
                        overflow-auto
                        bg-[#fafcfe]
                    "
                >

                    {moduleActionsLoading ? (

                        <div
                            className="
                                flex
                                h-full
                                items-center
                                justify-center
                                text-sm
                                text-gray-500
                            "
                        >
                            Loading permissions…
                        </div>

                    ) : userPermissionsLoading ? (

                        <div
                            className="
                                flex
                                h-full
                                items-center
                                justify-center
                                text-sm
                                text-gray-500
                            "
                        >
                            Loading user permissions…
                        </div>

                    ) : visibleModules.length === 0 ? (

                        <div
                            className="
                                flex
                                h-full
                                items-center
                                justify-center
                                text-sm
                                text-gray-500
                            "
                        >
                            {modules.length === 0
                                ? "No module permissions available."
                                : `No modules match “${search}”.`}
                        </div>

                    ) : (

                        <table
                            className="
                                w-full
                                min-w-[900px]
                                border-separate
                                border-spacing-0
                            "
                        >

                            <thead>

                                <tr>

                                    <th
                                        className="
                                            sticky
                                            left-0
                                            top-0
                                            z-30
                                            h-14
                                            w-[240px]
                                            min-w-[240px]
                                            border-b
                                            border-gray-200
                                            bg-[#f8fafc]
                                            px-5
                                            text-left
                                            text-[12px]
                                            font-semibold
                                            uppercase
                                            tracking-[0.1em]
                                            text-slate-500
                                        "
                                    >
                                        Module
                                    </th>


                                    {columns.map(
                                        (actionName) => {

                                            const status =
                                                stat(
                                                    keysFor(
                                                        visibleModules,
                                                        actionName
                                                    )
                                                );

                                            return (
                                                <th
                                                    key={
                                                        actionName
                                                    }
                                                    className="
                                                        sticky
                                                        top-0
                                                        z-20
                                                        h-14
                                                        min-w-[120px]
                                                        border-b
                                                        border-gray-200
                                                        bg-[#f8fafc]
                                                        px-4
                                                        text-center
                                                    "
                                                >

                                                    <div
                                                        className="
                                                            flex
                                                            items-center
                                                            justify-center
                                                            gap-2
                                                        "
                                                    >

                                                        <Box
                                                            size={22}
                                                            variant="soft"
                                                            checked={
                                                                status.checked
                                                            }
                                                            indeterminate={
                                                                status.some
                                                            }
                                                            disabled={
                                                                busy
                                                            }
                                                            title={`Select ${titleCase(
                                                                actionName
                                                            )} for all visible modules`}
                                                            onChange={(
                                                                value
                                                            ) =>
                                                                toggleColumn(
                                                                    actionName,
                                                                    value
                                                                )
                                                            }
                                                        />

                                                        <span
                                                            className="
                                                                text-[12px]
                                                                font-semibold
                                                                uppercase
                                                                tracking-[0.08em]
                                                                text-slate-500
                                                            "
                                                        >
                                                            {
                                                                titleCase(
                                                                    actionName
                                                                )
                                                            }
                                                        </span>

                                                    </div>

                                                </th>
                                            );

                                        }
                                    )}

                                </tr>

                            </thead>


                            <tbody>

                                {visibleModules.map(
                                    (module) => {

                                        const status =
                                            stat(
                                                rowKeys(
                                                    module
                                                )
                                            );

                                        return (
                                            <tr
                                                key={
                                                    module.id
                                                }
                                                className="group"
                                            >

                                                <td
                                                    className="
                                                        sticky
                                                        left-0
                                                        z-10
                                                        h-[72px]
                                                        border-b
                                                        border-gray-100
                                                        bg-white
                                                        px-5
                                                    "
                                                >

                                                    <div
                                                        className="
                                                            flex
                                                            items-center
                                                            gap-3
                                                        "
                                                    >

                                                        <Box
                                                            size={22}
                                                            variant="soft"
                                                            checked={
                                                                status.checked
                                                            }
                                                            indeterminate={
                                                                status.some
                                                            }
                                                            disabled={
                                                                busy
                                                            }
                                                            title={`All permissions for ${module.name}`}
                                                            onChange={(
                                                                value
                                                            ) =>
                                                                toggleRow(
                                                                    module,
                                                                    value
                                                                )
                                                            }
                                                        />

                                                        <div
                                                            className="
                                                                flex
                                                                flex-col
                                                            "
                                                        >

                                                            <span
                                                                className="
                                                                    text-[13px]
                                                                    font-semibold
                                                                    text-gray-800
                                                                "
                                                            >
                                                                {
                                                                    module.name
                                                                }
                                                            </span>

                                                            <span
                                                                className="
                                                                    text-[11px]
                                                                    text-gray-400
                                                                "
                                                            >
                                                                {
                                                                    module.actions.size
                                                                }{" "}
                                                                actions
                                                            </span>

                                                        </div>

                                                    </div>

                                                </td>


                                                {columns.map(
                                                    (
                                                        actionName
                                                    ) => {

                                                        const actionId =
                                                            module.actions.get(
                                                                actionName
                                                            );

                                                        const key =
                                                            actionId !=
                                                                null
                                                                ? permissionKey(
                                                                    module.id,
                                                                    actionId
                                                                )
                                                                : null;

                                                        const checked =
                                                            key !=
                                                            null &&
                                                            Boolean(
                                                                matrix[
                                                                key
                                                                ]
                                                            );

                                                        return (
                                                            <td
                                                                key={`${module.id}-${actionName}`}
                                                                className="
                                                                    h-[72px]
                                                                    border-b
                                                                    border-gray-100
                                                                    bg-white
                                                                    text-center
                                                                    transition
                                                                    group-hover:bg-blue-50/20
                                                                "
                                                            >

                                                                {actionId ==
                                                                    null ? (

                                                                    <span
                                                                        className="
                                                                            text-gray-300
                                                                        "
                                                                    >
                                                                        —
                                                                    </span>

                                                                ) : (

                                                                    <Box
                                                                        checked={
                                                                            checked
                                                                        }
                                                                        disabled={
                                                                            busy
                                                                        }
                                                                        title={`${titleCase(
                                                                            actionName
                                                                        )} - ${module.name}`}
                                                                        onChange={(
                                                                            value
                                                                        ) =>
                                                                            toggleCell(
                                                                                module,
                                                                                actionName,
                                                                                value
                                                                            )
                                                                        }
                                                                    />

                                                                )}

                                                            </td>
                                                        );

                                                    }
                                                )}

                                            </tr>
                                        );

                                    }
                                )}

                            </tbody>


                            <tfoot>

                                <tr>

                                    <td
                                        className="
                                            sticky
                                            bottom-0
                                            left-0
                                            z-20
                                            h-[70px]
                                            border-t
                                            border-gray-200
                                            bg-[#f8fafc]
                                            px-5
                                        "
                                    >

                                        <div
                                            className="
                                                flex
                                                items-center
                                                gap-3
                                            "
                                        >

                                            <Box
                                                size={22}
                                                variant="soft"
                                                checked={
                                                    stat(
                                                        visibleModules.flatMap(
                                                            rowKeys
                                                        )
                                                    ).checked
                                                }
                                                indeterminate={
                                                    stat(
                                                        visibleModules.flatMap(
                                                            rowKeys
                                                        )
                                                    ).some
                                                }
                                                disabled={
                                                    busy
                                                }
                                                title="Select every visible permission"
                                                onChange={
                                                    toggleAllVisible
                                                }
                                            />

                                            <span
                                                className="
                                                    text-[13px]
                                                    font-semibold
                                                    text-slate-600
                                                "
                                            >
                                                Select All
                                            </span>

                                        </div>

                                    </td>


                                    {columns.map(
                                        (actionName) => {

                                            const status =
                                                stat(
                                                    keysFor(
                                                        visibleModules,
                                                        actionName
                                                    )
                                                );

                                            return (
                                                <td
                                                    key={
                                                        actionName
                                                    }
                                                    className="
                                                        sticky
                                                        bottom-0
                                                        h-[70px]
                                                        border-t
                                                        border-gray-200
                                                        bg-[#f8fafc]
                                                        text-center
                                                    "
                                                >

                                                    <Box
                                                        size={22}
                                                        variant="soft"
                                                        checked={
                                                            status.checked
                                                        }
                                                        indeterminate={
                                                            status.some
                                                        }
                                                        disabled={
                                                            busy
                                                        }
                                                        title={`Select ${titleCase(
                                                            actionName
                                                        )} for all visible modules`}
                                                        onChange={(
                                                            value
                                                        ) =>
                                                            toggleColumn(
                                                                actionName,
                                                                value
                                                            )
                                                        }
                                                    />

                                                </td>
                                            );

                                        }
                                    )}

                                </tr>

                            </tfoot>

                        </table>

                    )}

                </div>


                {/* =================================================
                    FOOTER
                ================================================= */}

                <div
                    className="
                        flex
                        h-[68px]
                        shrink-0
                        items-center
                        justify-between
                        border-t
                        border-gray-200
                        bg-white
                        px-6
                    "
                >

                    <span
                        className="
                            text-xs
                            text-gray-500
                        "
                    >
                        {changes.length === 0
                            ? "No unsaved changes"
                            : `${changes.length} unsaved change${changes.length > 1
                                ? "s"
                                : ""
                            }`}
                    </span>


                    <div
                        className="
                            flex
                            items-center
                            gap-3
                        "
                    >

                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={busy}
                            className="
                                h-10
                                rounded-md
                                border
                                border-gray-300
                                bg-white
                                px-5
                                text-sm
                                font-medium
                                text-gray-700
                                hover:bg-gray-50
                                disabled:opacity-50
                            "
                        >
                            Cancel
                        </button>


                        <button
                            type="submit"
                            disabled={
                                busy ||
                                changes.length === 0 ||
                                !validUserId
                            }
                            className="
                                h-10
                                rounded-md
                                bg-blue-600
                                px-6
                                text-sm
                                font-medium
                                text-white
                                hover:bg-blue-700
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            "
                        >
                            {saving
                                ? "Saving…"
                                : "Save changes"}
                        </button>

                    </div>

                </div>

            </form>

        </div>
    );
}