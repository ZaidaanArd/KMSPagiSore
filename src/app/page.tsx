"use client";

import Link from "next/link";
import { ArrowRight, CreditCard, ReceiptText, Utensils } from "lucide-react";
import { useKms } from "@/lib/store/kms-store";
import { formatDate, knowledgeStatus } from "@/lib/utils";
import { ErrorState, LinkButton, LoadingBlocks, StatusBadge, SurfaceCard } from "@/components/kms/primitives";

const touchpoints = [
  { number: "01", title: "Menu & paket", description: "Detail paket, harga tambahan, dan informasi sebelum memesan.", cta: "Lihat panduan", href: "/knowledge", icon: Utensils },
  { number: "02", title: "Promo & pembayaran", description: "Syarat, metode bayar, kuota, dan periode yang berlaku.", cta: "Periksa promo", href: "/promotions", icon: CreditCard },
  { number: "03", title: "Struk & parkir", description: "Informasi transaksi yang perlu dibawa ke tahap layanan lanjut.", cta: "Buka aturan", href: "/knowledge/panduan-struk-parkir", icon: ReceiptText },
];

export default function DashboardPage() {
  const { data, loading, error, retryLoad } = useKms();
  const featured = data.knowledge.find((item) => item.id === "panduan-struk-parkir");

  if (error) return <div className="pt-12"><ErrorState message={error} onRetry={retryLoad} /></div>;

  return (
    <>
      <section className="grid gap-10 pt-8 md:pt-9 xl:grid-cols-[1.45fr_1fr] xl:gap-16">
        <div>
          <h1 className="max-w-[690px] font-display text-[clamp(3rem,4.5vw,3.625rem)] font-medium leading-[1.06] tracking-[-2.5px]">
            Satu jawaban,<br />di setiap <span className="font-semibold text-accent">touchpoint.</span>
          </h1>
          <p className="mt-6 max-w-[660px] text-[15px] leading-7 text-muted md:text-[17px]">
            Cari pengetahuan layanan yang berlaku sebelum menjawab pelanggan. Setiap entri menampilkan sumber, periode, dan riwayat persetujuan.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton href="/knowledge" variant="primary">Cari pengetahuan <ArrowRight size={16} /></LinkButton>
            <LinkButton href="/promotions">Lihat promo aktif</LinkButton>
          </div>
        </div>
        {loading || !featured ? (
          <div className="pt-8 xl:pt-16"><LoadingBlocks rows={2} /></div>
        ) : (
          <SurfaceCard className="self-end p-7 md:p-8 xl:mt-16">
            <div className="flex justify-end">
              <StatusBadge status={knowledgeStatus(featured)} />
            </div>
            <h2 className="mt-5 font-display text-[27px] font-semibold tracking-[-.6px]">Panduan struk & parkir</h2>
            <div className="mt-7 grid gap-5 border-t border-border pt-5 sm:grid-cols-2">
              <p className="text-[13px] leading-6"><span className="text-muted">Sumber:</span> {featured.source}</p>
              <p className="text-[13px] leading-6"><span className="text-muted">Berlaku:</span> {formatDate(featured.effectiveDate)}–{formatDate(featured.expiryDate)}</p>
            </div>
          </SurfaceCard>
        )}
      </section>
      <section className="pb-8 pt-12 md:pt-16">
        <div className="grid gap-5 md:grid-cols-3">
          {touchpoints.map(({ number, title, description, cta, href, icon: Icon }) => (
            <Link key={number} href={href} className="surface-card group flex min-h-[250px] flex-col p-7 transition duration-300 hover:-translate-y-1 hover:border-[#166534]">
              <div className="flex justify-end"><Icon size={19} className="text-dim group-hover:text-accent" /></div>
              <h2 className="mt-8 font-display text-[27px] font-semibold">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted">{description}</p>
              <span className="mt-auto flex items-center gap-2 border-t border-border pt-5 text-[13px] font-bold group-hover:text-accent">{cta} <ArrowRight size={15} /></span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
