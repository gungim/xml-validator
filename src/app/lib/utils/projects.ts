import crypto from "crypto";

const MAX_SLUG_LENGTH = 64;

/**
 * Normalize and validate endpoint slug input.
 * Rules: lowercase, alphanumeric + dash only, trimmed length > 0.
 */
export function normalizeEndpointSlug(input: string) {
  const normalized = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!normalized || normalized.length > MAX_SLUG_LENGTH) {
    throw new Error("Invalid endpoint slug");
  }

  return normalized;
}

export function generateProjectSecret(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex");
}

