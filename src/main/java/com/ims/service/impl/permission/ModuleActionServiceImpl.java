package com.ims.service.impl.permission;

import com.ims.dtos.permission.moduleAction.ModuleActionRequest;
import com.ims.dtos.permission.moduleAction.ModuleActionResponse;
import com.ims.entity.ActionEntity;
import com.ims.entity.ModuleActionEntity;
import com.ims.entity.ModuleEntity;
import com.ims.exception.ResourceNotFoundException;
import com.ims.mapper.permission.ModuleActionMapper;
import com.ims.repository.permission.ActionRepository;
import com.ims.repository.permission.ModuleActionRepository;
import com.ims.repository.permission.ModuleRepository;
import com.ims.service.serviceInterface.permission.ModuleActionService;
import com.ims.utils.validation.ModuleActionValidation;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ModuleActionServiceImpl
        implements ModuleActionService {

    private final ModuleActionRepository repository;
    private final ModuleRepository moduleRepository;
    private final ActionRepository actionRepository;

    private final ModuleActionMapper mapper;
    private final ModuleActionValidation validation;


    @Override
    public ModuleActionResponse create(
            ModuleActionRequest request
    ) {

        ModuleEntity module =
                moduleRepository.findById(
                                request.getModuleId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Module not found."
                                )
                        );


        ActionEntity action =
                actionRepository.findById(
                                request.getActionId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Action not found."
                                )
                        );


        validation.validateCreate(
                module,
                action
        );


        ModuleActionEntity entity =
                new ModuleActionEntity();

        entity.setModule(module);
        entity.setAction(action);

        entity.setModuleName(
                module.getModuleName()
        );

        entity.setActionName(
                action.getActionName()
        );

        entity.setActive(true);


        return mapper.toResponse(
                repository.save(entity)
        );
    }


    @Override
    @Transactional(readOnly = true)
    public ModuleActionResponse getById(Long id) {

        return mapper.toResponse(
                repository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Module action not found."
                                )
                        )
        );
    }


    @Override
    @Transactional(readOnly = true)
    public List<ModuleActionResponse> getAll() {

        return repository
                .findAllWithModuleAndAction()
                .stream()
                .map(mapper::toResponse)
                .toList();
    }


    @Override
    @Transactional(readOnly = true)
    public List<ModuleActionResponse> getByModule(
            Long moduleId
    ) {

        ModuleEntity module =
                moduleRepository.findById(moduleId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Module not found."
                                )
                        );

        return repository
                .findByModule(module)
                .stream()
                .map(mapper::toResponse)
                .toList();
    }


    @Override
    public void delete(Long id) {

        ModuleActionEntity entity =
                repository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Module action not found."
                                )
                        );

        entity.setActive(false);

        repository.save(entity);
    }
}
