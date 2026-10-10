import { db } from '../config/firebase.js';
import { ref, update, push, get, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

export class GameService {
  static async savePlayerBoard(roomCode, uid, boardArray) {
    const playerRef = ref(db, `rooms/${roomCode}/players/${uid}`);
    await update(playerRef, {
      board: boardArray,
      isBoardReady: true
    });
  }

  static async markCell(roomCode, uid, cellIndex, word, username) {
    const playerRef = ref(db, `rooms/${roomCode}/players/${uid}`);
    
    await update(ref(db, `rooms/${roomCode}/players/${uid}/markedIndices`), {
      [cellIndex]: true
    });

    await push(ref(db, `rooms/${roomCode}/notifications`), {
      message: `${username} סימן/ה את המילה: "${word}"`,
      timestamp: Date.now()
    });
  }

  static async executeBlock(roomCode, blockerUid, targetUid, wordToBlock) {
    await update(ref(db, `rooms/${roomCode}/players/${targetUid}/blockedState`), {
      isBlocked: true,
      targetWord: wordToBlock,
      blockedByUid: blockerUid
    });

    await update(ref(db, `rooms/${roomCode}/players/${blockerUid}`), {
      hasUsedBlock: true
    });
  }

  static async resolveBlock(roomCode, uid) {
    await update(ref(db, `rooms/${roomCode}/players/${uid}/blockedState`), {
      isBlocked: false,
      targetWord: null,
      blockedByUid: null
    });
  }

  static async finishPlayerGame(roomCode, uid, timeElapsedSeconds) {
    await update(ref(db, `rooms/${roomCode}/players/${uid}`), {
      isFinished: true,
      finishTime: timeElapsedSeconds
    });
  }

  static listenToGame(roomCode, callback) {
  const roomRef = ref(db, `rooms/${roomCode}`);
  return onValue(roomRef, (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });
}
}