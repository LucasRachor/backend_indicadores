/*
  Warnings:

  - You are about to drop the column `tipo` on the `setores` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `setores` DROP COLUMN `tipo`,
    ADD COLUMN `slug` VARCHAR(191) NOT NULL DEFAULT '';
