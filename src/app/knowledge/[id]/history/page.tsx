"use client";

import { useParams } from "next/navigation";
import { CheckCircle2, Eye } from "lucide-react";
import { can } from "@/lib/permissions";
import { useKms } from "@/lib/store/kms-store";
import { EmptyState, ErrorState, LinkButton, LoadingBlocks, PageIntro, StatusBadge, SurfaceCard } from "@/components/kms/primitives";
import { Button } from "@/components/ui/button";
import { AppDialog } from "@/components/ui/dialogs";

export default function HistoryPage() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error, retryLoad } = useKms();
  const item = data.knowledge.find((entry) => entry.id === id);
  const versions = data.versions.filter((version) => version.knowledgeId === id).sort((a, b) => b.version.localeCompare(a.version, undefined, { numeric: true }));
  const allowed = can(data.role, "audit");
  if (error) return <div className="pt-12"><ErrorState message={error} onRetry={retryLoad} /></div>;
  if (loading) return <div className="pt-12"><LoadingBlocks rows={4} /></div>;
  if (!item || versions.length === 0) return <div className="pt-12"><EmptyState title="Riwayat belum tersedia" description="Pengetahuan ini belum memiliki versi yang dapat ditampilkan." action={<LinkButton href="/knowledge">Kembali ke pencarian</LinkButton>} /></div>;

  return (
    <>
      <PageIntro before="Setiap perubahan punya" accent="jejak." description="Telusuri sumber, pembuat, reviewer, dan alasan perubahan pada setiap versi." compact />
      <SurfaceCard className="p-6 md:p-8"><div className="flex justify-end"><StatusBadge status="active" label="VERSI AKTIF" /></div><div className="relative mt-6 space-y-0 before:absolute before:bottom-7 before:left-[13px] before:top-2 before:w-px before:bg-border">{versions.map((version) => <article key={version.id} className="relative grid gap-4 border-b border-[#303032] py-7 pl-12 last:border-0 md:grid-cols-[120px_1fr_auto] md:items-start"><span className={`absolute left-1 top-8 h-5 w-5 rounded-full border-4 border-surface ${version.status === "active" ? "bg-accent" : "bg-dim"}`} /><div><p className="text-xl font-bold">{version.version}</p><StatusBadge status={version.status} className="mt-2" /></div><div><h2 className="font-semibold leading-6">{version.changeSummary}</h2><p className="mt-2 text-xs leading-5 text-muted">{version.reviewer ? `Disetujui ${version.reviewer}` : "Belum disetujui reviewer"} · sumber {version.sourceVerified ? "diverifikasi" : "perlu verifikasi"}</p><p className="mt-3 text-xs leading-5 text-dim">Dibuat oleh {version.creator}</p></div><div className="md:text-right"><p className="text-xs text-muted">{version.approvalTime ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(version.approvalTime)) : "Menunggu keputusan"}</p><AppDialog trigger={<Button variant="ghost" size="sm" className="mt-2" disabled={!allowed}><Eye size={14} /> Lihat audit</Button>} title={`Audit ${version.version}`} description="Jejak perubahan pada versi ini."><div className="space-y-3">{[["Dibuat oleh", version.creator], ["Sumber", version.sourceVerified ? "Diverifikasi" : "Belum diverifikasi"], ["Keputusan", version.reviewer ?? "Belum ada reviewer"], ["Status", version.status]].map(([label, value]) => <div key={label} className="flex items-center gap-3 rounded-lg border border-border bg-input p-3"><CheckCircle2 size={16} className="text-accent" /><p className="text-sm"><span className="text-muted">{label}:</span> {value}</p></div>)}</div></AppDialog></div></article>)}</div></SurfaceCard>
    </>
  );
}
