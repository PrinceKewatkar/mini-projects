package com.todo.controller;

import com.todo.dto.TaskRequest;
import com.todo.dto.TaskResponse;
import com.todo.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Task REST Controller
 *
 * Handles all task CRUD operations.
 * All endpoints require authentication (JWT token).
 */
@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "http://localhost:3000")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    /**
     * Get all tasks for the authenticated user
     *
     * GET /api/tasks
     *
     * Optional query params:
     * - completed: filter by completion status (true/false)
     *
     * @param completed Optional filter by completion status
     * @return List of tasks
     */
    @GetMapping
    public ResponseEntity<List<TaskResponse>> getAllTasks(
            @RequestParam(required = false) Boolean completed) {

        List<TaskResponse> tasks;
        if (completed != null) {
            tasks = taskService.getTasksByCompletion(completed);
        } else {
            tasks = taskService.getAllTasks();
        }
        return ResponseEntity.ok(tasks);
    }

    /**
     * Get a specific task by ID
     *
     * GET /api/tasks/{id}
     *
     * @param id The task ID
     * @return The task details
     *
     * Edge cases:
     * - Task not found -> 404 Not Found
     * - Task belongs to another user -> 404 Not Found (security)
     */
    @GetMapping("/{id}")
    public ResponseEntity<TaskResponse> getTaskById(@PathVariable Long id) {
        TaskResponse task = taskService.getTaskById(id);
        return ResponseEntity.ok(task);
    }

    /**
     * Create a new task
     *
     * POST /api/tasks
     *
     * @param request Task creation data
     * @return The created task with 201 Created status
     *
     * Edge cases:
     * - Title empty -> 400 Bad Request
     * - Due date in past -> 400 Bad Request
     * - Validation errors -> 400 Bad Request
     */
    @PostMapping
    public ResponseEntity<TaskResponse> createTask(@Valid @RequestBody TaskRequest request) {
        TaskResponse task = taskService.createTask(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(task);
    }

    /**
     * Update an existing task
     *
     * PUT /api/tasks/{id}
     *
     * @param id The task ID to update
     * @param request Updated task data
     * @return The updated task
     *
     * Edge cases:
     * - Task not found -> 404 Not Found
     * - Due date in past -> 400 Bad Request
     * - Validation errors -> 400 Bad Request
     */
    @PutMapping("/{id}")
    public ResponseEntity<TaskResponse> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody TaskRequest request) {

        TaskResponse task = taskService.updateTask(id, request);
        return ResponseEntity.ok(task);
    }

    /**
     * Delete a task
     *
     * DELETE /api/tasks/{id}
     *
     * @param id The task ID to delete
     * @return 204 No Content on success
     *
     * Edge cases:
     * - Task not found -> 404 Not Found
     * - Task belongs to another user -> 404 Not Found (security)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Toggle task completion status
     *
     * PATCH /api/tasks/{id}/complete
     *
     * @param id The task ID to toggle
     * @return The updated task with toggled status
     *
     * Edge cases:
     * - Task not found -> 404 Not Found
     */
    @PatchMapping("/{id}/complete")
    public ResponseEntity<TaskResponse> toggleTaskCompletion(@PathVariable Long id) {
        TaskResponse task = taskService.toggleTaskCompletion(id);
        return ResponseEntity.ok(task);
    }

    /**
     * Get overdue tasks for the authenticated user
     *
     * GET /api/tasks/overdue
     *
     * @return List of overdue tasks (not completed, due date before today)
     */
    @GetMapping("/overdue")
    public ResponseEntity<List<TaskResponse>> getOverdueTasks() {
        List<TaskResponse> tasks = taskService.getOverdueTasks();
        return ResponseEntity.ok(tasks);
    }

    /**
     * Get task counts
     *
     * GET /api/tasks/count
     *
     * Optional query params:
     * - completed: count only completed or only active tasks
     *
     * @param completed Optional filter
     * @return Count of matching tasks
     */
    @GetMapping("/count")
    public ResponseEntity<Long> getTaskCount(@RequestParam(required = false) Boolean completed) {
        long count = taskService.getTaskCount(completed);
        return ResponseEntity.ok(count);
    }
}
