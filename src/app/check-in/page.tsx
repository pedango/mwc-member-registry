import { formatServiceDateLong, getServiceDate } from "@/lib/attendance";
import { CheckInClient } from "./check-in-client";

export const dynamic = "force-dynamic";

export default function CheckInPage() {
  const serviceDate = getServiceDate();

  return (
    <main className="min-h-dvh bg-background">
      <CheckInClient serviceLabel={formatServiceDateLong(serviceDate)} />
    </main>
  );
}
