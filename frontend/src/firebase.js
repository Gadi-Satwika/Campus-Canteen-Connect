// frontend/src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDarcjXwOH6mlDs1_BXB84ehz1BTxSoNHU", // PASTE YOUR KEY HERE
  authDomain: "campuscanteenconnect.firebaseapp.com", // PASTE YOUR DOMAIN HERE
  projectId: "campuscanteenconnect",
  storageBucket: "campuscanteenconnect.firebasestorage.app",
  messagingSenderId: "56677041909",
  appId: "1:56677041909:web:db7d9d058eb7ea9806e7bc"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();