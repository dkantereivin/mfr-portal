-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "checksum" TEXT NOT NULL,
    "eventNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stringDate" TEXT NOT NULL,
    "unitTime" TIMESTAMP(3),
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "location" TEXT NOT NULL,
    "equipment" TEXT,
    "refreshedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventMember" (
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "meetAtEvent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventMember_pkey" PRIMARY KEY ("userId","eventId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Event_eventNumber_stringDate_key" ON "Event"("eventNumber", "stringDate");

-- AddForeignKey
ALTER TABLE "EventMember" ADD CONSTRAINT "EventMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventMember" ADD CONSTRAINT "EventMember_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
