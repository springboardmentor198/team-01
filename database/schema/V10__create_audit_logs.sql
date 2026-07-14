CREATE TABLE audit_logs (
    log_id BIGSERIAL PRIMARY KEY,

    user_id BIGINT,

    action VARCHAR(200),

    table_name VARCHAR(100),

    action_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_log_user
        FOREIGN KEY(user_id)
        REFERENCES users(user_id)
        ON DELETE SET NULL
);