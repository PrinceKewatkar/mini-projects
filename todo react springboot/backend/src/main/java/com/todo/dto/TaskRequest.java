package com.todo.dto;

import com.todo.model.Task;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

/**
 * DTO for task creation and update requests
 *
 * Contains validation rules for all task fields.
 * Used for both creating new tasks and updating existing ones.
 */
public class TaskRequest {

    @NotBlank(message = "Title is required")
    @Size(min = 1, max = 200, message = "Title must be between 1 and 200 characters")
    private String title;

    private String description;

    /**
     * Priority level: LOW, MEDIUM, HIGH
     * Defaults to MEDIUM if not specified
     */
    private Task.Priority priority = Task.Priority.MEDIUM;

    /**
     * Optional due date for the task
     * Must be today or a future date
     * Can be null if no due date
     */
    private LocalDate dueDate;

    // Constructors
    public TaskRequest() {}

    public TaskRequest(String title, String description, Task.Priority priority, LocalDate dueDate) {
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.dueDate = dueDate;
    }

    // Getters and Setters
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Task.Priority getPriority() {
        return priority;
    }

    public void setPriority(Task.Priority priority) {
        this.priority = priority;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }
}
