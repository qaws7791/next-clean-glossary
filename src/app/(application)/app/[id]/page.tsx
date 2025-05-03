import TermHeader from "@/app/(application)/app/[id]/term-header";
import TermTable from "@/app/(application)/app/[id]/term-table";

export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="w-full flex flex-col p-4">
      <TermHeader glossaryId={id} />
      <TermTable id={id} />
    </div>
  );
}
