export class HomeUI {
  constructor() {
    this.createRoomBtn = document.getElementById('nav-create-room-btn');
    this.joinRoomBtn = document.getElementById('nav-join-room-btn');
    this.wordlistsBtn = document.getElementById('nav-wordlists-btn');

    this.onNavigateCallback = null;
  }

  init(options = {}) {
    if (typeof options.onNavigate === 'function') {
      this.onNavigateCallback = options.onNavigate;
    }

    this.bindEvents();
  }

  bindEvents() {
    if (this.createRoomBtn) {
      this.createRoomBtn.addEventListener('click', () => {
        this.navigate('room-waiting-screen');
      });
    }

    if (this.joinRoomBtn) {
      this.joinRoomBtn.addEventListener('click', () => {
        this.navigate('room-waiting-screen');
      });
    }

    if (this.wordlistsBtn) {
      this.wordlistsBtn.addEventListener('click', () => {
        this.navigate('wordlists-screen');
      });
    }
  }

  navigate(screenId) {
    if (typeof this.onNavigateCallback === 'function') {
      this.onNavigateCallback(screenId);
    }
  }
}