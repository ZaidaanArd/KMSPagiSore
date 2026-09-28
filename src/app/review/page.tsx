"use client";

import { FileDiff, Plus, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { can } from "@/lib/permissions";
import { useKms } from "@/lib/store/kms-store";
import { formatDate } from "@/lib/utils";
import { EmptyState, ErrorState, LinkButton, LoadingBlocks, PageIntro, StatusBadge, SurfaceCard } from "@/components/kms/primitives";
import { Button } from "@/components/ui/button";
import { AppDialog, ConfirmDialog } from "@/components/ui/dialogs";

export default function ReviewPage() {
  const router = useRouter();
  const { data, loading, error, retryLoad, approveReview, requestRevision } = useKms();
  const [selectedId, setSelectedId] = useState(data.reviews[0]?.id ?? "");
  const selected = data.reviews.find((item) => item.id === selectedId) ?? data.reviews[0];
  const knowledge = data.knowledge.find((item) => item.id === selected?.knowledgeId);
  const version = data.versions.find((item) => item.id === selected?.versionId);
  const previous = data.versions.find((item) => item.knowledgeId === selected?.knowledgeId && item.status === "active" && item.id !== version?.id);
  const metadata = version?.metadata ?? knowledge;
  const allowed = can(data.role, "approve");

  function approve() {
    if (!selected) return;
    const id = approveReview(selected.id);
    toast.success("Versi disetujui dan diterbitkan sebagai versi aktif.");
    if (id) router.push(`/knowledge/${id}/history`);
  }

  function revise() {
    if (!selected) return;
    requestRevision(selected.id);
    toast.success("Pengajuan dikembalikan untuk revisi.");
    router.push(`/knowledge/new?edit=${selected.knowledgeId}&review=${selected.id}`);
  }

  return (
    <>
      <PageIntro before="Perubahan masuk. Validasi sebelum" accent="tayang." description="Reviewer membandingkan konten dengan sumber, masa berlaku, dan versi sebelumnya." compact>
        <LinkButton href="/knowledge/new"><Plus size={16} /> Tambah pengetahuan</LinkButton>
      </PageIntro>
      {error ? <ErrorState message={error} onRetry={retryLoad} /> : loading ? <LoadingBlocks rows={4} /> : data.reviews.length === 0 ? <EmptyState title="Antrean review kosong" description="Semua perubahan telah diproses. Tambahkan pengetahuan baru untuk memulai pengajuan." action={<LinkButton href="/knowledge/new" variant="primary">Tambah pengetahuan</LinkButton>} /> : (
        <div className="grid gap-6 xl:grid-cols-[.95fr_1.35fr]">
          <SurfaceCard className="p-5 md:p-6">
            <div className="mb-5 grid grid-cols-2 gap-3 text-center text-xs"><div className="rounded-lg border border-[#675b24] bg-[#3a3315] p-3 text-warning"><strong className="block text-xl">{data.reviews.filter((entry) => entry.status === "review").length}</strong> Menunggu review</div><div className="rounded-lg border border-[#7f3035] bg-[#3b1b1e] p-3 text-destructive"><strong className="block text-xl">{data.reviews.filter((entry) => entry.status === "needs_revision").length}</strong> Perlu revisi</div></div>
            <div className="space-y-3">{data.reviews.map((review) => { const item = data.knowledge.find((entry) => entry.id === review.knowledgeId); const live = data.versions.find((entry) => entry.id === item?.activeVersionId); return <button key={review.id} onClick={() => setSelectedId(review.id)} className={`w-full rounded-lg border p-4 text-left transition ${selected?.id === review.id ? "border-[#675b24] bg-[#332e29]" : "border-border bg-[#202022] hover:border-[#52525b]"}`}><div className="flex flex-wrap gap-2"><StatusBadge status={review.status} />{live && <StatusBadge status="active" label={`VERSI AKTIF ${live.version}`} />}</div><h2 className="mt-4 text-[18px] font-semibold">{item?.title}</h2><p className="mt-2 text-xs text-muted">Diajukan oleh {review.submittedBy}</p></button>; })}</div>
            {data.reports.length > 0 && <div className="mt-6 border-t border-border pt-5"><p className="px-2 text-sm text-muted">Laporan menunggu triage ({data.reports.filter((item) => item.status === "waiting_triage").length})</p>{data.reports.slice(0, 2).map((report) => <div key={report.id} className="mt-3 rounded-lg border border-border bg-input p-4"><p className="text-sm font-semibold">{report.issueType}</p><p className="mt-1 text-xs text-muted">{report.touchpoint} · {report.status === "waiting_triage" ? "Menunggu triage" : report.status}</p></div>)}</div>}
          </SurfaceCard>
          {selected && knowledge && version && metadata ? <SurfaceCard className="p-6 md:p-8"><div className="flex flex-wrap justify-end gap-2"><StatusBadge status={selected.status} label={`${version.version} / ${selected.status === "review" ? "MENUNGGU REVIEW" : "PERLU REVISI"}`} />{previous && <StatusBadge status="active" label={`VERSI AKTIF ${previous.version}`} />}</div><h2 className="mt-5 font-display text-[27px] font-semibold">{metadata.title}</h2><p className="mt-2 text-sm text-muted">{metadata.category} · {metadata.touchpoints.join(" → ")}</p><div className="mt-7 grid gap-5 border-t border-border pt-7 sm:grid-cols-2"><Meta label="Sumber pengajuan" value={metadata.source} /><Meta label="Berlaku" value={`${formatDate(metadata.effectiveDate)}–${formatDate(metadata.expiryDate)}`} /><Meta label="Perubahan" value={version.changeSummary} /><Meta label="Sumber diverifikasi" value={version.sourceVerified ? "Ya" : "Belum oleh reviewer"} /></div>{previous && <p className="mt-6 rounded-lg border border-[#166534] bg-[#123b29] p-4 text-sm text-success">Versi aktif {previous.version} tetap tersedia bagi staf sampai revisi {version.version} disetujui.</p>}{!allowed && selected.status === "review" && <div className="mt-7 flex gap-3 rounded-lg border border-[#675b24] bg-[#3a3315] p-4 text-sm text-warning"><ShieldAlert size={18} className="shrink-0" /> Peran aktif tidak memiliki izin approve/return.</div>}<div className="mt-8 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:flex-wrap">{selected.status === "review" ? <><ConfirmDialog trigger={<Button disabled={!allowed}>Kembalikan revisi</Button>} title="Kembalikan pengajuan?" description="Status berubah menjadi PERLU REVISI dan pemilik konten dapat memperbaiki pengajuan yang sama." confirmLabel="Kembalikan revisi" destructive onConfirm={revise} /><ConfirmDialog trigger={<Button variant="primary" disabled={!allowed}>Setujui versi</Button>} title="Terbitkan versi ini?" description="Versi yang sedang aktif akan diarsipkan dan versi pengajuan menjadi sumber pengetahuan aktif." confirmLabel="Setujui versi" onConfirm={approve} /></> : <LinkButton href={`/knowledge/new?edit=${knowledge.id}&review=${selected.id}`} variant="primary">Perbaiki dan kirim ulang</LinkButton>}<AppDialog trigger={<Button variant="ghost"><FileDiff size={16} /> Lihat selisih versi</Button>} title="Selisih versi" description={`${previous?.version ?? "Versi awal"} → ${version.version}`}><DiffBlock oldValue={previous?.content ?? "Belum ada versi sebelumnya."} newValue={version.content} /></AppDialog></div></SurfaceCard> : null}
        </div>
      )}
    </>
  );
}

function Meta({ label, value }: { label: string; value: string }) { return <p className="text-[15px] leading-6"><span className="text-muted">{label}:</span> {value}</p>; }
function DiffBlock({ oldValue, newValue }: { oldValue: string; newValue: string }) { return <div className="grid gap-4 text-sm"><div className="rounded-lg border border-[#7f3035] bg-[#3b1b1e] p-4"><p className="font-semibold text-destructive">Versi sebelumnya</p><p className="mt-2 leading-6 text-muted">{oldValue}</p></div><div className="rounded-lg border border-[#166534] bg-[#123b29] p-4"><p className="font-semibold text-success">Versi pengajuan</p><p className="mt-2 leading-6">{newValue}</p></div></div>; }
