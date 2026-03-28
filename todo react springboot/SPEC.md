# Fullstack Todo Application Specification

## Project Overview
- **Project Name**: Todo App
- **Type**: Fullstack Web Application (React + Spring Boot + PostgreSQL)
- **Core Functionality**: User authentication with JWT + complete task management (CRUD)
- **Target Users**: Individual users managing personal tasks

---

## Technical Stack

### Backend
- **Framework**: Spring Boot 3.x
- **Language**: Java 17
- **Security**: Spring Security with JWT
- **Database**: PostgreSQL
- **ORM**: Spring Data JPA / Hibernate
- **Validation**: Jakarta Validation
- **Build Tool**: Maven

### Frontend
- **Framework**: React 18
- **Language**: JavaScript
- **Styling**: CSS
- **HTTP Client**: Axios
- **State Management**: React Context + useReducer
- **Routing**: React Router v6

---

## Database Schema

### Users Table
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGSERIAL | PRIMARY KEY |
| username | VARCHAR(50) | UNIQUE, NOT NULL |
| email | VARCHAR(100) | UNIQUE, NOT NULL |
| password | VARCHAR(255) | NOT NULL |
| created_at | TIMESTAMP | DEFAULT NOW() |

### Tasks Table
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGSERIAL | PRIMARY KEY |
| title | VARCHAR(200) | NOT NULL |
| description | TEXT | NULLABLE |
| completed | BOOLEAN | DEFAULT FALSE |
| priority | VARCHAR(20) | DEFAULT 'MEDIUM' |
| due_date | DATE | NULLABLE |
| user_id | BIGINT | FOREIGN KEY (users.id), NOT NULL |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | DEFAULT NOW() |

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login and get JWT |
| GET | /api/auth/me | Get current user info |

### Tasks (Protected - requires JWT)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/tasks | Get all tasks for user |
| GET | /api/tasks/{id} | Get single task |
| POST | /api/tasks | Create new task |
| PUT | /api/tasks/{id} | Update task |
| DELETE | /api/tasks/{id} | Delete task |
| PATCH | /api/tasks/{id}/complete | Toggle complete status |

---

## Functionality Specification

### Authentication Features
1. **User Registration**
   - Username (3-50 chars, alphanumeric)
   - Email (valid email format)
   - Password (min 6 characters)
   - Confirm password (must match)
   - Validation errors displayed inline
   - Auto-login after successful registration

2. **User Login**
   - Username/email and password
   - JWT token stored in localStorage
   - Remember me option
   - Error handling for invalid credentials

3. **Session Management**
   - JWT token sent in Authorization header
   - Auto-redirect to login when token expires
   - Logout clears token and redirects

### Task Management Features
1. **Create Task**
   - Title (required, 1-200 chars)
   - Description (optional)
   - Priority: LOW, MEDIUM, HIGH
   - Due date (optional, must be today or future)

2. **View Tasks**
   - List all tasks sorted by created_at desc
   - Filter by: All, Active, Completed
   - Sort by: Created date, Priority, Due date
   - Show task count badges

3. **Edit Task**
   - Inline edit for title
   - Modal edit for full details
   - Only owner can edit their tasks

4. **Complete/Uncomplete Task**
   - Toggle checkbox to mark complete
   - Visual strikethrough for completed
   - Filter to show only completed/active

5. **Delete Task**
   - Confirmation dialog before delete
   - Only owner can delete

### Edge Cases & Error Handling
1. **Authentication Errors**
   - Invalid credentials: "Invalid username/email or password"
   - Username exists: "Username already taken"
   - Email exists: "Email already registered"
   - Token expired: Auto-redirect to login

2. **Task Errors**
   - Task not found: "Task not found or access denied"
   - Validation errors: Inline field-level errors
   - Network error: Toast notification with retry option

3. **UI Edge Cases**
   - Empty task list: Show "No tasks yet" illustration
   - Empty filter results: Show "No tasks match filter"
   - Long task titles: Truncate with ellipsis
   - Loading states: Spinner during API calls

---

## Security Considerations
- Passwords hashed with BCrypt
- JWT tokens with 24h expiration
- CORS configured for frontend origin
- SQL injection prevention via JPA
- XSS prevention via React escaping

---

## Project Structure

```
todo-app/
├── backend/                 # Spring Boot application
│   ├── src/main/java/com/todo/
│   │   ├── config/         # Security, CORS config
│   │   ├── controller/     # REST controllers
│   │   ├── dto/            # Data transfer objects
│   │   ├── exception/      # Custom exceptions
│   │   ├── model/          # JPA entities
│   │   ├── repository/     # JPA repositories
│   │   ├── security/       # JWT filter, util
│   │   └── service/        # Business logic
│   └── src/main/resources/
│       └── application.properties
├── frontend/               # React application
│   ├── public/
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── context/        # Auth, Task context
│       ├── pages/          # Page components
│       ├── services/       # API calls
│       └── styles/         # CSS files
└── README.md
```
