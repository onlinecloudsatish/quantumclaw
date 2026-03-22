import { describe, expect, it } from "vitest";
import { resolveIrcInboundTarget } from "./monitor.js";

describe("irc monitor inbound target", () => {
  it("keeps channel target for group messages", () => {
    expect(
      resolveIrcInboundTarget({
        target: "#quantumclaw",
        senderNick: "alice",
      }),
    ).toEqual({
      isGroup: true,
      target: "#quantumclaw",
      rawTarget: "#quantumclaw",
    });
  });

  it("maps DM target to sender nick and preserves raw target", () => {
    expect(
      resolveIrcInboundTarget({
        target: "quantumclaw-bot",
        senderNick: "alice",
      }),
    ).toEqual({
      isGroup: false,
      target: "alice",
      rawTarget: "quantumclaw-bot",
    });
  });

  it("falls back to raw target when sender nick is empty", () => {
    expect(
      resolveIrcInboundTarget({
        target: "quantumclaw-bot",
        senderNick: " ",
      }),
    ).toEqual({
      isGroup: false,
      target: "quantumclaw-bot",
      rawTarget: "quantumclaw-bot",
    });
  });
});
