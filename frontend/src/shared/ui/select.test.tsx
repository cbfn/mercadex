import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Select } from "@/shared/ui/select";

describe("Select", () => {
  it("renders a select element", () => {
    render(
      <Select aria-label="sort">
        <option value="a">A</option>
        <option value="b">B</option>
      </Select>
    );
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("applies uiSelect class", () => {
    const { container } = render(
      <Select>
        <option>x</option>
      </Select>
    );
    expect((container.firstChild as HTMLElement).className).toContain("uiSelect");
  });

  it("merges extra className", () => {
    const { container } = render(
      <Select className="extra">
        <option>x</option>
      </Select>
    );
    const cls = (container.firstChild as HTMLElement).className;
    expect(cls).toContain("uiSelect");
    expect(cls).toContain("extra");
  });

  it("fires onChange on selection", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Select aria-label="sort" onChange={onChange}>
        <option value="a">Option A</option>
        <option value="b">Option B</option>
      </Select>
    );

    await user.selectOptions(screen.getByRole("combobox"), "b");
    expect(onChange).toHaveBeenCalled();
  });

  it("renders children options", () => {
    render(
      <Select aria-label="sort">
        <option value="x">X</option>
        <option value="y">Y</option>
      </Select>
    );
    expect(screen.getAllByRole("option")).toHaveLength(2);
  });
});
