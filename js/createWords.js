// מאפשר למשתמש להזין רשימת מילים (מותנית בכך שהכמות גדולה מ-9) ושמירתה ב-Firestore.

const wordsInput = document.getElementById('words-input');
const minWordsCount = 9;

/**
 * שומר את רשימת המילים של המשתמש.
 * טענת כניסה: userId (מחרוזת), wordsArray (מערך מחרוזות של המילים)
 * טענת יציאה: שומר את רשימת המילים במסמך של המשתמש ב-Firestore ומחזיר חיווי הצלחה.
 */
export function saveUserWords(userId, wordsArray) {
    // TODO: מימוש יוכנס בהמשך
}