-- CreateEnum
CREATE TYPE "MykasihCategory" AS ENUM ('GROCERY', 'DAIRY', 'PRODUCE', 'HOUSEHOLD', 'PERSONAL_CARE', 'BABY', 'BEVERAGE', 'FROZEN');

-- CreateTable
CREATE TABLE "MykasihProduct" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameMs" TEXT,
    "brand" TEXT,
    "category" "MykasihCategory" NOT NULL,
    "description" TEXT,
    "unit" TEXT NOT NULL,
    "priceRm" DECIMAL(10,2) NOT NULL,
    "subsidyRm" DECIMAL(10,2) NOT NULL,
    "imageUrl" TEXT,
    "barcode" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MykasihProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MykasihProduct_barcode_key" ON "MykasihProduct"("barcode");

-- CreateIndex
CREATE INDEX "MykasihProduct_category_idx" ON "MykasihProduct"("category");

-- CreateIndex
CREATE INDEX "MykasihProduct_isActive_idx" ON "MykasihProduct"("isActive");
