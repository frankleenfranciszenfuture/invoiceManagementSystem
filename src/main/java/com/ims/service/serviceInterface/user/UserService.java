package com.ims.service.serviceInterface.user;
;

import com.ims.dtos.user.UserRequest;
import com.ims.dtos.user.UserResponse;

import java.util.List;

public interface UserService {

    UserResponse createUser(UserRequest request);

    List<UserResponse> getAllUsers();

    UserResponse getUser(Long id);

    UserResponse updateUser(Long id, UserRequest request);

    void deleteUser(Long id);
}


