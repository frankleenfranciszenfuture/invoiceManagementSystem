package com.ims.dtos.role;

import com.ims.dtos.common.BaseResponse;
import com.ims.enums.Status;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class RoleResponse extends BaseResponse {

    private Long id;

    private String roleName;

    private String description;

    private Status status;

}
