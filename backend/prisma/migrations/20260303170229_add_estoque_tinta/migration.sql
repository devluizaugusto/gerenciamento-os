-- CreateTable
CREATE TABLE `estoque_tinta` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `modelo_impressora` VARCHAR(50) NOT NULL,
    `cor_tinta` VARCHAR(50) NOT NULL,
    `codigo_tinta` VARCHAR(50) NOT NULL,
    `quantidade_atual` INTEGER NOT NULL DEFAULT 0,
    `quantidade_minima` INTEGER NOT NULL DEFAULT 2,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `estoque_tinta_modelo_impressora_idx`(`modelo_impressora`),
    UNIQUE INDEX `estoque_tinta_modelo_impressora_codigo_tinta_key`(`modelo_impressora`, `codigo_tinta`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `saida_tinta` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `estoque_id` INTEGER NOT NULL,
    `quantidade` INTEGER NOT NULL,
    `setor` VARCHAR(255) NOT NULL,
    `responsavel` VARCHAR(255) NOT NULL,
    `observacao` TEXT NULL,
    `data_saida` DATE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `saida_tinta_estoque_id_idx`(`estoque_id`),
    INDEX `saida_tinta_data_saida_idx`(`data_saida`),
    INDEX `saida_tinta_setor_idx`(`setor`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `saida_tinta` ADD CONSTRAINT `saida_tinta_estoque_id_fkey` FOREIGN KEY (`estoque_id`) REFERENCES `estoque_tinta`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
