-- ClinicalGoTo Database Initialization Script
-- This script sets up the PostgreSQL database schema

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create subscribers table
CREATE TABLE IF NOT EXISTS subscribers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    consent BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    email_verified BOOLEAN NOT NULL DEFAULT false,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at TIMESTAMP WITH TIME ZONE NULL
);

-- Create clinical trials cache table
CREATE TABLE IF NOT EXISTS clinical_trials_cache (
    id SERIAL PRIMARY KEY,
    nct_id VARCHAR(50) UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    status VARCHAR(50),
    phase VARCHAR(50),
    condition VARCHAR(255),
    sponsor VARCHAR(255),
    contact_info JSONB,
    eligibility_criteria TEXT,
    cached_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '24 hours')
);

-- Create email logs table
CREATE TABLE IF NOT EXISTS email_logs (
    id SERIAL PRIMARY KEY,
    subscriber_id UUID REFERENCES subscribers(id) ON DELETE CASCADE,
    email_type VARCHAR(50) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'sent',
    error_message TEXT
);

-- Create search logs table for analytics
CREATE TABLE IF NOT EXISTS search_logs (
    id SERIAL PRIMARY KEY,
    location VARCHAR(255) NOT NULL,
    condition VARCHAR(255),
    results_count INTEGER DEFAULT 0,
    ip_address INET,
    user_agent TEXT,
    searched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_active ON subscribers(is_active);
CREATE INDEX IF NOT EXISTS idx_subscribers_created_at ON subscribers(created_at);
CREATE INDEX IF NOT EXISTS idx_clinical_trials_nct_id ON clinical_trials_cache(nct_id);
CREATE INDEX IF NOT EXISTS idx_clinical_trials_expires ON clinical_trials_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_email_logs_subscriber ON email_logs(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_search_logs_location ON search_logs(location);
CREATE INDEX IF NOT EXISTS idx_search_logs_searched_at ON search_logs(searched_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_subscribers_updated_at 
    BEFORE UPDATE ON subscribers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create view for active subscribers
CREATE OR REPLACE VIEW active_subscribers AS
SELECT 
    id,
    full_name,
    email,
    phone,
    address,
    consent,
    email_verified,
    preferences,
    created_at,
    updated_at
FROM subscribers
WHERE is_active = true AND unsubscribed_at IS NULL;

-- Create view for subscriber statistics
CREATE OR REPLACE VIEW subscriber_stats AS
SELECT 
    COUNT(*) as total_subscribers,
    COUNT(*) FILTER (WHERE is_active = true) as active_subscribers,
    COUNT(*) FILTER (WHERE email_verified = true) as verified_subscribers,
    COUNT(*) FILTER (WHERE unsubscribed_at IS NOT NULL) as unsubscribed_count,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_this_month,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as new_this_week
FROM subscribers;

-- Insert sample data for development (comment out for production)
-- INSERT INTO subscribers (full_name, email, phone, address, consent, email_verified) VALUES
-- ('John Doe', 'john.doe@example.com', '+1-555-123-4567', '123 Main St, Anytown, ST 12345', true, true),
-- ('Jane Smith', 'jane.smith@example.com', '+1-555-987-6543', '456 Oak Ave, Somewhere, ST 67890', true, false);

-- Grant permissions (adjust as needed for your setup)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO clinicalgoto;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO clinicalgoto;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO clinicalgoto;
