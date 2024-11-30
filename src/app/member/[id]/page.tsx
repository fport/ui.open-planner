import JoinMember from "@/app/_components/join-member";

export default function MemberPage({ params }: { params: { id: string } }) {
  return <JoinMember id={params.id} />
}
