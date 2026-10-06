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

                "Staffs",

                "Loan",

                "Loan Payment",

                "Staff Attendance",

                "POS Users",

                "Employee Finance",

                "Staff Orders",

                "Categories",

                "SubCategories",

                "Product Size",

                "Unit",

                "Products",

                "Parties",

                "Warehouse",

                "Inventory",

                "Purchase Order",

                "Package Reception",

                "Purchase Entry",

                "Sales Order",

                "Stock Transfer",

                "Package Dispatch",

                "Damaged Products",

                "Invoices",

                "Staff Incentive",

                "Stock Transaction",

                "Stock Adjustments",

                "Cash Bank",

                "Cheque",

                "Discount Limit",

                "Discount Request",

                "Settings",

                "Role",

                "Floor Register",

                "Company Detail",

                "Register",

                "Bank Details",

                "Menu Permission",

                "Tax",

                "Points Rule",

                "Incentive",

                "Expenses Category",

                "Report",

                "Order Management",

                "Audit Log",

                "Sales Order Return"
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

        addModuleAction("Unit", "CREATE");
        addModuleAction("Unit", "VIEW");
        addModuleAction("Unit", "EDIT");
        addModuleAction("Unit", "DELETE");

        // =====================================================
        // PRODUCT ITEMS
        // =====================================================

        addModuleAction("Products", "CREATE");
        addModuleAction("Products", "VIEW");
        addModuleAction("Products", "EDIT");
        addModuleAction("Products", "DELETE");

        // =====================================================
        // PARTIES
        // =====================================================

        addModuleAction("Parties", "CREATE");
        addModuleAction("Parties", "VIEW");
        addModuleAction("Parties", "EDIT");
        addModuleAction("Parties", "DELETE");

        // =====================================================
        // WAREHOUSE
        // =====================================================

        addModuleAction("Warehouse", "CREATE");
        addModuleAction("Warehouse", "VIEW");
        addModuleAction("Warehouse", "EDIT");
        addModuleAction("Warehouse", "DELETE");

        // =====================================================
        // INVENTORY
        // =====================================================

        addModuleAction("Inventory", "VIEW");

        // =====================================================
        // PURCHASE ORDER
        // =====================================================

        addModuleAction("Purchase Order", "CREATE");
        addModuleAction("Purchase Order", "VIEW");
        addModuleAction("Purchase Order", "EDIT");
        addModuleAction("Purchase Order", "DELETE");

        // =====================================================
        // PACKAGE RECEPTION
        // =====================================================

        addModuleAction("Package Reception", "CREATE");
        addModuleAction("Package Reception", "VIEW");
        addModuleAction("Package Reception", "EDIT");
        addModuleAction("Package Reception", "DELETE");

        // =====================================================
        // PURCHASE ENTRY
        // =====================================================

        addModuleAction("Purchase Entry", "CREATE");
        addModuleAction("Purchase Entry", "VIEW");
        addModuleAction("Purchase Entry", "EDIT");
        addModuleAction("Purchase Entry", "DELETE");

        // =====================================================
        // SALES ORDER
        // =====================================================

        addModuleAction("Sales Order", "CREATE");
        addModuleAction("Sales Order", "VIEW");
        addModuleAction("Sales Order", "EDIT");
        addModuleAction("Sales Order", "DELETE");

        // =====================================================
        // STOCK TRANSFER
        // =====================================================

        addModuleAction("Stock Transfer", "CREATE");
        addModuleAction("Stock Transfer", "VIEW");
        addModuleAction("Stock Transfer", "EDIT");
        addModuleAction("Stock Transfer", "DELETE");

        // =====================================================
        // PACKAGE DISPATCH
        // =====================================================

        addModuleAction("Package Dispatch", "CREATE");
        addModuleAction("Package Dispatch", "VIEW");
        addModuleAction("Package Dispatch", "EDIT");
        addModuleAction("Package Dispatch", "DELETE");

        // =====================================================
        // DAMAGED PRODUCTS
        // =====================================================

        addModuleAction("Damaged Products", "CREATE");
        addModuleAction("Damaged Products", "VIEW");
        addModuleAction("Damaged Products", "EDIT");
        addModuleAction("Damaged Products", "DELETE");

        // =====================================================
        // INVOICES
        // =====================================================

        addModuleAction("Invoices", "CREATE");
        addModuleAction("Invoices", "VIEW");
        addModuleAction("Invoices", "EDIT");
        addModuleAction("Invoices", "DELETE");

        // =====================================================
        // STAFF INCENTIVE
        // =====================================================

        addModuleAction("Staff Incentive", "VIEW");
        addModuleAction("Staff Incentive", "DELETE");

        // =====================================================
        // STOCK TRANSACTION
        // =====================================================

        addModuleAction("Stock Transaction", "CREATE");
        addModuleAction("Stock Transaction", "VIEW");

        // =====================================================
        // STOCK ADJUSTMENTS
        // =====================================================

        addModuleAction("Stock Adjustments", "CREATE");
        addModuleAction("Stock Adjustments", "VIEW");
        addModuleAction("Stock Adjustments", "EDIT");
        addModuleAction("Stock Adjustments", "DELETE");

        // =====================================================
        // CASH BANK
        // =====================================================

        addModuleAction("Cash Bank", "CREATE");
        addModuleAction("Cash Bank", "VIEW");
        addModuleAction("Cash Bank", "EDIT");

        // =====================================================
        // CHEQUE
        // =====================================================

        addModuleAction("Cheque", "CREATE");
        addModuleAction("Cheque", "VIEW");
        addModuleAction("Cheque", "EDIT");
        addModuleAction("Cheque", "DELETE");

        // =====================================================
        // DISCOUNT LIMIT
        // =====================================================

        addModuleAction("Discount Limit", "CREATE");
        addModuleAction("Discount Limit", "VIEW");
        addModuleAction("Discount Limit", "EDIT");
        addModuleAction("Discount Limit", "DELETE");

        // =====================================================
        // DISCOUNT REQUEST
        // =====================================================

        addModuleAction("Discount Request", "VIEW");
        addModuleAction("Discount Request", "CREATE");

        // =====================================================
        // SETTINGS
        // =====================================================

        addModuleAction("Settings", "VIEW");

        // =====================================================
        // ROLE
        // =====================================================

        addModuleAction("Role", "CREATE");
        addModuleAction("Role", "VIEW");
        addModuleAction("Role", "EDIT");
        addModuleAction("Role", "DELETE");

        // =====================================================
        // FLOOR REGISTER
        // =====================================================

        addModuleAction("Floor Register", "CREATE");
        addModuleAction("Floor Register", "VIEW");
        addModuleAction("Floor Register", "EDIT");
        addModuleAction("Floor Register", "DELETE");

        // =====================================================
        // COMPANY DETAIL
        // =====================================================

        addModuleAction("Company Detail", "CREATE");
        addModuleAction("Company Detail", "VIEW");
        addModuleAction("Company Detail", "EDIT");
        addModuleAction("Company Detail", "DELETE");

        // =====================================================
        // REGISTER
        // =====================================================

        addModuleAction("Register", "CREATE");
        addModuleAction("Register", "VIEW");
        addModuleAction("Register", "EDIT");
        addModuleAction("Register", "DELETE");

        // =====================================================
        // BANK DETAILS
        // =====================================================

        addModuleAction("Bank Details", "CREATE");
        addModuleAction("Bank Details", "VIEW");
        addModuleAction("Bank Details", "EDIT");
        addModuleAction("Bank Details", "DELETE");

        // =====================================================
        // MENU PERMISSION
        // =====================================================

        addModuleAction("Menu Permission", "CREATE");
        addModuleAction("Menu Permission", "VIEW");
        addModuleAction("Menu Permission", "EDIT");
        addModuleAction("Menu Permission", "DELETE");

        // =====================================================
        // TAX
        // =====================================================

        addModuleAction("Tax", "CREATE");
        addModuleAction("Tax", "VIEW");
        addModuleAction("Tax", "EDIT");
        addModuleAction("Tax", "DELETE");

        // =====================================================
        // POINTS RULE
        // =====================================================

        addModuleAction("Points Rule", "CREATE");
        addModuleAction("Points Rule", "VIEW");
        addModuleAction("Points Rule", "EDIT");
        addModuleAction("Points Rule", "DELETE");

        // =====================================================
        // INCENTIVE
        // =====================================================

        addModuleAction("Incentive", "CREATE");
        addModuleAction("Incentive", "VIEW");
        addModuleAction("Incentive", "EDIT");
        addModuleAction("Incentive", "DELETE");

        // =====================================================
        // EXPENSES CATEGORY
        // =====================================================

        addModuleAction("Expenses Category", "CREATE");
        addModuleAction("Expenses Category", "VIEW");
        addModuleAction("Expenses Category", "EDIT");
        addModuleAction("Expenses Category", "DELETE");

        // =====================================================
        // REPORT
        // =====================================================

        addModuleAction("Report", "VIEW");

        // =====================================================
        // ORDER MANAGEMENT
        // =====================================================

        addModuleAction("Order Management", "VIEW");

        // =====================================================
        // AUDIT LOG
        // =====================================================

        addModuleAction("Audit Log", "VIEW");

        // =====================================================
        // SALES ORDER RETURN
        // =====================================================

        addModuleAction("Sales Order Return", "CREATE");
        addModuleAction("Sales Order Return", "VIEW");
        addModuleAction("Sales Order Return", "EDIT");
        addModuleAction("Sales Order Return", "DELETE");
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
