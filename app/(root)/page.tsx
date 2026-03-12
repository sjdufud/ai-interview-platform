import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import InterviewCard from "@/components/InterviewCard";
import LogoutButton from "@/components/LogoutButton";
import { getCurrentUser, getInterviewsByUserId, getFeedbackByInterviewId } from "@/lib/action/auth.action";
import { redirect } from "next/navigation";

const Page = async () => {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const interviews = await getInterviewsByUserId(user.id);

  // Fetch feedback for all interviews in parallel
  const feedbacks = await Promise.all(
    interviews.map((interview) => getFeedbackByInterviewId(interview.id))
  );

  return (
    <>
     

      <section className="card-cta">
        <div className="flex flex-col gap-6 max-w-lg">
          <h2>Get Interview-Ready with AI-Powered Practice & Feedback</h2>
          <p className="text-lg">Practice on real interview questions & get instant feedback</p>
          <Button asChild className="btn-primary max-sm:w-full">
            <Link href="/interview">Start an Interview</Link>
          </Button>
        </div>
        <Image src="/robot.png" alt="robo-dude" width={400} height={400} className="max-sm:hidden" />
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Your Interviews</h2>
        <div className="interviews-section">
          {interviews.length > 0 ? (
            interviews.map((interview, index) => (
              <InterviewCard
                key={interview.id}
                interviewId={interview.id}
                userId={user.id}
                role={interview.role}
                type={interview.type}
                techstack={interview.techstack}
                createdAt={interview.createdAt}
                coverImage={interview.coverImage}
                feedback={feedbacks[index]}
              />
            ))
          ) : (
            <p>You haven&apos;t taken any interviews yet</p>
          )}
        </div>
      </section>
    </>
  );
};

export default Page;
