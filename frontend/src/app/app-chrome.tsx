"use client";

import dynamic from "next/dynamic";

const CartDrawer = dynamic(
  () => import("@/features/cart/components/cart-drawer").then((mod) => mod.CartDrawer),
  {
    ssr: false,
  }
);

const FloatingRobot = dynamic(
  () => import("@/shared/ui/floating-robot").then((mod) => mod.FloatingRobot),
  {
    ssr: false,
  }
);

export function AppChrome() {
  return (
    <>
      <CartDrawer />
      <FloatingRobot />
    </>
  );
}
