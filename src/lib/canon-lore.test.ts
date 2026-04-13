import { describe, expect, it } from "vitest";
import {
  IP_TITLE,
  SAGA_MAIN_BOOK_COUNT,
  ashRunMapHeaderLine,
  hubTagline,
  survivorFlavorLine,
} from "./canon-lore";

describe("canon-lore", () => {
  it("exports stable IP anchor strings", () => {
    expect(IP_TITLE.length).toBeGreaterThan(5);
    expect(SAGA_MAIN_BOOK_COUNT).toBe(7);
    expect(hubTagline).toContain(IP_TITLE);
    expect(survivorFlavorLine.toLowerCase()).toContain("bio");
    expect(ashRunMapHeaderLine).toMatch(/seven|7/i);
  });
});
