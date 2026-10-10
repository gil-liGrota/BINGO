// app.js - המתאם הראשי וה-Router של האפליקציה

// 1. יבוא ה-Services
import { AuthService } from './services/auth.service.js';

// 2. יבוא מחלקות ה-UI Controller
import { AuthUI } from './ui/authUI.js';
import { HomeUI } from './ui/homeUI.js';
import { RoomUI } from './ui/roomUI.js';
import { WordListUI } from './ui/wordlistUI.js';
import { GameUI } from './ui/gameUI.js';
import { BoardSetupUI } from './ui/boardSetupUI.js';
import { EndUI } from './ui/endUI.js';

// ==========================================
// global state variables
// ==========================================
let currentUser = null;       // שמירת ה-State של המשתמש המחובר כרגע
let currentRoomCode = null;   // שמירת מזהה החדר הפעיל

// ==========================================
// ui controllers instances
// ==========================================
const authUI = new AuthUI();
const homeUI = new HomeUI();
const roomUI = new RoomUI();
const wordlistUI = new WordListUI();
const gameUI = new GameUI();
const boardSetupUI = new BoardSetupUI();
const endUI = new EndUI();

// ==========================================
// router & navigation helper
// ==========================================
export function navigateTo(screenId) {
  const screens = document.querySelectorAll('.view-screen');
  screens.forEach(screen => screen.classList.remove('active'));

  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.classList.add('active');
  }
}

// ==========================================
// application initialization
// ==========================================
async function initApp() {
  // 1. רישום ה-Service Worker עבור PWA
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('./sw.js');
      console.log('Service Worker נרשם בהצלחה');
    } catch (error) {
      console.error('כישלון ברישום Service Worker:', error);
    }
  }

  // 2. האזנה לשינוי מצב התחברות ב-Firebase Auth
  AuthService.onAuthChange((user) => {
    currentUser = user;

    if (currentUser) {
      // עדכון ה-UI של הסטטוס עליון במידת הצורך
      const userStatusBar = document.getElementById('user-status-bar');
      const usernameDisplay = document.getElementById('display-username');
      if (userStatusBar && usernameDisplay) {
        usernameDisplay.textContent = currentUser.username || currentUser.email;
        userStatusBar.classList.remove('hidden');
      }

      // אתחול רכיבי ה-UI הדורשים את המשתמש
      homeUI.init({
        onNavigate: (screenId) => navigateTo(screenId)
      });
      wordlistUI.init(currentUser);
      roomUI.init(currentUser, (roomCode, wordList) => {
        currentRoomCode = roomCode;
        handleStartBoardSetup(wordList);
      });

      // מעבר לתפריט הראשי
      navigateTo('lobby-screen');
    } else {
      // אם המשתמש מנותק – הסתרת סרגל המשתמש ומעבר למסך התחברות
      const userStatusBar = document.getElementById('user-status-bar');
      if (userStatusBar) userStatusBar.classList.add('hidden');

      authUI.init((loggedInUser) => {
        currentUser = loggedInUser;
        navigateTo('lobby-screen');
      });

      navigateTo('auth-screen');
    }
  });

  // 3. הגדרת כפתור התנתקות בסרגל העליון
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await AuthService.logout();
    });
  }
}

// ==========================================
// workflow transition handlers
// ==========================================

// מעבר לשלב הכנת הלוח (אדם ב')
function handleStartBoardSetup(wordList) {
  navigateTo('board-setup-screen');
  boardSetupUI.setupBoard(wordList, (myBoard) => {
    handleStartGame(myBoard);
  });
}

// מעבר למסך המשחק הפעיל (אדם א')
function handleStartGame(myBoard) {
  navigateTo('game-screen');
  gameUI.startGameSession(currentRoomCode, currentUser, myBoard, (results) => {
    handleGameOver(results);
  });
}

// מעבר למסך התוצאות והסיום (אדם ב')
function handleGameOver(results) {
  navigateTo('results-screen');
  endUI.renderResults(results, () => {
    currentRoomCode = null;
    navigateTo('lobby-screen');
  });
}

// הפעלת האפליקציה בטעינת הקובץ
document.addEventListener('DOMContentLoaded', initApp);