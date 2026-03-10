import { getCurrentUser } from "@/lib/action/auth.action";
import { redirect } from "next/navigation";
import InterviewClient from "./InterviewClient";

const Page = async () => {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  return <InterviewClient userId={user.id} userName={user.name} />;
};

export default Page;
