CREATE TABLE verification_records (
    verification_id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE,
    verifier_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    type VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    remarks VARCHAR(1000),
    verified_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
