"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { useKms } from "@/lib/store/kms-store";
import { formatDate, formatRupiah, promotionStatus } from "@/lib/utils";
import { EmptyState, ErrorState, LoadingBlocks, PageIntro, SurfaceCard } from "@/components/kms/primitives";

const filters = [{ value: "active", label: "AKTIF" }, { value: "ending_soon", label: "AKAN BERAKHIR" }, { value: "expired", label: "KEDALUWARSA" }, { value: "archived", label: "ARSIP" }] as const;

export default function PromotionsPage() {
  const { data, loading, error, retryLoad } = useKms();
  const [filter, setFilter] = useState<(typeof filters)[number]["value"]>("active");
  const promos = data.promotions.filter((promo) => promotionStatus(promo) === filter);

  return (
    <>
      <PageIntro before="Syarat promo, terlihat" accent="jelas." description="Periksa masa berlaku dan syarat sebelum menyampaikan penawaran atau menerima pembayaran." compact />
      <div className="flex flex-wrap gap-3" role="tablist" aria-label="Filter promosi">{filters.map((item) => <button key={item.value} role="tab" aria-selected={filter === item.value} onClick={() => setFilter(item.value)} className={`min-h-10 rounded-md border px-4 text-[10px] font-bold tracking-[.7px] ${filter === item.value ? "border-[#166534] bg-[#123b29] text-success" : "border-border bg-surface-muted text-muted"}`}>{item.label}</button>)}</div>
      {error ? <div className="mt-6"><ErrorState message={error} onRetry={retryLoad} /></div> : loading ? <div className="mt-6"><LoadingBlocks rows={3} /></div> : promos.length === 0 ? <div className="mt-6"><EmptyState title="Tidak ada promosi" description="Belum ada data pada status yang dipilih." /></div> : (
        <div className="mt-6 grid gap-6 xl:grid-cols-[1.85fr_1fr]">
          <div className="space-y-5">{promos.map((promo, index) => { const status = promotionStatus(promo); return <SurfaceCard key={promo.id} className="overflow-hidden"><div className={`relative p-7 md:p-8 ${index === 0 ? "bg-[radial-gradient(circle_at_85%_30%,rgba(5,150,105,.2),transparent_42%)]" : ""}`}><div className="flex justify-end"><span className={`rounded-md border px-3 py-1.5 text-[10px] font-bold ${status === "active" ? "border-[#166534] bg-[#123b29] text-success" : status === "ending_soon" ? "border-[#675b24] bg-[#3a3315] text-warning" : "border-border bg-surface-muted text-muted"}`}>{status === "active" ? "AKTIF" : status === "ending_soon" ? "AKAN BERAKHIR" : status === "expired" ? "KEDALUWARSA" : "ARSIP"}</span></div><h2 className="mt-5 font-display text-[clamp(1.8rem,3vw,2.45rem)] font-semibold tracking-[-1px]">{promo.name}</h2><div className="mt-8 grid gap-5 border-t border-border pt-7 md:grid-cols-3"><Meta label="Min. transaksi" value={formatRupiah(promo.minimumTransaction)} /><Meta label="Metode bayar" value={promo.paymentMethods.join(", ")} /><Meta label="Periode" value={`${formatDate(promo.periodStart)}–${formatDate(promo.periodEnd)}`} /></div></div></SurfaceCard>; })}</div>
          <SurfaceCard className="h-fit p-7 md:p-8"><h2 className="font-display text-2xl font-semibold leading-8">Yang perlu dikonfirmasi kepada pelanggan</h2><ul className="mt-8 space-y-5">{["Kesesuaian paket / item tambahan", "Nilai minimum transaksi", "Metode pembayaran yang memenuhi", "Periode, kuota, dan pengecualian"].map((value) => <li key={value} className="flex items-center gap-3 text-sm"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#123b29] text-success"><Check size={13} /></span>{value}</li>)}</ul></SurfaceCard>
        </div>
      )}
    </>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return <p className="text-[15px] leading-6"><span className="text-muted">{label}:</span> <span className="font-semibold">{value}</span></p>;
}
