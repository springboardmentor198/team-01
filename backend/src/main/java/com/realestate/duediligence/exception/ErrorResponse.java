package com.realestate.duediligence.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.Map;


@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {

    private LocalDateTime timestamp;
    private int status;
    private String error;      // e.g. "NOT_FOUND", "VALIDATION_FAILED"
    private String message;    // human-readable message
    private String path;       // request URI that triggered the error

    /** Only populated for validation errors: field name -> problem message. */
    private Map<String, String> validationErrors;

    private String traceId;
}
