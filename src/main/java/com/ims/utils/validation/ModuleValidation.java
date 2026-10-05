package com.ims.utils.validation;


import com.ims.dtos.permission.module.ModuleRequest;
import com.ims.exception.ValidationException;
import com.ims.repository.permission.ModuleRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ModuleValidation {

    private final ModuleRepository moduleRepository;


    public void validateCreate(ModuleRequest request) {

        if (moduleRepository.existsByModuleName(
                request.getModuleName().trim()
        )) {

            throw new ValidationException(
                    "Module already exists."
            );
        }
    }


    public void validateUpdate(
            Long id,
            ModuleRequest request
    ) {

        moduleRepository
                .findByModuleName(
                        request.getModuleName().trim()
                )
                .ifPresent(existing -> {

                    if (!existing.getId().equals(id)) {

                        throw new ValidationException(
                                "Module already exists."
                        );
                    }
                });
    }
}
