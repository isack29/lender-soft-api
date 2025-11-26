/*
  Warnings:

  - Added the required column `key` to the `ProofOfPayment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProofOfPayment" ADD COLUMN     "key" TEXT NOT NULL;
