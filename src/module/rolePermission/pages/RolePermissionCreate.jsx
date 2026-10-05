
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

import { closeModal } from "../../ui/uiSlice";

import {
    resetRolePermissionForm,
} from "../slices/rolePermissionSlice";

import {
    fetchRolePermissionsByRoleId,
    updateRolePermission,
    createRolePermission,
} from "../thunks/rolePermissionThunks";

import {
    fetchAllModuleActions,
} from "../../permission/thunks/permissionThunks";


/* =========================================================
   ACTION ORDER
========================================================= */

const ACTION_ORDER = [
    "VIEW",
    "CREATE",
    "DELETE",
    "EDIT",
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
) => `${moduleId} -${actionId} `;


/* =========================================================
   CHECKBOX
========================================================= */

function Box({
    checked,
    indeterminate,
    onChange,
    disabled,
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
inline - flex
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
                checked={checked}
                disabled={disabled}
                onChange={(event) =>
                    onChange(
                        event.target.checked
                    )
                }
            />

            <span
                style={{
                    width: size,
                    height: size,
                }}
                className={`
flex
items - center
justify - center
rounded - lg
border
transition

peer - focus - visible: ring - 2
peer - focus - visible: ring - blue - 400

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
                        size={Math.round(size * 0.55)}
                        strokeWidth={2.5}
                        className="text-white"
                    />
                )}

                {!checked &&
                    indeterminate && (
                        <Minus
                            size={Math.round(size * 0.55)}
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

export default function RolePermissionCreate() {
    const dispatch = useDispatch();


    /* =========================================================
       REDUX
    ========================================================= */

    const modal = useSelector(
        (state) =>
            state.ui?.modal
    );


    /* =========================================================
       ROLE PERMISSIONS
    ========================================================= */

    const rolePermissions =
        useSelector(
            (state) =>
                state.rolePermission
                    ?.rolePermissions
        ) || [];

    const loading =
        useSelector(
            (state) =>
                state.rolePermission
                    ?.loading
        ) || false;

    const rolePermissionsLoading =
        useSelector(
            (state) =>
                state.rolePermission
                    ?.rolePermissionsLoading
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
       ROLE VIEW
    ========================================================= */

    const selectedRoleId =
        useSelector(
            (state) =>
                state.rolePermissionView
                    ?.selectedRoleId
        );

    const selectedRoleName =
        useSelector(
            (state) =>
                state.rolePermissionView
                    ?.selectedRoleName
        );


    /* =========================================================
       ROLE DATA
    ========================================================= */

    const roles =
        useSelector(
            (state) =>
                state.role?.roles
        ) || [];

    const currentRole =
        useSelector(
            (state) =>
                state.role?.role
        );

    const existingRole =
        useSelector(
            (state) =>
                state.role?.existingRole
        );


    /* =========================================================
       MODAL
    ========================================================= */

    const isOpen =
        modal?.open &&
        (
            modal?.type ===
            "addRolePermission" ||
            modal?.type ===
            "editRolePermission"
        );


    /* =========================================================
       ROLE
    ========================================================= */

    const roleId =
        modal?.data?.roleId ??
        modal?.data?.id ??
        selectedRoleId ??
        currentRole?.id ??
        existingRole?.id ??
        null;

    const roleName =
        modal?.data?.roleName ||
        modal?.data?.name ||
        selectedRoleName ||
        currentRole?.roleName ||
        existingRole?.roleName ||
        roles.find(
            (role) =>
                Number(role?.id) ===
                Number(roleId)
        )?.roleName ||
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


    /* =========================================================
       VALID ROLE
    ========================================================= */

    const validRoleId =
        roleId !== null &&
        roleId !== undefined &&
        Number(roleId) > 0;


    /* =========================================================
       LOAD MODULE ACTIONS
    ========================================================= */

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        if (moduleActions.length > 0) {
            return;
        }

        dispatch(
            fetchAllModuleActions()
        );
    }, [
        isOpen,
        moduleActions.length,
        dispatch,
    ]);


    /* =========================================================
       LOAD ROLE PERMISSIONS
    ========================================================= */

    useEffect(() => {
        if (
            !isOpen ||
            !validRoleId
        ) {
            return;
        }

        dispatch(
            fetchRolePermissionsByRoleId(
                Number(roleId)
            )
        );
    }, [
        isOpen,
        validRoleId,
        roleId,
        dispatch,
    ]);


    /* =========================================================
       BUILD MODULES
    ========================================================= */

    const modules = useMemo(() => {
        const map = new Map();

        const add = (
            moduleId,
            moduleName,
            actionId,
            actionName,
            active
        ) => {
            if (
                moduleId == null ||
                actionId == null ||
                active === false
            ) {
                return;
            }

            const name =
                String(
                    actionName || ""
                ).toUpperCase();

            if (!name) {
                return;
            }

            const mid =
                Number(moduleId);

            if (!map.has(mid)) {
                map.set(mid, {
                    id: mid,
                    name:
                        moduleName ||
                        `Module ${mid} `,
                    actions:
                        new Map(),
                });
            }

            map.get(mid).actions.set(
                name,
                Number(actionId)
            );
        };


        moduleActions.forEach(
            (item) => {
                const moduleId =
                    item?.moduleId ??
                    item?.module?.id;

                const moduleName =
                    item?.moduleName ??
                    item?.module?.name;


                /*
                 * Grouped shape:
                 *
                 * {
                 *   moduleId,
                 *   moduleName,
                 *   actions: [...]
                 * }
                 */

                if (
                    Array.isArray(
                        item?.actions
                    )
                ) {
                    item.actions.forEach(
                        (action) =>
                            add(
                                moduleId,
                                moduleName,
                                action?.actionId ??
                                action?.id,
                                action?.actionName ??
                                action?.name,
                                action?.active
                            )
                    );

                    return;
                }


                /*
                 * Flat shape.
                 */

                add(
                    moduleId,
                    moduleName,
                    item?.actionId ??
                    item?.action?.id,
                    item?.actionName ??
                    item?.action?.name,
                    item?.active
                );
            }
        );


        return Array.from(
            map.values()
        ).sort(
            (a, b) =>
                a.id - b.id
        );
    }, [moduleActions]);


    /* =========================================================
       ACTION COLUMNS
    ========================================================= */

    const columns = useMemo(() => {
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

        return [
            ...ACTION_ORDER.filter(
                (action) =>
                    present.has(action)
            ),

            ...[
                ...present,
            ]
                .filter(
                    (action) =>
                        !ACTION_ORDER.includes(
                            action
                        )
                )
                .sort(),
        ];
    }, [modules]);


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
                    module.name
                        .toLowerCase()
                        .includes(query)
            );
        }, [
            modules,
            search,
        ]);


    /* =========================================================
       BUILD MATRIX
    ========================================================= */

    useEffect(() => {
        if (
            !isOpen ||
            modules.length === 0
        ) {
            return;
        }

        const base = {};


        /*
         * -----------------------------------------
         * ALL AVAILABLE PERMISSIONS = FALSE
         * -----------------------------------------
         */

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


        /*
         * -----------------------------------------
         * APPLY EXISTING ROLE PERMISSIONS
         * -----------------------------------------
         */

        rolePermissions.forEach(
            (permission) => {
                if (
                    permission?.moduleId ==
                    null ||
                    permission?.actionId ==
                    null
                ) {
                    return;
                }

                const key =
                    permissionKey(
                        Number(
                            permission.moduleId
                        ),
                        Number(
                            permission.actionId
                        )
                    );


                if (
                    Object.prototype.hasOwnProperty.call(
                        base,
                        key
                    )
                ) {
                    /*
                     * Permission is checked only when:
                     *
                     * allowed = true
                     * AND
                     * active !== false
                     */

                    base[key] =
                        permission?.active !==
                        false &&
                        permission?.allowed ===
                        true;
                }
            }
        );


        originalRef.current =
            base;

        setOriginal({
            ...base,
        });

        setMatrix({
            ...base,
        });
    }, [
        isOpen,
        modules,
        rolePermissions,
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
    }, [isOpen]);


    /* =========================================================
       CHANGED PERMISSIONS
    ========================================================= */

    const changes = useMemo(() => {
        if (!validRoleId) {
            return [];
        }

        return Object.keys(matrix)
            .filter(
                (key) =>
                    matrix[key] !==
                    original[key]
            )
            .map((key) => {
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
            });
    }, [
        matrix,
        original,
        validRoleId,
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

                keys.forEach(
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
       TOGGLE CELL
       
       Non-VIEW action ON:
       Automatically enable VIEW.

       VIEW OFF:
       Clear complete module.
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

        if (actionId == null) {
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
         * Non-VIEW action ON
         * automatically enables VIEW.
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
         * VIEW OFF
         * clears entire module.
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
       ROW KEYS
    ========================================================= */

    const rowKeys = (
        module
    ) =>
        [
            ...module
                .actions
                .values(),
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
       STAT
    ========================================================= */

    const stat = (
        keys
    ) => {
        const checkedCount =
            keys.filter(
                (key) =>
                    Boolean(
                        matrix[key]
                    )
            ).length;

        return {
            checked:
                keys.length > 0 &&
                checkedCount ===
                keys.length,

            some:
                checkedCount > 0 &&
                checkedCount <
                keys.length,
        };
    };


    /* =========================================================
       MODULE TOGGLE
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
       ALL VISIBLE
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
       ACTION TOGGLE
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
         * Non-VIEW action ON
         * automatically enables VIEW.
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
         * VIEW OFF
         * clear complete visible modules.
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
            resetRolePermissionForm()
        );
    };


    /* =========================================================
       SAVE
       
       CREATE:
       POST /role-permissions

       UPDATE:
       PUT /role-permissions/{id}
       Body:
       {
           allowed: true/false
       }
    ========================================================= */

    const handleSave = async (
        event
    ) => {
        event.preventDefault();


        /* -----------------------------------------
           VALIDATE ROLE
        ----------------------------------------- */

        if (!validRoleId) {
            toast.error(
                "Valid role is required."
            );

            console.error(
                "Invalid role ID:",
                roleId,
                modal?.data
            );

            return;
        }


        /* -----------------------------------------
           NOTHING CHANGED
        ----------------------------------------- */

        if (changes.length === 0) {
            toast.error(
                "No changes to save."
            );

            return;
        }


        setSaving(true);


        try {
            /*
             * =====================================================
             * CREATE / UPDATE
             * =====================================================
             *
             * Existing permission:
             *
             * permission.id exists
             *       ↓
             * PUT
             *
             * New permission:
             *
             * permission doesn't exist
             *       ↓
             * POST only when allowed = true
             */

            let createdCount = 0;
            let updatedCount = 0;


            for (
                const change of changes
            ) {
                /*
                 * Find existing DB permission.
                 */

                const existingPermission =
                    rolePermissions.find(
                        (permission) =>
                            Number(
                                permission?.moduleId
                            ) ===
                            Number(
                                change.moduleId
                            ) &&
                            Number(
                                permission?.actionId
                            ) ===
                            Number(
                                change.actionId
                            )
                    );


                /* =================================================
                   EXISTING PERMISSION
                ================================================= */

                if (
                    existingPermission?.id
                ) {
                    /*
                     * IMPORTANT:
                     *
                     * Backend update request only
                     * expects:
                     *
                     * {
                     *     allowed: true/false
                     * }
                     *
                     * Do NOT send roleId/moduleId/
                     * actionId/status/active here.
                     */

                    await dispatch(
                        updateRolePermission({
                            id:
                                existingPermission.id,

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


                /* =================================================
                   NEW PERMISSION
                ================================================= */

                /*
                 * We only create a DB record when
                 * the permission is enabled.
                 *
                 * There is no reason to create:
                 *
                 * {
                 *     allowed: false
                 * }
                 *
                 * for a permission that never existed.
                 */

                if (
                    change.allowed
                ) {
                    await dispatch(
                        createRolePermission({
                            roleId:
                                Number(
                                    roleId
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


            /* =====================================================
               REFRESH ROLE PERMISSIONS
            ===================================================== */

            await dispatch(
                fetchRolePermissionsByRoleId(
                    Number(roleId)
                )
            ).unwrap();


            /* =====================================================
               SUCCESS MESSAGE
            ===================================================== */

            const total =
                createdCount +
                updatedCount;

            toast.success(
                `${roleName || "Role"
                } permissions saved successfully.${total
                } permission${total !== 1
                    ? "s"
                    : ""
                } updated.`
            );


            /* =====================================================
               CLOSE MODAL
            ===================================================== */

            dispatch(
                closeModal()
            );

            dispatch(
                resetRolePermissionForm()
            );

        } catch (error) {
            console.error(
                "Role permission save error:",
                error
            );

            toast.error(
                typeof error ===
                    "string"
                    ? error
                    : error?.message ||
                    "Failed to save role permissions."
            );
        } finally {
            setSaving(false);
        }
    };


    /* =========================================================
       MODAL CLOSED
    ========================================================= */

    if (!isOpen) {
        return null;
    }


    /* =========================================================
       BUSY
    ========================================================= */

    const busy =
        loading ||
        saving ||
        moduleActionsLoading ||
        rolePermissionsLoading;


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
                            Role Permissions
                        </h2>

                        <p
                            className="
                                mt-0.5
                                text-xs
                                text-gray-500
                            "
                        >
                            Choose what this role
                            can do in each module
                        </p>
                    </div>
                </div>


                {/* ROLE NAME */}

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
                    {roleName ||
                        "Select role"}
                </span>
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
                        onChange={(
                            event
                        ) =>
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
                    {visibleModules.length}
                    {" "}
                    modules
                </span>
            </div>


            {/* =================================================
                FORM
            ================================================= */}

            <form
                onSubmit={
                    handleSave
                }
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

                    ) : rolePermissionsLoading ? (

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
                            Loading role permissions…
                        </div>

                    ) : visibleModules.length ===
                        0 ? (

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
                                min-w-max
                                border-separate
                                border-spacing-0
                            "
                        >

                            {/* =================================================
                                HEADER
                            ================================================= */}

                            <thead>
                                <tr>

                                    <th
                                        className="
                                            sticky
                                            left-0
                                            top-0
                                            z-30
                                            h-14
                                            w-[150px]
                                            min-w-[150px]
                                            border-b
                                            border-gray-200
                                            bg-[#f8fafc]
                                            pl-5
                                            text-left
                                            text-[12px]
                                            font-semibold
                                            uppercase
                                            tracking-[0.1em]
                                            text-slate-500
                                        "
                                    >
                                        Permission
                                    </th>


                                    {visibleModules.map(
                                        (
                                            module
                                        ) => (
                                            <th
                                                key={
                                                    module.id
                                                }
                                                className="
                                                    sticky
                                                    top-0
                                                    z-20
                                                    h-14
                                                    min-w-[130px]
                                                    whitespace-nowrap
                                                    border-b
                                                    border-gray-200
                                                    bg-[#f8fafc]
                                                    px-4
                                                    text-center
                                                    text-[12px]
                                                    font-semibold
                                                    uppercase
                                                    tracking-[0.1em]
                                                    text-slate-500
                                                "
                                            >
                                                {
                                                    module.name
                                                }
                                            </th>
                                        )
                                    )}

                                </tr>
                            </thead>


                            {/* =================================================
                                BODY
                            ================================================= */}

                            <tbody>

                                {/* =============================================
                                    ALL
                                ============================================= */}

                                <tr>

                                    <td
                                        className="
                                            sticky
                                            left-0
                                            z-10
                                            h-[84px]
                                            border-b
                                            border-gray-200
                                            bg-[#f8fafc]
                                            pl-5
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
                                                title="Select every permission for visible modules"
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
                                                All
                                            </span>

                                        </div>

                                    </td>


                                    {visibleModules.map(
                                        (
                                            module
                                        ) => {
                                            const status =
                                                stat(
                                                    rowKeys(
                                                        module
                                                    )
                                                );

                                            return (
                                                <td
                                                    key={
                                                        module.id
                                                    }
                                                    className="
                                                        h-[84px]
                                                        border-b
                                                        border-gray-200
                                                        bg-[#f8fafc]
                                                        text-center
                                                    "
                                                >
                                                    <Box
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
                                                </td>
                                            );
                                        }
                                    )}

                                </tr>


                                {/* =============================================
                                    ACTION ROWS
                                ============================================= */}

                                {columns.map(
                                    (
                                        actionName
                                    ) => {

                                        const status =
                                            stat(
                                                keysFor(
                                                    visibleModules,
                                                    actionName
                                                )
                                            );

                                        return (
                                            <tr
                                                key={
                                                    actionName
                                                }
                                            >

                                                {/* ACTION LABEL */}

                                                <td
                                                    className="
                                                        sticky
                                                        left-0
                                                        z-10
                                                        h-[84px]
                                                        border-b
                                                        border-gray-100
                                                        bg-white
                                                        pl-5
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
                                                            checked={
                                                                status.checked
                                                            }
                                                            indeterminate={
                                                                status.some
                                                            }
                                                            disabled={
                                                                busy
                                                            }
                                                            title={`${titleCase(
                                                                actionName
                                                            )
                                                                } for all visible modules`}
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
                                                                text-[13px]
                                                                font-medium
                                                                text-gray-700
                                                            "
                                                        >
                                                            {titleCase(
                                                                actionName
                                                            )}
                                                        </span>

                                                    </div>

                                                </td>


                                                {/* CELLS */}

                                                {visibleModules.map(
                                                    (
                                                        module
                                                    ) => {

                                                        const actionId =
                                                            module.actions.get(
                                                                actionName
                                                            );

                                                        return (
                                                            <td
                                                                key={
                                                                    module.id
                                                                }
                                                                className="
                                                                    h-[84px]
                                                                    border-b
                                                                    border-gray-100
                                                                    text-center
                                                                    hover:bg-blue-50/30
                                                                "
                                                            >

                                                                {actionId ==
                                                                    null ? (

                                                                    <span
                                                                        className="
                                                                            text-gray-300
                                                                        "
                                                                    >
                                                                        -
                                                                    </span>

                                                                ) : (

                                                                    <Box
                                                                        checked={Boolean(
                                                                            matrix[
                                                                            permissionKey(
                                                                                module.id,
                                                                                actionId
                                                                            )
                                                                            ]
                                                                        )}
                                                                        disabled={
                                                                            busy
                                                                        }
                                                                        title={`${titleCase(
                                                                            actionName
                                                                        )
                                                                            } ${module.name} `}
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
                        {changes.length ===
                            0
                            ? "No unsaved changes"
                            : `${changes.length
                            } unsaved change${changes.length >
                                1
                                ? "s"
                                : ""
                            } `}
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
                            onClick={
                                handleClose
                            }
                            disabled={
                                busy
                            }
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
                                changes.length ===
                                0 ||
                                !validRoleId
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
