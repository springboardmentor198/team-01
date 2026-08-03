-- V12: Seed sample notifications so the Notifications UI renders data.
-- Runs only after V11 creates the notifications table.
-- Idempotent: each statement only inserts for users that lack that notification type.

INSERT INTO notifications (
    recipient_id, sender_id, property_id, role_target,
    title, message, type, priority, status, created_at, read_at, action_url, metadata
)
SELECT
    u.user_id,
    NULL,
    NULL,
    NULL,
    'Welcome to DueDiligence',
    'Your account was created successfully. Complete your profile to get started.',
    'WELCOME',
    'LOW',
    'UNREAD',
    NOW() - INTERVAL '2 days',
    NULL,
    '/profile',
    NULL
FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM notifications n
    WHERE n.recipient_id = u.user_id AND n.type = 'WELCOME'
);

INSERT INTO notifications (
    recipient_id, sender_id, property_id, role_target,
    title, message, type, priority, status, created_at, read_at, action_url, metadata
)
SELECT
    u.user_id,
    NULL,
    NULL,
    NULL,
    'Profile completion recommended',
    'A complete profile helps sellers and agents trust you. Please finish onboarding.',
    'PROFILE_COMPLETED',
    'MEDIUM',
    'UNREAD',
    NOW() - INTERVAL '1 day',
    NULL,
    '/onboarding',
    NULL
FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM notifications n
    WHERE n.recipient_id = u.user_id AND n.type = 'PROFILE_COMPLETED'
);

INSERT INTO notifications (
    recipient_id, sender_id, property_id, role_target,
    title, message, type, priority, status, created_at, read_at, action_url, metadata
)
SELECT
    u.user_id,
    NULL,
    (SELECT p.property_id FROM properties p ORDER BY p.property_id LIMIT 1),
    NULL,
    'New property matching your interests',
    'A new property was listed that may match your saved preferences.',
    'PROPERTY_CREATED',
    'MEDIUM',
    'UNREAD',
    NOW() - INTERVAL '12 hours',
    NULL,
    '/property-results',
    NULL
FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM notifications n
    WHERE n.recipient_id = u.user_id AND n.type = 'PROPERTY_CREATED'
);

INSERT INTO notifications (
    recipient_id, sender_id, property_id, role_target,
    title, message, type, priority, status, created_at, read_at, action_url, metadata
)
SELECT
    u.user_id,
    NULL,
    (SELECT p.property_id FROM properties p ORDER BY p.property_id LIMIT 1),
    NULL,
    'High risk alert on a property you follow',
    'A property you follow has been flagged with high risk. Please review immediately.',
    'HIGH_RISK_DETECTED',
    'CRITICAL',
    'UNREAD',
    NOW() - INTERVAL '3 hours',
    NULL,
    '/property-details/' || (SELECT p.property_id FROM properties p ORDER BY p.property_id LIMIT 1),
    NULL
FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM notifications n
    WHERE n.recipient_id = u.user_id AND n.type = 'HIGH_RISK_DETECTED'
);

