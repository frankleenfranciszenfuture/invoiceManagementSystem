package com.ims.dtos.user;


import com.ims.dtos.common.BaseResponse;
import lombok.*;
import lombok.experimental.SuperBuilder;


@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse extends BaseResponse {

    private Long id;

    private String userId;

    private String name;

    private String email;

    private String role;

    private Boolean accountVerified;
}
