import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { HttpsProxyAgent } from "https-proxy-agent";

const proxyAgent = process.env.NODE_ENV !== 'production'
    ? new HttpsProxyAgent('http://127.0.0.1:7890')
    : undefined;

const initFirebaseAdmin = () => {
    const apps = getApps();

    if (!apps.length) {
        initializeApp({
            credential: cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")
            }),
            httpAgent: proxyAgent,
        });
    }

    return {
        auth: getAuth(),
        db: getFirestore()
    };
};

export const { auth, db } = initFirebaseAdmin();
