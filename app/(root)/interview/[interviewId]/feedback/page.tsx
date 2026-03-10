import { getFeedbackByInterviewId } from "@/lib/action/auth.action";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import FeedbackContent from "@/components/FeedbackContent";

const FeedbackViewPage = async ({ params }: { params: Promise<{ interviewId: string }> }) => {
  const { interviewId } = await params;
  const feedback = await getFeedbackByInterviewId(interviewId);

  if (!feedback) redirect("/");

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
      <h3>Interview Feedback</h3>

      <div className="card-border p-6">
        <div className="flex justify-between items-center mb-4">
          <h4>Overall Score</h4>
          <span className="text-2xl font-semibold">{feedback.totalScore}/100</span>
        </div>
      </div>

      <div className="card-border p-6">
        <FeedbackContent content={feedback.finalAssessment} />
      </div>

      {feedback.feedback && (
        <div className="card-border p-6">
          <h4 className="mb-3">Detailed Feedback</h4>
          <FeedbackContent content={feedback.feedback} />
        </div>
      )}

      <div className="flex gap-4 justify-center">
        <Button asChild className="btn-primary">
          <Link href="/">Back to Home</Link>
        </Button>
        <Button asChild className="btn-primary">
          <Link href="/interview">New Interview</Link>
        </Button>
      </div>
    </div>
  );
};

export default FeedbackViewPage;
