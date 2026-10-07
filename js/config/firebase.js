// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC3sv6Tcelwie2NYab2sfZwyAtR7u2AXyA",
  authDomain: "bingo-8aaeb.firebaseapp.com",
  databaseURL: "https://bingo-8aaeb-default-rtdb.firebaseio.com",
  projectId: "bingo-8aaeb",
  storageBucket: "bingo-8aaeb.firebasestorage.app",
  messagingSenderId: "616753479978",
  appId: "1:616753479978:web:a83d61388143b9bd499e53",
  measurementId: "G-0F5GK7S55Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);