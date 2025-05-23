-- CreateTable
CREATE TABLE `historicos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuarioId` INTEGER NOT NULL,
    `itemId` INTEGER NOT NULL,
    `setorId` INTEGER NOT NULL,
    `ano` INTEGER NOT NULL,
    `mes` INTEGER NOT NULL,
    `valorFieam` DOUBLE NOT NULL,
    `valorSesi` DOUBLE NOT NULL,
    `valorSenai` DOUBLE NOT NULL,
    `valorIel` DOUBLE NOT NULL,
    `totalGeral` DOUBLE NOT NULL,
    `dataAlteracao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `historicos_itemId_idx`(`itemId`),
    INDEX `historicos_setorId_idx`(`setorId`),
    INDEX `historicos_usuarioId_idx`(`usuarioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `instituicoes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `instituicoes_nome_key`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `detalhes` VARCHAR(191) NULL,
    `setor_id` INTEGER NOT NULL,
    `ano` INTEGER NOT NULL,
    `atividade` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `perfis` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `detalhes` VARCHAR(191) NULL,
    `tipo` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `perfis_nome_key`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `setores` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `tipo` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `setores_nome_key`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuarios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `senha` VARCHAR(191) NOT NULL,
    `jornadaTrabalho` VARCHAR(191) NOT NULL,
    `statusSenha` BOOLEAN NOT NULL DEFAULT true,
    `perfilId` INTEGER NOT NULL,
    `setorId` INTEGER NULL,

    UNIQUE INDEX `usuarios_email_key`(`email`),
    INDEX `usuarios_perfilId_idx`(`perfilId`),
    INDEX `usuarios_setorId_idx`(`setorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuario_setor` (
    `usuarioId` INTEGER NOT NULL,
    `setorId` INTEGER NOT NULL,

    INDEX `usuario_setor_setorId_idx`(`setorId`),
    PRIMARY KEY (`usuarioId`, `setorId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `valor_item` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `item_id` INTEGER NOT NULL,
    `instituicao_id` INTEGER NOT NULL,
    `mes` INTEGER NOT NULL,
    `valor` DECIMAL(65, 30) NULL DEFAULT 0.00,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jornada_colaboradores` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `colaboradorId` INTEGER NOT NULL,
    `setorId` INTEGER NOT NULL,
    `ano` INTEGER NOT NULL,
    `mes` INTEGER NOT NULL,
    `dia` INTEGER NOT NULL,
    `valor` VARCHAR(191) NOT NULL,
    `motivo` VARCHAR(191) NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `jornada_colaboradores_colaboradorId_ano_mes_dia_key`(`colaboradorId`, `ano`, `mes`, `dia`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `historicos` ADD CONSTRAINT `historicos_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historicos` ADD CONSTRAINT `historicos_setorId_fkey` FOREIGN KEY (`setorId`) REFERENCES `setores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historicos` ADD CONSTRAINT `historicos_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `items` ADD CONSTRAINT `items_setor_id_fkey` FOREIGN KEY (`setor_id`) REFERENCES `setores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `usuarios_perfilId_fkey` FOREIGN KEY (`perfilId`) REFERENCES `perfis`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `usuarios_setorId_fkey` FOREIGN KEY (`setorId`) REFERENCES `setores`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usuario_setor` ADD CONSTRAINT `usuario_setor_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usuario_setor` ADD CONSTRAINT `usuario_setor_setorId_fkey` FOREIGN KEY (`setorId`) REFERENCES `setores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `valor_item` ADD CONSTRAINT `valor_item_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `valor_item` ADD CONSTRAINT `valor_item_instituicao_id_fkey` FOREIGN KEY (`instituicao_id`) REFERENCES `instituicoes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jornada_colaboradores` ADD CONSTRAINT `jornada_colaboradores_colaboradorId_fkey` FOREIGN KEY (`colaboradorId`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jornada_colaboradores` ADD CONSTRAINT `jornada_colaboradores_setorId_fkey` FOREIGN KEY (`setorId`) REFERENCES `setores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
