-- AlterTable
ALTER TABLE "auth"."Task" ADD COLUMN     "actualHours" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "progress" INTEGER DEFAULT 0;
