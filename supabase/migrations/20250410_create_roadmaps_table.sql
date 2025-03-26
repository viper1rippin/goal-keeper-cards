
-- Create roadmaps table
CREATE TABLE IF NOT EXISTS roadmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  items JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to select only their own roadmaps
CREATE POLICY "Users can view their own roadmaps" 
  ON roadmaps FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy to allow users to insert their own roadmaps
CREATE POLICY "Users can insert their own roadmaps" 
  ON roadmaps FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own roadmaps
CREATE POLICY "Users can update their own roadmaps" 
  ON roadmaps FOR UPDATE 
  USING (auth.uid() = user_id);

-- Policy to allow users to delete their own roadmaps
CREATE POLICY "Users can delete their own roadmaps" 
  ON roadmaps FOR DELETE 
  USING (auth.uid() = user_id);

-- Create function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_roadmaps_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function before update
CREATE TRIGGER update_roadmaps_updated_at_trigger
BEFORE UPDATE ON roadmaps
FOR EACH ROW
EXECUTE FUNCTION update_roadmaps_updated_at();
