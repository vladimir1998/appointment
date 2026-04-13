-- AlterTable
ALTER TABLE "users" ADD COLUMN "first_name" TEXT NOT NULL DEFAULT '';
ALTER TABLE "users" ADD COLUMN "last_name" TEXT NOT NULL DEFAULT '';
ALTER TABLE "users" ADD COLUMN "phone" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");
