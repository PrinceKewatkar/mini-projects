package com.todo.repository;

import com.todo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/**
 * Repository for User entity operations
 *
 * Provides standard CRUD operations plus custom find methods.
 * Uses Optional to handle cases where user may not be found.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Find a user by username
     * Used during authentication
     *
     * @param username The username to search for
     * @return Optional containing the user if found
     */
    Optional<User> findByUsername(String username);

    /**
     * Find a user by email
     * Used during registration to check for duplicates
     *
     * @param email The email to search for
     * @return Optional containing the user if found
     */
    Optional<User> findByEmail(String email);

    /**
     * Check if a username already exists
     * More efficient than finding the full user
     *
     * @param username The username to check
     * @return true if username exists
     */
    boolean existsByUsername(String username);

    /**
     * Check if an email already exists
     * More efficient than finding the full user
     *
     * @param email The email to check
     * @return true if email exists
     */
    boolean existsByEmail(String email);

    /**
     * Find a user by username OR email
     * Allows login with either credential
     *
     * @param username The username to search for
     * @param email The email to search for
     * @return Optional containing the user if found with either
     */
    Optional<User> findByUsernameOrEmail(String username, String email);
}
