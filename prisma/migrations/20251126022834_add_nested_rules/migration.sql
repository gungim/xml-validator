-- AlterTable
ALTER TABLE "Rule" ADD COLUMN     "parentId" INTEGER;

-- AddForeignKey
ALTER TABLE "Rule" ADD CONSTRAINT "Rule_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Rule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
