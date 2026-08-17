-- ============================================================
-- V22: Seed / Configure Admin Data
-- ============================================================

-- ============================================================
-- 1. Ensure support_tickets has required columns
-- ============================================================

ALTER TABLE support_tickets
ADD COLUMN IF NOT EXISTS assigned_to INTEGER
REFERENCES users(user_id)
ON DELETE SET NULL;

-- If description is required by the table, make sure all
-- existing rows have a value before enforcing NOT NULL.
ALTER TABLE support_tickets
ADD COLUMN IF NOT EXISTS description TEXT;

UPDATE support_tickets
SET description = 'No description provided.'
WHERE description IS NULL;

ALTER TABLE support_tickets
ALTER COLUMN description SET NOT NULL;


-- ============================================================
-- 2. Seed transactions
-- ============================================================

INSERT INTO transactions
(property_id, buyer_id, agent_id, amount, status, created_at)
VALUES
(3, 1, 1, 150000.00, 'COMPLETED', CURRENT_TIMESTAMP - INTERVAL '5 days'),
(4, 1, 1, 220000.00, 'PENDING',   CURRENT_TIMESTAMP - INTERVAL '3 days'),
(5, 1, 1, 180000.00, 'COMPLETED', CURRENT_TIMESTAMP - INTERVAL '2 days'),
(6, 1, 1, 350000.00, 'FAILED',    CURRENT_TIMESTAMP - INTERVAL '6 days'),
(7, 1, 1, 125000.00, 'COMPLETED', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(8, 1, 1, 420000.00, 'CANCELLED', CURRENT_TIMESTAMP - INTERVAL '4 days'),
(9, 1, 1, 310000.00, 'COMPLETED', CURRENT_TIMESTAMP - INTERVAL '10 days'),
(10, 1, 1, 95000.00, 'PENDING',   CURRENT_TIMESTAMP - INTERVAL '8 days'),
(11, 1, 1, 280000.00, 'COMPLETED', CURRENT_TIMESTAMP - INTERVAL '12 days');


-- ============================================================
-- 3. Seed verification records
-- ============================================================

INSERT INTO verification_records
(property_id, verifier_id, type, status, remarks, verified_at)
VALUES
(3, 1, 'LEGAL',     'APPROVED',
 'All title deeds are clear and verified.',
 CURRENT_TIMESTAMP - INTERVAL '4 days'),

(4, 1, 'FINANCIAL', 'PENDING',
 'Pending tax clearance certificate.',
 CURRENT_TIMESTAMP - INTERVAL '2 days'),

(5, 1, 'PROPERTY',  'APPROVED',
 'Physical structure inspection passed.',
 CURRENT_TIMESTAMP - INTERVAL '1 day'),

(6, 1, 'LEGAL',     'REJECTED',
 'Disputed boundary line detected.',
 CURRENT_TIMESTAMP - INTERVAL '5 days'),

(7, 1, 'FINANCIAL', 'APPROVED',
 'Valuation and mortgage documents approved.',
 CURRENT_TIMESTAMP - INTERVAL '3 days'),

(8, 1, 'PROPERTY',  'PENDING',
 'Waiting for structural audit report.',
 CURRENT_TIMESTAMP - INTERVAL '6 days'),

(8, 1, 'LEGAL',     'APPROVED',
 'Clean title history.',
 CURRENT_TIMESTAMP - INTERVAL '9 days');


-- ============================================================
-- 4. Seed support tickets
-- ============================================================

INSERT INTO support_tickets
(user_id, subject, description, priority, status, assigned_to, created_at)
VALUES

(1,
 'Issue with document upload on property 2',
 'Unable to upload the required property document.',
 'HIGH',
 'OPEN',
 1,
 CURRENT_TIMESTAMP - INTERVAL '2 days'),

(1,
 'Cannot view transaction receipt',
 'Transaction receipt is not visible in the user dashboard.',
 'MEDIUM',
 'IN_PROGRESS',
 1,
 CURRENT_TIMESTAMP - INTERVAL '1 day'),

(1,
 'Request for account role upgrade status',
 'User requested an update regarding the account role upgrade.',
 'LOW',
 'CLOSED',
 1,
 CURRENT_TIMESTAMP - INTERVAL '5 days'),

(1,
 'Reported suspicious activity on property 5',
 'Suspicious activity was reported for property 5.',
 'HIGH',
 'OPEN',
 1,
 CURRENT_TIMESTAMP - INTERVAL '3 days'),

(1,
 'Reset password link not received',
 'User has not received the password reset email.',
 'LOW',
 'CLOSED',
 1,
 CURRENT_TIMESTAMP - INTERVAL '7 days');


-- ============================================================
-- 5. Seed security events
-- ============================================================

INSERT INTO security_events
(user_id, event_type, ip_address, action, status, created_at)
VALUES

(1,
 'FAILED_LOGIN',
 '192.168.1.100',
 'Failed login attempt for admin email',
 'FAILURE',
 CURRENT_TIMESTAMP - INTERVAL '1 hour'),

(1,
 'SUSPICIOUS_ACTIVITY',
 '192.168.1.105',
 'Multiple rapid downloads of documents',
 'SUCCESS',
 CURRENT_TIMESTAMP - INTERVAL '2 hours'),

(1,
 'ADMIN_ACTION',
 '127.0.0.1',
 'Approved role request for user id 2',
 'SUCCESS',
 CURRENT_TIMESTAMP - INTERVAL '1 day'),

(1,
 'ADMIN_ACTION',
 '127.0.0.1',
 'Rejected role request for user id 3',
 'SUCCESS',
 CURRENT_TIMESTAMP - INTERVAL '2 days'),

(1,
 'ACCOUNT_SUSPENDED',
 '127.0.0.1',
 'Suspended account due to inactivity',
 'SUCCESS',
 CURRENT_TIMESTAMP - INTERVAL '3 days'),

(1,
 'FAILED_LOGIN',
 '10.0.0.2',
 'Invalid password entered',
 'FAILURE',
 CURRENT_TIMESTAMP - INTERVAL '4 days'),

(1,
 'ADMIN_ACTION',
 '127.0.0.1',
 'Deleted invalid property listing',
 'SUCCESS',
 CURRENT_TIMESTAMP - INTERVAL '5 days');