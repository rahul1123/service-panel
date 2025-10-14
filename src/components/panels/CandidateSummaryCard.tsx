import { Card } from "@/components/ui/card";

interface CandidateProfileForSummary {
  summary: string;
}

interface CandidateSummaryCardProps {
  candidate: CandidateProfileForSummary;
}

export default function CandidateSummaryCard({
  candidate,
}: CandidateSummaryCardProps) {
  const { summary } = candidate;

  return (
    <Card className="p-4 shadow-sm rounded-xl">
      <div className="text-sm">
        <strong className="font-medium">SUMMARY</strong>{" "}
        {summary ? (
          <p className="text-slate-600 mt-2">{summary}</p>
        ) : (
          <p className="text-slate-500 text-xs mt-2">No Summary Found!</p>
        )}
      </div>
    </Card>
  );
}
