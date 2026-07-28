import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MemberForm } from "@/components/members/MemberForm";
import { PageHeader } from "@/components/shared/PageHeader";
import { fullName } from "@/lib/utils";

export default async function EditMemberPage({
  params,
}: {
  params: { id: string };
}) {
  const member = await prisma.member.findUnique({ where: { id: params.id } });
  if (!member) notFound();

  const name = fullName(member);

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: "Members", href: "/members" },
          { label: name, href: `/members/${member.id}` },
          { label: "Edit" },
        ]}
        title="Edit member"
        description={`Update details for ${name}`}
      />
      <MemberForm
        mode="edit"
        memberId={member.id}
        defaultValues={{
          firstName: member.firstName,
          lastName: member.lastName,
          otherNames: member.otherNames ?? "",
          sex: member.sex,
          assembly: member.assembly,
          contact: member.contact ?? "",
          photoUrl: member.photoUrl ?? "",
          location: member.location ?? "",
          motherName: member.motherName ?? "",
          fatherName: member.fatherName ?? "",
          position: member.position ?? "",
          status: member.status,
          dateBaptised: member.dateBaptised
            ? member.dateBaptised.toISOString().slice(0, 10)
            : "",
          baptisedBy: member.baptisedBy ?? "",
          updatedAt: member.updatedAt.toISOString(),
        }}
      />
    </>
  );
}
