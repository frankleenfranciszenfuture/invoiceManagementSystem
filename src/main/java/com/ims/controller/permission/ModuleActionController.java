package com.ims.controller.permission;

import com.ims.common.ApiResponse;
import com.ims.dtos.permission.moduleAction.ModuleActionRequest;
import com.ims.dtos.permission.moduleAction.ModuleActionResponse;
import com.ims.service.serviceInterface.permission.ModuleActionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/permissions/module-actions")
@RequiredArgsConstructor
public class ModuleActionController {

    private final ModuleActionService service;


    @PostMapping
    public ResponseEntity<ApiResponse<ModuleActionResponse>> create(
            @Valid @RequestBody ModuleActionRequest request
    ) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        service.create(request),
                        "Module action created successfully."
                )
        );
    }


    @GetMapping
    public ResponseEntity<ApiResponse<List<ModuleActionResponse>>> getAll() {

        return ResponseEntity.ok(
                ApiResponse.success(
                        service.getAll(),
                        "Module actions fetched successfully."
                )
        );
    }


    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ModuleActionResponse>> getById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        service.getById(id),
                        "Module action fetched successfully."
                )
        );
    }


    @GetMapping("/module/{moduleId}")
    public ResponseEntity<ApiResponse<List<ModuleActionResponse>>> getByModule(
            @PathVariable Long moduleId
    ) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        service.getByModule(moduleId),
                        "Module actions fetched successfully."
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
                        "Module action deleted successfully."
                )
        );
    }
}