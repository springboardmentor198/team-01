CREATE TABLE risk_factors (
    factor_id BIGSERIAL PRIMARY KEY,

    assessment_id BIGINT NOT NULL,

    factor_name VARCHAR(100),

    severity VARCHAR(20)
        CHECK(severity IN ('LOW','MEDIUM','HIGH')),

    remarks TEXT,

    CONSTRAINT fk_factor_assessment
        FOREIGN KEY(assessment_id)
        REFERENCES risk_assessments(assessment_id)
        ON DELETE CASCADE
);