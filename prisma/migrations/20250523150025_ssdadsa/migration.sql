-- DropForeignKey
ALTER TABLE `historicos` DROP FOREIGN KEY `historicos_setorId_fkey`;

-- AddForeignKey
ALTER TABLE `historicos` ADD CONSTRAINT `historicos_setorId_fkey` FOREIGN KEY (`setorId`) REFERENCES `setores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
