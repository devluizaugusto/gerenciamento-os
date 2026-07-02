-- CreateTable
CREATE TABLE `troca_computador` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `patrimonio_cpu_antigo` VARCHAR(100) NOT NULL,
    `patrimonio_monitor_antigo` VARCHAR(100) NOT NULL,
    `patrimonio_cpu_novo` VARCHAR(100) NOT NULL,
    `patrimonio_monitor_novo` VARCHAR(100) NOT NULL,
    `unidade` VARCHAR(255) NOT NULL,
    `setor` VARCHAR(255) NOT NULL DEFAULT 'VACINA',
    `data_troca` DATE NOT NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'em_andamento',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `troca_computador_unidade_idx`(`unidade`),
    INDEX `troca_computador_status_idx`(`status`),
    INDEX `troca_computador_data_troca_idx`(`data_troca`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
