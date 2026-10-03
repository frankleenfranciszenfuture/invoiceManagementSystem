package com.ims.controller.user;

import com.ims.common.ApiResponse;

import com.ims.common.PageResponse;
import com.ims.dtos.user.UserRequest;
import com.ims.dtos.user.UserResponse;
import com.ims.service.serviceInterface.user.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;


    // =====================================================
    // CREATE USER
    // =====================================================

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<UserResponse> createUser(
            @Valid @RequestBody UserRequest request) {

        return ApiResponse.<UserResponse>builder()
                .success(true)
                .message("User created successfully.")
                .data(userService.createUser(request))
                .build();
    }


    // =====================================================
    // GET ALL USERS - PAGINATED
    // =====================================================

    @GetMapping("/get-all")
    public ApiResponse<PageResponse<UserResponse>> getAllUsers(

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "10")
            int size,

            @RequestParam(defaultValue = "createdAt")
            String sortBy,

            @RequestParam(defaultValue = "desc")
            String direction) {

        return ApiResponse.<PageResponse<UserResponse>>builder()
                .success(true)
                .message("Users fetched successfully.")
                .data(
                        userService.getAllUsers(
                                page,
                                size,
                                sortBy,
                                direction)
                )
                .build();
    }


    // =====================================================
    // GET USER BY ID
    // =====================================================

    @GetMapping("/getById/{id}")
    public ApiResponse<UserResponse> getUser(
            @PathVariable Long id) {

        return ApiResponse.<UserResponse>builder()
                .success(true)
                .message("User fetched successfully.")
                .data(userService.getUser(id))
                .build();
    }


    // =====================================================
    // UPDATE USER
    // =====================================================

    @PutMapping("/update/{id}")
    public ApiResponse<UserResponse> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserRequest request) {

        return ApiResponse.<UserResponse>builder()
                .success(true)
                .message("User updated successfully.")
                .data(userService.updateUser(id, request))
                .build();
    }


    // =====================================================
    // DELETE USER
    // =====================================================

    @DeleteMapping("/delete/{id}")
    public ApiResponse<Void> deleteUser(
            @PathVariable Long id) {

        userService.deleteUser(id);

        return ApiResponse.<Void>builder()
                .success(true)
                .message("User deleted successfully.")
                .build();
    }
}