package com.ims.controller.permission;

import com.ims.common.ApiResponse;
import com.ims.dtos.permission.userPermission.*;
import com.ims.service.serviceInterface.permission.UserPermissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/userAccess")
@RequiredArgsConstructor
public class UserPermissionController {

    private final UserPermissionService userPermissionService;

    // =========================================================
    // CREATE
    // =========================================================

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<?>> assignPermissions(
            @RequestParam Long userId,
            @Valid @RequestBody AssignUserPermissionRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        userPermissionService.assignPermissions(
                                userId,
                                request
                        ),
                        "User permissions assigned successfully."
                ));
    }

    // =========================================================
    // BULK CREATE
    // =========================================================

    @PostMapping("/bulk-create")
    public ResponseEntity<ApiResponse<?>> bulkAssignPermissions(
            @Valid @RequestBody BulkAssignUserPermissionRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        userPermissionService.bulkAssignPermissions(
                                request
                        ),
                        "User permissions assigned successfully."
                ));
    }

    // =========================================================
    // UPDATE
    // =========================================================

    @PutMapping("/update")
    public ResponseEntity<ApiResponse<?>> updatePermissions(
            @RequestParam Long userId,
            @Valid @RequestBody AssignUserPermissionRequest request) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        userPermissionService.updatePermissions(
                                userId,
                                request
                        ),
                        "User permissions updated successfully."
                )
        );
    }

    // =========================================================
    // BULK UPDATE
    // =========================================================

    @PutMapping("/bulk-update")
    public ResponseEntity<ApiResponse<?>> bulkUpdatePermissions(
            @Valid @RequestBody BulkAssignUserPermissionRequest request) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        userPermissionService.bulkUpdatePermissions(
                                request
                        ),
                        "User permissions updated successfully."
                )
        );
    }

    // =========================================================
    // GET ALL
    // =========================================================

    @GetMapping("/getAll")
    public ResponseEntity<ApiResponse<?>> getAll() {

        List<UserPermissionResponse> list =
                userPermissionService.getAll();

        String message = list.isEmpty()
                ? "User permissions not found."
                : "User permissions fetched successfully.";

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

        return ResponseEntity.ok(
                ApiResponse.success(
                        userPermissionService.getById(id),
                        "User permission fetched successfully."
                )
        );
    }

    // =========================================================
    // DELETE
    // =========================================================

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiResponse<?>> deleteById(
            @PathVariable Long id) {

        userPermissionService.deleteById(id);

        return ResponseEntity.ok(
                ApiResponse.success(
                        null,
                        "User permission deleted successfully."
                )
        );
    }

    // =========================================================
    // GET BY USER
    // =========================================================

    @GetMapping("/getByUser")
    public ResponseEntity<ApiResponse<?>> getByUser(
            @RequestParam Long userId) {

        List<UserPermissionResponse> list =
                userPermissionService.getByUser(userId);

        String message = list.isEmpty()
                ? "No permissions found."
                : "User permissions fetched successfully.";

        return ResponseEntity.ok(
                ApiResponse.success(
                        list,
                        message
                )
        );
    }

    // =========================================================
    // CURRENT USER PERMISSION MATRIX
    // =========================================================

    @GetMapping("/getCurrentUserPermission")
    public ResponseEntity<ApiResponse<?>> getUserPermission() {

        List<UserPermissionMatrixResponse> list =
                userPermissionService.getUserPermission();

        String message = list.isEmpty()
                ? "No permissions found."
                : "User permissions fetched successfully.";

        return ResponseEntity.ok(
                ApiResponse.success(
                        list,
                        message
                )
        );
    }

    // =========================================================
    // USER PERMISSION MATRIX BY USER ID
    // =========================================================

    @GetMapping("/getUserPermissionById")
    public ResponseEntity<ApiResponse<?>> getUserPermission(
            @RequestParam Long userId) {

        List<UserPermissionMatrixResponse> list =
                userPermissionService.getUserPermissionById(userId);

        String message = list.isEmpty()
                ? "No permissions found."
                : "User permissions fetched successfully.";

        return ResponseEntity.ok(
                ApiResponse.success(
                        list,
                        message
                )
        );
    }
}