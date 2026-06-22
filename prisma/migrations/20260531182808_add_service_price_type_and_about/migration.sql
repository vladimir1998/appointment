/*
  Warnings:

  - Made the column `price` on table `services` required. This step will fail if there are existing NULL values in that column.
  - Made the column `duration` on table `services` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "PriceType" AS ENUM ('exact', 'approximate', 'from', 'range');

-- AlterTable
ALTER TABLE "services" ADD COLUMN     "about" TEXT[],
ADD COLUMN     "price_comment" TEXT,
ADD COLUMN     "price_max" DECIMAL(10,2),
ADD COLUMN     "price_type" "PriceType" NOT NULL DEFAULT 'exact',
ALTER COLUMN "price" SET NOT NULL,
ALTER COLUMN "price" SET DEFAULT 0,
ALTER COLUMN "duration" SET NOT NULL,
ALTER COLUMN "duration" SET DEFAULT 0;
