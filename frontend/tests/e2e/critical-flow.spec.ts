import { expect, test } from "@playwright/test";

test("critical checkout flow routes guest user to login", async ({ page }) => {
  await page.goto("/");

  await page.getByTestId("open-product-1").click();
  await expect(page).toHaveURL(/\/products\/1$/);
  await expect(page.getByTestId("product-page-content")).toBeVisible();
  await page.getByTestId("modal-add-to-cart").click();
  await expect(page.getByTestId("cart-step")).toBeVisible();

  await page.getByTestId("go-to-checkout").click();

  await expect(page).toHaveURL(/\/login\?redirect=\/checkout$/);
  await expect(page.getByRole("heading", { name: "Entrar" })).toBeVisible();
  await expect(page.getByRole("form", { name: "Formulário de login" })).toBeVisible();
});
