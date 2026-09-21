"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, LockKeyhole } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { can } from "@/lib/permissions";
import { useKms } from "@/lib/store/kms-store";
import { PageIntro, StatusBadge, SurfaceCard } from "@/components/kms/primitives";
import { Button } from "@/components/ui/button";

const schema = z.object({ knowledgeId: z.string().min(1, "Pilih pengetahuan terkait."), issueType: z.string().min(1, "Pilih jenis masalah."), touchpoint: z.string().min(1, "Pilih touchpoint."), detail: z.string().min(20, "Detail temuan minimal 20 karakter.") });
type FormValues = z.infer<typeof schema>;

export default function ReportPage() { return <Suspense fallback={<div className="pt-12 text-muted">Memuat formulir laporan...</div>}><ReportForm /></Suspense>; }

function ReportForm() {
  const params = useSearchParams();
  const { data, submitReport } = useKms();
  const [submitted, setSubmitted] = useState(false);
  const allowed = can(data.role, "report");
  const requested = params.get("knowledge");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { knowledgeId: requested && data.knowledge.some((item) => item.id === requested) ? requested : "panduan-struk-parkir", issueType: "Informasi sudah berubah", touchpoint: "Parkir", detail: "Informasi yang disampaikan di touchpoint perlu diperiksa kembali dengan sumber aktif." } });
  const onSubmit = handleSubmit((values) => { submitReport(values); setSubmitted(true); toast.success("Laporan berhasil masuk ke antrean peninjauan."); });

  return (
    <>
      <PageIntro before="Informasi berubah? Laporkan" accent="sekarang." description="Masukan dari touchpoint masuk ke alur review; versi aktif tetap terlacak." compact />
      <div className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
        <SurfaceCard className="p-6 md:p-8">{!allowed && <div className="mb-5 flex gap-3 rounded-lg border border-[#675b24] bg-[#3a3315] p-4 text-sm text-warning"><LockKeyhole size={18} /> Peran aktif tidak dapat mengirim laporan.</div>}<form onSubmit={onSubmit} className="grid gap-5 md:grid-cols-2" noValidate><Field id="report-knowledge-error" className="md:col-span-2" label="Pengetahuan terkait" error={errors.knowledgeId?.message}><select {...register("knowledgeId")} className="field-control" disabled={!allowed} aria-invalid={!!errors.knowledgeId} aria-describedby={errors.knowledgeId ? "report-knowledge-error" : undefined}>{data.knowledge.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></Field><Field id="report-type-error" label="Jenis masalah" error={errors.issueType?.message}><select {...register("issueType")} className="field-control" disabled={!allowed} aria-invalid={!!errors.issueType} aria-describedby={errors.issueType ? "report-type-error" : undefined}><option>Informasi sudah berubah</option><option>Sumber tidak jelas</option><option>Periode tidak sesuai</option><option>Informasi sulit dipahami</option></select></Field><Field id="report-touchpoint-error" label="Touchpoint" error={errors.touchpoint?.message}><select {...register("touchpoint")} className="field-control" disabled={!allowed} aria-invalid={!!errors.touchpoint} aria-describedby={errors.touchpoint ? "report-touchpoint-error" : undefined}><option>Parkir</option><option>Kasir</option><option>Menu</option><option>Pembayaran</option><option>Pemesanan</option></select></Field><Field id="report-detail-error" className="md:col-span-2" label="Detail temuan" error={errors.detail?.message}><textarea {...register("detail")} rows={5} className="field-control resize-y" disabled={!allowed} aria-invalid={!!errors.detail} aria-describedby={errors.detail ? "report-detail-error" : undefined} /></Field><div className="md:col-span-2 md:ml-auto"><Button type="submit" variant="primary" disabled={!allowed || isSubmitting}>{isSubmitting ? "Mengirim..." : "Kirim laporan"}</Button></div></form></SurfaceCard>
        <SurfaceCard className="h-fit p-6 md:p-8"><span className="grid h-12 w-12 place-items-center rounded-full bg-[#123b29] text-success"><Check size={22} /></span><h2 className="mt-7 font-display text-[27px] font-semibold leading-8">Masuk ke antrean peninjauan konten</h2><p className="mt-4 text-sm leading-6 text-muted">Pemilik konten menerima laporan, memeriksa sumber, lalu mengajukan pembaruan jika diperlukan.</p>{submitted && <div className="mt-8 flex justify-end border-t border-border pt-6"><StatusBadge status="review" label="MENUNGGU TRIAGE" /></div>}</SurfaceCard>
      </div>
    </>
  );
}

function Field({ id, label, error, className, children }: { id: string; label: string; error?: string; className?: string; children: React.ReactNode }) { return <label className={className}><span className="field-label">{label}</span>{children}{error && <span id={id} className="mt-1.5 block text-xs text-destructive">{error}</span>}</label>; }
