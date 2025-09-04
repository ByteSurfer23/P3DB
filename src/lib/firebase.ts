'use client'; // ensures this is loaded in client-side code

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  databaseURL: process.env.NEXT_PUBLIC_RTDB!,
};
console.log(firebaseConfig)
// Initialize Firebase only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Export Firebase services for use anywhere
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
