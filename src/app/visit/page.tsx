import type { Metadata } from "next";
import { VisitForm } from "./visit-form";

export const metadata: Metadata = {
  title: "Welcome | Mamprobi Worship Center",
  description:
    "Visitor welcome form for Mamprobi Worship Center. Share your details so we can follow up with you.",
};

export default function VisitPage() {
  return (
    <main className="h-dvh overflow-y-auto bg-background">
      <VisitForm />
    </main>
  );
}
