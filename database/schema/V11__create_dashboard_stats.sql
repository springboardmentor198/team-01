CREATE TABLE dashboard_stats (
    stat_id BIGSERIAL PRIMARY KEY,

    total_properties INT DEFAULT 0,

    total_reports INT DEFAULT 0,

    high_risk_properties INT DEFAULT 0,

    total_users INT DEFAULT 0,

    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);