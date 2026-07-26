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
    4
),
(
    'LOW',
    'LOW',
    'MEDIUM',
    'MEDIUM',
    'Minor documentation verification pending.',
    40,
    NOW(),
    NOW(),
    5
),
(
    'HIGH',
    'MEDIUM',
    'HIGH',
    'HIGH',
    'Large commercial property requires compliance audit.',
    90,
    NOW(),
    NOW(),
    8
)
ON CONFLICT (property_id) DO NOTHING;