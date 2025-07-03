/*
  # User Data Persistence Schema

  1. New Tables
    - `profiles` - Extended user profile information
    - `chat_messages` - Store chat history for each user
    - `tryon_sessions` - Store virtual try-on sessions and results
    - `saved_looks` - Store user's saved fashion looks
    - `user_preferences` - Store user style preferences and settings
    - `voice_messages` - Store voice message metadata and transcriptions

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Ensure data privacy and security

  3. Features
    - Chat history persistence
    - Try-on session storage
    - Voice message handling
    - User preferences tracking
    - Saved looks management
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  subscription_tier text DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium')),
  total_tryons integer DEFAULT 0,
  saved_looks integer DEFAULT 0,
  onboarding_completed boolean DEFAULT false,
  style_preferences jsonb DEFAULT '{}'::jsonb
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message_text text NOT NULL,
  is_user_message boolean NOT NULL DEFAULT true,
  message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'voice', 'image')),
  image_url text,
  voice_url text,
  voice_transcription text,
  voice_duration integer, -- in seconds
  ai_analysis jsonb,
  created_at timestamptz DEFAULT now(),
  session_id uuid DEFAULT gen_random_uuid()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Try-on sessions table
CREATE TABLE IF NOT EXISTS tryon_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_image_url text NOT NULL,
  clothing_image_url text NOT NULL,
  result_image_url text,
  ai_score numeric(3,1) DEFAULT 0.0,
  ai_feedback jsonb DEFAULT '{}'::jsonb,
  processing_status text DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  pose_adjustments jsonb DEFAULT '[]'::jsonb,
  style_recommendations jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  is_saved boolean DEFAULT false
);

ALTER TABLE tryon_sessions ENABLE ROW LEVEL SECURITY;

-- Saved looks table
CREATE TABLE IF NOT EXISTS saved_looks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tryon_session_id uuid REFERENCES tryon_sessions(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  image_url text NOT NULL,
  tags text[] DEFAULT '{}',
  category text,
  ai_score numeric(3,1),
  is_favorite boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE saved_looks ENABLE ROW LEVEL SECURITY;

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  style_type text,
  preferred_colors text[] DEFAULT '{}',
  body_type text,
  size_preferences jsonb DEFAULT '{}'::jsonb,
  occasion_preferences text[] DEFAULT '{}',
  budget_range text,
  brand_preferences text[] DEFAULT '{}',
  notification_settings jsonb DEFAULT '{"push": true, "email": true, "style_tips": true}'::jsonb,
  privacy_settings jsonb DEFAULT '{"profile_public": false, "share_looks": true}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Voice messages table
CREATE TABLE IF NOT EXISTS voice_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  chat_message_id uuid REFERENCES chat_messages(id) ON DELETE CASCADE,
  audio_url text NOT NULL,
  transcription text,
  duration integer NOT NULL, -- in seconds
  language text DEFAULT 'en',
  confidence_score numeric(3,2),
  processing_status text DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz
);

ALTER TABLE voice_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Chat messages policies
CREATE POLICY "Users can read own chat messages"
  ON chat_messages
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat messages"
  ON chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chat messages"
  ON chat_messages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Try-on sessions policies
CREATE POLICY "Users can read own tryon sessions"
  ON tryon_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tryon sessions"
  ON tryon_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tryon sessions"
  ON tryon_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Saved looks policies
CREATE POLICY "Users can read own saved looks"
  ON saved_looks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved looks"
  ON saved_looks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved looks"
  ON saved_looks
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved looks"
  ON saved_looks
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- User preferences policies
CREATE POLICY "Users can read own preferences"
  ON user_preferences
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Voice messages policies
CREATE POLICY "Users can read own voice messages"
  ON voice_messages
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own voice messages"
  ON voice_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own voice messages"
  ON voice_messages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Functions and Triggers

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_looks_updated_at
  BEFORE UPDATE ON saved_looks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_tryon_sessions_user_id ON tryon_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_tryon_sessions_created_at ON tryon_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_saved_looks_user_id ON saved_looks(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_looks_created_at ON saved_looks(created_at);
CREATE INDEX IF NOT EXISTS idx_voice_messages_user_id ON voice_messages(user_id);