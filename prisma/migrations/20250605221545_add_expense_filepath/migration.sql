-- AlterTable
ALTER TABLE "auth"."Expense" ADD COLUMN     "filePath" TEXT,
ALTER COLUMN "date" DROP NOT NULL,
ALTER COLUMN "date" DROP DEFAULT;
