import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MemberForm } from "@/components/members/MemberForm";
import { PageHeader } from "@/components/shared/PageHeader";
import { formatMemberName, toDateInput } from "@/lib/utils";

export default async function EditMemberPage({
  params,
}: {
  params: { id: string };
}) {
  const member = await prisma.member.findUnique({ where: { id: params.id } });
  if (!member) notFound();

  const name = formatMemberName(member);

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
          title: member.title ?? "",
          firstName: member.firstName,
          middleName: member.middleName ?? "",
          lastName: member.lastName,
          sex: member.sex,
          dateOfBirth: toDateInput(member.dateOfBirth),
          placeOfBirth: member.placeOfBirth ?? "",
          phone: member.phone ?? "",
          email: member.email ?? "",
          assembly: member.assembly,
          status: member.status,
          maritalStatus: member.maritalStatus,
          addressLine1: member.addressLine1 ?? "",
          gpsAddress: member.gpsAddress ?? "",
          hometown: member.hometown ?? "",
          streetName: member.streetName ?? "",
          city: member.city ?? "",
          holyGhostBaptism: member.holyGhostBaptism,
          dateOfHolySpiritBaptism: toDateInput(member.dateOfHolySpiritBaptism),
          waterBaptism: member.waterBaptism,
          dateOfBaptism: toDateInput(member.dateOfBaptism),
          dateOfConversion: toDateInput(member.dateOfConversion),
          dateOfJoining: toDateInput(member.dateOfJoining),
          placeOfBaptism: member.placeOfBaptism ?? "",
          officiatingMinisterBaptism: member.officiatingMinisterBaptism ?? "",
          officiatingMinisterDistrict:
            member.officiatingMinisterDistrict ?? "",
          communicant: member.communicant,
          occupation: member.occupation ?? "",
          educationLevel: member.educationLevel ?? "",
          profile: member.profile ?? "",
          dedicated: member.dedicated,
          dedicationDate: toDateInput(member.dedicationDate),
          dedicationOfficiatingMinister:
            member.dedicationOfficiatingMinister ?? "",
          dedicationChurch: member.dedicationChurch ?? "",
          photoUrl: member.photoUrl ?? "",
          updatedAt: member.updatedAt.toISOString(),
        }}
      />
    </>
  );
}
