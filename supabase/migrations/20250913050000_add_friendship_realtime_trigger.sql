-- Create function to handle new friendship broadcasts
create or replace function public.handle_new_friend()
returns trigger
language plpgsql
SECURITY DEFINER SET search_path = public
as $$
begin
  -- Broadcast to user_id_1
  perform realtime.broadcast_changes(
    'user_friends:' || NEW.user_id_1,
    TG_OP,
    TG_OP,
    TG_TABLE_NAME,
    TG_TABLE_SCHEMA,
    NEW,
    OLD
  );

  -- Broadcast to user_id_2
  perform realtime.broadcast_changes(
    'user_friends:' || NEW.user_id_2,
    TG_OP,
    TG_OP,
    TG_TABLE_NAME,
    TG_TABLE_SCHEMA,
    NEW,
    OLD
  );

  return null;
end;
$$;

-- Create the trigger to call the function when a new friendship is created
CREATE OR REPLACE TRIGGER on_friendship_created
  AFTER INSERT ON public.friendships
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_friend();