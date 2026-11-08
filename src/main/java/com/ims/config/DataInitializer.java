package com.ims.config;

import com.ims.entity.*;
import com.ims.enums.Status;
import com.ims.repository.*;
import com.ims.repository.permission.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Slf4j
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private final ActionRepository actionRepository;
    private final ModuleRepository moduleRepository;
    private final RoleRepository roleRepository;

    private final RoleBasedPermissionRepository roleBasedPermissionRepository;
    private final ModuleActionRepository moduleActionRepository;
    private final UserPermissionRepository userPermissionRepository;

    // =========================================================
    // APPLICATION STARTUP
    // =========================================================

    @Override
    public void run(String... args) {

        createDefaultRoleAndAdmin();

        createModules();

        createActions();

        createModuleActions();

        createSuperAdminPermissions();

        createSuperAdminUserPermissions();
    }

    // =========================================================
    // CREATE MODULES
    // =========================================================

    private void createModules() {

        List<String> modules = List.of(

                "Dashboard",

                "Customers",

                "Items",

                "Invoices",

                "Invoice Approvals",

                "Expenses",

                "Payments",

                "Settings",

                "General Settings",

                "Users",

                "Roles",

                "MenuPermission",

                "Company Profile",

                "Bank Accounts",

                "Cash Accounts",

                "Currencies",

                "Sales Persons",

                "Email Signatures",

                "Categories",

                "SubCategories",

                "Sizes",

                "Units",

                "Products",

                "Taxes",

                "Inventory",

                "Inventory Dashboard",

                "Open Stock",

                "Adjustment Stock",

                "Parties",

                "Outstanding Clearances",

                "Warehouse",

                "Sale Order",

                "Purchase Order",

                "Record Payments",

                "General Settings",

                "Reports Dashboard",

                "Reports Selection",

                "Audit log"






        );

        log.info("========== Initializing Modules ==========");

        for (String moduleName : modules) {

            if (!moduleRepository.existsByModuleName(moduleName)) {

                ModuleEntity module = new ModuleEntity();

                module.setModuleName(moduleName);
                module.setStatus(Status.ACTIVE);
                module.setActive(true);

                moduleRepository.save(module);

                log.info(
                        "Module created : {}",
                        moduleName
                );
            }
        }

        log.info(
                "========== Modules Initialization Completed =========="
        );
    }

    // =========================================================
    // CREATE ACTIONS
    // =========================================================

    private void createActions() {

        List<String> actions = List.of(
                "CREATE",
                "VIEW",
                "EDIT",
                "DELETE",
                "APPROVE",
                "EXPORT",
                "IMPORT"
        );

        log.info("========== Initializing Actions ==========");

        for (String actionName : actions) {

            if (!actionRepository.existsByActionName(actionName)) {

                ActionEntity action = new ActionEntity();

                action.setActionName(actionName);

                // =================================================
                // DEFAULT ACTION STATUS
                // =================================================

                action.setStatus(Status.ACTIVE);
                action.setActive(true);

                actionRepository.save(action);

                log.info(
                        "Action created : {}",
                        actionName
                );
            }
        }

        log.info(
                "========== Actions Initialization Completed =========="
        );
    }

    // =========================================================
    // CREATE DEFAULT SUPER ADMIN
    // =========================================================

    private void createDefaultRoleAndAdmin() {

        log.info(
                "========== Initializing Default Admin =========="
        );

        String adminUserId = "USR001";
        String adminEmail = "admin@ims.com";
        String adminPassword = "admin123";
        String roleName = "SUPER_ADMIN";

        // =====================================================
        // CREATE / GET SUPER ADMIN ROLE
        // =====================================================

        RoleEntity role = roleRepository
                .findByRoleName(roleName)
                .orElseGet(() -> {

                    RoleEntity newRole = new RoleEntity();

                    newRole.setRoleName(roleName);

                    return roleRepository.save(newRole);
                });

        // =====================================================
        // FIND EXISTING ADMIN WITH ROLE
        // =====================================================

        UserEntity admin = userRepository
                .findByUserIdWithRole(adminUserId)
                .orElse(null);

        // =====================================================
        // CREATE ADMIN
        // =====================================================

        if (admin == null) {

            admin = UserEntity.builder()
                    .userId(adminUserId)
                    .name("SUPER ADMIN")
                    .email(adminEmail)
                    .password(
                            passwordEncoder.encode(adminPassword)
                    )
                    .role(role)
                    .isAccountVerified(true)
                    .build();

            userRepository.save(admin);

            log.info(
                    "Admin user created successfully. User ID: {}",
                    adminUserId
            );

        } else {

            log.info(
                    "Admin user already exists. User ID: {}",
                    adminUserId
            );

            // =================================================
            // ENSURE SUPER ADMIN ROLE
            // =================================================

            if (admin.getRole() == null
                    || !roleName.equalsIgnoreCase(
                    admin.getRole().getRoleName())) {

                admin.setRole(role);

                userRepository.save(admin);

                log.info(
                        "Existing admin assigned SUPER_ADMIN role."
                );
            }
        }

        log.info("====================================");
        log.info("Default Admin Credentials");
        log.info("Email    : {}", adminEmail);
        log.info("Password : {}", adminPassword);
        log.info("User ID  : {}", adminUserId);
        log.info("====================================");
    }

    // =========================================================
    // CREATE SUPER ADMIN ROLE PERMISSIONS
    // =========================================================

    private void createSuperAdminPermissions() {

        RoleEntity role = roleRepository
                .findByRoleName("SUPER_ADMIN")
                .orElseThrow(() ->
                        new RuntimeException(
                                "SUPER_ADMIN role not found"
                        )
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

                roleBasedPermissionRepository.save(
                        permission
                );

                log.info(
                        "Role Permission created -> {} | {} | {}",
                        role.getRoleName(),
                        module.getModuleName(),
                        action.getActionName()
                );
            }
        }
    }

    // =========================================================
    // ADD MODULE ACTION
    // =========================================================

    private void addModuleAction(
            String moduleName,
            String actionName) {

        ModuleEntity module =
                moduleRepository
                        .findByModuleName(moduleName)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Module not found: "
                                                + moduleName
                                )
                        );

        ActionEntity action =
                actionRepository
                        .findByActionName(actionName)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Action not found: "
                                                + actionName
                                )
                        );

        if (!moduleActionRepository
                .existsByModuleAndAction(
                        module,
                        action)) {

            ModuleActionEntity entity =
                    new ModuleActionEntity();

            entity.setModule(module);

            entity.setAction(action);

            entity.setModuleName(
                    module.getModuleName()
            );

            entity.setActionName(
                    action.getActionName()
            );

            moduleActionRepository.save(entity);

            log.info(
                    "Module Action mapped : {} -> {}",
                    moduleName,
                    actionName
            );
        }
    }

    // =========================================================
    // CREATE MODULE ACTIONS
    // =========================================================

    private void createModuleActions() {

        // =====================================================
        // DASHBOARD
        // =====================================================

        addModuleAction("Dashboard", "VIEW");

        // =====================================================
        // CUSTOMER
        // =====================================================

        addModuleAction("Customers", "CREATE");
        addModuleAction("Customers", "VIEW");
        addModuleAction("Customers", "EDIT");
        addModuleAction("Customers", "DELETE");

        // =====================================================
        // Items
        // =====================================================

        addModuleAction("Items", "CREATE");
        addModuleAction("Items", "VIEW");
        addModuleAction("Items", "EDIT");
        addModuleAction("Items", "DELETE");


        // =====================================================
        // INVOICES
        // =====================================================

        addModuleAction("Invoices", "CREATE");
        addModuleAction("Invoices", "VIEW");
        addModuleAction("Invoices", "EDIT");
        addModuleAction("Invoices", "DELETE");


        // =====================================================
        // INVOICE APPROVAL
        // =====================================================

        addModuleAction("Invoice Approvals", "CREATE");
        addModuleAction("Invoice Approvals", "VIEW");
        addModuleAction("Invoice Approvals", "EDIT");
        addModuleAction("Invoice Approvals", "DELETE");

        // =====================================================
        // EXPENSES
        // =====================================================

        addModuleAction("Expenses", "CREATE");
        addModuleAction("Expenses", "VIEW");
        addModuleAction("Expenses", "EDIT");
        addModuleAction("Expenses", "DELETE");

        // =====================================================
        // PAYMENTS
        // =====================================================

        addModuleAction("Payments", "CREATE");
        addModuleAction("Payments", "VIEW");
        addModuleAction("Payments", "EDIT");
        addModuleAction("Payments", "DELETE");

        // =====================================================
        // SETTINGS
        // =====================================================

        addModuleAction("Settings", "VIEW");

        // =====================================================
        // USERS
        // =====================================================

        addModuleAction("Users", "CREATE");
        addModuleAction("Users", "VIEW");
        addModuleAction("Users", "EDIT");
        addModuleAction("Users", "DELETE");


        // =====================================================
        // ROLES
        // =====================================================

        addModuleAction("Roles", "CREATE");
        addModuleAction("Roles", "VIEW");
        addModuleAction("Roles", "EDIT");
        addModuleAction("Roles", "DELETE");



        // =====================================================
        // MENU PERMISSION
        // =====================================================

        addModuleAction("MenuPermission", "CREATE");
        addModuleAction("MenuPermission", "VIEW");
        addModuleAction("MenuPermission", "EDIT");
        addModuleAction("MenuPermission", "DELETE");



        // =====================================================
        // COMPANY PROFILE
        // =====================================================

        addModuleAction("Company Profile", "CREATE");
        addModuleAction("Company Profile", "VIEW");
        addModuleAction("Company Profile", "EDIT");
        addModuleAction("Company Profile", "DELETE");


        // =====================================================
        // BANK ACCOUNTS
        // =====================================================

        addModuleAction("Bank Accounts", "CREATE");
        addModuleAction("Bank Accounts", "VIEW");
        addModuleAction("Bank Accounts", "EDIT");
        addModuleAction("Bank Accounts", "DELETE");


        // =====================================================
        // CASH ACCOUNTS
        // =====================================================

        addModuleAction("Cash Accounts", "CREATE");
        addModuleAction("Cash Accounts", "VIEW");
        addModuleAction("Cash Accounts", "EDIT");
        addModuleAction("Cash Accounts", "DELETE");

        // =====================================================
        // SALES PERSON
        // =====================================================

        addModuleAction("Sales Persons", "CREATE");
        addModuleAction("Sales Persons", "VIEW");
        addModuleAction("Sales Persons", "EDIT");
        addModuleAction("Sales Persons", "DELETE");


        // =====================================================
        // CURRENCIES
        // =====================================================

        addModuleAction("Currencies", "CREATE");
        addModuleAction("Currencies", "VIEW");
        addModuleAction("Currencies", "EDIT");
        addModuleAction("Currencies", "DELETE");


        addModuleAction("Email Signatures", "CREATE");
        addModuleAction("Email Signatures", "VIEW");
        addModuleAction("Email Signatures", "EDIT");
        addModuleAction("Email Signatures", "DELETE");


        // =====================================================
        // CATEGORY
        // =====================================================

        addModuleAction("Categories", "CREATE");
        addModuleAction("Categories", "VIEW");
        addModuleAction("Categories", "EDIT");
        addModuleAction("Categories", "DELETE");

        // =====================================================
        // SUBCATEGORY
        // =====================================================

        addModuleAction("SubCategories", "CREATE");
        addModuleAction("SubCategories", "VIEW");
        addModuleAction("SubCategories", "EDIT");
        addModuleAction("SubCategories", "DELETE");


        // =====================================================
        // UNIT
        // =====================================================

        addModuleAction("Units", "CREATE");
        addModuleAction("Units", "VIEW");
        addModuleAction("Units", "EDIT");
        addModuleAction("Units", "DELETE");


        // =====================================================
        // SIZE
        // =====================================================

        addModuleAction("Sizes", "CREATE");
        addModuleAction("Sizes", "VIEW");
        addModuleAction("Sizes", "EDIT");
        addModuleAction("Sizes", "DELETE");

        // =====================================================
        // TAXES
        // =====================================================

        addModuleAction("Taxes", "CREATE");
        addModuleAction("Taxes", "VIEW");
        addModuleAction("Taxes", "EDIT");
        addModuleAction("Taxes", "DELETE");

        // =====================================================
        // PRODUCT ITEMS
        // =====================================================

        addModuleAction("Products", "CREATE");
        addModuleAction("Products", "VIEW");
        addModuleAction("Products", "EDIT");
        addModuleAction("Products", "DELETE");

        // =====================================================
        // INVENTORY
        // =====================================================
        addModuleAction("Inventory", "VIEW");
        addModuleAction("Inventory Dashboard", "VIEW");

        // =====================================================
        // OPEN STOCK
        // =====================================================

        addModuleAction("Open Stock", "CREATE");

        // =====================================================
        // ADJUSTMENT STOCK
        // =====================================================

        addModuleAction("Adjustment Stock", "CREATE");

        // =====================================================
        // WAREHOUSE
        // =====================================================

        addModuleAction("Warehouse", "CREATE");
        addModuleAction("Warehouse", "VIEW");
        addModuleAction("Warehouse", "EDIT");
        addModuleAction("Warehouse", "DELETE");

        // =====================================================
        // PARTIES
        // =====================================================

        addModuleAction("Parties", "CREATE");
        addModuleAction("Parties", "VIEW");
        addModuleAction("Parties", "EDIT");
        addModuleAction("Parties", "DELETE");

        addModuleAction("Outstanding Clearances", "CREATE");
        addModuleAction("Outstanding Clearances", "VIEW");
        addModuleAction("Outstanding Clearances", "EDIT");
        addModuleAction("Outstanding Clearances", "DELETE");

        // =====================================================
        // SALES ORDER
        // =====================================================

        addModuleAction("Sale Order", "CREATE");
        addModuleAction("Sale Order", "VIEW");
        addModuleAction("Sale Order", "EDIT");
        addModuleAction("Sale Order", "DELETE");

        // =====================================================
        // PURCHASE ORDER
        // =====================================================

        addModuleAction("Purchase Order", "CREATE");
        addModuleAction("Purchase Order", "VIEW");
        addModuleAction("Purchase Order", "EDIT");
        addModuleAction("Purchase Order", "DELETE");



        // =====================================================
        // RECORD PAYMENTS
        // =====================================================

        addModuleAction("Record Payments", "CREATE");
        addModuleAction("Record Payments", "VIEW");
        addModuleAction("Record Payments", "EDIT");
        addModuleAction("Record Payments", "DELETE");


        // =====================================================
        // GENERAL SETTINGS
        // =====================================================

        addModuleAction("General Settings", "VIEW");

        // =====================================================
        // REPORTS
        // =====================================================

        addModuleAction("Reports Dashboard", "VIEW");
        addModuleAction("Reports Selection", "CREATE");

        // =====================================================
        // AUDIT LOG
        // =====================================================

        addModuleAction("Audit Log", "VIEW");

    }

    // =========================================================
    // CREATE SUPER ADMIN USER PERMISSIONS
    // =========================================================

    private void createSuperAdminUserPermissions() {

        UserEntity user = userRepository
                .findByUserIdWithRole("USR001")
                .orElseThrow(() ->
                        new RuntimeException(
                                "Super Admin user not found."
                        )
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
                    userPermissionRepository
                            .existsByUserAndModuleAndAction(
                                    user,
                                    module,
                                    action
                            );

            if (!exists) {

                UserBasedPermission permission =
                        new UserBasedPermission();

                permission.setUser(user);

                permission.setRole(
                        user.getRole()
                );

                permission.setModule(module);

                permission.setAction(action);

                permission.setAllowed(true);

                // NO BRANCH
                // NO SHOP

                userPermissionRepository.save(
                        permission
                );

                log.info(
                        "User Permission created -> {} | {} | {}",
                        user.getEmail(),
                        module.getModuleName(),
                        action.getActionName()
                );
            }
        }
    }
}
