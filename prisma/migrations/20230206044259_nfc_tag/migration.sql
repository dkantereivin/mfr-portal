-- CreateEnum
CREATE TYPE "TagActions" AS ENUM ('ATTENDANCE');

-- CreateTable
CREATE TABLE "NfcTag" (
    "uid" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "lastUsed" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "action" "TagActions" NOT NULL,
    "description" TEXT,
    "payload" TEXT NOT NULL,
    "versionCode" TEXT NOT NULL,

    CONSTRAINT "NfcTag_pkey" PRIMARY KEY ("uid")
);
