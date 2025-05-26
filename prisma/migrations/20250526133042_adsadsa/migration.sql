/*
  Warnings:

  - You are about to drop the column `totalGeral` on the `valor_item` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `items` ADD COLUMN `moeda` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `valor_item` DROP COLUMN `totalGeral`;
