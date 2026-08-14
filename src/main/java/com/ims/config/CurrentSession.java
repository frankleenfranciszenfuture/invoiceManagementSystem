package com.ims.config;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CurrentSession {

    private LoginType loginType;
    private Long userId;
    private Long employeeId;
    private String username;
    private String role;

    public enum LoginType {
        USER,
        EMPLOYEE
    }
}