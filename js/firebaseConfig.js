import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

export const firebaseConfig = {
    apiKey: "AIzaSyC4F6tqz6MadY23FkwCCQHeb3Zw80UVGmo",
    authDomain: "bingogame-43305.firebaseapp.com",
    projectId: "bingogame-43305",
    storageBucket: "bingogame-43305.appspot.com",
    messagingSenderId: "252069589863",
    appId: "1:252069589863:web:c53f98ade97584902e75c2"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export function initFirebase() {
    console.log("Firebase initialized successfully!");
    return app;
}

// {/* <script type="module">
//   // Import the functions you need from the SDKs you need
//   import { initializeApp } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js";
//   // TODO: Add SDKs for Firebase products that you want to use
//   // https://firebase.google.com/docs/web/setup#available-libraries

//   // Your web app's Firebase configuration
//   const firebaseConfig = {
//     apiKey: "AIzaSyC4F6tqz6MadY23FkwCCQHeb3Zw80UVGmo",
//     authDomain: "bingogame-43305.firebaseapp.com",
//     projectId: "bingogame-43305",
//     storageBucket: "bingogame-43305.firebasestorage.app",
//     messagingSenderId: "252069589863",
//     appId: "1:252069589863:web:c53f98ade97584902e75c2"
//   };

//   // Initialize Firebase
//   const app = initializeApp(firebaseConfig);
// </script> */}