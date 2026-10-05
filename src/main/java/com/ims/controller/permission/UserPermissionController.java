package com.ims.controller.permission;

import com.ims.common.ApiResponse;
import com.ims.dtos.permission.userPermission.UserPermissionRequest;
import com.ims.dtos.permission.userPermission.UserPermissionResponse;
import com.ims.dtos.permission.userPermission.UserPermissionUpdateRequest;
import com.ims.service.serviceInterface.permission.UserPermissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/user-permissions")
@RequiredArgsConstructor
public class UserPermissionController {

    private final UserPermissionService service;


    @PostMapping
    public ResponseEntity<ApiResponse<UserPermissionResponse>> create(
            @Valid @RequestBody UserPermissionRequest request
    ) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        service.create(request),
                        "User permission created successfully."
                )
        );
    }


    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserPermissionResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody UserPermissionUpdateRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        service.update(id, request),
                        "User permission updated successfully."
                )
        );
    }


    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserPermissionResponse>> getById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        service.getById(id),
                        "User permission fetched successfully."
                )
        );
    }


    @GetMapping
    public ResponseEntity<ApiResponse<List<UserPermissionResponse>>> getAll() {

        return ResponseEntity.ok(
                ApiResponse.success(
                        service.getAll(),
                        "User permissions fetched successfully."
                )
        );
    }


    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<UserPermissionResponse>>> getByUser(
            @PathVariable Long userId
    ) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        service.getByUser(userId),
                        "User permissions fetched successfully."
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
                        "User permission deleted successfully."
                )
        );
    }
}
