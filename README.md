# IncidentSphere — Enterprise Issue & Incident Management System

[![CI Pipeline](https://github.com/nandhubabu/Enterprise-Issue---Incident-Management-System/actions/workflows/ci.yml/badge.svg)](https://github.com/nandhubabu/Enterprise-Issue---Incident-Management-System/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Java](https://img.shields.io/badge/Java-21%20LTS-orange.svg)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.4-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF.svg)](https://vitejs.dev/)
[![Security](https://img.shields.io/badge/Security-Spring_Security_6_%2B_JWT-red.svg)](https://spring.io/projects/spring-security)
[![Tests](https://img.shields.io/badge/Tests-34%20Passing%20(100%25)-success.svg)](https://junit.org/junit5/)
[![Docker](https://img.shields.io/badge/Docker-Compose_Ready-2496ED.svg)](https://www.docker.com/)

A production-grade, multi-tier enterprise incident management and IT service management (ITSM) platform. Inspired by industry standards like **Jira Service Management**, **ServiceNow**, and **PagerDuty**, IncidentSphere provides a centralized command center for engineering, DevOps, and customer support organizations to triage, assign, track, resolve, and audit mission-critical technical outages.

Engineered with a decoupled architecture featuring a **Java 21 / Spring Boot 3.3** REST backend, an ACID-compliant **PostgreSQL 16** persistence layer, and a high-performance **React 18 / Vite 5** single-page application styled with an enterprise Atlassian-inspired design system. Fully containerized with **Docker Compose** and automated via **GitHub Actions CI/CD**.

---

## 🎯 Architectural Highlights & Engineering Achievements
*(Designed for Technical Recruiters, Engineering Managers, and Systems Architects)*

| Engineering Domain | Technical Achievement | Real-World Impact |
|:---|:---|:---|
| **Deterministic State Integrity** | Formalized **Finite State Machine (FSM)** enforcing valid transitions (`OPEN` → `ASSIGNED` → `IN_PROGRESS` → `RESOLVED` → `CLOSED`; `CLOSED` → `REOPENED` → `IN_PROGRESS`) at the service layer. | Prevents illegal status skipping (e.g. `OPEN` → `CLOSED`), guarantees atomic timestamp generation (`resolved_at`, `closed_at`), and returns structured RFC 7807 problem details. |
| **Enterprise Security & RBAC** | Stateless **JWT HMAC-256** authentication paired with **Spring Security 6** method-level authorization (`@PreAuthorize`) and BCrypt 10-round salted hashing. | Enforces strict separation of duties between **Admin** (governance/users), **Support** (triage/assignment), and **Developer** (remediation/investigation). |
| **Dynamic Multi-Criteria Search** | **Spring Data JPA Specifications & Hibernate Criteria API** dynamically constructing single-query SQL predicates based on active filters (keyword, severity, priority, status, assignee). | Eliminates N+1 query overhead; provides index-backed sorting, pagination (`Pageable`), and instant search response times (<50ms). |
| **Comprehensive Auditability** | Automated, immutable **`sys_audit` change log** recording field changes, previous values, new values, timestamps, and operator IDs. | Guarantees compliance and full incident post-mortem retrospectives. |
| **Production Observability & Tracing** | **SLF4J MDC correlation filter** propagating `X-Correlation-ID` across inbound HTTP requests, coupled with Logback rolling file appenders (50MB rolling, 30-day retention) and **Spring Boot Actuator** health endpoints. | Enables zero-downtime distributed tracing, log aggregation, and real-time operational telemetry. |
| **Atlassian Design System** | Custom-engineered enterprise UI featuring **Plus Jakarta Sans** typography, **JetBrains Mono** telemetry keys, single-line ADS status lozenges, segmented workflow distributions, and soft ambient elevation. | Replaces generic templates with an interface matching ServiceNow and Jira Service Management. |
| **100% Automated Test Pass Rate** | **34 unit and integration tests** executing via JUnit 5, Mockito, and Spring MockMvc covering service boundaries, parameterized FSM transitions, security rejections, and E2E flows. | Guarantees zero regression and continuous integration stability in automated pipelines. |
| **Container-Native DevOps** | Multi-stage **Docker** builds, coordinated **Docker Compose** network with PostgreSQL health-checks, NGINX reverse proxy, and **GitHub Actions** CI/CD automation. | Single-command deployment (`docker compose up -d`) across local, staging, and production environments. |

---

## 📸 System Showcase & Visual Walkthrough

### 1. Operations Command Center
High-density telemetry dashboard displaying live incident counts, active severity alerts, segmented workflow distribution, real-time triage queue, and the **Security & Access Posture Hub**.
![Operations Command Center](docs/screenshots/operations_dashboard.png)

---

### 2. Incident Workstation & Queue
Multi-criteria filtering console supporting instant search, status/priority/severity lozenges, engineer assignment badges, and single-click triage dispatch.
![Incident Workstation Queue](docs/screenshots/incident_workstation.png)

---

### 3. Incident Investigation & State Machine Console
Interactive workflow stage stepper displaying live incident state progression, timestamp telemetry, technical diagnostics, and audit-logged collaboration commentary.
![Incident Investigation Workstation](docs/screenshots/incident_investigation.png)

---

### 4. User Directory & RBAC Governance
Administrative identity console with circular user avatars, active status toggle switches, search filtering, and checkable role permission pills (`ADMIN`, `SUPPORT`, `DEVELOPER`).
![User Directory & RBAC Console](docs/screenshots/user_directory_rbac.png)

---

## 📑 Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [Technology Stack](#2-technology-stack)
3. [System Design & Entity Relationship (ERD)](#3-system-design--entity-relationship-erd)
4. [Incident Workflow Finite State Machine](#4-incident-workflow-finite-state-machine)
5. [Authentication & RBAC Permission Matrix](#5-authentication--rbac-permission-matrix)
6. [Interactive REST API Documentation](#6-interactive-rest-api-documentation)
7. [Automated Testing Strategy & Verification](#7-automated-testing-strategy--verification)
8. [Production Support, Observability & MDC Tracing](#8-production-support-observability--mdc-tracing)
9. [Docker Containerization](#9-docker-containerization)
10. [GitHub Actions CI/CD Pipeline](#10-github-actions-cicd-pipeline)
11. [Environment Configuration](#11-environment-configuration)
12. [How to Run Locally](#12-how-to-run-locally)
13. [Future Technical Roadmap](#13-future-technical-roadmap)
14. [Author & Acknowledgments](#14-author--acknowledgments)

---

## 1. Architecture Overview

IncidentSphere follows a decoupled three-tier enterprise architecture:

```text
┌─────────────────────────────────────────────────────────────┐
│                 Client Layer (Browser / SPA)                │
│  React 18 • Vite 5 • Plus Jakarta Sans • Lucide Iconography │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / JSON
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    NGINX Reverse Proxy                      │
│  • Serves Single Page Application (HTML5 PushState Routing) │
│  • Routes /api/* requests to Spring Boot Backend Cluster    │
│  • Routes /actuator/* to Health & Monitoring Endpoints      │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Spring Boot 3.3.4 REST API                  │
│                                                             │
│  [MdcCorrelationFilter]      ── Captures X-Correlation-ID   │
│  [JwtAuthenticationFilter]   ── Validates Bearer HMAC-256   │
│  [SecurityFilterChain]       ── Enforces Method Security    │
│  [GlobalExceptionHandler]    ── RFC 7807 Structured Errors  │
│  [Controllers]               ── Auth, Incidents, Comments   │
│  [Service Layer]             ── FSM State Engine & Logic    │
│  [Spring Data JPA]           ── Dynamic Criteria Queries    │
└──────────────────────────────┬──────────────────────────────┘
                               │ JDBC / HikariCP Pool
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   PostgreSQL 16 Database                    │
│                                                             │
│  • ACID Relational Transactions                             │
│  • Indexes on status, priority, severity, assigned_to_id    │
│  • Automated sys_audit History Tracking                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack

### Backend
- **Language**: Java 21 (LTS) — utilizing Records, Switch Expressions, and Pattern Matching.
- **Framework**: Spring Boot 3.3.4 (Spring MVC, Spring Data JPA, Spring Security 6, Spring Boot Actuator).
- **Authentication**: Stateless JSON Web Tokens (JJWT 0.12.6) with HMAC-SHA256 signing.
- **Persistence**: Hibernate 6.5 / Spring Data JPA with HikariCP connection pooling.
- **Database**: PostgreSQL 16 (production) with H2 In-Memory DB support for test isolation.
- **API Documentation**: SpringDoc OpenAPI 3 / Swagger UI 2.6.0.
- **Testing**: JUnit 5, Mockito, Spring Security Test, MockMvc, AssertJ.

### Frontend
- **Framework**: React 18.3.
- **Build Engine**: Vite 5.4.
- **Styling**: Atlassian Jira Service Management Design System (Vanilla CSS with CSS Custom Properties).
- **Typography**: Plus Jakarta Sans (Headings/Body) & JetBrains Mono (Telemetry/Keys).
- **Icons**: Lucide React.

### Infrastructure & DevOps
- **Containerization**: Docker Multi-Stage Builds & Docker Compose.
- **Web Server / Reverse Proxy**: NGINX Alpine.
- **CI/CD**: GitHub Actions automated pipeline.
- **Observability**: SLF4J MDC, Logback daily rotating appenders, Spring Boot Actuator.

---

## 3. System Design & Entity Relationship (ERD)

```mermaid
erDiagram
    ROLE {
        bigint id PK
        varchar name "ADMIN, SUPPORT, DEVELOPER"
    }

    USER {
        bigint id PK
        varchar username UK
        varchar email UK
        varchar password "BCrypt Hash"
        varchar first_name
        varchar last_name
        boolean enabled
        timestamp created_at
        timestamp updated_at
    }

    USER_ROLE {
        bigint user_id PK,FK
        bigint role_id PK,FK
    }

    INCIDENT {
        bigint id PK
        varchar title
        text description
        varchar priority "LOW, MEDIUM, HIGH, CRITICAL"
        varchar severity "S1, S2, S3, S4"
        varchar status "OPEN, ASSIGNED, IN_PROGRESS, RESOLVED, CLOSED, REOPENED"
        bigint created_by_id FK
        bigint assigned_to_id FK
        timestamp created_at
        timestamp updated_at
        timestamp resolved_at
        timestamp closed_at
    }

    COMMENT {
        bigint id PK
        bigint incident_id FK
        bigint author_id FK
        text content
        timestamp created_at
        timestamp updated_at
    }

    INCIDENT_HISTORY {
        bigint id PK
        bigint incident_id FK
        bigint changed_by_id FK
        varchar field_name
        varchar old_value
        varchar new_value
        timestamp changed_at
    }

    USER ||--o{ USER_ROLE : "has"
    ROLE ||--o{ USER_ROLE : "assigned to"
    USER ||--o{ INCIDENT : "created by"
    USER ||--o{ INCIDENT : "assigned to"
    USER ||--o{ COMMENT : "authors"
    USER ||--o{ INCIDENT_HISTORY : "modified by"
    INCIDENT ||--o{ COMMENT : "contains"
    INCIDENT ||--o{ INCIDENT_HISTORY : "tracked by"
```

---

## 4. Incident Workflow Finite State Machine

IncidentSphere enforces a deterministic lifecycle for every ticket. State transitions are validated by `IncidentWorkflowService` before database persistence.

```mermaid
stateDiagram-v2
    [*] --> OPEN : Ticket Created
    OPEN --> ASSIGNED : Support/Admin dispatches engineer
    ASSIGNED --> IN_PROGRESS : Engineer begins active investigation
    IN_PROGRESS --> RESOLVED : Solution verified in production
    RESOLVED --> CLOSED : Customer/Reporter verification
    CLOSED --> REOPENED : Defect recurrence detected
    REOPENED --> IN_PROGRESS : Engineer resumes remediation
```

### Transition Matrix & Audit Actions

| Current Status | Target Status | Permitted Roles | System Actions Taken |
|:---|:---|:---|:---|
| `OPEN` | `ASSIGNED` | `ADMIN`, `SUPPORT` | Sets `assignedTo`, logs `status` and `assignedTo` audit history. |
| `ASSIGNED` | `IN_PROGRESS` | `ADMIN`, `SUPPORT`, `DEVELOPER` | Sets investigation flag, logs audit history. |
| `IN_PROGRESS` | `RESOLVED` | `ADMIN`, `SUPPORT`, `DEVELOPER` | Sets `resolved_at = CURRENT_TIMESTAMP`, logs audit history. |
| `RESOLVED` | `CLOSED` | `ADMIN`, `SUPPORT` | Sets `closed_at = CURRENT_TIMESTAMP`, freezes incident. |
| `CLOSED` | `REOPENED` | `ADMIN`, `SUPPORT` | Clears `resolved_at` and `closed_at`, resets state. |
| `REOPENED` | `IN_PROGRESS` | `ADMIN`, `SUPPORT`, `DEVELOPER` | Re-engages technical investigation. |

> **Rejection Policy**: Any invalid skip (such as `OPEN` → `CLOSED` or `RESOLVED` → `ASSIGNED`) is rejected at the API boundary with `400 Bad Request` and an explicit error explanation:
> ```json
> {
>   "status": 400,
>   "error": "INVALID_STATUS_TRANSITION",
>   "message": "Incident cannot transition from OPEN to CLOSED. Must follow lifecycle: OPEN -> ASSIGNED -> IN_PROGRESS -> RESOLVED -> CLOSED."
> }
> ```

---

## 5. Authentication & RBAC Permission Matrix

Every REST endpoint is protected with method-level `@PreAuthorize` security expressions.

| Operation | HTTP & Endpoint | Admin | Support | Developer |
|:---|:---|:---:|:---:|:---:|
| **User Authentication** | `POST /api/auth/login` | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| **User Registration** | `POST /api/auth/register` | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| **Create Incident** | `POST /api/incidents` | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| **Search & View Incidents** | `GET /api/incidents/**` | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| **Dispatch / Assign Incident** | `PATCH /api/incidents/{id}/assign` | :white_check_mark: | :white_check_mark: | :x: |
| **Update Incident Details** | `PUT /api/incidents/{id}` | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| **Transition Incident Status** | `PATCH /api/incidents/{id}/status` | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| **Add Incident Comment** | `POST /api/incidents/{id}/comments` | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| **Delete Own Comment** | `DELETE /api/comments/{id}` | :white_check_mark: | :white_check_mark: *(own)* | :white_check_mark: *(own)* |
| **Delete Incident Record** | `DELETE /api/incidents/{id}` | :white_check_mark: | :x: | :x: |
| **User Directory & RBAC** | `GET/PUT/DELETE /api/users/**` | :white_check_mark: | :x: | :x: |

---

## 6. Interactive REST API Documentation

Interactive Swagger UI documentation is available at:
`http://localhost:8080/swagger-ui.html`

### Sample Request: Report Production Outage
```http
POST /api/incidents HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
Content-Type: application/json

{
  "title": "Payment Webhook Timeout Under Peak Traffic",
  "description": "Stripe webhook connections timing out above 2,500 req/sec. Dead-letter queue backing up.",
  "priority": "CRITICAL",
  "severity": "S1"
}
```

### Sample Response: `201 Created`
```json
{
  "id": 1,
  "title": "Payment Webhook Timeout Under Peak Traffic",
  "description": "Stripe webhook connections timing out above 2,500 req/sec. Dead-letter queue backing up.",
  "priority": "CRITICAL",
  "severity": "S1",
  "status": "OPEN",
  "createdBy": {
    "id": 2,
    "username": "support",
    "email": "support@enterprise.com",
    "firstName": "Alex",
    "lastName": "Support"
  },
  "assignedTo": null,
  "commentsCount": 0,
  "createdAt": "2026-10-22T14:35:00.000Z",
  "updatedAt": "2026-10-22T14:35:00.000Z",
  "resolvedAt": null,
  "closedAt": null
}
```

---

## 7. Automated Testing Strategy & Verification

The backend maintains an automated test suite executed with **JUnit 5**, **Mockito**, and **Spring MockMvc**. 

```text
Results :

Tests run: 34, Failures: 0, Errors: 0, Skipped: 0
Time elapsed: 17.85 s
```

### Test Suite Breakdown

| Test Suite | Class Name | Tests | Scope & Assertions |
|:---|:---|:---:|:---|
| **Workflow State Engine** | `StatusWorkflowTest` | **14** | Parameterized test of all 6 legal transitions; asserts `400 Bad Request` and `INVALID_STATUS_TRANSITION` on all 8 illegal skips. |
| **Authentication & Token** | `AuthServiceTest` | **5** | Validates registration, duplicate email/username rejection, BCrypt salted hashing, and JWT token issuance. |
| **Comment Collaboration** | `CommentServiceTest` | **7** | Validates comment authoring, entity association, author ownership deletion verification, and admin override deletion. |
| **Incident Business Logic** | `IncidentServiceTest` | **6** | Validates incident creation, assignment dispatch, metadata updates, deletion constraints, and JPA audit persistence. |
| **End-to-End Integration** | `IncidentControllerIntegrationTest` | **2** | Full Spring context integration: unauthenticated 401 rejections, multi-criteria dynamic filter execution, and REST lifecycle. |

Run test suites locally:
```bash
cd backend
mvn test
```

---

## 8. Production Support, Observability & MDC Tracing

IncidentSphere is architected for Day-2 production operations and enterprise telemetry:

1. **Distributed Request Correlation**:
   Every HTTP request passing through `MdcCorrelationFilter` is inspected for an `X-Correlation-ID` header. If missing, a high-entropy UUID is generated and bound to SLF4J's ThreadLocal MDC context and injected into the response header:
   ```text
   HTTP/1.1 200 OK
   X-Correlation-ID: 7b3e9442-83b4-4e45-a764-f6b8627b0ebf
   ```
2. **Logback Rolling Appenders**:
   Structured log files are written with timestamp, log level, thread ID, MDC correlation ID, and logger category. Files roll over daily or when reaching 50MB, with 30-day automatic retention in `backend/logs/`.
3. **Spring Boot Actuator Health Telemetry**:
   - `GET /actuator/health`: Real-time health check on PostgreSQL connectivity, disk space, and application liveness.
   - `GET /actuator/info`: Git commit hash, build version, and Java runtime environment metadata.

---

## 9. Docker Containerization

Deploy the multi-tier application stack with a single command:

```bash
docker compose up -d --build
```

Compose coordinates 3 isolated production containers:
1. `incident_postgres`: PostgreSQL 16 database with auto-health checks and `database/init.sql` schema initialization.
2. `incident_backend`: Spring Boot 3 application running on lightweight Eclipse Temurin JRE 21.
3. `incident_frontend`: NGINX Alpine image serving the optimized Vite React 18 production bundle and reverse-proxying API requests.

### Port Map
- **Frontend Web Application**: [http://localhost](http://localhost) (Port 80)
- **Backend API Direct**: [http://localhost:8080/api](http://localhost:8080/api)
- **Interactive Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **Actuator Health Telemetry**: [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health)

---

## 10. GitHub Actions CI/CD Pipeline

The `.github/workflows/ci.yml` pipeline runs on every pull request and push to `main`:
1. **Java 21 Build & Test**: Compiles backend, executes 34 automated unit and integration tests via Maven, and enforces zero-failure thresholds.
2. **Frontend Build & Lint**: Installs dependencies and runs Vite production bundling.
3. **Container Build Verification**: Validates Docker multi-stage container builds.

---

## 11. Environment Configuration

Copy `.env.example` to `.env` to configure deployment credentials:

```bash
cp .env.example .env
```

| Environment Variable | Default Value | Description |
|:---|:---|:---|
| `DB_HOST` | `postgres` (or `localhost`) | PostgreSQL server hostname |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_NAME` | `incidentdb` | Relational database schema name |
| `DB_USERNAME` | `postgres` | Database authentication username |
| `DB_PASSWORD` | `postgres` | Database authentication password |
| `JWT_SECRET` | *256-bit cryptographic hex key* | HMAC-SHA256 signing secret for JWTs |
| `SPRING_PROFILES_ACTIVE` | `prod` (or `dev`) | Active Spring configuration profile |

---

## 12. How to Run Locally

### Default Seeded Demonstration Accounts
For immediate evaluation without manual registration:

| Display Name | Username | Password | Role Clearance | Accessible Features |
|:---|:---|:---|:---|:---|
| **Nandhu A** | `nandhu` | `Admin@123` | `ADMIN` | Root Administrator: Full system, users, RBAC, deletion |
| **System Admin** | `admin` | `admin123` | `ADMIN` | Full administrative capabilities |
| **Alex Support** | `support` | `support123` | `SUPPORT` | NOC Dispatcher: Create, triage, assign, update incidents |
| **Nandhu Developer** | `developer` | `dev123` | `DEVELOPER` | Remediation Engineer: Investigate, resolve, add comments |

### 1. Start Backend (Spring Boot)
```bash
cd backend
mvn spring-boot:run
```
Backend API will start at `http://localhost:8080`.

### 2. Start Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Frontend application will be accessible at `http://localhost:5173`.

---

## 13. Future Technical Roadmap

- [ ] **WebSocket Real-Time Broadcast**: Live incident feed updates via STOMP / WebSockets when tickets change status or receive new comments.
- [ ] **SLA Escalation Engine**: Automated background cron worker checking breached SLAs on Critical (S1) outages and escalating notifications.
- [ ] **Multi-Tenant Partitioning**: Schema-based multi-tenancy supporting segregated customer organizations.
- [ ] **Object Storage Integration**: Diagnostic logs and screenshot attachments uploaded to AWS S3 / MinIO.

---

## 14. Author & Acknowledgments

- **Lead Engineer**: **Nandhu A**
- **GitHub**: [@nandhubabu](https://github.com/nandhubabu)
- **Repository**: [Enterprise-Issue---Incident-Management-System](https://github.com/nandhubabu/Enterprise-Issue---Incident-Management-System)
- **License**: Apache License 2.0 — see [LICENSE](LICENSE) for details.
