package com.ims.service.serviceInterface.access;


import com.ims.entity.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface AccessService {

    UserEntity findAccessibleUser(Long id);

    List<UserEntity> findAccessibleUsers();


    //role
    RoleEntity findAccessibleRole(Long id);

    List<RoleEntity> findAccessibleRoles();

}

