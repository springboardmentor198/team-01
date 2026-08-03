CREATE TABLE search_history (
    search_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    search_query TEXT NOT NULL,
    property_type VARCHAR(100),
    city VARCHAR(100),
    risk_level VARCHAR(100),
    status VARCHAR(100),
    property_id INTEGER,
    searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_search_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_search_property
        FOREIGN KEY (property_id)
        REFERENCES properties(property_id)
        ON DELETE SET NULL
);

CREATE INDEX idx_search_history_user_searched_at
    ON search_history(user_id, searched_at DESC);

CREATE INDEX idx_search_history_property_id
    ON search_history(property_id);

