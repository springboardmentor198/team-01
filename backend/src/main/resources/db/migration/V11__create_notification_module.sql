CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    recipient_id BIGINT NOT NULL,
    sender_id BIGINT,
    property_id INTEGER,
    role_target VARCHAR(50),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(80) NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(20) NOT NULL DEFAULT 'UNREAD',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP,
    action_url VARCHAR(500),
    metadata TEXT,
    CONSTRAINT fk_notification_recipient
        FOREIGN KEY (recipient_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_notification_sender
        FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE SET NULL,
    CONSTRAINT fk_notification_property
        FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE SET NULL
);

CREATE INDEX idx_notifications_recipient_created
    ON notifications(recipient_id, created_at DESC);

CREATE INDEX idx_notifications_recipient_status
    ON notifications(recipient_id, status);

CREATE TABLE IF NOT EXISTS property_follows (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    property_id INTEGER NOT NULL,
    follow_reason VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_property_follow UNIQUE (user_id, property_id),
    CONSTRAINT fk_property_follow_user
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_property_follow_property
        FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS agent_follows (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    agent_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_agent_follow UNIQUE (user_id, agent_id),
    CONSTRAINT fk_agent_follow_user
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_agent_follow_agent
        FOREIGN KEY (agent_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS owner_follows (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    owner_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_owner_follow UNIQUE (user_id, owner_id),
    CONSTRAINT fk_owner_follow_user
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_owner_follow_owner
        FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE CASCADE
);
