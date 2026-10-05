package com.ims.dtos.permission.moduleAction;


import com.ims.enums.Status;
import lombok.Data;

@Data
public class ModuleActionResponse {

    private Long id;

    private Long moduleId;

    private String moduleName;

    private Long actionId;

    private String actionName;

    private Status status;

    private Boolean active;
}
