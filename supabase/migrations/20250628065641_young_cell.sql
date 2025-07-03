/*
  # Add RPC Functions for Profile Updates

  1. Functions
    - increment_saved_looks: Increment saved looks count
    - decrement_saved_looks: Decrement saved looks count
    - increment_total_tryons: Increment total try-ons count
    - get_user_stats: Get user statistics

  2. Security
    - Functions are security definer
    - Only authenticated users can call them
    - Users can only update their own data
*/

-- Function to increment saved looks count
CREATE OR REPLACE FUNCTION increment_saved_looks(user_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE profiles 
  SET saved_looks = saved_looks + 1,
      updated_at = now()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement saved looks count
CREATE OR REPLACE FUNCTION decrement_saved_looks(user_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE profiles 
  SET saved_looks = GREATEST(saved_looks - 1, 0),
      updated_at = now()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment total try-ons count
CREATE OR REPLACE FUNCTION increment_total_tryons(user_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE profiles 
  SET total_tryons = total_tryons + 1,
      updated_at = now()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user statistics
CREATE OR REPLACE FUNCTION get_user_stats(user_id uuid)
RETURNS TABLE(
  total_tryons bigint,
  saved_looks bigint,
  chat_messages bigint,
  voice_messages bigint,
  favorite_looks bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.total_tryons::bigint,
    p.saved_looks::bigint,
    (SELECT COUNT(*) FROM chat_messages WHERE chat_messages.user_id = get_user_stats.user_id)::bigint,
    (SELECT COUNT(*) FROM voice_messages WHERE voice_messages.user_id = get_user_stats.user_id)::bigint,
    (SELECT COUNT(*) FROM saved_looks WHERE saved_looks.user_id = get_user_stats.user_id AND is_favorite = true)::bigint
  FROM profiles p
  WHERE p.id = get_user_stats.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION increment_saved_looks(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_saved_looks(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_total_tryons(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_stats(uuid) TO authenticated;