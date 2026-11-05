import { submissionInstructions } from "@/lib/shared/submission";

export function GET() {
  return new Response(submissionInstructions, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
