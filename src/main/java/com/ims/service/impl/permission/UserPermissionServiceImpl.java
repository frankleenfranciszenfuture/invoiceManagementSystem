package com.ims.service.impl.permission;

import com.ims.dtos.permission.userPermission.UserPermissionRequest;
import com.ims.dtos.permission.userPermission.UserPermissionResponse;
import com.ims.dtos.permission.userPermission.UserPermissionUpdateRequest;
import com.ims.entity.ActionEntity;
import com.ims.entity.ModuleEntity;
import com.ims.entity.UserBasedPermission;
import com.ims.entity.UserEntity;
import com.ims.enums.Status;
import com.ims.exception.ResourceNotFoundException;
import com.ims.exception.ValidationException;
import com.ims.mapper.permission.UserPermissionMapper;
import com.ims.repository.UserRepository;
import com.ims.repository.permission.ActionRepository;
import com.ims.repository.permission.ModuleRepository;
import com.ims.repository.permission.UserPermissionRepository;
import com.ims.service.serviceInterface.permission.UserPermissionService;
import com.ims.utils.validation.UserPermissionValidation;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class UserPermissionServiceImpl
        implements UserPermissionService {

    private final UserPermissionRepository repository;
    private final UserRepository userRepository;
    private final ModuleRepository moduleRepository;
    private final ActionRepository actionRepository;
    private final UserPermissionMapper mapper;
    private final UserPermissionValidation validation;


    // ============================================================
    // CREATE USER PERMISSION
    // ============================================================

    @Override
    public UserPermissionResponse create(
            UserPermissionRequest request
    ) {

        // --------------------------------------------------------
        // REQUEST VALIDATION
        // --------------------------------------------------------

        if (request == null) {
            throw new ValidationException(
                    "User permission request is required."
            );
        }

        if (request.getUserId() == null) {
            throw new ValidationException(
                    "User ID is required."
            );
        }

        if (request.getModuleId() == null) {
            throw new ValidationException(
                    "Module ID is required."
            );
        }

        if (request.getActionId() == null) {
            throw new ValidationException(
                    "Action ID is required."
            );
        }

        if (request.getAllowed() == null) {
            throw new ValidationException(
                    "Allowed value is required."
            );
        }


        // --------------------------------------------------------
        // LOAD USER
        // --------------------------------------------------------

        UserEntity user =
                userRepository.findById(request.getUserId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "User not found."
                                )
                        );


        // --------------------------------------------------------
        // LOAD MODULE
        // --------------------------------------------------------

        ModuleEntity module =
                moduleRepository.findById(request.getModuleId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Module not found."
                                )
                        );


        // --------------------------------------------------------
        // LOAD ACTION
        // --------------------------------------------------------

        ActionEntity action =
                actionRepository.findById(request.getActionId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Action not found."
                                )
                        );


        // --------------------------------------------------------
        // GENERAL VALIDATION
        // --------------------------------------------------------

        validation.validateCreate(
                user,
                module,
                action
        );


        // --------------------------------------------------------
        // CHECK EXISTING USER PERMISSION
        //
        // UNIQUE:
        //
        // USER + MODULE + ACTION
        //
        // ROLE IS NOT USED FOR DUPLICATE CHECK.
        // --------------------------------------------------------

        UserBasedPermission existingPermission =
                repository.findByUserAndModuleAndAction(
                        user,
                        module,
                        action
                ).orElse(null);


        // --------------------------------------------------------
        // EXISTING RECORD
        // --------------------------------------------------------

        if (existingPermission != null) {

            // ----------------------------------------------------
            // SOFT DELETED / INACTIVE
            // ----------------------------------------------------

            if (Boolean.FALSE.equals(
                    existingPermission.getActive()
            )
                    || existingPermission.getStatus()
                    == Status.INACTIVE) {

                existingPermission.setAllowed(
                        Boolean.TRUE.equals(
                                request.getAllowed()
                        )
                );

                existingPermission.setActive(true);
                existingPermission.setStatus(Status.ACTIVE);

                existingPermission.setUser(user);
                existingPermission.setRole(user.getRole());
                existingPermission.setModule(module);
                existingPermission.setAction(action);

                return mapper.toResponse(
                        repository.save(existingPermission)
                );
            }


            // ----------------------------------------------------
            // ACTIVE DUPLICATE
            // ----------------------------------------------------

            throw new ValidationException(
                    "Permission already exists for this user."
            );
        }


        // --------------------------------------------------------
        // CREATE NEW USER PERMISSION
        // --------------------------------------------------------

        UserBasedPermission entity =
                new UserBasedPermission();

        entity.setUser(user);

        /*
         * Role is only stored as reference information.
         * It is NOT part of user permission uniqueness.
         */
        entity.setRole(user.getRole());

        entity.setModule(module);
        entity.setAction(action);

        entity.setAllowed(
                Boolean.TRUE.equals(
                        request.getAllowed()
                )
        );

        entity.setActive(true);
        entity.setStatus(Status.ACTIVE);


        return mapper.toResponse(
                repository.save(entity)
        );
    }


    // ============================================================
    // UPDATE USER PERMISSION
    // ============================================================

    @Override
    public UserPermissionResponse update(
            Long id,
            UserPermissionUpdateRequest request
    ) {

        // --------------------------------------------------------
        // REQUEST VALIDATION
        // --------------------------------------------------------

        if (id == null) {
            throw new ValidationException(
                    "User permission ID is required."
            );
        }

        if (request == null) {
            throw new ValidationException(
                    "User permission update request is required."
            );
        }

        if (request.getAllowed() == null) {
            throw new ValidationException(
                    "Allowed value is required."
            );
        }


        // --------------------------------------------------------
        // FIND EXISTING PERMISSION
        // --------------------------------------------------------

        UserBasedPermission entity =
                repository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "User permission not found."
                                )
                        );


        // --------------------------------------------------------
        // ONLY ALLOWED CAN BE UPDATED
        //
        // DO NOT CHANGE:
        //
        // user
        // role
        // module
        // action
        // --------------------------------------------------------

        entity.setAllowed(
                Boolean.TRUE.equals(
                        request.getAllowed()
                )
        );


        // --------------------------------------------------------
        // RESTORE IF INACTIVE
        // --------------------------------------------------------

        entity.setActive(true);
        entity.setStatus(Status.ACTIVE);


        return mapper.toResponse(
                repository.save(entity)
        );
    }


    // ============================================================
    // GET BY ID
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public UserPermissionResponse getById(
            Long id
    ) {

        if (id == null) {
            throw new ValidationException(
                    "User permission ID is required."
            );
        }

        return mapper.toResponse(
                repository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "User permission not found."
                                )
                        ));
    }


    // ============================================================
    // GET ALL
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public List<UserPermissionResponse> getAll() {

        return repository.findAll()
                .stream()
                .map(mapper::toResponse)
                .toList();
    }


    // ============================================================
    // GET BY USER
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public List<UserPermissionResponse> getByUser(
            Long userId
    ) {

        if (userId == null) {
            throw new ValidationException(
                    "User ID is required."
            );
        }


        UserEntity user =
                userRepository.findById(userId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "User not found."
                                )
                        );


        return repository.findByUser(user)
                .stream()
                .map(mapper::toResponse)
                .toList();
    }


    // ============================================================
    // DELETE USER PERMISSION
    // ============================================================

    @Override
    public void delete(
            Long id
    ) {

        if (id == null) {
            throw new ValidationException(
                    "User permission ID is required."
            );
        }


        UserBasedPermission entity =
                repository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "User permission not found."
                                )
                        );


        // --------------------------------------------------------
        // SOFT DELETE
        // --------------------------------------------------------

        entity.setActive(false);
        entity.setStatus(Status.INACTIVE);

        repository.save(entity);
    }
}