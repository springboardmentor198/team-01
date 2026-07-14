-- =====================================================
-- Table: properties
-- =====================================================

CREATE TABLE properties (

    property_id BIGSERIAL PRIMARY KEY,

    owner_id BIGINT NOT NULL,

    property_title VARCHAR(150) NOT NULL,

    property_type VARCHAR(50)
        CHECK(property_type IN
        ('Residential','Commercial','Industrial','Land')),

    address TEXT NOT NULL,

    city VARCHAR(100) NOT NULL,

    state VARCHAR(100) NOT NULL,

    zip_code VARCHAR(10),

    area_sqft DECIMAL(10,2),

    estimated_price DECIMAL(15,2),

    status VARCHAR(20)
        DEFAULT 'AVAILABLE'
        CHECK(status IN
        ('AVAILABLE','UNDER_REVIEW','SOLD')),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_property_owner
        FOREIGN KEY(owner_id)
        REFERENCES users(user_id)
        ON DELETE RESTRICT
);

CREATE INDEX idx_property_city
ON properties(city);

CREATE INDEX idx_property_owner
ON properties(owner_id);