-- Create extension for UUID generation if not already enabled.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

ALTER TABLE "Project"
ADD COLUMN "endpointSlug" TEXT NOT NULL DEFAULT uuid_generate_v4()::text,
ADD COLUMN "endpointSecret" TEXT NOT NULL DEFAULT uuid_generate_v4()::text;

ALTER TABLE "Project"
ADD CONSTRAINT "Project_endpointSlug_key" UNIQUE ("endpointSlug");

