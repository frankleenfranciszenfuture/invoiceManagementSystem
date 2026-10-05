package com.ims.controller.permission;

import com.ims.common.ApiResponse;
import com.ims.dtos.permission.rolePermission.RolePermissionRequest;
import com.ims.dtos.permission.rolePermission.RolePermissionResponse;
import com.ims.dtos.permission.rolePermission.RolePermissionUpdateRequest;
import com.ims.service.serviceInterface.permission.RolePermissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/role-permissions")
@RequiredArgsConstructor
public class RolePermissionController {

    private final RolePermissionService service;


    @PostMapping
    public ResponseEntity<ApiResponse<RolePermissionResponse>> create(
            @Valid @RequestBody RolePermissionRequest request
    ) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        service.create(request),
                        "Role permission created successfully."
                )
        );
    }


    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<RolePermissionResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody RolePermissionUpdateRequest request
    ) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        service.update(id, request),
                        "Role permission updated successfully."
                )
        );
    }


    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RolePermissionResponse>> getById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        service.getById(id),
                        "Role permission fetched successfully."
                )
        );
    }


    @GetMapping
    public ResponseEntity<ApiResponse<List<RolePermissionResponse>>> getAll() {

        return ResponseEntity.ok(
                ApiResponse.success(
                        service.getAll(),
                        "Role permissions fetched successfully."
                )
        );
    }


    @GetMapping("/role/{roleId}")
    public ResponseEntity<ApiResponse<List<RolePermissionResponse>>> getByRole(
            @PathVariable Long roleId
    ) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        service.getByRole(roleId),
                        "Role permissions fetched successfully."
                )
        );
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id
    ) {

        service.delete(id);

        return ResponseEntity.ok(
                ApiResponse.success(
                        null,
                        "Role permission deleted successfully."
                )
        );
    }
}
