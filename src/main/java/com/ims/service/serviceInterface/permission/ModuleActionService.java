package com.ims.service.serviceInterface.permission;

import com.ims.dtos.permission.moduleAction.ModuleActionRequest;
import com.ims.dtos.permission.moduleAction.ModuleActionResponse;

import java.util.List;

public interface ModuleActionService {

    ModuleActionResponse create(
            ModuleActionRequest request
    );

    ModuleActionResponse getById(
            Long id
    );

    List<ModuleActionResponse> getAll();

    List<ModuleActionResponse> getByModule(
            Long moduleId
    );

    void delete(Long id);
}
