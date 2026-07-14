INSERT INTO users (
    full_name,
    email,
    password_hash,
    role,
    phone_number,
    is_active
)
VALUES (
    'Satya Prakash',
    'satya@gmail.com',
    '$2a$10$abcdefghijklmnopqrstuv1234567890examplehash',
    'ADMIN',
    '9876543210',
    TRUE
);


INSERT INTO properties (
    owner_id,
    property_title,
    property_type,
    address,
    city,
    state,
    zip_code,
    area_sqft,
    estimated_price,
    status
)
VALUES (
    1,
    '3 BHK Luxury Villa',
    'Residential',
    '12 MG Road',
    'Bangalore',
    'Karnataka',
    '560001',
    2450.50,
    12500000.00,
    'AVAILABLE'
);

INSERT INTO property_documents (
    property_id,
    document_name,
    document_type,
    file_url,
    uploaded_by
)
VALUES (
    1,
    'Sale Deed',
    'Legal Document',
    'https://example.com/documents/sale_deed.pdf',
    1
);

INSERT INTO risk_assessments (
    property_id,
    assessed_by,
    overall_score,
    risk_level,
    assessment_summary
)
VALUES (
    1,
    1,
    82,
    'MEDIUM',
    'Property is legally clear with minor environmental concerns.'
);

INSERT INTO risk_factors (
    assessment_id,
    factor_name,
    severity,
    remarks
)
VALUES
(
    1,
    'Legal Verification',
    'LOW',
    'Ownership documents verified.'
),
(
    1,
    'Flood Risk',
    'MEDIUM',
    'Area has moderate flood history.'
),
(
    1,
    'Property Tax',
    'LOW',
    'All taxes paid.'
);