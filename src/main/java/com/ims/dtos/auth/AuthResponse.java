package com.ims.dtos.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class AuthResponse {

    private String name;
    private String email;
    private String token;
    private String tokenType;

}