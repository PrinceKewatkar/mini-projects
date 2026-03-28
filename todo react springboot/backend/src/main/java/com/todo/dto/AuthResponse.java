package com.todo.dto;

/**
 * DTO for authentication responses
 *
 * Contains the JWT token and basic user information
 * returned after successful login or registration.
 */
public class AuthResponse {

    private String token;
    private String type;
    private Long userId;
    private String username;
    private String email;

    // Constructor
    public AuthResponse() {
        // Default constructor for JSON serialization
    }

    /**
     * Full constructor for creating an auth response
     *
     * @param token JWT token string
     * @param userId User's database ID
     * @param username User's username
     * @param email User's email
     */
    public AuthResponse(String token, Long userId, String username, String email) {
        this.token = token;
        this.type = "Bearer"; // Standard JWT token type
        this.userId = userId;
        this.username = username;
        this.email = email;
    }

    // Getters and Setters
    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
