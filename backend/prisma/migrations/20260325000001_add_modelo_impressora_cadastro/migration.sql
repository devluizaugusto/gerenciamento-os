-- CreateTable: modelo_impressora_cadastro
-- Esta migration cria a tabela de modelos de impressora e adiciona a FK em estoque_tinta

CREATE TABLE IF NOT EXISTS `modelo_impressora_cadastro` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `descricao` VARCHAR(255) NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `modelo_impressora_cadastro_nome_key`(`nome`),
    INDEX `modelo_impressora_cadastro_ativo_idx`(`ativo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Migra os nomes distintos já existentes em estoque_tinta para a tabela de cadastro
INSERT IGNORE INTO `modelo_impressora_cadastro` (`nome`, `ativo`, `created_at`, `updated_at`)
SELECT DISTINCT `modelo_impressora`, true, NOW(), NOW()
FROM `estoque_tinta`
WHERE `modelo_impressora` IS NOT NULL AND `modelo_impressora` != '';

-- Altera o tamanho do campo modelo_impressora em estoque_tinta para bater com VARCHAR(100) da FK
ALTER TABLE `estoque_tinta` MODIFY COLUMN `modelo_impressora` VARCHAR(100) NOT NULL;

-- AddForeignKey: estoque_tinta.modelo_impressora -> modelo_impressora_cadastro.nome
-- Usa ON UPDATE CASCADE para que renomear o modelo atualize automaticamente os estoques
-- Usa ON DELETE RESTRICT para impedir exclusão de modelo com estoques associados
ALTER TABLE `estoque_tinta`
  ADD CONSTRAINT `estoque_tinta_modelo_impressora_fkey`
  FOREIGN KEY (`modelo_impressora`)
  REFERENCES `modelo_impressora_cadastro`(`nome`)
  ON DELETE RESTRICT
  ON UPDATE CASCADE;
