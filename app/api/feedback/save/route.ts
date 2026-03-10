import { db } from "@/firebase/admin";

export async function POST(request: Request) {
  const { interviewId, userId, feedback, totalScore, finalAssessment } =
    await request.json();

  try {
    const docRef = await db.collection("feedbacks").add({
      interviewId,
      userId,
      feedback,
      totalScore,
      finalAssessment,
      createdAt: new Date().toISOString(),
    });

    return Response.json(
      { success: true, feedbackId: docRef.id },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : error },
      { status: 500 }
    );
  }
}
