-- AlterTable
ALTER TABLE "auth"."Task" ADD COLUMN     "category" TEXT,
ADD COLUMN     "clientName" TEXT,
ADD COLUMN     "project" TEXT,
ADD COLUMN     "recurrent" TEXT,
ADD COLUMN     "relatedDocumentIds" TEXT[],
ADD COLUMN     "requiredTools" TEXT[];
