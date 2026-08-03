package com.realestate.duediligence.exception;

public class ConflictException extends RuntimeException {

    public ConflictException(String resourceName, String reason) {
        super(resourceName + " conflict: " + reason);
    }

    public ConflictException(String message) {
        super(message);
    }
}
