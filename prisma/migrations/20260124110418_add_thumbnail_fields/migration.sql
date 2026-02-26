-- AlterTable
ALTER TABLE `boards` ADD COLUMN `thumbnailPublicId` VARCHAR(191) NULL,
    ADD COLUMN `thumbnailUpdatedAt` DATETIME(3) NULL,
    ADD COLUMN `thumbnailUrl` VARCHAR(191) NULL;
