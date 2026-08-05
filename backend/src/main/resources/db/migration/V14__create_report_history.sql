CREATE TABLE report_history (
    id            BIGSERIAL PRIMARY KEY,
    report_id     BIGINT       NOT NULL,
    action        VARCHAR(30)  NOT NULL,
    performed_by  VARCHAR(255),
    performed_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_report_history_report
        FOREIGN KEY (report_id) REFERENCES reports (id)
        ON DELETE CASCADE
);

CREATE INDEX idx_report_history_report_id ON report_history (report_id);