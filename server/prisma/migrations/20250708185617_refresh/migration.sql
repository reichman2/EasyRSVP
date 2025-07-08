/*
  Warnings:

  - A unique constraint covering the columns `[rsvpToken]` on the table `Event` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[eventId,email]` on the table `RSVP` will be added. If there are existing duplicate values, this will fail.
  - The required column `rsvpToken` was added to the `Event` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- CreateEnum
CREATE TYPE "CreationStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED');

-- AlterEnum
ALTER TYPE "RSVPStatus" ADD VALUE 'PENDING';

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "creationStatus" "CreationStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "rsvpToken" TEXT NOT NULL,
ADD COLUMN     "status" "EventStatus" NOT NULL DEFAULT 'UPCOMING',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "RSVP" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "EventCoverImage" (
    "id" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "eventId" TEXT,

    CONSTRAINT "EventCoverImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Image" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "altText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EventCoverImage_eventId_key" ON "EventCoverImage"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "Event_rsvpToken_key" ON "Event"("rsvpToken");

-- CreateIndex
CREATE UNIQUE INDEX "RSVP_eventId_email_key" ON "RSVP"("eventId", "email");

-- AddForeignKey
ALTER TABLE "RSVP" ADD CONSTRAINT "RSVP_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventCoverImage" ADD CONSTRAINT "EventCoverImage_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventCoverImage" ADD CONSTRAINT "EventCoverImage_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;
