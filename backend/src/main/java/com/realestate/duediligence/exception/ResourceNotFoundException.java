package com.realestate.duediligence.exception;

import org.springframework.http.HttpStatus;

public class ResourceNotFoundException extends ApiException {

    public ResourceNotFoundException(String message) {
        super(message, HttpStatus.NOT_FOUND);
    }

    public static ResourceNotFoundException of(String entity, Object identifier) {
        return new ResourceNotFoundException(entity + " not found with id: " + identifier);
    }
}
