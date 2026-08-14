package com.ims.service.impl.role;


import com.ims.dtos.role.RoleRequest;
import com.ims.dtos.role.RoleResponse;
import com.ims.dtos.role.RoleStatusRequest;
import com.ims.entity.RoleEntity;
import com.ims.mapper.role.RoleMapper;
import com.ims.repository.RoleRepository;
import com.ims.service.impl.common.CurrentUserService;
import com.ims.service.serviceInterface.access.AccessService;
import com.ims.service.serviceInterface.role.RoleService;
import com.ims.utils.base.BaseEntityUtil;
import com.ims.utils.validation.RoleValidation;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;
    private final RoleMapper roleMapper;
    private final BaseEntityUtil baseEntityUtil;
    private final RoleValidation roleValidation;
    private final AccessService accessService;
    private final CurrentUserService currentUserService;

    @Override
    public RoleResponse createRole(RoleRequest dto) {


        dto.setRoleName(dto.getRoleName().trim().toUpperCase());

        RoleEntity role = roleMapper.toEntity(dto);

        roleValidation.validateCreate(role);

        baseEntityUtil.prepareForCreate(role);

        return roleMapper.toDTO(
                roleRepository.save(role));
    }

    @Override
    @Transactional(readOnly = true)
    public RoleResponse getRoleById(Long id) {

        return roleMapper.toDTO(
                accessService.findAccessibleRole(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoleResponse> getAllRoles() {

        return accessService.findAccessibleRoles()
                .stream()
                .map(roleMapper::toDTO)
                .toList();
    }

    @Override
    public RoleResponse updateRole(
            Long id,
            RoleRequest dto) {

        dto.setRoleName(dto.getRoleName().trim().toUpperCase());

        RoleEntity role =
                accessService.findAccessibleRole(id);

        roleMapper.updateEntity(dto, role);

        roleValidation.validateUpdate(id, role);

        baseEntityUtil.prepareForUpdate(role);

        return roleMapper.toDTO(
                roleRepository.save(role));
    }


    @Override
    public void deleteRole(Long id) {
        System.out.println("Role ID = " + id);



        RoleEntity role =
                accessService.findAccessibleRole(id);

        roleRepository.delete(role);
    }

    @Override
    public void updateRoleStatus(
            Long id,
            RoleStatusRequest request) {


        RoleEntity role =
                accessService.findAccessibleRole(
                        id);

        role.setStatus(request.getStatus());

        baseEntityUtil.prepareForUpdate(role);

        roleRepository.save(role);
    }
}