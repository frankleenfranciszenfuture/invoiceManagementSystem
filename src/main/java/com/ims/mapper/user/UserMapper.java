package com.ims.mapper.user;

import com.ims.dtos.profile.ProfileResponse;
import com.ims.dtos.user.UserRequest;
import com.ims.dtos.user.UserResponse;
import com.ims.entity.UserEntity;
import com.ims.mapper.audit.AuditMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(
        componentModel = "spring",
        uses = AuditMapper.class
)
public interface UserMapper {

    UserEntity toEntity(UserRequest request);

    @Mapping(
            target = "role",
            source = "role.roleName"
    )
    @Mapping(
            target = "accountVerified",
            source = "isAccountVerified"
    )
    @Mapping(
            target = "audit",
            source = "."
    )
    UserResponse toDTO(UserEntity entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "verifyOtp", ignore = true)
    @Mapping(target = "verifyOtpExpireAt", ignore = true)
    @Mapping(target = "resetOtp", ignore = true)
    @Mapping(target = "resetOtpExpireAt", ignore = true)
    @Mapping(target = "isAccountVerified", ignore = true)
    void updateEntity(
            UserRequest request,
            @MappingTarget UserEntity entity
    );

    default ProfileResponse toProfileResponse(UserEntity user) {

        return ProfileResponse.builder()
                .name(user.getName())
                .email(user.getEmail())
                .userId(user.getUserId())
                .isAccountVerified(user.getIsAccountVerified())
                .roleId(user.getRole().getId())
                .roleName(user.getRole().getRoleName())
                .build();
    }
}
