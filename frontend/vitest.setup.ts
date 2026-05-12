import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll, vi } from "vitest";
import { createElement } from "react";

// jsdom on Node 20+ does not expose a functional localStorage on window.
// Provide an in-memory implementation so any code using window.localStorage works.
const localStorageMock = (() => {
	let store: Record<string, string> = {};
	return {
		getItem: (key: string) => store[key] ?? null,
		setItem: (key: string, value: string) => { store[key] = value; },
		removeItem: (key: string) => { delete store[key]; },
		clear: () => { store = {}; },
		get length() { return Object.keys(store).length; },
		key: (index: number) => Object.keys(store)[index] ?? null
	};
})();

beforeAll(() => {
	Object.defineProperty(window, "localStorage", { value: localStorageMock, writable: false });
});

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
