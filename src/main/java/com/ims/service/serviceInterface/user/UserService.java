package com.ims.service.serviceInterface.user;


import com.ims.common.PageResponse;
import com.ims.dtos.user.UserRequest;
import com.ims.dtos.user.UserResponse;

public interface UserService {

    UserResponse createUser(UserRequest request);

    PageResponse<UserResponse> getAllUsers(
            int page,
            int size,
            String sortBy,
            String direction);

    UserResponse getUser(Long id);

    UserResponse updateUser(
            Long id,
            UserRequest request);

    void deleteUser(Long id);
}