import { getTopics } from "@/app/actions/algo-sheet";
import { AlgoSheet } from "@/components/algo-sheet";

export const dynamic = "force-dynamic";

export default async function Home() {
  const topics = await getTopics();
  return <AlgoSheet initialData={topics} />;
}
