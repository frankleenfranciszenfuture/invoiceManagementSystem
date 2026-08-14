package com.ims.exception;

import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import com.ims.common.ApiResponse;
import jakarta.validation.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;

import org.springframework.web.HttpMediaTypeNotSupportedException;

import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.server.ResponseStatusException;

import java.nio.file.AccessDeniedException;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Resource Not Found
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleResourceNotFound(
            ResourceNotFoundException ex) {

        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage(), null);
    }

    /**
     * Duplicate Resource
     */
    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ApiResponse<Object>> handleDuplicate(
            DuplicateResourceException ex) {

        return buildResponse(HttpStatus.CONFLICT, ex.getMessage(), null);
    }

    /**
     * Bad Request
     */
    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiResponse<Object>> handleBadRequest(
            BadRequestException ex) {

        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), null);
    }

    /**
     * ResponseStatusException
     */
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiResponse<Object>> handleResponseStatusException(
            ResponseStatusException ex) {

        HttpStatus status = HttpStatus.valueOf(ex.getStatusCode().value());

        return buildResponse(status, ex.getReason(), null);
    }

    /**
     * Bean Validation (@Valid)
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidation(
            MethodArgumentNotValidException ex) {

        Map<String, String> errors = new HashMap<>();

        ex.getBindingResult()
                .getFieldErrors()
                .forEach(error ->
                        errors.put(error.getField(), error.getDefaultMessage()));

        ApiResponse<Map<String, String>> response =
                ApiResponse.<Map<String, String>>builder()
                        .success(false)
                        .message("validation failed.")
                        .data(errors)
                        .timestamp(LocalDateTime.now())
                        .build();

        return ResponseEntity.badRequest().body(response);
    }

    /**
     * Constraint Validation
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Object>> handleConstraintValidation(
            ConstraintViolationException ex) {

        return buildResponse(
                HttpStatus.BAD_REQUEST,
                ex.getMessage(),
                null
        );
    }

    /**
     * Illegal Argument
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalArgument(
            IllegalArgumentException ex) {

        return ResponseEntity.badRequest().body(
                ApiResponse.failure(
                        ex.getMessage()
                )
        );
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiResponse<Void>> handleMissingServletRequestParameter(
            MissingServletRequestParameterException ex) {

        String message;

        if ("keyword".equals(ex.getParameterName())) {
            message = "Search keyword is required.";
        } else {
            message = String.format(
                    "Required request parameter '%s' is missing.",
                    ex.getParameterName()
            );
        }

        return ResponseEntity.badRequest().body(
                ApiResponse.failure(
                        ex.getMessage()
                )
        );
    }

    /**
     * File Upload Size
     */
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiResponse<Object>> handleMaxUploadSize(
            MaxUploadSizeExceededException ex) {

        return buildResponse(
                HttpStatus.BAD_REQUEST,
                "File size exceeds the maximum allowed limit.",
                null
        );
    }

    /**
     * Catch All Exception
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleException(
            Exception ex) {

        ex.printStackTrace(); // Remove or replace with logger in production

        return buildResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Something went wrong.",
                null
        );
    }

    /**
     * Common Response Builder
     */
    private <T> ResponseEntity<ApiResponse<T>> buildResponse(
            HttpStatus status,
            String message,
            T data) {

        ApiResponse<T> response = ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.status(status).body(response);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<?>> handleHttpMessageNotReadable(
            HttpMessageNotReadableException ex) {

        String message = "Invalid request body.";

        // Handle invalid enum values (AccountType)
        if (ex.getMessage() != null && ex.getMessage().contains("AccountType")) {
            message = "Invalid account type. Allowed values: SAVINGS, CURRENT, SALARY, FIXED_DEPOSIT, NRE, NRO";
        } else {
            Throwable cause = ex.getCause();

            if (cause instanceof InvalidFormatException invalidFormatException) {

                String field = invalidFormatException.getPath().isEmpty()
                        ? "unknown"
                        : invalidFormatException.getPath().get(0).getFieldName();

                Object value = invalidFormatException.getValue();

                message = String.format(
                        "Invalid value '%s' for field '%s'.",
                        value,
                        field
                );
            } else if (ex.getMessage() != null &&
                    ex.getMessage().contains("Required request body is missing")) {
                message = "Request body is missing.";
            }
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.failure(message));
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiResponse<Object>> handleMethodNotSupported(
            HttpRequestMethodNotSupportedException ex) {

        String message = String.format(
                "HTTP method '%s' is not supported. Supported method(s): %s",
                ex.getMethod(),
                ex.getSupportedHttpMethods()
        );

        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED)
                .body(ApiResponse.failure(message));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Object>> handleMethodArgumentTypeMismatch(
            MethodArgumentTypeMismatchException ex) {

        String message;

        if (ex.getRequiredType() != null && ex.getRequiredType().isEnum()) {

            String allowedValues = Arrays.stream(ex.getRequiredType().getEnumConstants())
                    .map(Object::toString)
                    .collect(Collectors.joining(", "));

            message = String.format(
                    "Invalid %s '%s'. Allowed values are: %s",
                    ex.getName(),
                    ex.getValue(),
                    allowedValues
            );

        } else {
            message = String.format(
                    "Invalid value '%s' for parameter '%s'",
                    ex.getValue(),
                    ex.getName()
            );
        }

        return ResponseEntity.badRequest().body(
                ApiResponse.failure(message)
        );
    }


    /**
     * Validation erros Handleing
     */
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ApiResponse<Object>> handleValidationException(
            ValidationException ex) {

        return ResponseEntity.badRequest().body(
                ApiResponse.failure(ex.getMessage())
        );
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ApiResponse<Void>> handleHttpMediaTypeNotSupported(
            HttpMediaTypeNotSupportedException ex) {

        String message = "Unsupported Content-Type. Please use 'application/json'.";

        return ResponseEntity
                .status(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
                .body(ApiResponse.failure(ex.getMessage()
                ));
    }


    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Object>> handleDataIntegrityViolation(
            DataIntegrityViolationException ex) {

        String message = "Database constraint violation.";

        Throwable rootCause = ex.getMostSpecificCause();

        if (rootCause != null && rootCause.getMessage() != null) {

            String error = rootCause.getMessage();

            if (error.contains("Duplicate entry")) {

                if (error.contains("categories")) {
                    message = "Category name already exists.";
                } else if (error.contains("sub_categories")) {
                    message = "Sub Category already exists.";
                } else if (error.contains("products")) {
                    message = "Product already exists.";
                } else {
                    message = "Duplicate record already exists.";
                }
            }
        }

        return buildResponse(
                HttpStatus.CONFLICT,
                message,
                null
        );
    }


    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDeniedException(
            AccessDeniedException ex) {

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.<Void>builder()
                        .success(false)
                        .message(ex.getMessage())
                        .data(null)
                        .timestamp(LocalDateTime.now())
                        .build());
    }
}

