-- AlterTable
ALTER TABLE "auth"."User" ADD COLUMN     "epigrafesIAE" TEXT[] DEFAULT ARRAY[]::TEXT[];
