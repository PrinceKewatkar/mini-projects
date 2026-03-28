package com.todo.service;

import com.todo.dto.AuthResponse;
import com.todo.dto.LoginRequest;
import com.todo.dto.RegisterRequest;
import com.todo.dto.UserDTO;
import com.todo.exception.BadRequestException;
import com.todo.exception.DuplicateResourceException;
import com.todo.model.User;
import com.todo.repository.UserRepository;
import com.todo.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Authentication Service
 *
 * Handles user registration, login, and authentication-related operations.
 * Uses BCrypt for password hashing and JWT for session management.
 */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider,
                       AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.authenticationManager = authenticationManager;
    }

    /**
     * Register a new user
     *
     * Validates uniqueness of username and email,
     * hashes the password, and creates the user.
     *
     * @param request Registration data
     * @return AuthResponse with JWT token
     * @throws DuplicateResourceException if username/email already exists
     * @throws BadRequestException if passwords don't match
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Check if passwords match
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }

        // Check if username already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("User", "username", request.getUsername());
        }

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("User", "email", request.getEmail());
        }

        // Create new user with hashed password
        User user = new User(
                request.getUsername(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword())
        );

        // Save user to database
        User savedUser = userRepository.save(user);

        // Generate JWT token for the new user
        String token = jwtTokenProvider.generateToken(new java.util.HashMap<>(), savedUser.getUsername());

        // Return auth response
        return new AuthResponse(
                token,
                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getEmail()
        );
    }

    /**
     * Authenticate a user and generate JWT token
     *
     * @param request Login credentials
     * @return AuthResponse with JWT token
     * @throws BadRequestException if authentication fails
     */
    public AuthResponse login(LoginRequest request) {
        try {
            // Authenticate using Spring Security
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );

            // Set authentication in security context
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Find the user to get their details
            User user = userRepository.findByUsernameOrEmail(request.getUsername(), request.getUsername())
                    .orElseThrow(() -> new BadRequestException("User not found"));

            // Generate JWT token
            String token = jwtTokenProvider.generateToken(new java.util.HashMap<>(), user.getUsername());

            // Return auth response
            return new AuthResponse(
                    token,
                    user.getId(),
                    user.getUsername(),
                    user.getEmail()
            );

        } catch (org.springframework.security.core.AuthenticationException e) {
            throw new BadRequestException("Invalid username/email or password");
        }
    }

    /**
     * Get current authenticated user's information
     *
     * @return UserDTO with current user's details
     */
    public UserDTO getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BadRequestException("Not authenticated");
        }

        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BadRequestException("User not found"));

        return new UserDTO(user.getId(), user.getUsername(), user.getEmail());
    }
}
