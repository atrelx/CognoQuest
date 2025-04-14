package org.example.cognoquest.exception;

public class OAuth2AuthenticationProcessingException extends RuntimeException {
    private static final long serialVersionUID = 1L;

    public OAuth2AuthenticationProcessingException(String message) {
        super(message);
    }

    public OAuth2AuthenticationProcessingException(String message, Throwable cause) {
        super(message, cause);
    }
}
