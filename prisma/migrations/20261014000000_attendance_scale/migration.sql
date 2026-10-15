-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN "assembly" "Assembly";

UPDATE "Attendance" AS a
SET "assembly" = m.assembly
FROM "Member" AS m
WHERE m.id = a."memberId";

ALTER TABLE "Attendance" ALTER COLUMN "assembly" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Attendance_serviceDate_assembly_idx" ON "Attendance"("serviceDate", "assembly");

-- CreateIndex
CREATE INDEX "Member_location_idx" ON "Member"("location");
