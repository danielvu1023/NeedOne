-- Enable PostGIS extension for spatial operations
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Add geometry column to parks table for precise location data
-- This will be used alongside the existing text location field
ALTER TABLE public.parks
ADD COLUMN IF NOT EXISTS coordinates geography(POINT, 4326);

-- Create an index on the geometry column for better query performance
CREATE INDEX IF NOT EXISTS parks_coordinates_idx
ON public.parks USING GIST (coordinates);

-- Add a comment to explain the new column
COMMENT ON COLUMN public.parks.coordinates IS 'Geographic coordinates (longitude, latitude) in WGS84 format for spatial queries';

-- Create the is_user_near_park function
CREATE OR REPLACE FUNCTION public.is_user_near_park(
  park_id uuid,
  user_long float,
  user_lat float,
  distance_meters int DEFAULT 100
)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.parks AS p
    WHERE
      p.id = park_id
      AND p.coordinates IS NOT NULL
      AND ST_DWithin(
        p.coordinates,
        ST_SetSRID(ST_MakePoint(user_long, user_lat), 4326)::geography,
        distance_meters
      )
  );
END;
$$ LANGUAGE plpgsql;

-- Grant execution permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_user_near_park(uuid, float, float, int) TO authenticated;

-- Example of how to update existing parks with coordinates:
-- UPDATE public.parks
-- SET coordinates = ST_SetSRID(ST_MakePoint(-122.4194, 37.7749), 4326)::geography
-- WHERE id = 'your-park-id';