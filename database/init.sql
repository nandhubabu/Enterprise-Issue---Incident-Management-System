-- =============================================================================
-- Enterprise Issue & Incident Management System — PostgreSQL Schema & Seed
-- =============================================================================

CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS incidents (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(50) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    created_by_id BIGINT NOT NULL REFERENCES users(id),
    assigned_to_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_priority ON incidents(priority);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incidents_assigned_to ON incidents(assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_incidents_created_by ON incidents(created_by_id);
CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON incidents(created_at);

CREATE TABLE IF NOT EXISTS comments (
    id BIGSERIAL PRIMARY KEY,
    incident_id BIGINT NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    author_id BIGINT NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_comments_incident ON comments(incident_id);

CREATE TABLE IF NOT EXISTS incident_histories (
    id BIGSERIAL PRIMARY KEY,
    incident_id BIGINT NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    changed_by_id BIGINT NOT NULL REFERENCES users(id),
    field_name VARCHAR(100) NOT NULL,
    old_value VARCHAR(255),
    new_value VARCHAR(255),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_histories_incident ON incident_histories(incident_id);

-- =============================================================================
-- Seed Default Enterprise Roles
-- =============================================================================
INSERT INTO roles (name) VALUES ('ADMIN') ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (name) VALUES ('SUPPORT') ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (name) VALUES ('DEVELOPER') ON CONFLICT (name) DO NOTHING;

-- Seed Default Accounts (BCrypt Hash for password123: $2a$10$w4r6rW/dE9n79fG3gQ0/o.bZ7Nn75bU2zUo4K4sRj5D4R.VjPq1pW)
-- admin: admin123 -> $2a$10$7h3sN1xN6N8q7TjW.zFm0.n7sL9Zp6Q2mB3p1L4o9s0K5d4V2e1W
-- support: support123 -> $2a$10$7h3sN1xN6N8q7TjW.zFm0.n7sL9Zp6Q2mB3p1L4o9s0K5d4V2e1W
-- developer: dev123 -> $2a$10$7h3sN1xN6N8q7TjW.zFm0.n7sL9Zp6Q2mB3p1L4o9s0K5d4V2e1W
INSERT INTO users (id, username, email, password, first_name, last_name, enabled)
VALUES (1, 'admin', 'admin@enterprise.com', '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8.', 'System', 'Administrator', TRUE)
ON CONFLICT (username) DO NOTHING;

INSERT INTO users (id, username, email, password, first_name, last_name, enabled)
VALUES (2, 'support', 'support@enterprise.com', '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8.', 'Alex', 'Support', TRUE)
ON CONFLICT (username) DO NOTHING;

INSERT INTO users (id, username, email, password, first_name, last_name, enabled)
VALUES (3, 'developer', 'dev@enterprise.com', '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8.', 'Nandhu', 'Developer', TRUE)
ON CONFLICT (username) DO NOTHING;

-- Assign Roles
INSERT INTO user_roles (user_id, role_id)
SELECT 1, id FROM roles WHERE name IN ('ADMIN', 'SUPPORT')
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT 2, id FROM roles WHERE name = 'SUPPORT'
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT 3, id FROM roles WHERE name = 'DEVELOPER'
ON CONFLICT DO NOTHING;

-- Advance sequences so subsequent auto-increment inserts succeed
SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 1) FROM users));
SELECT setval('roles_id_seq', (SELECT COALESCE(MAX(id), 1) FROM roles));
