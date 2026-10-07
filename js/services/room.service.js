import { db } from '../config/firebase.js';
import { ROOM_STATUS } from '../config/roomStatus.js';
import { ref, set, update, get, onValue, off } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

export class RoomService {
  static async createRoom(hostUser, settings) {
    const roomCode = Math.floor(1000 + Math.random() * 9000).toString();
    const roomRef = ref(db, `rooms/${roomCode}`);

    const newRoom = {
      roomCode: roomCode,
      hostId: hostUser.uid,
      gridSize: settings.gridSize,
      isFreeFill: settings.isFreeFill,
      wordListId: settings.wordListId || null,
      status: ROOM_STATUS.LOBBY,
      players: {
        [hostUser.uid]: {
          uid: hostUser.uid,
          username: hostUser.username,
          isBoardReady: false,
          hasUsedBlock: false,
          isFinished: false,
          finishTime: null,
          blockedState: { isBlocked: false, targetWord: null, blockedByUid: null }
        }
      }
    };

    await set(roomRef, newRoom);
    return roomCode;
  }

  static async joinRoom(roomCode, user) {
    const roomRef = ref(db, `rooms/${roomCode}`);
    const snapshot = await get(roomRef);

    if (!snapshot.exists()) {
      throw new Error("החדר לא קיים!");
    }

    const roomData = snapshot.val();
    if (roomData.status !== ROOM_STATUS.LOBBY) {
      throw new Error("המשחק בחדר זה כבר החל!");
    }

    const playerRef = ref(db, `rooms/${roomCode}/players/${user.uid}`);
    await set(playerRef, {
      uid: user.uid,
      username: user.username,
      isBoardReady: false,
      hasUsedBlock: false,
      isFinished: false,
      finishTime: null,
      blockedState: { isBlocked: false, targetWord: null, blockedByUid: null }
    });

    return roomData;
  }

  static async updateRoomStatus(roomCode, newStatus) {
    await update(ref(db, `rooms/${roomCode}`), { status: newStatus });
  }

  static listenToRoom(roomCode, callback) {
    const roomRef = ref(db, `rooms/${roomCode}`);
    onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val());
      }
    });
    return () => off(roomRef);
  }
}