import { expect, test } from "@playwright/test";

test("critical checkout flow from product details to confirmation", async ({ page }) => {
  await page.goto("/");

  await page.getByTestId("open-product-1").click();
  await page.getByTestId("modal-add-to-cart").click();
  await expect(page.getByTestId("cart-step")).toBeVisible();

  await page.getByTestId("go-to-delivery").click();
  await expect(page.getByTestId("delivery-step")).toBeVisible();

  await page.getByLabel("Nome completo").fill("Joao da Silva");
  await page.getByLabel("CPF").fill("00000000000");
  await page.getByLabel("Telefone").fill("11999999999");
  await page.getByLabel("CEP").fill("01001000");
  await page.getByLabel("Endereco").fill("Rua A, 123");
  await page.getByLabel("Cidade").fill("Sao Paulo");
  await page.getByLabel("UF").selectOption("SP");
  await page.getByRole("button", { name: "Continuar para pagamento" }).click();

  await expect(page.getByTestId("payment-step")).toBeVisible();
  await page.getByTestId("confirm-order-button").click();
  await expect(page.getByTestId("confirm-step")).toBeVisible();
  await page.getByTestId("finish-order-button").click();
  await expect(page.getByTestId("open-cart-button")).toContainText("0");
});
