import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { AppProviders } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: { default: "Pagi Sore Knowledge Hub", template: "%s | Pagi Sore KMS" },
  description: "Knowledge Hub layanan Pagi Sore Kota Lama Semarang.",
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="id">
      <body><AppProviders>{children}</AppProviders></body>
    </html>
  );
}
