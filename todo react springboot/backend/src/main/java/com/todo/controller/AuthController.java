package com.todo.controller;

import com.todo.dto.*;
import com.todo.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication REST Controller
 *
 * Handles user registration and login endpoints.
 * All endpoints are public (no authentication required).
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Register a new user
     *
     * POST /api/auth/register
     *
     * @param request Registration data (username, email, password, confirmPassword)
     * @return AuthResponse with JWT token and user info
     *
     * Edge cases handled:
     * - Username already exists -> 409 Conflict
     * - Email already exists -> 409 Conflict
     * - Passwords don't match -> 400 Bad Request
     * - Validation errors -> 400 Bad Request with field errors
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Login with username/email and password
     *
     * POST /api/auth/login
     *
     * @param request Login credentials
     * @return AuthResponse with JWT token and user info
     *
     * Edge cases handled:
     * - Invalid credentials -> 401 Unauthorized
     * - Missing fields -> 400 Bad Request
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Get current authenticated user info
     *
     * GET /api/auth/me
     *
     * @return UserDTO with current user details
     * Requires: Valid JWT token in Authorization header
     */
    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser() {
        UserDTO user = authService.getCurrentUser();
        return ResponseEntity.ok(user);
    }
}
