package com.ims.service.serviceInterface.profile;

import com.ims.dtos.profile.ProfileResponse;

public interface ProfileService {

//    ApiResponse<ProfileResponse> createProfile(ProfileRequest request);

    ProfileResponse getMyProfile();

    void sendResetOtp(String email);

    void resetPassword(String email, String otp, String newPassword);

    void sendOtp(String email);

    void verifyOtp(String email, String otp);


}
