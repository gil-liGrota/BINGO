import { auth, db } from "./firebaseConfig.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const saveBoardBtn = document.getElementById("save-board-btn");
const startGameBtn = document.getElementById("start-game-btn");
const roomPlayersList = document.getElementById("room-players-list");
const exitRoomBtn = document.getElementById("exit-room-btn");
const boardBuilderContainer = document.getElementById(
  "board-builder-container",
);

const roomCode = localStorage.getItem("roomCode");
let currentUser = null;
let roomDataCache = null;

function checkAuthState() {
  if (!roomCode) {
    window.location.href = "lobby.html";
  }
  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUser = user;
      console.log("משתמש מחובר:", user.uid, user.email);
      initRoom();
    } else {
      window.location.href = "index.html";
    }
  });
}

checkAuthState();

function listenToRoomUpdates() {
  if (saveBoardBtn) {
    saveBoardBtn.addEventListener("click", async () => {
      try {
        if (roomDataCache && roomDataCache.isSelfFill === "self-fill") {
          const inputs = boardBuilderContainer.querySelectorAll(".bingo-input");
          const words = [];
          inputs.forEach((input) => words.push(input.value.trim()));

          const totalCells =
            (roomDataCache.boardSize || 5) * (roomDataCache.boardSize || 5);

          if (
            words.some((word) => word === "") ||
            words.length !== totalCells
          ) {
            alert(`נא למלא את כל ${totalCells} המשבצות בלוח לפני השמירה!`);
            return;
          }

          const uniqueWords = new Set(words);
          if (uniqueWords.size !== words.length) {
            alert("לא ניתן להכניס מילים כפולות באותו הלוח!");
            return;
          }

          const roomRef = doc(db, "rooms", roomCode);
          await updateDoc(roomRef, {
            [`players.${currentUser.uid}.board`]: words,
          });

          alert("הלוח האישי שלך נשמר בהצלחה במסד הנתונים!");
        } else {
          alert("הלוח שלך הוגרל ונשמר בהצלחה! ממתין למארח שיתחיל את המשחק.");
        }
      } catch (error) {
        console.error("שגיאה בשמירת הלוח:", error);
        alert("שגיאה בשמירת הלוח.");
      }
    });
  }
}

listenToRoomUpdates();

function setupHostControls() {
  if (startGameBtn) {
    startGameBtn.addEventListener("click", async () => {
      try {
        const roomRef = doc(db, "rooms", roomCode);
        await updateDoc(roomRef, {
          status: "playing",
        });
        console.log("המשחק התחיל!");
      } catch (error) {
        console.error("שגיאה בהתחלת המשחק:", error);
        alert("שגיאה בהתחלת המשחק.");
      }
    });
  }
}

setupHostControls();

function initRoom() {
  const roomRef = doc(db, "rooms", roomCode);

  onSnapshot(roomRef, async (docSnap) => {
    if (!docSnap.exists()) {
      alert("החדר אינו קיים עוד.");
      window.location.href = "lobby.html";
      return;
    }

    roomDataCache = docSnap.data();
    if (currentUser && roomDataCache.isSelfFill === "predefined") {
      const playerData = roomDataCache.players?.[currentUser.uid];
      if (playerData && !playerData.board) {
        await generateAndSaveRandomBoard(
          currentUser.uid,
          roomDataCache.boardSize || 5,
        );
      }
    }

    updateUI(roomDataCache);
  });
}

async function generateAndSaveRandomBoard(uid, size) {
  try {
    const wordListDoc = await getDoc(doc(db, "wordLists", uid));
    if (!wordListDoc.exists()) return;

    const allWords = wordListDoc.data().words || [];

    const totalCells = size * size;

    const shuffled = [...allWords].sort(() => 0.5 - Math.random());
    const selectedWords = shuffled.slice(0, totalCells);

    const roomRef = doc(db, "rooms", roomCode);
    await updateDoc(roomRef, {
      [`players.${uid}.board`]: selectedWords,
    });
  } catch (error) {
    console.error("שגיאה בהגרלת הלוח האוטומטי:", error);
  }
}

function updateUI(roomData) {
  if (roomPlayersList) {
    roomPlayersList.innerHTML = "";
    const players = roomData.players || {};

    for (const [uid, playerData] of Object.entries(players)) {
      const li = document.createElement("li");
      li.textContent =
        uid === roomData.hostId
          ? `👑 ${playerData.username || "unknown"}`
          : `👤 ${playerData.username || "unknown"}`;
      li.style.padding = "5px 0";
      roomPlayersList.appendChild(li);
    }
  }

  saveBoardBtn.style.display = "block";

  if (startGameBtn) {
    if (currentUser && currentUser.uid === roomData.hostId) {
      startGameBtn.style.display = "block";
    } else {
      startGameBtn.style.display = "none";
    }
  }

  if (boardBuilderContainer) {
    const size = roomData.boardSize || 5;

    const totalCells = size * size;
    const playerData = roomData.players?.[currentUser?.uid];

    if (roomData.isSelfFill === "self-fill") {
      if (boardBuilderContainer.children.length === 0) {
        boardBuilderContainer.innerHTML = `<h3>קוד החדר: ${roomCode}</h3>`;

        const grid = document.createElement("div");
        grid.style.display = "grid";
        grid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
        grid.style.gap = "5px";
        grid.style.marginTop = "10px";

        for (let i = 0; i < totalCells; i++) {
          const input = document.createElement("input");
          input.type = "text";
          input.placeholder = `מילה ${i + 1}`;
          input.className = "bingo-input";
          input.style.padding = "8px";
          input.style.textAlign = "center";

          if (playerData && playerData.board) {
            input.value = playerData.board[i] || "";
          }

          grid.appendChild(input);
        }
        boardBuilderContainer.appendChild(grid);
      }
    } else {
      boardBuilderContainer.innerHTML = `<h3>קוד החדר: ${roomCode}</h3><h3>הלוח שלך הוגרל מרשימת המילים שלך (${size}x${size}):</h3>`;
      saveBoardBtn.style.display = "none";

      const grid = document.createElement("div");
      grid.style.display = "grid";
      grid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
      grid.style.gap = "5px";
      grid.style.marginTop = "10px";
      grid.style.marginBottom = "10px";

      if (playerData && playerData.board) {
        playerData.board.forEach((word) => {
          const cell = document.createElement("div");
          cell.textContent = word;
          cell.style.padding = "10px";
          cell.style.border = "1px solid #ccc";
          cell.style.textAlign = "center";
          cell.style.borderRadius = "20px";
          cell.style.backgroundColor = "#f9f9f9";
          grid.appendChild(cell);
        });
        boardBuilderContainer.appendChild(grid);
      }
    }
  }

  if (roomData.status === "playing") {
    window.location.href = "game.html";
  }
}
