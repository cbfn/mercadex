import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "@/shared/ui/input";

describe("Input", () => {
  it("renders an input element", () => {
    render(<Input aria-label="test" />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("applies uiInput class", () => {
    const { container } = render(<Input />);
    expect((container.firstChild as HTMLElement).className).toContain("uiInput");
  });

  it("merges extra className", () => {
    const { container } = render(<Input className="custom" />);
    const cls = (container.firstChild as HTMLElement).className;
    expect(cls).toContain("uiInput");
    expect(cls).toContain("custom");
  });

  it("forwards placeholder", () => {
    render(<Input placeholder="Enter name" />);
    expect(screen.getByPlaceholderText("Enter name")).toBeInTheDocument();
  });

  it("fires onChange", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<Input aria-label="name" onChange={onChange} />);

    await user.type(screen.getByRole("textbox"), "a");
    expect(onChange).toHaveBeenCalled();
  });

  it("supports required attribute", () => {
    render(<Input required aria-label="req" />);
    expect(screen.getByRole("textbox")).toBeRequired();
  });

  it("forwards value prop", () => {
    render(<Input value="hello" readOnly aria-label="val" />);
    expect(screen.getByRole("textbox")).toHaveValue("hello");
  });
});
