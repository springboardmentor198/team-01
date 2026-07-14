CREATE TABLE search_history (
    search_id BIGSERIAL PRIMARY KEY,

    user_id BIGINT NOT NULL,

    search_query TEXT NOT NULL,

    searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_search_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);