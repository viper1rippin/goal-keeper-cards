
-- Create avatars storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
SELECT 'avatars', 'avatars', true
WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'avatars'
);

-- Set up security policies for avatars bucket
INSERT INTO storage.policies (name, definition, owner, bucket_id, operation)
SELECT 'Avatar Public Access', '(bucket_id = ''avatars''::text)', auth.uid(), 'avatars', 'SELECT'
WHERE NOT EXISTS (
    SELECT 1 FROM storage.policies 
    WHERE bucket_id = 'avatars' AND operation = 'SELECT' AND name = 'Avatar Public Access'
);

INSERT INTO storage.policies (name, definition, owner, bucket_id, operation)
SELECT 'Users can upload their own avatars', '((bucket_id = ''avatars''::text) AND (auth.uid() = owner))', auth.uid(), 'avatars', 'INSERT'
WHERE NOT EXISTS (
    SELECT 1 FROM storage.policies 
    WHERE bucket_id = 'avatars' AND operation = 'INSERT' AND name = 'Users can upload their own avatars'
);

INSERT INTO storage.policies (name, definition, owner, bucket_id, operation)
SELECT 'Users can update their own avatars', '((bucket_id = ''avatars''::text) AND (auth.uid() = owner))', auth.uid(), 'avatars', 'UPDATE'
WHERE NOT EXISTS (
    SELECT 1 FROM storage.policies 
    WHERE bucket_id = 'avatars' AND operation = 'UPDATE' AND name = 'Users can update their own avatars'
);

INSERT INTO storage.policies (name, definition, owner, bucket_id, operation)
SELECT 'Users can delete their own avatars', '((bucket_id = ''avatars''::text) AND (auth.uid() = owner))', auth.uid(), 'avatars', 'DELETE'
WHERE NOT EXISTS (
    SELECT 1 FROM storage.policies 
    WHERE bucket_id = 'avatars' AND operation = 'DELETE' AND name = 'Users can delete their own avatars'
);
