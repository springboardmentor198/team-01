CREATE TABLE transactions (
    transaction_id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE,
    buyer_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    agent_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    amount NUMERIC(15, 2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
