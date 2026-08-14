package com.ims.controller.profile;


import com.ims.dtos.profile.ProfileResponse;
import com.ims.service.serviceInterface.email.EmailService;
import com.ims.service.serviceInterface.profile.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.CurrentSecurityContext;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;
    private final EmailService emailService;

//    @PostMapping("/register")
//    public ResponseEntity<ApiResponse<ProfileResponse>> createProfile(
//            @Valid @RequestBody ProfileRequest request) {
//
//        ApiResponse<ProfileResponse> response = profileService.createProfile(request);
//
//        return ResponseEntity.status(HttpStatus.CREATED).body(response);
//    }

    @GetMapping("/profile")
    public ProfileResponse getProfile
            (@CurrentSecurityContext(expression = "authentication?.name") String email) {
        return profileService.getMyProfile();
    }
}

