import { describe, expect, it } from "vite-plus/test";

import { decide } from "./index.ts";

describe("decide", () => {
  it("returns its input unchanged", () => {
    const input = { role: "worker" };
    expect(decide(input)).toBe(input);
  });
});
