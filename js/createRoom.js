import { auth, db } from "./firebaseConfig.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
  doc,
  setDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const createRoomBtn = document.getElementById("create-room-btn");
const selfFillCheckbox = document.getElementById("self-fill-checkbox");
const boardSizeSelect = document.getElementById("board-size-select");
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
        if (!currentUser) {
          throw new Error("המשתמש אינו מחובר עדיין, נסה שוב רגע.");
        }

        const isSelfFill = selfFillCheckbox ? selfFillCheckbox.checked : false;
        const boardSize = boardSizeSelect ? parseInt(boardSizeSelect.value) : 5;
        const totalCells = boardSize * boardSize;

        if (!isSelfFill) {
          const wordListDoc = await getDoc(
            doc(db, "wordLists", currentUser.uid),
          );
          if (!wordListDoc.exists()) {
            throw new Error(
              "אין לך רשימת מילים שמורה! עליך ליצור רשימה או לסמן אפשרות למילוי עצמי.",
            );
          }

          const wordListData = wordListDoc.data();
          const userWords = wordListData.words || [];

          if (userWords.length < totalCells) {
            throw new Error(
              `רשימת המילים שלך מכילה ${userWords.length} מילים, אך לוח בגודל ${boardSize}x${boardSize} דורש לפחות ${totalCells} מילים!`,
            );
          }
        }

        let username = "שחקן";
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists() && userDocSnap.data().username) {
            username = userDocSnap.data().username;
          }
        } catch (error) {
          console.error("שגיאה בטעינת נתוני משתמש:", error);
        }

        const roomCode = generateRoomCode();

        await setDoc(doc(db, "rooms", roomCode), {
          hostId: currentUser.uid,
          isSelfFill: isSelfFill ? "self-fill" : "predefined",
          boardSize: boardSize,
          createdAt: new Date().toISOString(),
          status: "waiting",
          players: {
            [currentUser.uid]: {
              joinedAt: new Date().toISOString(),
              username: username,
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
