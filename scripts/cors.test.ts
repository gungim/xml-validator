import { describe, it, expect } from "bun:test";

describe("CORS Headers", () => {
  it("should return CORS headers for OPTIONS request", async () => {
    const response = await fetch("http://localhost:3000/api/validate/test-slug", {
      method: "OPTIONS",
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(response.headers.get("Access-Control-Allow-Methods")).toBe("GET, POST, PUT, DELETE, OPTIONS");
    expect(response.headers.get("Access-Control-Allow-Headers")).toBe("Content-Type, Authorization, x-api-key");
  });

  it("should return CORS headers for POST request (even with error)", async () => {
    const response = await fetch("http://localhost:3000/api/validate/test-slug", {
      method: "POST",
      body: "<xml>test</xml>",
    });

    // Even if it fails (401/404), it should have CORS headers
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
  });
});
