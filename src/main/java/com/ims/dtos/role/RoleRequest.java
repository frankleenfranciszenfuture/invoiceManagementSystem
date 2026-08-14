package com.ims.dtos.role;

import com.ims.enums.Status;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RoleRequest {


    private String roleName;

    private String description;

    private Status status;

}