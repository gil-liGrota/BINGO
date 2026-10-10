// Import the functions you need from CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Your web app's Firebase configuration
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

// Export Auth & Database instances for services
export const auth = getAuth(app);
export const db = getDatabase(app);