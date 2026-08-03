CREATE TABLE activity_logs (
    activity_id SERIAL PRIMARY KEY,

    property_id INT NOT NULL,

    activity_type VARCHAR(100) NOT NULL,

    description TEXT,

    performed_by VARCHAR(100),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_activity_property
    FOREIGN KEY(property_id)
    REFERENCES properties(property_id)
    ON DELETE CASCADE
);