INSERT INTO risk_summary
(legal_risk, environmental_risk, financial_risk, overall_risk,
remarks, risk_score, created_at, property_id)
VALUES
('LOW','LOW','LOW','LOW',
'Property has minimal legal and environmental concerns.',
25,NOW(),4),

('LOW','LOW','MEDIUM','MEDIUM',
'Minor documentation verification pending.',
40,NOW(),5),

('HIGH','MEDIUM','HIGH','HIGH',
'Large commercial property requires compliance audit.',
90,NOW(),8);