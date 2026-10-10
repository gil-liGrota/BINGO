import { auth, db } from "./firebaseConfig.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const roomCodeInput = document.getElementById("room-code-input");
const joinRoomBtn = document.getElementById("join-room-btn");
const errorMsg = document.getElementById("error-msg"); 

let currentUser = null;

function checkAuthState(){
    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUser = user;
            console.log("משתמש מחובר:", user.uid, user.email);
        } else {
            window.location.href = "index.html";
        }
    });
}

checkAuthState();

function joinRoom() {
    if (joinRoomBtn) {
        joinRoomBtn.addEventListener("click", async () => {
            if (errorMsg) errorMsg.textContent = "";
    
            try {
                const roomCode = roomCodeInput ? roomCodeInput.value.trim().toUpperCase() : "";
    
                if (!roomCode) {
                    throw new Error("נא להכניס קוד חדר תקין.");
                }
    
                const activeUser = currentUser || auth.currentUser;
                if (!activeUser) {
                    throw new Error("המשתמש אינו מחובר. אנא המתן רגע או התחבר מחדש.");
                }
    
                const roomRef = doc(db, "rooms", roomCode);
                const roomDoc = await getDoc(roomRef);
    
                if (!roomDoc.exists()) {
                    throw new Error("החדר המבוקש לא קיים. בדוק את הקוד ונסה שוב.");
                }
    
                const roomData = roomDoc.data();
                
                if (roomData.status !== "waiting") {
                    throw new Error("המשחק בחדר הזה כבר התחיל או הסתיים.");
                }
    
                await updateDoc(roomRef, {
                    [`players.${activeUser.uid}`]: {
                        joinedAt: new Date().toISOString(),
                    }
                });
    
                localStorage.setItem("roomCode", roomCode);
                window.location.href = "room.html";
    
            } catch (error) {
                console.error(error);
                if (errorMsg) {
                    errorMsg.textContent = error.message;
                } else {
                    alert(error.message);
                }
            }
        });
    }
}

joinRoom();