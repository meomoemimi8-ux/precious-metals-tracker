-- Adds "chỉ" (1 chỉ = 1/10 lượng = 3.75g) as a supported quantity unit.
-- Gold bought from small local shops (e.g. "Vàng Tư") is commonly quoted in
-- chỉ rather than lượng — the same real-world unit mismatch that motivated
-- supporting kg for silver.

drop view if exists asset_source_summary;
drop view if exists asset_source_stats;

alter table transactions drop constraint transactions_quantity_unit_check;
alter table transactions add constraint transactions_quantity_unit_check
  check (quantity_unit in ('kg', 'luong', 'chi'));

alter table transactions drop column quantity_luong;
alter table transactions add column quantity_luong numeric generated always as (
  case
    when quantity_unit = 'kg' then quantity_input * (1000.0 / 37.5)
    when quantity_unit = 'chi' then quantity_input * 0.1
    else quantity_input
  end
) stored;

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

create view asset_source_summary with (security_invoker = true) as
select
  st.*,
  lp.price_per_luong as latest_price_per_luong,
  lp.recorded_at as latest_price_recorded_at,
  lp.source as latest_price_source,
  st.current_holding_luong * (coalesce(lp.price_per_luong, 0) - st.running_avg_cost_per_luong) as unrealized_pl
from asset_source_stats st
left join asset_source_latest_price lp on lp.asset_source_id = st.asset_source_id;
