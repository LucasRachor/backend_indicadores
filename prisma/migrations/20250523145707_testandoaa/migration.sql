-- DropForeignKey
ALTER TABLE `items` DROP FOREIGN KEY `items_setor_id_fkey`;

-- DropIndex
DROP INDEX `items_setor_id_fkey` ON `items`;

-- AddForeignKey
ALTER TABLE `items` ADD CONSTRAINT `items_setor_id_fkey` FOREIGN KEY (`setor_id`) REFERENCES `setores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
