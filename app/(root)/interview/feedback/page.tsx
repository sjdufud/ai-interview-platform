"use client"
import { useEffect, useState, useRef } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import ReactMarkdown from "react-markdown"
import { ScrollArea } from "@/components/ui/scroll-area"

const FeedbackPage = () => {
  const searchParams = useSearchParams()
  const [feedback, setFeedback] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [savedInterviewId, setSavedInterviewId] = useState<string | null>(null)
  const feedbackRef = useRef<HTMLDivElement>(null)
  const hasFetched = useRef(false)

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true

    const transcript = searchParams.get("transcript")
    const questions = searchParams.get("questions")
    const interviewId = searchParams.get("interviewId") || "unknown"
    const language = searchParams.get("language") || "en"

    if (!transcript || !questions) {
      setFeedback("No interview data found.")
      setIsLoading(false)
      return
    }

    const fetchFeedback = async () => {
      let fullText = ""
      try {
        const res = await fetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transcript: JSON.parse(transcript),
            questions: JSON.parse(questions),
            language,
          }),
        })
        if (!res.ok || !res.body) {
          setFeedback("Failed to generate feedback.")
          setIsLoading(false)
          return
        }

        const reader = res.body.getReader()
        const decoder = new TextDecoder()

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          fullText += chunk
          setFeedback((prev) => prev + chunk)
        }

        const scoreMatch = fullText.match(/Overall Score:\s*(\d+)/)
        const totalScore = scoreMatch ? parseInt(scoreMatch[1]) : 0

        const assessmentMatch = fullText.match(/## Final Assessment\n([\s\S]+)$/)
        const finalAssessment = assessmentMatch ? assessmentMatch[1].trim() : ""

        await fetch("/api/feedback/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            interviewId,
            userId: searchParams.get("userId") || "",
            feedback: fullText,
            totalScore,
            finalAssessment,
          }),
        })

        if (interviewId !== "unknown") {
          setSavedInterviewId(interviewId)
        }
      } catch {
        setFeedback("Error generating feedback.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchFeedback()
  }, [searchParams])

  useEffect(() => {
    if (feedbackRef.current) {
      feedbackRef.current.scrollTop = feedbackRef.current.scrollHeight
    }
  }, [feedback])

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
      <h3>Interview Feedback</h3>
      <ScrollArea className="h-[70vh] w-full rounded-md">
        <div ref={feedbackRef} className="card-border p-6">
          <div className="prose prose-invert max-w-none text-sm leading-relaxed">
            {feedback ? <ReactMarkdown>{feedback}</ReactMarkdown> : (isLoading ? "Generating feedback..." : "")}
            {isLoading && <span className="animate-pulse">▊</span>}
          </div>
        </div>
      </ScrollArea>

      {!isLoading && (
        <div className="flex gap-4 justify-center">
          <Button asChild className="btn-primary">
            <Link href="/">Back to Home</Link>
          </Button>
          {savedInterviewId ? (
            <Button asChild className="btn-primary">
              <Link href={`/interview/${savedInterviewId}/feedback`}>Check Feedback</Link>
            </Button>
          ) : (
            <Button asChild className="btn-primary">
              <Link href="/interview">New Interview</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export default FeedbackPage