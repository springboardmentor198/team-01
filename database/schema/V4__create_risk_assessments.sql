CREATE TABLE risk_assessments (

    assessment_id BIGSERIAL PRIMARY KEY,

    property_id BIGINT NOT NULL,

    assessed_by BIGINT NOT NULL,

    overall_score INT
        CHECK(overall_score BETWEEN 0 AND 100),

    risk_level VARCHAR(20)
        CHECK(risk_level IN
        ('LOW','MEDIUM','HIGH','CRITICAL')),

    remarks TEXT,

    assessment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_assessment_property
        FOREIGN KEY(property_id)
        REFERENCES properties(property_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_assessment_user
        FOREIGN KEY(assessed_by)
        REFERENCES users(user_id)
);