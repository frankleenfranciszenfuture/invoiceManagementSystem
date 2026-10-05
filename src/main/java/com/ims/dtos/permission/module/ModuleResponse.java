package com.ims.dtos.permission.module;



import com.ims.enums.Status;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ModuleResponse {

    private Long id;

    private String moduleName;

    private String description;

    private Status status;

    private Boolean active;
}