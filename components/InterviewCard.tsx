"use client"
import { useState } from "react";
import dayjs from "dayjs";
import Image from "next/image";
import { getRandomInterviewCover } from "@/lib/utils";
import Link from "next/link";
import { Button } from "./ui/button";
import DisplayTechIcons from "./DisplayTechIcons";
import { useRouter } from "next/navigation";

const InterviewCard = ({ interviewId, role, type, techstack, createdAt, coverImage, feedback }: InterviewCardProps) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const normalizedType = /mix/gi.test(type) ? "Mixed" : type;
  const formattedDate = dayjs(feedback?.createdAt || createdAt || new Date()).format("MMM D, YYYY");

  const handleDelete = async () => {
    if (!interviewId ) return;
    setIsDeleting(true);
    try {
      const res = await fetch("/api/interview/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interviewId }),
      });
      const data = await res.json();
      if (data.success) {
        router.refresh();
      }
    } catch (e) {
      console.error("Delete failed:", e);
    } finally {
      setIsDeleting(false);
    }
  };
  const cover = coverImage || getRandomInterviewCover()

  return (
    <div className="card-border w-[360px] max-sm:w-full min-h-96">
      <div className="card-interview">
        <div>
          <div className="absolute top-0 right-0 w-fit px-4 py-2 rounded-bl-lg bg-light-600">
            <p className="badge-text">{normalizedType}</p>
          </div>
          <button
            className="absolute top-2 left-2 p-1.5 rounded-full hover:bg-red-500/20 transition-colors cursor-pointer"
            onClick={handleDelete}
            disabled={isDeleting}
            title="Delete interview"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white hover:text-red-300">
              <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
            </svg>
          </button>
          <Image src={cover} alt="cover image" width={90} height={90} className="rounded-full object-fit size-[90px]" />
          <h3 className="mt-5 capitalize">{role} Interview</h3>
          <div className="flex flex-row gap-5 mt-3">
            <div className="flex flex-row gap-2">
              <Image src="/calendar.svg" alt="calendar" width={22} height={22} />
              <p>{formattedDate}</p>
              <Image src="/star.svg" alt="star" width={22} height={22} />
              <p>{feedback?.totalScore || "---"}/100</p>
            </div>
          </div>
          <p className="line-clamp-2 mt-5">
            {feedback?.finalAssessment || "You haven't taken the interview yet. Take it now to improve your skills."}
          </p>
        </div>
        <div className="flex flex-row justify-between">
          <DisplayTechIcons techStack={techstack} />
          <Button className="btn-primary" asChild>
            <Link href={feedback ? `/interview/${interviewId}/feedback` : `/interview`}>
              {feedback ? "Check Feedback" : "View Interview"}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InterviewCard;
