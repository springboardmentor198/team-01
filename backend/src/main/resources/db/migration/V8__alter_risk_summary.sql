ALTER TABLE risk_summary
ADD COLUMN financial_risk VARCHAR(50);

ALTER TABLE risk_summary
ADD COLUMN market_risk VARCHAR(50);

ALTER TABLE risk_summary
ADD COLUMN ownership_risk VARCHAR(50);

ALTER TABLE risk_summary
ADD COLUMN reviewed_by VARCHAR(100);

ALTER TABLE risk_summary
ADD COLUMN reviewed_at TIMESTAMP;

ALTER TABLE risk_summary
ADD COLUMN compliance_status VARCHAR(50);

ALTER TABLE risk_summary
ADD COLUMN critical_issues TEXT;

ALTER TABLE risk_summary
ADD COLUMN recommendation TEXT;

ALTER TABLE risk_summary
ADD COLUMN missing_documents TEXT;

ALTER TABLE risk_summary
ADD COLUMN risk_trend VARCHAR(30);