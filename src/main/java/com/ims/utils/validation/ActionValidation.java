package com.ims.utils.validation;


import com.ims.dtos.permission.action.ActionRequest;
import com.ims.exception.ValidationException;
import com.ims.repository.permission.ActionRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ActionValidation {

    private final ActionRepository actionRepository;


    public void validateCreate(ActionRequest request) {

        if (actionRepository.existsByActionName(
                request.getActionName().trim()
        )) {

            throw new ValidationException(
                    "Action already exists."
            );
        }
    }


    public void validateUpdate(
            Long id,
            ActionRequest request
    ) {

        actionRepository
                .findByActionName(
                        request.getActionName().trim()
                )
                .ifPresent(existing -> {

                    if (!existing.getId().equals(id)) {

                        throw new ValidationException(
                                "Action already exists."
                        );
                    }
                });
    }
}
