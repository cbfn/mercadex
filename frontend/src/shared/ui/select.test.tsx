import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Select } from "./select";

describe("Select", () => {
  it("should render correctly", () => {
    render(
      <Select>
        <option value="1">Option 1</option>
      </Select>
    );
    expect(screen.getByText("Option 1")).toBeInTheDocument();
  });
});
