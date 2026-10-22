# IncidentSphere — Backend REST Service

Production-grade Spring Boot 3.3.x backend powering the Enterprise Issue & Incident Management System.

## Technology Stack
- **Language**: Java 21 LTS
- **Framework**: Spring Boot 3.3.4
- **ORM**: Spring Data JPA & Hibernate
- **Database**: PostgreSQL 16 (with in-memory H2 dev/test profile)
- **Security**: Spring Security 6 with JJWT 0.12.6 stateless Bearer token authentication
- **Documentation**: SpringDoc OpenAPI 3 / Swagger UI
- **Monitoring**: Spring Boot Actuator & SLF4J MDC correlation tracking
- **Testing**: JUnit 5, Mockito, SpringBootTest, MockMvc

## Quick Start

### Prerequisites
- JDK 21+
- Apache Maven 3.9+ (or use wrapper)

### Build and Run Local Server
```bash
# Run unit and integration tests
mvn clean test

# Run application locally
mvn spring-boot:run
```

API will be live at `http://localhost:8080`.

### Endpoints Overview
- **Swagger Documentation**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **OpenAPI Schema**: [http://localhost:8080/api-docs](http://localhost:8080/api-docs)
- **Actuator Health Check**: [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health)
- **H2 Database Console**: [http://localhost:8080/h2-console](http://localhost:8080/h2-console) (dev mode)
