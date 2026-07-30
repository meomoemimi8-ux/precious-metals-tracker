import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getPortfolioSummary,
  getPortfolioValueHistory,
  listAssetSources,
  totalPortfolio,
} from "@/lib/portfolio/queries";
import { AssetSourceForm } from "@/components/portfolio/AssetSourceForm";
import { TransactionForm } from "@/components/portfolio/TransactionForm";
import { TotalsSummary } from "@/components/portfolio/TotalsSummary";
import { HoldingsList } from "@/components/portfolio/HoldingsList";
import { GrowthChart } from "@/components/portfolio/GrowthChart";
import { logout } from "./actions";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login");
  }

  const [assetSources, summary, valueHistory] = await Promise.all([
    listAssetSources(),
    getPortfolioSummary(),
    getPortfolioValueHistory(),
  ]);
  const totals = totalPortfolio(summary);

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Danh mục đầu tư</h1>
        <form action={logout}>
          <button type="submit" className="text-sm text-neutral-600 underline">
            Đăng xuất
          </button>
        </form>
      </div>

      <TotalsSummary totals={totals} />

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-neutral-600">Tăng trưởng danh mục</h2>
        <GrowthChart data={valueHistory} />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-neutral-600">Tài sản đang theo dõi</h2>
        <HoldingsList summary={summary} />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-neutral-600">Thêm tài sản mới</h2>
        <AssetSourceForm />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-neutral-600">Ghi nhận giao dịch</h2>
        <TransactionForm assetSources={assetSources} />
      </section>
    </main>
  );
}
