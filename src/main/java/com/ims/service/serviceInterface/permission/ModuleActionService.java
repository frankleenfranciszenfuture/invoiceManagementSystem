package com.ims.service.serviceInterface.permission;

import com.ims.dtos.permission.moduleAction.ModuleActionRequest;
import com.ims.dtos.permission.moduleAction.ModuleActionResponse;

import java.util.List;

public interface ModuleActionService {

    List<ModuleActionResponse> getAll();
}