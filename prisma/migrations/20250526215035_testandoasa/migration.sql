-- DropForeignKey
ALTER TABLE `historicos` DROP FOREIGN KEY `historicos_usuarioId_fkey`;

-- AddForeignKey
ALTER TABLE `historicos` ADD CONSTRAINT `historicos_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
