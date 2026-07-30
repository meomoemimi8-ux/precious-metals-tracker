-- Core schema for the precious-metals portfolio tracker.
-- See openspec/changes/add-precious-metals-tracker/design.md for rationale.

create table asset_sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  metal_type text not null check (metal_type in ('gold', 'silver')),
  price_source text not null check (price_source in ('auto:doji', 'auto:phuquy', 'manual')),
  created_at timestamptz not null default now()
);

create index asset_sources_user_id_idx on asset_sources (user_id);

-- quantity_luong is derived purely from quantity_input + quantity_unit (1 kg = 1000/37.5 luong),
-- so it's a generated column: the conversion can never drift from the value actually stored.
create table transactions (
  id uuid primary key default gen_random_uuid(),
  asset_source_id uuid not null references asset_sources (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  type text not null check (type in ('buy', 'sell')),
  quantity_input numeric not null check (quantity_input > 0),
  quantity_unit text not null check (quantity_unit in ('kg', 'luong')),
  quantity_luong numeric generated always as (
    case when quantity_unit = 'kg' then quantity_input * (1000.0 / 37.5) else quantity_input end
  ) stored,
  price_per_luong numeric not null check (price_per_luong >= 0),
  total_amount numeric not null check (total_amount >= 0),
  avg_cost_basis_at_sale numeric,
  realized_pl numeric,
  note text,
  created_at timestamptz not null default now(),
  constraint sell_fields_locked_together check (
    (type = 'sell' and avg_cost_basis_at_sale is not null and realized_pl is not null)
    or
    (type = 'buy' and avg_cost_basis_at_sale is null and realized_pl is null)
  )
);

create index transactions_asset_source_date_idx on transactions (asset_source_id, date);
create index transactions_user_id_idx on transactions (user_id);

create table price_snapshots (
  id uuid primary key default gen_random_uuid(),
  asset_source_id uuid not null references asset_sources (id) on delete cascade,
  recorded_at timestamptz not null default now(),
  price_per_luong numeric not null check (price_per_luong >= 0),
  source text not null check (source in ('auto', 'manual'))
);

create index price_snapshots_asset_source_recorded_idx on price_snapshots (asset_source_id, recorded_at desc);

alter table asset_sources enable row level security;
alter table transactions enable row level security;
alter table price_snapshots enable row level security;

create policy "asset_sources owner select" on asset_sources for select
  using (user_id = auth.uid());
create policy "asset_sources owner insert" on asset_sources for insert
  with check (user_id = auth.uid());
create policy "asset_sources owner update" on asset_sources for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "asset_sources owner delete" on asset_sources for delete
  using (user_id = auth.uid());

create policy "transactions owner select" on transactions for select
  using (user_id = auth.uid());
create policy "transactions owner insert" on transactions for insert
  with check (user_id = auth.uid());
create policy "transactions owner update" on transactions for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "transactions owner delete" on transactions for delete
  using (user_id = auth.uid());

-- price_snapshots has no user_id column; ownership is derived through the asset source.
create policy "price_snapshots owner select" on price_snapshots for select
  using (exists (
    select 1 from asset_sources s
    where s.id = price_snapshots.asset_source_id and s.user_id = auth.uid()
  ));
create policy "price_snapshots owner insert" on price_snapshots for insert
  with check (exists (
    select 1 from asset_sources s
    where s.id = price_snapshots.asset_source_id and s.user_id = auth.uid()
  ));
create policy "price_snapshots owner delete" on price_snapshots for delete
  using (exists (
    select 1 from asset_sources s
    where s.id = price_snapshots.asset_source_id and s.user_id = auth.uid()
  ));
