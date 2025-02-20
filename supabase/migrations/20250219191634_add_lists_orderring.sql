ALTER TABLE lists ADD COLUMN sort_order DOUBLE PRECISION;
UPDATE lists SET sort_order = EXTRACT(EPOCH FROM created_at)::float8;
ALTER TABLE lists ALTER COLUMN sort_order SET NOT NULL;
CREATE INDEX lists_sort_order_idx ON lists (sort_order);