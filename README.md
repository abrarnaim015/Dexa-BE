# Dexa Attendance Backend

Backend service for employee attendance management built with NestJS.

This project was developed as part of a technical test with a focus on:

- Stability
- Clear business rules
- Clean and controlled backend architecture
- Non-breaking, incremental feature delivery

---

## Tech Stack

- Node.js v20
- npm v9
- NestJS v8
- TypeORM
- MySQL
- JWT Authentication
- bcrypt (password hashing)

---

## Project Overview

This backend provides:

- User authentication (login & admin-only registration)
- Role-based access control (EMPLOYEE & ADMIN)
- Attendance management (check-in / check-out)
- Admin attendance monitoring
- User self-service profile update
- Admin user management
- JWT-protected APIs
- Audit logging via mocked message queue
- Soft delete support on all tables

The implementation intentionally focuses on the required scope of the technical test and avoids over-engineering.

---

## Architecture Overview

- Monolithic backend with module-based separation (microservice-style)
- Modules:
  - AuthModule
  - UsersModule
  - AttendanceModule
  - AuditModule
  - QueueModule (mocked)
- Clear separation of concerns:
  - Entity
  - Service
  - Controller
- Controlled, step-by-step extension without breaking existing APIs

---

## Database Design

Tables:

- users
- attendances
- audit_logs

Rules:

- All tables implement soft delete using `deletedAt`
- TypeORM `synchronize` is enabled for development only

User roles:

- EMPLOYEE
- ADMIN

---

## Attendance Business Rules

- Check-in can only be done once per day
- Check-out must be done after check-in
- Check-out can only be done once
- No handling for forgotten check-out (out of scope)
- Attendance data is always tied to the authenticated user (JWT)

---

## Requirements

- Node.js v20
- npm v9
- MySQL running locally

---

## Installation & Setup

### 1. Install dependencies

    npm install

### 2. Environment variables

Create a file `.env` in the project root (`Dexa-BE/.env`):

    DB_HOST=127.0.0.1
    DB_PORT=3306
    DB_USERNAME=
    DB_PASSWORD=
    DB_NAME=
    JWT_SECRET=
    NODE_ENV=development

Notes:

- TypeORM synchronize is enabled only for development

### 3. Run application

    npm run start:dev

Expected output:

    Nest application successfully started

---

## Admin Seeder

An admin account is automatically created in development mode only.

Default admin credentials:

- Email: admin@mail.com
- Password: admin123
- Role: ADMIN

Seeder behavior:

- Runs only when `NODE_ENV=development`
- Creates admin only if it does not already exist

---

## Authentication API

### Login

Endpoint:

    POST /auth/login

Response:

    {
      "meta": {
        "status": "success",
        "message": "Login successful"
      },
      "data": {
        "access_token": "JWT_TOKEN"
      },
      "errors": []
    }

Notes:

- Login is available for all users
- Returned access token must be used for authenticated requests

---

### Register (ADMIN ONLY)

Endpoint:

    POST /auth/register

Authorization:

- Required
- Bearer JWT token
- User role MUST be ADMIN

Response:

    {
      "meta": {
        "status": "success",
        "message": "User registered successfully"
      },
      "data": {
        "id": 8,
        "name": "Test User",
        "email": "test@mail.com",
        "role": "EMPLOYEE",
        "createdAt": "2026-02-25T21:00:47.985Z",
        "updatedAt": "2026-02-25T21:00:47.985Z"
      },
      "errors": []
    }

Important Rules:

- Public user registration is DISABLED
- Only ADMIN users can access this endpoint
- This endpoint ALWAYS creates EMPLOYEE users
- Creating ADMIN users via API is NOT allowed
- ADMIN accounts are created only via seeder

---

## User Profile API (JWT Required)

### Update My Profile

Endpoint:

    PUT /users/me

Capabilities:

- Update phone number
- Update password (with old password validation)

Rules:

- User can update ONLY their own data
- Old password must be provided to change password
- Password is always hashed
- Password is never returned in response

---

## User Management API (ADMIN ONLY)

### Get Users

Endpoint:

    GET /users

Optional query params:

- name
- id

Returns:

- List of users (basic info only)
- Password is never exposed

---

### Update User

Endpoint:

    PUT /users/:id

Rules:

- ADMIN ONLY
- Can update basic user info (e.g. name, phone number)
- Cannot update password via this endpoint

---

## Attendance API (JWT Required)

### Check-in

    POST /attendance/check-in

Rules:

- Can only be done once per day
- Returns error if already checked in

---

### Check-out

    POST /attendance/check-out

Rules:

- Must have checked in first
- Cannot check out more than once

---

### Get My Attendance

    GET /attendance/me

Returns:

- Attendance records of the authenticated user
- Sorted by date (latest first)

---

## Attendance Monitoring (ADMIN ONLY)

### Get All Attendance Records

Endpoint:

    GET /attendance

Optional query params:

- date=YYYY-MM-DD
- userId

Rules:

- Read-only
- Returns attendance records for all users
- Includes basic user info (id, name, email)

---

## Audit Logging

- Audit logging is implemented asynchronously
- Uses a mocked message queue concept
- Does not block core business logic

---

## Message Queue (Mocked RabbitMQ Concept)

This project implements a mocked message queue to demonstrate event-driven architecture.

Design approach:

- No RabbitMQ server is installed
- Queue is simulated using an in-memory async publisher-consumer
- Focus is on architectural understanding, not infrastructure

Flow example:

Attendance action  
→ Publish event  
→ Mocked QueueService  
→ Audit consumer  
→ Save record to `audit_logs` table

This fulfills the requirement:
“Message queue implemented using RabbitMQ concept (simple / mocked)”

---

## Error Handling

- Authentication errors return HTTP 401
- Authorization errors return HTTP 403
- Invalid business rules return HTTP 400
- Clear and explicit error messages
- No generic `throw new Error` usage

---

## Security Notes

- Passwords are hashed using bcrypt
- JWT payload contains:
  - userId
  - role
- Admin accounts cannot be registered publicly

---

## Out of Scope (Intentional)

- Refresh token
- Email verification
- Forgot password
- Unit or e2e testing
- Production migration strategy

These features can be added later if required.

---

## How to Test (Quick Guide)

1. Start MySQL service
2. Run backend using `npm run start:dev`
3. Login as admin or employee
4. Use Postman:
   - Login to get JWT token
   - Set Authorization header
   - Test profile update, attendance, and admin endpoints

---

## Notes for Reviewer

- Backend is developed incrementally with non-breaking changes
- Core requirements are implemented first
- Extensions are clearly separated and controlled
- Clean module boundaries and readable business logic
- Ready to be extended to real message queue infrastructure

---

## Author

Technical test implementation for Dexa
