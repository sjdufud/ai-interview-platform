import { streamText } from "ai";
import { qwen } from "@/lib/qwen";

export async function POST(request: Request) {
  const { transcript, questions, language } = await request.json();

  const isZh = language === "zh";

  const result = streamText({
    model: qwen("qwen3.5-flash"),
    system: isZh
      ? `你是一位专业的面试教练。请分析以下面试记录并提供详细反馈。
请严格按照以下格式输出：

## Overall Score: X/100

## 各项评分
- **沟通能力**: X/10 - [评价]
- **技术知识**: X/10 - [评价]
- **问题解决**: X/10 - [评价]
- **自信与沉着**: X/10 - [评价]
- **回答相关性**: X/10 - [评价]

## 优势
- [优势1]
- [优势2]
- [优势3]

## 待改进
- [改进点1]
- [改进点2]
- [改进点3]

## Final Assessment
[2-3段详细评估]`
      : `You are an expert interview coach. Analyze the following interview transcript and provide detailed feedback.
Structure your response exactly like this:

## Overall Score: X/100

## Category Scores
- **Communication Skills**: X/10 - [comment]
- **Technical Knowledge**: X/10 - [comment]
- **Problem Solving**: X/10 - [comment]
- **Confidence & Composure**: X/10 - [comment]
- **Relevance of Answers**: X/10 - [comment]

## Strengths
- [strength 1]
- [strength 2]
- [strength 3]

## Areas for Improvement
- [area 1]
- [area 2]
- [area 3]

## Final Assessment
[2-3 paragraph detailed assessment]`,
    prompt: `Interview Questions: ${JSON.stringify(questions)}

Interview Transcript:
${transcript.map((m: { role: string; content: string }) => `${m.role}: ${m.content}`).join("\n")}

Please provide detailed feedback on this interview performance.`,
  });

  return result.toTextStreamResponse();
}
