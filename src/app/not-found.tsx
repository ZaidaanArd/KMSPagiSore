import { EmptyState, LinkButton } from "@/components/kms/primitives";

export default function NotFound() {
  return (
    <div className="pt-12">
      <EmptyState title="Halaman tidak ditemukan" description="Alamat yang dibuka tidak tersedia pada Knowledge Hub ini." action={<LinkButton href="/" variant="primary">Kembali ke beranda</LinkButton>} />
    </div>
  );
}
