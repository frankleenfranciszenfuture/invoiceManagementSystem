package com.ims.service.impl.emailSignatureService;

import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.dtos.emailSignature.EmailSignatureCreateRequest;
import com.ims.dtos.emailSignature.EmailSignatureResponse;
import com.ims.dtos.emailSignature.EmailSignatureUpdateRequest;
import com.ims.entity.EmailSignatureEntity;
import com.ims.repository.EmailSignatureRepository;
import com.ims.service.serviceInterface.emailSignatureService.EmailSignatureService;
import com.ims.utils.validation.EmailSignatureValidation;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class EmailSignatureServiceImpl implements EmailSignatureService {

    private final EmailSignatureRepository repository;
    private final EmailSignatureValidation validation;

    // =====================================================
    // CREATE SIGNATURE
    // =====================================================

    @Override
    public ApiResponse<EmailSignatureResponse> create(
            Long userId,
            EmailSignatureCreateRequest request
    ) {
        validation.validateCreate(userId, request);

        boolean defaultNew = Boolean.TRUE.equals(
                request.getDefaultForNewMessages()
        );

        boolean defaultReplies = Boolean.TRUE.equals(
                request.getDefaultForReplies()
        );

        if (defaultNew) {
            clearDefaultForNewMessages(userId);
        }

        if (defaultReplies) {
            clearDefaultForReplies(userId);
        }

        EmailSignatureEntity entity = EmailSignatureEntity.builder()
                .userId(userId)
                .signatureName(request.getSignatureName().trim())
                .signatureContent(request.getSignatureContent())
                .defaultForNewMessages(defaultNew)
                .defaultForReplies(defaultReplies)
                .status("ACTIVE")
                .build();

        EmailSignatureEntity saved = repository.save(entity);

        return ApiResponse.success(
                toResponse(saved),
                "Email signature created successfully"
        );
    }

    // =====================================================
    // UPDATE SIGNATURE
    // =====================================================

    @Override
    public ApiResponse<EmailSignatureResponse> update(
            Long userId,
            Long signatureId,
            EmailSignatureUpdateRequest request
    ) {
        EmailSignatureEntity entity =
                validation.getOwnedSignature(userId, signatureId);

        validation.validateUpdate(userId, signatureId, request);

        entity.setSignatureName(request.getSignatureName().trim());
        entity.setSignatureContent(request.getSignatureContent());

        EmailSignatureEntity saved = repository.save(entity);

        return ApiResponse.success(
                toResponse(saved),
                "Email signature updated successfully"
        );
    }

    // =====================================================
    // GET SIGNATURE BY ID
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<EmailSignatureResponse> getById(
            Long userId,
            Long signatureId
    ) {
        EmailSignatureEntity entity =
                validation.getOwnedSignature(userId, signatureId);

        return ApiResponse.success(
                toResponse(entity),
                "Email signature fetched successfully"
        );
    }

    // =====================================================
    // GET ALL SIGNATURES
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<PageResponse<EmailSignatureResponse>> getAll(
            Long userId
    ) {
        List<EmailSignatureResponse> signatures = repository
                .findByUserIdAndStatusOrderByUpdatedAtDesc(
                        userId,
                        "ACTIVE"
                )
                .stream()
                .map(this::toResponse)
                .toList();

        PageResponse<EmailSignatureResponse> pageResponse =
                PageResponse.<EmailSignatureResponse>builder()
                        .content(signatures)
                        .pageNumber(0)
                        .pageSize(signatures.size())
                        .totalElements(signatures.size())
                        .totalPages(signatures.isEmpty() ? 0 : 1)
                        .last(true)
                        .build();

        return ApiResponse.success(
                pageResponse,
                "Email signatures fetched successfully"
        );
    }

    // =====================================================
    // SET DEFAULT FOR NEW MESSAGES
    // =====================================================

    @Override
    public ApiResponse<EmailSignatureResponse> setDefaultForNewMessages(
            Long userId,
            Long signatureId,
            boolean enabled
    ) {
        EmailSignatureEntity selected =
                validation.getOwnedSignature(userId, signatureId);

        if (enabled) {
            clearDefaultForNewMessages(userId);
        }

        selected.setDefaultForNewMessages(enabled);

        EmailSignatureEntity saved = repository.save(selected);

        return ApiResponse.success(
                toResponse(saved),
                enabled
                        ? "Default signature for new messages updated successfully"
                        : "Default signature for new messages removed successfully"
        );
    }

    // =====================================================
    // SET DEFAULT FOR REPLIES AND FORWARDS
    // =====================================================

    @Override
    public ApiResponse<EmailSignatureResponse> setDefaultForReplies(
            Long userId,
            Long signatureId,
            boolean enabled
    ) {
        EmailSignatureEntity selected =
                validation.getOwnedSignature(userId, signatureId);

        if (enabled) {
            clearDefaultForReplies(userId);
        }

        selected.setDefaultForReplies(enabled);

        EmailSignatureEntity saved = repository.save(selected);

        return ApiResponse.success(
                toResponse(saved),
                enabled
                        ? "Default signature for replies updated successfully"
                        : "Default signature for replies removed successfully"
        );
    }

    // =====================================================
    // DELETE SIGNATURE - SOFT DELETE
    // =====================================================

    @Override
    public ApiResponse<Void> delete(
            Long userId,
            Long signatureId
    ) {
        EmailSignatureEntity entity =
                validation.getOwnedSignature(userId, signatureId);

        entity.setStatus("INACTIVE");
        entity.setDefaultForNewMessages(false);
        entity.setDefaultForReplies(false);

        repository.save(entity);

        return ApiResponse.success(
                null,
                "Email signature deleted successfully"
        );
    }

    // =====================================================
    // CLEAR DEFAULT FOR NEW MESSAGES
    // =====================================================

    private void clearDefaultForNewMessages(Long userId) {
        repository
                .findFirstByUserIdAndDefaultForNewMessagesTrueAndStatus(
                        userId,
                        "ACTIVE"
                )
                .ifPresent(entity -> {
                    entity.setDefaultForNewMessages(false);
                    repository.save(entity);
                });
    }

    // =====================================================
    // CLEAR DEFAULT FOR REPLIES
    // =====================================================

    private void clearDefaultForReplies(Long userId) {
        repository
                .findFirstByUserIdAndDefaultForRepliesTrueAndStatus(
                        userId,
                        "ACTIVE"
                )
                .ifPresent(entity -> {
                    entity.setDefaultForReplies(false);
                    repository.save(entity);
                });
    }

    // =====================================================
    // ENTITY -> RESPONSE DTO
    // =====================================================

    private EmailSignatureResponse toResponse(
            EmailSignatureEntity entity
    ) {
        return EmailSignatureResponse.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .signatureName(entity.getSignatureName())
                .signatureContent(entity.getSignatureContent())
                .defaultForNewMessages(
                        entity.isDefaultForNewMessages()
                )
                .defaultForReplies(
                        entity.isDefaultForReplies()
                )
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
