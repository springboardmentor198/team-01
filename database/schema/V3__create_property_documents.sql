CREATE TABLE property_documents (

    document_id BIGSERIAL PRIMARY KEY,

    property_id BIGINT NOT NULL,

    document_name VARCHAR(200) NOT NULL,

    document_type VARCHAR(100),

    file_url TEXT NOT NULL,

    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_document_property
        FOREIGN KEY(property_id)
        REFERENCES properties(property_id)
        ON DELETE CASCADE
);

CREATE INDEX idx_document_property
ON property_documents(property_id);