"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, LockKeyhole } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { can, roleLabels } from "@/lib/permissions";
import { useKms } from "@/lib/store/kms-store";
import { PageIntro, SurfaceCard } from "@/components/kms/primitives";
import { Button } from "@/components/ui/button";
import { localDate } from "@/lib/utils";

const schema = z
  .object({
    title: z.string().min(5, "Judul minimal 5 karakter."),
    category: z.string().min(1, "Pilih kategori."),
    touchpoint: z.string().min(1, "Pilih touchpoint."),
    source: z.string().min(5, "Sumber atau dokumen acuan wajib diisi."),
    effectiveDate: z.string().min(1, "Tanggal mulai wajib diisi."),
    expiryDate: z.string().min(1, "Tanggal berakhir wajib diisi."),
    summary: z.string().min(20, "Ringkasan minimal 20 karakter."),
    content: z.string().min(30, "Isi pengetahuan minimal 30 karakter."),
    changeSummary: z.string().min(8, "Ringkasan perubahan minimal 8 karakter."),
  })
  .refine((value) => value.expiryDate >= value.effectiveDate, {
    path: ["expiryDate"],
    message: "Tanggal berakhir harus setelah tanggal mulai.",
  });

type FormValues = z.infer<typeof schema>;

const defaults: FormValues = {
  title: "Panduan konfirmasi syarat promo",
  category: "Promosi & pembayaran",
  touchpoint: "Kasir",
  source: "Dokumen ketentuan terverifikasi",
  effectiveDate: localDate(),
  expiryDate: localDate(30),
  summary: "Cantumkan syarat yang perlu diketahui pelanggan sebelum transaksi diproses.",
  content: "Petugas memastikan periode, nilai minimum transaksi, metode pembayaran, kuota, dan pengecualian sebelum mengonfirmasi promo.",
  changeSummary: "Panduan konfirmasi promo ditambahkan.",
};

export default function KnowledgeEditorPage() { return <Suspense fallback={<div className="pt-12 text-muted">Memuat formulir...</div>}><KnowledgeEditor /></Suspense>; }

function KnowledgeEditor() {
  const router = useRouter();
  const params = useSearchParams();
  const { data, loading, saveDraft, submitForReview } = useKms();
  const editId = params.get("edit");
  const reviewId = params.get("review");
  const review = data.reviews.find((entry) => entry.id === reviewId && entry.knowledgeId === editId);
  const item = data.knowledge.find((entry) => entry.id === editId);
  const version = data.versions.find((entry) => entry.id === review?.versionId);
  const [currentId, setCurrentId] = useState<string | null>(editId);
  const validRevision = !editId || (review?.status === "needs_revision" && !!item && !!version);
  const editable = can(data.role, "edit");
  const submittable = can(data.role, "submit");
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: defaults });

  useEffect(() => {
    if (!loading && editId && review && item && version) {
      const metadata = version.metadata ?? item;
      reset({ title: metadata.title, category: metadata.category, touchpoint: metadata.touchpoints[0] ?? "Kasir", source: metadata.source, effectiveDate: metadata.effectiveDate, expiryDate: metadata.expiryDate ?? localDate(30), summary: metadata.summary, content: version.content, changeSummary: version.changeSummary });
    }
  }, [loading, editId, review, item, version, reset]);

  function mapInput(values: FormValues) {
    return { ...values, touchpoints: [values.touchpoint], id: currentId ?? undefined, reviewId: review?.status === "needs_revision" ? review.id : undefined };
  }

  const draft = handleSubmit((values) => {
    const item = saveDraft(mapInput(values));
    setCurrentId(item.id);
    toast.success(`Draf “${item.title}” tersimpan.`);
  });

  const submit = handleSubmit((values) => {
    const item = submitForReview(mapInput(values));
    toast.success(`“${item.title}” masuk antrean review.`);
    router.push("/review");
  });

  return (
    <>
      <PageIntro before={editId ? "Perbaiki pengajuan" : "Tambah atau perbarui pengetahuan"} accent="layanan." description={editId ? "Formulir ini memuat pengajuan yang dikembalikan. Versi terbit tetap aktif sampai revisi disetujui." : "Setiap perubahan membutuhkan sumber, pemilik, dan tanggal berlaku sebelum dikirim untuk review."} compact />
      <div className="grid gap-6 xl:grid-cols-[2.05fr_1fr]">
        <SurfaceCard className="p-6 md:p-8">
          {!loading && editId && !validRevision && <div role="alert" className="mb-5 rounded-lg border border-[#7f3035] bg-[#3b1b1e] p-4 text-sm text-destructive">Pengajuan revisi tidak ditemukan atau sudah dikirim ulang. Buka antrean review untuk melihat status terbaru.</div>}
          {editId && validRevision && <div className="mb-5 rounded-lg border border-[#675b24] bg-[#3a3315] p-4 text-sm text-warning">Memperbaiki pengajuan {review?.id} untuk “{item?.title}”. Versi aktif {data.versions.find((entry) => entry.id === item?.activeVersionId)?.version ?? "belum ada"} tetap tersedia.</div>}
          {!editable && <div className="mt-5 flex gap-3 rounded-lg border border-[#675b24] bg-[#3a3315] p-4 text-sm text-warning"><LockKeyhole size={18} className="shrink-0" /> Peran {roleLabels[data.role]} hanya memiliki akses baca. Ubah peran melalui avatar untuk mengelola konten.</div>}
          <form className="grid gap-5 md:grid-cols-2" noValidate>
            <Field id="title-error" className="md:col-span-2" label="Judul pengetahuan" error={errors.title?.message}><input {...register("title")} disabled={!editable} className="field-control" aria-invalid={!!errors.title} aria-describedby={errors.title ? "title-error" : undefined} /></Field>
            <Field id="category-error" label="Kategori" error={errors.category?.message}><select {...register("category")} disabled={!editable} className="field-control" aria-invalid={!!errors.category} aria-describedby={errors.category ? "category-error" : undefined}><option>Promosi & pembayaran</option><option>Menu & paket</option><option>Aturan layanan</option><option>FAQ</option></select></Field>
            <Field id="touchpoint-error" label="Touchpoint" error={errors.touchpoint?.message}><select {...register("touchpoint")} disabled={!editable} className="field-control" aria-invalid={!!errors.touchpoint} aria-describedby={errors.touchpoint ? "touchpoint-error" : undefined}><option>Kasir</option><option>Pembayaran</option><option>Menu</option><option>Parkir</option><option>Pemesanan</option></select></Field>
            <Field id="source-error" className="md:col-span-2" label="Sumber / dokumen acuan" error={errors.source?.message}><input {...register("source")} disabled={!editable} className="field-control" aria-invalid={!!errors.source} aria-describedby={errors.source ? "source-error" : undefined} /></Field>
            <Field id="effective-date-error" label="Mulai berlaku" error={errors.effectiveDate?.message}><input type="date" {...register("effectiveDate")} disabled={!editable} className="field-control" aria-invalid={!!errors.effectiveDate} aria-describedby={errors.effectiveDate ? "effective-date-error" : undefined} /></Field>
            <Field id="expiry-date-error" label="Berakhir" error={errors.expiryDate?.message}><input type="date" {...register("expiryDate")} disabled={!editable} className="field-control" aria-invalid={!!errors.expiryDate} aria-describedby={errors.expiryDate ? "expiry-date-error" : undefined} /></Field>
            <Field id="summary-error" className="md:col-span-2" label="Ringkasan isi" error={errors.summary?.message}><textarea {...register("summary")} disabled={!editable} rows={3} className="field-control resize-y" aria-invalid={!!errors.summary} aria-describedby={errors.summary ? "summary-error" : undefined} /></Field>
            <Field id="content-error" className="md:col-span-2" label="Isi pengetahuan" error={errors.content?.message}><textarea {...register("content")} disabled={!editable} rows={5} className="field-control resize-y" aria-invalid={!!errors.content} aria-describedby={errors.content ? "content-error" : undefined} /></Field>
            <Field id="change-summary-error" className="md:col-span-2" label="Ringkasan perubahan" error={errors.changeSummary?.message}><input {...register("changeSummary")} disabled={!editable} className="field-control" aria-invalid={!!errors.changeSummary} aria-describedby={errors.changeSummary ? "change-summary-error" : undefined} /></Field>
          </form>
        </SurfaceCard>
        <SurfaceCard className="h-fit p-6 md:p-8">
          <div className="space-y-0">{[["01", "Simpan draf", "Konten belum terlihat staf."], ["02", "Kirim untuk review", "Reviewer memeriksa sumber."], ["03", "Terbitkan versi aktif", "Hanya versi disetujui digunakan."]].map(([number, title, desc], index) => <div key={number} className="relative flex gap-4 pb-8"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#123b29] text-[10px] font-bold text-accent">{number}</span>{index < 2 && <span className="absolute left-[15px] top-8 h-8 w-px bg-border" />}<div><h2 className="font-semibold">{title}</h2><p className="mt-1 text-xs leading-5 text-muted">{desc}</p></div></div>)}</div>
          <div className="mt-2 space-y-3"><Button className="w-full" onClick={draft} disabled={!editable || !validRevision || isSubmitting}>Simpan draf</Button><Button variant="primary" className="w-full" onClick={submit} disabled={!submittable || !validRevision || isSubmitting}>{editId ? "Kirim ulang revisi" : "Kirim untuk review"}</Button></div>
          <p className="mt-4 flex gap-2 text-[11px] leading-5 text-dim"><Check size={14} className="mt-0.5 shrink-0 text-success" /> Form diperiksa per field sebelum pengajuan dikirim.</p>
        </SurfaceCard>
      </div>
    </>
  );
}

function Field({ id, label, error, className, children }: { id: string; label: string; error?: string; className?: string; children: React.ReactNode }) {
  return <label className={className}><span className="field-label">{label}</span>{children}{error && <span id={id} className="mt-1.5 block text-xs text-destructive">{error}</span>}</label>;
}
