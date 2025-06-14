/*
  Warnings:

  - The `epigrafeIAE` column on the `Expense` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "auth"."Expense" DROP COLUMN "epigrafeIAE",
ADD COLUMN     "epigrafeIAE" TEXT[];
