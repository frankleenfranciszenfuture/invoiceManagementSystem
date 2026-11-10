package com.ims.dtos.audit.enityAuditSnapShot;


import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserAuditSnapshot {

    private Long id;

    private String userId;

    private String name;

    private String email;

    private String role;

    private Boolean accountVerified;

    private Boolean active;
}
