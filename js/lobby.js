import { auth, db } from './firebaseConfig.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const logoutBtn = document.getElementById('logout-btn');

export function checkAuthAndLoad() {
    onAuthStateChanged(auth, async (user) => {
        if (user) {            
            try {
                const userDocRef = doc(db, "users", user.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    console.log("משתמש מחובר:", user.uid, user.email, userData.username);
                }
            } catch (error) {
                console.error("שגיאה בטעינת נתוני משתמש:", error);
            }

        } else {
            window.location.href = 'index.html';
        }
    });
}

checkAuthAndLoad();

if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        try {
            await signOut(auth);
            window.location.href = 'index.html';
        } catch (error) {
            console.error("שגיאה בהתנתקות:", error);
        }
    });
}