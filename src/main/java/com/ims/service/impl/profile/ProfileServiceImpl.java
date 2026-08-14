package com.ims.service.impl.profile;

import com.ims.dtos.profile.ProfileResponse;
import com.ims.entity.UserEntity;
import com.ims.mapper.user.UserMapper;
import com.ims.repository.UserRepository;
import com.ims.service.impl.common.CurrentUserService;
import com.ims.service.serviceInterface.email.EmailService;
import com.ims.service.serviceInterface.profile.ProfileService;
import lombok.AllArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.concurrent.ThreadLocalRandom;

@Service
@AllArgsConstructor
public class ProfileServiceImpl implements ProfileService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final CurrentUserService currentUserService;
    private final UserMapper userMapper;

    //=====================================================
    // GET MY PROFILE
    //=====================================================

    @Override
    @Transactional(readOnly = true)
    public ProfileResponse getMyProfile() {

        Long userId = currentUserService
                .getCurrentUser()
                .getId();

        UserEntity currentUser = userRepository
                .findByIdWithRole(userId)
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found"));

        return userMapper.toProfileResponse(currentUser);
    }


    //=====================================================
    // SEND RESET OTP
    //=====================================================

    @Override
    public void sendResetOtp(String email) {

        UserEntity existingEntity = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                "User not found " + email
                        ));

        // Generate 6 digit OTP
        String otp = String.valueOf(
                ThreadLocalRandom.current()
                        .nextInt(100000, 1000000)
        );

        // OTP expires after 15 minutes
        long expiryTime =
                System.currentTimeMillis() + (15 * 60 * 1000);

        existingEntity.setResetOtp(otp);
        existingEntity.setResetOtpExpireAt(expiryTime);

        userRepository.save(existingEntity);

        try {

            emailService.sendResetOtpEmail(
                    existingEntity.getEmail(),
                    otp
            );

        } catch (Exception ex) {

            throw new RuntimeException(
                    "Unable to send email"
            );
        }
    }


    //=====================================================
    // RESET PASSWORD
    //=====================================================

    @Override
    public void resetPassword(
            String email,
            String otp,
            String newPassword
    ) {

        UserEntity existingUser = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                "User Not found " + email
                        ));

        if (existingUser.getResetOtp() == null
                || !existingUser.getResetOtp().equals(otp)) {

            throw new RuntimeException("Invalid OTP");
        }

        if (existingUser.getResetOtpExpireAt()
                < System.currentTimeMillis()) {

            throw new RuntimeException("OTP expired");
        }

        existingUser.setPassword(
                passwordEncoder.encode(newPassword)
        );

        existingUser.setResetOtp(null);
        existingUser.setResetOtpExpireAt(0L);

        userRepository.save(existingUser);
    }


    //=====================================================
    // SEND ACCOUNT VERIFICATION OTP
    //=====================================================

    @Override
    public void sendOtp(String email) {

        UserEntity existingUser = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                "User Not found " + email
                        ));

        if (existingUser.getIsAccountVerified() != null
                && existingUser.getIsAccountVerified()) {

            return;
        }

        // Generate 6 digit OTP
        String otp = String.valueOf(
                ThreadLocalRandom.current()
                        .nextInt(100000, 1000000)
        );

        // OTP expires after 24 hours
        long expiryTime =
                System.currentTimeMillis()
                        + (24 * 60 * 60 * 1000);

        existingUser.setVerifyOtp(otp);
        existingUser.setVerifyOtpExpireAt(expiryTime);

        userRepository.save(existingUser);

        try {

            emailService.sendOtpEmail(
                    existingUser.getEmail(),
                    otp
            );

        } catch (Exception ex) {

            throw new RuntimeException(
                    "Unable to send email"
            );
        }
    }


    //=====================================================
    // VERIFY ACCOUNT OTP
    //=====================================================

    @Override
    public void verifyOtp(
            String email,
            String otp
    ) {

        UserEntity existingUser = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                "User Not found " + email
                        ));

        if (existingUser.getVerifyOtp() == null
                || !existingUser.getVerifyOtp().equals(otp)) {

            throw new RuntimeException("Invalid OTP");
        }

        if (existingUser.getVerifyOtpExpireAt()
                < System.currentTimeMillis()) {

            throw new RuntimeException("OTP Expired");
        }

        existingUser.setIsAccountVerified(true);
        existingUser.setVerifyOtp(null);
        existingUser.setVerifyOtpExpireAt(0L);

        userRepository.save(existingUser);
    }
}
