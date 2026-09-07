import { ReviewQueuePage } from "@/app/dashboard/catalogue/page";

export const dynamic = "force-dynamic";

export default function DealReviewQueuePage({
  searchParams,
}: {
  searchParams: Promise<{ published?: string; rejected?: string; dismissed?: string; retried?: string; error?: string; view?: string; bulkIntent?: string; bulkCompleted?: string; bulkFailed?: string }>;
}) {
  return <ReviewQueuePage kind="deals" searchParams={searchParams} />;
}
