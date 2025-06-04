CREATE TABLE "auth"."Expense" (
  "id"          SERIAL PRIMARY KEY,
  "userId"      TEXT NOT NULL,
  "supplier"    TEXT,
  "date"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "baseAmount"  DOUBLE PRECISION,
  "taxAmount"   DOUBLE PRECISION,
  "totalAmount" DOUBLE PRECISION,
  "filename"    TEXT NOT NULL,
  "docId"       TEXT NOT NULL,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Expense_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"."User"("id") ON DELETE CASCADE
);
