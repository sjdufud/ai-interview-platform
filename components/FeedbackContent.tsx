"use client"
import ReactMarkdown from "react-markdown"

const FeedbackContent = ({ content }: { content: string }) => {
  return (
    <div className="prose prose-invert max-w-none text-sm leading-relaxed">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  )
}

export default FeedbackContent
