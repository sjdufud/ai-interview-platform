import React, { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { isAuthenticated } from "@/lib/action/auth.action";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import { LogOut } from 'lucide-react';
const RootLayout  = async ({children}:{children:ReactNode}) => {
    const isUserAuthenticated =await isAuthenticated();
    if(!isUserAuthenticated) redirect('/sign-in')
  return (
  <div className="root-layout">
    <nav className="flex items-center justify-between">
        <Link  href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Logo" width={38} height={32}/>
            <h2 className="text-primary-100">VocaMint</h2>
        </Link>
       <LogoutButton />
    </nav>
    {children}
  </div>)
};

export default RootLayout