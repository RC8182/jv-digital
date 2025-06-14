-- AlterTable
ALTER TABLE "auth"."Client" ADD COLUMN     "epigrafesIAE" TEXT[] DEFAULT ARRAY[]::TEXT[];
