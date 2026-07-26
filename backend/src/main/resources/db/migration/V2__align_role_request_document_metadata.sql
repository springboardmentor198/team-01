ALTER TABLE role_requests
    ALTER COLUMN years_of_experience TYPE INTEGER
    USING CASE
        WHEN TRIM(years_of_experience) ~ '^[0-9]+$'
            THEN TRIM(years_of_experience)::INTEGER
        ELSE 0
    END;

ALTER TABLE role_requests
    ADD CONSTRAINT chk_role_requests_years_of_experience
        CHECK (years_of_experience >= 0);

ALTER TABLE role_requests
    RENAME COLUMN document_url TO document_path;

ALTER TABLE role_requests
    ADD COLUMN document_name VARCHAR(255) NOT NULL DEFAULT '';

ALTER TABLE role_requests
    ADD COLUMN document_mime_type VARCHAR(255) NOT NULL DEFAULT 'application/octet-stream';

ALTER TABLE role_requests
    ADD COLUMN document_size BIGINT NOT NULL DEFAULT 0;
