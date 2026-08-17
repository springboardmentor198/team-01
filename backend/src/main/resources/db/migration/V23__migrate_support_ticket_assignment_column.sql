-- V22 introduced assigned_to while the canonical SupportTicket entity maps
-- assigned_admin_id. Preserve assignments and remove the unused duplicate
-- column in a forward-only migration.
UPDATE support_tickets
SET assigned_admin_id = assigned_to
WHERE assigned_admin_id IS NULL
  AND assigned_to IS NOT NULL;

ALTER TABLE support_tickets
DROP COLUMN IF EXISTS assigned_to;
