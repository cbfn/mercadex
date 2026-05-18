import { expect, test, type Page } from "@playwright/test";

// ---------------------------------------------------------------------------
// Fixed UUIDs matching the mock seed used across unit tests
// ---------------------------------------------------------------------------
const PRODUCT_UUID = "11111111-1111-4111-8111-111111111111";
const PRODUCT_UUID_2 = "22222222-2222-4222-8222-222222222222";

const mockProduct1 = {
  id: PRODUCT_UUID,
  title: "iPhone 14 Pro 256GB",
  description: "Smartphone premium da Apple com chip A16 Bionic",
  price: 2999,
  condition: "EXCELENTE",
  images: ["https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=400&auto=format&fit=crop"],
  stock: 3,
  active: true,
  viewsCount: 120,
  category: { id: "c1", name: "Smartphones", description: null },
  seller: { id: "s1", name: "TechStore", email: "techstore@example.com", avatarUrl: null },
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const mockProduct2 = {
  id: PRODUCT_UUID_2,
  title: "PlayStation 5 Standard",
  description: "Console de nova geração da Sony",
  price: 2799,
  condition: "BOM",
  images: ["https://images.unsplash.com/photo-1486401899868-0e435ed85128?q=80&w=400&auto=format&fit=crop"],
  stock: 2,
  active: true,
  viewsCount: 80,
  category: { id: "c2", name: "Games", description: null },
  seller: { id: "s2", name: "Gamer Store", email: "gamer@example.com", avatarUrl: null },
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const mockCategories = [
  { id: "c1", name: "Smartphones", description: null },
  { id: "c2", name: "Games", description: null },
];

/**
 * Registers route handlers that mock every /api/** request so tests run
 * without a live backend.  More-specific paths are matched first via the
 * conditional checks inside the single handler (Playwright uses LIFO, so
 * a single broad handler avoids ordering surprises between beforeEach and
 * individual tests).
 */
async function setupApiMocks(page: Page) {
  await page.route("**/*", async (route) => {
    const { pathname } = new URL(route.request().url());

    if (!pathname.startsWith("/api/")) {
      await route.fallback();
      return;
    }

    if (pathname === "/api/categories") {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: mockCategories }),
      });
    } else if (pathname === `/api/products/${PRODUCT_UUID}/reviews`) {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: [] }),
      });
    } else if (pathname === `/api/products/${PRODUCT_UUID}/ai-summary`) {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: { summary: "Produto excelente." } }),
      });
    } else if (pathname === `/api/products/${PRODUCT_UUID}`) {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: mockProduct1 }),
      });
    } else if (pathname === `/api/products/${PRODUCT_UUID_2}`) {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: mockProduct2 }),
      });
    } else if (pathname === "/api/products") {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            items: [mockProduct1, mockProduct2],
            pagination: { page: 1, limit: 100, total: 2, totalPages: 1 },
          },
        }),
      });
    } else {
      await route.fallback();
    }
  });
}

// ---------------------------------------------------------------------------
// Happy-path flows
// ---------------------------------------------------------------------------
test.describe("happy-path flows", () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
  });

  test("catalog displays products returned by the mocked API", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByTestId(`open-product-${PRODUCT_UUID}`)).toBeVisible();
    await expect(page.getByText("iPhone 14 Pro 256GB")).toBeVisible();
    await expect(page.getByText("PlayStation 5 Standard")).toBeVisible();
  });

  test("product detail page loads and shows product information", async ({ page }) => {
    await page.goto(`/products/${PRODUCT_UUID}`);

    await expect(page.getByTestId("product-page-content")).toBeVisible();
    await expect(page.getByText("iPhone 14 Pro 256GB")).toBeVisible();
  });

  test("guest checkout flow redirects unauthenticated user to login", async ({ page }) => {
    // Arrange – start at storefront
    await page.goto("/");
    await page.getByTestId(`open-product-${PRODUCT_UUID}`).click();

    // Assert – product detail rendered
    await expect(page).toHaveURL(new RegExp(`/products/${PRODUCT_UUID}$`));
    await expect(page.getByTestId("product-page-content")).toBeVisible();

    // Act – add to cart and proceed to checkout
    await page.getByTestId("modal-add-to-cart").click();
    await expect(page.getByTestId("cart-step")).toBeVisible();
    await page.getByTestId("go-to-checkout").click();

    // Assert – guest is redirected to the login page
    await expect(page).toHaveURL(/\/login\?redirect=\/checkout$/);
    await expect(page.getByRole("heading", { name: "Entrar" })).toBeVisible();
    await expect(page.getByRole("form", { name: "Formulário de login" })).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Error / degraded states
// ---------------------------------------------------------------------------
test.describe("error states", () => {
  test("catalog shows error state when products API returns 500", async ({ page }) => {
    // Arrange – categories succeed but products list fails
    await page.route("**/api/products/categories**", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: mockCategories }),
      });
    });

    await page.route("**/api/products**", async (route) => {
      await route.fulfill({ status: 500, body: "Internal Server Error" });
    });

    // Act
    await page.goto("/");

    // Assert – some error feedback is visible to the user
    await expect(
      page.getByText(/nao foi possivel|erro|tente novamente/i).first()
    ).toBeVisible();
  });
});
