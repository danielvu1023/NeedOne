ALTER TABLE public.user_roles DROP CONSTRAINT user_roles_pkey;

-- This command removes the auto-incrementing property
ALTER TABLE public.user_roles ALTER COLUMN id DROP IDENTITY;

-- Change the column type to UUID and generate new UUIDs for existing rows
ALTER TABLE public.user_roles
ALTER COLUMN id TYPE UUID USING (gen_random_uuid());

-- Set the default value for new rows to automatically generate a UUID
ALTER TABLE public.user_roles
ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE public.user_roles ADD PRIMARY KEY (id);



ALTER TABLE public.role_permissions DROP CONSTRAINT role_permissions_pkey;

-- This command removes the auto-incrementing property
ALTER TABLE public.role_permissions ALTER COLUMN id DROP IDENTITY;

-- Change the column type to UUID and generate new UUIDs for existing rows
ALTER TABLE public.role_permissions
ALTER COLUMN id TYPE UUID USING (gen_random_uuid());

-- Set the default value for new rows to automatically generate a UUID
ALTER TABLE public.role_permissions
ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE public.role_permissions ADD PRIMARY KEY (id);