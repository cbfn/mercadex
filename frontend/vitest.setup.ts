import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import { createElement } from "react";

// Mock next/image to render a plain <img>
vi.mock("next/image", () => ({
	default: (props: Record<string, unknown>) => {
		const { fill, priority, unoptimized, ...rest } = props;
		return createElement("img", rest);
	}
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
	useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
	usePathname: () => "/",
	useSearchParams: () => new URLSearchParams()
}));

afterEach(() => {
	cleanup();
	localStorage.clear();
});
