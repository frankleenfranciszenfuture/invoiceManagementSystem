package com.ims.utils.validation;


import com.ims.entity.ActionEntity;
import com.ims.entity.ModuleEntity;
import com.ims.exception.ValidationException;
import com.ims.repository.permission.ModuleActionRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ModuleActionValidation {

    private final ModuleActionRepository repository;


    public void validateCreate(
            ModuleEntity module,
            ActionEntity action
    ) {

        if (repository.existsByModuleAndAction(
                module,
                action
        )) {

            throw new ValidationException(
                    "This action is already assigned to the module."
            );
        }
    }
}
