"use client";

import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { useDeferredValue, useState } from "react";
import { useKms } from "@/lib/store/kms-store";
import type { KnowledgeStatus } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { EmptyState, ErrorState, LoadingBlocks, PageIntro, StatusBadge, SurfaceCard } from "@/components/kms/primitives";

export default function KnowledgeSearchPage() {
  const { data, loading, error, retryLoad } = useKms();
  const [query, setQuery] = useState("parkir");
  const [category, setCategory] = useState("all");
  const [touchpoint, setTouchpoint] = useState("all");
  const [status, setStatus] = useState("all");
  const deferredQuery = useDeferredValue(query.toLowerCase());

  const categories = Array.from(new Set(data.knowledge.map((item) => item.category)));
  const touchpoints = Array.from(new Set(data.knowledge.flatMap((item) => item.touchpoints)));
  const results = data.knowledge.filter((item) => {
    const haystack = `${item.title} ${item.summary} ${item.content} ${item.category} ${item.touchpoints.join(" ")}`.toLowerCase();
    return (!deferredQuery || haystack.includes(deferredQuery)) && (category === "all" || item.category === category) && (touchpoint === "all" || item.touchpoints.includes(touchpoint)) && (status === "all" || item.status === status);
  });

  return (
    <>
      <PageIntro before="Temukan informasi yang" accent="tepat." description="Cari menurut kata kunci, kategori, touchpoint, dan status validitas." compact />
      {error ? <ErrorState message={error} onRetry={retryLoad} /> : (
        <>
          <SurfaceCard className="p-5 md:p-6">
            <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
              <label className="relative block">
                <span className="sr-only">Kata kunci pencarian</span>
                <Search className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-muted" size={20} />
                <input value={query} onChange={(event) => setQuery(event.target.value)} className="field-control h-[58px] pl-14 text-lg" placeholder="Cari pengetahuan layanan..." />
              </label>
              <div className="flex min-h-[58px] min-w-56 items-center justify-center rounded-lg bg-primary px-7 text-sm font-bold text-primary-foreground">{results.length} informasi ditemukan</div>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <label><span className="field-label">Kategori</span><select value={category} onChange={(e) => setCategory(e.target.value)} className="field-control"><option value="all">Semua kategori</option>{categories.map((value) => <option key={value}>{value}</option>)}</select></label>
              <label><span className="field-label">Touchpoint</span><select value={touchpoint} onChange={(e) => setTouchpoint(e.target.value)} className="field-control"><option value="all">Semua touchpoint</option>{touchpoints.map((value) => <option key={value}>{value}</option>)}</select></label>
              <label><span className="field-label">Status</span><select value={status} onChange={(e) => setStatus(e.target.value)} className="field-control"><option value="all">Semua status</option><option value="active">Aktif</option><option value="review">Menunggu review</option><option value="draft">Draf</option><option value="needs_revision">Perlu revisi</option><option value="expired">Kedaluwarsa</option><option value="archived">Arsip</option></select></label>
            </div>
          </SurfaceCard>
          <div className="mt-6 flex flex-col gap-4">
            {loading ? <LoadingBlocks /> : results.length === 0 ? <EmptyState title="Tidak ada hasil" description="Coba ubah kata kunci atau longgarkan filter kategori, touchpoint, dan status." /> : results.map((item) => {
              const row = <SurfaceCard className="group flex min-h-[82px] items-center gap-4 p-5 transition hover:border-[#166534] md:px-6"><div className="min-w-0 flex-1"><h2 className="truncate text-[17px] font-semibold group-hover:text-accent">{item.title}</h2><p className="mt-1 truncate text-xs text-muted">{item.category} &bull; {item.touchpoints.join(" → ")} &bull; Berlaku {formatDate(item.effectiveDate)}–{formatDate(item.expiryDate)}</p></div><StatusBadge status={item.status as KnowledgeStatus} className="hidden sm:inline-flex" /><ArrowRight className="shrink-0 text-muted" size={20} /></SurfaceCard>;
              return item.status === "active" ? <Link key={item.id} href={`/knowledge/${item.id}`} className="block rounded-[10px]" aria-label={`Buka ${item.title}`}>{row}</Link> : <div key={item.id} aria-label={`${item.title}, tidak dapat dibuka karena status ${item.status}`}>{row}</div>;
            })}
          </div>
        </>
      )}
    </>
  );
}
