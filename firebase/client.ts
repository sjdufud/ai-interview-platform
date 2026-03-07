// Import the functions you need from the SDKs you need
import { initializeApp,getApp,getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAPFzV6s_1gplw_x97ob36eAr-Jk5FDses",
  authDomain: "vocamint.firebaseapp.com",
  projectId: "vocamint",
  storageBucket: "vocamint.firebasestorage.app",
  messagingSenderId: "288875324733",
  appId: "1:288875324733:web:1eb4c949aef36fc8c09154",
  measurementId: "G-RJE1KJJRDV"
};

// Initialize Firebase
const app = !getApps().length? initializeApp(firebaseConfig): getApp();
export const auth =getAuth(app);
export const db = getFirestore(app);