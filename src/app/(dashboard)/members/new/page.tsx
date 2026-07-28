import { MemberForm } from "@/components/members/MemberForm";
import { PageHeader } from "@/components/shared/PageHeader";

export default function NewMemberPage() {
  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: "Members", href: "/members" },
          { label: "Add member" },
        ]}
        title="Add member"
        description="Create a new membership record with photo upload or live capture"
      />
      <MemberForm mode="create" />
    </>
  );
}
