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



import com.ims.common.ApiResponse;

import com.ims.dtos.permission.moduleAction.ModuleActionResponse;
import com.ims.service.serviceInterface.permission.ModuleActionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/module-action")
@RequiredArgsConstructor
public class ModuleActionController {

    private final ModuleActionService moduleActionService;

    @GetMapping("/getAll")
    public ResponseEntity<ApiResponse<?>> getAll() {

        List<ModuleActionResponse> list =
                moduleActionService.getAll();

        String message = list.isEmpty()
                ? "Module actions not found."
                : "Module actions fetched successfully.";

        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success(
                        list,
                        message
                ));
    }
}