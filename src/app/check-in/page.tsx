import { formatServiceDateLong, getServiceDate } from "@/lib/attendance";
import { CheckInClient } from "./check-in-client";

export const dynamic = "force-dynamic";

export default function CheckInPage() {
  const serviceDate = getServiceDate();

  return (
    <main className="h-dvh overflow-y-auto bg-background">
      <CheckInClient serviceLabel={formatServiceDateLong(serviceDate)} />
    </main>
  );
}
