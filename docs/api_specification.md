# REST API Specification — Enterprise Issue & Incident Management System

## Base URL
`/api`

## Authentication Standard
All endpoints except `/api/auth/**` and `/actuator/health` require a Bearer JWT Token passed in the `Authorization` header:
```http
Authorization: Bearer <token>
```

---

## 1. Authentication Endpoints

### 1.1 Register User
- **Method & Route**: `POST /api/auth/register`
- **Access**: Public
- **Request Body**:
```json
{
  "username": "nandhu",
  "email": "nandhu@example.com",
  "password": "Password123!",
  "firstName": "Nandhu",
  "lastName": "Kumar",
  "roles": ["SUPPORT"]
}
```
- **Response `201 Created`**:
```json
{
  "id": 1,
  "username": "nandhu",
  "email": "nandhu@example.com",
  "firstName": "Nandhu",
  "lastName": "Kumar",
  "roles": ["SUPPORT"],
  "enabled": true
}
```

### 1.2 Login & Token Generation
- **Method & Route**: `POST /api/auth/login`
- **Access**: Public
- **Request Body**:
```json
{
  "username": "nandhu",
  "password": "Password123!"
}
```
- **Response `200 OK`**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "user": {
    "id": 1,
    "username": "nandhu",
    "email": "nandhu@example.com",
    "roles": ["SUPPORT"]
  }
}
```

---

## 2. User Management Endpoints

| Method | Endpoint | Authorization | Description |
|---|---|---|---|
| `GET` | `/api/users` | Admin | Retrieve all users |
| `GET` | `/api/users/{id}` | Admin | Retrieve specific user by ID |
| `PUT` | `/api/users/{id}` | Admin | Update user details or roles |
| `DELETE` | `/api/users/{id}` | Admin | Disable/delete a user |

---

## 3. Incident Management Endpoints

### 3.1 Create Incident
- **Method & Route**: `POST /api/incidents`
- **Access**: Admin, Support, Developer
- **Request Body**:
```json
{
  "title": "Database connection pool exhaustion under load",
  "description": "HikariCP pool timeouts observed during 10k RPS peak traffic.",
  "priority": "HIGH",
  "severity": "S1"
}
```
- **Response `201 Created`**:
```json
{
  "id": 101,
  "title": "Database connection pool exhaustion under load",
  "description": "HikariCP pool timeouts observed during 10k RPS peak traffic.",
  "priority": "HIGH",
  "severity": "S1",
  "status": "OPEN",
  "createdBy": { "id": 1, "username": "nandhu" },
  "assignedTo": null,
  "createdAt": "2026-10-22T14:35:00Z",
  "updatedAt": "2026-10-22T14:35:00Z"
}
```

### 3.2 List Incidents (Search, Filter, Pagination, Sorting)
- **Method & Route**: `GET /api/incidents`
- **Query Parameters**:
  - `keyword` (string): Searches title and description
  - `status` (string): `OPEN`, `ASSIGNED`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`, `REOPENED`
  - `priority` (string): `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`
  - `severity` (string): `S1`, `S2`, `S3`, `S4`
  - `assignedTo` (bigint): User ID
  - `page` (int, default 0)
  - `size` (int, default 10)
  - `sort` (string, default `createdAt,desc`)
- **Response `200 OK`**: Standard Spring `Page<IncidentResponseDto>` with `content`, `totalElements`, `totalPages`, `number`, `size`.

### 3.3 Assign Incident
- **Method & Route**: `PATCH /api/incidents/{id}/assign`
- **Access**: Admin, Support
- **Request Body**:
```json
{
  "developerId": 2
}
```

### 3.4 Change Incident Status
- **Method & Route**: `PATCH /api/incidents/{id}/status`
- **Access**: Admin, Support, Developer
- **Request Body**:
```json
{
  "status": "IN_PROGRESS"
}
```

---

## 4. Comments Endpoints

| Method | Endpoint | Authorization | Description |
|---|---|---|---|
| `POST` | `/api/incidents/{id}/comments` | Authenticated | Post collaboration note |
| `GET` | `/api/incidents/{id}/comments` | Authenticated | List all comments on incident |
| `PUT` | `/api/comments/{id}` | Author / Admin | Edit existing comment |
| `DELETE` | `/api/comments/{id}` | Author / Admin | Remove comment |
