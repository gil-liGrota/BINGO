// ניהול מסך טרום-המשחק (מילוי לוח אישי, בדיקת מוכנות המשתתפים, ותחילת משחק על ידי המנהל).

let playerBoard = [];
let isAllBoardsReady = false;

/**
 * שומר את הלוח שמילא השחקן.
 * טענת כניסה: roomId (מחרוזת), userId (מחרוזת), boardData (מערך/אובייקט הלוח)
 * טענת יציאה: שומר את הלוח כמוצפן/מוסתר בתוך נתוני השחקן בחדר ב-Firestore ומעדכן סטטוס "מוכן".
 */
export function savePlayerBoard(roomId, userId, boardData) {
    // TODO: מימוש יוכנס בהמשך
}

/**
 * מתחיל את המשחק בפועל.
 * טענת כניסה: roomId (מחרוזת), hostId (מחרוזת)
 * טענת יציאה: בודק שכל השחקנים בחדר סיימו למלא את הלוח, מעדכן את סטטוס החדר ל-"playing" ומעביר את כולם למסך המשחק (game.html).
 */
export function startGame(roomId, hostId) {
    // TODO: מימוש יוכנס בהמשך
}