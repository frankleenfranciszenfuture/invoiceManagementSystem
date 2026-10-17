package com.ims.service.serviceInterface.emailSignatureService;

import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.dtos.emailSignature.*;

import java.util.List;

public interface EmailSignatureService {

    ApiResponse<EmailSignatureResponse> create(
            Long userId,
            EmailSignatureCreateRequest request
    );

    ApiResponse<EmailSignatureResponse> update(
            Long userId,
            Long signatureId,
            EmailSignatureUpdateRequest request
    );

    ApiResponse<EmailSignatureResponse> getById(
            Long userId,
            Long signatureId
    );

    ApiResponse<PageResponse<EmailSignatureResponse>> getAll(Long userId);

    ApiResponse<EmailSignatureResponse> setDefaultForNewMessages(
            Long userId,
            Long signatureId,
            boolean enabled
    );

    ApiResponse<EmailSignatureResponse> setDefaultForReplies(
            Long userId,
            Long signatureId,
            boolean enabled
    );

    ApiResponse<Void> delete(Long userId, Long signatureId);
}
