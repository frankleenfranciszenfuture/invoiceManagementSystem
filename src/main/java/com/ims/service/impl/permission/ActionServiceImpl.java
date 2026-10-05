package com.ims.service.impl.permission;

import com.ims.dtos.permission.action.ActionRequest;
import com.ims.dtos.permission.action.ActionResponse;
import com.ims.entity.ActionEntity;
import com.ims.exception.ResourceNotFoundException;
import com.ims.mapper.permission.ActionMapper;
import com.ims.repository.permission.ActionRepository;
import com.ims.service.serviceInterface.permission.ActionService;
import com.ims.utils.validation.ActionValidation;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ActionServiceImpl
        implements ActionService {

    private final ActionRepository repository;
    private final ActionMapper mapper;
    private final ActionValidation validation;


    @Override
    public ActionResponse create(
            ActionRequest request
    ) {

        validation.validateCreate(request);

        ActionEntity entity =
                mapper.toEntity(request);

        entity.setActionName(
                request.getActionName().trim()
        );

        entity.setActive(true);

        return mapper.toResponse(
                repository.save(entity)
        );
    }


    @Override
    public ActionResponse update(
            Long id,
            ActionRequest request
    ) {

        ActionEntity entity =
                repository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Action not found."
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

        entity.setActionName(
                request.getActionName().trim()
        );

        return mapper.toResponse(
                repository.save(entity)
        );
    }


    @Override
    @Transactional(readOnly = true)
    public ActionResponse getById(Long id) {

        return mapper.toResponse(
                repository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Action not found."
                                )
                        )
        );
    }


    @Override
    @Transactional(readOnly = true)
    public List<ActionResponse> getAll() {

        return repository.findAll()
                .stream()
                .map(mapper::toResponse)
                .toList();
    }


    @Override
    public void delete(Long id) {

        ActionEntity entity =
                repository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Action not found."
                                )
                        );

        entity.setActive(false);

        repository.save(entity);
    }
}
