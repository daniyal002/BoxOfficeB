/*
  Warnings:

  - Added the required column `orderStatus` to the `Status` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Status" ADD COLUMN     "orderStatus" "OrderStatus" NOT NULL;
