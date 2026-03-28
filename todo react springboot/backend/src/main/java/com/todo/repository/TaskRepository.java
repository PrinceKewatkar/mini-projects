package com.todo.repository;

import com.todo.model.Task;
import com.todo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * Repository for Task entity operations
 *
 * Provides standard CRUD operations plus custom queries
 * for filtering and searching tasks by user.
 */
@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    /**
     * Find all tasks for a specific user
     * Returns tasks ordered by creation date (newest first)
     *
     * @param user The user whose tasks to retrieve
     * @return List of tasks belonging to the user
     */
    List<Task> findByUserOrderByCreatedAtDesc(User user);

    /**
     * Find all tasks for a user filtered by completion status
     *
     * @param user The user whose tasks to retrieve
     * @param completed Whether to find completed or non-completed tasks
     * @return List of tasks matching the criteria
     */
    List<Task> findByUserAndCompletedOrderByCreatedAtDesc(User user, Boolean completed);

    /**
     * Find a specific task by ID and user
     * Ensures users can only access their own tasks
     *
     * @param id The task ID
     * @param user The user who owns the task
     * @return Optional containing the task if found and owned by user
     */
    Optional<Task> findByIdAndUser(Long id, User user);

    /**
     * Delete a task by ID and user
     * Ensures users can only delete their own tasks
     *
     * @param id The task ID to delete
     * @param user The user who owns the task
     * @return Number of deleted rows (0 or 1)
     */
    int deleteByIdAndUser(Long id, User user);

    /**
     * Count tasks by user and completion status
     * Used to show task counts in UI
     *
     * @param user The user whose tasks to count
     * @param completed Completion status to filter by
     * @return Number of matching tasks
     */
    long countByUserAndCompleted(User user, Boolean completed);

    /**
     * Custom JPQL query to find overdue tasks for a user
     * Returns tasks that are not completed and have a due date before today
     *
     * @param user The user whose tasks to search
     * @return List of overdue tasks
     */
    @Query("SELECT t FROM Task t WHERE t.user = :user AND t.completed = false AND t.dueDate < CURRENT_DATE")
    List<Task> findOverdueTasks(@Param("user") User user);

    /**
     * Find tasks by user filtered by priority
     *
     * @param user The user whose tasks to retrieve
     * @param priority The priority level to filter by
     * @return List of tasks with the specified priority
     */
    List<Task> findByUserAndPriorityOrderByCreatedAtDesc(User user, Task.Priority priority);
}
