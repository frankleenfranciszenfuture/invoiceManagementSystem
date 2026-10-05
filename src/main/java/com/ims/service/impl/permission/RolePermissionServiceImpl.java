package com.ims.service.impl.permission;

import com.ims.dtos.permission.rolePermission.RolePermissionRequest;
import com.ims.dtos.permission.rolePermission.RolePermissionResponse;
import com.ims.dtos.permission.rolePermission.RolePermissionUpdateRequest;
import com.ims.entity.ActionEntity;
import com.ims.entity.ModuleEntity;
import com.ims.entity.RoleBasedPermission;
import com.ims.entity.RoleEntity;
import com.ims.enums.Status;
import com.ims.exception.ResourceNotFoundException;
import com.ims.mapper.permission.RolePermissionMapper;
import com.ims.repository.RoleRepository;
import com.ims.repository.permission.ActionRepository;
import com.ims.repository.permission.ModuleRepository;
import com.ims.repository.permission.RoleBasedPermissionRepository;
import com.ims.service.serviceInterface.permission.RolePermissionService;
import com.ims.utils.validation.RolePermissionValidation;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class RolePermissionServiceImpl
        implements RolePermissionService {

    private final RoleBasedPermissionRepository repository;

    private final RoleRepository roleRepository;
    private final ModuleRepository moduleRepository;
    private final ActionRepository actionRepository;

    private final RolePermissionMapper mapper;
    private final RolePermissionValidation validation;


    // ============================================================
    // CREATE
    // ============================================================

    @Override
    public RolePermissionResponse create(
            RolePermissionRequest request
    ) {

        RoleEntity role =
                roleRepository.findById(
                                request.getRoleId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Role not found."
                                )
                        );
        if ("ADMIN".equalsIgnoreCase(role.getRoleName())) {
            throw new IllegalStateException(
                    "ADMIN role permissions cannot be modified."
            );
        }

        ModuleEntity module =
                moduleRepository.findById(
                                request.getModuleId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Module not found."
                                )
                        );


        ActionEntity action =
                actionRepository.findById(
                                request.getActionId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Action not found."
                                )
                        );


        validation.validateCreate(
                role,
                module,
                action
        );


        RoleBasedPermission entity =
                new RoleBasedPermission();

        entity.setRole(role);
        entity.setModule(module);
        entity.setAction(action);

        entity.setAllowed(
                Boolean.TRUE.equals(request.getAllowed())
        );

        // ========================================================
        // DEFAULT STATUS
        // ========================================================

        entity.setStatus(Status.ACTIVE);
        entity.setActive(true);


        return mapper.toResponse(
                repository.save(entity)
        );
    }


    // ============================================================
    // UPDATE
    // ============================================================

    @Override
    public RolePermissionResponse update(
            Long id,
            RolePermissionUpdateRequest request
    ) {

        RoleBasedPermission entity =
                repository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Role permission not found."
                                )
                        );
        if (entity.getRole() != null &&
                "ADMIN".equalsIgnoreCase(
                        entity.getRole().getRoleName()
                )) {

            throw new IllegalStateException(
                    "ADMIN role permissions cannot be modified."
            );
        }
        entity.setAllowed(
                Boolean.TRUE.equals(request.getAllowed())
        );

        if (entity.getStatus() == null) {
            entity.setStatus(Status.ACTIVE);
        }

        if (entity.getActive() == null) {
            entity.setActive(true);
        }

        return mapper.toResponse(
                repository.save(entity)
        );
    }


    // ============================================================
    // GET BY ID
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public RolePermissionResponse getById(
            Long id
    ) {

        return mapper.toResponse(
                repository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Role permission not found."
                                )
                        )
        );
    }


    // ============================================================
    // GET ALL
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public List<RolePermissionResponse> getAll() {

        return repository.findAll()
                .stream()
                .map(mapper::toResponse)
                .toList();
    }


    // ============================================================
    // GET BY ROLE
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public List<RolePermissionResponse> getByRole(
            Long roleId
    ) {

        RoleEntity role =
                roleRepository.findById(roleId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Role not found."
                                )
                        );

        return repository.findByRole(role)
                .stream()
                .map(mapper::toResponse)
                .toList();
    }


    // ============================================================
    // DELETE / SOFT DELETE
    // ============================================================

    @Override
    public void delete(Long id) {

        RoleBasedPermission entity =
                repository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Role permission not found."
                                )
                        );
        if (entity.getRole() != null &&
                "ADMIN".equalsIgnoreCase(
                        entity.getRole().getRoleName()
                )) {

            throw new IllegalStateException(
                    "ADMIN role permissions cannot be modified."
            );
        }
        entity.setAllowed(false);
        entity.setActive(false);
        entity.setStatus(Status.INACTIVE);

        repository.save(entity);
    }
}