// ניהול מסך המשחק הפעיל (לוח בינגו, טיימר, סימון משבצות, סאונד ומנגנון ה"בלוק").

let timerInterval = null;
let elapsedSeconds = 0;
let isBlocked = false;
let blockedWord = '';
let hasUsedBlock = false;

/**
 * מטפל בלחיצה על משבצת בלוח הבינגו.
 * טענת כניסה: cellIndex (אינדקס המשבצת בלוח), word (המילה שנלחצה)
 * טענת יציאה: מסמן ב-X אדום, בודק אם זו המילה החסומה (במידה והשחקן היה חסום), מעדכן את ה-Firestore, ובודק תנאי ניצחון.
 */
export function handleCellClick(cellIndex, word) {
    // TODO: מימוש יוכנס בהמשך
}

/**
 * חוסם שחקן אחר באמצעות בחירת מילה מהלוח שלו.
 * טענת כניסה: targetUserId (מזהה השחקן הנבחר לחסימה), chosenWord (המילה שנבחרה מתוך הלוח שלו)
 * טענת יציאה: מעדכן ב-Firestore שהמשתמש היעד חסום על ידי המילה הזו, ונועל את האפשרות להשתמש בבלוק שוב.
 */
export function blockPlayer(targetUserId, chosenWord) {
    // TODO: מימוש יוכנס בהמשך
}

/**
 * מפיק צליל התראה בדפדפן.
 * טענת כניסה: ללא
 * טענת יציאה: מייצר צליל התראה קצר באמצעות Web Audio API בדפדפן.
 */
export function playBingoSound() {
    // TODO: מימוש יוכנס בהמשך
}