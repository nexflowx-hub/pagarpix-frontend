import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { isAllowedCorePath } from "@/lib/core";
import { hasTrustedOrigin } from "@/lib/security";

describe("BFF allowlist", () => {
  it("permite somente os recursos financeiros declarados", () => {
    expect(isAllowedCorePath("treasury/overview")).toBe(true);
    expect(isAllowedCorePath("transactions")).toBe(true);
    expect(isAllowedCorePath("auth/admin/users")).toBe(false);
    expect(isAllowedCorePath("providers/secrets")).toBe(false);
    expect(isAllowedCorePath("../transactions")).toBe(false);
  });
});

describe("proteção de origem", () => {
  it("aceita mesma origem e recusa origem externa", () => {
    const trusted = new NextRequest("https://app.pagarpix.org/api/auth/logout", {
      headers: { origin: "https://app.pagarpix.org", host: "app.pagarpix.org" },
    });
    const untrusted = new NextRequest("https://app.pagarpix.org/api/auth/logout", {
      headers: { origin: "https://evil.example", host: "app.pagarpix.org" },
    });
    expect(hasTrustedOrigin(trusted)).toBe(true);
    expect(hasTrustedOrigin(untrusted)).toBe(false);
  });
});
