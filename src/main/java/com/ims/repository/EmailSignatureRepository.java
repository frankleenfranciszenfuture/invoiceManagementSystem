package com.ims.repository;

import com.ims.entity.EmailSignatureEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface EmailSignatureRepository
        extends JpaRepository<EmailSignatureEntity, Long>,
        JpaSpecificationExecutor<EmailSignatureEntity> {

    List<EmailSignatureEntity> findByUserIdAndStatusOrderByUpdatedAtDesc(
            Long userId,
            String status
    );

    Optional<EmailSignatureEntity> findByIdAndUserId(
            Long id,
            Long userId
    );

    boolean existsByUserIdAndSignatureNameIgnoreCaseAndStatus(
            Long userId,
            String signatureName,
            String status
    );

    boolean existsByUserIdAndSignatureNameIgnoreCaseAndIdNotAndStatus(
            Long userId,
            String signatureName,
            Long id,
            String status
    );

    Optional<EmailSignatureEntity> findFirstByUserIdAndDefaultForNewMessagesTrueAndStatus(
            Long userId,
            String status
    );

    Optional<EmailSignatureEntity> findFirstByUserIdAndDefaultForRepliesTrueAndStatus(
            Long userId,
            String status
    );
}