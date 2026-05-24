import SharedProfileView from "@/src/features/profile/components/shared-profile-view";

export default async function SharedProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  return <SharedProfileView userId={userId} />;
}
