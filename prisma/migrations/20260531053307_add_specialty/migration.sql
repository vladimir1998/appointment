-- CreateTable
CREATE TABLE "specialties" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "organization_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "specialties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_EmployeeToSpecialty" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EmployeeToSpecialty_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_EmployeeToSpecialty_B_index" ON "_EmployeeToSpecialty"("B");

-- AddForeignKey
ALTER TABLE "specialties" ADD CONSTRAINT "specialties_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmployeeToSpecialty" ADD CONSTRAINT "_EmployeeToSpecialty_A_fkey" FOREIGN KEY ("A") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmployeeToSpecialty" ADD CONSTRAINT "_EmployeeToSpecialty_B_fkey" FOREIGN KEY ("B") REFERENCES "specialties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
