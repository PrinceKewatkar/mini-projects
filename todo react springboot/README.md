# Fullstack Todo Application

A complete fullstack todo application with React frontend and Spring Boot backend, using PostgreSQL for data persistence and JWT for authentication.

## Features

- **User Authentication**
  - User registration with validation
  - User login with JWT tokens
  - Secure password hashing (BCrypt)
  - Auto-redirect on token expiration

- **Task Management**
  - Create new tasks with title, description, priority, and due date
  - View all tasks with filtering (All/Active/Completed)
  - Edit existing tasks
  - Delete tasks with confirmation
  - Toggle task completion status
  - Priority levels (LOW, MEDIUM, HIGH)
  - Due date tracking with overdue warnings

- **Edge Cases Handled**
  - Duplicate username/email registration
  - Invalid login credentials
  - Empty/invalid form fields
  - Past due date prevention
  - Task not found handling
  - Network error handling
  - Loading and empty states

## Tech Stack

### Backend
- Java 25
- Spring Boot 3.2
- Spring Security with JWT
- Spring Data JPA
- PostgreSQL
- Validation (Jakarta Bean Validation)

### Frontend
- React 19
- React Router v6
- Axios (HTTP client)
- Context API (state management)
- CSS (styling)

## Project Structure

```
todo-app/
├── backend/
│   ├── src/main/java/com/todo/
│   │   ├── config/          # Security, CORS config
│   │   ├── controller/      # REST controllers
│   │   ├── dto/             # Data transfer objects
│   │   ├── exception/       # Custom exceptions & handlers
│   │   ├── model/           # JPA entities
│   │   ├── repository/      # JPA repositories
│   │   ├── security/        # JWT filter, token provider
│   │   └── service/         # Business logic
│   └── src/main/resources/
│       └── application.properties
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/      # Reusable UI components
│       ├── context/         # Auth, Task context providers
│       ├── pages/           # Page components
│       ├── services/        # API calls
│       └── styles/          # CSS files
└── README.md
```

## Setup Instructions

### Prerequisites

- Java 17 or higher
- Node.js 16 or higher
- PostgreSQL 13 or higher

### Database Setup

1. **Install PostgreSQL** if not already installed

2. **Create a database**:
   ```sql
   CREATE DATABASE todoapp;
   ```

3. **Create a user** (optional - you can use postgres user):
   ```sql
   CREATE USER postgres WITH PASSWORD 'postgres';
   GRANT ALL PRIVILEGES ON DATABASE todoapp TO postgres;
   ```

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. **Configure database connection** in `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/todoapp
   spring.datasource.username=postgres
   spring.datasource.password=postgres
   ```

3. **Build and run**:
   ```bash
   # Using Maven
   mvn spring-boot:run

   # Or build a JAR and run
   mvn clean package
   java -jar target/todo-backend-1.0.0.jar
   ```

   The backend will start on `http://localhost:8080`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

   The frontend will start on `http://localhost:3000`

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and get JWT |
| GET | `/api/auth/me` | Get current user info |

### Tasks (Requires JWT)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Get all tasks |
| GET | `/api/tasks?completed=true/false` | Get filtered tasks |
| GET | `/api/tasks/{id}` | Get single task |
| POST | `/api/tasks` | Create new task |
| PUT | `/api/tasks/{id}` | Update task |
| DELETE | `/api/tasks/{id}` | Delete task |
| PATCH | `/api/tasks/{id}/complete` | Toggle completion |
| GET | `/api/tasks/overdue` | Get overdue tasks |

## Usage Flow

1. **Register**: Create a new account on the registration page
2. **Login**: Login with your credentials
3. **Create Task**: Fill in the task form at the top of the dashboard
4. **Manage Tasks**:
   - Click checkbox to mark complete/incomplete
   - Click pencil icon to edit a task
   - Click trash icon to delete (with confirmation)
5. **Filter**: Use tabs to filter by All/Active/Completed
6. **Logout**: Click the logout button in the header

## Security Features

- Passwords hashed with BCrypt (strength 10)
- JWT tokens with 24-hour expiration
- CORS configured for frontend origin
- SQL injection prevention via JPA
- Users can only access their own tasks

## Error Handling

The application handles various edge cases:

- **Registration Errors**:
  - Duplicate username → "Username already taken"
  - Duplicate email → "Email already registered"
  - Password mismatch → "Passwords do not match"

- **Login Errors**:
  - Invalid credentials → "Invalid username/email or password"

- **Task Errors**:
  - Empty title → "Title is required"
  - Past due date → "Due date cannot be in the past"
  - Task not found → "Task not found"