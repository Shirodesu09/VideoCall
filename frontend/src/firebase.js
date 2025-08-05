// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAj0Tdkg1lrOqJxazgJOwj2Ft-AH0s8Tc8",
  authDomain: "video-call-f48d6.firebaseapp.com",
  projectId: "video-call-f48d6",
  storageBucket: "video-call-f48d6.firebasestorage.app",
  messagingSenderId: "1027710391779",
  appId: "1:1027710391779:web:7b853687af0c082ef0bcd6",
  measurementId: "G-J8VLEGF1EM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };