CREATE TABLE reports (
    report_id BIGSERIAL PRIMARY KEY,

    assessment_id BIGINT NOT NULL,

    report_name VARCHAR(150),

    report_url TEXT,

    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_report_assessment
        FOREIGN KEY(assessment_id)
        REFERENCES risk_assessments(assessment_id)
        ON DELETE CASCADE
);