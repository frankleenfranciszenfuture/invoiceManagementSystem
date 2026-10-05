package com.ims.service.serviceInterface.permission;


import com.ims.dtos.permission.module.ModuleRequest;
import com.ims.dtos.permission.module.ModuleResponse;

import java.util.List;

public interface ModuleService {

    ModuleResponse create(
            ModuleRequest request
    );

    ModuleResponse update(
            Long id,
            ModuleRequest request
    );

    ModuleResponse getById(
            Long id
    );

    List<ModuleResponse> getAll();

    void delete(Long id);
}
