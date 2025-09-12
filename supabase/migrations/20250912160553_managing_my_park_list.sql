-- Enable RLS on the park_users table
ALTER TABLE public.park_users ENABLE ROW LEVEL SECURITY;

-- Enable RLS on the parks table
ALTER TABLE public.parks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view parks in their own list"
ON public.park_users
FOR SELECT
TO authenticated
USING ( user_id = auth.uid() );

CREATE POLICY "Users can delete parks from their own list"
ON public.park_users
FOR DELETE
TO authenticated
USING ( user_id = auth.uid() );

CREATE POLICY "Users can add parks to their own list"
ON public.park_users
FOR INSERT
TO authenticated
WITH CHECK ( user_id = auth.uid() );


CREATE POLICY "Allow authenticated users to view all parks"
ON public.parks
FOR SELECT
TO authenticated
USING (true);