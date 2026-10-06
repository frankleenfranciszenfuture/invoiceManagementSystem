package com.ims.controller.permission;

import com.ims.common.ApiResponse;
import com.ims.dtos.permission.rolePermission.*;
import com.ims.service.serviceInterface.permission.RolePermissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/roleAccess")
@RequiredArgsConstructor
public class RolePermissionController {

    private final RolePermissionService rolePermissionService;

    // =========================================================
    // CREATE
    // =========================================================

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<?>> assignPermissions(
            @RequestParam Long roleId,
            @Valid @RequestBody AssignRolePermissionRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        rolePermissionService.assignPermissions(
                                roleId,
                                request
                        ),
                        "Permissions assigned successfully."
                ));
    }

    // =========================================================
    // GET BY ROLE
    // =========================================================

    @GetMapping("/getRole")
    public ResponseEntity<ApiResponse<?>> getPermissionsByRole(
            @RequestParam Long roleId) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        rolePermissionService.getPermissionsByRole(
                                roleId
                        ),
                        "Role permissions fetched successfully."
                )
        );
    }

    // =========================================================
    // BULK CREATE
    // =========================================================

    @PostMapping("/bulk-create")
    public ResponseEntity<ApiResponse<?>> assignPermissionsToRoles(
            @Valid @RequestBody BulkRolePermissionRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        rolePermissionService.assignPermissionsToRoles(
                                request
                        ),
                        "Permissions assigned successfully."
                ));
    }

    // =========================================================
    // UPDATE
    // =========================================================

    @PutMapping("/update")
    public ResponseEntity<ApiResponse<?>> updatePermissions(
            @RequestParam Long roleId,
            @Valid @RequestBody AssignRolePermissionRequest request) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        rolePermissionService.updatePermissions(
                                roleId,
                                request
                        ),
                        "Permissions updated successfully."
                )
        );
    }

    // =========================================================
    // BULK UPDATE
    // =========================================================

    @PutMapping("/bulk-update")
    public ResponseEntity<ApiResponse<?>> updatePermissionsToRoles(
            @Valid @RequestBody BulkRolePermissionRequest request) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        rolePermissionService.updatePermissionsToRoles(
                                request
                        ),
                        "Permissions updated successfully."
                )
        );
    }

    // =========================================================
    // GET ALL
    // =========================================================

    @GetMapping("/getAll")
    public ResponseEntity<ApiResponse<?>> getAll() {

        List<RolePermissionResponse> list =
                rolePermissionService.getAll();

        String message = list.isEmpty()
                ? "Role permissions not found."
                : "Role permissions fetched successfully.";

        return ResponseEntity.ok(
                ApiResponse.success(
                        list,
                        message
                )
        );
    }

    // =========================================================
    // GET BY ID
    // =========================================================

    @GetMapping("/getById/{id}")
    public ResponseEntity<ApiResponse<?>> getById(
            @PathVariable Long id) {

        RolePermissionResponse response =
                rolePermissionService.getById(id);

        return ResponseEntity.ok(
                ApiResponse.success(
                        response,
                        "Role permission fetched successfully."
                )
        );
    }

    // =========================================================
    // DELETE
    // =========================================================

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiResponse<?>> deleteById(
            @PathVariable Long id) {

        rolePermissionService.deleteById(id);

        return ResponseEntity.ok(
                ApiResponse.success(
                        null,
                        "Role permission deleted successfully."
                )
        );
    }
}