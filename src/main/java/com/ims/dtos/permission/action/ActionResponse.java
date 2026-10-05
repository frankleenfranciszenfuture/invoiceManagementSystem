package com.ims.dtos.permission.action;


import com.ims.enums.Status;
import lombok.Data;

@Data
public class ActionResponse {

    private Long id;

    private String actionName;

    private String description;

    private Status status;

    private Boolean active;
}
