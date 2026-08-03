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
import { SetPasswordForm } from "@/components/portfolio/SetPasswordForm";
import { logout } from "./actions";

function Card({
  title,
  emoji,
  children,
}: {
  title: string;
  emoji: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-card-border bg-card p-4 shadow-sm sm:p-5">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground/70">
        <span>{emoji}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

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
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-4 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-xl font-bold text-foreground">
          <span>🪙</span> Danh mục đầu tư
        </h1>
        <form action={logout}>
          <button type="submit" className="text-sm text-foreground/50 underline">
            Đăng xuất
          </button>
        </form>
      </div>

      <TotalsSummary totals={totals} />

      <Card title="Tăng trưởng danh mục" emoji="📈">
        <GrowthChart data={valueHistory} />
      </Card>

      <Card title="Tài sản đang theo dõi" emoji="✨">
        <HoldingsList summary={summary} />
      </Card>

      <Card title="Thêm tài sản mới" emoji="➕">
        <AssetSourceForm />
      </Card>

      <Card title="Ghi nhận giao dịch" emoji="📝">
        <TransactionForm assetSources={assetSources} />
      </Card>

      <Card title="Đăng nhập nhanh hơn" emoji="🔑">
        <SetPasswordForm />
      </Card>
    </main>
  );
}
