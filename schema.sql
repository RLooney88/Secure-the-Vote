-- SecureTheVote Database Schema
-- Run this in Railway Postgres

-- Admins table for authentication
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Petition signatures table
CREATE TABLE IF NOT EXISTS petition_signatures (
    id SERIAL PRIMARY KEY,
    petition_name VARCHAR(100) NOT NULL DEFAULT 'default',
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    zip_code VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_petition_signatures_email ON petition_signatures(email);
CREATE INDEX IF NOT EXISTS idx_petition_signatures_created_at ON petition_signatures(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);