-- Schedules the fetch-prices Edge Function to run hourly via pg_cron + pg_net.
--
-- One-time manual step required before this works (NOT included here, since it
-- contains a secret that must never be committed to version control): store the
-- service_role key in Vault via the SQL editor:
--
--   select vault.create_secret(
--     '<service_role_key>',
--     'edge_function_service_role_key',
--     'Used by pg_cron to invoke the fetch-prices edge function'
--   );

create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

select cron.schedule(
  'fetch-prices-hourly',
  '0 * * * *',
  $$
  select net.http_post(
    url := 'https://nnecwjcztykbzbuoykvh.supabase.co/functions/v1/fetch-prices',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'edge_function_service_role_key')
    )
  );
  $$
);
