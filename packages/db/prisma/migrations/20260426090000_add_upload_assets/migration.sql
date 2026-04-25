-- CreateTable
CREATE TABLE "UploadAsset" (
    "id" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "storedName" TEXT NOT NULL,
    "relativePath" TEXT NOT NULL,
    "publicUrl" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "sha256" TEXT NOT NULL,
    "visibility" TEXT NOT NULL DEFAULT 'PUBLIC',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UploadAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UploadAsset_relativePath_key" ON "UploadAsset"("relativePath");

-- CreateIndex
CREATE INDEX "UploadAsset_ownerUserId_idx" ON "UploadAsset"("ownerUserId");

-- CreateIndex
CREATE INDEX "UploadAsset_sha256_idx" ON "UploadAsset"("sha256");

-- CreateIndex
CREATE INDEX "UploadAsset_createdAt_idx" ON "UploadAsset"("createdAt");

-- AddForeignKey
ALTER TABLE "UploadAsset" ADD CONSTRAINT "UploadAsset_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
