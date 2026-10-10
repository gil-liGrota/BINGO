import { auth, db } from "./firebaseConfig.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
  doc,
  setDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const createRoomBtn = document.getElementById("create-room-btn");
const selfFillCheckbox = document.getElementById("self-fill-checkbox");
const errorMsg = document.getElementById("error-msg");
let currentUser = null;

function checkAuthState() {
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

function generateRoomCode() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

async function createNewRoom() {
  if (createRoomBtn) {
    createRoomBtn.addEventListener("click", async () => {
      if (errorMsg) errorMsg.textContent = "";

      try {
        const isSelfFill = selfFillCheckbox ? selfFillCheckbox.checked : false;

        if (!isSelfFill) {
          const wordListDoc = await getDoc(
            doc(db, "wordLists", currentUser.uid),
          );
          if (!wordListDoc.exists()) {
            throw new Error(
              "אין לך רשימת מילים שמורה! עליך ליצור רשימה או לסמן אפשרות למילוי עצמי.",
            );
          }
        }

        const roomCode = generateRoomCode();

        await setDoc(doc(db, "rooms", roomCode), {
          hostId: currentUser.uid,
          isSelfFill: isSelfFill ? "self-fill" : "predefined",
          createdAt: new Date().toISOString(),
          players: {
            [currentUser.uid]: {
              joinedAt: new Date().toISOString(),
            },
          },
        });

        localStorage.setItem("roomCode", roomCode);
        window.location.href = "room.html";
      } catch (error) {
        if (errorMsg) {
          errorMsg.textContent = error.message;
        } else {
          console.error(error);
        }
      }
    });
  }
}

createNewRoom();
