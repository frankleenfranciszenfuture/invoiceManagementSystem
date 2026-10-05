package com.ims.controller.permission;

import com.ims.common.ApiResponse;
import com.ims.dtos.permission.action.ActionRequest;
import com.ims.dtos.permission.action.ActionResponse;
import com.ims.service.serviceInterface.permission.ActionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/actions")
@RequiredArgsConstructor
public class ActionController {

    private final ActionService service;


    @PostMapping
    public ResponseEntity<ApiResponse<ActionResponse>> create(
            @Valid @RequestBody ActionRequest request
    ) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        service.create(request),
                        "Action created successfully."
                )
        );
    }


    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ActionResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody ActionRequest request
    ) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        service.update(id, request),
                        "Action updated successfully."
                )
        );
    }


    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ActionResponse>> getById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        service.getById(id),
                        "Action fetched successfully."
                )
        );
    }


    @GetMapping
    public ResponseEntity<ApiResponse<List<ActionResponse>>> getAll() {

        return ResponseEntity.ok(
                ApiResponse.success(
                        service.getAll(),
                        "Actions fetched successfully."
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
                        "Action deleted successfully."
                )
        );
    }
}
