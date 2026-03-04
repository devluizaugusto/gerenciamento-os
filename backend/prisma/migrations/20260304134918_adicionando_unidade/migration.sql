/*
  Warnings:

  - Added the required column `unidade` to the `saida_tinta` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `saida_tinta` ADD COLUMN `unidade` VARCHAR(255) NOT NULL;
