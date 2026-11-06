import { unstable_cache } from "next/cache";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";

const MEMBER_STATS_TAG = "members";

async function loadMemberStats() {
  const [byAssembly, officerCount] = await Promise.all([
    prisma.member.groupBy({
      by: ["assembly"],
      _count: { _all: true },
    }),
    prisma.member.count({ where: { status: "OFFICER" } }),
  ]);

  const englishCount =
    byAssembly.find((row) => row.assembly === "ENGLISH")?._count._all ?? 0;
  const localCount =
    byAssembly.find((row) => row.assembly === "LOCAL")?._count._all ?? 0;

  return {
    englishCount,
    localCount,
    officerCount,
    totalMembers: englishCount + localCount,
  };
}

export const getMemberStats = unstable_cache(loadMemberStats, ["member-stats"], {
  revalidate: 60,
  tags: [MEMBER_STATS_TAG],
});

export async function invalidateMemberStats() {
  revalidateTag(MEMBER_STATS_TAG);
}
