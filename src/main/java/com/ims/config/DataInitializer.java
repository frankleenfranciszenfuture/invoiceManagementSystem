package com.ims.config;

import com.ims.entity.*;
import com.ims.enums.Status;
import com.ims.repository.*;
import com.ims.repository.permission.ActionRepository;
import com.ims.repository.permission.ModuleActionRepository;
import com.ims.repository.permission.ModuleRepository;
import com.ims.repository.permission.RoleBasedPermissionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
@Slf4j
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private final RoleRepository roleRepository;
    private final ModuleRepository moduleRepository;
    private final ActionRepository actionRepository;
    private final ModuleActionRepository moduleActionRepository;
    private final RoleBasedPermissionRepository roleBasedPermissionRepository;

    @Override
    public void run(String... args) {

        log.info("=================================================");
        log.info("             IMS DATA INITIALIZATION");
        log.info("=================================================");

        createActions();
        createModules();
        createModuleActions();

        RoleEntity adminRole = createDefaultRole();

        createDefaultAdmin(adminRole);

        createAdminRolePermissions(adminRole);

        log.info("=================================================");
        log.info("          IMS DATA INITIALIZATION COMPLETED");
        log.info("=================================================");
    }

    // ============================================================
    // DEFAULT ROLE
    // ============================================================

    private RoleEntity createDefaultRole() {

        String roleName = "ADMIN";

        RoleEntity role = roleRepository
                .findByRoleName(roleName)
                .orElseGet(() -> {

                    RoleEntity newRole = new RoleEntity();

                    newRole.setRoleName(roleName);
                    newRole.setStatus(Status.ACTIVE);

                    RoleEntity savedRole =
                            roleRepository.save(newRole);

                    log.info("Role created : {}", roleName);

                    return savedRole;
                });

        return role;
    }

    // ============================================================
    // DEFAULT ADMIN USER
    // ============================================================

    private UserEntity createDefaultAdmin(RoleEntity role) {

        String adminEmail = "admin@ims.com";
        String adminPassword = "admin123";

        return userRepository
                .findByEmail(adminEmail)
                .orElseGet(() -> {

                    UserEntity admin = UserEntity.builder()
                            .userId("USR001")
                            .name("ADMIN")
                            .email(adminEmail)
                            .password(
                                    passwordEncoder.encode(adminPassword)
                            )
                            .role(role)
                            .isAccountVerified(true)
                            .build();

                    UserEntity savedAdmin =
                            userRepository.save(admin);

                    log.info("Default admin user created.");
                    log.info("Admin Email    : {}", adminEmail);
                    log.info("Admin Password : {}", adminPassword);

                    return savedAdmin;
                });
    }

    // ============================================================
    // ACTIONS
    // ============================================================

    private void createActions() {

        log.info("========== Initializing Actions ==========");

        List<String> actions = List.of(
                "CREATE",
                "VIEW",
                "EDIT",
                "DELETE",
                "APPROVE",
                "EXPORT",
                "IMPORT"
        );

        for (String actionName : actions) {

            if (!actionRepository.existsByActionName(actionName)) {

                ActionEntity action = new ActionEntity();

                action.setActionName(actionName);
                action.setStatus(Status.ACTIVE);

                actionRepository.save(action);

                log.info("Action created : {}", actionName);
            }
        }

        log.info(
                "========== Actions Initialization Completed =========="
        );
    }

    // ============================================================
    // MODULES
    // ============================================================

    private void createModules() {

        log.info("========== Initializing Modules ==========");

        List<String> modules = List.of(

                // 1
                "Dashboard",

                // 2 - 10
                "Company",
                "Customers",
                "Suppliers",
                "Products",
                "Categories",
                "Subcategories",
                "Units",
                "Sizes",
                "Tax",

                // 11 - 14
                "Inventory",
                "Warehouse",
                "Stock Transfer",
                "Stock Adjustment",

                // 15 - 16
                "Purchase",
                "Purchase Order",

                // 17 - 18
                "Sales",
                "Sales Order",

                // 19
                "Invoices",

                // 20
                "Quotes",

                // 21 - 23
                "Payments",
                "Expenses",
                "Bank Accounts",

                // 24 - 26
                "Users",
                "Roles",
                "Menu Permission",

                // 27
                "Reports",

                // 28
                "Settings",

                // 29
                "Audit Log"
        );

        for (String moduleName : modules) {

            if (!moduleRepository.existsByModuleName(moduleName)) {

                ModuleEntity module = new ModuleEntity();

                module.setModuleName(moduleName);
                module.setStatus(Status.ACTIVE);

                moduleRepository.save(module);

                log.info("Module created : {}", moduleName);
            }
        }

        log.info(
                "========== Modules Initialization Completed =========="
        );
    }

    // ============================================================
    // MODULE ACTIONS
    // ============================================================

    private void createModuleActions() {

        log.info("========== Initializing Module Actions ==========");

        Map<String, List<String>> permissions = Map.ofEntries(

                // Dashboard
                Map.entry(
                        "Dashboard",
                        List.of("VIEW")
                ),

                // Master
                Map.entry(
                        "Company",
                        List.of(
                                "CREATE",
                                "VIEW",
                                "EDIT",
                                "DELETE"
                        )
                ),

                Map.entry(
                        "Customers",
                        List.of(
                                "CREATE",
                                "VIEW",
                                "EDIT",
                                "DELETE",
                                "EXPORT",
                                "IMPORT"
                        )
                ),

                Map.entry(
                        "Suppliers",
                        List.of(
                                "CREATE",
                                "VIEW",
                                "EDIT",
                                "DELETE",
                                "EXPORT",
                                "IMPORT"
                        )
                ),

                Map.entry(
                        "Products",
                        List.of(
                                "CREATE",
                                "VIEW",
                                "EDIT",
                                "DELETE",
                                "EXPORT",
                                "IMPORT"
                        )
                ),

                Map.entry(
                        "Categories",
                        List.of(
                                "CREATE",
                                "VIEW",
                                "EDIT",
                                "DELETE"
                        )
                ),

                Map.entry(
                        "Subcategories",
                        List.of(
                                "CREATE",
                                "VIEW",
                                "EDIT",
                                "DELETE"
                        )
                ),

                Map.entry(
                        "Units",
                        List.of(
                                "CREATE",
                                "VIEW",
                                "EDIT",
                                "DELETE"
                        )
                ),

                Map.entry(
                        "Sizes",
                        List.of(
                                "CREATE",
                                "VIEW",
                                "EDIT",
                                "DELETE"
                        )
                ),

                Map.entry(
                        "Tax",
                        List.of(
                                "CREATE",
                                "VIEW",
                                "EDIT",
                                "DELETE"
                        )
                ),

                // Inventory
                Map.entry(
                        "Inventory",
                        List.of(
                                "VIEW",
                                "EXPORT"
                        )
                ),

                Map.entry(
                        "Warehouse",
                        List.of(
                                "CREATE",
                                "VIEW",
                                "EDIT",
                                "DELETE"
                        )
                ),

                Map.entry(
                        "Stock Transfer",
                        List.of(
                                "CREATE",
                                "VIEW",
                                "EDIT",
                                "DELETE",
                                "APPROVE"
                        )
                ),

                Map.entry(
                        "Stock Adjustment",
                        List.of(
                                "CREATE",
                                "VIEW",
                                "EDIT",
                                "DELETE",
                                "APPROVE"
                        )
                ),

                // Purchase
                Map.entry(
                        "Purchase",
                        List.of(
                                "CREATE",
                                "VIEW",
                                "EDIT",
                                "DELETE",
                                "APPROVE",
                                "EXPORT"
                        )
                ),

                Map.entry(
                        "Purchase Order",
                        List.of(
                                "CREATE",
                                "VIEW",
                                "EDIT",
                                "DELETE",
                                "APPROVE",
                                "EXPORT"
                        )
                ),

                // Sales
                Map.entry(
                        "Sales",
                        List.of(
                                "CREATE",
                                "VIEW",
                                "EDIT",
                                "DELETE",
                                "APPROVE",
                                "EXPORT"
                        )
                ),

                Map.entry(
                        "Sales Order",
                        List.of(
                                "CREATE",
                                "VIEW",
                                "EDIT",
                                "DELETE",
                                "APPROVE",
                                "EXPORT"
                        )
                ),

                // Invoice
                Map.entry(
                        "Invoices",
                        List.of(
                                "CREATE",
                                "VIEW",
                                "EDIT",
                                "DELETE",
                                "APPROVE",
                                "EXPORT"
                        )
                ),

                // Quotes
                Map.entry(
                        "Quotes",
                        List.of(
                                "CREATE",
                                "VIEW",
                                "EDIT",
                                "DELETE",
                                "APPROVE",
                                "EXPORT"
                        )
                ),

                // Finance
                Map.entry(
                        "Payments",
                        List.of(
                                "CREATE",
                                "VIEW",
                                "EDIT",
                                "DELETE",
                                "APPROVE",
                                "EXPORT"
                        )
                ),

                Map.entry(
                        "Expenses",
                        List.of(
                                "CREATE",
                                "VIEW",
                                "EDIT",
                                "DELETE",
                                "APPROVE",
                                "EXPORT"
                        )
                ),

                Map.entry(
                        "Bank Accounts",
                        List.of(
                                "CREATE",
                                "VIEW",
                                "EDIT",
                                "DELETE"
                        )
                ),

                // Access Management
                Map.entry(
                        "Users",
                        List.of(
                                "CREATE",
                                "VIEW",
                                "EDIT",
                                "DELETE"
                        )
                ),

                Map.entry(
                        "Roles",
                        List.of(
                                "CREATE",
                                "VIEW",
                                "EDIT",
                                "DELETE"
                        )
                ),

                Map.entry(
                        "Menu Permission",
                        List.of(
                                "CREATE",
                                "VIEW",
                                "EDIT",
                                "DELETE"
                        )
                ),

                // Reports
                Map.entry(
                        "Reports",
                        List.of(
                                "VIEW",
                                "EXPORT"
                        )
                ),

                // Settings
                Map.entry(
                        "Settings",
                        List.of(
                                "VIEW",
                                "EDIT"
                        )
                ),

                // Audit
                Map.entry(
                        "Audit Log",
                        List.of(
                                "VIEW",
                                "EXPORT"
                        )
                )
        );

        permissions.forEach((moduleName, actions) -> {

            for (String actionName : actions) {

                addModuleAction(
                        moduleName,
                        actionName
                );
            }
        });

        log.info(
                "========== Module Actions Initialization Completed =========="
        );
    }

    // ============================================================
    // ADD MODULE ACTION
    // ============================================================

    private void addModuleAction(
            String moduleName,
            String actionName
    ) {

        ModuleEntity module =
                moduleRepository
                        .findByModuleName(moduleName)
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "Module not found: " + moduleName
                                )
                        );

        ActionEntity action =
                actionRepository
                        .findByActionName(actionName)
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "Action not found: " + actionName
                                )
                        );

        boolean exists =
                moduleActionRepository
                        .existsByModuleAndAction(
                                module,
                                action
                        );

        if (!exists) {

            ModuleActionEntity moduleAction =
                    new ModuleActionEntity();

            moduleAction.setModule(module);
            moduleAction.setAction(action);

            moduleAction.setModuleName(
                    module.getModuleName()
            );

            moduleAction.setActionName(
                    action.getActionName()
            );

            moduleAction.setStatus(Status.ACTIVE);

            moduleActionRepository.save(moduleAction);

            log.info(
                    "Module Action created : {} -> {}",
                    moduleName,
                    actionName
            );
        }
    }

    // ============================================================
    // ADMIN ROLE PERMISSIONS
    // ============================================================

    private void createAdminRolePermissions(
            RoleEntity role
    ) {

        log.info(
                "========== Initializing ADMIN Permissions =========="
        );

        List<ModuleActionEntity> moduleActions =
                moduleActionRepository
                        .findAllWithModuleAndAction();

        for (ModuleActionEntity moduleAction : moduleActions) {

            ModuleEntity module =
                    moduleAction.getModule();

            ActionEntity action =
                    moduleAction.getAction();

            boolean exists =
                    roleBasedPermissionRepository
                            .existsByRoleAndModuleAndAction(
                                    role,
                                    module,
                                    action
                            );

            if (!exists) {

                RoleBasedPermission permission =
                        new RoleBasedPermission();

                permission.setRole(role);
                permission.setModule(module);
                permission.setAction(action);
                permission.setAllowed(true);
                permission.setStatus(Status.ACTIVE);

                roleBasedPermissionRepository.save(
                        permission
                );

                log.info(
                        "ADMIN permission created -> {} | {}",
                        module.getModuleName(),
                        action.getActionName()
                );
            }
        }

        log.info(
                "========== ADMIN Permissions Initialization Completed =========="
        );
    }
}
