import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const USE_MOCK_FIREBASE = false;

const firebaseConfig = {
  apiKey: "AIzaSyBkJVxrJtEIOn6vFcwTrp7uxFEOGjkgHz4",
  authDomain: "ai-website-b4c66.firebaseapp.com",
  projectId: "ai-website-b4c66",
  storageBucket: "ai-website-b4c66.firebasestorage.app",
  messagingSenderId: "630258522809",
  appId: "1:630258522809:web:b8501191ab9afaeedc1968"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// Set persistence to local storage (survives browser restart)
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error("Failed to set auth persistence:", error);
  });
}
