-- Read-side aggregation for the portfolio ledger (holdings, running average
-- cost, realized P&L, and unrealized P&L against the latest price snapshot).
-- security_invoker = true is required so these views enforce RLS as the
-- querying user, not as the view owner (Postgres default without it would
-- silently bypass the owner-scoped policies on the base tables).

create view asset_source_stats with (security_invoker = true) as
select
  s.id as asset_source_id,
  s.user_id,
  s.name,
  s.metal_type,
  s.price_source,
  coalesce(buys.qty, 0) as total_bought_luong,
  coalesce(buys.cost, 0) as total_bought_cost,
  coalesce(sells.qty, 0) as total_sold_luong,
  coalesce(sells.realized_pl, 0) as total_realized_pl,
  coalesce(buys.qty, 0) - coalesce(sells.qty, 0) as current_holding_luong,
  case when coalesce(buys.qty, 0) = 0 then 0 else buys.cost / buys.qty end as running_avg_cost_per_luong
from asset_sources s
left join (
  select asset_source_id, sum(quantity_luong) as qty, sum(total_amount) as cost
  from transactions
  where type = 'buy'
  group by asset_source_id
) buys on buys.asset_source_id = s.id
left join (
  select asset_source_id, sum(quantity_luong) as qty, sum(realized_pl) as realized_pl
  from transactions
  where type = 'sell'
  group by asset_source_id
) sells on sells.asset_source_id = s.id;

create view asset_source_latest_price with (security_invoker = true) as
select distinct on (asset_source_id)
  asset_source_id,
  price_per_luong,
  recorded_at,
  source
from price_snapshots
order by asset_source_id, recorded_at desc;

create view asset_source_summary with (security_invoker = true) as
select
  st.*,
  lp.price_per_luong as latest_price_per_luong,
  lp.recorded_at as latest_price_recorded_at,
  lp.source as latest_price_source,
  st.current_holding_luong * (coalesce(lp.price_per_luong, 0) - st.running_avg_cost_per_luong) as unrealized_pl
from asset_source_stats st
left join asset_source_latest_price lp on lp.asset_source_id = st.asset_source_id;
