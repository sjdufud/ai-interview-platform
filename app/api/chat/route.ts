import { generateText } from "ai";
import { qwen } from "@/lib/qwen";

export async function POST(request: Request) {
  const { messages, questions, language } = await request.json();

  const lang = language === "zh" ? "Chinese" : "English";

  const systemPrompt = `You are an AI interviewer conducting a job interview in ${lang}. 
You have the following questions to ask: ${JSON.stringify(questions)}.
Ask them one by one. After the candidate answers, give brief feedback and move to the next question.
When all questions are done, thank the candidate and end the interview.
Keep responses concise and professional. You MUST respond in ${lang}.`;

  try {
    const { text } = await generateText({
      model: qwen("qwen3.5-flash"),
      system: systemPrompt,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    return Response.json({ success: true, text }, { status: 200 });
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : error },
      { status: 500 }
    );
  }
}
