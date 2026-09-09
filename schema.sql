CREATE TABLE IF NOT EXISTS date_responses (
  id BIGSERIAL PRIMARY KEY,
  date_value DATE NOT NULL,
  time_value VARCHAR(20) NOT NULL,
  location VARCHAR(160) NOT NULL,
  date_type VARCHAR(500) NOT NULL,
  mood VARCHAR(60),
  note VARCHAR(200),
  guest_email VARCHAR(200) NOT NULL,
  guest_phone VARCHAR(30) NOT NULL,
  consent BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
