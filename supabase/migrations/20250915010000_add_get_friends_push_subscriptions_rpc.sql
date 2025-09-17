-- Create RPC function to get active push subscriptions for all friends of a user
-- This function will be called from the webhook when a user checks in

create or replace function public.get_friends_push_subscriptions(target_user_id uuid)
returns table (
  user_id uuid,
  endpoint text,
  p256dh_key varchar(255),
  auth_key varchar(255),
  user_agent_info jsonb
)
language plpgsql
security definer
as $$
begin
  -- Return active push subscriptions for all friends of the target user
  return query
  select
    ps.user_id,
    ps.endpoint,
    ps.p256dh_key,
    ps.auth_key,
    ps.user_agent_info
  from push_subscriptions ps
  inner join (
    -- Get all friends of the target user
    -- Since friendships uses ordered IDs (user_id_1 < user_id_2),
    -- we need to check both directions
    select
      case
        when f.user_id_1 = target_user_id then f.user_id_2
        else f.user_id_1
      end as friend_id
    from friendships f
    where f.user_id_1 = target_user_id or f.user_id_2 = target_user_id
  ) friends on ps.user_id = friends.friend_id
  where ps.status = 'active'::push_subscription_status
  order by ps.created_at desc;
end;
$$;

-- Grant execution permission to authenticated users
grant execute on function public.get_friends_push_subscriptions(uuid) to authenticated;