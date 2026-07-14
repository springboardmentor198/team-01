CREATE TABLE comparable_properties (
    comparable_id BIGSERIAL PRIMARY KEY,

    property_id BIGINT NOT NULL,

    comparable_address TEXT,

    market_price DECIMAL(15,2),

    distance_km DECIMAL(6,2),

    CONSTRAINT fk_comparable_property
        FOREIGN KEY(property_id)
        REFERENCES properties(property_id)
        ON DELETE CASCADE
);