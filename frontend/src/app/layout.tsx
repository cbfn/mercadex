import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { AuthProvider } from "@/features/auth/model/auth-context";
import { CartProvider } from "@/features/cart/model/cart-context";
import { AppChrome } from "@/app/app-chrome";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mercadex",
  description: "Marketplace de eletronicos"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="font-sans" suppressHydrationWarning>
        <AuthProvider>
          <CartProvider>
            {children}
            <AppChrome />
            <Toaster richColors position="top-right" closeButton />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
