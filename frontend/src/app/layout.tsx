import type { Metadata } from "next";
import type { ReactNode } from "react";
import { FloatingRobot } from "@/shared/ui/floating-robot";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mercadex",
  description: "Marketplace de eletronicos"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="font-sans" suppressHydrationWarning>
        {children}
        <FloatingRobot />
      </body>
    </html>
  );
}
