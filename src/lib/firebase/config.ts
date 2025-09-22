
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBysnrYT1rJFQQvuf18eU4b8_eUo943yBU",
  authDomain: "bs-portal.firebaseapp.com",
  projectId: "bs-portal",
  storageBucket: "bs-portal.appspot.com",
  messagingSenderId: "134599040444",
  appId: "1:134599040444:web:2b08fd4c3f6d767a80dfb9",
  measurementId: "G-CJBXVJMTKP"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };


