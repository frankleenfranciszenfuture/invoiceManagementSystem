package com.ims.service.impl.common;


import com.ims.entity.UserEntity;
import com.ims.exception.ResourceNotFoundException;
import com.ims.exception.ValidationException;

import com.ims.repository.UserRepository;
import com.ims.service.serviceInterface.common.CurrentSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CurrentUserService {

    private final UserRepository userRepository;
    private final CurrentSessionService currentSessionService;

    /**
     * Admin only
     */
    public UserEntity getCurrentUser() {

        if (currentSessionService.isEmployee()) {
            throw new AccessDeniedException(
                    "Employee login cannot access UserEntity.");
        }

        Long userId = currentSessionService.getUserId();

        return userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Current user not found."));
    }

    /**
     * Works for Admin & Employee
     */
    public boolean isSuperAdmin() {

        if (currentSessionService.isEmployee()) {
            return false;
        }

        return "SUPER_ADMIN".equalsIgnoreCase(
                getCurrentUser().getRole().getRoleName());
    }



}