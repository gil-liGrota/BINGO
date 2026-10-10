import { GameService } from '../services/game.service.js';
import { ROOM_STATUS } from '../config/roomStatus.js';

export class GameUI {
  constructor() {
    this.boardContainer = document.getElementById('bingo-board');
    this.statusMsg = document.getElementById('game-status-message');
    this.openBlockModalBtn = document.getElementById('open-block-modal-btn');
    this.blockModal = document.getElementById('block-modal');
    this.targetPlayerSelect = document.getElementById('target-player-select');
    this.targetWordSelect = document.getElementById('target-word-select');
    this.confirmBlockBtn = document.getElementById('confirm-block-btn');
    this.closeBlockModalBtn = document.getElementById('close-block-modal-btn');

    this.currentUser = null;
    this.currentRoomCode = null;
    this.myBoard = [];
    this.unsubscribeGameListener = null;
    this.onGameOverCallback = null;
  }

  init(currentUser) {
    this.currentUser = currentUser;
    this.bindEvents();
  }

  bindEvents() {
    if (this.openBlockModalBtn) {
      this.openBlockModalBtn.onclick = () => this.openBlockModal();
    }

    if (this.closeBlockModalBtn) {
      this.closeBlockModalBtn.onclick = () => this.closeBlockModal();
    }

    if (this.confirmBlockBtn) {
      this.confirmBlockBtn.onclick = () => this.handleConfirmBlock();
    }
  }

  startGameSession(roomCode, currentUser, myBoard, onGameOverCallback) {
    this.currentRoomCode = roomCode;
    this.currentUser = currentUser;
    this.myBoard = myBoard || [];
    this.onGameOverCallback = onGameOverCallback;

    this.renderBoard(this.myBoard, [], { isBlocked: false });

    this.startListening();
  }

  startListening() {
    if (this.unsubscribeGameListener) {
      this.unsubscribeGameListener();
    }

    this.unsubscribeGameListener = GameService.listenToGame(this.currentRoomCode, (roomData) => {
      if (!roomData) return;

      const myPlayerData = roomData.players?.[this.currentUser.uid] || {};
      const markedIndices = myPlayerData.markedIndices || [];
      const blockedState = myPlayerData.blockedState || { isBlocked: false };

      this.renderBoard(this.myBoard, markedIndices, blockedState);

      this.populateBlockModal(roomData.players, roomData.wordList?.words || []);

      if (roomData.status === ROOM_STATUS.FINISHED) {
        if (typeof this.onGameOverCallback === 'function') {
          this.onGameOverCallback(roomData.results);
        }
      }
    });
  }

  renderBoard(boardArray, markedIndices, blockedState) {
    if (!this.boardContainer) return;
    this.boardContainer.innerHTML = '';

    if (this.statusMsg) {
      if (blockedState.isBlocked) {
        this.statusMsg.textContent = '🔒 התקבלת חסימה! לא ניתן לסמן משבצות כרגע.';
        this.statusMsg.style.borderColor = 'var(--danger)';
      } else {
        this.statusMsg.textContent = 'המשחק בעיצומו! סמן משבצות כדי להשלים רצף.';
        this.statusMsg.style.borderColor = 'var(--primary)';
      }
    }

    boardArray.forEach((word, index) => {
      const cell = document.createElement('div');
      cell.className = 'bingo-cell';
      cell.textContent = word;

      const isMarked = markedIndices.includes(index);
      if (isMarked) {
        cell.classList.add('marked');
      }

      if (blockedState.isBlocked) {
        cell.classList.add('blocked');
      }

      cell.onclick = () => {
        if (blockedState.isBlocked) {
          alert('אתה חסום כרגע ולא יכול לסמן משבצות!');
          return;
        }
        if (!isMarked) {
          this.handleCellClick(index);
        }
      };

      this.boardContainer.appendChild(cell);
    });
  }

  async handleCellClick(index) {
    try {
      await GameService.markCell(this.currentRoomCode, this.currentUser.uid, index);
    } catch (error) {
      console.error('שגיאה בסימון משבצת:', error);
    }
  }

  openBlockModal() {
    if (this.blockModal) {
      this.blockModal.classList.remove('hidden');
    }
  }

  closeBlockModal() {
    if (this.blockModal) {
      this.blockModal.classList.add('hidden');
    }
  }

  populateBlockModal(players, words) {
    if (!this.targetPlayerSelect || !this.targetWordSelect) return;

    this.targetPlayerSelect.innerHTML = '';
    if (players) {
      Object.entries(players).forEach(([uid, player]) => {
        if (uid !== this.currentUser.uid) {
          const option = document.createElement('option');
          option.value = uid;
          option.textContent = player.username || 'שחקן';
          this.targetPlayerSelect.appendChild(option);
        }
      });
    }

    this.targetWordSelect.innerHTML = '';
    if (words) {
      words.forEach((word) => {
        const option = document.createElement('option');
        option.value = word;
        option.textContent = word;
        this.targetWordSelect.appendChild(option);
      });
    }
  }

  async handleConfirmBlock() {
    const targetUid = this.targetPlayerSelect.value;
    const word = this.targetWordSelect.value;

    if (!targetUid || !word) {
      alert('נא לבחור שחקן ומילה לחסימה!');
      return;
    }

    try {
      await GameService.executeBlock(this.currentRoomCode, this.currentUser.uid, targetUid, word);
      this.closeBlockModal();
      alert('החסימה נשלחה בהצלחה!');
    } catch (error) {
      console.error('שגיאה בביצוע חסימה:', error);
      alert('כישלון בביצוע החסימה.');
    }
  }

  cleanup() {
    if (this.unsubscribeGameListener) {
      this.unsubscribeGameListener();
      this.unsubscribeGameListener = null;
    }
  }
}