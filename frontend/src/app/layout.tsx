import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AuthProvider } from "@/features/auth/model/auth-context";
import { CartProvider } from "@/features/cart/model/cart-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mercadex",
  description: "Marketplace de eletronicos"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="font-sans">
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
