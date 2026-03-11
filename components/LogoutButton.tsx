"use client"

import { signOut } from "@/lib/action/auth.action"
import { useRouter } from "next/navigation"
import Image from "next/image";
export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    await signOut()
    router.push("/sign-in")
  }

  return (
    <button onClick={handleLogout} className=" flex items-center gap-6 size-8 font-medium ">
      <Image src="/Logout.svg" alt="Logout" width={24} height={24} /> 
    </button>
  )
}
