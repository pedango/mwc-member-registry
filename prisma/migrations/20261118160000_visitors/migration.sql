-- Visitor registrations from the public QR welcome form.
CREATE TABLE "Visitor" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "otherNames" TEXT,
    "lastName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "purpose" TEXT NOT NULL,
    "photoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Visitor_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Visitor_createdAt_idx" ON "Visitor"("createdAt");
CREATE INDEX "Visitor_lastName_firstName_idx" ON "Visitor"("lastName", "firstName");
CREATE INDEX "Visitor_phone_idx" ON "Visitor"("phone");
