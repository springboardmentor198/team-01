CREATE TABLE property_tax_history (
    tax_history_id BIGSERIAL PRIMARY KEY,

    property_id INTEGER NOT NULL,

    tax_year INTEGER NOT NULL,

    assessed_value NUMERIC(15,2),
    tax_amount NUMERIC(15,2),

    payment_status VARCHAR(255),

    due_date DATE,
    payment_date DATE,

    CONSTRAINT fk_property_tax_history_property
        FOREIGN KEY (property_id)
        REFERENCES properties(property_id)
);