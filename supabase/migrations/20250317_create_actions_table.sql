
-- Create actions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    position_x DECIMAL NOT NULL,
    position_y DECIMAL NOT NULL,
    project_id UUID NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.actions ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to select their own actions
CREATE POLICY "Users can view their own actions" 
ON public.actions FOR SELECT 
USING (auth.uid() = user_id);

-- Policy to allow users to insert their own actions
CREATE POLICY "Users can insert their own actions" 
ON public.actions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own actions
CREATE POLICY "Users can update their own actions" 
ON public.actions FOR UPDATE 
USING (auth.uid() = user_id);

-- Policy to allow users to delete their own actions
CREATE POLICY "Users can delete their own actions" 
ON public.actions FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to check if a table exists
CREATE OR REPLACE FUNCTION public.check_table_exists(table_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  table_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public'
    AND table_name = check_table_exists.table_name
  ) INTO table_exists;
  
  RETURN table_exists;
END;
$$;

-- Create function to get actions for a project
CREATE OR REPLACE FUNCTION public.get_actions_for_project(p_project_id uuid, p_user_id uuid)
RETURNS SETOF public.actions
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.actions
  WHERE project_id = p_project_id
  AND user_id = p_user_id
  ORDER BY created_at ASC;
END;
$$;

-- Create function to update an action
CREATE OR REPLACE FUNCTION public.update_action(
  p_id uuid,
  p_user_id uuid,
  p_content text,
  p_position_x decimal,
  p_position_y decimal
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.actions
  SET 
    content = p_content,
    position_x = p_position_x,
    position_y = p_position_y,
    updated_at = NOW()
  WHERE id = p_id AND user_id = p_user_id;
END;
$$;

-- Create function to update an action's position
CREATE OR REPLACE FUNCTION public.update_action_position(
  p_id uuid,
  p_user_id uuid,
  p_position_x decimal,
  p_position_y decimal
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.actions
  SET 
    position_x = p_position_x,
    position_y = p_position_y,
    updated_at = NOW()
  WHERE id = p_id AND user_id = p_user_id;
END;
$$;

-- Create function to delete an action
CREATE OR REPLACE FUNCTION public.delete_action(
  p_id uuid,
  p_user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.actions
  WHERE id = p_id AND user_id = p_user_id;
END;
$$;

-- Create function to create a new action
CREATE OR REPLACE FUNCTION public.create_action(
  p_content text,
  p_position_x decimal,
  p_position_y decimal,
  p_project_id uuid,
  p_user_id uuid
)
RETURNS public.actions
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_action public.actions;
BEGIN
  INSERT INTO public.actions (
    content,
    position_x,
    position_y,
    project_id,
    user_id
  ) VALUES (
    p_content,
    p_position_x,
    p_position_y,
    p_project_id,
    p_user_id
  )
  RETURNING * INTO new_action;
  
  RETURN new_action;
END;
$$;
