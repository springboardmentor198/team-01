INSERT INTO risk_summary
(
    legal_risk,
    environmental_risk,
    flood_risk,
    overall_risk,
    remarks,
    risk_score,
    created_at,
    updated_at,
    property_id
)
VALUES
(
    'LOW',
    'LOW',
    'LOW',
    'LOW',
    'Property has minimal legal and environmental concerns.',
    25,
    NOW(),
    NOW(),
    1
)
ON CONFLICT (property_id) DO NOTHING;