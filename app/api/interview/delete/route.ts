import { db } from "@/firebase/admin";

export async function POST(request: Request) {
  const { interviewId } = await request.json();

  if (!interviewId) {
    return Response.json({ success: false, error: "Missing interviewId" }, { status: 400 });
  }

  try {
    // Delete the interview
    await db.collection("interviews").doc(interviewId).delete();

    // Delete associated feedback
    const feedbacks = await db.collection("feedbacks").where("interviewId", "==", interviewId).get();
    const batch = db.batch();
    feedbacks.docs.forEach((doc) => batch.delete(doc.ref));
    if (!feedbacks.empty) await batch.commit();

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : error },
      { status: 500 }
    );
  }
}
