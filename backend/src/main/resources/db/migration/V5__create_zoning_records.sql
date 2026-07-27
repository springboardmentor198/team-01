CREATE TABLE IF NOT EXISTS zoning_records (
    id SERIAL PRIMARY KEY,

    property_id INTEGER NOT NULL UNIQUE,

    zone_type VARCHAR(255),
    land_use VARCHAR(255),
    far VARCHAR(255),
    building_height VARCHAR(255),

    restrictions TEXT,

    compliance_status VARCHAR(255),
    zoning_risk VARCHAR(255),

    created_at TIMESTAMP,
    updated_at TIMESTAMP,

    CONSTRAINT fk_zoning_property
        FOREIGN KEY (property_id)
        REFERENCES properties(property_id)
);