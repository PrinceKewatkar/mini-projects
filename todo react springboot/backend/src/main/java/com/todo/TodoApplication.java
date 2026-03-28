package com.todo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main Spring Boot Application Entry Point
 *
 * This application is a fullstack Todo management system with:
 * - User authentication (register, login, JWT tokens)
 * - Task CRUD operations (create, read, update, delete)
 * - Task completion toggle
 * - Priority and due date management
 *
 * The app uses PostgreSQL for data persistence and Spring Security with JWT for auth.
 */
@SpringBootApplication
public class TodoApplication {

    public static void main(String[] args) {
        SpringApplication.run(TodoApplication.class, args);
    }
}
