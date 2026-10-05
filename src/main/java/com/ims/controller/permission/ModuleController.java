package com.ims.controller.permission;

import com.ims.common.ApiResponse;
import com.ims.dtos.permission.module.ModuleRequest;
import com.ims.dtos.permission.module.ModuleResponse;
import com.ims.service.serviceInterface.permission.ModuleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/modules")
@RequiredArgsConstructor
public class ModuleController {

    private final ModuleService service;


    @PostMapping
    public ResponseEntity<ApiResponse<ModuleResponse>> create(
            @Valid @RequestBody ModuleRequest request
    ) {

        return ResponseEntity.ok(
                ApiResponse.success(

                        service.create(request),
                        "Module created successfully."
                )
        );
    }


    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ModuleResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody ModuleRequest request
    ) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        service.update(id, request),
                        "Module updated successfully."
                )
        );
    }


    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ModuleResponse>> getById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        service.getById(id),
                        "Module fetched successfully."
                )
        );
    }


    @GetMapping
    public ResponseEntity<ApiResponse<List<ModuleResponse>>> getAll() {

        return ResponseEntity.ok(
                ApiResponse.success(
                        service.getAll(),
                        "Modules fetched successfully."
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
                        "Module deleted successfully."
                )
        );
    }
}
