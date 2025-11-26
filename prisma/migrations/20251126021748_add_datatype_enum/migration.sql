/*
  Warnings:

  - Changed the type of `dataType` on the `Rule` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "DataType" AS ENUM ('string', 'number', 'boolean', 'object', 'array');

-- AlterTable
ALTER TABLE "Rule" DROP COLUMN "dataType",
ADD COLUMN     "dataType" "DataType" NOT NULL;
