-- AlterTable
ALTER TABLE `users` ADD COLUMN `emailVerified` BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX `users_email_idx` ON `users`(`email`);

-- CreateIndex
CREATE INDEX `users_googleId_idx` ON `users`(`googleId`);
