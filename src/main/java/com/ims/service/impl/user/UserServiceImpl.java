package com.ims.service.impl.user;

import com.ims.dtos.user.UserRequest;
import com.ims.dtos.user.UserResponse;
import com.ims.entity.*;
import com.ims.mapper.user.UserMapper;

import com.ims.repository.UserRepository;

import com.ims.service.impl.common.CurrentUserService;
import com.ims.service.serviceInterface.access.AccessService;
import com.ims.service.serviceInterface.user.UserService;
import com.ims.utils.base.BaseEntityUtil;
import com.ims.utils.validation.UserValidation;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final UserValidation userValidation;
    private final CurrentUserService currentUserService;
    private final AccessService accessService;
    private final BaseEntityUtil baseEntityUtil;
    private final PasswordEncoder passwordEncoder;


    @Override
    public UserResponse createUser(UserRequest request) {

        UserEntity currentUser =
                currentUserService.getCurrentUser();

        userValidation.validateCreate(
                request,
                currentUser);

        RoleEntity role =
                accessService.findAccessibleRole(request.getRoleId());

        UserEntity user =
                userMapper.toEntity(request);

        user.setName(
                request.getName().trim().toUpperCase());

        user.setEmail(
                request.getEmail().trim().toLowerCase());

        user.setUserId(
                request.getEmail().trim().toLowerCase());

        user.setPassword(
                passwordEncoder.encode(request.getPassword()));

        user.setRole(role);

        user.setIsAccountVerified(false);

        baseEntityUtil.prepareForCreate(user);

        UserEntity savedUser =
                userRepository.save(user);

        return userMapper.toDTO(savedUser);
    }


    @Override
    public List<UserResponse> getAllUsers() {

        return accessService.findAccessibleUsers()
                .stream()
                .map(userMapper::toDTO)
                .toList();
    }


    @Override
    public UserResponse getUser(Long id) {

        return userMapper.toDTO(
                accessService.findAccessibleUser(id));
    }


    @Override
    public UserResponse updateUser(Long id,
                                   UserRequest request) {

        UserEntity currentUser =
                currentUserService.getCurrentUser();

        UserEntity user =
                accessService.findAccessibleUser(id);

        userValidation.validateUpdate(
                id,
                request,
                currentUser);

        RoleEntity role =
                accessService.findAccessibleRole(request.getRoleId());

        boolean roleChanged =
                request.getRoleId() != null
                        && !user.getRole().getId().equals(role.getId());

        userMapper.updateEntity(request, user);

        user.setName(request.getName().trim().toUpperCase());

        user.setEmail(request.getEmail().trim().toLowerCase());

        if (request.getPassword() != null &&
                !request.getPassword().isBlank()) {

            user.setPassword(
                    passwordEncoder.encode(request.getPassword()));
        }

        user.setRole(role);

        baseEntityUtil.prepareForUpdate(user);
        UserEntity savedUser = userRepository.save(user);

        return userMapper.toDTO(savedUser);
    }


    @Override
    public void deleteUser(Long id) {

        userRepository.delete(
                accessService.findAccessibleUser(id));
    }


}