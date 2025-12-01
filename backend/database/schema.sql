-- AI Dating App Database Schema

-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  age INTEGER NOT NULL,
  avatar VARCHAR(500),
  gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
  profession VARCHAR(100),
  height INTEGER,
  zodiac VARCHAR(20),
  hometown VARCHAR(100),
  relationship_status VARCHAR(20) DEFAULT 'single' CHECK (relationship_status IN ('single', 'divorced', 'complicated')),
  bio TEXT,
  looking_for VARCHAR(500),
  tags TEXT[], -- PostgreSQL array type
  photos TEXT[], -- PostgreSQL array type
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Interactions table
CREATE TABLE interactions (
  id SERIAL PRIMARY KEY,
  from_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  to_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) CHECK (type IN ('LIKE', 'DISLIKE', 'SUPER_LIKE')),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(from_user_id, to_user_id) -- Prevent duplicate interactions
);

-- Matches table
CREATE TABLE matches (
  id SERIAL PRIMARY KEY,
  user1_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  user2_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_message TEXT,
  UNIQUE(user1_id, user2_id) -- Ensure unique pairs
);
