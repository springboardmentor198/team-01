package com.realestate.duediligence.exception;

import org.springframework.http.HttpStatus;

/**
 * Thrown when a call to an external/third-party service fails
 * (Google OAuth, land registry, flood zone API, GIS/mapping services, etc.).
 * Mapped to 502 so clients can distinguish "our bug" from "their outage".
 */
public class ExternalServiceException extends ApiException {

    public ExternalServiceException(String message) {
        super(message, HttpStatus.BAD_GATEWAY);
    }

    public ExternalServiceException(String message, Throwable cause) {
        super(message, HttpStatus.BAD_GATEWAY, cause);
    }
}
