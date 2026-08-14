package com.ims.utils.base;


import com.ims.entity.BaseEntity;
import com.ims.entity.UserEntity;
import com.ims.exception.ResourceNotFoundException;
import com.ims.service.serviceInterface.common.CurrentSessionService;
import com.ims.service.impl.common.CurrentUserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class BaseEntityUtil {
    private final CurrentUserService currentUserService;
    private final CurrentSessionService currentSessionService;

    public void prepareForCreate(BaseEntity entity) {

        entity.setCreatedAt(LocalDateTime.now());
        entity.setUpdatedAt(LocalDateTime.now());
        entity.setActive(true);


        UserEntity currentUser =
                currentUserService.getCurrentUser();

        entity.setCreatedBy(currentUser.getId());
        entity.setUpdatedBy(currentUser.getId());
    }

    public void prepareForUpdate(BaseEntity entity) {

        entity.setUpdatedAt(LocalDateTime.now());

        if (currentSessionService.isEmployee()) {

            entity.setUpdatedBy(
                    currentSessionService.getEmployeeId());

            return;
        }

        entity.setUpdatedBy(
                currentUserService.getCurrentUser().getId());
    }
}