"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useKms } from "@/lib/store/kms-store";
import { formatDate } from "@/lib/utils";
import { EmptyState, ErrorState, LinkButton, LoadingBlocks, StatusBadge, SurfaceCard } from "@/components/kms/primitives";

export default function KnowledgeDetailPage() {
  const params = useParams<{ id: string }>();
  const { data, loading, error, retryLoad } = useKms();
  const item = data.knowledge.find((entry) => entry.id === params.id);
  const activeVersion = data.versions.find((version) => version.id === item?.activeVersionId) ?? data.versions.find((version) => version.knowledgeId === item?.id);

  if (error) return <div className="pt-12"><ErrorState message={error} onRetry={retryLoad} /></div>;
  if (loading) return <div className="pt-12"><LoadingBlocks rows={4} /></div>;
  if (!item) return <div className="pt-12"><EmptyState title="Pengetahuan tidak ditemukan" description="Entri mungkin sudah dipindahkan atau tidak tersedia pada data ini." action={<LinkButton href="/knowledge">Kembali ke pencarian</LinkButton>} /></div>;

  const accentWord = item.title.split(" ").at(-1);
  const titleBefore = item.title.slice(0, item.title.length - (accentWord?.length ?? 0));
  const steps = item.id === "panduan-struk-parkir" ? [["Kasir", "Sampaikan kegunaan struk."], ["Pelanggan", "Simpan bukti transaksi."], ["Parkir", "Verifikasi sesuai aturan aktif."]] : item.touchpoints.slice(0, 3).map((value) => [value, "Gunakan informasi aktif pada tahap ini."]);

  return (
    <>
      <div className="pt-8 md:pt-9"><Link href="/knowledge" className="inline-flex min-h-11 items-center gap-2 rounded-md text-sm text-muted hover:text-accent"><ArrowLeft size={16} /> Kembali ke hasil pencarian</Link></div>
      <header className="py-4 md:py-7">
        <h1 className="max-w-3xl font-display text-[clamp(2.7rem,4vw,3.35rem)] font-medium leading-[1.05] tracking-[-2px]">{titleBefore}<span className="font-semibold text-accent">{accentWord}</span>.</h1>
        <div className="mt-5 flex flex-wrap gap-3"><StatusBadge status={item.status} /><span className="inline-flex min-h-7 items-center rounded-md border border-border bg-surface-muted px-3 text-[10px] font-bold tracking-[.7px] text-muted">{item.category.toUpperCase()}</span></div>
      </header>
      <div className="grid gap-6 xl:grid-cols-[1.9fr_1fr]">
        <SurfaceCard className="p-7 md:p-8">
          <p className="max-w-3xl text-[18px] leading-8 text-foreground md:text-xl">{item.content}</p>
          <div className="mt-8 border-t border-border pt-7"><div className="grid gap-5 md:grid-cols-3">{steps.map(([name, desc], index) => <div key={name} className="relative"><div className="flex items-center gap-3"><span className="grid h-7 w-7 place-items-center rounded-full bg-[#123b29] text-xs font-bold text-accent">{index + 1}</span><h2 className="font-semibold">{name}</h2>{index < steps.length - 1 && <ArrowRight className="ml-auto hidden text-dim md:block" size={18} />}</div><p className="mt-3 text-xs leading-5 text-muted">{desc}</p></div>)}</div></div>
          <p className="mt-8 border-t border-border pt-7 text-[13px] leading-6 text-muted">Untuk informasi yang tidak sesuai di lapangan, laporkan agar dapat ditinjau.</p>
        </SurfaceCard>
        <SurfaceCard className="p-7 md:p-8">
          <div className="space-y-4">{[["Sumber", item.source], ["Pemilik", item.owner], ["Berlaku", `${formatDate(item.effectiveDate)}–${formatDate(item.expiryDate)}`], ["Versi", `${activeVersion?.version ?? "v1.0"} · ${activeVersion?.reviewer ? "disetujui reviewer" : "belum disetujui"}`], ["Touchpoint", item.touchpoints.join(" / ")]].map(([label, value]) => <p key={label} className="text-sm leading-6"><span className="text-muted">{label}:</span> {value}</p>)}</div>
          <div className="mt-8 space-y-2"><LinkButton href={`/reports/new?knowledge=${item.id}`} className="w-full">Laporkan informasi tidak sesuai <ArrowRight size={16} /></LinkButton><Link href={`/knowledge/${item.id}/history`} className="flex min-h-11 items-center justify-center rounded-lg text-xs font-bold text-muted hover:text-accent">Lihat riwayat versi</Link></div>
        </SurfaceCard>
      </div>
    </>
  );
}
