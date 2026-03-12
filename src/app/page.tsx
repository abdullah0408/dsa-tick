import { getTopics } from "@/app/actions/algo-sheet";
import { AlgoSheet } from "@/components/algo-sheet";
import { requireAuth } from "@/lib/auth.utils";

export default async function Home() {
  await requireAuth();
  const topics = await getTopics();
  return <AlgoSheet initialData={topics} />;
}
