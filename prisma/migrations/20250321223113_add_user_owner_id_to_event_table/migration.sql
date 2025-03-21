/*
  Warnings:

  - You are about to drop the column `user_id` on the `events` table. All the data in the column will be lost.
  - Added the required column `user_owner_id` to the `events` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_user_id_fkey";

-- AlterTable
ALTER TABLE "events" DROP COLUMN "user_id",
ADD COLUMN     "user_owner_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "event_employees" (
    "id" TEXT NOT NULL,
    "user_owner_id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "event_employees_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_user_owner_id_fkey" FOREIGN KEY ("user_owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_employees" ADD CONSTRAINT "event_employees_user_owner_id_fkey" FOREIGN KEY ("user_owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_employees" ADD CONSTRAINT "event_employees_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
