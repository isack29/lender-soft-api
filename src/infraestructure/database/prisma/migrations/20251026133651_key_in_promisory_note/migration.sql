/*
  Warnings:

  - Added the required column `key` to the `PromissoryNote` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PromissoryNote" ADD COLUMN     "key" TEXT NOT NULL;
