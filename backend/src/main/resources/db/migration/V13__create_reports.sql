CREATE TABLE reports (
    id                  BIGSERIAL PRIMARY KEY,
    property_id         INTEGER      NOT NULL,
    executive_summary   TEXT,
    report_data         TEXT,
    status               VARCHAR(30)  NOT NULL DEFAULT 'GENERATED',
    created_by           VARCHAR(255),
    created_at           TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_reports_property
        FOREIGN KEY (property_id) REFERENCES properties (property_id)
);

CREATE INDEX idx_reports_property_id ON reports (property_id);
CREATE INDEX idx_reports_created_at ON reports (created_at);