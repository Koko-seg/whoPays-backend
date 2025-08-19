/*
  Warnings:

  - A unique constraint covering the columns `[roomId,name]` on the table `Participant` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[roomName]` on the table `Room` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Participant" ADD COLUMN     "isHost" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Participant_roomId_name_key" ON "public"."Participant"("roomId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Room_roomName_key" ON "public"."Room"("roomName");
