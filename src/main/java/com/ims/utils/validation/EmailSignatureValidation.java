package com.ims.utils.validation;


import com.ims.dtos.emailSignature.EmailSignatureCreateRequest;
import com.ims.dtos.emailSignature.EmailSignatureUpdateRequest;
import com.ims.entity.Currency;
import com.ims.entity.EmailSignatureEntity;
import com.ims.repository.EmailSignatureRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class EmailSignatureValidation {

    private final EmailSignatureRepository repository;

    public void validateCreate(
            Long userId,
            EmailSignatureCreateRequest request
    ) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID is required");
        }

        if (repository.existsByUserIdAndSignatureNameIgnoreCaseAndStatus(
                userId,
                request.getSignatureName().trim(),
                "ACTIVE"
        )) {
            throw new IllegalArgumentException(
                    "A signature with this name already exists"
            );
        }
    }

    public void validateUpdate(
            Long userId,
            Long signatureId,
            EmailSignatureUpdateRequest request
    ) {
        if (repository
                .existsByUserIdAndSignatureNameIgnoreCaseAndIdNotAndStatus(
                        userId,
                        request.getSignatureName().trim(),
                        signatureId,
                        "ACTIVE"
                )) {
            throw new IllegalArgumentException(
                    "A signature with this name already exists"
            );
        }
    }

    public EmailSignatureEntity getOwnedSignature(
            Long userId,
            Long signatureId
    ) {
        return repository.findByIdAndUserId(signatureId, userId)
                .filter(signature -> "ACTIVE".equals(signature.getStatus()))
                .orElseThrow(() ->
                        new IllegalArgumentException("Email signature not found")
                );
    }

    public EmailSignatureEntity validateExists(Long id) {
        if (id == null) {
            throw new IllegalArgumentException(
                    "EmailSignature ID is required"
            );
        }

        return repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "EmailSignature not found: " + id
                ));
    }
}