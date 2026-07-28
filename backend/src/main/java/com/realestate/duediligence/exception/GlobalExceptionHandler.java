package com.realestate.duediligence.exception;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    private static final Logger log =
            LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ErrorResponse> handleApiException(
            ApiException ex,
            HttpServletRequest request) {

        HttpStatus status = ex.getStatus();

        String traceId = logAndGetTraceId(status, ex, request);

        return build(
                status,
                status.name(),
                ex.getMessage(),
                request,
                null,
                traceId
        );
    }

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex,
            HttpHeaders headers,
            HttpStatusCode status,
            WebRequest request) {

        Map<String, String> fieldErrors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .collect(Collectors.toMap(
                        fe -> fe.getField(),
                        fe -> fe.getDefaultMessage() == null
                                ? "Invalid value"
                                : fe.getDefaultMessage(),
                        (existing, replacement) -> existing
                ));

        String path = extractPath(request);
        String traceId = shortTraceId();

        log.warn("[{}] Validation failed on {}: {}", traceId, path, fieldErrors);

        ErrorResponse body = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("VALIDATION_FAILED")
                .message("One or more fields are invalid")
                .path(path)
                .validationErrors(fieldErrors)
                .traceId(traceId)
                .build();

        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolation(
            ConstraintViolationException ex,
            HttpServletRequest request) {

        Map<String, String> violations = new HashMap<>();

        ex.getConstraintViolations().forEach(v ->
                violations.put(v.getPropertyPath().toString(), v.getMessage()));

        String traceId = logAndGetTraceId(HttpStatus.BAD_REQUEST, ex, request);

        return build(
                HttpStatus.BAD_REQUEST,
                "VALIDATION_FAILED",
                "One or more parameters are invalid",
                request,
                violations,
                traceId
        );
    }

    @Override
    protected ResponseEntity<Object> handleHttpMessageNotReadable(
            HttpMessageNotReadableException ex,
            HttpHeaders headers,
            HttpStatusCode status,
            WebRequest request) {

        String path = extractPath(request);
        String traceId = shortTraceId();

        log.warn("[{}] Malformed request body on {}: {}", traceId, path, ex.getMessage());

        ErrorResponse body = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("MALFORMED_REQUEST")
                .message("Request body is missing or not valid JSON")
                .path(path)
                .traceId(traceId)
                .build();

        return ResponseEntity.badRequest().body(body);
    }

        @Override
    protected ResponseEntity<Object> handleMissingServletRequestParameter(
            MissingServletRequestParameterException ex,
            HttpHeaders headers,
            HttpStatusCode status,
            WebRequest request) {

        String path = extractPath(request);
        String traceId = shortTraceId();

        log.warn("[{}] Missing request parameter: {}", traceId, ex.getParameterName());

        ErrorResponse body = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("MISSING_PARAMETER")
                .message("Required parameter '" + ex.getParameterName() + "' is missing")
                .path(path)
                .traceId(traceId)
                .build();

        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleTypeMismatch(
            MethodArgumentTypeMismatchException ex,
            HttpServletRequest request) {

        String message = "Parameter '" + ex.getName()
                + "' should be of type "
                + (ex.getRequiredType() != null
                ? ex.getRequiredType().getSimpleName()
                : "a different type");

        String traceId = logAndGetTraceId(HttpStatus.BAD_REQUEST, ex, request);

        return build(
                HttpStatus.BAD_REQUEST,
                "TYPE_MISMATCH",
                message,
                request,
                null,
                traceId
        );
    }

    @Override
    protected ResponseEntity<Object> handleHttpRequestMethodNotSupported(
            HttpRequestMethodNotSupportedException ex,
            HttpHeaders headers,
            HttpStatusCode status,
            WebRequest request) {

        String path = extractPath(request);
        String traceId = shortTraceId();

        log.warn("[{}] Method not supported: {}", traceId, ex.getMessage());

        ErrorResponse body = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.METHOD_NOT_ALLOWED.value())
                .error("METHOD_NOT_ALLOWED")
                .message(ex.getMessage())
                .path(path)
                .traceId(traceId)
                .build();

        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body(body);
    }

    @Override
    protected ResponseEntity<Object> handleNoHandlerFoundException(
            NoHandlerFoundException ex,
            HttpHeaders headers,
            HttpStatusCode status,
            WebRequest request) {

        String path = extractPath(request);
        String traceId = shortTraceId();

        log.warn("[{}] No handler found for {} {}", traceId,
                ex.getHttpMethod(),
                ex.getRequestURL());

        ErrorResponse body = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.NOT_FOUND.value())
                .error("ROUTE_NOT_FOUND")
                .message("No endpoint " + ex.getHttpMethod()
                        + " " + ex.getRequestURL())
                .path(path)
                .traceId(traceId)
                .build();

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

        @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(
            AccessDeniedException ex,
            HttpServletRequest request) {

        String traceId = logAndGetTraceId(HttpStatus.FORBIDDEN, ex, request);

        return build(
                HttpStatus.FORBIDDEN,
                "ACCESS_DENIED",
                "You do not have permission to perform this action",
                request,
                null,
                traceId
        );
    }

    @ExceptionHandler({AuthenticationException.class, BadCredentialsException.class})
    public ResponseEntity<ErrorResponse> handleAuthenticationException(
            Exception ex,
            HttpServletRequest request) {

        String traceId = logAndGetTraceId(HttpStatus.UNAUTHORIZED, ex, request);

        return build(
                HttpStatus.UNAUTHORIZED,
                "AUTHENTICATION_FAILED",
                "Invalid credentials or session",
                request,
                null,
                traceId
        );
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorResponse> handleResponseStatusException(
            ResponseStatusException ex,
            HttpServletRequest request) {

        HttpStatus status = HttpStatus.valueOf(ex.getStatusCode().value());

        String traceId = logAndGetTraceId(status, ex, request);

        return build(
                status,
                status.name(),
                ex.getReason() != null ? ex.getReason() : status.getReasonPhrase(),
                request,
                null,
                traceId
        );
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolation(
            DataIntegrityViolationException ex,
            HttpServletRequest request) {

        String traceId = logAndGetTraceId(HttpStatus.CONFLICT, ex, request);

        return build(
                HttpStatus.CONFLICT,
                "DATA_CONFLICT",
                "This record conflicts with an existing one",
                request,
                null,
                traceId
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpected(
            Exception ex,
            HttpServletRequest request) {

        String traceId = shortTraceId();

        log.error(
                "[{}] Unhandled exception on {} {}",
                traceId,
                request.getMethod(),
                request.getRequestURI(),
                ex
        );

        return build(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "INTERNAL_SERVER_ERROR",
                "Something went wrong on our end. If this keeps happening, share reference "
                        + traceId + " with support.",
                request,
                null,
                traceId
        );
    }

    private ResponseEntity<ErrorResponse> build(
            HttpStatus status,
            String error,
            String message,
            HttpServletRequest request,
            Map<String, String> validationErrors,
            String traceId) {

        ErrorResponse body = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(status.value())
                .error(error)
                .message(message)
                .path(request.getRequestURI())
                .validationErrors(validationErrors)
                .traceId(traceId)
                .build();

        return ResponseEntity.status(status).body(body);
    }

    private String logAndGetTraceId(
            HttpStatus status,
            Exception ex,
            HttpServletRequest request) {

        String traceId = shortTraceId();

        if (status.is5xxServerError()) {
            log.error(
                    "[{}] {} {} -> {}: {}",
                    traceId,
                    request.getMethod(),
                    request.getRequestURI(),
                    status.value(),
                    ex.getMessage(),
                    ex
            );
        } else {
            log.warn(
                    "[{}] {} {} -> {}: {}",
                    traceId,
                    request.getMethod(),
                    request.getRequestURI(),
                    status.value(),
                    ex.getMessage()
            );
        }

        return traceId;
    }

    private String shortTraceId() {
        return UUID.randomUUID().toString().substring(0, 8);
    }

    private String extractPath(WebRequest request) {
        String description = request.getDescription(false);
        return description.startsWith("uri=")
                ? description.substring(4)
                : description;
    }
}
