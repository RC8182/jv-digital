-- AlterTable
ALTER TABLE "auth"."Expense" ADD COLUMN     "fileHash" TEXT,
ADD COLUMN     "processingError" TEXT,
ADD COLUMN     "processingStatus" TEXT NOT NULL DEFAULT 'pendiente';
