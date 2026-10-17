package com.ims.controller.emailSignature;

import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.dtos.emailSignature.EmailSignatureCreateRequest;
import com.ims.dtos.emailSignature.EmailSignatureDefaultRequest;
import com.ims.dtos.emailSignature.EmailSignatureResponse;
import com.ims.dtos.emailSignature.EmailSignatureUpdateRequest;
import com.ims.service.serviceInterface.emailSignatureService.EmailSignatureService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/email-signatures")
@RequiredArgsConstructor
public class EmailSignatureController {

    private final EmailSignatureService service;

    // =====================================================
    // CREATE SIGNATURE
    // =====================================================

    @PostMapping
    public ResponseEntity<ApiResponse<EmailSignatureResponse>> create(
            @RequestParam Long userId,
            @Valid @RequestBody EmailSignatureCreateRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(service.create(userId, request));
    }

    // =====================================================
    // GET ALL SIGNATURES
    // =====================================================

    @GetMapping
    public ResponseEntity<
            ApiResponse<PageResponse<EmailSignatureResponse>>
            > getAll(
            @RequestParam Long userId
    ) {
        return ResponseEntity.ok(service.getAll(userId));
    }

    // =====================================================
    // GET SIGNATURE BY ID
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EmailSignatureResponse>> getById(
            @RequestParam Long userId,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                service.getById(userId, id)
        );
    }

    // =====================================================
    // UPDATE SIGNATURE
    // =====================================================

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EmailSignatureResponse>> update(
            @RequestParam Long userId,
            @PathVariable Long id,
            @Valid @RequestBody EmailSignatureUpdateRequest request
    ) {
        return ResponseEntity.ok(
                service.update(userId, id, request)
        );
    }

    // =====================================================
    // SET DEFAULT FOR NEW MESSAGES
    // =====================================================

    @PatchMapping("/{id}/default-new")
    public ResponseEntity<ApiResponse<EmailSignatureResponse>>
    setDefaultForNew(
            @RequestParam Long userId,
            @PathVariable Long id,
            @Valid @RequestBody EmailSignatureDefaultRequest request
    ) {
        return ResponseEntity.ok(
                service.setDefaultForNewMessages(
                        userId,
                        id,
                        request.getEnabled()
                )
        );
    }

    // =====================================================
    // SET DEFAULT FOR REPLIES AND FORWARDS
    // =====================================================

    @PatchMapping("/{id}/default-replies")
    public ResponseEntity<ApiResponse<EmailSignatureResponse>>
    setDefaultForReplies(
            @RequestParam Long userId,
            @PathVariable Long id,
            @Valid @RequestBody EmailSignatureDefaultRequest request
    ) {
        return ResponseEntity.ok(
                service.setDefaultForReplies(
                        userId,
                        id,
                        request.getEnabled()
                )
        );
    }

    // =====================================================
    // DELETE SIGNATURE - SOFT DELETE
    // =====================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @RequestParam Long userId,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                service.delete(userId, id)
        );
    }
}