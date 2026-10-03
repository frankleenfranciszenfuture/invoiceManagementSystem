package com.ims.service.impl.user;

import com.ims.common.PageResponse;
import com.ims.dtos.user.UserRequest;
import com.ims.dtos.user.UserResponse;
import com.ims.entity.RoleEntity;
import com.ims.entity.UserEntity;
import com.ims.mapper.user.UserMapper;
import com.ims.repository.UserRepository;
import com.ims.service.impl.common.CurrentUserService;
import com.ims.service.serviceInterface.access.AccessService;
import com.ims.service.serviceInterface.user.UserService;
import com.ims.utils.base.BaseEntityUtil;
import com.ims.utils.validation.UserValidation;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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


    // =====================================================
    // CREATE USER
    // =====================================================

    @Override
    public UserResponse createUser(UserRequest request) {

        UserEntity currentUser =
                currentUserService.getCurrentUser();

        userValidation.validateCreate(
                request,
                currentUser);

        RoleEntity role =
                accessService.findAccessibleRole(
                        request.getRoleId());

        UserEntity user =
                userMapper.toEntity(request);

        user.setName(
                request.getName()
                        .trim()
                        .toUpperCase());

        user.setEmail(
                request.getEmail()
                        .trim()
                        .toLowerCase());

        user.setUserId(
                request.getEmail()
                        .trim()
                        .toLowerCase());

        user.setPassword(
                passwordEncoder.encode(
                        request.getPassword()));

        user.setRole(role);

        user.setIsAccountVerified(false);

        baseEntityUtil.prepareForCreate(user);

        UserEntity savedUser =
                userRepository.save(user);

        return userMapper.toDTO(savedUser);
    }


    // =====================================================
    // GET ALL USERS - PAGINATED
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public PageResponse<UserResponse> getAllUsers(
            int page,
            int size,
            String sortBy,
            String direction) {

        Sort sort =
                direction.equalsIgnoreCase("desc")
                        ? Sort.by(sortBy).descending()
                        : Sort.by(sortBy).ascending();

        Pageable pageable =
                PageRequest.of(
                        page,
                        size,
                        sort);

        Page<UserEntity> userPage =
                accessService.findAccessibleUsers(
                        pageable);

        return toPageResponse(userPage);
    }


    // =====================================================
    // GET USER
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUser(Long id) {

        return userMapper.toDTO(
                accessService.findAccessibleUser(id));
    }


    // =====================================================
    // UPDATE USER
    // =====================================================

    @Override
    public UserResponse updateUser(
            Long id,
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
                accessService.findAccessibleRole(
                        request.getRoleId());

        userMapper.updateEntity(
                request,
                user);

        user.setName(
                request.getName()
                        .trim()
                        .toUpperCase());

        user.setEmail(
                request.getEmail()
                        .trim()
                        .toLowerCase());

        if (request.getPassword() != null &&
                !request.getPassword().isBlank()) {

            user.setPassword(
                    passwordEncoder.encode(
                            request.getPassword()));
        }

        user.setRole(role);

        baseEntityUtil.prepareForUpdate(user);

        UserEntity savedUser =
                userRepository.save(user);

        return userMapper.toDTO(savedUser);
    }


    // =====================================================
    // DELETE USER
    // =====================================================

    @Override
    public void deleteUser(Long id) {

        userRepository.delete(
                accessService.findAccessibleUser(id));
    }


    // =====================================================
    // PAGE RESPONSE
    // =====================================================

    private PageResponse<UserResponse> toPageResponse(
            Page<UserEntity> page) {

        return PageResponse.<UserResponse>builder()
                .content(
                        page.getContent()
                                .stream()
                                .map(userMapper::toDTO)
                                .toList()
                )
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }
}