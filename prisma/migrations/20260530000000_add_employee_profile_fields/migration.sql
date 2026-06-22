-- AlterEnum
BEGIN;
CREATE TYPE "AppointmentStatus_new" AS ENUM ('PENDING', 'APPROVED', 'IN_PROGRESS', 'FINISHED', 'REJECTED');
ALTER TABLE "public"."appointments" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "appointments" ALTER COLUMN "status" TYPE "AppointmentStatus_new" USING ("status"::text::"AppointmentStatus_new");
ALTER TYPE "AppointmentStatus" RENAME TO "AppointmentStatus_old";
ALTER TYPE "AppointmentStatus_new" RENAME TO "AppointmentStatus";
DROP TYPE "public"."AppointmentStatus_old";
ALTER TABLE "appointments" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterTable
ALTER TABLE "employees" ADD COLUMN     "about" TEXT[],
ADD COLUMN     "certificates" TEXT[],
ADD COLUMN     "description" TEXT,
ADD COLUMN     "education" TEXT[],
ADD COLUMN     "experience_years" INTEGER,
ADD COLUMN     "photo" TEXT,
ADD COLUMN     "work_schedule" JSONB;

-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "positions" ALTER COLUMN "organization_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "services" ALTER COLUMN "is_active" SET DEFAULT true;

-- CreateTable
CREATE TABLE "_EmployeeToService" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EmployeeToService_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_EmployeeToService_B_index" ON "_EmployeeToService"("B");

-- AddForeignKey
ALTER TABLE "_EmployeeToService" ADD CONSTRAINT "_EmployeeToService_A_fkey" FOREIGN KEY ("A") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmployeeToService" ADD CONSTRAINT "_EmployeeToService_B_fkey" FOREIGN KEY ("B") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
