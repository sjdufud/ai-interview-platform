"use client"
import { useState } from "react"
import Image from "next/image"
import Agent from "@/components/Agent"
import { Button } from "@/components/ui/button"

const InterviewClient = ({ userId, userName }: { userId: string; userName: string }) => {
  const [questions, setQuestions] = useState<string[] | null>(null)
  const [interviewId, setInterviewId] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [role, setRole] = useState("Frontend Developer")
  const [level, setLevel] = useState("junior")
  const [techstack, setTechstack] = useState("React,Next.js,TypeScript")
  const [language, setLanguage] = useState("en")

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      const res = await fetch("/api/vapi/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "technical",
          role,
          level,
          techstack,
          amount: 5,
          userid: userId,
          language,
        }),
      })
      const data = await res.json()
      if (data.success && data.questions) {
        setQuestions(data.questions)
        setInterviewId(data.interviewId || null)
      }
    } catch (e) {
      console.error("Failed to generate questions:", e)
    } finally {
      setIsGenerating(false)
    }
  }

  if (questions) {
    return (
      <>
        <h3>Interview in Progress</h3>
        <Agent userName={userName} userId={userId} interviewId={interviewId || undefined} type="interview" questions={questions} role={role} techstack={techstack} language={language} />
      </>
    )
  }

  return (
    <div className="card-border lg:min-w-[566px] mx-auto">
      <div className="flex flex-col gap-6 card py-14 px-10">
        <div className="flex flex-row gap-2 justify-center">
          <Image src="/logo.svg" alt="logo" height={32} width={38} />
          <h2 className="text-primary-100">Start an Interview</h2>
        </div>
        <h3 className="flex justify-center">Configure your mock interview session</h3>

        <form onSubmit={(e) => { e.preventDefault(); handleGenerate() }} className="w-full space-y-6 mt-4 form">
          <div className="flex flex-col gap-2">
            <label className="label block">Role</label>
            <input
              className="input"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Frontend Developer"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="label block">Experience Level</label>
            <select
              className="input"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
            >
              <option value="junior">Junior</option>
              <option value="mid">Mid</option>
              <option value="senior">Senior</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="label block">Tech Stack</label>
            <input
              className="input"
              value={techstack}
              onChange={(e) => setTechstack(e.target.value)}
              placeholder="e.g. React, Next.js, TypeScript"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="label block">Language / 面试语言</label>
            <select
              className="input"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="en">English</option>
              <option value="zh">中文</option>
            </select>
          </div>
          
          <div className="mt-10">
            <Button className="btn" type="submit" disabled={isGenerating}>
              {isGenerating ? "Generating Questions..." : "Generate & Start Interview"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default InterviewClient
