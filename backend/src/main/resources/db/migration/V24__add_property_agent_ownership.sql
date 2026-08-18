ALTER TABLE properties ADD COLUMN IF NOT EXISTS managed_by_user_id INTEGER REFERENCES users(user_id);
CREATE INDEX IF NOT EXISTS idx_properties_managed_by_user_id ON properties(managed_by_user_id);
