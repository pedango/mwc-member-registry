-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED');

-- AlterTable
ALTER TABLE "Member" ADD COLUMN "title" TEXT,
ADD COLUMN "dateOfBirth" TIMESTAMP(3),
ADD COLUMN "placeOfBirth" TEXT,
ADD COLUMN "email" TEXT,
ADD COLUMN "maritalStatus" "MaritalStatus",
ADD COLUMN "addressLine1" TEXT,
ADD COLUMN "gpsAddress" TEXT,
ADD COLUMN "hometown" TEXT,
ADD COLUMN "streetName" TEXT,
ADD COLUMN "city" TEXT,
ADD COLUMN "holyGhostBaptism" BOOLEAN,
ADD COLUMN "dateOfHolySpiritBaptism" TIMESTAMP(3),
ADD COLUMN "waterBaptism" BOOLEAN,
ADD COLUMN "dateOfConversion" TIMESTAMP(3),
ADD COLUMN "dateOfJoining" TIMESTAMP(3),
ADD COLUMN "placeOfBaptism" TEXT,
ADD COLUMN "officiatingMinisterDistrict" TEXT,
ADD COLUMN "communicant" BOOLEAN,
ADD COLUMN "occupation" TEXT,
ADD COLUMN "educationLevel" TEXT,
ADD COLUMN "dedicated" BOOLEAN,
ADD COLUMN "dedicationDate" TIMESTAMP(3),
ADD COLUMN "dedicationOfficiatingMinister" TEXT,
ADD COLUMN "dedicationChurch" TEXT;

-- Rename existing columns that map to the new profile
ALTER TABLE "Member" RENAME COLUMN "otherNames" TO "middleName";
ALTER TABLE "Member" RENAME COLUMN "contact" TO "phone";
ALTER TABLE "Member" RENAME COLUMN "dateBaptised" TO "dateOfBaptism";
ALTER TABLE "Member" RENAME COLUMN "baptisedBy" TO "officiatingMinisterBaptism";

UPDATE "Member" SET "waterBaptism" = TRUE WHERE "dateOfBaptism" IS NOT NULL;

-- Drop retired profile fields
DROP INDEX IF EXISTS "Member_location_idx";
DROP INDEX IF EXISTS "Member_contact_idx";
ALTER TABLE "Member" DROP COLUMN "location",
DROP COLUMN "motherName",
DROP COLUMN "fatherName",
DROP COLUMN "position";

-- CreateIndex
CREATE INDEX "Member_phone_idx" ON "Member"("phone");

-- CreateIndex
CREATE INDEX "Member_email_idx" ON "Member"("email");
