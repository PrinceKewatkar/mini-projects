package com.todo.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO for user login requests
 *
 * Accepts either username or email for login.
 * Password must be provided and is validated against the stored hash.
 */
public class LoginRequest {

    @NotBlank(message = "Username or email is required")
    private String username;

    @NotBlank(message = "Password is required")
    private String password;

    /**
     * Remember me flag - if true, token expiration is extended
     * Currently not implemented but available for future use
     */
    private boolean rememberMe = false;

    // Constructors
    public LoginRequest() {}

    public LoginRequest(String username, String password) {
        this.username = username;
        this.password = password;
    }

    // Getters and Setters
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public boolean isRememberMe() {
        return rememberMe;
    }

    public void setRememberMe(boolean rememberMe) {
        this.rememberMe = rememberMe;
    }
}
