CREATE TABLE flood_zone_records (
    id SERIAL PRIMARY KEY,

    property_id INTEGER NOT NULL UNIQUE,

    zone VARCHAR(255),
    risk_level VARCHAR(255),
    elevation VARCHAR(255),
    fema_classification VARCHAR(255),
    insurance_required BOOLEAN,

    created_at TIMESTAMP,
    updated_at TIMESTAMP,

    CONSTRAINT fk_flood_property
        FOREIGN KEY (property_id)
        REFERENCES properties(property_id)
);