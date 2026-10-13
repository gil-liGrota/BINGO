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
const leaveGameBtn = document.getElementById("leave-game-btn");

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

  onSnapshot(roomRef, async (docSnap) => {
    if (!docSnap.exists()) {
      window.location.href = "lobby.html";
      return;
    }

    roomDataCache = docSnap.data();
    const players = roomDataCache.players || {};

    const hostId = roomDataCache.hostId;
    if (hostId && roomDataCache.status === "playing" && !players[hostId]) {
      if (timerInterval) clearInterval(timerInterval);
      showGameOverScreen("המארח עזב את המשחק. החדר נסגר.");
      await removeSelfAndExitSilently();
      return;
    }

    if (roomDataCache.status === "game over" && roomDataCache.winner) {
      if (timerInterval) clearInterval(timerInterval);
      showWinnerNotification(roomDataCache.winnerName);
      return;
    }

    updateGameUI();
  });
}

async function removeSelfAndExitSilently() {
  try {
    if (currentUser && roomCode) {
      const roomRef = doc(db, "rooms", roomCode);
      const docSnap = await getDoc(roomRef);
      if (docSnap.exists()) {
        const currentPlayers = docSnap.data().players || {};
        delete currentPlayers[currentUser.uid];

        const updateData = { players: currentPlayers };
        if (Object.keys(currentPlayers).length === 0) {
          updateData.status = "game over";
        }

        await updateDoc(roomRef, updateData);
      }
    }
  } catch (error) {
    console.error("שגיאה:", error);
  }

  setTimeout(() => {
    localStorage.removeItem("roomCode");
    window.location.href = "lobby.html";
  }, 3500);
}

if (leaveGameBtn) {
  leaveGameBtn.addEventListener("click", async () => {
    try {
      const roomRef = doc(db, "rooms", roomCode);
      if (currentUser && roomDataCache && currentUser.uid === roomDataCache.hostId) {
        await updateDoc(roomRef, { status: "game over" });
      } else {
        const updatedPlayers = { ...roomDataCache.players };
        delete updatedPlayers[currentUser.uid];
        await updateDoc(roomRef, { players: updatedPlayers });
      }
      localStorage.removeItem("roomCode");
      window.location.href = "lobby.html";
    } catch (error) {
      window.location.href = "lobby.html";
    }
  });
}

function showGameOverScreen(message) {
  if (gameBoard) {
    gameBoard.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: #e53e3e; color: white; border-radius: 12px; font-size: 22px; font-weight: bold;">
        ⚠️ ${message} <br><span style="font-size: 16px; font-weight: normal;">מעביר אותך בחזרה ללובי...</span>
      </div>
    `;
  }
  if (openBlockModalBtn) openBlockModalBtn.style.display = "none";
  if (blockAlert) blockAlert.style.display = "none";

  setTimeout(() => {
    localStorage.removeItem("roomCode");
    window.location.href = "lobby.html";
  }, 3500);
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
  if (blockAlert) blockAlert.style.display = "none";

  setTimeout(() => {
    localStorage.removeItem("roomCode");
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
  if (!roomDataCache || !currentUser || roomDataCache.winner || roomDataCache.status === "game over")
    return;

  const playerData = roomDataCache.players?.[currentUser.uid] || {};
  let board = playerData.board;
  const size = roomDataCache.boardSize || 5;
  const totalCells = size * size;

  if (!board || !Array.isArray(board) || board.length === 0) {
    const savedLocalBoard = localStorage.getItem("playerBoard");
    if (savedLocalBoard) {
      try {
        board = JSON.parse(savedLocalBoard);
      } catch (e) {
        board = [];
      }
    }

    if (!board || board.length === 0) {
      board = Array.from({ length: totalCells }, (_, i) => `מילה ${i + 1}`);
    }
  }

  const blockedWords = playerData.blockedWords || [];
  const clickedIndices = playerData.clickedIndices || [];
  const hasBlocked = playerData.hasBlocked || false;

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
        cell.style.backgroundColor = "#ffffff";
        cell.style.color = "black";
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
            console.error(error);
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
          console.error(error);
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
      winnerName: playerData?.username || "unknown",
      status: "game over",
    });
  } catch (error) {
    console.error(error);
  }
}

if (openBlockModalBtn) {
  openBlockModalBtn.addEventListener("click", () => {
    const playerData = roomDataCache.players?.[currentUser.uid] || {};
    if (blockModal) {
      blockModal.style.display = "flex";

      if (playerData.chosenTargetUid) {
        if (modalPlayersList) modalPlayersList.innerHTML = "";
        renderPlayerWordsToBlock(
          playerData.chosenTargetUid,
          roomDataCache.players[playerData.chosenTargetUid],
        );
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
    btn.textContent = playerData.username || "unknown";
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
        console.error(error);
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
        await blockWordForPatientOrTarget(targetUid, word);
      });
      modalWordsList.appendChild(wordBtn);
    }
  });
}

async function blockWordForPatientOrTarget(targetUid, word) {
  try {
    const targetPlayer = roomDataCache.players[targetUid];
    const currentBlocked = targetPlayer.blockedWords || [];

    const updatedBlocked = [...currentBlocked, word];
    const roomRef = doc(db, "rooms", roomCode);

    await updateDoc(roomRef, {
      [`players.${targetUid}.blockedWords`]: updatedBlocked,
      [`players.${currentUser.uid}.hasBlocked`]: true,
    });

    if (blockModal) blockModal.style.display = "none";
    if (modalWordsList) modalWordsList.innerHTML = "";
    if (modalPlayersList) modalPlayersList.innerHTML = "";
  } catch (error) {
    console.error(error);
  }
}