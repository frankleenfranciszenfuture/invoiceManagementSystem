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
public class ModuleActionServiceImpl
        implements ModuleActionService {

    private final ModuleActionRepository repository;
    private final ModuleActionMapper mapper;

    @Override
    public List<ModuleActionResponse> getAll() {

        return mapper.toDTO(
                repository.findAllWithModuleAndAction());
    }
}