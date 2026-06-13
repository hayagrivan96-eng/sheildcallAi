-- ShieldCall AI - Database Schema (Supabase PostgreSQL)

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Profiles Table (linked to Supabase Auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    health_score INT DEFAULT 100 CHECK (health_score >= 0 AND health_score <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. Scam Reports Table (Community reported scams)
CREATE TABLE IF NOT EXISTS public.scam_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    phone_number VARCHAR(50) NOT NULL,
    scam_type VARCHAR(100) NOT NULL,
    description TEXT,
    evidence_url TEXT,
    reputation_score INT DEFAULT 1 CHECK (reputation_score >= 1 AND reputation_score <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3. Threat Logs Table (Individual scanned phone calls/text transcripts)
CREATE TABLE IF NOT EXISTS public.threat_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    caller_number VARCHAR(50) NOT NULL,
    transcript TEXT NOT NULL,
    risk_score INT DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
    threat_type VARCHAR(100) DEFAULT 'Safe',
    confidence INT DEFAULT 0 CHECK (confidence >= 0 AND confidence <= 100),
    behavior_profile JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 4. Blocked Numbers Table
CREATE TABLE IF NOT EXISTS public.blocked_numbers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    phone_number VARCHAR(50) NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(user_id, phone_number)
);

-- 5. Emergency Alerts Table (SOS triggers)
CREATE TABLE IF NOT EXISTS public.emergency_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Resolved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 6. Family Networks Table (linked family safety accounts)
CREATE TABLE IF NOT EXISTS public.family_networks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    primary_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    member_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(primary_user_id, member_user_id)
);

-- 7. Blockchain Logs Table (tamper-proof audit logs)
CREATE TABLE IF NOT EXISTS public.blockchain_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES public.scam_reports(id) ON DELETE CASCADE,
    block_hash VARCHAR(64) NOT NULL,
    prev_hash VARCHAR(64) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_scam_reports_phone ON public.scam_reports(phone_number);
CREATE INDEX IF NOT EXISTS idx_threat_logs_user ON public.threat_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_blocked_numbers_user ON public.blocked_numbers(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_user ON public.emergency_alerts(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scam_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threat_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_networks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blockchain_logs ENABLE ROW LEVEL SECURITY;

-- Setup RLS Policies (Example: Users can read their own data)
CREATE POLICY users_self_read ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY threat_logs_self_read ON public.threat_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY threat_logs_self_insert ON public.threat_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY blocked_numbers_self_all ON public.blocked_numbers FOR ALL USING (auth.uid() = user_id);
CREATE POLICY emergency_alerts_self_all ON public.emergency_alerts FOR ALL USING (auth.uid() = user_id);
