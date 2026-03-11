'use server';

import { auth, db } from "@/firebase/admin";
import { cookies } from "next/headers";
// import {redirect} from "next/navigation";
const SESSION_DURATION = 60 * 60 * 24 * 7;

export async function signUp(params: SignUpParams) {
    const { uid, name, email } = params;

    try {
        const userRecord = await db.collection('users').doc(uid).get();
        if (userRecord.exists) {
            return {
                success: false,
                message: 'User already exists. Please sign in instead'
            }
        }

        await db.collection('users').doc(uid).set({
            name,
            email
        });

        return {
            success: true,
            message: 'Account created successfully.Please sign in'
        }
    } catch (e: any) {
        console.log('Error creating a user', e);

        const error = e as { code?: string };
        if (error.code === 'auth/email-already-exists') {
            return {
                success: false,
                message: 'This email is already in use'
            }
        }

        return {
            success: false,
            message: 'Failed to create an account'
        }
    }
}

export async function signIn(params: SignInParams){
    const {email,idToken} =params;
    try{
        const userRecord = await auth.getUserByEmail(email)
         if(!userRecord){
            return{
                success:false,
                message:"User does not exist,create an account instead"
            }
        }
        await setSessionCookie(idToken)
       
    }catch(e){
        console.log(e)
       
    }
}

export async function setSessionCookie(idToken:string){
    const cookieStore =await cookies();
    const sessionCookie= await auth.createSessionCookie(idToken,{
        expiresIn:SESSION_DURATION*1000
    })
    cookieStore.set('session',sessionCookie,{
        maxAge:SESSION_DURATION,
        httpOnly:true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: "lax",
    })
}

export async function getCurrentUser(): Promise<User|null>{
    const cookieStore =await cookies();
    const sessionCookie =cookieStore.get('session')?.value;
    if(!sessionCookie){
    return null
}
    try{
        const decodeClaims =await auth.verifySessionCookie(sessionCookie,true);
        const userRecord =await db.collection('users').doc(decodeClaims.uid).get();
        if(!userRecord.exists)return null
        return{
            ...userRecord.data(),
            id:userRecord.id,
        } as User;
    
}catch(e){
    console.log(e)
    return null
    }
}

export async function isAuthenticated(){
    const user =await getCurrentUser();
    return !!user;
}

export async function getInterviewsByUserId(userId: string): Promise<Interview[]> {
    const snapshot = await db.collection('interviews')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    })) as Interview[];
}

export async function getFeedbackByInterviewId(interviewId: string): Promise<Feedback | null> {
    const snapshot = await db.collection('feedbacks')
        .where('interviewId', '==', interviewId)
        .limit(1)
        .get();

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return {
        id: doc.id,
        ...doc.data()
    } as Feedback;
}

export async function signOut() {
    const cookieStore = await cookies();
    cookieStore.delete('session');
}
