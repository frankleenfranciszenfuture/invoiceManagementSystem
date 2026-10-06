package com.ims.dtos.permission.moduleAction;


import com.ims.enums.Status;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ModuleActionResponse {

    private Long id;

    private Long moduleId;

    private String moduleName;

    private Long actionId;

    private String actionName;
    private Status status;

}

//@Data
//public class ModuleActionResponse {
//
//    private Long id;
//
//    private Long moduleId;
//
//    private String moduleName;
//
//    private Long actionId;
//
//    private String actionName;
//
//    private Status status;
//
//    private Boolean active;
//}
