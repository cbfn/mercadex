import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";

jest.mock("@/features/auth/model/auth-context", () => ({
  useAuth: () => ({ user: null, isLoading: false, login: jest.fn(), logout: jest.fn(), register: jest.fn() }),
}));

describe("HomePage", () => {
  it("renders the StorefrontPage component", () => {
    render(
      <HomePage />
    );
    expect(screen.getByAltText("Mercadex")).toBeInTheDocument();
    expect(screen.getAllByTestId("product-card").length).toBeGreaterThan(0);
  });
});
