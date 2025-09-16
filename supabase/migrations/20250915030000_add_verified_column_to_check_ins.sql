-- Add verified column to check_ins table
-- This will track whether a user's check-in was verified to be within the park's proximity

ALTER TABLE public.check_ins
ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false NOT NULL;

-- Add index for faster queries on verified status
CREATE INDEX IF NOT EXISTS check_ins_verified_idx ON public.check_ins (verified);

-- Add comment to explain the column
COMMENT ON COLUMN public.check_ins.verified IS 'Indicates if the user was verified to be within 100 meters of the park when checking in';