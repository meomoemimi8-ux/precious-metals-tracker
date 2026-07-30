// Scheduled Edge Function: fetches current market prices for every asset
// source with an `auto:*` price_source and records a new price_snapshots row.
// One source's failure is caught and reported individually so it never blocks
// the others (see design.md, "Risks / Trade-offs").
import { createClient } from "npm:@supabase/supabase-js@2";

// vang.today: free, no API key, updates every few minutes. DOHNL = DOJI Hanoi.
async function fetchDojiPrice(): Promise<number> {
  const res = await fetch("https://www.vang.today/api/prices");
  if (!res.ok) throw new Error(`vang.today responded ${res.status}`);
  const json = await res.json();
  const doji = json?.prices?.DOHNL;
  if (!doji || typeof doji.buy !== "number") {
    throw new Error("DOHNL price missing from vang.today response");
  }
  return doji.buy;
}

// giabac.vn is Phú Quý's own silver price board, server-rendered HTML (no JS
// needed). We scrape the "Bạc miếng Phú Quý 999 1 lượng" row and read its
// "GIÁ MUA VÀO" (dealer buy-in price — what you'd realize by selling) cell.
async function fetchPhuQuySilverPrice(): Promise<number> {
  const res = await fetch("https://giabac.vn/");
  if (!res.ok) throw new Error(`giabac.vn responded ${res.status}`);
  const html = await res.text();

  const row = html.match(/Bạc miếng[\s\S]*?1 lượng[\s\S]*?<\/tr>/);
  if (!row) {
    throw new Error("Could not find the Phú Quý 1 lượng silver row on giabac.vn");
  }

  const cells = [...row[0].matchAll(/fw-bolder">([\d,]+)</g)].map((m) =>
    Number(m[1].replace(/,/g, "")),
  );
  if (cells.length < 1 || !Number.isFinite(cells[0])) {
    throw new Error("Could not parse the Phú Quý silver price cell");
  }
  return cells[0];
}

const FETCHERS: Record<string, () => Promise<number>> = {
  "auto:doji": fetchDojiPrice,
  "auto:phuquy": fetchPhuQuySilverPrice,
};

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: assetSources, error } = await supabase
    .from("asset_sources")
    .select("id, price_source")
    .like("price_source", "auto:%");

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  const results = [];
  for (const source of assetSources ?? []) {
    const fetchPrice = FETCHERS[source.price_source];
    try {
      if (!fetchPrice) throw new Error(`No fetcher for ${source.price_source}`);
      const price = await fetchPrice();
      const { error: insertError } = await supabase.from("price_snapshots").insert({
        asset_source_id: source.id,
        price_per_luong: price,
        source: "auto",
      });
      if (insertError) throw insertError;
      results.push({ asset_source_id: source.id, status: "ok", price });
    } catch (err) {
      results.push({
        asset_source_id: source.id,
        status: "error",
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return new Response(JSON.stringify({ results }), {
    headers: { "Content-Type": "application/json" },
  });
});
