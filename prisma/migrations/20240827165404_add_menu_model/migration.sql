-- CreateTable
CREATE TABLE "Menu" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "role_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Menu_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Menu_role_id_idx" ON "Menu"("role_id");

-- AddForeignKey
ALTER TABLE "Menu" ADD CONSTRAINT "Menu_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
