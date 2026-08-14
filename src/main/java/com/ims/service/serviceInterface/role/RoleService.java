package com.ims.service.serviceInterface.role;


import com.ims.dtos.role.RoleRequest;
import com.ims.dtos.role.RoleResponse;
import com.ims.dtos.role.RoleStatusRequest;

import java.util.List;

public interface RoleService {

    RoleResponse createRole(RoleRequest dto);

    List<RoleResponse> getAllRoles();

    RoleResponse getRoleById(Long id);

    RoleResponse updateRole(Long id, RoleRequest dto);

    void deleteRole(Long id);

    void updateRoleStatus(
            Long id,
            RoleStatusRequest request);
}

