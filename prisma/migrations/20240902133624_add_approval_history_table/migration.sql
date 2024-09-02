-- CreateTable
CREATE TABLE "ApprovalHistory" (
    "id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApprovalHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ApprovalHistory_order_id_idx" ON "ApprovalHistory"("order_id");

-- AddForeignKey
ALTER TABLE "ApprovalHistory" ADD CONSTRAINT "ApprovalHistory_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
