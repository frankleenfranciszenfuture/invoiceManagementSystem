package com.ims.service.serviceInterface.permission;

import com.ims.dtos.permission.action.ActionRequest;
import com.ims.dtos.permission.action.ActionResponse;

import java.util.List;

public interface ActionService {

    ActionResponse create(
            ActionRequest request
    );

    ActionResponse update(
            Long id,
            ActionRequest request
    );

    ActionResponse getById(
            Long id
    );

    List<ActionResponse> getAll();

    void delete(Long id);
}
