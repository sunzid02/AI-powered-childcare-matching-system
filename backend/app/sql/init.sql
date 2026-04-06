CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS parents (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(160) UNIQUE NOT NULL,
    location_zone VARCHAR(20) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    work_type VARCHAR(50) NOT NULL,
    preferred_dropoff_time TIME NOT NULL,
    preferred_pickup_time TIME NOT NULL,
    requires_special_support BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT,
    cluster_label VARCHAR(50),
    embedding VECTOR(8)
);

CREATE TABLE IF NOT EXISTS children (
    id SERIAL PRIMARY KEY,
    parent_id INTEGER NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
    child_name VARCHAR(120) NOT NULL,
    age_years INTEGER NOT NULL,
    has_special_needs BOOLEAN NOT NULL DEFAULT FALSE,
    special_needs_notes TEXT,
    preferred_start_date DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS childminders (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(160) UNIQUE NOT NULL,
    location_zone VARCHAR(20) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    max_capacity INTEGER NOT NULL,
    current_capacity INTEGER NOT NULL DEFAULT 0,
    earliest_start_time TIME NOT NULL,
    latest_end_time TIME NOT NULL,
    supports_special_needs BOOLEAN NOT NULL DEFAULT FALSE,
    years_experience INTEGER NOT NULL DEFAULT 0,
    tags TEXT,
    profile_summary TEXT,
    cluster_label VARCHAR(50),
    embedding VECTOR(8)
);

CREATE TABLE IF NOT EXISTS availability (
    id SERIAL PRIMARY KEY,
    childminder_id INTEGER NOT NULL REFERENCES childminders(id) ON DELETE CASCADE,
    weekday VARCHAR(20) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    available_slots INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS requests (
    id SERIAL PRIMARY KEY,
    parent_id INTEGER NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
    child_id INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    requested_weekdays TEXT NOT NULL,
    requested_start_time TIME NOT NULL,
    requested_end_time TIME NOT NULL,
    requested_location_zone VARCHAR(20) NOT NULL,
    needs_special_support BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    selected_childminder_id INTEGER REFERENCES childminders(id) ON DELETE SET NULL,
    selected_match_score DOUBLE PRECISION,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS matches (
    id SERIAL PRIMARY KEY,
    request_id INTEGER NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    childminder_id INTEGER NOT NULL REFERENCES childminders(id) ON DELETE CASCADE,
    location_score DOUBLE PRECISION NOT NULL,
    time_score DOUBLE PRECISION NOT NULL,
    cluster_score DOUBLE PRECISION NOT NULL,
    vector_score DOUBLE PRECISION NOT NULL DEFAULT 0,
    final_score DOUBLE PRECISION NOT NULL,
    explanation TEXT NOT NULL,
    rank_position INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);