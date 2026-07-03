import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "semiotic-ion-r5jvd",
  appId: "1:425690155939:web:3935a9570946fea18aa816",
  apiKey: "AIzaSyApBv845-k_rLuUUWtKiVIbcv2KxOFnIR0",
  authDomain: "semiotic-ion-r5jvd.firebaseapp.com",
  storageBucket: "semiotic-ion-r5jvd.firebasestorage.app",
  messagingSenderId: "425690155939"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with specific database ID if provided, otherwise default
const db = getFirestore(app, "ai-studio-3458c30b-0842-447c-bb42-e74e8c6c5bbd");

export { app, db };
