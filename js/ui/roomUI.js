import { RoomService } from '../services/room.service.js';
import { ROOM_STATUS } from '../config/roomStatus.js';

export class RoomUI {
  constructor() {
    this.roomCodeDisplay = document.getElementById('roomCodeDisplay');
    this.playersListUl = document.getElementById('playersList');
    this.btnStartGame = document.getElementById('btnStartGame');
    this.btnLeaveRoom = document.getElementById('btnLeaveRoom');
    this.statusMsg = document.getElementById('roomStatusMsg');

    this.currentRoomCode = null;
    this.currentUser = null;
    this.unsubscribeRoomListener = null;

    this.onBoardSetupCallback = null;
    this.onLeaveCallback = null;
  }

  init(options = {}) {
    if (typeof options.onBoardSetup === 'function') {
      this.onBoardSetupCallback = options.onBoardSetup;
    }
    if (typeof options.onLeave === 'function') {
      this.onLeaveCallback = options.onLeave;
    }

    this.bindEvents();
  }

  bindEvents() {
    if (this.btnStartGame) {
      this.btnStartGame.onclick = () => this.handleStartGame();
    }

    if (this.btnLeaveRoom) {
      this.btnLeaveRoom.onclick = () => this.handleLeaveRoom();
    }
  }

  setCurrentUser(user) {
    this.currentUser = user;
  }

  enterRoom(roomCode) {
    this.currentRoomCode = roomCode;

    if (this.roomCodeDisplay) {
      this.roomCodeDisplay.textContent = roomCode;
    }

    this.cleanup();

    this.unsubscribeRoomListener = RoomService.listenToRoom(roomCode, (roomData) => {
      if (!roomData) return;

      this.renderPlayersList(roomData.players);

      this.updateHostControls(roomData.hostId);

      if (roomData.status === ROOM_STATUS.SETUP || roomData.status === ROOM_STATUS.PLAYING) {
        if (typeof this.onBoardSetupCallback === 'function') {
          this.onBoardSetupCallback(roomCode, roomData.wordList || null, roomData.gridSize || 5);
        }
      }
    });
  }

  renderPlayersList(players) {
    if (!this.playersListUl) return;
    this.playersListUl.innerHTML = '';

    if (!players) return;

    Object.values(players).forEach((player) => {
      const li = document.createElement('li');
      li.style.cssText = 'padding: 0.5rem 0; border-bottom: 1px solid #333; display: flex; justify-content: space-between; align-items: center;';
      
      const isReadyText = player.isBoardReady ? 'מוכן' : 'ממתין';
      const badgeClass = player.isBoardReady ? 'badge-ready' : 'badge-waiting';

      li.innerHTML = `
        <span>${player.username || 'שחקן'}</span>
        <span class="badge ${badgeClass}">${isReadyText}</span>
      `;
      this.playersListUl.appendChild(li);
    });
  }

  updateHostControls(hostId) {
    if (!this.btnStartGame) return;

    const isHost = this.currentUser && this.currentUser.uid === hostId;
    this.btnStartGame.style.display = isHost ? 'block' : 'none';
  }

  async handleStartGame() {
    if (!this.currentRoomCode) return;

    try {
      await RoomService.updateRoomStatus(this.currentRoomCode, ROOM_STATUS.SETUP);
    } catch (error) {
      console.error('שגיאה בהתחלת המשחק:', error);
      alert('נכשל בעדכון סטטוס החדר למשחק.');
    }
  }

  handleLeaveRoom() {
    this.cleanup();
    if (typeof this.onLeaveCallback === 'function') {
      this.onLeaveCallback();
    }
  }

  cleanup() {
    if (this.unsubscribeRoomListener) {
      this.unsubscribeRoomListener();
      this.unsubscribeRoomListener = null;
    }
  }
}