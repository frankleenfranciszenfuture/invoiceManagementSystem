package com.ims.service.impl.permission;



import com.ims.dtos.permission.module.*;
import com.ims.entity.ModuleEntity;
import com.ims.exception.ResourceNotFoundException;

import com.ims.mapper.permission.ModuleMapper;
import com.ims.repository.permission.ModuleRepository;
import com.ims.service.serviceInterface.permission.ModuleService;


import com.ims.utils.validation.ModuleValidation;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ModuleServiceImpl
        implements ModuleService {

    private final ModuleRepository repository;
    private final ModuleMapper mapper;
    private final ModuleValidation validation;


    @Override
    public ModuleResponse create(
            ModuleRequest request
    ) {

        validation.validateCreate(request);

        ModuleEntity entity =
                mapper.toEntity(request);

        entity.setModuleName(
                request.getModuleName().trim()
        );

        entity.setActive(true);

        return mapper.toResponse(
                repository.save(entity)
        );
    }


    @Override
    public ModuleResponse update(
            Long id,
            ModuleRequest request
    ) {

        ModuleEntity entity =
                repository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Module not found."
                                )
                        );

        validation.validateUpdate(
                id,
                request
        );

        mapper.updateEntity(
                request,
                entity
        );

        entity.setModuleName(
                request.getModuleName().trim()
        );

        return mapper.toResponse(
                repository.save(entity)
        );
    }


    @Override
    @Transactional(readOnly = true)
    public ModuleResponse getById(Long id) {

        return mapper.toResponse(
                repository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Module not found."
                                )
                        )
        );
    }


    @Override
    @Transactional(readOnly = true)
    public List<ModuleResponse> getAll() {

        return repository.findAll()
                .stream()
                .map(mapper::toResponse)
                .toList();
    }


    @Override
    public void delete(Long id) {

        ModuleEntity entity =
                repository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Module not found."
                                )
                        );

        /*
         * Soft delete
         */
        entity.setActive(false);

        repository.save(entity);
    }
}
