-- GIN trigram indexes (Prisma cannot express these in schema.prisma).
-- Transactional CREATE INDEX is safe at the current size and at ~10k rows.
-- CREATE INDEX CONCURRENTLY cannot run inside a Prisma migration transaction.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS "Member_status_idx" ON "Member"("status");
CREATE INDEX IF NOT EXISTS "Member_createdById_idx" ON "Member"("createdById");
CREATE INDEX IF NOT EXISTS "AuditLog_userId_idx" ON "AuditLog"("userId");
-- Supports surname-then-first list sort (already present from init; IF NOT EXISTS is live-safe).
CREATE INDEX IF NOT EXISTS "Member_lastName_firstName_idx" ON "Member"("lastName", "firstName");

CREATE INDEX IF NOT EXISTS "Member_firstName_trgm_idx"
  ON "Member" USING GIN ("firstName" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "Member_lastName_trgm_idx"
  ON "Member" USING GIN ("lastName" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "Member_middleName_trgm_idx"
  ON "Member" USING GIN ("middleName" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "Member_phone_trgm_idx"
  ON "Member" USING GIN ("phone" gin_trgm_ops);
