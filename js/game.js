import { auth, db } from "./firebaseConfig.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const roomCode = localStorage.getItem("roomCode");
let currentUser = null;
let roomDataCache = null;
let timerInterval = null;

const timerElement = document.getElementById("timer");
const blockAlert = document.getElementById("block-alert");
const gameBoard = document.getElementById("game-board");
const openBlockModalBtn = document.getElementById("open-block-modal-btn");
const blockModal = document.getElementById("block-modal");
const closeModalBtn = document.getElementById("close-modal-btn");
const modalPlayersList = document.getElementById("modal-players-list");
const modalWordsList = document.getElementById("modal-words-list");

function checkAuthState() {
  if (!roomCode) {
    window.location.href = "lobby.html";
    return;
  }
  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUser = user;
      initGame();
      startTimer();
    } else {
      window.location.href = "index.html";
    }
  });
}

checkAuthState();

function initGame() {
  const roomRef = doc(db, "rooms", roomCode);

  onSnapshot(roomRef, (docSnap) => {
    if (!docSnap.exists()) {
      alert("החדר אינו קיים עוד.");
      window.location.href = "lobby.html";
      return;
    }

    roomDataCache = docSnap.data();

    if (roomDataCache.winner) {
      if (timerInterval) clearInterval(timerInterval);
      showWinnerNotification(roomDataCache.winnerName);
      return;
    }

    updateGameUI();
  });
}

function showWinnerNotification(winnerName) {
  if (gameBoard) {
    gameBoard.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: #48bb78; color: white; border-radius: 12px; font-size: 24px; font-weight: bold;">
        🎉 המשחק הסתיים! המנצח הוא: ${winnerName} 🎉
      </div>
    `;
  }
  if (openBlockModalBtn) openBlockModalBtn.style.display = "none";
  
  setTimeout(() => {
    window.location.href = "lobby.html";
  }, 4000);
}

function startTimer() {
  let seconds = 0;
  timerInterval = setInterval(() => {
    seconds++;
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    if (timerElement) {
      timerElement.textContent = `${mins}:${secs}`;
    }
  }, 1000);
}

function updateGameUI() {
  if (!roomDataCache || !currentUser || roomDataCache.winner) return;

  const playerData = roomDataCache.players?.[currentUser.uid] || {};
  const board = playerData.board || [];
  const blockedWords = playerData.blockedWords || [];
  const clickedIndices = playerData.clickedIndices || [];
  const hasBlocked = playerData.hasBlocked || false;
  const size = roomDataCache.boardSize || 5;
  const totalCells = size * size;

  if (openBlockModalBtn) {
    if (hasBlocked) {
      openBlockModalBtn.style.display = "none";
    } else {
      openBlockModalBtn.style.display = "block";
    }
  }

  const hasActiveBlock = blockedWords.some((word) => {
    const wordIndex = board.indexOf(word);
    return wordIndex !== -1 && !clickedIndices.includes(wordIndex);
  });

  if (blockAlert) {
    if (hasActiveBlock) {
      blockAlert.textContent = "🚫 יש לך מילים חסומות! עליך ללחוץ עליהן תחילה כדי לשחרר אותן.";
    } else {
      blockAlert.textContent = "";
    }
  }

  if (gameBoard) {
    gameBoard.innerHTML = "";
    gameBoard.style.display = "grid";
    gameBoard.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    gameBoard.style.gap = "8px";

    board.forEach((word, index) => {
      const cell = document.createElement("button");
      cell.className = "bingo-cell";
      cell.style.padding = "15px";
      cell.style.fontSize = "16px";
      cell.style.cursor = "pointer";
      cell.style.borderRadius = "8px";
      cell.style.border = "1px solid #ccc";
      cell.style.minHeight = "60px";

      const isBlocked = blockedWords.includes(word);
      const isClicked = clickedIndices.includes(index);

      if (isClicked) {
        cell.style.backgroundColor = "#48bb78";
        cell.style.color = "white";
        cell.textContent = word;
      } else if (isBlocked) {
        cell.style.backgroundColor = "#ffffffff";
        cell.style.color = "white";
        cell.textContent = `🚫 ${word}`;
      } else if (hasActiveBlock) {
        cell.style.backgroundColor = "#fed7d7";
        cell.style.color = "#000";
        cell.style.cursor = "not-allowed";
        cell.textContent = word;
      } else {
        cell.style.backgroundColor = "#fff";
        cell.style.color = "#000";
        cell.textContent = word;
      }

      cell.addEventListener("click", async () => {
        const currentPlayerData = roomDataCache.players?.[currentUser.uid] || {};
        const currentBlockedWords = currentPlayerData.blockedWords || [];
        const currentClickedIndices = currentPlayerData.clickedIndices || [];

        if (currentBlockedWords.includes(word)) {
          const updatedBlocked = currentBlockedWords.filter((w) => w !== word);
          const updatedClicked = [...currentClickedIndices, index];
          
          try {
            const roomRef = doc(db, "rooms", roomCode);
            await updateDoc(roomRef, {
              [`players.${currentUser.uid}.blockedWords`]: updatedBlocked,
              [`players.${currentUser.uid}.clickedIndices`]: updatedClicked,
            });

            if (updatedClicked.length === totalCells) {
              declareWinner();
            }
          } catch (error) {
            console.error("שגיאה בשחרור וסימון הכרטיסייה:", error);
          }
          return;
        }

        const currentHasActiveBlock = currentBlockedWords.some((w) => {
          const idx = board.indexOf(w);
          return idx !== -1 && !currentClickedIndices.includes(idx);
        });

        if (currentHasActiveBlock) return;

        const isCurrentlyClicked = currentClickedIndices.includes(index);
        let updatedClicked = [...currentClickedIndices];

        if (isCurrentlyClicked) {
          updatedClicked = updatedClicked.filter((i) => i !== index);
        } else {
          updatedClicked.push(index);
        }

        try {
          const roomRef = doc(db, "rooms", roomCode);
          await updateDoc(roomRef, {
            [`players.${currentUser.uid}.clickedIndices`]: updatedClicked,
          });

          if (updatedClicked.length === totalCells) {
            declareWinner();
          }
        } catch (error) {
          console.error("שגיאה בעדכון הסימון:", error);
        }
      });

      gameBoard.appendChild(cell);
    });
  }
}

async function declareWinner() {
  try {
    const roomRef = doc(db, "rooms", roomCode);
    const playerData = roomDataCache.players?.[currentUser.uid];
    await updateDoc(roomRef, {
      winner: currentUser.uid,
      winnerName: playerData?.username || "שחקן",
    });
  } catch (error) {
    console.error("שגיאה בהכרזה על מנצח:", error);
  }
}

if (openBlockModalBtn) {
  openBlockModalBtn.addEventListener("click", () => {
    const playerData = roomDataCache.players?.[currentUser.uid] || {};
    if (playerData.hasBlocked) {
    //   alert("כבר השתמשת בחסימה שלך למשחק זה!");
      return;
    }
    if (blockModal) {
      blockModal.style.display = "flex";
      
      if (playerData.chosenTargetUid) {
        if (modalPlayersList) modalPlayersList.innerHTML = "";
        renderPlayerWordsToBlock(playerData.chosenTargetUid, roomDataCache.players[playerData.chosenTargetUid]);
      } else {
        renderModalPlayers();
      }
    }
  });
}

if (closeModalBtn) {
  closeModalBtn.addEventListener("click", () => {
    if (blockModal) blockModal.style.display = "none";
    if (modalWordsList) modalWordsList.innerHTML = "";
    if (modalPlayersList) modalPlayersList.innerHTML = "";
  });
}

function renderModalPlayers() {
  if (!modalPlayersList) return;
  modalPlayersList.innerHTML = "<h4>בחר שחקן לחסימה:</h4>";
  const players = roomDataCache.players || {};

  for (const [uid, playerData] of Object.entries(players)) {
    if (uid === currentUser.uid) continue;

    const btn = document.createElement("button");
    btn.textContent = playerData.username || "שחקן";
    btn.className = "secondary";
    btn.style.margin = "5px";
    btn.style.display = "block";
    btn.style.width = "100%";
    btn.style.padding = "8px";
    
    btn.addEventListener("click", async () => {
      try {
        const roomRef = doc(db, "rooms", roomCode);
        await updateDoc(roomRef, {
          [`players.${currentUser.uid}.chosenTargetUid`]: uid,
        });
        
        roomDataCache.players[currentUser.uid].chosenTargetUid = uid;
        if (modalPlayersList) modalPlayersList.innerHTML = "";
        renderPlayerWordsToBlock(uid, playerData);
      } catch (error) {
        console.error("שגיאה בשמירת השחקן הנבחר:", error);
      }
    });

    modalPlayersList.appendChild(btn);
  }
}

function renderPlayerWordsToBlock(targetUid, playerData) {
  if (!modalWordsList) return;
  modalWordsList.innerHTML = `<h4>בחר מילה לחסימה עבור ${playerData?.username || "היריב"}:</h4>`;

  const board = playerData?.board || [];
  const blockedWords = playerData?.blockedWords || [];
  const clickedIndices = playerData?.clickedIndices || [];

  board.forEach((word, index) => {
    const isAlreadyClicked = clickedIndices.includes(index);
    const isAlreadyBlocked = blockedWords.includes(word);

    if (!isAlreadyBlocked && !isAlreadyClicked) {
      const wordBtn = document.createElement("button");
      wordBtn.textContent = word;
      wordBtn.style.margin = "3px";
      wordBtn.style.display = "block";
      wordBtn.style.width = "100%";
      wordBtn.style.padding = "8px";
      wordBtn.addEventListener("click", async () => {
        await blockWordForPlayer(targetUid, word);
      });
      modalWordsList.appendChild(wordBtn);
    }
  });
}

async function blockWordForPlayer(targetUid, word) {
  try {
    const targetPlayer = roomDataCache.players[targetUid];
    const currentBlocked = targetPlayer.blockedWords || [];

    if (currentBlocked.includes(word)) {
    //   alert("המילה כבר חסומה!");
      return;
    }

    const updatedBlocked = [...currentBlocked, word];
    const roomRef = doc(db, "rooms", roomCode);
    
    await updateDoc(roomRef, {
      [`players.${targetUid}.blockedWords`]: updatedBlocked,
      [`players.${currentUser.uid}.hasBlocked`]: true,
    });

    // alert(`המילה "${word}" נחסמה בהצלחה!`);
    if (blockModal) blockModal.style.display = "none";
    if (modalWordsList) modalWordsList.innerHTML = "";
    if (modalPlayersList) modalPlayersList.innerHTML = "";
  } catch (error) {
    console.error("שגיאה בחסימת מילה:", error);
    alert("שגיאה בחסימת המילה.");
  }
}