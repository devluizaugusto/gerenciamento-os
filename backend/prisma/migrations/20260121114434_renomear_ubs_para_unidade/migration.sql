-- CreateTable
CREATE TABLE `ordem_servico` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `numero_os` INTEGER NOT NULL,
    `solicitante` VARCHAR(255) NOT NULL,
    `unidade` VARCHAR(255) NOT NULL,
    `setor` VARCHAR(255) NOT NULL,
    `descricao_problema` TEXT NOT NULL,
    `data_abertura` DATE NOT NULL,
    `servico_realizado` TEXT NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'aberto',
    `data_fechamento` DATE NULL,

    UNIQUE INDEX `ordem_servico_numero_os_key`(`numero_os`),
    INDEX `ordem_servico_status_idx`(`status`),
    INDEX `ordem_servico_data_abertura_idx`(`data_abertura`),
    INDEX `ordem_servico_numero_os_idx`(`numero_os`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
