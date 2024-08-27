/*
  Warnings:

  - You are about to drop the column `role_id` on the `Menu` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Menu" DROP CONSTRAINT "Menu_role_id_fkey";

-- DropIndex
DROP INDEX "Menu_role_id_idx";

-- AlterTable
ALTER TABLE "Menu" DROP COLUMN "role_id";

-- CreateTable
CREATE TABLE "MenuRole" (
    "menu_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,

    CONSTRAINT "MenuRole_pkey" PRIMARY KEY ("menu_id","role_id")
);

-- CreateTable
CREATE TABLE "_MenuToRole" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE INDEX "MenuRole_role_id_idx" ON "MenuRole"("role_id");

-- CreateIndex
CREATE INDEX "MenuRole_menu_id_idx" ON "MenuRole"("menu_id");

-- CreateIndex
CREATE UNIQUE INDEX "_MenuToRole_AB_unique" ON "_MenuToRole"("A", "B");

-- CreateIndex
CREATE INDEX "_MenuToRole_B_index" ON "_MenuToRole"("B");

-- AddForeignKey
ALTER TABLE "MenuRole" ADD CONSTRAINT "MenuRole_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "Menu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuRole" ADD CONSTRAINT "MenuRole_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MenuToRole" ADD CONSTRAINT "_MenuToRole_A_fkey" FOREIGN KEY ("A") REFERENCES "Menu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MenuToRole" ADD CONSTRAINT "_MenuToRole_B_fkey" FOREIGN KEY ("B") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
