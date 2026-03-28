# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fullstack Todo application with React frontend (port 3000) and Spring Boot backend (port 8080), using PostgreSQL and JWT authentication.

## Commands

### Backend
```bash
cd backend
mvn spring-boot:run        # Run development server
mvn clean package           # Build JAR
java -jar target/todo-backend-1.0.0.jar  # Run JAR
```

### Frontend
```bash
cd frontend
npm install                 # Install dependencies
npm start                   # Run development server (port 3000)
npm run build               # Production build
```

### Database
- PostgreSQL database `todoapp` on `localhost:5432`
- JPA auto-creates tables (`spring.jpa.hibernate.ddl-auto=update`)

## Architecture

### Backend (Spring Boot 3.2 / Java 17)
- **Authentication**: Spring Security + JWT (24h expiration, BCrypt password hashing)
- **Flow**: JwtAuthenticationFilter → SecurityConfig → Controllers
- **API prefix**: `/api/auth/*` (public), `/api/tasks/*` (protected)
- **Key packages**:
  - `security/` - JwtTokenProvider, JwtAuthenticationFilter, CustomUserDetailsService
  - `config/` - SecurityConfig, CorsConfig
  - `model/` - User, Task JPA entities (Task has `user_id` foreign key)
  - `service/` - AuthService, TaskService
  - `exception/` - Custom exceptions with GlobalExceptionHandler

### Frontend (React 18)
- **State**: AuthContext (login/logout/user), TaskContext (CRUD operations)
- **Routing**: React Router v6 (Login, Register, Dashboard routes)
- **API**: Axios with JWT interceptor (Authorization: Bearer header)
- **Styling**: Component-scoped CSS files

### Security Model
- JWT tokens stored in localStorage
- Tasks are user-scoped (user_id FK), backend filters by authenticated user
- CORS allowed for `http://localhost:3000` only

## Configuration

| File | Purpose |
|------|---------|
| `backend/src/main/resources/application.properties` | DB connection, JWT secret, CORS origins |
| `frontend/src/services/api.js` | Base API URL (`http://localhost:8080`) |

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register user |
| POST | `/api/auth/login` | No | Login, returns JWT |
| GET | `/api/auth/me` | Yes | Get current user |
| GET | `/api/tasks` | Yes | Get user's tasks |
| POST | `/api/tasks` | Yes | Create task |
| PUT | `/api/tasks/{id}` | Yes | Update task |
| DELETE | `/api/tasks/{id}` | Yes | Delete task |
| PATCH | `/api/tasks/{id}/complete` | Yes | Toggle completion |
