CREATE INDEX IF NOT EXISTS idx_parents_zone ON parents(location_zone);
CREATE INDEX IF NOT EXISTS idx_parents_cluster ON parents(cluster_label);

CREATE INDEX IF NOT EXISTS idx_children_parent_id ON children(parent_id);

CREATE INDEX IF NOT EXISTS idx_childminders_zone ON childminders(location_zone);
CREATE INDEX IF NOT EXISTS idx_childminders_cluster ON childminders(cluster_label);
CREATE INDEX IF NOT EXISTS idx_childminders_special_support ON childminders(supports_special_needs);

CREATE INDEX IF NOT EXISTS idx_availability_childminder_id ON availability(childminder_id);
CREATE INDEX IF NOT EXISTS idx_availability_weekday ON availability(weekday);

CREATE INDEX IF NOT EXISTS idx_requests_parent_id ON requests(parent_id);
CREATE INDEX IF NOT EXISTS idx_requests_child_id ON requests(child_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_zone ON requests(requested_location_zone);

CREATE INDEX IF NOT EXISTS idx_matches_request_id ON matches(request_id);
CREATE INDEX IF NOT EXISTS idx_matches_childminder_id ON matches(childminder_id);
CREATE INDEX IF NOT EXISTS idx_matches_rank ON matches(rank_position);

CREATE INDEX IF NOT EXISTS idx_parents_embedding
ON parents
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 10);

CREATE INDEX IF NOT EXISTS idx_childminders_embedding
ON childminders
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 10);