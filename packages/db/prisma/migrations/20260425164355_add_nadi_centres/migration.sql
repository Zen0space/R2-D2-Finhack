-- CreateTable
CREATE TABLE "NadiCentre" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "districtHint" TEXT,
    "rawPosition" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NadiCentre_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NadiCentre_state_idx" ON "NadiCentre"("state");

-- CreateIndex
CREATE INDEX "NadiCentre_districtHint_idx" ON "NadiCentre"("districtHint");

-- CreateIndex
CREATE INDEX "NadiCentre_rawPosition_idx" ON "NadiCentre"("rawPosition");
