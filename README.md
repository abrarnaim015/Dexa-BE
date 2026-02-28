# Dexa Attendance Backend (Dexa-BE)

Backend service for employee attendance management built with NestJS.
This backend is developed as part of the Dexa Fullstack Technical Test, with a strong focus on stability, clear business rules, controlled architecture, and realistic backend design decisions.

---

## 1. Overview

Dexa-BE provides a RESTful backend that supports employee attendance tracking, role-based access control, user profile management, admin monitoring features, and audit logging using a mocked message queue concept.

The backend intentionally avoids over-engineering while still demonstrating clean architecture, event-driven thinking, and extensibility.

---

## 2. Tech Stack

- Node.js v20
- npm v9
- NestJS v8
- TypeORM
- MySQL
- JWT Authentication
- bcrypt
- Cloudinary (image storage)
- dotenv

---

## 3. Core Design Principles

- Clear and explicit business rules
- Role-based access control enforced at controller level
- Modular architecture with clear separation of concerns
- Incremental, non-breaking feature delivery
- No unnecessary infrastructure dependencies
- Event-driven concept demonstrated via mocked message queue

---

## 4. Project Structure

```
Dexa-BE
.
├── README.md
├── nest-cli.json
├── package-lock.json
├── package.json
├── src
│   ├── app.controller.spec.ts
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   ├── attendance
│   │   ├── attendance.controller.ts
│   │   ├── attendance.module.ts
│   │   ├── attendance.service.spec.ts
│   │   └── attendance.service.ts
│   ├── audit
│   │   ├── audit.controller.ts
│   │   ├── audit.module.ts
│   │   ├── audit.service.spec.ts
│   │   └── audit.service.ts
│   ├── auth
│   │   ├── auth.controller.spec.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   ├── auth.service.spec.ts
│   │   ├── auth.service.ts
│   │   ├── jwt-auth.guard.ts
│   │   ├── jwt.strategy.ts
│   │   ├── roles.decorator.ts
│   │   └── roles.guard.ts
│   ├── config
│   │   └── cloudinary.config.ts
│   ├── entities
│   │   ├── attendance.entity.ts
│   │   ├── audit-log.entity.ts
│   │   └── user.entity.ts
│   ├── main.ts
│   ├── queue
│   │   ├── queue.module.ts
│   │   └── queue.service.ts
│   ├── seeds
│   │   └── admin.seed.ts
│   └── user
│       ├── cloudinary.service.ts
│       ├── dto
│       │   └── update-user.dto.ts
│       ├── user.module.ts
│       ├── user.service.spec.ts
│       ├── user.service.ts
│       └── users.controller.ts
├── test
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
├── tsconfig.build.json
└── tsconfig.json
```

---

## 5. Architecture Overview

- Single backend application using modular design (microservice-style separation)
- Modules include:
  - AuthModule
  - UsersModule
  - AttendanceModule
  - AuditModule
  - QueueModule (mocked)
- Each module follows standard NestJS layering:
  - Controller
  - Service
  - Entity
- No cross-module business logic leakage

---

## 6. Database Design

### Tables

- users
- attendances
- audit_logs

### General Rules

- All tables use soft delete via `deletedAt`
- TypeORM `synchronize` enabled for development only
- Relations are explicitly defined using TypeORM decorators

### User Roles

- EMPLOYEE
- ADMIN

---

## 7. Authentication & Authorization

### Authentication

- JWT-based authentication
- Token payload contains:
  - userId
  - role
- Token is required for all protected endpoints

### Authorization

- Role-based access enforced using guards
- ADMIN-only endpoints explicitly restricted

---

## 8. Attendance Business Rules

- Check-in:
  - Can only be done once per day
- Check-out:
  - Must be done after check-in
  - Can only be done once
- No handling for forgotten check-out (intentionally out of scope)
- Attendance data is always scoped to authenticated user context

---

## 9. Environment Requirements

- Node.js v20
- npm v9
- MySQL running locally
- Cloudinary account (for profile photo feature)

---

## 10. Installation & Setup

### Install dependencies

npm install

### Environment Variables

Create a `.env` file in the project root:

DB_HOST=127.0.0.1  
DB_PORT=3306  
DB_USERNAME=  
DB_PASSWORD=  
DB_NAME=  
JWT_SECRET=  
CLOUDINARY_CLOUD_NAME=  
CLOUDINARY_API_KEY=  
CLOUDINARY_API_SECRET=  
NODE_ENV=development

Notes:

- TypeORM synchronize is enabled only in development mode
- Cloudinary credentials are required for profile photo upload

### Run Application

npm run start:dev

Expected output:

Nest application successfully started

---

## 11. Admin Seeder

An admin account is automatically created in development mode.

Default admin credentials:

- Email: admin@mail.com
- Password: admin123
- Role: ADMIN

Rules:

- Seeder runs only when NODE_ENV=development
- Admin is created only if it does not already exist
- Admin registration via API is not allowed

---

## 12. Authentication API

### Login

POST /auth/login

Response:

- Returns JWT access token
- Token must be used as Bearer token for protected APIs

---

### Register User (ADMIN ONLY)

POST /auth/register

Rules:

- ADMIN only
- Always creates EMPLOYEE users
- Public registration is disabled
- Password is hashed before storage
- Password is never returned in response

---

## 13. User Profile APIs (JWT Required)

### Get My Profile

GET /users/me

Returns:

- User profile data
- Password is never included

---

### Update My Profile

PUT /users/me

Capabilities:

- Update phone number
- Update password (optional)

Rules:

- User can update only their own profile
- Old password is required only when changing password
- Partial updates are supported
- Password is always hashed
- Password is never returned

---

### Update Profile Photo

PUT /users/me/photo

Flow:

- Accept multipart/form-data
- Backend uploads image to Cloudinary
- Secure URL is stored in users.photo column
- Updated user data is returned

Rules:

- Image type: PNG
- Max file size enforced
- Previous image can be removed
- Cloudinary asset is deleted when photo is removed

---

## 14. User Management APIs (ADMIN ONLY)

### Get Users

GET /users

Returns:

- List of users
- Basic profile info only
- Password is never exposed

---

### Update User

PUT /users/:id

Rules:

- ADMIN only
- Can update name and phone number
- Cannot update password via this endpoint

---

## 15. Attendance APIs (JWT Required)

### Check-in

POST /attendance/check-in

Rules:

- One check-in per day
- Error if already checked in

---

### Check-out

POST /attendance/check-out

Rules:

- Must have checked in first
- Only one check-out allowed

---

### Get My Attendance

GET /attendance/me

Returns:

- Attendance records for authenticated user
- Sorted by date descending
- Supports date range filtering

---

## 16. Attendance Monitoring (ADMIN ONLY)

GET /attendance

Rules:

- Read-only
- Returns attendance records for all users
- Includes basic user info
- Supports filtering by date and userId

---

## 17. Audit Logging System

Audit logging is implemented using an asynchronous, mocked message queue approach.

### Logged Events

- ATTENDANCE_CHECK_IN
- ATTENDANCE_CHECK_OUT
- USER_PROFILE_UPDATED

---

## 18. Mocked Message Queue (RabbitMQ Concept)

This project demonstrates message queue usage without installing RabbitMQ.

Design:

- Events are published via QueueService
- Subscribers consume events asynchronously
- Audit logs are persisted to audit_logs table

Flow:
Business action  
→ Publish event  
→ Mocked QueueService  
→ Audit consumer  
→ Save to database

This fulfills the requirement of demonstrating message queue usage conceptually.

---

## 19. Error Handling

- 400: Business rule violations
- 401: Authentication errors
- 403: Authorization errors
- Clear, explicit error messages
- No generic error throwing

---

## 20. Security Notes

- Passwords are hashed using bcrypt
- JWT payload contains minimal required data
- Admin privileges cannot be escalated via API
- Sensitive fields are never returned in responses

---

## 21. Out of Scope (Intentional)

- Refresh tokens
- Email verification
- Forgot password
- Unit and e2e tests
- Production migration strategy

These are intentionally excluded to keep the scope aligned with the technical test.

---

## 22. Notes for Reviewer

- Backend is developed incrementally with non-breaking changes
- Business rules are explicit and easy to follow
- Event-driven architecture is demonstrated cleanly
- Codebase is ready for extension to real message queue infrastructure

---

## 23. Final Notes

This backend prioritizes correctness, clarity, and controlled design decisions.
All features are implemented intentionally to meet the technical test requirements without unnecessary complexity.

Thank you for reviewing this backend implementation.
