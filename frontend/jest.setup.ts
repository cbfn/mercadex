import "@testing-library/jest-dom";
import { afterEach, beforeAll } from "@jest/globals";
import { cleanup } from "@testing-library/react";
import { createElement } from "react";

const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
  };
})();

beforeAll(() => {
  Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
    writable: false,
  });
});

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    const { fill, priority, unoptimized, ...rest } = props;
    return createElement("img", rest);
  },
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

afterEach(() => {
  cleanup();
  localStorage.clear();
});
