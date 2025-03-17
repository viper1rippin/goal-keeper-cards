
-- First, add the user_id column to parent_goals table as nullable initially
ALTER TABLE public.parent_goals ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Add the user_id column to sub_goals table too
ALTER TABLE public.sub_goals ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Update RLS policies for parent_goals
CREATE POLICY "Users can only see their own parent goals" 
  ON public.parent_goals 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own parent goals" 
  ON public.parent_goals 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own parent goals" 
  ON public.parent_goals 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own parent goals" 
  ON public.parent_goals 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Update RLS policies for sub_goals
CREATE POLICY "Users can only see their own sub goals" 
  ON public.sub_goals 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own sub goals" 
  ON public.sub_goals 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own sub goals" 
  ON public.sub_goals 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own sub goals" 
  ON public.sub_goals 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Enable Row Level Security on both tables
ALTER TABLE public.parent_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_goals ENABLE ROW LEVEL SECURITY;

-- After migrating existing data, make the user_id column NOT NULL
-- This should be done in a separate migration after all existing data is updated
-- ALTER TABLE public.parent_goals ALTER COLUMN user_id SET NOT NULL;
-- ALTER TABLE public.sub_goals ALTER COLUMN user_id SET NOT NULL;
