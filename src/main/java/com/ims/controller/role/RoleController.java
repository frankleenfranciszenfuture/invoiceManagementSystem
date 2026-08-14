package com.ims.controller.role;


import com.ims.common.ApiResponse;
import com.ims.dtos.role.RoleRequest;
import com.ims.dtos.role.RoleResponse;
import com.ims.dtos.role.RoleStatusRequest;
import com.ims.service.serviceInterface.role.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<RoleResponse>> createRole(
            @RequestParam(required = false) Long branchId,
            @RequestBody RoleRequest roleRequest) {

        RoleResponse response = roleService.createRole(roleRequest);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "role created successfully"));
    }

    @GetMapping("/get-all")
    public ResponseEntity<ApiResponse<List<RoleResponse>>> getAllRoles(
    ) {

        List<RoleResponse> response = roleService.getAllRoles();

        return ResponseEntity.ok(
                ApiResponse.success(response, "Roles fetched successfully")
        );
    }

    @GetMapping("/getById/{id}")
    public ResponseEntity<ApiResponse<RoleResponse>> getRoleById(

            @PathVariable Long id,
            @RequestParam(required = false) Long branchId) {

        RoleResponse response = roleService.getRoleById(id);

        return ResponseEntity.ok(
                ApiResponse.success(response, "role fetched successfully")
        );
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<ApiResponse<RoleResponse>> updateRole(
            @PathVariable Long id,
            @RequestParam(required = false) Long branchId,
            @RequestBody RoleRequest roleRequest) {

        RoleResponse response = roleService.updateRole(id, roleRequest);

        return ResponseEntity.ok(
                ApiResponse.success(response, "role updated successfully")
        );
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRole(

            @PathVariable Long id,
            @RequestParam(required = false) Long branchId) {

        roleService.deleteRole(id);

        return ResponseEntity.ok(
                ApiResponse.success(null, "role deleted successfully")
        );
    }

    @PatchMapping("/status/{id}")
    public ResponseEntity<ApiResponse<Void>> updateRoleStatus(
            @PathVariable Long id,
            @RequestBody RoleStatusRequest request) {

        roleService.updateRoleStatus(
                id,
                request);

        return ResponseEntity.ok(
                ApiResponse.success(
                        null,
                        "Role status updated successfully"));
    }
}