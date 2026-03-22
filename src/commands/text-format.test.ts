import { describe, expect, it } from "vitest";
import { shortenText } from "./text-format.js";

describe("shortenText", () => {
  it("returns original text when it fits", () => {
    expect(shortenText("quantumclaw", 16)).toBe("quantumclaw");
  });

  it("truncates and appends ellipsis when over limit", () => {
    expect(shortenText("quantumclaw-status-output", 10)).toBe("quantumclaw-…");
  });

  it("counts multi-byte characters correctly", () => {
    expect(shortenText("hello🙂world", 7)).toBe("hello🙂…");
  });
});
