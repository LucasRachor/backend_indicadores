-- DropForeignKey
ALTER TABLE `valor_item` DROP FOREIGN KEY `valor_item_instituicao_id_fkey`;

-- DropForeignKey
ALTER TABLE `valor_item` DROP FOREIGN KEY `valor_item_item_id_fkey`;

-- DropIndex
DROP INDEX `valor_item_instituicao_id_fkey` ON `valor_item`;

-- DropIndex
DROP INDEX `valor_item_item_id_fkey` ON `valor_item`;

-- AddForeignKey
ALTER TABLE `valor_item` ADD CONSTRAINT `valor_item_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `valor_item` ADD CONSTRAINT `valor_item_instituicao_id_fkey` FOREIGN KEY (`instituicao_id`) REFERENCES `instituicoes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
