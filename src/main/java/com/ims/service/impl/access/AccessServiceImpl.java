package com.ims.service.impl.access;

import com.ims.entity.*;
import com.ims.enums.Status;
import com.ims.exception.BadRequestException;
import com.ims.exception.ResourceNotFoundException;
import com.ims.exception.ValidationException;
import com.ims.repository.*;

import com.ims.service.impl.common.CurrentUserService;
import com.ims.service.serviceInterface.access.AccessService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AccessServiceImpl implements AccessService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CurrentUserService currentUserService;


    //user
    @Override
    public UserEntity findAccessibleUser(Long id) {

        return userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found."));
    }

    @Override
    public List<UserEntity> findAccessibleUsers() {

        return userRepository.findAll();
    }


    //role

    @Override
    public RoleEntity findAccessibleRole(Long id) {

        RoleEntity role = roleRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("role not found."));

        String roleName = role.getRoleName();

        /*
         * System roles are accessible to everyone.
         */
        if ("SUPER_ADMIN".equals(roleName)
                || "BRANCH_ADMIN".equals(roleName)) {

            return role;
        }

        /*
         * Super Admin can access every branch role.
         */
        if (currentUserService.isSuperAdmin()) {
            return role;
        }

        return role;
    }

    @Override
    public List<RoleEntity> findAccessibleRoles() {


        return roleRepository.findAll();
    }
}


